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

// ---- 7.16 for Grades 7–8: the fun corner ----
import { ofTheDay, riddleOfDay, riddlesFor, riddleChoices, riddlesSolved, riddleDoneToday, fixedShuffle, CORNER_LEVELS, cornerLevel } from '../js/corner.js';
import { lessonVoiceLines } from '../js/logic.js';

test('a riddle a day for each grade, taking turns so a month passes before one comes back', () => {
  for (const level of CORNER_LEVELS) {
    const list = riddlesFor(content, level);
    assert.ok(list.length >= 30, `${level}: ${list.length} riddles`);
    // thirty days in a row: all different
    const month = Array.from({ length: list.length }, (_, i) => riddleOfDay(content, level, Date.UTC(2026, 10, 1 + i, 12)).id);
    assert.equal(new Set(month).size, list.length);
    // the same riddle all day long
    assert.equal(riddleOfDay(content, level, new Date(2026, 10, 17, 7).getTime()).id, riddleOfDay(content, level, new Date(2026, 10, 17, 21).getTime()).id);
  }
  assert.equal(cornerLevel('grade8'), 'grade8');
  assert.equal(cornerLevel('kg'), 'grade7');
  assert.equal(ofTheDay([], '2026-11-17'), null);
  assert.equal(ofTheDay(['a', 'b', 'c'], '2026-11-17'), ofTheDay(['a', 'b', 'c'], '2026-11-20'));
});

test('each riddle has three answers in a fixed mixed order, and why the answer fits; all are recorded lines', () => {
  const firsts = new Set();
  const voice = new Set(lessonVoiceLines(content).map((l) => l.text));
  for (const r of content.riddles) {
    const c = riddleChoices(r);
    assert.deepEqual([...c].sort(), [...r.options].sort());
    assert.deepEqual(riddleChoices(r), c, 'the same order every time');
    firsts.add(c[0] === r.answer);
    assert.ok(r.why.hi && r.why.en && r.en);
    for (const t of [r.hi, ...r.options]) assert.ok(voice.has(t.replace(/\s+/g, ' ').trim()), `${r.id}: "${t}" is a recorded line`);
  }
  assert.deepEqual([...firsts].sort(), [false, true], 'the answer is sometimes first, sometimes not');
  assert.deepEqual(fixedShuffle([1, 2, 3, 4], 'x'), fixedShuffle([1, 2, 3, 4], 'x'));
});

test('a solved riddle is kept with the progress, and the home screen has the corner for Grades 7–8 only', () => {
  const r = riddleOfDay(content, 'grade7', Date.UTC(2026, 10, 17, 12));
  const p = normalizeProgress({ riddles: { [r.id]: '2026-11-17', 'bad id!': '2026-11-17', other: 'yesterday' } }, content);
  assert.deepEqual(p.riddles, { [r.id]: '2026-11-17' });
  assert.equal(riddlesSolved(p), 1);
  assert.ok(riddleDoneToday(p, r, new Date(2026, 10, 17, 12).getTime()));
  assert.ok(!riddleDoneToday(p, r, new Date(2026, 10, 18, 12).getTime()));
  assert.match(read('js/screens.js'), /cornerButton\(api\)/);
  assert.match(read('js/app.js'), /case 'corner':[\s\S]{0,60}cornerScreen\(api\)/);
  assert.match(read('js/corner.js'), /if \(!CORNER_LEVELS\.includes\(settings\.level\)\) return null/);
  assert.match(read('sw.js'), /'js\/corner\.js'/);
  for (const k of ['cornerHello', 'riddleRight', 'riddleTry']) assert.ok(content.phrases[k]?.hi, k);
  for (const c of ['.corner-btn', '.riddle-card', '.riddle-opt', '.riddle-why']) assert.ok(css.includes(c), c);
});

import { idiomOfDay, idiomsFor, idiomChoices, idiomsLearnt, idiomDoneToday, castLine } from '../js/corner.js';
import { comicVoiceLines } from '../js/shows.js';
import { castVoiceName } from '../js/castvoices.js';
import { textKey } from '../js/logic.js';

