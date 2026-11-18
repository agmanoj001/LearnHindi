// Round 27: the remaining items of roadmap sections 1, 3, 8 and 9.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as L from '../js/logic.js';
import { changesSince, changeDate } from '../js/changes.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const content = JSON.parse(read('content.json'));
const DEVANAGARI = /[ऀ-ॿ]/;

test('3.3 easier reading: off by default, saved per child, and styled for every reading surface', () => {
  assert.equal(L.defaultSettings(content).readingComfort, false);
  assert.equal(L.normalizeSettings({ readingComfort: true }, content).readingComfort, true);
  assert.equal(L.normalizeSettings({ readingComfort: 'yes' }, content).readingComfort, false);
  const css = read('styles.css');
  for (const c of ['story-page', 'story-line', 'comic-bubble', 'gr-rule']) assert.match(css, new RegExp(`\\.reading-comfort[^{]*\\.${c}`), c);
  // Devanagari is never letter-spaced (it would break the line along the top of each word)
  const block = css.slice(css.indexOf('easier reading (roadmap 3.3)'));
  for (const m of block.matchAll(/([^{}]+)\{[^}]*letter-spacing/g)) assert.match(m[1], /\.en|:lang\(en\)/, `letter-spacing only for English: ${m[1].trim()}`);
});

test("8.6 what's new: changes.json is newest first, matches the service worker, and is cached", () => {
  const { changes } = JSON.parse(read('changes.json'));
  const sw = read('sw.js');
  const version = sw.match(/const VERSION = '([^']+)'/)[1];
  assert.equal(changes[0].version, version, 'the newest entry in changes.json is the version in sw.js: add a line for what this version brings');
  assert.equal(new Set(changes.map((c) => c.version)).size, changes.length, 'one entry per version');
  for (const c of changes) {
    assert.match(c.date, /^\d{4}-\d{2}-\d{2}$/, c.version);
    assert.match(c.hi, DEVANAGARI, c.version);
    assert.ok(c.en, c.version);
    assert.ok(c.items?.length, c.version);
    for (const i of c.items) assert.ok(DEVANAGARI.test(i.hi) && i.en, `${c.version}: ${i.en}`);
  }
  for (let k = 1; k < changes.length; k++) assert.ok(changes[k - 1].date >= changes[k].date, 'newest first');
  assert.match(sw, /'changes\.json'/);
  assert.match(sw, /'js\/changes\.js'/);
});

test("8.6 what's new: the bar shows what is newer than the running version", () => {
  const cs = [{ version: 'v3' }, { version: 'v2' }, { version: 'v1' }];
  assert.deepEqual(changesSince(cs, 'v3'), []);
  assert.deepEqual(changesSince(cs, 'v1').map((c) => c.version), ['v3', 'v2']);
  assert.deepEqual(changesSince(cs, 'v0').map((c) => c.version), ['v3']);
  assert.deepEqual(changesSince(cs, null).map((c) => c.version), ['v3']);
  assert.match(changeDate('2026-11-18'), /2026/);
  assert.equal(changeDate('not a date'), 'not a date');
  const app = read('js/app.js');
  assert.match(app, /changesSince\(await loadChanges\(\), state\.runningVersion\)/);
  assert.match(app, /class: 'update-more'/);
  assert.match(read('js/parent.js'), /whatsNewSection\(api\)/);
});

