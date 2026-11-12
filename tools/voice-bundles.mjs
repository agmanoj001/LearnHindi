// The voice pack is downloaded as a few large bundles rather than thousands of small files: one request
// per bundle (about 6 MB each), which a phone fetches in seconds instead of making 6,000 round trips.
// A bundle is the MP3 files of one grade (or of lines every grade shares) laid end to end; the index
// says where each recording starts and how long it is. The app cuts them apart on the device.
//
//   node tools/voice-bundles.mjs --pack     (voices/*.mp3 -> voices/packs/*.bin + index.packs)
//   node tools/voice-bundles.mjs --unpack   (voices/packs/*.bin -> voices/*.mp3, to make new voices)
//
// The single MP3 files are only a working copy for tools/make-voices.mjs (git-ignored); the bundles
// are what the app and the repo keep.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url);
const OUT = new URL('voices/', ROOT);
const PACKS = new URL('voices/packs/', ROOT);
const TARGET = 6 * 1048576;

const storyOf = (key) => key.match(/^story-(.+)-(?:title|moral|q\d+|\d+)_(?:hi|en)$/)?.[1] || null;
export const groupOf = (idx, key) => (storyOf(key) ? idx.stories?.[storyOf(key)] : idx.levels?.[key]) || null;

export function pack() {
  const indexFile = new URL('index.json', OUT);
  const idx = JSON.parse(readFileSync(indexFile, 'utf8'));
  mkdirSync(PACKS, { recursive: true });
  for (const f of readdirSync(PACKS)) if (f.endsWith('.bin')) unlinkSync(new URL(f, PACKS));
  // one run of bundles per grade, and one for the shared lines
  const groups = new Map();
  for (const key of Object.keys(idx.files).sort()) {
    const g = groupOf(idx, key) || 'shared';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(key);
  }
  const packs = [];
  for (const [g, keys] of groups) {
    let parts = [];
    let items = [];
    let size = 0;
    const flush = () => {
      if (!items.length) return;
      const file = `packs/${g}-${packs.filter((p) => p.group === g).length + 1}.bin`;
      writeFileSync(new URL(file, OUT), Buffer.concat(parts));
      packs.push({ file, group: g, level: g === 'shared' ? null : g, bytes: size, items });
      parts = [];
      items = [];
      size = 0;
    };
    for (const key of keys) {
      const buf = readFileSync(new URL(`${key}.mp3`, OUT));
      items.push([key, size, buf.length]);
      parts.push(buf);
      size += buf.length;
      if (size >= TARGET) flush();
    }
    flush();
  }
  idx.packs = packs;
  writeFileSync(indexFile, `${JSON.stringify(idx)}\n`);
  return packs;
}

// Recreate the single MP3 files from the bundles (only those not already on disk).
export function unpack() {
  const idx = JSON.parse(readFileSync(new URL('index.json', OUT), 'utf8'));
  let n = 0;
  for (const p of idx.packs || []) {
    const f = new URL(p.file, OUT);
    if (!existsSync(f)) continue;
    let buf = null;
    for (const [key, off, len] of p.items) {
      const out = new URL(`${key}.mp3`, OUT);
      if (existsSync(out)) continue;
      buf ||= readFileSync(f);
      writeFileSync(out, buf.subarray(off, off + len));
      n++;
    }
  }
  return n;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--unpack')) console.log(`unpacked ${unpack()} recordings`);
  else {
    const packs = pack();
    const by = {};
    for (const p of packs) by[p.group] = [(by[p.group]?.[0] || 0) + 1, (by[p.group]?.[1] || 0) + p.bytes];
    for (const [g, [n, b]] of Object.entries(by)) console.log(`${g.padEnd(8)} ${n} bundles, ${(b / 1048576).toFixed(1)} MB`);
    console.log(`${packs.length} bundles`);
  }
}
