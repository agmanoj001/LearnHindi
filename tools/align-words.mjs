// Word timings for the read-along (docs/ROADMAP.md 1.1). The story voice (Chirp 3 HD) doesn't say when
// each word starts, so this works it out once, when the voice pack is made:
//
//   1. a second Google voice that does report word times (Neural2, with an SSML <mark> before each word)
//      says the same line, which tells us where each word starts in its reading;
//   2. both recordings are split where they pause (ffmpeg silencedetect), and the Neural2 times are
//      mapped onto the story voice's recording pause by pause (or start to end, if they pause differently);
//   3. each word's start is saved as a fraction of the recording, in voices/words.json, with the
//      recording's checksum, so a recording made again isn't followed with old timings.
//
// The app (js/games/story.js) lights each word as the recorded voice reaches it. Fractions, not
// milliseconds, so it works at any reading speed.
//
//   node tools/align-words.mjs            (story pages that are new or changed since the last run)
//   node tools/align-words.mjs --all      (every story page again)
//   --rpm 200 --workers 6                 (requests a minute, lines at a time)
//
// Needs ffmpeg and the single recordings in voices/ (node tools/voice-bundles.mjs --unpack). Behind a
// proxy that adds the key, run with NODE_USE_ENV_PROXY=1; otherwise set GOOGLE_TTS_KEY.
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { storyVoiceLines, sentenceTokens } from '../js/logic.js';

const run = promisify(execFile);
const ROOT = new URL('..', import.meta.url);
const OUT = new URL('voices/words.json', ROOT);
const API = 'https://texttospeech.googleapis.com/v1beta1';
const headers = { 'Content-Type': 'application/json', ...(process.env.GOOGLE_TTS_KEY ? { 'X-Goog-Api-Key': process.env.GOOGLE_TTS_KEY } : {}) };
const GUIDE = { hi: 'hi-IN-Neural2-A', en: 'en-IN-Neural2-A' };

// a story page's line, not its title, moral or questions (those aren't shown word by word)
export const isPageKey = (key) => /^story-.+-\d+_(hi|en)$/.test(key);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
export const markedSsml = (words) => `<speak>${words.map((w, i) => `<mark name="${i}"/>${esc(w)}`).join(' ')}</speak>`;

// The spans of a recording where there is speech, and its length, in seconds.
export async function speechSpans(file) {
  const { stderr } = await run('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-38dB:d=0.14', '-f', 'null', '-'], { maxBuffer: 1 << 22 });
  const dur = Number(stderr.match(/Duration: (\d+):(\d+):([\d.]+)/)?.slice(1).reduce((a, x) => a * 60 + Number(x), 0)) || 0;
  const starts = [...stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  return { dur, spans: spansFrom(dur, starts, ends) };
}
export function spansFrom(dur, starts, ends) {
  const quiet = starts.map((s, i) => [s, ends[i] ?? dur]);
  const spans = [];
  let at = 0;
  for (const [s, e] of quiet) {
    if (s - at > 0.04) spans.push([at, s]);
    at = e;
  }
  if (dur - at > 0.04) spans.push([at, dur]);
  // a breath or a click (under 0.1 s) isn't a phrase: it joins the speech after it
  const out = [];
  for (const sp of spans) {
    const prev = out.at(-1);
    if (prev && prev[1] - prev[0] < 0.1) prev[1] = sp[1];
    else out.push([...sp]);
  }
  if (out.length > 1 && out.at(-1)[1] - out.at(-1)[0] < 0.1) out.at(-2)[1] = out.pop()[1];
  return out;
}

// Map a time in the guide's reading onto the story voice's recording. Each pause in the recording is
// matched to the guide's pause at about the same place in the line (they don't always pause in the same
// places); the matched pauses, and the first and last sound, are the fixed points, and times in between
// are stretched to fit.
const gapsOf = (spans) => spans.slice(1).map((sp, i) => [spans[i][1], sp[0]]);
export function mapper(guide, voice) {
  if (!guide.length || !voice.length) return (t) => t;
  const [gs, ge] = [guide[0][0], guide.at(-1)[1]];
  const [vs, ve] = [voice[0][0], voice.at(-1)[1]];
  const gpos = (t) => (t - gs) / (ge - gs || 1);
  const vpos = (t) => (t - vs) / (ve - vs || 1);
  const gg = gapsOf(guide);
  const pairs = [[gs, vs]];
  let from = 0;
  for (const v of gapsOf(voice)) {
    const vp = vpos((v[0] + v[1]) / 2);
    let best = -1;
    for (let i = from; i < gg.length; i++) {
      const d = Math.abs(gpos((gg[i][0] + gg[i][1]) / 2) - vp);
      if (d < 0.15 && (best < 0 || d < Math.abs(gpos((gg[best][0] + gg[best][1]) / 2) - vp))) best = i;
    }
    if (best < 0) continue;
    pairs.push([gg[best][0], v[0]], [gg[best][1], v[1]]);
    from = best + 1;
  }
  pairs.push([ge, ve]);
  return (t) => {
    if (t <= pairs[0][0]) return pairs[0][1];
    for (let i = 1; i < pairs.length; i++) {
      const [g0, v0] = pairs[i - 1];
      const [g1, v1] = pairs[i];
      if (t <= g1) return g1 === g0 ? v1 : v0 + ((t - g0) / (g1 - g0)) * (v1 - v0);
    }
    return pairs.at(-1)[1];
  };
}

