// Roadmap section 7 (engagement), built one item at a time, top to bottom.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeProgress, defaultProgress } from '../js/logic.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const css = read('styles.css');

// ---- 7.2 favourites and "read again" ----
import { toggleFav, favStories, storyWorld, isFav, FAV_MAX, HOME_FAVS } from '../js/favourites.js';

test('a story is kept as a favourite with a heart, newest first, and let go with another tap', () => {
  let favs = [];
  favs = toggleFav(favs, 'a');
  favs = toggleFav(favs, 'b');
  assert.deepEqual(favs, ['b', 'a']);
  favs = toggleFav(favs, 'a');
  assert.deepEqual(favs, ['b']);
  assert.equal(toggleFav(Array.from({ length: FAV_MAX }, (_, i) => `s${i}`), 'new').length, FAV_MAX);
  assert.ok(isFav({ favs: ['b'] }, 'b'));
  assert.ok(!isFav({}, 'b'));
});

test('favourites are kept cleanly with the progress, and open from the home screen in the right library', () => {
  const [s1, s2] = content.stories;
  assert.deepEqual(defaultProgress(content).favs, []);
  const p = normalizeProgress({ favs: [s2.id, 'no-such-story', s1.id, s2.id, 7] }, content);
  assert.deepEqual(p.favs, [s2.id, s1.id]);
  assert.deepEqual(favStories(content, p).map((s) => s.id), [s2.id, s1.id]);
  for (const s of content.stories) {
    const w = storyWorld(content, { level: 'kg' }, s);
    assert.ok(w, s.id);
    assert.notEqual(w.subject, 'math', s.id);
    assert.equal(w.lang === 'en' ? 'en' : 'hi', s.lang === 'en' ? 'en' : 'hi', `${s.id} opens in a ${s.lang || 'hi'} library`);
  }
  assert.equal(HOME_FAVS, 4);
});

