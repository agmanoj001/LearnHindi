// Roadmap 1.4, 7.6 and 7.14: talk-together prompts after every story, two players on one device
// ("साथ खेलो"), and free play between lessons.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TALK_TYPES, GAME_TYPES, validateContent } from '../js/validate.js';
import { togetherQuestion, quizPool, picturePool, playersFrom, kindFor, KIND_BY_LEVEL, GROWN_UP, TOGETHER_ROUNDS } from '../js/together.js';
import { freeplayModes, freeplayDue, colouringSvg, FARM_FOOD, FARM_LIKES, PALETTE, FREEPLAY_LEVELS } from '../js/freeplay.js';
import { pictureExists } from '../js/art.js';
import { appVoiceLines } from '../js/logic.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const world = (id) => content.worlds.find((w) => w.id === id);
// a fixed random sequence, so the tests don't depend on luck
const seeded = (seed = 7) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// ---- 1.4 / 7.6: talk together after a story ----
test('every story has the five talk-together prompts, each in Hindi and English', () => {
  assert.deepEqual(TALK_TYPES, ['complete', 'recall', 'open', 'why', 'you']);
  for (const s of content.stories) {
    assert.deepEqual(
      s.talk.map((t) => t.type),
      TALK_TYPES,
      `${s.id}: the prompts in order`,
    );
    for (const t of s.talk) assert.ok(t.hi?.trim() && t.en?.trim(), `${s.id} ${t.type}: hi and en`);
  }
});

test('the prompts fit their story: a gap to fill, the first page, and questions written for it', () => {
  for (const s of content.stories) {
    const by = Object.fromEntries(s.talk.map((t) => [t.type, t]));
    assert.match(by.complete.hi, /…/, `${s.id}: the line to finish has a gap`);
    // the recall prompt quotes the story's first line
    const first = s.pages[0];
    const firstText = (first.hi || first.en || '').split(/[।!?]/)[0].trim();
    if (firstText) assert.ok(by.recall.hi.includes(firstText.slice(0, 6)) || by.recall.en.includes(firstText.slice(0, 6)), `${s.id}: recall quotes the start`);
  }
  // "why" and "you" are written per story, not one template for all
  for (const type of ['why', 'you']) {
    const texts = content.stories.map((s) => s.talk.find((t) => t.type === type).hi);
    assert.equal(new Set(texts).size, texts.length, `every story has its own "${type}" question`);
  }
});

test('the questions put to the child suit a boy or a girl', () => {
  // second-person future forms like करोगे/करोगी (or जाओगे/जाओगी) pick a gender
  for (const s of content.stories) for (const t of s.talk) assert.doesNotMatch(t.hi, /ओगे|ओगी|ोगे|ोगी/, `${s.id} ${t.type}: ${t.hi}`);
});

test('the validator rejects a story without its prompts, or with one missing', () => {
  const copy = structuredClone(content);
  delete copy.stories[0].talk;
  assert.ok(validateContent(copy).errors.some((e) => e.includes('.talk is required')));
  const copy2 = structuredClone(content);
  copy2.stories[1].talk = copy2.stories[1].talk.filter((t) => t.type !== 'why');
  assert.ok(validateContent(copy2).errors.some((e) => e.includes('needs a "why" prompt')));
  const copy3 = structuredClone(content);
  copy3.stories[2].talk.push({ type: 'quiz', hi: 'x', en: 'x' });
  assert.ok(validateContent(copy3).errors.some((e) => e.includes('"quiz" is not one of')));
  assert.deepEqual(validateContent(content).errors, []);
});

