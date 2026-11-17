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
  assert.match(app, /setOutfit\(st\.outfit\);\s*sfx\.tapSound = st\.sound;/);
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
