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
