import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { showLines, showOrder, nextShow, radioPlaylist, radioSteps, markClusters, speakMath, withBase, beatKind, AUTOPLAY_MAX, ASK_WAIT_MS } from '../js/shows.js';
import { validateContent } from '../js/validate.js';
import { pictureExists } from '../js/art.js';
import { MASCOT_IDS } from '../js/mascot.js';
import { THEMES } from '../js/art-scenes.js';
import { clipKeysFor, normalizeProgress, normalizeSettings, defaultSettings } from '../js/logic.js';
import { todayPlan, showPractice, isoDay } from '../js/curriculum.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const themes = Array.isArray(THEMES) ? THEMES : Object.keys(THEMES);
const DEVANAGARI = /[ऀ-ॿ]/;
const DAY = 86400000;

test('pilot episodes: three, one per pilot, each linked to a lesson and a recap', () => {
  const ids = content.shows.map((s) => s.id);
  assert.deepEqual(ids.sort(), ['chiku-aa', 'gappu-bus', 'tiko-ten']);
  for (const s of content.shows) {
    assert.ok(s.lesson, `${s.id} links a lesson to practise`);
    assert.ok(s.recap?.words?.length || s.recap?.lines?.length, `${s.id} has a recap`);
    // a few minutes long: enough lines to tell a story, not a feature film
    const n = showLines(s).length;
    assert.ok(n >= 15 && n <= 60, `${s.id}: ${n} lines`);
    // at least two questions and one "say it with me"
    const beats = s.scenes.flatMap((x) => x.beats);
    assert.ok(beats.filter((b) => beatKind(b) === 'ask').length >= 2, `${s.id} asks questions`);
    assert.ok(beats.some((b) => beatKind(b) === 'echo'), `${s.id} has a say-it-with-me`);
  }
});

test('episodes pass the content checks, with guides and scenes checked too', () => {
  const { errors } = validateContent(content, { pictureExists, mascots: MASCOT_IDS, themes });
  assert.deepEqual(errors, []);
});

test('the content checks catch mistakes in an episode', () => {
  const bad = structuredClone(content);
  const s = bad.shows[0];
  s.scenes[0].beats.push({ dance: true }, { say: 'nobody', hi: 'नमस्ते', en: 'Hi' }, { ask: { hi: 'क्या?', en: 'What?' }, options: ['cow', 'dog'], answer: 'cat' }, { word: 'no-such-word' }, { tenframe: [{ a: 8, b: 4 }] });
  s.scenes[0].bg = 'moon-base';
  const { errors } = validateContent(bad, { pictureExists, mascots: MASCOT_IDS, themes });
  const text = errors.join('\n');
  assert.match(text, /must be one of: say/);
  assert.match(text, /"nobody" is not a guide/);
  assert.match(text, /answer must be one of its options/);
  assert.match(text, /word "no-such-word" not found/);
  assert.match(text, /at most 10/);
  assert.match(text, /bg "moon-base"/);
});

test('every line has a stable recording key, and the file loader knows them', () => {
  const keys = new Set(clipKeysFor(content));
  for (const s of content.shows) {
    const lines = showLines(s);
    assert.equal(new Set(lines.map((l) => l.key)).size, lines.length, 'keys are unique');
    lines.forEach((l, i) => assert.equal(l.key, `show-${s.id}-${i + 1}`));
    for (const l of lines) {
      assert.ok(keys.has(`${l.key}_en`), l.key);
      if (s.lang === 'hi') {
        assert.ok(keys.has(`${l.key}_hi`), l.key);
        assert.match(l.hi, DEVANAGARI, l.key);
      }
    }
  }
});

test('a letter beat is a letter, not a word, even though it names a word', () => {
  assert.equal(beatKind({ letter: 'क', word: 'dove' }), 'letter');
  assert.equal(beatKind({ say: 'chiku', hi: 'हाँ', en: 'Yes', do: 'happy' }), 'say');
  assert.equal(beatKind({ word: 'boat', mark: 'ा' }), 'word');
  assert.equal(beatKind({ nonsense: 1 }), null);
});

