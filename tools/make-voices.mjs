// Makes the voice pack: one MP3 per line the narrator reads (a story's title, pages, questions and moral,
// and the app's prompts, words and guides' jokes) in Hindi and English, with Google Cloud
// Text-to-Speech, into voices/, plus voices/index.json.
//
//   GOOGLE_TTS_KEY=... node tools/make-voices.mjs            (only new or changed lines)
//   GOOGLE_TTS_KEY=... node tools/make-voices.mjs --all      (everything again)
//   node tools/make-voices.mjs --story lion-mouse            (one story; handy to try a voice)
//   node tools/make-voices.mjs --voices                      (list the voices this key can use)
//   --rpm 240 --workers 8   go faster, if Google's per-minute limit allows
//   --adopt                 keep files a stopped run made but didn't list in the index
//
// The key needs the Cloud Text-to-Speech API enabled (Google's free tier covers the whole pack). Without
// GOOGLE_TTS_KEY the request goes out with no key, for setups where a proxy adds it. Behind a proxy,
// run with NODE_USE_ENV_PROXY=1 so Node uses HTTPS_PROXY.
//
// These are computer-made voices, so they may live in this public repo. Family recordings never do:
// they stay on the family's device (see audio/ in .gitignore).
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { voiceLines as baseLines } from '../js/logic.js';
import { comicVoiceLines, storyRadioVoiceLines } from '../js/shows.js';
import { castVoiceName } from '../js/castvoices.js';

// everything: stories, the app's own voice, the lessons, and the comics with a voice per character
// A recording two parts of the app share (a word that is both a comic line and a story word) belongs
// to every grade, so each grade's download has it.
const voiceLines = (content) => {
  const out = baseLines(content);
  const byKey = new Map(out.map((l) => [l.key, l]));
  for (const l of [...comicVoiceLines(content, castVoiceName), ...storyRadioVoiceLines(content)]) {
    const had = byKey.get(l.key);
    if (!had) byKey.set(l.key, l) && out.push(l);
    else if (had.level !== l.level) delete had.level;
  }
  return out;
};

const ROOT = new URL('..', import.meta.url);
const OUT = new URL('voices/', ROOT);
const API = 'https://texttospeech.googleapis.com/v1';
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);

// a warm, clear voice for children, best first; the first one this key can use is taken (Leda was
// chosen by listening to samples: the same narrator in Hindi and Indian English)
const PREFER = {
  hi: ['hi-IN-Chirp3-HD-Leda', 'hi-IN-Chirp3-HD-Aoede', 'hi-IN-Chirp3-HD-Kore', 'hi-IN-Neural2-A', 'hi-IN-Neural2-D', 'hi-IN-Wavenet-A', 'hi-IN-Standard-A'],
  en: ['en-IN-Chirp3-HD-Leda', 'en-IN-Chirp3-HD-Aoede', 'en-IN-Neural2-A', 'en-IN-Wavenet-A', 'en-US-Neural2-F', 'en-US-Standard-C'],
};
const LANG_CODE = { hi: 'hi-IN', en: 'en-IN' };
const RATE = 0.9; // a little slower than everyday speech, for young listeners

const headers = { 'Content-Type': 'application/json', ...(process.env.GOOGLE_TTS_KEY ? { 'X-Goog-Api-Key': process.env.GOOGLE_TTS_KEY } : {}) };

// The premium voices allow a limited number of requests a minute; stay under it (--rpm to change), and
// when Google still says "slow down" (429), wait and try again, up to a minute at a time.
const RPM = Number(opt('--rpm')) || 120;
let nextSlot = 0;
async function slot() {
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + 60000 / RPM;
  if (at > now) await new Promise((r) => setTimeout(r, at - now));
}

