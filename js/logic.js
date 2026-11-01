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

// ---- Phases (levels) ----

// The phase the child is in: Toddler, Kindergarten, Grade 1, 2 or 3.
export function currentLevel(content, settings) {
  const levels = content.levels || [];
  return levels.find((l) => l.id === settings?.level) || levels.find((l) => l.id === 'kg') || levels[0] || null;
}

// A game's settings: content.games[game] with the current phase's overrides on top.
export function gameConfig(content, settings, game) {
  const level = currentLevel(content, settings);
  return { ...(content.games?.[game] || {}), ...(level?.games?.[game] || {}) };
}

// ["@grade1", "bus"] -> every word whose level is grade1, then "bus". Duplicates removed.
export function expandWords(list, content) {
  const out = [];
  for (const entry of list || []) {
    const ids = entry.startsWith('@') ? Object.keys(content.words).filter((id) => content.words[id].level === entry.slice(1)) : [entry];
    for (const id of ids) if (!out.includes(id)) out.push(id);
  }
  return out;
}

// ---- Settings ----

export function defaultSettings(content) {
  const places = {};
  for (const p of content.places) places[p.id] = p.unlockedByDefault !== false;
  const letterSets = {};
  for (const s of content.letterSets) letterSets[s.id] = s.enabledByDefault !== false;
  return { lang: 'both', level: currentLevel(content, {})?.id ?? null, onboarded: false, places, letterSets };
}

export function normalizeSettings(saved, content) {
  const base = defaultSettings(content);
  if (!saved || typeof saved !== 'object') return base;
  const out = { ...base, places: { ...base.places }, letterSets: { ...base.letterSets } };
  if (LANG_MODES.includes(saved.lang)) out.lang = saved.lang;
  if ((content.levels || []).some((l) => l.id === saved.level)) out.level = saved.level;
  if (typeof saved.onboarded === 'boolean') out.onboarded = saved.onboarded;
  for (const id of Object.keys(out.places)) if (typeof saved.places?.[id] === 'boolean') out.places[id] = saved.places[id];
  for (const id of Object.keys(out.letterSets)) if (typeof saved.letterSets?.[id] === 'boolean') out.letterSets[id] = saved.letterSets[id];
  return out;
}

export function defaultProgress(content) {
  return {
    unlockedVehicles: content.vehicles.filter((v) => v.unlockedByDefault).map((v) => v.id),
    completed: {},
    trainPos: {},
    storyPos: {},
    stats: {},
  };
}

export function normalizeProgress(saved, content) {
  const base = defaultProgress(content);
  if (!saved || typeof saved !== 'object') return base;
  const known = new Set(content.vehicles.map((v) => v.id));
  const unlocked = new Set(base.unlockedVehicles);
  for (const id of saved.unlockedVehicles || []) if (known.has(id)) unlocked.add(id);
  const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? { ...v } : {});
  return {
    unlockedVehicles: content.vehicles.map((v) => v.id).filter((id) => unlocked.has(id)),
    completed: obj(saved.completed),
    trainPos: obj(saved.trainPos),
    storyPos: obj(saved.storyPos),
    stats: obj(saved.stats),
  };
}

