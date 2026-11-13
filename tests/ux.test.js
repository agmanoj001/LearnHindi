// The user-experience round: voice help per device, readable colours, music that changes and makes room
// for speech, and comics that remember where they were left.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deviceKind, VOICE_SETUP, readable, contrastWithWhite, normalizeSettings, normalizeProgress, COMBO_MILESTONES, comboText, isKeyToken } from '../js/logic.js';
import { makeBackup, readBackup, BACKUP_APP } from '../js/storage.js';
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

test('every page from Toddler to Grade 2 moves with the story, and no two pages in a row look the same', () => {
  // Toddler to Grade 2: every story page is a scene
  const young = content.stories.filter((s) => ['toddler', 'kg', 'grade1', 'grade2'].includes(s.level));
  assert.ok(young.length >= 65);
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

test('the word that names the picture is found in the line, in Hindi and English', () => {
  const w = (id) => content.words[id];
  assert.ok(isKeyToken('चूहे', w('mouse'), 'hi'));
  assert.ok(isKeyToken('चूहों', w('mouse'), 'hi'));
  assert.ok(isKeyToken('बकरियाँ', w('goat'), 'hi'));
  assert.ok(isKeyToken('शेर', w('lion'), 'hi'));
  assert.ok(!isKeyToken('जंगल', w('lion'), 'hi'));
  assert.ok(isKeyToken('lion', w('lion'), 'en'));
  assert.ok(isKeyToken('stars,', w('star'), 'en'));
  assert.ok(!isKeyToken('start', w('star'), 'en'));
  assert.ok(!isKeyToken('catch', w('cat'), 'en'));
  // most Grade 1 and 2 pages mark their key word, so the child can link it to the picture
  const pages = content.stories.filter((s) => ['grade1', 'grade2'].includes(s.level) && s.lang !== 'en').flatMap((s) => s.pages);
  const marked = pages.filter((p) => p.hi.split(/\s+/).some((t) => isKeyToken(t, content.words[p.word], 'hi')));
  assert.ok(marked.length / pages.length > 0.6, `${marked.length} of ${pages.length}`);
});

test('a backup holds settings, progress and children, and restores only those', () => {
  const store = {
    'vt.settings': { level: 'grade2' },
    'vt.progress': { stars: { a: 3 } },
    'vt.progress:p2': { stars: { b: 1 } },
    'vt.profiles': { list: [], current: 'p1' },
    'vt.special': { photo: 'data:image/jpeg;base64,AAAA' },
    other: { x: 1 },
  };
  const b = makeBackup((k) => store[k], Object.keys(store), new Date('2026-01-02T03:04:05Z'));
  assert.equal(b.app, BACKUP_APP);
  assert.equal(b.savedAt, '2026-01-02T03:04:05.000Z');
  assert.deepEqual(Object.keys(b.data).sort(), ['vt.profiles', 'vt.progress', 'vt.progress:p2', 'vt.settings']);
  const r = readBackup(JSON.parse(JSON.stringify(b)));
  assert.equal(r.entries.length, 4);
  // someone else's file, a newer format, sneaky keys, or nothing to restore
  assert.ok(readBackup({ app: 'other', version: 1, data: {} }).error);
  assert.ok(readBackup({ app: BACKUP_APP, version: 2, data: {} }).error);
  assert.ok(readBackup(null).error);
  assert.ok(readBackup({ app: BACKUP_APP, version: 1, data: { 'vt.settings': {} } }).error);
  const sneaky = readBackup({ app: BACKUP_APP, version: 1, data: { 'vt.progress': {}, 'vt.special': { photo: 'x' }, evil: {}, 'vt.progress:p9x': {} } });
  assert.deepEqual(sneaky.entries.map(([k]) => k), ['vt.progress']);
});

// ---------- story voices: recorded narration ----------
import { storyVoiceLines, clipKeysFor } from '../js/logic.js';
import { packFiles, voiceUrl, bundlesFor } from '../js/voicepack.js';
import { readClipsFile, VOICES_FILE_KIND } from '../js/storage.js';

test('every story line has a voice: titles, pages, questions and morals, in each of the story’s languages', () => {
  const lines = storyVoiceLines(content);
  const keys = new Set(lines.map((l) => l.key));
  assert.equal(keys.size, lines.length, 'no two lines share a recording');
  const lion = lines.filter((l) => l.story === 'lion-mouse');
  const s = content.stories.find((x) => x.id === 'lion-mouse');
  assert.equal(lion.length, 2 * (1 + s.pages.length + s.questions.length + 1));
  assert.ok(keys.has('story-lion-mouse-title_hi') && keys.has('story-lion-mouse-3_en') && keys.has('story-lion-mouse-q1_hi') && keys.has('story-lion-mouse-moral_hi'));
  // English rhymes only in English
  assert.ok(lines.filter((l) => l.story === 'twinkle').every((l) => l.lang === 'en'));
  for (const l of lines) assert.ok(l.text.trim(), l.key);
  // a family can record every one of them too
  const family = new Set(clipKeysFor(content));
  for (const k of keys) assert.ok(family.has(k), k);
  assert.equal(voiceUrl('story-a-1_hi'), 'voices/story-a-1_hi.mp3');
});

test('the voice pack downloads a grade at a time, with the app’s own voices in every grade', () => {
  const idx = { files: { 'story-a-title_hi': 10, 'story-a-1_hi': 20, 'story-b-q2_en': 30, 'story-b-moral_en': 5, 'phrase-great_hi': 1 }, stories: { a: 'kg', b: 'grade2' } };
  assert.deepEqual(packFiles(idx, ['kg']).map((f) => f.key), ['story-a-title_hi', 'story-a-1_hi', 'phrase-great_hi']);
  assert.deepEqual(packFiles(idx, ['grade2']).map((f) => f.bytes), [30, 5, 1]);
  assert.equal(packFiles(idx).length, 5);
  assert.deepEqual(packFiles(null), []);
});

test('a recordings file brings back only real recordings for real lines', () => {
  const valid = clipKeysFor(content);
  const data = Buffer.from('fake audio').toString('base64');
  const file = (clips) => ({ app: 'khel-khel-mein', kind: VOICES_FILE_KIND, version: 1, clips });
  const r = readClipsFile(file({ 'story-lion-mouse-1_hi': { type: 'audio/webm', data }, 'not-a-key': { type: 'audio/webm', data }, 'story-lion-mouse-2_hi': { type: 'text/html', data } }), valid);
  assert.deepEqual(r.entries.map(([k]) => k), ['story-lion-mouse-1_hi']);
  assert.equal(r.entries[0][1].type, 'audio/webm');
  assert.ok(readClipsFile(file({}), valid).error);
  assert.ok(readClipsFile({ app: 'khel-khel-mein', version: 1, data: {} }, valid).error, 'a backup file is not a recordings file');
  assert.ok(readClipsFile(null, valid).error);
});

test('the story voice pack is cached on its own and kept across app updates', () => {
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(sw, /const VOICES = 'kkm-voices'/);
  assert.match(sw, /k !== VERSION && k !== VOICES/);
  assert.match(sw, /'js\/voicepack\.js'/);
  assert.ok(!/'voices\//.test(sw), 'the pack is not part of the first download');
});

test('the voice pack in voices/ matches its index, and every file is a line the app says', async () => {
  const { voiceLines } = await import('../js/logic.js');
  const { comicVoiceLines, storyRadioVoiceLines } = await import('../js/shows.js');
  const { castVoiceName } = await import('../js/castvoices.js');
  const dir = new URL('../voices/', import.meta.url);
  const idx = JSON.parse(readFileSync(new URL('index.json', dir), 'utf8'));
  const lines = new Set([...voiceLines(content), ...comicVoiceLines(content, castVoiceName), ...storyRadioVoiceLines(content)].map((l) => l.key));
  for (const key of Object.keys(idx.files)) assert.ok(lines.has(key), `${key} is a line the app says`);
  // the recordings are downloaded as bundles: every one is in exactly one bundle, at the right size,
  // and each bundle is the size the index says
  const inBundle = new Map();
  for (const p of idx.packs) {
    assert.equal(readFileSync(new URL(p.file, dir)).length, p.bytes, p.file);
    assert.ok(p.bytes <= 8 * 1048576, `${p.file} is small enough to fetch in one go`);
    for (const [key, off, len] of p.items) {
      assert.ok(!inBundle.has(key), `${key} is in one bundle`);
      inBundle.set(key, len);
      assert.ok(off + len <= p.bytes);
    }
  }
  for (const [key, bytes] of Object.entries(idx.files)) assert.equal(inBundle.get(key), bytes, key);
  // every line the app can say has its recording: nothing is left to the device voice but what is made up on the spot
  for (const k of lines) assert.ok(idx.files[k], `${k} is recorded`);
  assert.ok(idx.voices.hi && idx.voices.en);
});

test('the app’s own prompts, words and guides’ jokes are in the voice pack too, read in pieces around a word', async () => {
  const { appVoiceLines, phraseParts } = await import('../js/logic.js');
  const { phraseSegs } = await import('../js/audio.js');
  const lines = appVoiceLines(content);
  const keys = new Set(lines.map((l) => l.key));
  assert.ok(keys.has('phrase-great_hi') && keys.has('cow_hi') && keys.has('cow_en') && keys.has('mascot-1_hi'));
  assert.deepEqual(phraseParts('यह {w} है'), ['यह', 'है']);
  assert.deepEqual(phraseParts('{w}?'), []);
  assert.ok(keys.has('phrase-thisIs-1_hi') && keys.has('phrase-thisIs-2_hi'));
  // with the word recorded, "यह {w} है" plays three recordings: the piece, the word, the piece
  const cow = [{ text: 'गाय', lang: 'hi', clipKey: 'cow_hi', file: 'x.mp3' }];
  const segs = phraseSegs(content.phrases.thisIs, 'thisIs', 'hi', () => cow, 'गाय');
  assert.deepEqual(segs.map((x) => x.clipKey), ['phrase-thisIs-1_hi', 'cow_hi', 'phrase-thisIs-2_hi']);
  for (const x of segs) assert.ok(keys.has(x.clipKey), x.clipKey);
});

test('every comic character has their own recorded voice, and lesson lines are named after their text', async () => {
  const { comicVoiceLines } = await import('../js/shows.js');
  const { CAST_VOICES, castVoiceName } = await import('../js/castvoices.js');
  const { textKey, lessonVoiceLines } = await import('../js/logic.js');
  for (const c of content.comics) for (const p of c.panels) for (const b of p.say || []) assert.ok(CAST_VOICES[c.parts?.[b.who]?.look || b.who], `${c.id}: ${b.who} has a voice`);
  const lines = comicVoiceLines(content, castVoiceName);
  assert.ok(lines.some((l) => l.voiceName === 'hi-IN-Chirp3-HD-Algenib'), 'Pappu the wrestler booms');
  assert.ok(lines.filter((l) => !l.voiceName).length > 100, 'the narrator reads captions and names');
  // the same words in two voices are two recordings; the key ignores extra spaces
  assert.notEqual(textKey('hi.pappu', 'हाँ!'), textKey('hi.mishti', 'हाँ!'));
  assert.equal(textKey('hi', ' नमस्ते   दोस्त '), textKey('hi', 'नमस्ते दोस्त'));
  // lessons: letters, a barakhadi syllable, a grammar rule and a quiz question are all there
  const lesson = lessonVoiceLines(content);
  const keys = new Set(lesson.map((l) => l.key));
  assert.ok(keys.has('hc-ka') && keys.has(textKey('hi', 'की')));
  const g = Object.values(content.grammar)[0];
  assert.ok(keys.has(textKey('hi', g.learn[0].text.replace(/[[\]]/g, ''))), 'grammar rule');
  const bank = Object.values(content.quizzes)[0];
  assert.ok(keys.has(textKey('hi', bank.questions[0].hi)), 'quiz question');
  // a line in only one grade's lessons downloads with that grade; shared ones come with every grade
  assert.ok(lesson.some((l) => l.level === 'grade7') && lesson.some((l) => !l.level));
});

test('32 more Kindergarten stories to listen to, in four sets in Vehicle Town', () => {
  const ids = content.stories.filter((s) => s.id.startsWith('k2-')).map((s) => s.id);
  assert.equal(ids.length, 32);
  const town = content.worlds.find((w) => w.id === 'town');
  const linked = worldLessons(town).filter((l) => l.game === 'story').map((l) => l.config.story);
  for (const id of ids) {
    const s = story(id);
    assert.equal(s.level, 'kg', id);
    assert.ok(linked.includes(id), `Vehicle Town opens ${id}`);
    assert.ok(s.pages.length >= 7 && s.pages.length <= 8, `${id}: ${s.pages.length} pages`);
    for (const p of s.pages) {
      assert.ok(words(p.hi) <= 10, `${id}: "${p.hi}" is short enough to follow by ear`);
      assert.ok(pictureExists(content.words[p.word]?.picture), `${id}: ${p.word}`);
    }
    assert.equal(s.questions.length, 2, id);
    for (const q of s.questions) assert.ok(!q.text && new Set(q.options).size === 3 && q.options.includes(q.answer) && q.options.every((o) => content.words[o]), id);
    assert.ok(s.moral?.hi && s.moral.en, id);
  }
  for (const u of ['k-safar', 'k-janwar', 'k-tyohar', 'k-dadi']) assert.equal(town.units.find((x) => x.id === u)?.lessons.length, 8, u);
});

test('a grade downloads in a few bundles, and only the ones it is missing', () => {
  const idx = JSON.parse(readFileSync(new URL('../voices/index.json', import.meta.url), 'utf8'));
  const kg = packFiles(idx, ['toddler', 'kg']);
  const bundles = bundlesFor(idx, kg);
  assert.ok(bundles.length <= 10, `${bundles.length} bundles for Kindergarten, not ${kg.length} files`);
  assert.ok(bundles.every((p) => p.level === null || ['toddler', 'kg'].includes(p.level)));
  // everything already saved: nothing to fetch; one bundle's worth saved: that bundle is skipped
  assert.equal(bundlesFor(idx, kg, new Set(kg.map((f) => f.key))).length, 0);
  const first = new Set(bundles[0].items.map(([k]) => k));
  assert.equal(bundlesFor(idx, kg, first).length, bundles.length - 1);
  const g8 = bundlesFor(idx, packFiles(idx, ['grade7', 'grade8']));
  assert.ok(g8.length <= 25, `${g8.length} bundles for Grades 7 and 8`);
});

test('stories are never locked, and the youngest grade’s library includes the grade above', async () => {
  const { isUnlocked } = await import('../js/curriculum.js');
  const town = content.worlds.find((w) => w.id === 'town');
  const fresh = normalizeProgress(null, content);
  // with no stars at all, every story lesson in Vehicle Town is open (other lessons still unlock in turn)
  const lessons = worldLessons(town);
  for (const l of lessons.filter((x) => x.game === 'story')) assert.ok(isUnlocked(fresh, town, l.id), l.id);
  const notStory = lessons.findIndex((l, i) => i > 0 && l.game !== 'story');
  assert.equal(isUnlocked(fresh, town, lessons[notStory].id), false);
  // Story radio and the library: a toddler hears and sees Kindergarten's stories too
  const screens = readFileSync(new URL('../js/screens.js', import.meta.url), 'utf8');
  assert.match(screens, /i > 0 \? order\.slice\(i - 1, i \+ 1\) : order\.slice\(0, 2\)/);
  // the radio shows each page as its moving scene
  const shows = readFileSync(new URL('../js/shows.js', import.meta.url), 'utf8');
  assert.match(shows, /showPage\(story\.pages\[st\.page\]\)/);
  assert.equal(normalizeSettings({ radioDark: true }, content).radioDark, true);
});

test('voices start at once: an exact lookup, fetched ahead, trimmed, and short pauses', () => {
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  // ignoreSearch makes the browser look through every recording; voices are found by their exact address
  const voiceLine = sw.split('\n').find((l) => l.includes('caches.open(VOICES)'));
  assert.ok(voiceLine && !voiceLine.includes('ignoreSearch'), 'voices: exact match');
  const audio = readFileSync(new URL('../js/audio.js', import.meta.url), 'utf8');
  assert.match(audio, /export function preload\(segs\)/);
  assert.match(audio, /stop\(\);\n  preload\(segments\);/, 'a sequence fetches all its recordings at once');
  assert.match(audio, /'vt-voice'/, 'the read-along hears when the voice really starts');
  const story = readFileSync(new URL('../js/games/story.js', import.meta.url), 'utf8');
  assert.match(story, /\{ pause: 200 \}/);
  assert.match(story, /ctx\.preload\?\.\(/, 'the next page gets ready while this one plays');
  // the second edition of the recordings: silence trimmed, silent short lines fixed
  const idx = JSON.parse(readFileSync(new URL('../voices/index.json', import.meta.url), 'utf8'));
  assert.equal(idx.audioVersion, 2);
  const make = readFileSync(new URL('../tools/make-voices.mjs', import.meta.url), 'utf8');
  assert.match(make, /speakChecked/, 'new recordings are checked for silence');
  assert.match(make, /trimFile/, 'and trimmed');
});

test('little ones hear the answers, and right answers add a synonym', async () => {
  const { synLine, voiceLines } = await import('../js/logic.js');
  const elephant = content.words.elephant;
  assert.equal(synLine(elephant), 'हाथी, यानी गज।');
  assert.equal(synLine(content.words.ant), null);
  const syn = Object.values(content.words).filter((w) => w.syn);
  assert.ok(syn.length >= 30);
  for (const w of syn) assert.notEqual(w.syn, w.hi);
  // every synonym line and every written story answer has its recording
  const keys = new Set(voiceLines(content).map((l) => l.key));
  const { textKey } = await import('../js/logic.js');
  for (const w of syn) assert.ok(keys.has(textKey('hi', synLine(w))), w.hi);
  const kit = readFileSync(new URL('../js/games/kit.js', import.meta.url), 'utf8');
  assert.match(kit, /export async function readChoices/);
  assert.match(kit, /\['toddler', 'kg', 'grade1'\]/);
  for (const g of ['rhyme', 'story', 'quiz']) assert.match(readFileSync(new URL(`../js/games/${g}.js`, import.meta.url), 'utf8'), /readChoices\(/, g);
});
