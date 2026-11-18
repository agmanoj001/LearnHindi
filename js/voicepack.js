// The voice pack: recorded narration for every story (title, pages, questions, moral) and for the app's
// own prompts, words and guides' jokes, made once with a natural Hindi and English voice
// (tools/make-voices.mjs) and kept in voices/. It is not part of the
// app's first download: a grown-up downloads it, a grade at a time or all at once, from the grown-ups'
// area, and then it plays offline. A family recording of the same page always wins over it.
//
// How it is kept on the device: each bundle (voices/packs/*.bin, about 7.5 MB, tools/voice-bundles.mjs) is
// saved whole, as one entry of the voice cache, beside a short list of the recordings in it and where each
// one starts. A recording plays as a slice of its bundle. The whole pack is under a hundred entries, so the
// app sees at once what is saved. (Until November 2026 the bundles were cut into one entry per recording,
// 31,000 of them: a phone took minutes to write them, and the browser then refused to list them,
// "Operation too large", so the app thought nothing was saved. Recordings saved that way still play: they
// are found by their exact address, never by listing the old cache, until a grown-up updates them.)
export const VOICE_CACHE = 'kkm-voices-2';
export const OLD_VOICE_CACHE = 'kkm-voices';
export const VOICE_INDEX = 'voices/index.json';
// a recording saved on its own (the old way)
export const voiceUrl = (key) => `voices/${key}.mp3`;
export const WORDS_FILE = 'voices/words.json';

const hasCaches = () => typeof caches !== 'undefined';
const openCache = () => (hasCaches() ? caches.open(VOICE_CACHE) : Promise.resolve(null));
// the old cache, only if it is there (caches.open would make an empty one)
const openOldCache = async () => (hasCaches() && (await caches.has(OLD_VOICE_CACHE)) ? caches.open(OLD_VOICE_CACHE) : null);

const hash = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(36);
};

// A bundle's edition: it changes whenever a recording in it changes (its words, or how it was made), so a
// bundle saved from an older edition is fetched again, and its old copy goes.
export function bundleId(idx, p) {
  let s = `${p.file}|${p.bytes}`;
  for (const [key, off, len] of p.items) s += `|${key}:${off}:${len}:${idx?.sums?.[key] || ''}`;
  return hash(s);
}
export const bundleKey = (p, id) => `voices/${p.file}?v=${id}`;
const listKey = (p, id) => `voices/${p.file.replace(/\.bin$/, '')}.list.json?v=${id}`;
const LIST_RE = /\/voices\/(packs\/.+)\.list\.json$/;

// ---- what this device has ----
// { at: Map(key -> where it is), bundles: Map(bundle file -> edition), old: count saved the old way }
// where: { bundle: cache address, off, len, sum } for a slice of a bundle, { url, sum } for an old recording
let saved = null;
const empty = () => ({ at: new Map(), bundles: new Map(), old: 0 });
export function savedVoices({ refresh = false } = {}) {
  if (!saved || refresh) saved = readSaved().catch(() => empty());
  return saved;
}
async function readSaved() {
  const state = empty();
  if (!hasCaches()) return state;
  // the old way first, so a bundle saved since wins. A bundle's recordings were saved together: its first
  // and last recording tell whether it is there (exact lookups, quick however many there are)
  const old = await openOldCache();
  // (the old way saved its index last: a download cut short has none, so the current one says what to look for)
  const oldIdx = old && ((await old.match(VOICE_INDEX).then((r) => r?.json()).catch(() => null)) || (await loadIndex()));
  if (old && oldIdx?.packs) {
    const has = (key) => old.match(voiceUrl(key)).then(Boolean, () => false);
    const found = await Promise.all(oldIdx.packs.map((p) => (p.items.length ? Promise.all([has(p.items[0][0]), has(p.items[p.items.length - 1][0])]) : [false])));
    oldIdx.packs.forEach((p, i) => {
      if (!found[i].every(Boolean)) return;
      for (const [key] of p.items) state.at.set(key, { url: voiceUrl(key), sum: oldIdx.sums?.[key] });
    });
  }
  // the bundles: a list beside each one says what is in it
  const cache = await openCache();
  for (const req of await cache.keys()) {
    const url = new URL(req.url);
    const m = url.pathname.match(LIST_RE);
    const id = url.searchParams.get('v');
    if (!m || !id) continue;
    const items = await cache
      .match(req)
      .then((r) => r?.json())
      .catch(() => null);
    if (!Array.isArray(items)) continue;
    const file = `${m[1]}.bin`;
    const at = `voices/${file}?v=${id}`;
    state.bundles.set(file, id);
    for (const [key, off, len, sum] of items) state.at.set(key, { bundle: at, off, len, sum });
  }
  for (const loc of state.at.values()) if (loc.url) state.old++;
  return state;
}

