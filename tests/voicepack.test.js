// The voice pack on the device (js/voicepack.js): saved as whole bundles, found again without listing a big
// cache, and recordings saved the old way (one entry each) still played and then replaced. A small
// CacheStorage in memory stands in for the browser's; like Chrome, it refuses to list a cache with too many
// entries ("Operation too large"), which is what left a phone with 31,000 saved recordings silent.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const BASE = 'https://app.test/';
const abs = (r) => new URL(typeof r === 'string' ? r : r.url, BASE).href;
let budget = Infinity; // bytes the "phone" can hold, across every cache
const used = () => [...store.values()].reduce((a, c) => a + c.bytes(), 0);
class FakeCache {
  constructor() {
    this.m = new Map();
    this.lists = 0;
  }
  bytes() {
    return [...this.m.values()].reduce((a, e) => a + e.body.byteLength, 0);
  }
  async match(r) {
    const e = this.m.get(abs(r));
    return e ? new Response(e.body.slice(0), { headers: e.headers }) : undefined;
  }
  async put(r, res) {
    const body = await res.arrayBuffer();
    if (used() + body.byteLength > budget) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    this.m.set(abs(r), { body, headers: Object.fromEntries(res.headers) });
  }
  async delete(r) {
    return this.m.delete(abs(r));
  }
  async keys() {
    this.lists++;
    if (this.m.size > 500) throw new DOMException("Failed to execute 'keys' on 'Cache': Operation too large.", 'AbortError');
    return [...this.m.keys()].map((url) => ({ url }));
  }
}
const store = new Map();
globalThis.caches = {
  async open(n) {
    if (!store.has(n)) store.set(n, new FakeCache());
    return store.get(n);
  },
  async has(n) {
    return store.has(n);
  },
  async delete(n) {
    return store.delete(n);
  },
};

// a small pack: a Toddler bundle of 600 story lines (more than the cache can list one by one) and a shared one
function makePack(sums = {}) {
  const idx = { version: 'v1', audioVersion: 2, files: {}, stories: { t: 'toddler' }, levels: {}, sums: {}, packs: [] };
  const bins = new Map();
  const bundle = (file, level, keys) => {
    const parts = [];
    const items = [];
    let off = 0;
    for (const k of keys) {
      const b = Buffer.from(`mp3:${k};`);
      items.push([k, off, b.length]);
      parts.push(b);
      off += b.length;
      idx.files[k] = b.length;
      idx.sums[k] = sums[k] || 's1';
    }
    idx.packs.push({ file, group: level || 'shared', level, bytes: off, items });
    bins.set(file, Buffer.concat(parts));
  };
  bundle('packs/toddler-1.bin', 'toddler', Array.from({ length: 600 }, (_, i) => `story-t-${i}_hi`));
  bundle('packs/shared-1.bin', null, Array.from({ length: 10 }, (_, i) => `w${i}_hi`));
  return { idx, bins, fetched: [] };
}
let server = makePack();
globalThis.fetch = async (url) => {
  const path = new URL(String(url), BASE).pathname.slice(1);
  if (path === 'voices/index.json') return new Response(JSON.stringify(server.idx));
  if (path === 'voices/words.json') return new Response(JSON.stringify({ words: {} }));
  const m = path.match(/^voices\/(packs\/.+\.bin)$/);
  if (m && server.bins.has(m[1])) {
    server.fetched.push(m[1]);
    return new Response(server.bins.get(m[1]));
  }
  return new Response('missing', { status: 404 });
};
// a fresh copy of the module (its memory of the index and of what is saved), on the same "phone"
let n = 0;
const fresh = () => import(`../js/voicepack.js?case=${++n}`);
const text = async (blob) => (blob ? Buffer.from(await blob.arrayBuffer()).toString() : null);
const reset = () => {
  store.clear();
  budget = Infinity;
  server = makePack();
};

test('voice pack: a grade is saved as a few whole bundles, found again at once, and each recording plays as a slice', async () => {
  reset();
  const vp = await fresh();
  const idx = await vp.loadIndex();
  const files = vp.packFiles(idx, ['toddler']);
  assert.equal(files.length, 610);
  let last = null;
  assert.equal(await vp.downloadVoices(files, (done, total) => (last = [done, total])), 0);
  // the bar ends at 100% when the download is really done
  assert.equal(last[0], last[1]);
  // two entries a bundle (the bytes and their list), plus the index and the word timings: not 610
  assert.ok(store.get('kkm-voices-2').m.size <= 6, `${store.get('kkm-voices-2').m.size} entries`);
  // on the next start, everything is known again, and a recording plays
  const next = await fresh();
  const state = await next.savedVoices();
  assert.equal(state.at.size, 610);
  assert.equal(next.currentKeys(idx, state).size, 610);
  assert.equal(await text(await next.voiceBlob('story-t-7_hi')), 'mp3:story-t-7_hi;');
  assert.equal(await text(await next.voiceBlob('w3_hi')), 'mp3:w3_hi;');
  assert.equal(await next.voiceBlob('not-saved_hi'), null);
  // downloading again fetches nothing
  const before = server.fetched.length;
  assert.equal(await next.downloadVoices(files), 0);
  assert.equal(server.fetched.length, before);
});

