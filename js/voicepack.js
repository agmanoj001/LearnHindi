// The voice pack: recorded narration for every story (title, pages, questions, moral) and for the app's
// own prompts, words and guides' jokes, made once with a natural Hindi and English voice
// (tools/make-voices.mjs) and kept in voices/. It is not part of the
// app's first download: a grown-up downloads it, a grade at a time or all at once, from the grown-ups'
// area, and then it plays offline. A family recording of the same page always wins over it.
export const VOICE_CACHE = 'kkm-voices';
export const VOICE_INDEX = 'voices/index.json';
export const voiceUrl = (key) => `voices/${key}.mp3`;

let index = null;

// voices/index.json: { version, voices: { hi, en }, files: { key: bytes }, stories: { id: level } }
export async function loadIndex() {
  if (index) return index;
  try {
    const res = await fetch(VOICE_INDEX, { cache: 'no-cache' });
    if (res.ok) index = await res.json();
  } catch {
    /* offline and never fetched: no pack to offer */
  }
  if (!index) {
    const cached = await openCache().then((c) => c?.match(VOICE_INDEX)).catch(() => null);
    if (cached) index = await cached.json().catch(() => null);
  }
  return index;
}

const openCache = () => (typeof caches === 'undefined' ? Promise.resolve(null) : caches.open(VOICE_CACHE));

// Which edition of the recordings this device saved (index.audioVersion when it downloaded them).
const VERSION_KEY = 'voices/audio-version';
export async function savedAudioVersion() {
  const cache = await openCache().catch(() => null);
  const res = cache && (await cache.match(VERSION_KEY).catch(() => null));
  return res ? Number(await res.text()) || 1 : 1;
}

// The recordings already saved on this device, as clip keys.
export async function savedVoiceKeys() {
  const cache = await openCache().catch(() => null);
  if (!cache) return new Set();
  const reqs = await cache.keys();
  const keys = new Set();
  for (const r of reqs) {
    const m = new URL(r.url).pathname.match(/voices\/([^/]+)\.mp3$/);
    if (m) keys.add(decodeURIComponent(m[1]));
  }
  return keys;
}

// The pack's files for some grades (all of them when `levels` is empty), with their size. Story lines
// belong to their story's grade, lesson lines to their lesson's grade (index.levels); everything else
// (the prompts, words, letters, guides' jokes) is shared, so it comes with every grade.
export const storyOfKey = (key) => key.match(/^story-(.+)-(?:title|moral|q\d+|\d+)_(?:hi|en)$/)?.[1] || null;
export function packFiles(idx, levels = []) {
  if (!idx?.files) return [];
  const want = new Set(levels);
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

// Save recordings into the cache. With bundles (index.packs): fetch each bundle whole, two at a time,
// and cut it into its recordings on the device; a bundle already saved is skipped, so a download that
// was interrupted carries on. onProgress(bytesDone, bytesTotal). Returns how many recordings failed.
export async function downloadVoices(files, onProgress = () => {}, { fresh = false } = {}) {
  const cache = await openCache();
  if (!cache) throw new Error('This browser cannot save files for offline use.');
  const idx = await loadIndex();
  // fresh: a newer edition of the recordings replaces the ones saved (they keep playing until then)
  const have = fresh ? new Set() : await savedVoiceKeys();
  let failed = 0;
  if (idx?.packs?.length) {
    const todo = bundlesFor(idx, files, have);
    const total = todo.reduce((a, p) => a + p.bytes, 0);
    const got = new Map();
    const report = () => onProgress([...got.values()].reduce((a, b) => a + b, 0), total);
    report();
    const next = async () => {
      for (let p = todo.shift(); p; p = todo.shift()) {
        try {
          const buf = await fetchWithProgress(`voices/${p.file}`, (n) => (got.set(p.file, n), report()));
          if (buf.length < p.bytes) throw new Error('short');
          await Promise.all(p.items.map(([key, off, len]) => cache.put(voiceUrl(key), new Response(new Blob([buf.subarray(off, off + len)], { type: 'audio/mpeg' })))));
          got.set(p.file, p.bytes);
          report();
        } catch {
          failed += p.items.length;
          got.delete(p.file);
        }
      }
    };
    await Promise.all([next(), next()]);
  } else {
    // no bundles: one recording at a time (slow; kept for an older index)
    const todo = files.filter((f) => !have.has(f.key));
    let done = 0;
    const next = async () => {
      for (let f = todo.shift(); f; f = todo.shift()) {
        try {
          const res = await fetch(voiceUrl(f.key));
          if (!res.ok) throw new Error(res.status);
          await cache.put(voiceUrl(f.key), res);
        } catch {
          failed++;
        }
        onProgress(++done, files.length);
      }
    };
    await Promise.all(Array.from({ length: 6 }, next));
  }
  // keep the index too, so the pack is known offline, and which edition this is
  await fetch(VOICE_INDEX).then((r) => r.ok && cache.put(VOICE_INDEX, r)).catch(() => {});
  if (!failed && idx?.audioVersion) await cache.put(VERSION_KEY, new Response(String(idx.audioVersion)));
  return failed;
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

export async function removeVoices() {
  if (typeof caches !== 'undefined') await caches.delete(VOICE_CACHE);
}

export const formatMB = (bytes) => `${(bytes / 1048576).toFixed(bytes < 10485760 ? 1 : 0)} MB`;
