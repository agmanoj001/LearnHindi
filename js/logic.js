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

// A colour dark enough for white text on it (and for it as text on white): WCAG AA, contrast 4.5:1.
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrastWithWhite = (hex) => 1.05 / (lum(hex) + 0.05);
export function readable(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  let [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  let out = hex;
  while (contrastWithWhite(out) < 4.5) {
    [r, g, b] = [r, g, b].map((c) => Math.floor(c * 0.92));
    out = '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
  }
  return out;
}

// Right-first-time answers in a row that earn a little "3 in a row!" cheer inside a lesson.
export const COMBO_MILESTONES = [3, 5, 8, 12];
export const comboText = (n, lang) => ({ hi: `लगातार ${n} सही!`, en: `${n} in a row!`, both: `${n} in a row! · लगातार ${n}!` })[lang] || `${n} in a row!`;

// Which device this is, for help with its text-to-speech settings.
export function deviceKind(ua = '', touchPoints = 0) {
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/CrOS/.test(ua)) return 'chromeos';
  if (/Windows/.test(ua)) return 'windows';
  if (/Macintosh/.test(ua)) return 'mac';
  return 'other';
}

// How to add a Hindi voice on each kind of device (the app speaks with the device's own voices).
export const VOICE_SETUP = {
  ios: { device: 'iPhone or iPad', steps: 'Settings › Accessibility › Spoken Content › Voices › Hindi › download Lekha. Then close and reopen the app.' },
  android: { device: 'Android', steps: 'Settings › System › Languages › Text-to-speech output › Speech Services by Google › ⚙ › Install voice data › Hindi (हिन्दी). Then close and reopen the app.' },
  chromeos: { device: 'Chromebook', steps: 'Settings › Accessibility › Text-to-speech › Speech engines and voices › add Hindi. Then reload the app.' },
  windows: { device: 'Windows', steps: 'Settings › Time & language › Speech › Manage voices › Add voices › Hindi. Then restart the browser. Microsoft Edge also has natural Hindi voices built in.' },
  mac: { device: 'Mac', steps: 'System Settings › Accessibility › Spoken Content › System voice › Manage Voices › Hindi › Lekha. Then restart the browser.' },
  other: { device: 'this device', steps: 'Open the app in Chrome or Edge, or add a Hindi voice in the device’s text-to-speech settings.' },
};

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

// ---- Words and letters for a lesson ----

// ["@grade1", "bus"] -> every word whose level is grade1, then "bus". Duplicates removed.
export function expandWords(list, content) {
  const out = [];
  for (const entry of list || []) {
    const ids = entry.startsWith('@') ? Object.keys(content.words).filter((id) => content.words[id].level === entry.slice(1)) : [entry];
    for (const id of ids) if (!out.includes(id)) out.push(id);
  }
  return out;
}

// Matra lessons: words that use at least one "focus" matra and nothing beyond focus + "allow".
// ँ counts with अं (id "am") so a lesson on अं/ँ can ask for both.
export function wordsForMatras(words, matras, focus, allow = []) {
  const extra = [{ id: 'an', sign: '\u0901' }];
  const all = [...matras, ...extra];
  const ok = new Set([...focus, ...allow]);
  return words.filter((w) => {
    const used = all.filter((m) => w.hi.includes(m.sign)).map((m) => m.id);
    return used.some((id) => focus.includes(id)) && used.every((id) => ok.has(id));
  });
}

// A game's settings: content.games[game] with the lesson's own settings on top.
export function lessonConfig(content, lesson) {
  return { ...(content.games?.[lesson.game] || {}), ...(lesson.config || {}) };
}

// ---- Settings ----

export const DAILY_LIMITS = [0, 15, 20, 30, 45, 60];