async function call(path, body, tries = 8) {
  for (let t = 0; ; t++) {
    if (body) await slot();
    const res = await fetch(`${API}${path}`, body ? { method: 'POST', headers, body: JSON.stringify(body) } : { headers });
    if (res.ok) return res.json();
    const text = await res.text();
    if (t < tries && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, Math.min(60000, 2000 * 2 ** t)));
      continue;
    }
    const err = new Error(`${res.status} ${text.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
}

async function pickVoices() {
  const out = {};
  for (const l of ['hi', 'en']) {
    const fixed = opt(`--${l}`);
    if (fixed) {
      out[l] = fixed;
      continue;
    }
    const { voices = [] } = await call(`/voices?languageCode=${LANG_CODE[l]}`);
    const names = new Set(voices.map((v) => v.name));
    out[l] = PREFER[l].find((n) => names.has(n)) || voices.find((v) => v.ssmlGender === 'FEMALE')?.name || voices[0]?.name;
    if (!out[l]) throw new Error(`no ${LANG_CODE[l]} voice available`);
  }
  return out;
}

const langOf = (voice) => voice.split('-').slice(0, 2).join('-');
let rateOk = true;
async function synth(text, voice) {
  const body = (withRate) => ({ input: { text }, voice: { languageCode: langOf(voice), name: voice }, audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 24000, ...(withRate ? { speakingRate: RATE } : {}) } });
  try {
    return Buffer.from((await call('/text:synthesize', body(rateOk))).audioContent, 'base64');
  } catch (e) {
    if (rateOk && e.status === 400 && /rate/i.test(e.message)) {
      rateOk = false; // some voices set their own pace
      return synth(text, voice);
    }
    throw e;
  }
}

const sum = (text, voice) => createHash('sha1').update(`${voice}|${rateOk}|${text}`).digest('hex').slice(0, 12);

async function main() {
  if (flag('--voices')) {
    for (const l of ['hi', 'en']) {
      const { voices = [] } = await call(`/voices?languageCode=${LANG_CODE[l]}`);
      console.log(l, voices.map((v) => `${v.name} (${v.ssmlGender})`).join(', '));
    }
    return;
  }
  const content = JSON.parse(readFileSync(new URL('content.json', ROOT), 'utf8'));
  const only = opt('--story');
  const lines = voiceLines(content).filter((l) => !only || l.story === only);
  if (flag('--comics')) lines.splice(0, lines.length, ...lines.filter((l) => l.voiceName || /^t-hi-/.test(l.key)));
  mkdirSync(OUT, { recursive: true });
  const indexFile = new URL('index.json', OUT);
  const old = existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, 'utf8')) : { files: {}, sums: {} };
  const voices = await pickVoices();
  console.log(`voices: ${voices.hi} (Hindi), ${voices.en} (English)`);
  // --adopt: a file made by a run that stopped before saving its index counts as made (its text is current)
  if (flag('--adopt')) for (const l of lines) if (!old.sums?.[l.key] && existsSync(new URL(`${l.key}.mp3`, OUT))) (old.sums ||= {})[l.key] = sum(l.text, l.voiceName || voices[l.lang]);
  const todo = lines.filter((l) => flag('--all') || old.sums?.[l.key] !== sum(l.text, l.voiceName || voices[l.lang]) || !existsSync(new URL(`${l.key}.mp3`, OUT)));
  // stories first (the youngest listeners), then everything else, then the comics' cast
  const rank = (l) => (l.key.startsWith('story-') ? 0 : l.voiceName ? 2 : 1);
  todo.sort((a, b) => rank(a) - rank(b));
  console.log(`${lines.length} lines, ${todo.length} to make`);
  const sums = { ...(old.sums || {}) };
  let done = 0;
  let failed = 0;
  const work = async () => {
    for (let l = todo.shift(); l; l = todo.shift()) {
      try {
        const voice = l.voiceName || voices[l.lang];
        writeFileSync(new URL(`${l.key}.mp3`, OUT), await synth(l.text, voice));
        sums[l.key] = sum(l.text, voice);
      } catch (e) {
        failed++;
        console.error(`${l.key}: ${e.message}`);
      }
      if (++done % 50 === 0) console.log(`  ${done} made`);
      if (done % 200 === 0) writeIndex(); // so a run that stops early keeps what it made
    }
  };

  // the index: every line that has a file and was made from its current text
  const all = voiceLines(content);
  const stories = Object.fromEntries(content.stories.map((s) => [s.id, s.level]));
  let files = {};
  function writeIndex() {
    files = {};
    for (const l of all) {
      const f = new URL(`${l.key}.mp3`, OUT);
      if (existsSync(f) && sums[l.key]) files[l.key] = statSync(f).size;
    }
    // lesson lines that belong to one grade (the rest come with every grade)
    const levels = Object.fromEntries(all.filter((l) => l.level && files[l.key]).map((l) => [l.key, l.level]));
    const keep = Object.fromEntries(Object.entries(sums).filter(([k]) => files[k]));
    writeFileSync(indexFile, `${JSON.stringify({ version: new Date().toISOString().slice(0, 10), voices, files, stories, levels, sums: keep })}\n`);
  }

  await Promise.all(Array.from({ length: Number(opt('--workers')) || 4 }, work));
  // no files for lines that are gone
  const keys = new Set(all.map((l) => l.key));
  if (!only) for (const f of readdirSync(OUT)) if (f.endsWith('.mp3') && !keys.has(f.slice(0, -4))) unlinkSync(new URL(f, OUT));
  writeIndex();
  const bytes = Object.values(files).reduce((a, b) => a + b, 0);
  console.log(`done: ${Object.keys(files).length} recordings, ${(bytes / 1048576).toFixed(1)} MB${failed ? `, ${failed} failed` : ''}`);
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
