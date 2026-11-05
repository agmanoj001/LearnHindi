import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateContent, GRAMMAR_KINDS } from '../js/validate.js';
import { pictureExists } from '../js/art.js';
import { MASCOT_IDS, mascotSvg } from '../js/mascot.js';
import { THEMES, sceneSvg } from '../js/art-scenes.js';
import { markParts, unmark, tapTokens, itemKey, makeRng } from '../js/logic.js';
import { pickQuestions } from '../js/games/grammar.js';
import * as C from '../js/curriculum.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const topics = Object.entries(content.grammar).map(([id, t]) => ({ id, ...t }));
const byLevel = (level) => topics.filter((t) => t.level === level);
const WORLDS = [
  ['vyakaran7', 'grade7'],
  ['vyakaran8', 'grade8'],
];

test('twelve grammar topics for each of Grade 7 and Grade 8, each with rule cards and practice', () => {
  for (const level of ['grade7', 'grade8']) {
    const list = byLevel(level);
    assert.ok(list.length >= 12, `${level}: ${list.length} topics`);
    for (const t of list) {
      assert.ok(t.learn.length >= 2 && t.learn.length <= 4, `${t.id}: ${t.learn.length} cards`);
      assert.ok(t.practice.length >= 8, `${t.id}: ${t.practice.length} questions`);
    }
    // all three kinds of question appear in each grade
    const kinds = new Set(list.flatMap((t) => t.practice.map((q) => q.kind)));
    assert.deepEqual([...kinds].sort(), [...GRAMMAR_KINDS].sort(), level);
  }
});

test('the topics cover the CBSE Grade 7 and 8 grammar syllabus taught with NCERT मल्हार', () => {
  const titles = (level) => byLevel(level).map((t) => t.title.hi).join(' | ');
  for (const word of ['संज्ञा', 'सर्वनाम', 'विशेषण', 'क्रिया', 'काल', 'कारक', 'अव्यय', 'वाक्य', 'विराम', 'उपसर्ग', 'प्रत्यय', 'संधि', 'समास', 'शब्द-भंडार', 'शुद्ध'])
    assert.ok(titles('grade7').includes(word), `Grade 7 teaches ${word}`);
  for (const word of ['तत्सम' /* in the card */, 'उपसर्ग', 'प्रत्यय', 'संधि', 'समास', 'क्रिया', 'काल', 'वाच्य', 'रचना', 'अर्थ', 'अलंकार', 'मुहावरे', 'लोकोक्ति', 'अशुद्धि'])
    assert.ok(titles('grade8').includes(word) || byLevel('grade8').some((t) => JSON.stringify(t.learn).includes(word)), `Grade 8 teaches ${word}`);
});

test('grammar passes every content check', () => {
  const { errors, warnings } = validateContent(content, { pictureExists, mascots: MASCOT_IDS, themes: THEMES });
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings.filter((w) => /grammar|vyakaran/.test(w)), []);
});

test('the content checks catch mistakes in a grammar topic', () => {
  const bad = structuredClone(content);
  const t = bad.grammar['g7-sangya'];
  const tap = t.practice.find((q) => q.kind === 'tap');
  tap.answer = 'नहीं-है';
  const mcq = t.practice.find((q) => q.kind === 'mcq');
  mcq.answer = 'something else';
  const sort = t.practice.find((q) => q.kind === 'sort');
  sort.items[0].bin = 'कहीं नहीं';
  t.learn[0].text = 'एक [अधूरा निशान';
  t.practice.push({ kind: 'drag', q: 'खींचो', why: '[क्यों]' });
  bad.grammar['g8-kaal'].learn[0].table.rows[0].pop();
  bad.worlds.find((w) => w.id === 'vyakaran7').units[0].lessons[0].config.topic = 'no-such-topic';
  bad.worlds.find((w) => w.id === 'vyakaran8').units[0].lessons[0].config = { topics: ['g7-sangya'] };
  const { errors, warnings } = validateContent(bad, { pictureExists });
  const text = errors.join('\n');
  for (const re of [/is not a word in/, /answer must be one of its options/, /"bin" that is one of its groups/, /unbalanced \[ \]/, /kind must be one of mcq, tap, sort/, /cells, the table has/, /"no-such-topic" is not a grammar topic/]) assert.match(text, re);
  assert.ok(warnings.some((w) => /topic "g7-sangya" is for grade7, the world is grade8/.test(w)));
});