export function defaultSettings(content) {
  const levels = content.levels || [];
  return {
    lang: 'both',
    level: (levels.find((l) => l.id === 'kg') || levels[0])?.id ?? null,
    onboarded: false,
    lockGrade: false,
    unlockAll: false,
    math: true, // English math worlds (NC standards) for Kindergarten and Grade 1
    captions: true, // show what the app says, as text
    retell: false, // after a story, the child records themselves telling it back (stays on this device)
    parentLang: 'en', // the parent area in English or Hindi
    showMode: 'watch', // Show time: 'watch' answers questions itself after a few seconds; 'play' waits for a tap
    dailyLimit: 0, // minutes of play a day before a break screen (0 = no limit)
    music: true,
    sfx: true,
    bigText: false, // larger text in the comics
    storyVoices: true, // use the story voice pack when it has been downloaded
    radioDark: false, // Story radio: a dark screen instead of the moving pictures (kinder on car rides)
    voice: { hi: '', en: '', rate: 0.9 },
  };
}

export function normalizeSettings(saved, content) {
  const base = defaultSettings(content);
  if (!saved || typeof saved !== 'object') return base;
  const out = { ...base, voice: { ...base.voice } };
  if (LANG_MODES.includes(saved.lang)) out.lang = saved.lang;
  if ((content.levels || []).some((l) => l.id === saved.level)) out.level = saved.level;
  if (DAILY_LIMITS.includes(saved.dailyLimit)) out.dailyLimit = saved.dailyLimit;
  if (saved.parentLang === 'hi' || saved.parentLang === 'en') out.parentLang = saved.parentLang;
  if (saved.showMode === 'watch' || saved.showMode === 'play') out.showMode = saved.showMode;
  for (const k of ['onboarded', 'lockGrade', 'unlockAll', 'math', 'captions', 'retell', 'music', 'sfx', 'bigText', 'storyVoices', 'radioDark']) if (typeof saved[k] === 'boolean') out[k] = saved[k];
  if (saved.voice && typeof saved.voice === 'object') {
    for (const l of ['hi', 'en']) if (typeof saved.voice[l] === 'string') out.voice[l] = saved.voice[l];
    if (typeof saved.voice.rate === 'number' && saved.voice.rate >= 0.5 && saved.voice.rate <= 1.3) out.voice.rate = saved.voice.rate;
  }
  return out;
}

export function defaultProgress(content) {
  const collected = {};
  for (const [id, col] of Object.entries(content.collections || {})) collected[id] = col.items.slice(0, col.start || 0);
  return { lessons: {}, collected, days: [], trainPos: {}, storyPos: {}, comicPos: {}, stats: {}, time: {}, shows: {} };
}

export function normalizeProgress(saved, content) {
  const base = defaultProgress(content);
  if (!saved || typeof saved !== 'object') return base;
  const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? { ...v } : {});
  // old saves kept vehicles in unlockedVehicles
  const oldCollected = Array.isArray(saved.unlockedVehicles) ? { vehicles: saved.unlockedVehicles } : {};
  const savedCollected = { ...oldCollected, ...obj(saved.collected) };
  const collected = {};
  for (const [id, col] of Object.entries(content.collections || {})) {
    const have = new Set([...base.collected[id], ...(Array.isArray(savedCollected[id]) ? savedCollected[id] : [])]);
    collected[id] = col.items.filter((x) => have.has(x));
  }
  const lessons = {};
  for (const [id, r] of Object.entries(obj(saved.lessons))) {
    if (!r || typeof r !== 'object') continue;
    lessons[id] = {
      stars: Math.max(0, Math.min(3, r.stars | 0)),
      plays: Math.max(0, r.plays | 0),
      tier: Math.max(0, Math.min(2, r.tier | 0)),
      // spaced review: which gap the lesson is on, and the day it was last played
      ...(Number.isInteger(r.box) ? { box: Math.max(0, Math.min(4, r.box)) } : {}),
      ...(typeof r.last === 'string' && /^\d{4}-\d\d-\d\d$/.test(r.last) ? { last: r.last } : {}),
      // first and latest score, 0–100
      ...(Number.isFinite(r.first) ? { first: Math.max(0, Math.min(100, Math.round(r.first))) } : {}),
      ...(Number.isFinite(r.recent) ? { recent: Math.max(0, Math.min(100, Math.round(r.recent))) } : {}),
    };
  }
  const time = {};
  for (const [day, sec] of Object.entries(obj(saved.time))) if (/^\d{4}-\d\d-\d\d$/.test(day) && Number.isFinite(sec) && sec >= 0) time[day] = Math.round(sec);
  return {
    lessons,
    collected,
    days: Array.isArray(saved.days) ? saved.days.filter((d) => typeof d === 'string').slice(-120) : [],
    trainPos: obj(saved.trainPos),
    storyPos: obj(saved.storyPos),
    // where each long comic was left: the furthest panel read, and whether its mystery was solved
    comicPos: Object.fromEntries(
      Object.entries(obj(saved.comicPos))
        .filter(([, r]) => r && typeof r === 'object' && Number.isInteger(r.panel) && r.panel >= 0)
        .map(([id, r]) => [id, { panel: Math.min(r.panel, 99), solved: r.solved === true }]),
    ),
    stats: obj(saved.stats),
    time,
    shows: Object.fromEntries(
      Object.entries(obj(saved.shows))
        .filter(([, r]) => r && typeof r === 'object' && typeof r.last === 'string' && /^\d{4}-\d\d-\d\d$/.test(r.last))
        .map(([id, r]) => [id, { views: Math.max(1, r.views | 0), last: r.last }]),
    ),
  };
}