// Each word's start, as a fraction of the recording (rising, between 0 and 1).
export function wordFractions(markTimes, guideSpans, voiceSpans, dur) {
  const map = mapper(guideSpans, voiceSpans);
  let prev = 0;
  // a word can't start in a pause: it starts when the voice speaks again
  const snap = (t) => {
    for (let i = 1; i < voiceSpans.length; i++) if (t > voiceSpans[i - 1][1] && t < voiceSpans[i][0]) return voiceSpans[i][0];
    return t;
  };
  return markTimes.map((t) => {
    const at = Math.max(prev, Math.min(dur, snap(map(t))));
    prev = at;
    return Math.round((at / dur) * 1000) / 1000;
  });
}

async function guideReading(words, lang) {
  const body = { input: { ssml: markedSsml(words) }, voice: { languageCode: GUIDE[lang].slice(0, 5), name: GUIDE[lang] }, audioConfig: { audioEncoding: 'MP3' }, enableTimePointing: ['SSML_MARK'] };
  for (let tries = 0; ; tries++) {
    const res = await fetch(`${API}/text:synthesize`, { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.ok) {
      const json = await res.json();
      const times = new Array(words.length).fill(null);
      for (const tp of json.timepoints || []) times[Number(tp.markName)] = tp.timeSeconds;
      return { audio: Buffer.from(json.audioContent, 'base64'), times };
    }
    if (tries >= 4 || (res.status < 500 && res.status !== 429)) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 2000 * 2 ** tries));
  }
}

export async function alignLine(line) {
  const words = sentenceTokens(line.text);
  const voiceFile = new URL(`voices/${line.key}.mp3`, ROOT).pathname;
  const voice = await speechSpans(voiceFile);
  if (words.length === 1) return [0];
  const guide = await guideReading(words, line.lang);
  if (guide.times.some((t) => t == null)) throw new Error('the guide voice skipped a word');
  const tmp = new URL(`voices/.guide-${process.pid}-${Math.random().toString(36).slice(2)}.mp3`, ROOT).pathname;
  writeFileSync(tmp, guide.audio);
  try {
    const g = await speechSpans(tmp);
    return wordFractions(guide.times, g.spans, voice.spans, voice.dur);
  } finally {
    unlinkSync(tmp);
  }
}

async function main() {
  const arg = (name, d) => (process.argv.includes(name) ? Number(process.argv[process.argv.indexOf(name) + 1]) : d);
  const rpm = arg('--rpm', 200);
  const workers = arg('--workers', 6);
  const content = JSON.parse(readFileSync(new URL('content.json', ROOT), 'utf8'));
  const idx = JSON.parse(readFileSync(new URL('voices/index.json', ROOT), 'utf8'));
  const old = existsSync(OUT) && !process.argv.includes('--all') ? JSON.parse(readFileSync(OUT, 'utf8')).words || {} : {};
  const lines = storyVoiceLines(content).filter((l) => isPageKey(l.key) && idx.sums?.[l.key]);
  const words = {};
  const todo = [];
  for (const l of lines) {
    if (old[l.key]?.s === idx.sums[l.key] && old[l.key].f.length === sentenceTokens(l.text).length) words[l.key] = old[l.key];
    else if (existsSync(new URL(`voices/${l.key}.mp3`, ROOT))) todo.push(l);
  }
  console.log(`${lines.length} story page lines, ${todo.length} to align`);
  let done = 0;
  let failed = 0;
  let last = 0;
  const gap = 60000 / rpm;
  const next = async () => {
    for (let l = todo.shift(); l; l = todo.shift()) {
      const wait = last + gap - Date.now();
      last = Math.max(Date.now(), last + gap);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      try {
        words[l.key] = { s: idx.sums[l.key], f: await alignLine(l) };
      } catch (e) {
        failed++;
        console.error(`${l.key}: ${e.message}`);
      }
      if (++done % 100 === 0) console.log(`  ${done} aligned`);
    }
  };
  await Promise.all(Array.from({ length: workers }, next));
  const sorted = Object.fromEntries(Object.keys(words).sort().map((k) => [k, words[k]]));
  writeFileSync(OUT, `${JSON.stringify({ version: idx.version, words: sorted })}\n`);
  console.log(`done: ${Object.keys(sorted).length} lines timed, ${failed} failed`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