test('an idiom a day for each grade, in turn, each with a strip where Chippu takes it literally', () => {
  for (const level of CORNER_LEVELS) {
    const list = idiomsFor(content, level);
    assert.ok(list.length >= 15, `${level}: ${list.length} idioms`);
    const days = Array.from({ length: list.length }, (_, i) => idiomOfDay(content, level, Date.UTC(2026, 10, 1 + i, 12)).id);
    assert.equal(new Set(days).size, list.length);
  }
  for (const x of content.idioms) {
    assert.equal(x.strip.length, 3, `${x.id}: three panels`);
    const who = x.strip.flatMap((p) => (p.say || []).map((b) => b.who));
    assert.ok(who.includes('chippu'), `${x.id}: Chippu takes it literally`);
    // the last panel sets him right: it says what it means
    assert.match(x.strip.at(-1).say.map((b) => b.text).join(' '), /मतलब|यानी/, `${x.id}: the last panel explains it`);
    assert.deepEqual([...idiomChoices(x)].sort(), [...x.options].sort());
    assert.ok(x.options.includes(x.meaning.hi) && x.example.hi.length > 10 && x.example.en);
  }
});

test('the strips speak in the characters\' voices, the meanings in the narrator\'s; progress keeps what was learnt', () => {
  const voiced = new Map(comicVoiceLines(content, castVoiceName).map((l) => [l.key, l]));
  for (const x of content.idioms)
    for (const p of x.strip)
      for (const b of p.say) {
        const seg = castLine(b.who, b.text);
        assert.ok(voiced.has(textKey(`hi.${seg.voice}`, seg.text)), `${x.id}: "${b.text}" is recorded in ${b.who}'s voice`);
      }
  const narr = new Set(lessonVoiceLines(content).map((l) => l.text));
  for (const x of content.idioms) assert.ok(narr.has(x.hi) && narr.has(`${x.hi}: ${x.meaning.hi}`), x.id);
  const x = idiomOfDay(content, 'grade8', Date.UTC(2026, 10, 17, 12));
  const p = normalizeProgress({ idioms: { [x.id]: '2026-11-17', 'X Y': '2026-11-17' } }, content);
  assert.deepEqual(p.idioms, { [x.id]: '2026-11-17' });
  assert.equal(idiomsLearnt(p), 1);
  assert.ok(idiomDoneToday(p, x, new Date(2026, 10, 17, 9).getTime()));
});

test('the idiom screen hides the last panel until the meaning is found; the validator checks the strips', () => {
  const corner = read('js/corner.js');
  assert.match(corner, /last\.classList\.add\('locked'\)/);
  assert.match(corner, /idiomCard\(api\)/);
  assert.match(read('js/app.js'), /case 'idiom':[\s\S]{0,60}idiomScreen\(api\)/);
  for (const c of ['.idiom-card', '.idiom-strip', '.strip-panel.locked', '.idiom-guess', '.idiom-meaning']) assert.ok(css.includes(c), c);
  for (const k of ['idiomGuess', 'idiomRight']) assert.ok(content.phrases[k]?.hi, k);
  const broken = structuredClone(content);
  broken.idioms[0].strip[1].cast.push({ who: 'nobody', at: 50 });
  broken.idioms[1].options = [broken.idioms[1].options[1], broken.idioms[1].options[2], 'कुछ और'];
  const errs = validateContent(broken, { themes: THEMES, mascots: MASCOT_IDS }).errors.join('\n');
  assert.match(errs, /"nobody" is not in the cast/);
  assert.match(errs, /options must include its meaning/);
});

import { newComic, keepComic, setLine, setCast, lineOf, hasWords, comicsOf, MAKER_CAST, MAKER_BGS, MAKER_MAX, TEXT_MAX, MAKER_FACES, MAKER_ARMS } from '../js/comicmaker.js';
import { CAST, BACKGROUND_IDS, FACES, ARMS } from '../js/art-comic.js';