test('the results screen offers the prompts after a story, and the story marks itself as read', () => {
  const screens = read('js/screens.js');
  assert.match(screens, /export function showTalk/);
  assert.match(screens, /talkButton\(/);
  assert.match(read('js/games/story.js'), /ctx\.markStory\?\.\(story\.id\)/);
  assert.match(read('js/app.js'), /markStory: \(id\) =>/);
});

// ---- 7.6: two players on one device ----
test('every level gets a question it can answer', () => {
  assert.equal(kindFor('kg'), 'hear-pic');
  assert.equal(kindFor('grade1'), 'read-pic');
  assert.equal(kindFor('grade7'), 'quiz');
  assert.equal(kindFor(GROWN_UP), 'number');
  assert.equal(kindFor('nobody'), 'hear-pic');
  for (const level of Object.keys(KIND_BY_LEVEL)) {
    const rng = seeded(level.length);
    const used = new Set();
    for (let i = 0; i < TOGETHER_ROUNDS / 2; i++) {
      const q = togetherQuestion(content, level, rng, used);
      assert.equal(q.kind, KIND_BY_LEVEL[level], level);
      assert.ok(q.options.includes(q.answer), `${level}: the answer is among the options`);
      assert.equal(new Set(q.options).size, q.options.length, `${level}: no option twice`);
      if (q.kind === 'hear-pic' || q.kind === 'read-pic') {
        assert.equal(q.options.length, 3);
        for (const id of q.options) assert.ok(pictureExists(content.words[id].picture), `${id} has a picture`);
      }
      if (q.kind === 'number') {
        assert.ok(q.answer >= 21 && q.answer <= 99);
        assert.equal(q.number.value, q.answer);
        assert.equal(q.options.length, 4);
      }
    }
    assert.equal(used.size, TOGETHER_ROUNDS / 2, `${level}: no question twice in a game`);
  }
});

test('quiz players get their own grade\'s questions, and a grade with none reads words instead', () => {
  for (const level of ['grade3', 'grade4', 'grade7', 'grade8']) {
    const pool = quizPool(content, level);
    assert.ok(pool.length >= 20, `${level} has ${pool.length} questions`);
    const banks = new Set(content.worlds.filter((w) => w.level === level).flatMap((w) => w.units.flatMap((u) => u.lessons.map((l) => l.config?.bank)).filter(Boolean)));
    const q = togetherQuestion(content, level, seeded(3));
    assert.ok(banks.has(q.quiz.bank), `${level}: the question comes from a ${level} bank`);
  }
  const noQuizzes = { ...content, quizzes: {} };
  assert.equal(togetherQuestion(noQuizzes, 'grade7', seeded(1)).kind, 'read-pic');
});

test('the picture pool is everyday words: one word each, no places or comic panels', () => {
  const pool = picturePool(content);
  assert.ok(pool.length >= 100);
  for (const w of pool) {
    assert.ok(!w.hi.includes(' '), w.id);
    assert.ok(!/^(comic|place|shape)-/.test(w.id), w.id);
  }
  assert.equal(new Set(pool.map((w) => w.hi)).size, pool.length, 'no two words look the same');
});

test('the players are the children on this device, at their own grades, and a grown-up', () => {
  const profiles = { list: [{ id: 'a', name: 'A', avatar: 'chiku' }, { id: 'b', name: '' }] };
  const levels = { a: 'kg', b: 'grade7' };
  const players = playersFrom(profiles, (id) => levels[id], ['gappu']);
  assert.deepEqual(
    players.map((p) => [p.id, p.level, p.avatar]),
    [
      ['a', 'kg', 'chiku'],
      ['b', 'grade7', 'gappu'],
      [GROWN_UP, GROWN_UP, null],
    ],
  );
  // with no profiles, a child at KG and a grown-up can still play
  assert.equal(playersFrom(null, () => null).length, 1);
  assert.equal(playersFrom({ list: [{ id: 'x' }] }, () => undefined)[0].level, 'kg');
});

test('साथ खेलो is a game, it is on the home screen, and what it says is recorded', () => {
  assert.ok(GAME_TYPES.includes('together'));
  const screens = read('js/screens.js');
  assert.match(screens, /together-btn/);
  assert.match(screens, /export function together\(api\)/);
  assert.match(read('js/app.js'), /case 'together':/);
  // answers are compared through .v, never a button's string .value
  assert.doesNotMatch(read('js/games/together.js'), /\.value\b/);
  const lines = new Set(appVoiceLines(content).map((l) => l.key));
  for (const k of ['togetherHi', 'turnOne', 'turnTwo', 'teamDone']) {
    assert.ok(content.phrases[k]?.hi && content.phrases[k]?.en, k);
    assert.ok(lines.has(`phrase-${k}_hi`) && lines.has(`phrase-${k}_en`), `${k} is in the voice lines`);
  }
});

// ---- 7.14: free play between lessons ----
test('free play is offered after every second lesson, from Toddler to Grade 4', () => {
  assert.deepEqual(FREEPLAY_LEVELS, ['toddler', 'kg', 'grade1', 'grade2', 'grade3', 'grade4']);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map((n) => freeplayDue('kg', n)), [false, false, true, false, true, false, true]);
  assert.equal(freeplayDue('grade7', 2), false, 'older readers have their own things');
  assert.equal(freeplayDue('grade4', 2), true);
  assert.match(read('js/screens.js'), /freeplayDue\(world\.level/);
  assert.match(read('js/app.js'), /case 'freeplay':/);
});

test('each world has the right sandboxes: drive in Vehicle Town, feed on the farm, colour everywhere', () => {
  assert.deepEqual(freeplayModes(world('town')), ['drive', 'colour']);
  assert.deepEqual(freeplayModes(world('farm')), ['feed', 'colour']);
  for (const w of content.worlds) {
    assert.equal(freeplayModes(w).at(-1), 'colour', w.id);
    if (!FREEPLAY_LEVELS.includes(w.level)) continue;
    // there is something to colour: the world's collection has pictures
    const items = content.collections[w.collection]?.items || [];
    assert.ok(items.some((id) => content.words[id] && pictureExists(content.words[id].picture)), `${w.id}: something to colour`);
  }
});

test('the farm animals and their food are all words with pictures, and every animal likes something offered', () => {
  for (const id of [...FARM_FOOD, ...Object.keys(FARM_LIKES)]) assert.ok(content.words[id] && pictureExists(content.words[id].picture), id);
  for (const [animal, likes] of Object.entries(FARM_LIKES)) {
    assert.ok(likes.length >= 1, animal);
    for (const f of likes) assert.ok(FARM_FOOD.includes(f), `${animal} likes ${f}, which is on the tray`);
  }
  for (const k of ['freeplayTime', 'colourIt', 'driveIt', 'feedIt', 'yum', 'noThanks']) assert.ok(content.phrases[k]?.hi && content.phrases[k]?.en, k);
});

test('a picture becomes a colouring page: white shapes with grey outlines, lines stay lines', () => {
  const svg = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#f00" stroke="#000" opacity="0.5"/><path d="M0 0L10 10" fill="none" stroke="#222" stroke-width="2"/><rect x="1" y="1" width="2" height="2" fill="url(#g)"></rect></svg>';
  const out = colouringSvg(svg);
  assert.doesNotMatch(out, /#f00|#000|#222|url\(#g\)|opacity/);
  assert.match(out, /<circle cx="5" cy="5" r="4" fill="#FFFFFF" stroke="#B8C2D1"/);
  assert.match(out, /<path d="M0 0L10 10" fill="none" stroke="#B8C2D1" stroke-width="3" data-line="1"\/>/);
  assert.match(out, /<rect x="1" y="1" width="2" height="2" fill="#FFFFFF"[^>]*><\/rect>/);
  assert.equal(PALETTE.length, 10);
  assert.equal(new Set(PALETTE).size, PALETTE.length);
});

test('the service worker caches the new modules', () => {
  const sw = read('sw.js');
  for (const f of ['js/together.js', 'js/freeplay.js', 'js/games/together.js']) assert.ok(sw.includes(`'${f}'`), f);
});
