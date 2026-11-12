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

// The recordings already saved on this device, as clip keys.
export async function savedVoiceKeys() {
  const cache = await openCache().catch(() => null);
  if (!cache) return new Set();
  const reqs = await cache.keys();
  const keys = new Set();
  for (const r of reqs) {
    const m = new URL(r.url).pathname.match(/voices\/(.+)\.mp3$/);
    if (m) keys.add(decodeURIComponent(m[1]));
  }
  return keys;
}

// The pack's files for some grades (all of them when `levels` is empty), with their size. Story lines
// belong to their story's grade; everything else (the app's prompts, the words, the guides' jokes) is
// shared, so it comes with every grade.
export const storyOfKey = (key) => key.match(/^story-(.+)-(?:title|moral|q\d+|\d+)_(?:hi|en)$/)?.[1] || null;
export function packFiles(idx, levels = []) {
  if (!idx?.files) return [];
  const want = new Set(levels);
  return Object.entries(idx.files)
    .filter(([key]) => {
      if (!want.size) return true;
      const story = storyOfKey(key);
      return !story || want.has(idx.stories?.[story]);
    })
    .map(([key, bytes]) => ({ key, bytes }));
}

// Save files into the cache, a few at a time; onProgress(done, total). Returns how many failed.
export async function downloadVoices(files, onProgress = () => {}) {
  const cache = await openCache();
  if (!cache) throw new Error('This browser cannot save files for offline use.');
  const have = await savedVoiceKeys();
  const todo = files.filter((f) => !have.has(f.key));
  let done = files.length - todo.length;
  let failed = 0;
  onProgress(done, files.length);
  const next = async () => {
    for (let f = todo.shift(); f; f = todo.shift()) {
      try {
        const res = await fetch(voiceUrl(f.key), { cache: 'no-cache' });
        if (!res.ok) throw new Error(res.status);
        await cache.put(voiceUrl(f.key), res);
      } catch {
        failed++;
      }
      onProgress(++done, files.length);
    }
  };
  await Promise.all(Array.from({ length: 6 }, next));
  // keep the index too, so the pack is known offline
  await fetch(VOICE_INDEX).then((r) => r.ok && cache.put(VOICE_INDEX, r)).catch(() => {});
  return failed;
}

export async function removeVoices() {
  if (typeof caches !== 'undefined') await caches.delete(VOICE_CACHE);
}

export const formatMB = (bytes) => `${(bytes / 1048576).toFixed(bytes < 10485760 ? 1 : 0)} MB`;