test('a new comic is three panels of the cast; words and characters can be set and changed', () => {
  const c = newComic(1763380000000);
  assert.equal(c.panels.length, 3);
  assert.match(c.id, /^m[0-9a-z]+$/);
  for (const id of MAKER_CAST) assert.ok(CAST[id]?.name, `${id} is a named character`);
  for (const bg of MAKER_BGS) assert.ok(BACKGROUND_IDS.includes(bg), bg);
  let p = c.panels[0];
  p = setLine(p, 'chippu', 'आदेश मिला!', 'shout');
  p = setLine(p, 'kavya', 'चलो चिप्पू!');
  assert.deepEqual(p.say.map((b) => b.who), ['kavya', 'chippu'], 'bubbles in the order the characters stand');
  assert.equal(p.say[1].kind, 'shout');
  assert.equal(setLine(p, 'kavya', 'x'.repeat(200)).say[0].text.length, TEXT_MAX);
  // a new character in a slot takes over that slot's words
  p = setCast(p, 1, 'birbal');
  assert.deepEqual(p.cast.map((x) => x.who), ['kavya', 'birbal']);
  assert.equal(lineOf(p, 'birbal'), 'आदेश मिला!');
  // taking the second one out puts the first in the middle, and its words go
  p = setCast(p, 1, null);
  assert.deepEqual(p.cast.map((x) => [x.who, x.at]), [['kavya', 50]]);
  assert.deepEqual(p.say.map((b) => b.who), ['kavya']);
  // the same character can't stand twice
  assert.equal(setCast(c.panels[0], 1, 'kavya').cast.length, 1);
  // an empty line removes the bubble
  assert.equal(setLine(p, 'kavya', '   ').say.length, 0);
  assert.ok(!hasWords(newComic()));
});

test('my comics are kept with the progress, newest first, cleaned when loaded', () => {
  let list = [];
  for (let i = 0; i < MAKER_MAX + 3; i++) list = keepComic(list, { ...newComic(1763380000000 + i), title: `c${i}` });
  assert.equal(list.length, MAKER_MAX);
  assert.equal(list[0].title, `c${MAKER_MAX + 2}`);
  const one = { ...newComic(1763380000000), title: 'मेरा पहला कॉमिक' };
  one.panels[0] = setLine(one.panels[0], 'kavya', 'नमस्ते!');
  const dirty = { ...one, panels: [{ ...one.panels[0], say: [...one.panels[0].say, { who: 'ghost', text: 'boo' }], cast: [...one.panels[0].cast, { who: 'BAD!', at: 9 }] }, ...one.panels.slice(1)] };
  const p = normalizeProgress({ myComics: [dirty, { id: 'not an id', panels: [] }] }, content);
  assert.equal(comicsOf(p).length, 1);
  assert.deepEqual(p.myComics[0].panels[0].say, [{ who: 'kavya', text: 'नमस्ते!' }]);
  assert.deepEqual(p.myComics[0].panels[0].cast.map((x) => x.who), ['kavya', 'chippu']);
  assert.equal(p.myComics[0].title, 'मेरा पहला कॉमिक');
  assert.deepEqual(defaultProgress(content).myComics ?? [], []);
});

test('the comic maker is in the corner, typed words are shown as text, and the faces and poses are real ones', () => {
  const maker = read('js/comicmaker.js');
  const corner = read('js/corner.js');
  assert.match(corner, /makerCard\(api\)/);
  assert.match(read('js/app.js'), /case 'comicmaker':[\s\S]{0,120}comicMaker\(api\)/);
  assert.match(read('sw.js'), /'js\/comicmaker\.js'/);
  // what a child types never goes in as HTML
  assert.match(corner, /comic-bubble[^]*?text: b\.text/);
  assert.doesNotMatch(maker, /html: [a-z.]*text/i);
  for (const [f] of MAKER_FACES) assert.ok(FACES.includes(f), f);
  for (const [a] of MAKER_ARMS) assert.ok(ARMS.includes(a), a);
  for (const k of ['makerHello', 'makerSaved']) assert.ok(content.phrases[k]?.hi, k);
  for (const c of ['.maker-shelf', '.maker-preview', '.maker-pick', '.maker-words']) assert.ok(css.includes(c), c);
});

import { duelQuestions, newDuel, tap, timeUp, nextRound, duelWinner, DUEL_ROUNDS, BOTTOM, TOP } from '../js/duel.js';

