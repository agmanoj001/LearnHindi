// The user-experience round: voice help per device, readable colours, music that changes and makes room
// for speech, and comics that remember where they were left.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deviceKind, VOICE_SETUP, readable, contrastWithWhite, normalizeSettings, normalizeProgress, COMBO_MILESTONES, comboText } from '../js/logic.js';
import { pictureExists } from '../js/art.js';
import { worldLessons } from '../js/curriculum.js';
import { makePhrase, songRound, progOf, musicLevel, MUSIC_STYLES, sfx } from '../js/sfx.js';
import { MOVES, FX, SKIES, SOUNDS, sceneHtml, sceneClass, sceneSound, actProblems } from '../js/scene.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));

test('each kind of device gets its own steps for adding a Hindi voice', () => {
  const ua = {
    ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15',
    android: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/124 Mobile',
    windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124',
    mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1',
    chromeos: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 Chrome/124',
  };
  for (const [kind, s] of Object.entries(ua)) assert.equal(deviceKind(s, 0), kind);
  // an iPad says it is a Mac, but has a touch screen
  assert.equal(deviceKind(ua.mac, 5), 'ios');
  assert.equal(deviceKind('Mozilla/5.0 (X11; Linux x86_64)', 0), 'other');
  for (const k of ['ios', 'android', 'windows', 'mac', 'chromeos', 'other']) assert.ok(VOICE_SETUP[k].device && VOICE_SETUP[k].steps.length > 20, k);
  assert.match(VOICE_SETUP.ios.steps, /Spoken Content/);
  assert.match(VOICE_SETUP.android.steps, /Install voice data/);
});

test('tag colours are darkened just enough for white text (WCAG AA)', () => {
  for (const t of Object.values(content.tags)) {
    const c = readable(t.color);
    assert.ok(contrastWithWhite(c) >= 4.5, `${t.en}: ${c}`);
    // colours that already pass are left alone
    if (contrastWithWhite(t.color) >= 4.5) assert.equal(c, t.color);
  }
});

test('the music: a world keeps its opening phrase, the answers change each time round', () => {
  const style = { root: 60, scale: [0, 2, 4, 7, 9], bpm: 96 };
  const a = songRound(style, 'jungle', 0);
  const b = songRound(style, 'jungle', 1);
  assert.equal(a.length, 128, '16 bars of eighth notes');
  assert.deepEqual(a.slice(0, 32), b.slice(0, 32), 'the same opening every time');
  assert.notDeepEqual(a.slice(64, 96), b.slice(64, 96), 'a new answering phrase');
  assert.notDeepEqual(songRound(style, 'farm', 0).slice(0, 32), a.slice(0, 32), 'each world has its own tune');
  // strong beats sit on the bar's chord, and each phrase comes home to the root
  const prog = progOf(style);
  for (const phrase of [a.slice(0, 32), a.slice(64, 96)]) {
    for (let i = 0; i < 30; i += 4) {
      if (phrase[i] == null) continue;
      const chord = [0, 4, 7].map((x) => (prog[Math.floor(i / 8)] + x) % 12);
      assert.ok(chord.includes((phrase[i] - 60) % 12), `beat ${i}`);
    }
    assert.equal((phrase[30] - 60) % 12, 0);
  }
  assert.equal(makePhrase(style, 5).length, 32);
});

test('every world has its own music style, and lessons sit quieter under speech', () => {
  const themes = new Set(content.worlds.map((w) => w.theme));
  for (const t of themes) assert.ok(MUSIC_STYLES.includes(t), `${t} has a music style`);
  assert.ok(musicLevel('lesson', false) < musicLevel('free', false));
  assert.ok(musicLevel('lesson', true) < musicLevel('free', true));
  assert.ok(musicLevel('lesson', true) < musicLevel('lesson', false) * 0.2, 'speech in a lesson: the music nearly stops');
});

test('comics remember where they were left, and the bigger-text choice is kept', () => {
  const p = normalizeProgress({ comicPos: { 'd-book': { panel: 12, solved: true }, bad: { panel: -3 }, worse: 'x', big: { panel: 500 } } }, content);
  assert.deepEqual(p.comicPos['d-book'], { panel: 12, solved: true });
  assert.equal(p.comicPos.bad, undefined);
  assert.equal(p.comicPos.worse, undefined);
  assert.equal(p.comicPos.big.panel, 99);
  assert.deepEqual(normalizeProgress(null, content).comicPos, {});
  assert.equal(normalizeSettings({ bigText: true }, content).bigText, true);
  assert.equal(normalizeSettings({ bigText: 'yes' }, content).bigText, false);
});