test("8.4 store rules: a grown-up question after the hold, a security policy that keeps the app to its own site, a privacy statement", async () => {
  const { grownUpQuestion } = await import('../js/screens.js');
  let seed = 1;
  const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 200; i++) {
    const q = grownUpQuestion(rng, content.numbers);
    assert.equal(q.answer, q.a + q.b);
    assert.ok(q.a >= 11 && q.a <= 29 && q.b >= 3 && q.b <= 9);
    // written in words, never digits: a young child can't read it
    assert.doesNotMatch(q.en, /\d/);
    assert.doesNotMatch(q.hi, /\d/);
    assert.match(q.hi, DEVANAGARI);
  }
  const screens = read('js/screens.js');
  assert.match(screens, /grownUpCheck\(api, onDone\)/, 'the press-and-hold gate asks the question before opening');

  // the security policy: only the app's own site, and its hash matches the inline script
  const html = read('index.html');
  const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)?.[1];
  assert.ok(csp, 'index.html has a Content-Security-Policy');
  for (const d of ["default-src 'self'", "connect-src 'self'", "object-src 'none'", "frame-src 'none'", "form-action 'none'"]) assert.ok(csp.includes(d), d);
  const { createHash } = await import('node:crypto');
  for (const [, body] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    const hash = `sha256-${createHash('sha256').update(body).digest('base64')}`;
    assert.ok(csp.includes(hash), `the inline script changed: put '${hash}' in the Content-Security-Policy in index.html`);
  }

  // no links out of the app, and no address outside the app's own site anywhere in the code
  const { readdirSync } = await import('node:fs');
  const files = [...readdirSync(new URL('../js/', import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => `js/${f}`), ...readdirSync(new URL('../js/games/', import.meta.url)).map((f) => `js/games/${f}`)];
  for (const f of files) {
    const code = read(f).replace(/\/\/.*$/gm, '').replace(/http:\/\/www\.w3\.org\/[\w/.]+/g, '');
    assert.doesNotMatch(code, /https?:\/\//, `${f} has an address outside the app`);
    assert.doesNotMatch(code, /window\.open\(|target: '_blank'/, `${f} opens something outside the app`);
  }

  assert.match(read('js/parent.js'), /privacySection\(\)/);
  assert.match(read('docs/PRIVACY.md'), /nothing about a child ever leaves the device/i);
});

test('3.4 understanding stories: every question has a type, answers are counted by type, and stories read alone are kept', () => {
  const counts = { who: 0, what: 0, why: 0 };
  for (const s of content.stories) for (const q of s.questions) counts[L.questionType(q)]++;
  assert.ok(counts.who > 20 && counts.what > 20 && counts.why > 10, JSON.stringify(counts));
  assert.equal(L.questionType({ en: 'Why did the pot break?' }), 'why');
  assert.equal(L.questionType({ en: 'How did the crow get the water?' }), 'why');
  assert.equal(L.questionType({ en: 'How many ducks were there?' }), 'what');
  assert.equal(L.questionType({ en: 'Whom did the lion see?' }), 'who');
  assert.equal(L.questionType({ en: 'Where did the snail go?' }), 'what');

  let c = {};
  for (const ok of [true, true, false]) c = L.recordComprehension(c, 'who', ok);
  for (const ok of [true, false, false, false]) c = L.recordComprehension(c, 'why', ok);
  assert.deepEqual(c.who, { seen: 3, first: 2 });
  assert.deepEqual(L.recordComprehension(c, 'nope', true), c);
  const sum = L.comprehensionSummary({ comprehension: c });
  assert.equal(sum.total, 7);
  assert.equal(sum.rows.find((r) => r.type === 'why').pct, 25);
  assert.equal(sum.focus, 'why', 'the weakest type is the one to talk about');
  assert.equal(L.comprehensionSummary({ comprehension: { who: { seen: 3, first: 3 } } }).focus, null, 'one type alone is not enough to compare');

  // saved and restored safely
  const p = L.normalizeProgress({ comprehension: { who: { seen: 4, first: 9 }, junk: { seen: 1 } }, readAlone: { 'thirsty-crow': 2, 'bad id!': 3, x: -1 } }, content);
  assert.deepEqual(p.comprehension, { who: { seen: 4, first: 4 } });
  assert.deepEqual(p.readAlone, { 'thirsty-crow': 2 });
  assert.deepEqual(L.defaultProgress(content).readAlone, {});
  const list = L.readAloneList({ readAlone: { 'thirsty-crow': 2, 'lion-mouse': 5, gone: 1 } }, content);
  assert.deepEqual(list.map((r) => r.story.id), ['lion-mouse', 'thirsty-crow']);

  const story = read('js/games/story.js');
  assert.match(story, /ctx\.comprehend\?\.\(questionType\(q\), right\.firstTry\)/);
  assert.match(story, /if \(selfRead\) ctx\.readAlone\?\.\(story\.id\)/);
  assert.match(read('js/parent.js'), /storiesView\(api\)/);
});

test('8.7 play insights: time, the hardest and most played games, and what is read again, all worked out on the device', async () => {
  const { usageInsight, GAME_NAMES, isoDay } = await import('../js/curriculum.js');
  const games = new Set(content.worlds.flatMap((w) => w.units.flatMap((u) => u.lessons.map((l) => l.game))));
  for (const g of games) assert.ok(GAME_NAMES[g]?.hi && GAME_NAMES[g]?.en, `GAME_NAMES has no name for the "${g}" game`);
  const lessons = content.worlds.flatMap((w) => w.units.flatMap((u) => u.lessons));
  const story = lessons.find((l) => l.game === 'story');
  const matra = lessons.find((l) => l.game === 'matra');
  const math = lessons.find((l) => l.game === 'math');
  const now = new Date(2026, 10, 18, 12).getTime();
  const day = (k) => isoDay(new Date(2026, 10, 18 - k));
  const progress = {
    time: { [day(0)]: 600, [day(3)]: 1200, [day(20)]: 9000 },
    lessons: { [story.id]: { plays: 4, recent: 90 }, [matra.id]: { plays: 3, recent: 40 }, [math.id]: { plays: 1, recent: 10 } },
  };
  const u = usageInsight(progress, content, now);
  assert.deepEqual([u.played, u.total, u.perDay, u.longest], [2, 30, 15, 20], 'only the last two weeks count');
  assert.deepEqual(u.hard.map((g) => g.game), ['matra'], 'hard: played twice or more and under 70%');
  assert.equal(u.favourite[0].game, 'story');
  assert.equal(u.replayed[0].item.id, story.config.story);
  assert.equal(u.replayed[0].plays, 4);
  assert.deepEqual(usageInsight({}, content, now).hard, []);
  assert.match(read('js/parent.js'), /insightView\(api\)/);
});

test('1.5 read it aloud and hear yourself: off until a grown-up turns it on, recorded per page, kept on the device', async () => {
  assert.equal(L.defaultSettings(content).readAloud, false);
  assert.equal(L.normalizeSettings({ readAloud: true }, content).readAloud, true);
  const story = read('js/games/story.js');
  // only on pages the child reads alone, and only when a grown-up turned it on
  assert.match(story, /selfRead && ctx\.settings\.readAloud \? readBack\(/);
  // the child's recording first, then the narrator's (the Google voice for the page)
  assert.match(story, /await playMine\(\);[\s\S]{0,120}ctx\.playSegs\(narration\(\)\)/);
  // recording stops when the page turns
  assert.match(story, /readBackBar\?\.stop\(\)/);
  const { readAloudKey } = await import('../js/games/story.js');
  assert.equal(readAloudKey('p1', 'thirsty-crow', 3), 'readaloud:p1:thirsty-crow:3');
  const parent = read('js/parent.js');
  assert.match(parent, /toggle\(\s*'Read aloud and hear yourself'/);
  assert.match(parent, /readAloudView\(api\)/);
  assert.match(read('docs/PRIVACY.md'), /reading a page aloud/);
});

test('8.3 accessibility: right and wrong by shape, a left-handed layout, 48 px chips, and the browser check enforces it', () => {
  const kit = read('js/games/kit.js');
  assert.match(kit, /class: 'answer-mark yes'[^)]*text: '✓'/);
  assert.match(kit, /class: 'answer-mark no'[^)]*text: '✕'/);
  const css = read('styles.css');
  assert.match(css, /\.answer-mark\.yes \{\s*background: #1f7a4d/);
  assert.match(css, /\.answer-mark\.no \{\s*background: #b42318/);
  assert.match(css, /\.tag-filter \{\s*flex: none;\s*min-height: 48px/);
  assert.match(css, /\.left-handed \.game-head \{\s*flex-direction: row-reverse/);
  assert.match(css, /\.left-handed \.mascot-corner/);
  assert.equal(L.defaultSettings(content).leftHanded, false);
  assert.equal(L.normalizeSettings({ leftHanded: true }, content).leftHanded, true);
  assert.match(read('js/parent.js'), /toggle\(\s*'Left-handed layout'/);
  const bc = read('tools/browser-check.mjs');
  for (const t of ['tap target too small', 'no name for a screen reader', 'animates forever with reduced motion on']) assert.ok(bc.includes(t), t);
});

test('8.8 content checks: every Hindi string follows the word rules, and every picture the art rules', async () => {
  const { checkText, checkArt, hindiStrings } = await import('../tools/content-check.mjs');
  assert.ok(hindiStrings(content).length > 15000, 'the check reads all the Hindi in the app');
  const text = checkText(content);
  assert.deepEqual(text.problems, [], 'run "npm run check-content" for the full report');
  const art = await checkArt(content);
  assert.ok(art.pictures > 300);
  assert.deepEqual(art.problems, []);
  // the rules catch what they should
  const fake = { stories: [{ id: 'x', level: 'kg', title: { hi: 'वृक्ष के नीचे', en: '' }, pages: [{ hi: 'वह गयी |', en: '' }], questions: [], talk: [] }] };
  const found = checkText(fake).problems.join('\n');
  assert.match(found, /"वृक्ष" is a bookish word/);
  assert.match(found, /"गयी" is spelled "गई"/);
  assert.match(found, /"\|" used for the full stop/);
  // but not school words in brackets, synonyms after यानी, or abbreviations
  const fine = { stories: [{ id: 'y', level: 'grade3', title: { hi: 'उल्टे शब्द (विलोम)', en: '' }, pages: [{ hi: 'पेड़, यानी वृक्ष। डॉ. राव आए।', en: '' }], questions: [], talk: [] }] };
  assert.deepEqual(checkText(fine).problems, []);
});

test('3.2 low-end devices: a 2 GB phone starts with lighter animations, and the device check exists', async () => {
  const { lowMemoryDevice } = await import('../js/motion.js');
  assert.equal(lowMemoryDevice({ deviceMemory: 2 }), true);
  assert.equal(lowMemoryDevice({ deviceMemory: 1 }), true);
  assert.equal(lowMemoryDevice({ deviceMemory: 4 }), false);
  assert.equal(lowMemoryDevice({}), false, 'Safari reports no memory: decide by measuring instead');
  assert.equal(lowMemoryDevice(null), false);
  const tool = read('tools/device-check.mjs');
  assert.match(tool, /id: 'android-go'/);
  assert.match(tool, /id: 'old-ipad'/);
  assert.match(read('docs/DEVICES.md'), /Android Go/);
  // the two performance tools share one server, served as GitHub Pages serves the app
  assert.match(read('tools/perf-budget.mjs'), /startPagesServer/);
});

test('9.7 festival stories: a longer story for older children on the festival’s day, and Guru Nanak Jayanti', async () => {
  const { FESTIVALS, festStory, festivalNow } = await import('../js/festivals.js');
  for (const f of FESTIVALS.filter((x) => x.more)) {
    const s = content.stories.find((x) => x.id === f.more);
    assert.ok(s && s.level !== 'kg' && s.talk.length === 5, `${f.id}: ${f.more}`);
    assert.equal(festStory(f, 'kg'), f.story);
    assert.equal(festStory(f, 'grade2'), f.more);
  }
  assert.equal(festStory(FESTIVALS.find((f) => f.id === 'holi'), 'grade3'), 'k2-holi', 'no longer story: the short one');
  assert.equal(festivalNow(new Date('2026-11-24T10:00:00').getTime()).festival.id, 'gurpurab');
  for (const id of ['fest-idgah', 'fest-sacha-sauda', 'fest-pahad-christmas', 'fest-lohri', 'fest-pongal', 'fest-mahabali']) assert.ok(content.stories.some((s) => s.id === id), id);
  assert.match(content.stories.find((s) => s.id === 'fest-idgah').source.hi, /प्रेमचंद/);
});

test('9.12 prose for Grades 7–8: six pieces a grade, each with a glossary whose words are on its pages and recorded', () => {
  const prose = content.stories.filter((s) => ['grade7', 'grade8'].includes(s.level));
  for (const level of ['grade7', 'grade8']) assert.equal(prose.filter((s) => s.level === level).length, 6, level);
  const lines = new Set(L.lessonVoiceLines(content).map((l) => l.key));
  for (const s of prose) {
    assert.ok(s.pages.length >= 12, `${s.id} is long enough to build reading stamina`);
    assert.ok(s.words.length >= 6 && s.questions.length >= 4, s.id);
    const tokens = new Set(s.pages.flatMap((p) => L.sentenceTokens(p.hi).map(L.glossToken)));
    for (const w of s.words) {
      assert.ok(tokens.has(w.hi), `${s.id}: ${w.hi} is on a page`);
      for (const t of [w.hi, L.glossLine(w)]) assert.ok(lines.has(L.textKey('hi', t)), `${s.id}: "${t}" is a voice line`);
    }
    // a retelling names its source; the diary and letter are written for the app, and the news report says it is made up
    if (!['diary', 'letter'].includes(s.kind)) assert.ok(s.source?.hi && s.source?.en, `${s.id} names its source`);
  }
  assert.match(prose.find((s) => s.kind === 'news').source.en, /made-up/);
  // every piece is a lesson in a Grade 7 or Grade 8 world
  const lessonStories = new Set(content.worlds.filter((w) => ['grade7', 'grade8'].includes(w.level)).flatMap((w) => w.units.flatMap((u) => u.lessons.map((l) => l.config?.story))));
  for (const s of prose) assert.ok(lessonStories.has(s.id), `${s.id} is on a map`);
  // Premchand's five and Tagore's two, as the roadmap names them
  const sources = prose.map((s) => s.source?.hi || '').join(' ');
  for (const t of ['ईदगाह', 'दो बैलों की कथा', 'बड़े भाई साहब', 'पंच परमेश्वर', 'नमक का दारोगा', 'काबुलीवाला', 'तोता-कहानी']) assert.ok(sources.includes(t), t);
});
