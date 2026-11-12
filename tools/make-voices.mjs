// Makes the voice pack: one MP3 per line the narrator reads (a story's title, pages, questions and moral,
// and the app's prompts, words and guides' jokes) in Hindi and English, with Google Cloud
// Text-to-Speech, into voices/, plus voices/index.json.
//
//   GOOGLE_TTS_KEY=... node tools/make-voices.mjs            (only new or changed lines)
//   GOOGLE_TTS_KEY=... node tools/make-voices.mjs --all      (everything again)
//   node tools/make-voices.mjs --story lion-mouse            (one story; handy to try a voice)
//   node tools/make-voices.mjs --voices                      (list the voices this key can use)
//
// The key needs the Cloud Text-to-Speech API enabled (Google's free tier covers the whole pack). Without
// GOOGLE_TTS_KEY the request goes out with no key, for setups where a proxy adds it. Behind a proxy,
// run with NODE_USE_ENV_PROXY=1 so Node uses HTTPS_PROXY.
//
// These are computer-made voices, so they may live in this public repo. Family recordings never do:
// they stay on the family's device (see audio/ in .gitignore).
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { voiceLines } from '../js/logic.js';

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

async function call(path, body, tries = 5) {
  for (let t = 0; ; t++) {
    const res = await fetch(`${API}${path}`, body ? { method: 'POST', headers, body: JSON.stringify(body) } : { headers });
    if (res.ok) return res.json();
    const text = await res.text();
    if (t < tries && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** t));
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
  mkdirSync(OUT, { recursive: true });
  const indexFile = new URL('index.json', OUT);
  const old = existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, 'utf8')) : { files: {}, sums: {} };
  const voices = await pickVoices();
  console.log(`voices: ${voices.hi} (Hindi), ${voices.en} (English)`);
  const todo = lines.filter((l) => flag('--all') || old.sums?.[l.key] !== sum(l.text, voices[l.lang]) || !existsSync(new URL(`${l.key}.mp3`, OUT)));
  console.log(`${lines.length} lines, ${todo.length} to make`);
  const sums = { ...(old.sums || {}) };
  let done = 0;
  let failed = 0;
  const work = async () => {
    for (let l = todo.shift(); l; l = todo.shift()) {
      try {
        writeFileSync(new URL(`${l.key}.mp3`, OUT), await synth(l.text, voices[l.lang]));
        sums[l.key] = sum(l.text, voices[l.lang]);
      } catch (e) {
        failed++;
        console.error(`${l.key}: ${e.message}`);
      }
      if (++done % 50 === 0) console.log(`  ${done} made`);
    }
  };
  await Promise.all(Array.from({ length: 4 }, work));

  // the index: every line that has a file (and no files for lines that are gone)
  const all = new Set(voiceLines(content).map((l) => l.key));
  for (const f of readdirSync(OUT)) if (f.endsWith('.mp3') && !all.has(f.slice(0, -4)) && !only) unlinkSync(new URL(f, OUT));
  const files = {};
  for (const key of all) {
    const f = new URL(`${key}.mp3`, OUT);
    if (existsSync(f)) files[key] = statSync(f).size;
  }
  for (const k of Object.keys(sums)) if (!files[k]) delete sums[k];
  const stories = Object.fromEntries(content.stories.map((s) => [s.id, s.level]));
  writeFileSync(indexFile, `${JSON.stringify({ version: new Date().toISOString().slice(0, 10), voices, files, stories, sums })}\n`);
  const bytes = Object.values(files).reduce((a, b) => a + b, 0);
  console.log(`done: ${Object.keys(files).length} recordings, ${(bytes / 1048576).toFixed(1)} MB${failed ? `, ${failed} failed` : ''}`);
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