test('answers right first time in a row earn a cheer at 3, 5, 8 and 12', () => {
  assert.deepEqual(COMBO_MILESTONES, [3, 5, 8, 12]);
  assert.equal(comboText(3, 'en'), '3 in a row!');
  assert.match(comboText(5, 'hi'), /लगातार 5/);
  assert.match(comboText(8, 'both'), /8 in a row.*लगातार 8/);
});

// ---------- first stories for Kindergarten and Grade 1 ----------

const words = (t) => t.trim().split(/\s+/).length;
const KG_STORIES = ['hanuman-suraj', 'gilhari-setu', 'ram-diwali', 'makhan-chor', 'ganesh-chakkar', 'do-bakriyan', 'suraj-hawa', 'haathi-chinti'];
const G1_STORIES = ['ram-dhanush', 'sone-ka-hiran', 'hanuman-lanka', 'sanjeevani', 'govardhan', 'lomdi-kauwa', 'billi-bandar', 'namak-gadha', 'haathi-darzi'];
const story = (id) => content.stories.find((s) => s.id === id);

test('Kindergarten and Grade 1 have easy stories from the Ramayana, Krishna, Ganesh and folk tales', () => {
  for (const [level, ids, maxWords] of [['kg', KG_STORIES, 9], ['grade1', G1_STORIES, 11]]) {
    for (const id of ids) {
      const s = story(id);
      assert.ok(s, id);
      assert.equal(s.level, level, id);
      assert.notEqual(s.kind, 'poem', id);
      // short enough for the grade: a few pages, a line or two on each
      assert.ok(s.pages.length >= 5 && s.pages.length <= 7, `${id}: ${s.pages.length} pages`);
      for (const p of s.pages) {
        assert.ok(words(p.hi) <= maxWords, `${id}: "${p.hi}" is too long for ${level}`);
        assert.ok(p.en, id);
        assert.ok(pictureExists(content.words[p.word]?.picture), `${id}: ${p.word} can be drawn`);
      }
      // two picture questions (no reading needed to answer) and a gentle lesson
      assert.equal(s.questions.length, 2, id);
      for (const q of s.questions) {
        assert.ok(!q.text, `${id}: picture answers only`);
        assert.equal(new Set(q.options).size, 3, `${id}: three different options`);
        assert.ok(q.options.includes(q.answer), id);
      }
      assert.ok(s.moral?.hi && s.moral.en, `${id} ends with a lesson`);
    }
  }
  // Kindergarten had only rhymes before
  assert.ok(content.stories.filter((s) => s.level === 'kg' && s.kind !== 'poem' && s.lang !== 'en').length >= 8);
});

test('the story characters are picture words that can be drawn', () => {
  for (const id of ['ram', 'sita', 'lakshman', 'hanuman', 'ravan', 'krishna', 'ganesh', 'golden-deer', 'donkey', 'tailor', 'bow', 'butter', 'mountain', 'sea', 'ring']) {
    const w = content.words[id];
    assert.ok(w?.hi && w.en, id);
    assert.ok(pictureExists(w.picture), `${id} has a drawing`);
  }
});

test('each new story has its own lesson: Vehicle Town for Kindergarten, the Jolly Jungle for Grade 1', () => {
  for (const [worldId, ids] of [['town', KG_STORIES], ['jungle', G1_STORIES]]) {
    const w = content.worlds.find((x) => x.id === worldId);
    const linked = worldLessons(w).filter((l) => l.game === 'story').map((l) => l.config.story);
    for (const id of ids) assert.ok(linked.includes(id), `${worldId} opens ${id}`);
  }
});

// ---------- stories that move: a little scene on every Toddler and Kindergarten page ----------

test('every Toddler and Kindergarten page moves with the story, and no two pages in a row look the same', () => {
  const young = content.stories.filter((s) => s.level === 'toddler' || s.level === 'kg');
  assert.ok(young.length >= 25);
  const has = (id) => id in content.words;
  for (const s of young) {
    for (const [i, p] of s.pages.entries()) {
      assert.ok(p.act, `${s.id} page ${i + 1} has a scene`);
      assert.deepEqual(actProblems(p.act, has), [], `${s.id} page ${i + 1}`);
      if (i) assert.notDeepEqual(p.act, s.pages[i - 1].act, `${s.id} page ${i + 1} changes the scene`);
    }
    // a story is not one move over and over
    assert.ok(new Set(s.pages.map((p) => p.act.move)).size >= Math.min(3, s.pages.length), `${s.id} uses different moves`);
  }
});

