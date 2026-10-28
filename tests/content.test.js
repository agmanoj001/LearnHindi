import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { validateContent, GAME_TYPES } from '../js/validate.js';
import { KNOWN_PICTURES, picture } from '../js/art.js';
import { clipKeysFor } from '../js/logic.js';

const root = new URL('../', import.meta.url);
const content = JSON.parse(readFileSync(new URL('content.json', root), 'utf8'));
const clone = () => structuredClone(content);

test('content.json is valid', () => {
  const { errors } = validateContent(content, { knownPictures: KNOWN_PICTURES });
  assert.deepEqual(errors, []);
});

test('every picture in content.json has a built-in drawing', () => {
  const { warnings } = validateContent(content, { knownPictures: KNOWN_PICTURES });
  assert.deepEqual(warnings, []);
});

test('every place has a game module', () => {
  for (const p of content.places) assert.ok(existsSync(new URL(`js/games/${p.game}.js`, root)), `missing js/games/${p.game}.js`);
});

test('every game module is a known game type', () => {
  const files = readdirSync(new URL('js/games/', root)).filter((f) => f !== 'kit.js');
  for (const f of files) assert.ok(GAME_TYPES.includes(f.replace('.js', '')), f);
});

test('every built-in picture renders to an svg', () => {
  for (const id of KNOWN_PICTURES) {
    const s = picture(id, { color: '#ff0000' });
    assert.match(s, /^<svg[\s\S]*<\/svg>$/, id);
    assert.ok(!s.includes('undefined') && !s.includes('NaN'), `${id} has a broken attribute`);
  }
  assert.match(picture('not-a-picture', { label: 'zebra' }), />Z</, 'unknown pictures fall back to a letter badge');
});

test('service worker caches every game module', () => {
  const sw = readFileSync(new URL('sw.js', root), 'utf8');
  for (const f of readdirSync(new URL('js/', root))) if (f.endsWith('.js')) assert.ok(sw.includes(`js/${f}`), `sw.js missing js/${f}`);
  for (const f of readdirSync(new URL('js/games/', root))) assert.ok(sw.includes(`js/games/${f}`), `sw.js missing js/games/${f}`);
});

test('no personal recordings or photos are committed', () => {
  assert.ok(!existsSync(new URL('audio/', root)) || readFileSync(new URL('.gitignore', root), 'utf8').includes('audio/'));
  const ignore = readFileSync(new URL('.gitignore', root), 'utf8');
  assert.match(ignore, /^audio\/$/m);
});

test('recording names are unique', () => {
  const keys = clipKeysFor(content);
  assert.equal(new Set(keys.map((k) => k.toLowerCase())).size, keys.length);
});

// ---- the validator catches common editing mistakes ----

const errorsFor = (mutate) => {
  const c = clone();
  mutate(c);
  return validateContent(c).errors.join('\n');
};

test('validator: missing Hindi text', () => {
  assert.match(errorsFor((c) => delete c.words.bus.hi), /words\.bus\.hi is required/);
});

test('validator: Hindi written in Latin letters', () => {
  assert.match(errorsFor((c) => (c.words.bus.hi = 'bas')), /Devanagari/);
});

test('validator: vehicle without a word', () => {
  assert.match(errorsFor((c) => c.vehicles.push({ id: 'spaceship' })), /"spaceship" has no matching entry/);
});

test('validator: duplicate vehicle', () => {
  assert.match(errorsFor((c) => c.vehicles.push({ id: 'bus' })), /duplicate id "bus"/);
});

test('validator: unknown game', () => {
  assert.match(errorsFor((c) => (c.places[0].game = 'zoo')), /unknown game "zoo"/);
});

test('validator: syllables must spell the word', () => {
  assert.match(errorsFor((c) => (c.words.bus.syllables = ['ब'])), /syllables must join/);
});

test('validator: unsafe audio paths are rejected', () => {
  assert.match(errorsFor((c) => (c.words.bus.audio = { hi: '../secret.mp3' })), /audio\.hi/);
  assert.match(errorsFor((c) => (c.words.bus.audio = { hi: 'https://example.com/x.mp3' })), /audio\.hi/);
  assert.equal(errorsFor((c) => (c.words.bus.audio = { hi: 'bus_hi.mp3', en: 'words/bus_en.m4a' })), '');
});

test('validator: phrase missing its {w} slot', () => {
  assert.match(errorsFor((c) => (c.phrases.find.en = 'Find it')), /phrases\.find must contain \{w\}/);
});

test('validator: duplicate letter ids across sets', () => {
  assert.match(
    errorsFor((c) => c.letterSets[2].letters.push({ id: 'HV-A', char: 'Q', translit: 'q' })),
    /duplicate letter id/,
  );
});

test('validator: numbers must be 1 to 10', () => {
  assert.match(errorsFor((c) => c.numbers.pop()), /numbers must list 1 to 10/);
});

test('validator: word lists in game settings must exist', () => {
  assert.match(errorsFor((c) => c.games.rescue.words.push('dragon')), /"dragon" not found/);
});

test('validator: farm animals need a sound', () => {
  assert.match(
    errorsFor((c) => {
      c.places.push({ id: 'f', word: 'place-farm', game: 'farm' });
      c.games.farm.animals.push('lion');
    }),
    /"lion" needs a "sound"/,
  );
});

test('validator: a parent can add a new vehicle with only content changes', () => {
  const c = clone();
  c.words.tram = { hi: 'ट्राम', translit: 'traam', en: 'tram', picture: 'tram' };
  c.vehicles.push({ id: 'tram' });
  const { errors, warnings } = validateContent(c, { knownPictures: KNOWN_PICTURES });
  assert.deepEqual(errors, []);
  assert.equal(warnings.length, 1, 'only a warning that the picture falls back to a badge');
});