test('a quiz duel: ten questions from the grade, first right tap scores, a wrong tap is out for that question', () => {
  let n = 0;
  const rng = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
  for (const level of ['grade7', 'grade8']) {
    const qs = duelQuestions(content, level, DUEL_ROUNDS, rng);
    assert.equal(qs.length, DUEL_ROUNDS);
    assert.equal(new Set(qs.map((q) => q.hi)).size, DUEL_ROUNDS, 'no question twice');
    for (const q of qs) assert.ok(q.options.includes(q.answer) && q.hi);
  }
  const qs = duelQuestions(content, 'grade7', 3, rng);
  let d = newDuel(qs);
  const wrong = (q) => q.options.find((o) => o !== q.answer);
  // round 1: bottom right first, then top's tap is too late
  ({ duel: d } = tap(d, BOTTOM, qs[0].answer));
  assert.equal(d.won, BOTTOM);
  assert.equal(tap(d, TOP, qs[0].answer).result, 'ignored');
  d = nextRound(d);
  // round 2: top wrong (out), top again ignored, bottom right
  let r = tap(d, TOP, wrong(qs[1]));
  assert.equal(r.result, 'wrong');
  d = r.duel;
  assert.equal(tap(d, TOP, qs[1].answer).result, 'ignored');
  ({ duel: d } = tap(d, BOTTOM, qs[1].answer));
  assert.deepEqual(d.score, [2, 0]);
  d = nextRound(d);
  // round 3: both wrong, nobody scores; or time runs out
  ({ duel: d } = tap(d, BOTTOM, wrong(qs[2])));
  ({ duel: d } = tap(d, TOP, wrong(qs[2])));
  assert.equal(d.won, -1);
  assert.deepEqual(timeUp(newDuel(qs)).won, -1);
  d = nextRound(d);
  assert.ok(d.done);
  assert.equal(duelWinner(d), BOTTOM);
  assert.equal(duelWinner({ score: [3, 3] }), -1);
  assert.equal(duelWinner({ score: [1, 4] }), TOP);
});

test('the duel is in the corner, the top half faces the other player, and the winner is said without gender', () => {
  assert.match(read('js/corner.js'), /duelCard\(api\)/);
  assert.match(read('js/app.js'), /case 'duel':[\s\S]{0,120}duelScreen\(api\)/);
  assert.match(css, /\.duel-half\.top \{[^}]*rotate\(180deg\)/);
  assert.match(read('sw.js'), /'js\/duel\.js'/);
  for (const k of ['duelHello', 'duelTopWins', 'duelBottomWins', 'duelDraw']) assert.ok(content.phrases[k]?.hi, k);
  // the winner's words fit a boy or a girl
  assert.doesNotMatch(read('js/duel.js'), /जीत गए|जीत गई|हार गए|हार गई/);
  for (const k of ['duelTopWins', 'duelBottomWins', 'duelDraw']) assert.doesNotMatch(content.phrases[k].hi, /जीता|जीती|हारा|हारी/);
});