test('the scene builder: backdrop, picture, partner and effects; every move, effect and sky has its CSS', () => {
  const art = (id) => `<svg data-id="${id}"></svg>`;
  const html = sceneHtml({ move: 'approach', with: 'hen', fx: ['hearts', 'stars'], sky: 'night' }, 'chick', art);
  assert.match(html, /class="actor partner"><div class="body"><svg data-id="hen">/);
  assert.match(html, /class="actor main"><div class="body"><svg data-id="chick">/);
  assert.equal((html.match(/<i /g) || []).length, FX.hearts.n + FX.stars.n);
  assert.ok(html.indexOf('fx-stars') < html.indexOf('actor main'), 'stars sit behind the picture');
  assert.ok(html.indexOf('fx-hearts') > html.indexOf('actor main'), 'hearts float in front');
  assert.equal(sceneClass({ move: 'jump', fx: 'splash', sky: 'rain' }), 'scene sky-rain mv-jump has-splash');
  assert.equal(sceneClass({}), 'scene sky-day mv-enter');
  // the sound: its own, else the move's, else the effect's
  assert.equal(sceneSound({ move: 'jump', sound: 'sneeze' }), 'sneeze');
  assert.equal(sceneSound({ move: 'fall' }), 'thud');
  assert.equal(sceneSound({ move: 'float', fx: ['stars', 'rain'] }), 'rain');
  assert.equal(sceneSound({ move: 'sleep' }), null);
  for (const s of SOUNDS) assert.equal(typeof sfx[s], 'function', `sfx.${s}`);
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  for (const m of Object.keys(MOVES)) if (m !== 'enter') assert.ok(css.includes(`.mv-${m} `), `CSS for move ${m}`);
  for (const f of Object.keys(FX)) assert.ok(css.includes(`.fx-${f} `), `CSS for fx ${f}`);
  for (const k of SKIES) assert.ok(css.includes(`.sky-${k}`), `CSS for sky ${k}`);
  assert.match(css, /prefers-reduced-motion: reduce\)\s*\{\s*\.scene \*/, 'scenes stand still for reduced motion');
});

test('a scene that names a missing move, effect, sky or partner is caught', () => {
  const has = (id) => id === 'hen';
  assert.deepEqual(actProblems({ move: 'jump' }, has), []);
  assert.equal(actProblems({ move: 'moonwalk' }, has).length, 1);
  assert.equal(actProblems({ fx: 'fireworks' }, has).length, 1);
  assert.equal(actProblems({ fx: ['rain', 'rain'] }, has).length, 1);
  assert.equal(actProblems({ fx: ['rain', 'splash', 'stars'] }, has).length, 1);
  assert.equal(actProblems({ sky: 'mars' }, has).length, 1);
  assert.equal(actProblems({ move: 'bump' }, has).length, 1, 'bump needs a partner');
  assert.equal(actProblems({ with: 'dragon' }, has).length, 1);
  assert.equal(actProblems({ sound: 'kaboom' }, has).length, 1);
  assert.equal(actProblems({ colour: 'red' }, has).length, 1);
  assert.equal(actProblems('jump', has).length, 1);
});

test('Toddlers have tiny moving stories on the farm: a few words a page, picture questions', () => {
  const tiny = content.stories.filter((s) => s.level === 'toddler');
  assert.ok(tiny.length >= 6);
  const farm = content.worlds.find((w) => w.id === 'farm');
  const linked = worldLessons(farm).filter((l) => l.game === 'story').map((l) => l.config.story);
  for (const s of tiny) {
    assert.ok(linked.includes(s.id), `the farm opens ${s.id}`);
    assert.ok(s.pages.length >= 3 && s.pages.length <= 4, s.id);
    for (const p of s.pages) {
      assert.ok(words(p.hi) <= 5, `${s.id}: "${p.hi}" is short enough for a toddler`);
      assert.ok(pictureExists(content.words[p.word]?.picture), `${s.id}: ${p.word}`);
    }
    assert.equal(s.questions.length, 2);
    for (const q of s.questions) assert.ok(!q.text && q.options.includes(q.answer) && q.options.every((o) => pictureExists(content.words[o]?.picture)), s.id);
  }
});
