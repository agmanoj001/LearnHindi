// Cuts the silence the speech service leaves at the start (about 0.35 s) and end of each recording, so
// one line follows the next without dead air. The MP3 frames are copied, not re-encoded, so the sound
// is exactly as it was. A little silence is kept (80 ms before, 100 ms after) so no soft first sound
// is clipped. Running it again changes nothing.
//
//   node tools/trim-voices.mjs            (every voices/*.mp3; needs ffmpeg)
import { execFile } from 'node:child_process';
import { readdirSync, renameSync, statSync } from 'node:fs';
import { promisify } from 'node:util';

const run = promisify(execFile);
const LEAD = 0.08;
const TAIL = 0.1;

export async function hasFfmpeg() {
  try {
    await run('ffmpeg', ['-version']);
    return true;
  } catch {
    return false;
  }
}

// Trim one file in place; returns the seconds saved (0 if there was nothing to cut).
export async function trimFile(path) {
  const { stderr } = await run('ffmpeg', ['-hide_banner', '-i', path, '-af', 'silencedetect=noise=-40dB:d=0.05', '-f', 'null', '-'], { maxBuffer: 1 << 22 });
  const dur = Number(stderr.match(/Duration: (\d+):(\d+):([\d.]+)/)?.slice(1).reduce((a, x) => a * 60 + Number(x), 0));
  const starts = [...stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  if (!dur) return 0;
  const lead = starts[0] === 0 && ends[0] ? ends[0] : 0;
  const lastStart = starts.length > ends.length ? starts[starts.length - 1] : ends.at(-1) >= dur - 0.01 ? starts.at(-1) : dur;
  // no sound above the threshold at all (a soft single syllable): leave it as it is
  if (lead >= dur - 0.05 || (lastStart <= lead && lastStart < dur)) return 0;
  const from = Math.max(0, lead - LEAD);
  const to = Math.min(dur, (lastStart > lead ? lastStart : dur) + TAIL);
  if (from < 0.06 && dur - to < 0.06) return 0;
  if (to - from < 0.25) return 0; // too little left: keep the original
  const tmp = `${path}.tmp.mp3`;
  await run('ffmpeg', ['-v', 'error', '-y', '-ss', String(from), '-to', String(to), '-i', path, '-c', 'copy', tmp]);
  if (statSync(tmp).size < 300) return 0; // something went wrong: keep the original
  renameSync(tmp, path);
  return dur - (to - from);
}

export async function trimAll(dir, workers = 8, onProgress = () => {}) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.mp3') && !f.endsWith('.tmp.mp3'));
  let done = 0;
  let saved = 0;
  const next = async () => {
    for (let f = files.shift(); f; f = files.shift()) {
      try {
        saved += await trimFile(new URL(f, dir).pathname);
      } catch (e) {
        console.error(`${f}: ${e.message}`);
      }
      if (++done % 1000 === 0) onProgress(done);
    }
  };
  await Promise.all(Array.from({ length: workers }, next));
  return { done, saved };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = new URL('../voices/', import.meta.url);
  const t0 = Date.now();
  const { done, saved } = await trimAll(dir, 8, (n) => console.log(`  ${n} trimmed`));
  console.log(`${done} recordings, ${(saved / 60).toFixed(1)} minutes of silence cut, in ${Math.round((Date.now() - t0) / 1000)} s`);
}