// ---------- Show time ----------
// The beats an episode script can use (see README › Show time), and every spoken line in order
// with the key a family recording uses: show-<id>-<n>_hi / _en.
// Checked in this order: a beat can carry extra fields (a "letter" beat names its "word", a "say" beat may "do" something).
export const BEAT_KINDS = ['say', 'narrate', 'ask', 'echo', 'letter', 'build', 'enter', 'move', 'exit', 'do', 'show', 'word', 'glyph', 'tenframe', 'number', 'clear', 'sfx', 'wait'];
export const beatKind = (b) => BEAT_KINDS.find((k) => b && b[k] !== undefined) || null;

export function showLines(show) {
  const lines = [];
  const add = (text, beat) => text && (text.hi || text.en) && lines.push({ key: `show-${show.id}-${lines.length + 1}`, hi: text.hi || '', en: text.en || '', beat });
  for (const scene of show.scenes || [])
    for (const b of scene.beats || []) {
      const k = beatKind(b);
      if (k === 'say' || k === 'narrate' || k === 'build') add(b, b);
      else if (k === 'ask') {
        add(b.ask, b);
        add(b.then, b);
      } else if (k === 'echo') add(b.echo, b);
    }
  return lines;
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
  keys.push(...storyVoiceLines(content).map((l) => l.key));
  for (const show of content.shows || []) for (const l of showLines(show)) keys.push(...['hi', 'en'].filter((x) => l[x]).map((x) => `${l.key}_${x}`));
  for (const [k, p] of Object.entries(content.phrases)) {
    if (!p.hi.includes('{w}')) keys.push(`phrase-${k}_hi`);
    if (!p.en.includes('{w}')) keys.push(`phrase-${k}_en`);
  }
  keys.push(...voiceLines(content).map((l) => l.key));
  return [...new Set(keys)];
}

