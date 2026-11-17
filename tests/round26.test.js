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
