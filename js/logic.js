// Pure game logic: no DOM, no storage. Everything here is unit-tested in tests/.

export const LANG_MODES = ['hi', 'en', 'both'];

// Small seeded PRNG (mulberry32) so tests can be deterministic.
export function makeRng(seed = Date.now()) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(min, max, rng = Math.random) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function shuffle(arr, rng = Math.random) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function sample(arr, n, rng = Math.random) {
  return shuffle(arr, rng).slice(0, Math.max(0, n));
}

const defaultKey = (x) => (x && typeof x === 'object' ? x.id : x);

// Returns `count` distinct options (by key) that always include `answer`, shuffled.
export function pickChoices(pool, answer, count, rng = Math.random, key = defaultKey) {
  const answerKey = key(answer);
  const seen = new Set([answerKey]);
  const others = [];
  for (const item of shuffle(pool, rng)) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    others.push(item);
    if (others.length >= count - 1) break;
  }
  return shuffle([answer, ...others], rng);
}

// `n` targets from `pool`, cycling through a shuffled pool so items are spread out,
// and never the same item twice in a row.
export function roundSequence(pool, n, rng = Math.random, key = defaultKey) {
  if (!pool.length) return [];
  const single = new Set(pool.map(key)).size === 1;
  const out = [];
  let bag = [];
  while (out.length < n) {
    if (!bag.length) bag = shuffle(pool, rng);
    const prev = out.length ? key(out[out.length - 1]) : undefined;
    let idx = single ? 0 : bag.findIndex((x) => key(x) !== prev);
    if (idx === -1) {
      bag = shuffle(pool, rng);
      continue;
    }
    out.push(bag.splice(idx, 1)[0]);
  }
  return out;
}

export function langsFor(mode) {
  if (mode === 'hi') return ['hi'];
  if (mode === 'en') return ['en'];
  return ['hi', 'en'];
}

// In "both" mode, games that show one script per round alternate between them.
export function langForRound(mode, roundIndex) {
  const langs = langsFor(mode);
  return langs[roundIndex % langs.length];
}

// "Find {w}" -> ['Find ', {word: true}]. Used to splice recorded word audio into spoken prompts.
export function splitTemplate(template) {
  const parts = [];
  const re = /\{w\}/g;
  let last = 0;
  let m;
  while ((m = re.exec(template))) {
    if (m.index > last) parts.push(template.slice(last, m.index));
    parts.push({ word: true });
    last = m.index + m[0].length;
  }
  if (last < template.length) parts.push(template.slice(last));
  return parts.filter((p) => typeof p !== 'string' || p.trim() !== '');
}

export function fillTemplate(template, text) {
  return template.replace(/\{w\}/g, text);
}

// ---- Crane: build a word tile by tile ----