// "Bus_HI.m4a" -> "bus_hi"; letter ids keep their case-insensitive match.
export function clipKeyFromFileName(name, validKeys) {
  const base = name.replace(/\.[^.]+$/, '').trim().toLowerCase();
  return validKeys.find((k) => k.toLowerCase() === base) ?? null;
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
export function similarWords(target, pool, count, rng = Math.random, matras = [], lang = 'hi') {
  const en = lang === 'en';
  const first = (w) => (en ? w.en[0]?.toLowerCase() : graphemes(w.hi)[0]?.[0]);
  const size = (w) => (en ? w.en.length : graphemes(w.hi).length);
  const signs = new Set(en ? [] : matras.filter((m) => target.hi.includes(m.sign)).map((m) => m.sign));
  const len = size(target);
  const scored = pool
    .filter((w) => w.id !== target.id && w.hi !== target.hi && w.en !== target.en)
    .map((w) => {
      let score = rng();
      if (first(w) === first(target)) score += 2;
      for (const sgn of signs) if (w.hi.includes(sgn)) score += 1;
      if (Math.abs(size(w) - len) <= (en ? 1 : 0)) score += 1;
      return { w, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((x) => x.w);
}

export function sentenceTokens(text) {
  return text.trim().split(/\s+/);
}

// ---- Rhymes and word pairs ----

export function makeRhymeRound(groups, lang, rng = Math.random, wrong = 2) {
  const usable = groups.filter((g) => g.lang === lang && g.words.length >= 2);
  if (!usable.length) return null;
  const group = usable[Math.floor(rng() * usable.length)];
  const [target, answer] = sample(group.words, 2, rng);
  const others = shuffle(
    usable.filter((g) => g !== group).flatMap((g) => g.words).filter((id) => !group.words.includes(id)),
    rng,
  );
  const distractors = [...new Set(others)].slice(0, Math.max(1, wrong));
  return { lang, target, answer, options: shuffle([answer, ...distractors], rng) };
}

// kind: opposite (बड़ा -> छोटा), plural (केला -> केले) or female (शेर -> शेरनी).
// `count` is how many cars to choose from (the answer included).
export function makePairRound(sets, kinds, rng = Math.random, count = 3) {
  const usable = kinds.filter((k) => sets[k]?.length);
  const kind = usable[Math.floor(rng() * usable.length)];
  const pairs = sets[kind];
  const pair = pairs[Math.floor(rng() * pairs.length)];
  const flip = kind === 'opposite' && rng() < 0.5;
  const [from, to] = flip ? [pair[1], pair[0]] : pair;
  const rest = pairs.filter((p) => p !== pair);
  const distractors =
    kind === 'opposite' ? sample(rest.flat(), Math.max(1, count - 1), rng) : [from, ...sample(rest.map((p) => p[1]), Math.max(0, count - 2), rng)];
  return { kind, from, to, options: shuffle([to, ...distractors], rng) };
}

// ---- Learning stats and adaptive practice ----

// A stable key for anything a child answers: words, letters, matras (or barakhadi syllables), numbers.
// Grammar text: "[मीरा] दिल्ली में रहती है।" marks the part a card or question highlights.
export const markParts = (text) =>
  String(text)
    .split(/(\[[^\]]+\])/)
    .filter(Boolean)
    .map((p) => (p.startsWith('[') && p.endsWith(']') ? { mark: p.slice(1, -1) } : p));
export const unmark = (text) => String(text).replace(/[[\]]/g, '');
// A sentence as tappable words: punctuation stays with the word but doesn't count when matching.
const WORD_EDGE = /^[“”"'‘’(]+|[।,!?;:“”"'‘’()]+$/g;
export const tapTokens = (sentence) =>
  String(sentence)
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => ({ text: t, core: t.replace(WORD_EDGE, '') }));

export function itemKey(item) {
  if (!item || typeof item !== 'object') return null;
  if (typeof item.skill === 'string') return `s:${item.skill}`;
  if (typeof item.grammar === 'string') return `g:${item.grammar}`;
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
    const others = pool.filter((x) => key(x) !== prev);
    const options = others.length ? others : pool;
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

// Does a word in a story line name the page's picture? Hindi words are compared by their stem, so
// चूहा, चूहे and चूहों all match; English as the word or its plain plural (star, stars; not start).
const hiStem = (w) => w.replace(/[ऀ-ःऺ-ॏॢॣ]+$/u, '');
export function isKeyToken(token, word, lang) {
  const t = token.replace(/[।.!?,"“”‘’:;—-]/g, '');
  if (!t || !word) return false;
  if (lang === 'en') {
    const w = (word.en || '').toLowerCase().split(' ').pop();
    if (w.length < 3) return false;
    const lt = t.toLowerCase();
    return [w, `${w}s`, `${w}es`, `${w}'s`, `${w}’s`].includes(lt);
  }
  const parts = (word.hi || '').split(' ').map(hiStem).filter((s) => [...s].length >= 2);
  const ts = hiStem(t);
  return parts.some((s) => ts === s || (t.startsWith(s) && [...t].length - [...s].length <= 4));
}

// Every line a story's narrator reads: the title, each page and the moral, in each of the story's
// languages. `key` names the recording (a family one on the device, or the story voice pack).
export function storyVoiceLines(content) {
  const out = [];
  for (const st of content.stories || []) {
    const ls = st.lang === 'en' ? ['en'] : ['hi', 'en'];
    const add = (part, text, l) => text?.[l] && out.push({ key: `story-${st.id}-${part}_${l}`, text: text[l], lang: l, story: st.id });
    for (const l of ls) add('title', st.title, l);
    st.pages.forEach((p, i) => ls.forEach((l) => add(i + 1, p, l)));
    if (st.moral) for (const l of ls) add('moral', st.moral, l);
    (st.questions || []).forEach((q, i) => ls.forEach((l) => add(`q${i + 1}`, q, l)));
  }
  return out;
}

// The pieces of a prompt around its {w}: "यह {w} है" is read as "यह", the word, then "है".
export const phrasePartKey = (key, i, lang) => `phrase-${key}-${i + 1}_${lang}`;
export function phraseParts(template) {
  return splitTemplate(template)
    .filter((p) => typeof p === 'string')
    .map((p) => p.trim())
    .filter((p) => /[\p{L}\p{N}]/u.test(p));
}

// Everything else the app says in its own words: the prompts (whole, or the pieces around a word), every
// picture word, and the guides' jokes. With these in the voice pack the narrator says all of it.
export function appVoiceLines(content) {
  const out = [];
  for (const [k, p] of Object.entries(content.phrases || {}))
    for (const l of ['hi', 'en']) {
      if (!p[l]) continue;
      if (!p[l].includes('{w}')) out.push({ key: `phrase-${k}_${l}`, text: p[l], lang: l });
      else phraseParts(p[l]).forEach((text, i) => out.push({ key: phrasePartKey(k, i, l), text, lang: l }));
    }
  for (const [id, w] of Object.entries(content.words || {})) for (const l of ['hi', 'en']) if (w[l]) out.push({ key: `${id}_${l}`, text: w[l], lang: l });
  (content.mascotLines || []).forEach((m, i) => ['hi', 'en'].forEach((l) => m[l] && out.push({ key: `mascot-${i + 1}_${l}`, text: m[l], lang: l })));
  return out;
}

export function voiceLines(content) {
  const out = [...storyVoiceLines(content), ...appVoiceLines(content)];
  const byKey = new Map(out.map((l) => [l.key, l]));
  for (const l of lessonVoiceLines(content)) {
    const had = byKey.get(l.key);
    if (!had) byKey.set(l.key, l) && out.push(l);
    // shared with a line that has no grade (a picture word, a prompt): every grade needs it
    else if (had.level !== l.level && !had.story) delete had.level;
  }
  return out;
}

// ---- recordings named after what they say ----
// Many lines in the lessons are spoken straight from their text (a grammar rule, a quiz question, a
// syllable). Their recordings are named after the text itself, so any fixed line the app says can come
// from the voice pack without each game naming it. FNV-1a over the text, plus its length.
export const normText = (text) => String(text ?? '').replace(/\s+/g, ' ').trim();
export function textKey(lang, text) {
  const t = normText(text);
  let h = 0x811c9dc5;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 0x01000193) >>> 0;
  return `t-${lang}-${h.toString(36)}${t.length.toString(36)}`;
}

const QUIZ_GAP = '___';
const bareToken = (t) => t.replace(/[।.!?,"“”‘’]/g, '');

// Every fixed line a lesson says, with the grade it belongs to (none = every grade needs it): letters,
// numbers, animal sounds, sentences and their words, the barakhadi rows, word tiles, quizzes, sorting
// games, grammar, Show time, and the words a child can tap in a story.
export function lessonVoiceLines(content) {
  // a line used in more than one grade (or with no grade) is shared by every grade
  const lines = new Map();
  const push = (key, text, lang, level = null) => {
    text = normText(text);
    if (!text || !/[\p{L}\p{N}]/u.test(text)) return;
    const had = lines.get(key);
    if (!had) lines.set(key, { key, text, lang, level });
    else if (had.level !== level) had.level = null;
  };
  const byText = (text, lang, level) => push(textKey(lang, text), text, lang, level);
  const levelsOf = (pred) => [...new Set(content.worlds.filter((w) => w.units.some((u) => u.lessons.some(pred))).map((w) => w.level))];
  const oneLevel = (pred) => {
    const ls = levelsOf(pred);
    return ls.length === 1 ? ls[0] : null;
  };

  // named recordings
  for (const s of content.letterSets || []) for (const l of s.letters) push(l.id, l.say || (s.lang === 'en' ? l.char.toUpperCase() : l.char), s.lang);
  for (const n of content.numbers || []) for (const lg of ['hi', 'en']) push(`num-${n.value}_${lg}`, n[lg], lg);
  for (const [id, w] of Object.entries(content.words || {})) if (w.sound) for (const lg of ['hi', 'en']) push(`${id}-sound_${lg}`, w.sound[lg], lg);
  for (const s of content.sentences || [])
    for (const lg of ['hi', 'en']) {
      push(`sentence-${s.id}_${lg}`, s[lg], lg, s.level);
      for (const t of String(s[lg] || '').split(/\s+/)) byText(bareToken(t), lg, s.level);
    }
  for (const sh of content.shows || []) for (const l of showLines(sh)) for (const lg of ['hi', 'en']) push(`${l.key}_${lg}`, l[lg], lg, sh.level);

  // the barakhadi: each lesson's rows, said together, and each syllable on its own
  const matras = new Map((content.matras || []).map((m) => [m.id, m]));
  for (const w of content.worlds)
    for (const u of w.units)
      for (const lesson of u.lessons) {
        const cfg = lesson.config || {};
        if (lesson.game !== 'matra' || !cfg.consonants || !cfg.matras) continue;
        const ms = cfg.matras.map((id) => matras.get(id)).filter(Boolean);
        for (const c of cfg.consonants) {
          const row = barakhadi(c, ms);
          byText(row.map((r) => r.text).join(' '), 'hi', w.level);
          for (const r of row) byText(r.text, 'hi');
        }
      }
  for (const c of content.letterSets?.find((s) => s.id === 'hindiConsonants')?.letters || []) for (const m of matras.values()) byText(c.char + m.sign, 'hi');

  // word tiles (the crane builds words from them), in both languages
  for (const w of Object.values(content.words || {})) {
    if (w.hi) for (const t of splitTiles(w, 'hi')) byText(t, 'hi');
    if (w.en) for (const t of splitTiles(w, 'en')) byText(t, 'en');
  }

  // quizzes: the question (both languages), the line with its gap, the answer and every option
  for (const [id, bank] of Object.entries(content.quizzes || {})) {
    const level = oneLevel((l) => l.config?.bank === id);
    for (const q of bank.questions || []) {
      for (const lg of ['hi', 'en']) byText(q[lg], lg, level);
      if (q.show) byText(q.show.replace(QUIZ_GAP, ' … '), 'hi', level);
      byText(q.say || (q.show ? q.show.replace(QUIZ_GAP, q.answer) : q.pictures ? content.words[q.answer]?.hi : q.answer), 'hi', level);
      if (!q.pictures) for (const o of q.options || []) byText(o, 'hi', level);
    }
  }

  // sorting games: the instruction, the boxes and each item
  for (const [id, def] of Object.entries(content.sorts || {})) {
    const level = oneLevel((l) => l.config?.sort === id);
    for (const lg of ['hi', 'en']) {
      byText(def.prompt?.[lg], lg, level);
      for (const b of def.bins || []) byText(b[lg], lg, level);
    }
    for (const it of def.items || []) byText(it.text, 'hi', level);
  }

  // grammar: each rule card (title, text, examples), each practice question with its sentence, each "why"
  for (const t of Object.values(content.grammar || {})) {
    for (const c of t.learn || []) for (const x of [c.title, c.text, ...(c.examples || [])]) if (x) byText(unmark(x), 'hi', t.level);
    for (const q of t.practice || []) {
      byText(unmark(q.q + (q.s ? `। ${q.s}` : '')), 'hi', t.level);
      if (q.why) byText(unmark(q.why), 'hi', t.level);
    }
  }

  // the words a child can tap in a story, and the sentence tokens
  for (const st of content.stories || []) for (const p of st.pages) for (const lg of ['hi', 'en']) for (const t of String(p[lg] || '').split(/\s+/)) byText(bareToken(t), lg, st.level);
  return [...lines.values()].map(({ level, ...l }) => (level ? { ...l, level } : l));
}
