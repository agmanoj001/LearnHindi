import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateContent } from '../js/validate.js';
import { pictureExists } from '../js/art.js';
import { MASCOT_IDS } from '../js/mascot.js';
import { THEMES } from '../js/art-scenes.js';
import { CAST, CAST_IDS, FACES, ARMS, BACKGROUND_IDS, castSvg, comicBg } from '../js/art-comic.js';
import { lookOf, glossSplit, SERIES } from '../js/games/comic.js';
import * as C from '../js/curriculum.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const DEVANAGARI = /[ऀ-ॿ]/;
const comics = content.comics;
const textOf = (cm) => cm.panels.flatMap((p) => [p.cap || '', ...(p.say || []).map((b) => b.text)]).join(' ');

// three series a grade: ten short comics each to start, and then the longer ones
const GRADE_SERIES = { grade7: ['mishti', 'birbal', 'chippu'], grade8: ['dadi', 'betal', 'murari'] };
// series whose comics stop for the reader's answer before the reveal
const GUESS_SERIES = ['dadi', 'birbal', 'chippu', 'betal', 'murari'];
// the world for each series
const SERIES_WORLD = { mishti: 'mishti', dadi: 'jasoos', birbal: 'birbal', chippu: 'chippu', betal: 'betal', murari: 'murari' };

test('fifty comics for each of Grade 7 and Grade 8, in three series of sixteen or more', () => {
  for (const [level, series] of Object.entries(GRADE_SERIES)) {
    const list = comics.filter((c) => c.level === level);
    assert.ok(list.length >= 50, `${level}: ${list.length}`);
    assert.deepEqual([...new Set(list.map((c) => c.series))].sort(), [...series].sort(), level);
    for (const s of series) assert.ok(list.filter((c) => c.series === s).length >= 16, `${s}: sixteen comics`);
  }
  assert.equal(new Set(comics.map((c) => c.id)).size, comics.length, 'comic ids are unique');
  assert.deepEqual(Object.keys(SERIES).sort(), Object.values(GRADE_SERIES).flat().sort());
  for (const s of GUESS_SERIES) assert.ok(SERIES[s].guess?.badge && SERIES[s].guess.right, `${s} has words for its guess card`);
});

test('comics pass every content check, with guides and scenes checked too', () => {
  const { errors } = validateContent(content, { pictureExists, mascots: MASCOT_IDS, themes: THEMES });
  assert.deepEqual(errors, []);
});

test('the content checks catch mistakes in a comic', () => {
  const bad = structuredClone(content);
  const cm = bad.comics[0];
  cm.panels[0].cast.push({ who: 'nobody', at: 50 }, { who: 'mishti', at: 120, face: 'furious' });
  cm.panels[1].say.push({ who: 'ghost', text: 'बू!' });
  cm.panels[2].bg = 'moon';
  cm.questions[0].answer = 'something else';
  bad.comics[10].guess.at = 99;
  bad.worlds.find((w) => w.id === 'mishti').units[0].lessons[0].config.comic = 'no-such-comic';
  const text = validateContent(bad, { pictureExists }).errors.join('\n');
  for (const re of [/"nobody" is not in the cast/, /position "at" from 0 to 100/, /face "furious"/, /speaker "ghost"/, /bg "moon"/, /answer must be one of its options/, /guess.at/, /"no-such-comic" is not a comic id/]) assert.match(text, re);
});

test('a comic reads like a comic: 10–20 panels, Hindi text, nothing too long for a bubble', () => {
  for (const cm of comics) {
    assert.ok(cm.panels.length >= 10 && cm.panels.length <= 20, `${cm.id}: ${cm.panels.length} panels`);
    assert.ok(DEVANAGARI.test(cm.title.hi) && cm.title.en, cm.id);
    for (const p of cm.panels) {
      assert.ok(p.cast.length <= 3, `${cm.id}: at most three characters in a panel`);
      for (const b of p.say || []) assert.ok(b.text.split(/\s+/).length <= 40, `${cm.id}: "${b.text.slice(0, 30)}…" is too long for a bubble`);
    }
    const words = textOf(cm).split(/\s+/).length;
    assert.ok(words >= 150 && words <= 900, `${cm.id}: ${words} words`);
  }
});

test('twenty longer comics a grade: 16 panels or more and at least 500 words', () => {
  const long = (cm) => cm.panels.length >= 16 && textOf(cm).split(/\s+/).length >= 500;
  for (const level of Object.keys(GRADE_SERIES)) {
    const list = comics.filter((c) => c.level === level && long(c));
    assert.ok(list.length >= 20, `${level}: ${list.length} long comics`);
    for (const s of GRADE_SERIES[level]) assert.ok(list.some((c) => c.series === s), `${s} has long comics`);
  }
});

test('every panel has something to read: a caption or a speech bubble', () => {
  for (const cm of comics) for (const [i, p] of cm.panels.entries()) assert.ok(p.cap || p.say?.length, `${cm.id}: panel ${i + 1}`);
});