test('voice pack: recordings saved the old way (one entry each, too many to list) still play, and are replaced in one step', async () => {
  reset();
  // what the app used to do: every recording its own entry, and the index beside them
  const old = await caches.open('kkm-voices');
  await old.put('voices/index.json', new Response(JSON.stringify(server.idx)));
  for (const p of server.idx.packs) for (const [k, off, len] of p.items) await old.put(`voices/${k}.mp3`, new Response(server.bins.get(p.file).subarray(off, off + len)));
  await assert.rejects(old.keys(), /Operation too large/);
  const vp = await fresh();
  const state = await vp.savedVoices();
  assert.equal(state.at.size, 610, 'found by exact lookups, without listing the old cache');
  assert.equal(state.old, 610);
  assert.equal(old.lists, 1, 'the app itself never lists the old cache');
  assert.equal(await text(await vp.voiceBlob('story-t-42_hi')), 'mp3:story-t-42_hi;');
  // the grown-up updates them: the bundles are saved, then the old cache goes
  const idx = await vp.loadIndex();
  const oldWay = vp.packFiles(idx).filter((f) => state.at.get(f.key)?.url);
  assert.equal(await vp.downloadVoices(oldWay), 0);
  assert.equal(await caches.has('kkm-voices'), false);
  const now = await vp.savedVoices();
  assert.equal(now.old, 0);
  assert.equal(now.at.size, 610);
  assert.equal(await text(await vp.voiceBlob('story-t-42_hi')), 'mp3:story-t-42_hi;');
});

test('voice pack: an old-way download cut short (no index saved) is still found', async () => {
  reset();
  const old = await caches.open('kkm-voices');
  for (const p of server.idx.packs) for (const [k, off, len] of p.items) await old.put(`voices/${k}.mp3`, new Response(server.bins.get(p.file).subarray(off, off + len)));
  const vp = await fresh();
  assert.equal((await vp.savedVoices()).at.size, 610);
});

test('voice pack: on a full phone, the old copies make room for the new ones', async () => {
  reset();
  const old = await caches.open('kkm-voices');
  await old.put('voices/index.json', new Response(JSON.stringify(server.idx)));
  for (const p of server.idx.packs) for (const [k, off, len] of p.items) await old.put(`voices/${k}.mp3`, new Response(server.bins.get(p.file).subarray(off, off + len)));
  // room for the old copies and a little more, not for both
  budget = used() + 500;
  const vp = await fresh();
  const idx = await vp.loadIndex();
  assert.equal(await vp.downloadVoices(vp.packFiles(idx)), 0);
  assert.equal(await caches.has('kkm-voices'), false);
  assert.equal((await vp.savedVoices()).at.size, 610);
});

test('voice pack: a line whose words changed is not said in the old words, and only its bundle is fetched again', async () => {
  reset();
  const vp = await fresh();
  const idx = await vp.loadIndex();
  const files = vp.packFiles(idx, ['toddler']);
  await vp.downloadVoices(files);
  // a new edition: one Toddler line said again
  server = makePack({ 'story-t-3_hi': 's2' });
  const next = await fresh();
  const idx2 = await next.loadIndex();
  const state = await next.savedVoices();
  assert.equal(state.at.has('story-t-3_hi'), false, 'the old recording of a changed line is not played');
  assert.equal(state.at.has('story-t-4_hi'), true);
  const todo = next.bundlesFor(idx2, files, next.currentKeys(idx2, state));
  assert.deepEqual(
    todo.map((p) => p.file),
    ['packs/toddler-1.bin'],
  );
  assert.equal(await next.downloadVoices(files), 0);
  assert.deepEqual(server.fetched, ['packs/toddler-1.bin']);
  // the older copy of that bundle is gone
  const entries = [...store.get('kkm-voices-2').m.keys()].filter((k) => k.includes('toddler-1.bin'));
  assert.equal(entries.length, 1);
  assert.equal((await next.savedVoices()).at.has('story-t-3_hi'), true);
});

test('voice pack: the app starts without waiting for the pack, and never lists a cache of recordings', () => {
  const audio = readFileSync(new URL('../js/audio.js', import.meta.url), 'utf8');
  const init = audio.slice(audio.indexOf('export async function initAudio'), audio.indexOf('\n}\n', audio.indexOf('export async function initAudio')));
  assert.match(init, /packReady = savedVoices\(\)/);
  assert.doesNotMatch(init, /await savedVoices/);
  const vp = readFileSync(new URL('../js/voicepack.js', import.meta.url), 'utf8');
  assert.doesNotMatch(vp, /old\.keys\(/, 'the old cache is never listed');
  // the grown-ups' screen shows what it could read, and never stays on "Checking…"
  const parent = readFileSync(new URL('../js/parent.js', import.meta.url), 'utf8');
  assert.match(parent, /\[idx, state\] = await Promise\.all\(\[loadIndex\(\), savedVoices\(\)\]\)/);
  assert.match(parent, /could not be read on this device/);
});