export function graphemes(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return Array.from(new Intl.Segmenter('hi', { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

export function splitTiles(word, lang) {
  if (lang === 'hi') return word.syllables ? word.syllables.slice() : graphemes(word.hi);
  return Array.from(word.en.toUpperCase().replace(/[^A-Z]/g, ''));
}

export function createBuild(tiles) {
  return { tiles: tiles.slice(), placed: 0, done: tiles.length === 0 };
}

// Only the next needed tile is accepted; anything else leaves the state unchanged (no failure).
export function placeTile(state, tile) {
  if (state.done) return { ok: false, state };
  if (tile !== state.tiles[state.placed]) return { ok: false, state };
  const placed = state.placed + 1;
  return { ok: true, state: { ...state, placed, done: placed === state.tiles.length } };
}

export function tileChoices(tiles, distractorPool, extra, rng = Math.random) {
  const distractors = sample(distractorPool.filter((t) => !tiles.includes(t)), extra, rng);
  return shuffle([...tiles, ...distractors], rng);
}

// ---- Bus depot: counting passengers on and off ----

export function makeCountTrip(current, max = 10, rng = Math.random, maxStep = 3) {
  let op;
  if (current <= 1) op = 'on';
  else if (current >= max) op = 'off';
  else op = rng() < 0.6 ? 'on' : 'off';
  const room = op === 'on' ? max - current : current - 1; // never empty the bus completely
  const amount = randInt(1, Math.min(maxStep, room), rng);
  return { op, amount, before: current, result: op === 'on' ? current + amount : current - amount };
}

export function numberChoices(answer, max = 10, count = 3, rng = Math.random) {
  const pool = [];
  for (let i = 1; i <= max; i++) pool.push(i);
  // prefer near numbers so the choice is about counting, not guessing
  const near = pool.filter((n) => n !== answer && Math.abs(n - answer) <= 2);
  const far = pool.filter((n) => n !== answer && Math.abs(n - answer) > 2);
  const others = [...shuffle(near, rng), ...shuffle(far, rng)].slice(0, count - 1);
  return shuffle([answer, ...others], rng);
}

// ---- Railway: alphabet train ----

export function createTrain(letters, start = 0, length = 5) {
  const len = Math.min(length, letters.length);
  return { letters, start: ((start % letters.length) + letters.length) % letters.length, length: len, filled: [] };
}

export function expectedLetter(train) {
  return train.letters[(train.start + train.filled.length) % train.letters.length];
}

export function addCarriage(train, letter) {
  if (train.filled.length >= train.length) return { ok: false, train, done: true };
  const want = expectedLetter(train);
  if (defaultKey(letter) !== defaultKey(want)) return { ok: false, train, done: false };
  const filled = [...train.filled, want];
  return { ok: true, train: { ...train, filled }, done: filled.length === train.length };
}

export function trainChoices(train, count = 3, rng = Math.random) {
  return pickChoices(train.letters, expectedLetter(train), count, rng);
}

export function nextTrainStart(train) {
  return (train.start + train.length) % train.letters.length;
}

// ---- Recycling yard: sort by colour or shape ----

export function makeSortRound(colors, shapes, mode, binCount = 3, rng = Math.random) {
  const color = colors[Math.floor(rng() * colors.length)];
  const shape = shapes[Math.floor(rng() * shapes.length)];
  const answer = mode === 'color' ? color : shape;
  const pool = mode === 'color' ? colors : shapes;
  const bins = pickChoices(pool, answer, Math.min(binCount, pool.length), rng, (x) => x);
  return { mode, item: { color, shape }, answer, bins };
}

export function checkSort(round, bin) {
  return bin === round.answer;
}

// ---- Airport / harbour: opposites ----

export function makeOppositeRound(pairs, rng = Math.random, previous = null) {
  let pair = pairs[Math.floor(rng() * pairs.length)];
  const target = rng() < 0.5 ? 'a' : 'b';
  if (previous && pairs.length > 1 && pair === previous.pair) {
    pair = pairs[(pairs.indexOf(pair) + 1) % pairs.length];
  }
  return { pair, target, order: shuffle(['a', 'b'], rng) };
}

// ---- Trace the road ----

// Fraction of target points that have a traced point within `radius`.
export function traceCoverage(targets, trace, radius) {
  if (!targets.length) return 1;
  const r2 = radius * radius;
  let hit = 0;
  for (const t of targets) {
    for (const p of trace) {
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      if (dx * dx + dy * dy <= r2) {
        hit++;
        break;
      }
    }
  }
  return hit / targets.length;
}

// Evenly thin a list of points down to at most `max`.
export function thinPoints(points, max) {
  if (points.length <= max) return points.slice();
  const step = points.length / max;
  const out = [];
  for (let i = 0; i < max; i++) out.push(points[Math.floor(i * step)]);
  return out;
}

// ---- Rewards ----

export function nextUnlock(vehicleIds, unlocked) {
  const have = new Set(unlocked);
  return vehicleIds.find((id) => !have.has(id)) ?? null;
}

export function applyCompletion(progress, gameId, vehicleIds) {
  const completed = { ...(progress.completed || {}) };
  completed[gameId] = (completed[gameId] || 0) + 1;
  const unlocked = (progress.unlockedVehicles || []).slice();
  const newVehicle = nextUnlock(vehicleIds, unlocked);
  if (newVehicle) unlocked.push(newVehicle);
  return { progress: { ...progress, completed, unlockedVehicles: unlocked }, newVehicle };
}

// ---- Settings ----

export function defaultSettings(content) {
  const places = {};
  for (const p of content.places) places[p.id] = p.unlockedByDefault !== false;
  const letterSets = {};
  for (const s of content.letterSets) letterSets[s.id] = s.enabledByDefault !== false;
  return { lang: 'both', places, letterSets };
}

export function normalizeSettings(saved, content) {
  const base = defaultSettings(content);
  if (!saved || typeof saved !== 'object') return base;
  const out = { ...base, places: { ...base.places }, letterSets: { ...base.letterSets } };
  if (LANG_MODES.includes(saved.lang)) out.lang = saved.lang;
  for (const id of Object.keys(out.places)) if (typeof saved.places?.[id] === 'boolean') out.places[id] = saved.places[id];
  for (const id of Object.keys(out.letterSets)) if (typeof saved.letterSets?.[id] === 'boolean') out.letterSets[id] = saved.letterSets[id];
  return out;
}

export function defaultProgress(content) {
  return {
    unlockedVehicles: content.vehicles.filter((v) => v.unlockedByDefault).map((v) => v.id),
    completed: {},
    trainPos: {},
  };
}

export function normalizeProgress(saved, content) {
  const base = defaultProgress(content);
  if (!saved || typeof saved !== 'object') return base;
  const known = new Set(content.vehicles.map((v) => v.id));
  const unlocked = new Set(base.unlockedVehicles);
  for (const id of saved.unlockedVehicles || []) if (known.has(id)) unlocked.add(id);
  return {
    unlockedVehicles: content.vehicles.map((v) => v.id).filter((id) => unlocked.has(id)),
    completed: saved.completed && typeof saved.completed === 'object' ? { ...saved.completed } : {},
    trainPos: saved.trainPos && typeof saved.trainPos === 'object' ? { ...saved.trainPos } : {},
  };
}

// Letter sets the child should see, given the language mix and the parent's choices.
// Falls back to every set in the active language(s) if the parent turned them all off.
export function activeLetterSets(content, settings) {
  const langs = langsFor(settings.lang);
  const inLang = content.letterSets.filter((s) => langs.includes(s.lang));
  const chosen = inLang.filter((s) => settings.letterSets[s.id]);
  return chosen.length ? chosen : inLang;
}

export function activeLetters(content, settings) {
  return activeLetterSets(content, settings).flatMap((s) =>
    s.letters.map((l) => ({ ...l, lang: s.lang, setId: s.id })),
  );
}

// Every file name (without extension) a family recording can use, e.g. "bus_hi", "hc-ka", "num-3_en".
export function clipKeysFor(content) {
  const keys = [];
  for (const [id, w] of Object.entries(content.words)) {
    keys.push(`${id}_hi`, `${id}_en`);
    if (w.sound) keys.push(`${id}-sound_hi`, `${id}-sound_en`);
  }
  for (const s of content.letterSets) for (const l of s.letters) keys.push(l.id);
  for (const n of content.numbers) keys.push(`num-${n.value}_hi`, `num-${n.value}_en`);
  for (const s of content.sentences || []) keys.push(`sentence-${s.id}_hi`, `sentence-${s.id}_en`);
  for (const [k, p] of Object.entries(content.phrases)) {
    if (!p.hi.includes('{w}')) keys.push(`phrase-${k}_hi`);
    if (!p.en.includes('{w}')) keys.push(`phrase-${k}_en`);
  }
  return keys;
}

// "Bus_HI.m4a" -> "bus_hi"; letter ids keep their case-insensitive match.
export function clipKeyFromFileName(name, validKeys) {
  const base = name.replace(/\.[^.]+$/, '').trim().toLowerCase();
  return validKeys.find((k) => k.toLowerCase() === base) ?? null;
}

export function visiblePlaces(content, settings) {
  return content.places.filter((p) => settings.places[p.id]);
}