test('the heart is on every library book and after a story; the home screen has "Read again"', () => {
  const screens = read('js/screens.js');
  assert.match(screens, /el\('div', \{ class: `book-wrap\$\{hero \? ' next-book-wrap' : ''\}` \}, \[b, heartButton\(api, s, \{ cls: 'on-book' \}\)\]\)/, 'a sibling of the book button, never inside it');
  assert.match(screens, /heartButton\(api, talkStory, \{ cls: 'big' \}\)/);
  assert.match(screens, /readAgain\(api\),/);
  assert.match(read('js/favourites.js'), /api\.say\('favAdded'\)/);
  assert.ok(content.phrases.favAdded?.hi && content.phrases.favAdded?.en);
  assert.match(css, /\.book-wrap\.next-book-wrap \{\s*grid-column: 1 \/ -1;/);
  assert.match(read('sw.js'), /'js\/favourites\.js'/);
});

// ---- 7.3 Story radio: sleep timer, picture tiles, play again ----
import { SLEEP_STEPS, nextSleep, sleepLabel } from '../js/shows.js';

test('the sleep timer goes off, end of this story, 10, 20, 30 minutes, and round again', () => {
  assert.deepEqual(SLEEP_STEPS, [0, 'story', 10, 20, 30]);
  let m = 0;
  const seen = [];
  for (let i = 0; i < 6; i++) seen.push((m = nextSleep(m)));
  assert.deepEqual(seen, ['story', 10, 20, 30, 0, 'story']);
  assert.deepEqual(sleepLabel(0), { hi: 'बंद', en: 'Off' });
  assert.deepEqual(sleepLabel('story'), { hi: 'यह कहानी', en: 'This story' });
  assert.deepEqual(sleepLabel(20, 19 * 60000 + 1), { hi: '20 मिनट', en: '20 min' }, 'rounds up');
  assert.deepEqual(sleepLabel(10, 5), { hi: '1 मिनट', en: '1 min' }, 'never 0 minutes while still running');
});

test('Story radio can pick a story from picture tiles, play one again, and say good night', () => {
  const shows = read('js/shows.js');
  assert.match(shows, /list\.map\(\(s, i\) => \{[\s\S]*class: `radio-tile\$\{i === index \? ' now' : ''\}`/);
  assert.match(shows, /if \(again\) \{\s*again = false;\s*continue; \/\/ the same story from the start/);
  assert.match(shows, /if \(sleepMode === 'story'\) \{\s*asleep = true;/);
  assert.match(shows, /await api\.say\('radioGoodnight'\)/);
  assert.match(shows, /lock\?\.release\?\.\(\)/, 'the phone may sleep');
  assert.ok(content.phrases.radioGoodnight?.hi && content.phrases.radioGoodnight?.en);
  assert.match(css, /\.radio-pick \{[^}]*position: fixed;[^}]*z-index: 30/);
});

// ---- 7.4 a gentle daily rhythm ----
import * as C from '../js/curriculum.js';

test("today's path has at most three steps, stays the same all day, and can be finished", () => {
  const worlds = content.worlds.filter((w) => w.level === 'grade1');
  const now = new Date(2026, 10, 17, 10).getTime();
  let p = defaultProgress(content);
  const first = C.stickyPlan(content, p, worlds, now);
  assert.ok(first.steps.length >= 1 && first.steps.length <= C.TODAY_STEPS);
  p = { ...p, today: first.today };
  // play each step: the plan doesn't move on to the next lesson, and the day finishes
  for (const s of first.steps) {
    assert.ok(!C.dayFinished(p, C.stickyPlan(content, p, worlds, now).steps, now));
    p = C.applyLessonResult(p, { world: s.world, lesson: s.lesson, collection: null, firstTry: 3, answered: 6, now }).progress;
    const again = C.stickyPlan(content, p, worlds, now);
    assert.deepEqual(again.steps.map((x) => x.lesson.id), first.steps.map((x) => x.lesson.id), 'the same path all day');
    assert.equal(again.today, p.today, 'nothing new to save');
  }
  assert.ok(C.dayFinished(p, C.stickyPlan(content, p, worlds, now).steps, now));
  // tomorrow is a new path
  const tomorrow = C.stickyPlan(content, p, worlds, now + 86400000);
  assert.notEqual(tomorrow.today.day, p.today.day);
  // the saved path is kept cleanly
  assert.deepEqual(normalizeProgress({ today: first.today }, content).today, first.today);
  assert.equal(normalizeProgress({ today: { day: 'soon', steps: [] } }, content).today, undefined);
});

test('a sticker for each finished day, on a Monday-to-Sunday trail', () => {
  const tue = new Date(2026, 10, 17, 9).getTime();
  const week = C.weekDays(tue);
  assert.equal(week.length, 7);
  assert.equal(week[0], '2026-11-16', 'Monday');
  assert.equal(week[6], '2026-11-22', 'Sunday');
  assert.deepEqual(C.weekDays(new Date(2026, 10, 22, 20).getTime()), week, 'Sunday is the end of the same week');
  // the day's sticker: a picture word, the same all day, and it changes from day to day
  for (const id of C.TRAIL_STICKERS) assert.ok(content.words[id], id);
  assert.equal(C.trailSticker('2026-11-17'), C.trailSticker('2026-11-17'));
  assert.ok(new Set(week.map(C.trailSticker)).size >= 4);
  // finished once a day; a full week when every day has its sticker
  const steps = [{ done: true }, { done: true }];
  assert.ok(C.dayFinished({ trail: {} }, steps, tue));
  assert.ok(!C.dayFinished({ trail: { '2026-11-17': 'sun' } }, steps, tue), 'not twice');
  assert.ok(!C.dayFinished({ trail: {} }, [{ done: true }, { done: false }], tue));
  assert.ok(C.weekFull(Object.fromEntries(week.map((d) => [d, 'sun'])), tue));
  assert.ok(!C.weekFull({ [week[0]]: 'sun' }, tue));
  // kept cleanly with the progress
  const p = normalizeProgress({ trail: { '2026-11-16': 'star', bad: 'sun', '2026-11-17': 3 } }, content);
  assert.deepEqual(p.trail, { '2026-11-16': 'star' });
});

test('the home screen shows the trail and celebrates a finished day once', () => {
  const screens = read('js/screens.js');
  assert.match(screens, /const sticky = stickyPlan\(content, progress/);
  assert.match(screens, /if \(!filter && dayFinished\(progress, plan\)\)/);
  assert.match(screens, /await api\.say\(full \? 'weekDone' : 'dayDone'\)/);
  assert.equal((screens.match(/weekTrail\(api\),/g) || []).length, 2, 'on the today card and the simple home screen');
  for (const k of ['dayDone', 'weekDone']) assert.ok(content.phrases[k]?.hi && content.phrases[k]?.en, k);
});

// ---- 7.5 little rewards that aren't stars ----
import { REWARDS, REWARD_KINDS, unlockedRewards, newRewards, nextReward, styleFor } from '../js/rewards.js';
import { OUTFITS, headOf, setOutfit, mascotSvg, MASCOT_IDS } from '../js/mascot.js';
import { sfx } from '../js/sfx.js';
import { sceneSvg } from '../js/art-scenes.js';

test('stars unlock outfits, backgrounds and sounds in turn, and nothing is ever lost', () => {
  assert.equal(new Set(REWARDS.map((r) => r.id)).size, REWARDS.length);
  for (const k of REWARD_KINDS) assert.ok(REWARDS.filter((r) => r.kind === k).length >= 4, k);
  // in order of stars, the kinds taking turns
  REWARDS.forEach((r, i) => i && assert.ok(r.stars > REWARDS[i - 1].stars));
  assert.deepEqual(unlockedRewards(0), []);
  assert.deepEqual(unlockedRewards(45).map((r) => r.id), ['party-hat', 'garden', 'bell', 'crown']);
  assert.deepEqual(newRewards(59, 62).map((r) => r.id), ['ocean']);
  assert.deepEqual(newRewards(62, 62), []);
  assert.equal(nextReward(59).id, 'ocean');
  assert.equal(nextReward(1000), null);
  // what is chosen counts only if it is unlocked, and in its own kind
  assert.deepEqual(styleFor({ style: { outfit: 'crown', backdrop: 'space', sound: 'garden' } }, 50), { outfit: 'crown', backdrop: null, sound: null });
  assert.deepEqual(styleFor({}, 500), { outfit: null, backdrop: null, sound: null });
  assert.deepEqual(normalizeProgress({ style: { outfit: 'crown', backdrop: 7 } }, content).style, { outfit: 'crown', backdrop: null, sound: null });
});

test('every outfit fits on every guide, every background and sound exists', () => {
  for (const r of REWARDS.filter((x) => x.kind === 'outfit')) {
    assert.equal(typeof OUTFITS[r.id], 'function', r.id);
    setOutfit(r.id);
    for (const id of MASCOT_IDS) {
      const svg = mascotSvg(id);
      assert.match(svg, /class="m-outfit"/, `${id} wears ${r.id}`);
      assert.match(svg, /<\/g><\/svg>$/, 'inside the moving body');
      const h = headOf(mascotSvg(id, { plain: true }));
      assert.ok(h.top >= 0 && h.top < 60 && h.x > 0 && h.x < 120, `${id}'s head is found`);
    }
  }
  setOutfit(null);
  assert.doesNotMatch(mascotSvg('gappu'), /m-outfit/, 'no outfit: as drawn');
  for (const r of REWARDS.filter((x) => x.kind === 'backdrop')) assert.ok(sceneSvg(r.id).length > 500, r.id);
  for (const r of REWARDS.filter((x) => x.kind === 'sound')) assert.match(read('js/sfx.js'), new RegExp(`k === '${r.id}'`), r.id);
  assert.equal(typeof sfx.tick, 'function');
});

test('a new prize shows on the results screen; the wardrobe is a tap from home', () => {
  const app = read('js/app.js');
  assert.match(app, /rewards: newRewards\(totalStars\(before\), totalStars\(state\.progress\)\)/);
  assert.match(app, /setOutfit\(st\.outfit\);[\s\S]{0,120}sfx\.tapSound = giftSoundToday\(state\.progress\) \|\| st\.sound;/);
  assert.match(app, /case 'rewards':/);
  const screens = read('js/screens.js');
  assert.match(screens, /\.\.\.rewards\.map\(\(r\) => newPrizeCard\(api, r\)\)/);
  assert.match(screens, /prizesButton\(api\),/);
  assert.match(screens, /export function rewards\(api/);
  for (const k of ['newPrize', 'prizesHello']) assert.ok(content.phrases[k]?.hi && content.phrases[k]?.en, k);
  assert.match(read('sw.js'), /'js\/rewards\.js'/);
});

// ---- 7.7 sing-along rhymes ----
import { musicLevel } from '../js/sfx.js';
import { normalizeSettings, defaultSettings } from '../js/logic.js';

test('rhymes are sung along: a ball on each word, a clap, the guide dances, the tune stays under the words', () => {
  const story = read('js/games/story.js');
  assert.match(story, /const poem = story\.kind === 'poem' && !selfRead;/);
  assert.match(story, /let singing = poem && ctx\.settings\.singAlong !== false;/);
  assert.match(story, /readAlong\(textLines, page, langs, ctx\.settings\.voice\?\.rate \|\| 0\.9, \(w\) => \{/, 'the ball follows the read-along timing');
  assert.match(story, /ctx\.sfx\.clap\?\.\(\);\s*ctx\.react\?\.\(beat\+\+ % 4 === 3 \? 'dance' : 'clap'\)/);
  assert.match(story, /ctx\.setSetting\?\.\('singAlong', singing\)/);
  assert.match(read('js/app.js'), /react: \(kind\) => mascot\.react\(kind\)/);
  // singing: the music stays well up under the words; in a lesson it all but stops
  assert.ok(musicLevel('sing', true) > musicLevel('lesson', true) * 5);
  assert.ok(musicLevel('sing', true) < musicLevel('sing', false));
  assert.equal(defaultSettings(content).singAlong, true);
  assert.equal(normalizeSettings({ singAlong: false }, content).singAlong, false);
  // there are rhymes to sing, in Hindi and English
  const poems = content.stories.filter((s) => s.kind === 'poem');
  assert.ok(poems.length >= 30 && poems.some((s) => s.lang === 'en') && poems.some((s) => s.lang !== 'en'));
});

// ---- 7.8 make-your-own story ----
import { newBook, bookKey, booksOf, MYBOOKS_MAX, RECORD_MAX_MS } from '../js/mybooks.js';

test('a sticker picture and the child\'s voice become their own book', () => {
  const town = content.worlds.find((w) => w.id === 'town');
  const b = newBook(town, [{ id: 'car', x: 30.04, y: 70.26 }, { id: 'bus', x: 65, y: 80 }], 1700000000000);
  assert.match(b.id, /^b[0-9a-z]+$/);
  assert.equal(b.world, 'town');
  assert.deepEqual(b.stickers[0], { id: 'car', x: 30, y: 70.3 });
  assert.equal(bookKey('kid1', b.id), `mybook:kid1:${b.id}`, 'the voice is kept per child, on the device');
  // kept cleanly with the progress (the picture), the voice in the device's recordings store
  const p = normalizeProgress({ myBooks: [b, { id: 'bad id', world: 'town', stickers: [] }, { id: 'b1', world: 'town', stickers: [{ id: 'car', x: 500, y: -4 }] }] }, content);
  assert.equal(p.myBooks.length, 2);
  assert.deepEqual(p.myBooks[1].stickers[0], { id: 'car', x: 100, y: 0 });
  assert.deepEqual(defaultProgress(content).myBooks, []);
  assert.equal(booksOf(p, 'town').length, 2);
  assert.equal(MYBOOKS_MAX, 30);
  assert.equal(RECORD_MAX_MS, 60000, 'a story is at most a minute');
});

test('the sticker picture has a record button, and the library a "My books" shelf', () => {
  const screens = read('js/screens.js');
  assert.match(screens, /recordBook\(api, w, placed, artOf\)/);
  assert.match(screens, /myShelf\(api, \(\) => library\(api, w\)\)/);
  const books = read('js/mybooks.js');
  assert.match(books, /clips\.put\(bookKey\(/, 'the voice goes to the device recordings store');
  assert.doesNotMatch(books, /fetch\(|XMLHttpRequest|sendBeacon/, 'and nowhere else');
  for (const k of ['bookTell', 'bookSaved']) assert.ok(content.phrases[k]?.hi && content.phrases[k]?.en, k);
  assert.match(css, /\.mybook-actions \[hidden\] \{\s*display: none !important;/);
  assert.match(read('sw.js'), /'js\/mybooks\.js'/);
});

// ---- 7.9 an older child reads to a younger one ----
import { missionStories, missionLines, readerName, MISSION_LEVELS, READ_BY_KEY } from '../js/readfor.js';
import { storyVoiceLines } from '../js/logic.js';

test('the older child records a Kindergarten story, in the keys the story voice uses', () => {
  assert.deepEqual(MISSION_LEVELS, ['grade7', 'grade8']);
  const stories = missionStories(content);
  assert.ok(stories.length >= 20);
  assert.ok(stories.every((s) => s.level === 'kg' && s.lang !== 'en'));
  const s = stories.find((x) => x.moral) || stories[0];
  const lines = missionLines(content, s);
  // the title, every page, the lesson: in Hindi, in reading order, none of the questions
  assert.equal(lines.length, 1 + s.pages.length + (s.moral ? 1 : 0));
  assert.equal(lines[0].key, `story-${s.id}-title_hi`);
  assert.equal(lines[1].key, `story-${s.id}-1_hi`);
  assert.ok(lines.every((l) => l.lang === 'hi' && !/-q\d+_/.test(l.key)));
  // exactly the keys the story reader plays, so the story then plays in that voice
  const all = new Set(storyVoiceLines(content).map((l) => l.key));
  assert.ok(lines.every((l) => all.has(l.key)));
});

test('the story says who read it, and the mission is on the Grade 7–8 home screen', () => {
  assert.deepEqual(readerName('Asha'), { hi: 'Asha', en: 'Asha' });
  assert.deepEqual(readerName('  '), { hi: 'बड़े भाई-बहन', en: 'your big brother or sister' });
  assert.equal(READ_BY_KEY, 'vt.readBy');
  assert.match(read('js/games/story.js'), /readByRibbon\(story\.id\)/);
  assert.match(read('js/screens.js'), /if \(!MISSION_LEVELS\.includes\(api\.state\.settings\.level\)\) return null;/);
  assert.match(read('js/app.js'), /case 'readfor':/);
  const rf = read('js/readfor.js');
  assert.match(rf, /clips\.put\(key, new Blob/, 'recordings stay on the device');
  assert.doesNotMatch(rf, /fetch\(|XMLHttpRequest|sendBeacon/);
  for (const k of ['readForHello', 'readForHow', 'readForDone']) assert.ok(content.phrases[k]?.hi && content.phrases[k]?.en, k);
  assert.match(read('sw.js'), /'js\/readfor\.js'/);
});

// ---- 7.11 festivals on their day ----
import { FESTIVALS, festivalNow, festivalDay, festKey, FEST_BEFORE, FEST_AFTER } from '../js/festivals.js';
import { pictureExists } from '../js/art.js';

const at = (iso) => new Date(`${iso}T10:00:00`).getTime();

test('each festival comes near its day, from the device date alone', () => {
  assert.deepEqual(FESTIVALS.map((f) => f.id), ['diwali', 'holi', 'rakhi', 'eid', 'christmas', 'lohri', 'pongal', 'onam']);
  assert.equal(festivalNow(at('2026-11-08')).festival.id, 'diwali');
  assert.equal(festivalNow(at('2026-11-06')).diff, 2, 'two days to go');
  assert.equal(festivalNow(at('2026-11-10')).diff, -2, 'and two days after');
  assert.equal(festivalNow(at('2026-11-11')), null);
  assert.equal(festivalNow(at('2026-11-04')).festival.id, 'diwali', `${FEST_BEFORE} days before`);
  assert.equal(festivalNow(at('2026-12-25')).festival.id, 'christmas');
  assert.equal(festivalNow(at('2027-12-23')).festival.id, 'christmas', 'every year');
  assert.equal(festivalNow(at('2027-03-10')).festival.id, 'eid');
  assert.equal(festivalNow(at('2027-03-22')).festival.id, 'holi');
  // Lohri and Pongal are a day apart: the nearer one
  assert.equal(festivalNow(at('2027-01-13')).festival.id, 'lohri');
  assert.equal(festivalNow(at('2027-01-14')).festival.id, 'pongal');
  // across the new year
  assert.equal(festivalNow(at('2027-01-01')), null);
  assert.equal(festivalDay(FESTIVALS.find((f) => f.id === 'onam'), 2040), null, 'no date known: it doesn\'t come');
  assert.equal(festKey('holi', 2027), 'holi-2027');
  assert.equal(FEST_AFTER, 2);
});

test('every festival has its story, its sticker and its greeting', () => {
  for (const f of FESTIVALS) {
    const s = content.stories.find((x) => x.id === f.story);
    assert.ok(s, `${f.id}: story ${f.story}`);
    assert.equal(s.level, 'kg', `${f.id}: a story the youngest can hear`);
    assert.ok(content.words[f.sticker] && pictureExists(content.words[f.sticker].picture), `${f.id}: sticker ${f.sticker}`);
    assert.ok(content.phrases[`fest_${f.id}`]?.hi && content.phrases[`fest_${f.id}`]?.en, `${f.id}: greeting`);
    for (const md of [f.every, ...Object.values(f.dates || {})].filter(Boolean)) assert.match(md, /^(0[1-9]|1[0-2])-([0-2]\d|3[01])$/, `${f.id}: ${md}`);
  }
  assert.ok(content.phrases.festSticker?.hi);
  // the five new festival stories: moving scenes, questions, a lesson, talk prompts; in their own unit
  const unit = content.worlds.find((w) => w.id === 'town').units.find((u) => u.id === 'k-parv');
  assert.deepEqual(unit.lessons.map((l) => l.config.story), ['k3-eid', 'k3-christmas', 'k3-lohri', 'k3-pongal', 'k3-onam']);
  for (const id of ['k3-eid', 'k3-christmas', 'k3-lohri', 'k3-pongal', 'k3-onam']) {
    const s = content.stories.find((x) => x.id === id);
    assert.ok(s.pages.every((p) => p.act && content.words[p.word]), id);
    assert.equal(s.questions.length, 2);
    assert.equal(s.talk.length, 5);
  }
  // kept with the progress, and shown on the home screen and in the wardrobe
  assert.deepEqual(normalizeProgress({ festStickers: { 'diwali-2026': 'lamp', bad: 'x', 'holi-26': 'gulal' } }, content).festStickers, { 'diwali-2026': 'lamp' });
  const screens = read('js/screens.js');
  assert.match(screens, /festivalBanner\(api, \{/);
  assert.match(screens, /'त्योहार के स्टिकर'/);
  assert.match(read('sw.js'), /'js\/festivals\.js'/);
  assert.match(read('sw.js'), /'js\/art-festival\.js'/);
});

// ---- 7.12 a surprise each day ----
import { pickGift, giftDue, giftSoundToday, riddleIndexes, GIFT_KINDS, GIFT_SOUNDS } from '../js/surprise.js';

test('a gift box once a day, with one small thing that changes from day to day', () => {
  const day = (i) => `2026-12-${String(i + 1).padStart(2, '0')}`;
  const jokes = riddleIndexes(content.mascotLines);
  assert.ok(jokes.length >= 5 && jokes.every((i) => /\?/.test(content.mascotLines[i].hi)));
  const kinds = new Set();
  for (let i = 0; i < 20; i++) {
    const g = pickGift(day(i), { sticker: 'car', jokes });
    assert.ok(GIFT_KINDS.includes(g.kind));
    kinds.add(g.kind);
    assert.deepEqual(pickGift(day(i), { sticker: 'car', jokes }), g, 'the same all day');
    if (g.kind === 'sound') assert.ok(GIFT_SOUNDS.includes(g.value));
    if (g.kind === 'joke') assert.ok(jokes.includes(g.value));
  }
  assert.equal(kinds.size, 3, 'stickers, riddles and sounds all turn up');
  // no sticker left to find: something else
  for (let i = 0; i < 20; i++) assert.notEqual(pickGift(day(i), { sticker: null, jokes }).kind, 'sticker');
  // once a day
  const now = new Date(2026, 11, 3, 10).getTime();
  assert.ok(giftDue({}, now));
  assert.ok(!giftDue({ gift: { day: '2026-12-03', kind: 'joke', value: 1 } }, now));
  assert.ok(giftDue({ gift: { day: '2026-12-02', kind: 'joke', value: 1 } }, now));
  assert.equal(giftSoundToday({ gift: { day: '2026-12-03', kind: 'sound', value: 'boing' } }, now), 'boing');
  assert.equal(giftSoundToday({ gift: { day: '2026-12-02', kind: 'sound', value: 'boing' } }, now), null, 'just for the day');
  assert.deepEqual(normalizeProgress({ gift: { day: '2026-12-03', kind: 'sound', value: 'toot' } }, content).gift, { day: '2026-12-03', kind: 'sound', value: 'toot' });
  assert.equal(normalizeProgress({ gift: { day: 'x', kind: 'gold' } }, content).gift, undefined);
  for (const s of GIFT_SOUNDS) assert.match(read('js/sfx.js'), new RegExp(`'${s}'`));
  assert.match(read('js/screens.js'), /giftDue\(api\.state\.progress\) && lesson\.id !== 'together' \? giftBox\(/);
  for (const k of ['giftHere', 'giftSticker', 'giftSound']) assert.ok(content.phrases[k]?.hi, k);
});

// ---- 7.13 the "words I know" book ----
import { wordsKnown, KNOWN_AT } from '../js/wordbook.js';

test('a word goes in the book once it has been got right first time three times, in the word list order', () => {
  const ids = Object.keys(content.words).filter((id) => content.words[id].picture && !/^(comic|place|shape)-/.test(id));
  const [a, b, c] = ids;
  const stats = { [`w:${a}`]: { seen: 5, first: KNOWN_AT }, [`w:${b}`]: { seen: 9, first: KNOWN_AT - 1 }, [`w:${c}`]: { seen: 3, first: KNOWN_AT + 2 }, 'w:no-such-word': { seen: 4, first: 4 } };
  assert.deepEqual(wordsKnown({ stats }, content), [a, c]);
  assert.deepEqual(wordsKnown({}, content), []);
  assert.deepEqual(wordsKnown(undefined, content), []);
  // the comic cast and places are not words to learn
  const comic = Object.keys(content.words).find((id) => /^comic-/.test(id));
  if (comic) assert.deepEqual(wordsKnown({ stats: { [`w:${comic}`]: { seen: 3, first: 3 } } }, content), []);
});

test('the home screen has the count, and the book flips, says the word, and shows them all', () => {
  const app = read('js/app.js');
  const book = read('js/wordbook.js');
  assert.match(read('js/screens.js'), /wordsChip\(api\)/);
  assert.match(app, /case 'words':[\s\S]{0,60}wordBook\(api\)/);
  assert.match(book, /api\.sayItem\(/);
  assert.match(book, /words-grid/);
  assert.match(book, /pointerup/);
  assert.match(read('sw.js'), /'js\/wordbook\.js'/);
  for (const k of ['wordsHello', 'wordsEmpty']) assert.ok(content.phrases[k]?.hi && content.phrases[k]?.en, k);
  for (const c of ['.words-chip', '.words-page', '.words-grid', '.words-cell', '.words-empty']) assert.ok(css.includes(c), c);
});

// ---- 7.15 more Show time: a series of eight per guide, each ending on the question the next answers ----
import { seriesEpisodes, nextInSeries, seriesShelves, nextShow } from '../js/shows.js';
import { showLines, SHOW_MODELS } from '../js/logic.js';
import { validateContent } from '../js/validate.js';
import { THEMES } from '../js/art-scenes.js';

test('each guide has a series of 8 to 10 episodes, numbered in order, in its own world', () => {
  assert.deepEqual(
    content.showSeries.map((s) => s.id),
    ['gappu', 'chiku', 'tiko'],
  );
  for (const sr of content.showSeries) {
    const eps = seriesEpisodes(content, sr.id);
    assert.ok(eps.length >= 8 && eps.length <= 10, `${sr.id}: ${eps.length} episodes`);
    assert.deepEqual(
      eps.map((s) => s.ep),
      eps.map((_, i) => i + 1),
    );
    const world = content.worlds.find((w) => w.id === eps[0].world);
    assert.equal(world.mascot, sr.guide, `${sr.id} is in its guide's world`);
    assert.ok(eps.every((s) => s.world === eps[0].world && s.level === eps[0].level && s.lang === eps[0].lang));
    // a different lesson to play after each, and something new each time
    assert.ok(new Set(eps.map((s) => s.lesson)).size >= eps.length - 1, `${sr.id}: the episodes lead to different games`);
    assert.equal(new Set(eps.map((s) => s.title.en)).size, eps.length);
  }
});

test('every episode but the last ends on a question, and the next one opens with its answer', () => {
  for (const sr of content.showSeries) {
    const eps = seriesEpisodes(content, sr.id);
    eps.forEach((s, i) => {
      const last = i === eps.length - 1;
      assert.equal(!!s.next, !last, `${s.id} ${last ? 'ends the series' : 'ends on a question'}`);
      if (!last) assert.match(s.next.en, /\?/, `${s.id}: the next line is a question`);
      if (i > 0) assert.match(s.answer.en, /^Last time I asked/, `${s.id} answers the last question`);
      assert.equal(nextInSeries(content, s)?.id ?? null, last ? null : eps[i + 1].id);
      // the lines are spoken (recorded): the answer first, the question last
      const lines = showLines(s);
      if (s.answer) assert.equal(lines[0].en, s.answer.en);
      if (s.next) assert.equal(lines.at(-1).en, s.next.en);
    });
  }
  // the pilots keep their recorded lines: the question is added after them
  const pilot = content.shows.find((s) => s.id === 'gappu-bus');
  assert.equal(showLines(pilot)[0].key, 'show-gappu-bus-1');
  assert.equal(showLines(pilot)[0].hi, pilot.scenes[0].beats[0].hi);
});

test('Show time has a shelf per series, open at the episode to watch next', () => {
  const seen = { shows: { 'gappu-bus': { views: 1, last: '2026-11-01' }, 'gappu-cha': { views: 2, last: '2026-11-02' } } };
  const shelves = seriesShelves(content, 'kg', seen);
  assert.equal(shelves[0].info.id, 'gappu', "this grade's series first");
  assert.equal(shelves[0].upNext.id, 'gappu-ta');
  assert.equal(shelves[0].watched, 2);
  assert.equal(shelves.length, 3);
  // after a series ends, the next one to watch is from the same grade
  const all = Object.fromEntries(seriesEpisodes(content, 'tiko').map((s) => [s.id, { views: 1 }]));
  assert.equal(nextShow(content, 'grade1', 'tiko-shapes', { shows: all }).level, 'grade1');
  const shows = read('js/shows.js');
  assert.match(shows, /guideSays\(show\.answer/);
  assert.match(shows, /guideSays\(show\.next/);
  assert.match(shows, /recap-teaser/);
  for (const c of ['.series-row', '.show-ep', '.up-next', '.recap-teaser', '.show-bubble.teaser']) assert.ok(css.includes(c), c);
});

test('the validator keeps a series whole, and checks the maths pictures', () => {
  const opts = { themes: THEMES, mascots: MASCOT_IDS };
  const clean = validateContent(content, opts).errors.filter((e) => /show/i.test(e));
  assert.deepEqual(clean, []);
  const broken = structuredClone(content);
  broken.shows = broken.shows.filter((s) => s.id !== 'chiku-u'); // a gap at episode 4
  delete broken.shows.find((s) => s.id === 'gappu-ta').next;
  delete broken.shows.find((s) => s.id === 'tiko-time').answer;
  broken.shows.find((s) => s.id === 'tiko-tens').scenes[0].beats.push({ model: { kind: 'hologram' } });
  const errs = validateContent(broken, opts).errors.join('\n');
  assert.match(errs, /episode 4 is missing/);
  assert.match(errs, /gappu-ta" needs "next"/);
  assert.match(errs, /tiko-time" needs "answer"/);
  assert.match(errs, /model must be a maths picture/);
  assert.ok(SHOW_MODELS.includes('clock') && SHOW_MODELS.includes('base10'));
});