test('every glossary word appears in its comic (so it can be tapped for its meaning), with three questions each', () => {
  for (const cm of comics) {
    const text = textOf(cm);
    assert.ok(cm.words.length >= 5, `${cm.id} word list`);
    for (const w of cm.words) {
      assert.ok(text.includes(w.hi), `${cm.id}: "${w.hi}" is in the word list but not in the comic`);
      assert.ok(w.mean && w.en, `${cm.id}: ${w.hi} needs a meaning in Hindi and English`);
    }
    assert.equal(cm.questions.length, 3, cm.id);
    for (const q of cm.questions) assert.equal(new Set(q.options).size, q.options.length, `${cm.id}: repeated option`);
    // idioms are what Grades 7 and 8 practise
    assert.ok(cm.words.some((w) => /^(मुहावरा|कहावत):/.test(w.mean)), `${cm.id} teaches at least one idiom`);
  }
});

test('every mystery, riddle and trick stops for the reader to answer before the reveal', () => {
  for (const cm of comics.filter((c) => GUESS_SERIES.includes(c.series))) {
    const g = cm.guess;
    assert.ok(g, `${cm.id} has a guess`);
    assert.ok(g.options.includes(g.answer) && g.hint, cm.id);
    assert.ok(g.at >= 3 && g.at <= cm.panels.length - 2, `${cm.id}: the reveal starts at panel ${g.at}`);
    // a word to tap before the guess, so the reader meets the glossary before answering
    const before = cm.panels.slice(0, g.at).flatMap((p) => [p.cap || '', ...(p.say || []).map((b) => b.text)]).join(' ');
    assert.ok(cm.words.some((w) => before.includes(w.hi)), `${cm.id}: a glossary word before the guess`);
  }
});

test('every character in every panel can be drawn, with each face and pose', () => {
  for (const cm of comics)
    for (const p of cm.panels) {
      assert.ok(BACKGROUND_IDS.includes(p.bg) && comicBg(p.bg).includes('<svg'), `${cm.id}: ${p.bg}`);
      for (const ch of p.cast) {
        const look = lookOf(cm, ch.who);
        assert.ok(look && CAST[look.look], `${cm.id}: ${ch.who}`);
        assert.match(castSvg(look.look, { face: ch.face, arms: ch.arms, hold: ch.hold, over: look.over }), /^<svg/);
      }
      for (const b of p.say || []) assert.ok(lookOf(cm, b.who)?.name, `${cm.id}: ${b.who} has a name`);
    }
  for (const id of CAST_IDS) for (const f of FACES) for (const a of ARMS) assert.ok(castSvg(id, { face: f, arms: a }).length > 200, `${id} ${f} ${a}`);
});

test('comics read left to right: the first of two speakers stands on the left', () => {
  for (const cm of comics)
    for (const p of cm.panels) {
      const speakers = [...new Set((p.say || []).map((b) => b.who))].filter((w) => p.cast.some((ch) => ch.who === w));
      if (speakers.length !== 2) continue;
      const [a, b] = speakers.map((w) => p.cast.find((ch) => ch.who === w).at);
      assert.ok(a < b, `${cm.id}: ${speakers.join(' then ')}`);
    }
});

test('word meanings are marked once each, without changing the text', () => {
  const words = [{ hi: 'टेढ़ी खीर' }, { hi: 'सबूत' }];
  const used = new Set();
  const parts = glossSplit('यह तो टेढ़ी खीर है, बिना सबूत के। फिर टेढ़ी खीर!', words, used);
  assert.equal(parts.map((x) => (typeof x === 'string' ? x : x.hi)).join(''), 'यह तो टेढ़ी खीर है, बिना सबूत के। फिर टेढ़ी खीर!');
  assert.equal(parts.filter((x) => typeof x !== 'string').length, 2);
  assert.deepEqual(glossSplit('सबूत', words, used), ['सबूत'], 'only the first time in a comic');
});

test('a comic world for each series opens every comic of the series and an idiom quiz', () => {
  for (const [series, id] of Object.entries(SERIES_WORLD)) {
    const w = content.worlds.find((x) => x.id === id);
    const mine = comics.filter((c) => c.series === series);
    const n = mine.length;
    assert.equal(w.level, mine[0].level);
    const lessons = C.worldLessons(w);
    const linked = lessons.filter((l) => l.game === 'comic').map((l) => l.config.comic);
    assert.equal(linked.length, n);
    assert.deepEqual(new Set(linked), new Set(mine.map((c) => c.id)));
    const quiz = lessons.find((l) => l.game === 'quiz');
    const bank = content.quizzes[quiz.config.bank];
    assert.ok(bank.questions.length >= 10, `${id}: ${bank.questions.length} idiom questions`);
    for (const q of bank.questions) {
      assert.ok(q.options.includes(q.answer));
      assert.equal(new Set(q.options).size, 3, q.hi);
    }
    // a character card for every comic
    assert.ok(content.collections[w.collection].items.length >= n);
  }
  assert.ok(content.levels.find((l) => l.id === 'grade7') && content.levels.find((l) => l.id === 'grade8'));
});

test('the idiom quizzes never give the answer away in the English line', () => {
  for (const id of ['g7-idioms', 'g8-idioms', 'b-idioms', 'ch-idioms', 'bt-idioms', 'mu-idioms'])
    for (const q of content.quizzes[id].questions) assert.ok(!q.en.includes('('), `${id}: ${q.en}`);
});