// The recordings saved on this device, as clip keys (in any form).
export async function savedVoiceKeys() {
  return new Set((await savedVoices()).at.keys());
}
// The recordings saved as bundles of this edition: nothing to fetch for them.
export function currentKeys(idx, state) {
  const out = new Set();
  for (const p of idx?.packs || []) if (state?.bundles.get(p.file) === bundleId(idx, p)) for (const [key] of p.items) out.add(key);
  return out;
}

// ---- the index ----
let index = null;
// voices/index.json: { version, voices, files: { key: bytes }, stories: { id: level }, levels, sums, packs }
export async function loadIndex() {
  if (index) return index;
  try {
    const res = await fetch(VOICE_INDEX, { cache: 'no-cache' });
    if (res.ok) index = await res.json();
  } catch {
    /* offline: the copy saved with the pack */
  }
  if (index) savedVoices().then((s) => forgetChanged(s, index));
  else index = await savedIndex();
  return index;
}
async function savedIndex() {
  for (const open of [openCache, openOldCache]) {
    const cache = await open().catch(() => null);
    const res = cache && (await cache.match(VOICE_INDEX).catch(() => null));
    const idx = res && (await res.json().catch(() => null));
    if (idx) return idx;
  }
  return null;
}

// When a line's words change (a caption fixed, say), the pack records it again under the same name. A
// device that saved the old recording would go on saying the old words, so a line whose words changed
// since it was saved is left to the device voice until a grown-up downloads the pack again, which fetches
// only the bundles holding such lines.
export function changedKeys(saved, fresh) {
  if (!saved?.sums || !fresh?.sums) return [];
  return Object.keys(saved.sums).filter((k) => saved.sums[k] !== fresh.sums[k]);
}
export function forgetChanged(state, fresh) {
  if (!state || !fresh?.sums) return state;
  for (const [key, loc] of state.at) if (loc.sum && fresh.sums[key] && loc.sum !== fresh.sums[key]) state.at.delete(key);
  return state;
}

// The pack's files for some grades (all of them when `levels` is empty), with their size. Story lines
// belong to their story's grade, lesson lines to their lesson's grade (index.levels); everything else
// (the prompts, words, letters, guides' jokes) is shared, so it comes with every grade.
export const storyOfKey = (key) => key.match(/^story-(.+)-(?:title|moral|q\d+|\d+)_(?:hi|en)$/)?.[1] || null;
// the maths pieces every maths grade shares (the number speller, the hands-on games: roadmap 6.8) come with
// the grades that have maths, not with Grades 7 and 8
export const MATHS_LEVELS = ['kg', 'grade1', 'grade2', 'grade3', 'grade4'];
export function packFiles(idx, levels = []) {
  if (!idx?.files) return [];
  const want = new Set(levels);
  if (levels.some((l) => MATHS_LEVELS.includes(l))) want.add('maths');
  return Object.entries(idx.files)
    .filter(([key]) => {
      if (!want.size) return true;
      const story = storyOfKey(key);
      const level = story ? idx.stories?.[story] : idx.levels?.[key];
      return !level || want.has(level);
    })
    .map(([key, bytes]) => ({ key, bytes }));
}

// The bundles to fetch for some recordings: every bundle holding one that isn't saved yet.
export function bundlesFor(idx, files, have = new Set()) {
  const want = new Set(files.filter((f) => !have.has(f.key)).map((f) => f.key));
  return (idx?.packs || []).filter((p) => p.items.some(([key]) => want.has(key)));
}

// ---- downloading ----
// Fetch the bundles holding some recordings, two at a time, and save each whole, with its list; a bundle
// already saved in this edition is skipped, so a download that was interrupted carries on. Each bundle is
// two writes, so the bar's 100% is the end of the download. Once every recording saved the old way is
// saved as a bundle too, the old cache goes, in one step. onProgress(bytesDone, bytesTotal). Returns how
// many recordings failed.
export async function downloadVoices(files, onProgress = () => {}) {
  const cache = await openCache();
  if (!cache) throw new Error('This browser cannot save files for offline use.');
  const idx = await loadIndex();
  if (!idx?.packs?.length) throw new Error('The story voices are not available yet.');
  const todo = bundlesFor(idx, files, currentKeys(idx, await savedVoices()));
  const total = todo.reduce((a, p) => a + p.bytes, 0);
  const got = new Map();
  const report = () => onProgress([...got.values()].reduce((a, b) => a + b, 0), total);
  report();
  let failed = 0;
  let madeRoom = false;
  const next = async () => {
    for (let p = todo.shift(); p; p = todo.shift()) {
      const id = bundleId(idx, p);
      try {
        const buf = await fetchWithProgress(`voices/${p.file}?v=${id}`, (n) => (got.set(p.file, n), report()));
        if (buf.length < p.bytes) throw new Error('short');
        await saveBundle(cache, idx, p, id, buf);
        got.set(p.file, p.bytes);
        report();
      } catch (e) {
        // the phone is full: the copies saved the old way go first (they are being replaced), then try again
        if (e?.name === 'QuotaExceededError' && !madeRoom && (await caches.has(OLD_VOICE_CACHE))) {
          madeRoom = true;
          await caches.delete(OLD_VOICE_CACHE);
          todo.unshift(p);
          continue;
        }
        failed += p.items.length;
        got.delete(p.file);
      }
    }
  };
  await Promise.all([next(), next()]);
  // keep the index too, so the pack is known offline; and the word timings
  await fetch(VOICE_INDEX).then((r) => r.ok && cache.put(VOICE_INDEX, r)).catch(() => {});
  await fetch(WORDS_FILE).then((r) => r.ok && cache.put(WORDS_FILE, r)).catch(() => {});
  wordTimes = null;
  const now = await savedVoices({ refresh: true });
  if ((await caches.has(OLD_VOICE_CACHE)) && ![...now.at].some(([key, loc]) => loc.url && idx.files?.[key])) {
    await caches.delete(OLD_VOICE_CACHE);
    await savedVoices({ refresh: true });
  }
  return failed;
}