// ---- 8.1 and 2.4: the browser checks on every push and pull request ----
test('the browser check plays one lesson from each grade offline, and draws screens that exist', () => {
  const tool = read('tools/browser-check.mjs');
  const lessons = Object.fromEntries([...tool.match(/OFFLINE_LESSONS = \{([^}]+)\}/)[1].matchAll(/(\w+): '([\w-]+)'/g)].map((m) => [m[1], m[2]]));
  const all = content.worlds.flatMap((w) => w.units.flatMap((u) => u.lessons.map((l) => ({ ...l, level: w.level }))));
  // every grade with lessons is played
  for (const lv of new Set(content.worlds.map((w) => w.level))) {
    const l = all.find((x) => x.id === lessons[lv]);
    assert.ok(l, `${lv} has a lesson in the offline check`);
    assert.equal(l.level, lv, `${lessons[lv]} is a ${lv} lesson`);
    // one a bot can finish by tapping
    assert.ok(['busdepot', 'quiz', 'firstsound', 'read', 'math'].includes(l.game), `${lessons[lv]} (${l.game}) can be finished by taps`);
  }
  // the screens open routes the app has
  const app = read('js/app.js');
  for (const m of tool.matchAll(/\['(\w+)', \{/g)) if (m[1] !== 'lesson') assert.ok(app.includes(`case '${m[1]}':`), `route ${m[1]}`);
  const ci = read('.github/workflows/test.yml');
  assert.match(ci, /playwright install --with-deps chromium/);
  assert.match(ci, /--root \.\.\/before --screens-only/);
  assert.match(ci, /upload-artifact/);
});

// ---- 2.1 content split by grade ----
import { splitContent, mergeContent, firstPacks, PACKED } from '../js/packs.js';
import { readdirSync } from 'node:fs';

test('content/ is content.json split into a core and a pack per grade, and nothing is lost', () => {
  const files = splitContent(content);
  // what is in the folder is exactly the split of content.json (run tools/split-content.mjs after editing it)
  const onDisk = readdirSync(new URL('../content/', import.meta.url)).filter((f) => f.endsWith('.json')).sort();
  assert.deepEqual(onDisk, Object.keys(files).sort(), 'content/ is out of step with content.json: run node tools/split-content.mjs');
  for (const f of onDisk) assert.equal(read(`content/${f}`), files[f], `content/${f} is out of step: run node tools/split-content.mjs`);
  const core = JSON.parse(files['core.json']);
  for (const k of PACKED) assert.equal(core[k], undefined, `${k} is in the packs, not the core`);
  // putting the packs back together gives content.json, in the same order
  const all = mergeContent(core, core.packs.map((p) => JSON.parse(files[p.file])));
  for (const k of Object.keys(content)) assert.deepEqual(all[k], content[k], k);
  // a pack per grade that has any, small enough for a slow first open
  assert.ok(core.packs.length >= 8);
  assert.ok(files['core.json'].length < 450 * 1024, `core.json is ${files['core.json'].length} bytes`);
  // the packs missing just leave those parts out
  const toddler = mergeContent(core, firstPacks(core, 'toddler').map((p) => JSON.parse(files[p.file])));
  assert.ok(toddler.stories.length && toddler.stories.every((s) => s.level === 'toddler'));
  assert.deepEqual(toddler.comics, []);
  assert.deepEqual(firstPacks(core, 'grade7').map((p) => p.level).sort(), ['grade7', 'kg']);
  // every story is still known, for favourites
  assert.equal(core.storyIds.length, content.stories.length);
});

test('the app loads the core and its grade first, the service worker saves every pack, and favourites survive', () => {
  const app = read('js/app.js');
  assert.match(app, /getJSON\('core\.json'\)/);
  assert.match(app, /EARLY_ROUTES = \['splash', 'onboard', 'placement', 'hub'\]/);
  assert.doesNotMatch(app, /fetch\('content\.json'/);
  const sw = read('sw.js');
  assert.match(sw, /'content\/core\.json'/);
  assert.match(sw, /core\.packs/);
  assert.doesNotMatch(sw, /^  'content\.json',$/m);
  const files = splitContent(content);
  const core = JSON.parse(files['core.json']);
  const partial = mergeContent(core, firstPacks(core, 'toddler').map((p) => JSON.parse(files[p.file])));
  const grade3Story = content.stories.find((s) => s.level === 'grade3').id;
  assert.deepEqual(normalizeProgress({ favs: [grade3Story, 'no-such-story'] }, partial).favs, [grade3Story]);
});

// ---- 8.5 the performance budget ----
test("index.html preloads exactly the modules the first screen imports, and starts the content's download", () => {
  // the first screen's modules: everything app.js imports statically, followed through
  const seen = new Set();
  const walk = (f) => {
    if (seen.has(f)) return;
    seen.add(f);
    const src = read(f);
    for (const m of src.matchAll(/^import\s[^;]*?from\s+'(\.[^']+)'/gms)) {
      const parts = f.split('/').slice(0, -1);
      for (const seg of m[1].split('/')) seg === '..' ? parts.pop() : seg !== '.' && parts.push(seg);
      walk(parts.join('/'));
    }
  };
  walk('js/app.js');
  const html = read('index.html');
  const pre = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...pre].sort(), [...seen].filter((f) => f !== 'js/app.js').sort(), 'the modulepreload list in index.html is out of step with the imports');
  // what is left out of the first screen loads when its screen opens
  for (const m of ['shows.js', 'parent.js', 'validate.js', 'comicmaker.js', 'duel.js']) assert.ok(!seen.has(`js/${m}`), `${m} is not needed for the first screen`);
  assert.match(read('js/app.js'), /import\('\.\/shows\.js'\)/);
  assert.match(read('js/app.js'), /import\('\.\/validate\.js'\)/);
  // the content starts downloading before the code has loaded, and the fonts don't compete with it
  assert.match(html, /window\.__early = early/);
  assert.doesNotMatch(html, /rel="preload"[^>]*font/);
  assert.match(read('js/app.js'), /window\.__early/);
  // the other grades' packs wait until the first screen is up
  assert.match(read('js/app.js'), /requestAnimationFrame\(\(\) => setTimeout\(state\.startRest/);
});

test('long lists draw their pictures as they come near the screen', () => {
  const ui = read('js/ui.js');
  assert.match(ui, /export function drawWhenSeen/);
  assert.match(ui, /IntersectionObserver/);
  const screens = read('js/screens.js');
  assert.match(screens, /drawWhenSeen\('div', \{ class: 'world-card-scene' \}/);
  assert.match(screens, /drawWhenSeen\('span', \{ class: 'book-cover' \}/);
  assert.match(read('docs/PERFORMANCE.md'), /\| The first screen on a \*\*first open over 4G\*\*/);
});

// ---- 10.1 maths with the hands ----
import { ACTIVITIES, ACTIVITY_SKILL, DESIGNS } from '../js/games/handson.js';
import { HANDS_ACTIVITIES } from '../js/validate.js';
import { SKILLS, makeProblem } from '../js/mathgen.js';

test('eight hands-on maths activities, each a lesson in the maths world of its grade, recording a skill of that grade', () => {
  assert.deepEqual(ACTIVITIES, HANDS_ACTIVITIES);
  const math = content.worlds.filter((w) => w.subject === 'math');
  for (const a of ACTIVITIES) {
    const found = math.flatMap((w) => w.units.flatMap((u) => u.lessons.filter((l) => l.game === 'handson' && l.config.activity === a).map((l) => ({ l, w }))));
    assert.equal(found.length, 1, `one ${a} lesson`);
    const { l, w } = found[0];
    const skill = l.config.skill || ACTIVITY_SKILL[a];
    assert.ok(SKILLS[skill], `${l.id}: ${skill} is a maths skill`);
    assert.ok(skill.startsWith(w.level === 'kg' ? 'k-' : 'g1-'), `${l.id} records a ${w.level} skill`);
    assert.ok(l.title.hi && l.title.en && l.icon);
  }
  assert.match(read('sw.js'), /'js\/games\/handson\.js'/);
});

test('the shape builder\'s pictures can be built from the pieces, and every level has some', () => {
  for (const d of DESIGNS) {
    assert.ok(d.slots.length >= 2 && d.say && d.name, d.id);
    for (const s of d.slots) assert.ok(['triangle', 'square', 'rectangle', 'circle'].includes(s.shape), `${d.id}: ${s.shape}`);
  }
  for (const t of [0, 1, 2]) assert.ok(DESIGNS.some((d) => d.tier <= t && d.tier >= t - 1), `tier ${t} has a picture`);
});

test('patterns as answer cards: what comes next is always one of the choices', () => {
  let s = 7;
  const rng = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 300; i++) {
    const p = makeProblem('k-pattern', { tier: i % 3, n: 2 + (i % 3), rng });
    assert.ok(p.options.some((o) => o.value === p.answer), JSON.stringify(p.options));
    assert.ok(p.model.groups.length >= 4);
  }
  // a hands-on lesson with no activity, or an unknown skill, is caught
  const broken = structuredClone(content);
  const l = broken.worlds.flatMap((w) => w.units.flatMap((u) => u.lessons)).find((x) => x.game === 'handson');
  l.config.activity = 'juggling';
  l.config.skill = 'k-juggling';
  const errs = validateContent(broken, { themes: THEMES, mascots: MASCOT_IDS }).errors.join('\n');
  assert.match(errs, /activity must be one of/);
  assert.match(errs, /"k-juggling" is not a math skill/);
});