test('this grade’s episodes come first; next skips what was already watched', () => {
  assert.equal(showOrder(content, 'kg')[0].id, 'gappu-bus');
  assert.ok(['chiku-aa', 'tiko-ten'].includes(showOrder(content, 'grade1')[0].id));
  const seen = { shows: { 'tiko-ten': { views: 1, last: '2026-11-01' } } };
  assert.equal(nextShow(content, 'grade1', 'chiku-aa', seen).id, 'gappu-bus');
  assert.ok(nextShow(content, 'grade1', 'chiku-aa', {}));
  assert.ok(AUTOPLAY_MAX >= 2 && AUTOPLAY_MAX <= 4, 'a few in a row, then a stretch break');
  assert.ok(ASK_WAIT_MS >= 4000, 'watch mode gives time to think');
});

test('syllables with the matra light up without splitting a letter from its matra', () => {
  assert.deepEqual(markClusters('नाव', 'ा'), [{ text: 'ना', on: true }, { text: 'व', on: false }]);
  assert.deepEqual(markClusters('माला', 'ा').map((c) => c.on), [true, true]);
  assert.equal(markClusters('गाय', null).filter((c) => c.on).length, 0);
  assert.equal(withBase('ा'), '◌ा');
  assert.equal(withBase('न'), 'न');
  assert.equal(speakMath('6 + 4 = 10'), '6 plus 4 is 10');
});

test('Story radio: this grade and the one below, a rhyme after every two stories, family recordings used', () => {
  const list = radioPlaylist(content, 'grade1');
  assert.ok(list.length > 10);
  assert.ok(list.every((s) => ['kg', 'grade1'].includes(s.level)));
  assert.notEqual(list[0].kind, 'poem');
  assert.equal(list[2].kind, 'poem');
  assert.equal(radioPlaylist(content, 'toddler').every((s) => s.level === 'toddler'), true);
  const story = content.stories.find((s) => s.id === list[0].id);
  const steps = radioSteps(story, ['hi', 'en'], content.words);
  const said = steps.flatMap((s) => s.say || []);
  assert.ok(said.some((x) => x.clipKey === `story-${story.id}-1_hi`), 'page 1 can be a family recording');
  assert.ok(said.some((x) => x.lang === 'en'));
  assert.ok(steps.some((s) => s.show === 'think'), 'ends with a question to think about');
  const english = content.stories.find((s) => s.lang === 'en');
  assert.ok(radioSteps(english, ['hi', 'en'], content.words).flatMap((s) => s.say || []).every((x) => x.lang === 'en'), 'English rhymes stay English');
});

test('progress and settings keep Show time data; bad data is dropped', () => {
  const p = normalizeProgress({ shows: { 'chiku-aa': { views: 2, last: '2026-11-03' }, bad: { views: 1 }, worse: 'x' } }, content);
  assert.deepEqual(p.shows, { 'chiku-aa': { views: 2, last: '2026-11-03' } });
  assert.deepEqual(normalizeProgress(null, content).shows, {});
  assert.equal(defaultSettings(content).showMode, 'watch');
  assert.equal(normalizeSettings({ showMode: 'play' }, content).showMode, 'play');
  assert.equal(normalizeSettings({ showMode: 'binge' }, content).showMode, 'watch');
});

test("Today's path: practise the game of an episode watched today or yesterday", () => {
  const now = Date.UTC(2026, 10, 4, 12);
  const worlds = content.worlds.filter((w) => w.level === 'grade1');
  const watched = (last) => normalizeProgress({ shows: { 'chiku-aa': { views: 1, last } } }, content);
  const fresh = watched(isoDay(now));
  const step = todayPlan(content, fresh, worlds, now).find((s) => s.kind === 'watched');
  assert.equal(step?.lesson.id, 'g1-m1-2');
  assert.equal(showPractice(content, watched(isoDay(now - DAY)), worlds, now)?.lesson.id, 'g1-m1-2');
  assert.equal(showPractice(content, watched(isoDay(now - 3 * DAY)), worlds, now), null, 'old episodes are forgotten');
  // played the game since watching: nothing to suggest
  const played = { ...fresh, lessons: { 'g1-m1-2': { stars: 2, plays: 1, tier: 0, last: isoDay(now) } } };
  assert.equal(showPractice(content, played, worlds, now), null);
});

test('the service worker caches Show time', () => {
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(sw, /'js\/shows\.js'/);
});