// One bundle: the bytes and their list, then the bundle it replaces (an older edition) goes.
async function saveBundle(cache, idx, p, id, buf) {
  const before = (await savedVoices()).bundles.get(p.file);
  await cache.put(bundleKey(p, id), new Response(new Blob([buf], { type: 'application/octet-stream' })));
  const list = p.items.map(([key, off, len]) => [key, off, len, idx.sums?.[key] || '']);
  await cache.put(listKey(p, id), new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } }));
  if (before && before !== id) await Promise.all([cache.delete(bundleKey(p, before)), cache.delete(listKey(p, before))]);
}

// A whole file as bytes, telling onBytes how much has arrived so far.
async function fetchWithProgress(url, onBytes) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  if (!res.body?.getReader) return new Uint8Array(await res.arrayBuffer());
  const reader = res.body.getReader();
  const chunks = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    n += value.length;
    onBytes(n);
  }
  const out = new Uint8Array(n);
  let at = 0;
  for (const c of chunks) out.set(c, (at += c.length) - c.length);
  return out;
}

// ---- playing ----
// One recording as audio: a slice of its bundle (the bundle is opened once and kept for the next lines; a
// few at a time), or a recording saved the old way.
const open = new Map();
export async function voiceBlob(key) {
  const loc = (await savedVoices()).at.get(key);
  if (!loc) return null;
  try {
    if (loc.url) {
      const old = await openOldCache();
      const res = old && (await old.match(loc.url));
      return res ? await res.blob() : null;
    }
    let bundle = open.get(loc.bundle);
    if (bundle) open.delete(loc.bundle);
    else bundle = openCache().then((c) => c.match(loc.bundle)).then((r) => (r ? r.blob() : null));
    open.set(loc.bundle, bundle);
    if (open.size > 4) open.delete(open.keys().next().value);
    const blob = await bundle;
    if (!blob) open.delete(loc.bundle);
    return blob ? blob.slice(loc.off, loc.off + loc.len, 'audio/mpeg') : null;
  } catch {
    open.delete(loc.bundle);
    return null;
  }
}

// When each word of a story page starts in its recording, as fractions of the recording
// (tools/align-words.mjs). Saved with the pack; a device that downloaded the pack before the timings
// existed fetches them once. A recording made again since its timings were made is left untimed.
let wordTimes = null;
export function loadWordTimes() {
  wordTimes ||= (async () => {
    const cache = await openCache().catch(() => null);
    let res = cache && (await cache.match(WORDS_FILE).catch(() => null));
    if (!res) res = await openOldCache().then((c) => c?.match(WORDS_FILE)).catch(() => null);
    if (!res) {
      res = await fetch(WORDS_FILE).catch(() => null);
      if (res?.ok && cache) await cache.put(WORDS_FILE, res.clone()).catch(() => {});
    }
    const words = res?.ok !== false ? (await res?.json().catch(() => null))?.words : null;
    const idx = await loadIndex();
    return { words: words || {}, sums: idx?.sums || {} };
  })();
  return wordTimes;
}
export function timesFor(table, key, nWords) {
  const t = table?.words?.[key];
  if (!t || t.f.length !== nWords || (table.sums[key] && table.sums[key] !== t.s)) return null;
  return t.f;
}

export async function removeVoices() {
  if (hasCaches()) await Promise.all([caches.delete(VOICE_CACHE), caches.delete(OLD_VOICE_CACHE)]);
  open.clear();
  await savedVoices({ refresh: true });
}

export const formatMB = (bytes) => `${(bytes / 1048576).toFixed(bytes < 10485760 ? 1 : 0)} MB`;