test('a tap answer is one word, once, in its sentence; options never repeat', () => {
  for (const t of topics)
    for (const q of t.practice) {
      if (q.kind === 'tap') assert.equal(tapTokens(q.s).filter((w) => w.core === q.answer).length, 1, `${t.id}: "${q.answer}" in "${q.s}"`);
      if (q.kind === 'mcq') assert.equal(new Set(q.options).size, q.options.length, `${t.id}: ${q.q}`);
      if (q.kind === 'sort') for (const b of q.bins) assert.ok(q.items.some((x) => x.bin === b), `${t.id}: nothing in ${b}`);
      // the "क्यों?" box always highlights the key idea
      assert.match(q.why, /\[[^\]]+\]/, `${t.id}: ${q.why}`);
    }
});

test('marks, plain text and tappable words', () => {
  assert.deepEqual(markParts('[मीरा] दिल्ली में [रहती] है।'), [{ mark: 'मीरा' }, ' दिल्ली में ', { mark: 'रहती' }, ' है।']);
  assert.equal(unmark('[मीरा] दिल्ली में रहती है।'), 'मीरा दिल्ली में रहती है।');
  assert.deepEqual(
    tapTokens('वाह! “कितना” सुंदर, (सच) है।').map((w) => w.core),
    ['वाह', 'कितना', 'सुंदर', 'सच', 'है'],
  );
  assert.deepEqual(tapTokens('धीरे-धीरे चलो।').map((w) => w.text), ['धीरे-धीरे', 'चलो।']);
  assert.equal(itemKey({ grammar: 'g7-sangya' }), 'g:g7-sangya');
});

test('a review asks about every topic in its unit, in turn', () => {
  const unit = ['g7-karak', 'g7-avyay', 'g7-vakya'].map((id) => ({ id, ...content.grammar[id] }));
  const qs = pickQuestions(unit, 10, makeRng(7));
  assert.equal(qs.length, 10);
  assert.deepEqual(qs.slice(0, 3).map((q) => q.topicId), ['g7-karak', 'g7-avyay', 'g7-vakya']);
  for (const q of qs) assert.ok(q.topicTitle.hi);
  // never more questions than there are
  assert.equal(pickQuestions([unit[0]], 99, makeRng(1)).length, unit[0].practice.length);
});

test('one grammar world per grade: a lesson for every topic and a mixed review for every unit', () => {
  for (const [id, level] of WORLDS) {
    const w = content.worlds.find((x) => x.id === id);
    assert.equal(w.level, level);
    assert.ok(w.tags.includes('grammar'));
    const lessons = C.worldLessons(w);
    assert.ok(lessons.every((l) => l.game === 'grammar'));
    const taught = lessons.filter((l) => l.config.topic).map((l) => l.config.topic);
    assert.deepEqual(taught.sort(), byLevel(level).map((t) => t.id).sort(), `${id} teaches each topic once`);
    for (const u of w.units) {
      const review = u.lessons.find((l) => l.config.topics);
      assert.ok(review, `${u.id} has a review`);
      assert.deepEqual(review.config.topics, u.lessons.filter((l) => l.config.topic).map((l) => l.config.topic));
    }
    assert.ok(content.collections[w.collection].items.length >= 8);
  }
});

test('the new guides and scenes draw', () => {
  for (const id of ['gyanu', 'chatur']) {
    assert.ok(MASCOT_IDS.includes(id));
    assert.match(mascotSvg(id), /^<svg[\s\S]*m-eye[\s\S]*m-mouth-open/);
  }
  for (const theme of ['library', 'lab']) {
    assert.ok(THEMES.includes(theme));
    assert.ok(sceneSvg(theme).length > 2000, theme);
  }
});