// Letter sets the child should see: the phase's sets, in the chosen language(s), minus any the
// parent turned off. Toddlers get none. If the parent turned every set off, all of the phase's sets come back.
export function activeLetterSets(content, settings) {
  const langs = langsFor(settings.lang);
  const level = currentLevel(content, settings);
  const allowed = level ? content.letterSets.filter((s) => level.letterSets.includes(s.id)) : content.letterSets;
  const inLang = allowed.filter((s) => langs.includes(s.lang));
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
  for (const st of content.stories || []) st.pages.forEach((_, i) => keys.push(`story-${st.id}-${i + 1}_hi`, `story-${st.id}-${i + 1}_en`));
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

// Places on the map: the phase's places, in the phase's order, minus any the parent hid.
export function visiblePlaces(content, settings) {
  const level = currentLevel(content, settings);
  const byId = new Map(content.places.map((p) => [p.id, p]));
  const ids = level ? level.places : content.places.map((p) => p.id);
  return ids.map((id) => byId.get(id)).filter((p) => p && settings.places[p.id] !== false);
}

// ---- Matras and reading ----

export const VIRAMA = '\u094D';

// Vowel signs present in a word, in content order (e.g. "किताब" -> ["ि", "ा"]).
export function matrasIn(text, matras) {
  return matras.filter((m) => text.includes(m.sign));
}

export function hasConjunct(text) {
  return text.includes(VIRAMA);
}

// The barakhadi row for one consonant: क का कि की कु कू के कै को कौ कं कः
export function barakhadi(consonant, matras) {
  return [{ id: 'a', text: consonant, matra: null }, ...matras.map((m) => ({ id: m.id, text: consonant + m.sign, matra: m }))];
}

// Hide one matra in a word: मोर -> { before: "", base: "म", sign: "ो", after: "र" }. Null if the word has none.
export function maskMatra(word, matras, rng = Math.random) {
  const parts = word.syllables || graphemes(word.hi);
  const options = [];
  parts.forEach((p, i) => {
    for (const m of matras) if (p.length > m.sign.length && p.endsWith(m.sign)) options.push({ i, m });
  });
  if (!options.length) return null;
  const { i, m } = options[Math.floor(rng() * options.length)];
  return {
    before: parts.slice(0, i).join(''),
    base: parts[i].slice(0, -m.sign.length),
    sign: m.sign,
    matra: m,
    after: parts.slice(i + 1).join(''),
  };
}

// Distractor words that look like the target (same first letter, same matras, same length),
// so reading has to look at the whole word. Never returns a word spelled like the target.
export function similarWords(target, pool, count, rng = Math.random, matras = []) {
  const first = (w) => graphemes(w.hi)[0]?.[0];
  const signs = new Set(matras.filter((m) => target.hi.includes(m.sign)).map((m) => m.sign));
  const len = graphemes(target.hi).length;
  const scored = pool
    .filter((w) => w.id !== target.id && w.hi !== target.hi)
    .map((w) => {
      let score = rng();
      if (first(w) === first(target)) score += 2;
      for (const sgn of signs) if (w.hi.includes(sgn)) score += 1;
      if (graphemes(w.hi).length === len) score += 1;
      return { w, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((x) => x.w);
}

export function sentenceTokens(text) {
  return text.trim().split(/\s+/);
}

// ---- Rhymes and word pairs ----

export function makeRhymeRound(groups, lang, rng = Math.random) {
  const usable = groups.filter((g) => g.lang === lang && g.words.length >= 2);
  if (!usable.length) return null;
  const group = usable[Math.floor(rng() * usable.length)];
  const [target, answer] = sample(group.words, 2, rng);
  const others = shuffle(
    usable.filter((g) => g !== group).flatMap((g) => g.words).filter((id) => !group.words.includes(id)),
    rng,
  );
  const distractors = [...new Set(others)].slice(0, 2);
  return { lang, target, answer, options: shuffle([answer, ...distractors], rng) };
}

// kind: opposite (बड़ा -> छोटा), plural (केला -> केले) or female (शेर -> शेरनी).
export function makePairRound(sets, kinds, rng = Math.random) {
  const usable = kinds.filter((k) => sets[k]?.length);
  const kind = usable[Math.floor(rng() * usable.length)];
  const pairs = sets[kind];
  const pair = pairs[Math.floor(rng() * pairs.length)];
  const flip = kind === 'opposite' && rng() < 0.5;
  const [from, to] = flip ? [pair[1], pair[0]] : pair;
  const rest = pairs.filter((p) => p !== pair);
  const distractors =
    kind === 'opposite' ? sample(rest.flat(), 2, rng) : [from, ...sample(rest.map((p) => p[1]), 1, rng)];
  return { kind, from, to, options: shuffle([to, ...distractors], rng) };
}

// ---- Learning stats and adaptive practice ----

// A stable key for anything a child answers: words, letters, matras (or barakhadi syllables), numbers.
export function itemKey(item) {
  if (!item || typeof item !== 'object') return null;
  if (typeof item.char === 'string') return `l:${item.id}`;
  if (item.matra && typeof item.text === 'string') return `m:${item.matra.id}`;
  if (typeof item.sign === 'string') return `m:${item.id}`;
  if (typeof item.value === 'number') return `n:${item.value}`;
  if (typeof item.hi === 'string' && item.id) return `w:${item.id}`;
  return null;
}

// stats[key] = { seen, first } where `first` counts answers right on the first tap.
export function recordAnswer(stats, key, firstTry) {
  if (!key) return stats;
  const old = stats[key] || { seen: 0, first: 0 };
  return { ...stats, [key]: { seen: old.seen + 1, first: old.first + (firstTry ? 1 : 0) } };
}

// 0..1, smoothed so one lucky or unlucky answer doesn't decide it.
export function mastery(stat) {
  if (!stat) return 0.5;
  return (stat.first + 1) / (stat.seen + 2);
}

// Items the child finds hard come up more often; new items a little more than known ones.
export function practiceWeight(stat) {
  if (!stat) return 1.5;
  return 0.4 + (1 - mastery(stat)) * 2.2;
}

// Like roundSequence, but picks by weight. Never the same item twice in a row.
export function weightedSequence(pool, n, rng = Math.random, weightOf = () => 1, key = defaultKey) {
  if (!pool.length) return [];
  const out = [];
  for (let i = 0; i < n; i++) {
    const prev = out.length ? key(out[out.length - 1]) : undefined;
    const options = pool.length > 1 ? pool.filter((x) => key(x) !== prev) : pool;
    const weights = options.map((x) => Math.max(0.01, weightOf(x)));
    let r = rng() * weights.reduce((a, b) => a + b, 0);
    let idx = 0;
    while (idx < options.length - 1 && r >= weights[idx]) r -= weights[idx++];
    out.push(options[idx]);
  }
  return out;
}

// For the parent view: what to practise and what is mastered.
export function practiceReport(stats, { minSeen = 3 } = {}) {
  const rows = Object.entries(stats).map(([key, s]) => ({ key, ...s, mastery: mastery(s) }));
  return {
    practise: rows.filter((r) => r.seen >= 2 && r.mastery < 0.6).sort((a, b) => a.mastery - b.mastery),
    mastered: rows.filter((r) => r.seen >= minSeen && r.mastery >= 0.75).sort((a, b) => b.mastery - a.mastery),
    answered: rows.reduce((n, r) => n + r.seen, 0),
  };
}
