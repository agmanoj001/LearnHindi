// Audio-first speech. For every thing we say, try in order:
//   1. a family recording loaded from the device (IndexedDB, never in the repo)
//   2. the story voice pack, if a grown-up downloaded it (voices/, see voicepack.js)
//   3. a file in the audio/ folder named in content.json (audio/ is git-ignored)
//   4. the browser's text-to-speech (hi-IN / en-US)
import { clips } from './storage.js';
import { savedVoiceKeys, voiceUrl, VOICE_CACHE } from './voicepack.js';
import { splitTemplate, fillTemplate, phrasePartKey, textKey } from './logic.js';

const TTS_LANG = { hi: 'hi-IN', en: 'en-US' };
let clipKeys = new Set();
let packKeys = new Set();
let packOn = true;
const clipUrls = new Map();
const failedFiles = new Set();
let token = 0;
let currentAudio = null;
let currentResolve = null;
let prefs = { hi: '', en: '', rate: 0.9 };

// The parent's choice of voice per language and speaking speed (Parent area › Voices).
export function setVoicePrefs(p) {
  prefs = { ...prefs, ...(p || {}) };
}

// Mascots move their mouths while anything is being said.
let speaking = false;
function setSpeaking(on) {
  if (on === speaking || typeof window === 'undefined') return;
  speaking = on;
  window.dispatchEvent(new CustomEvent('vt-speaking', { detail: on }));
}

export async function initAudio() {
  clipKeys = new Set(await clips.keys());
  packKeys = await savedVoiceKeys().catch(() => new Set());
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged', () => speechSynthesis.getVoices());
  }
}

export function refreshClipKeys(keys) {
  for (const url of clipUrls.values()) URL.revokeObjectURL(url);
  clipUrls.clear();
  clipKeys = new Set(keys);
}

// The story voice pack: which recordings are on the device, and whether to use them.
export function setVoicePack(keys, on = packOn) {
  if (keys) {
    packKeys = new Set(keys);
    for (const p of packUrls.values()) p.then((u) => u && URL.revokeObjectURL(u));
    packUrls.clear();
    voiceCache = null;
  }
  packOn = on;
}

// ---- playing the voice pack quickly ----
// A recording is read straight from the offline cache by its exact address (a fast, indexed lookup),
// kept as an in-memory blob, and fetched before it is needed: play() asks for every recording of the
// sequence at once, and games ask for the next page while this one plays.
let voiceCache = null;
const packUrls = new Map();
function packKeyFor(seg) {
  if (!packOn || seg.pause) return null;
  if (seg.clipKey && packKeys.has(seg.clipKey)) return seg.clipKey;
  if (seg.text && packKeys.size) {
    const tk = textKey(seg.voice ? `${seg.lang}.${seg.voice}` : seg.lang, seg.text);
    if (packKeys.has(tk)) return tk;
  }
  return null;
}
function packUrl(key) {
  if (!packUrls.has(key)) {
    packUrls.set(
      key,
      (async () => {
        try {
          voiceCache ||= await caches.open(VOICE_CACHE);
          const res = await voiceCache.match(voiceUrl(key));
          return res ? URL.createObjectURL(await res.blob()) : null;
        } catch {
          return null;
        }
      })(),
    );
    // keep a few hundred in memory; let the oldest go
    if (packUrls.size > 400) {
      const [old, p] = packUrls.entries().next().value;
      packUrls.delete(old);
      setTimeout(() => p.then((u) => u && URL.revokeObjectURL(u)), 30000);
    }
  }
  return packUrls.get(key);
}
// Get recordings ready before they are said.
export function preload(segs) {
  for (const seg of segs || []) {
    if (!seg || seg.pause) continue;
    if (seg.clipKey && clipKeys.has(seg.clipKey)) clipUrl(seg.clipKey);
    const k = packKeyFor(seg);
    if (k) packUrl(k);
  }
}
// The voice pack was recorded a little slowly (0.9); the speed chosen under Grown-ups › Voices applies
const packRate = () => Math.max(0.75, Math.min(1.5, (prefs.rate || 0.9) / 0.9));

// Voices load a moment after the page does; wait for them (or give up quietly after a while).
export function voicesReady(timeout = 2500) {
  if (!('speechSynthesis' in window)) return Promise.resolve(false);
  if (speechSynthesis.getVoices().length) return Promise.resolve(true);
  return new Promise((resolve) => {
    const done = () => resolve(speechSynthesis.getVoices().length > 0);
    speechSynthesis.addEventListener?.('voiceschanged', done, { once: true });
    setTimeout(done, timeout);
  });
}

export function hasVoice(lang) {
  if (!('speechSynthesis' in window)) return false;
  const want = TTS_LANG[lang].toLowerCase();
  return speechSynthesis.getVoices().some((v) => v.lang.replace('_', '-').toLowerCase().startsWith(want.slice(0, 2)));
}

export function stop() {
  token++;
  setSpeaking(false);
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentResolve) {
    currentResolve(true);
    currentResolve = null;
  }
}

// Plays a list of segments one after another. A new call interrupts the old one.
export async function play(segments) {
  stop();
  preload(segments);
  const mine = token;
  setSpeaking(true);
  for (const seg of segments) {
    if (mine !== token) return;
    await playSegment(seg, mine);
  }
  if (mine === token) setSpeaking(false);
}

async function clipUrl(key) {
  if (!clipKeys.has(key)) return null;
  if (!clipUrls.has(key)) {
    const blob = await clips.get(key).catch(() => null);
    if (!blob) return null;
    clipUrls.set(key, URL.createObjectURL(blob));
  }
  return clipUrls.get(key);
}

export function hasRecording(seg) {
  if (seg.clipKey && (clipKeys.has(seg.clipKey) || (packOn && packKeys.has(seg.clipKey)))) return true;
  if (packOn && seg.text && packKeys.has(textKey(seg.voice ? `${seg.lang}.${seg.voice}` : seg.lang, seg.text))) return true;
  return !!(seg.file && !failedFiles.has(seg.file));
}

async function playSegment(seg, mine) {
  if (seg.pause) return wait(seg.pause);
  // captions: whatever is said is also shown as text (for deaf and hard-of-hearing children, and for early readers)
  if (seg.text) window.dispatchEvent(new CustomEvent('vt-caption', { detail: { text: seg.text, lang: seg.lang } }));
  const url = seg.clipKey ? await clipUrl(seg.clipKey) : null;
  if (mine !== token) return;
  if (url && (await playUrl(url, seg))) return;
  if (mine !== token) return;
  // the voice pack (a line with no name of its own is recorded under its text)
  const pk = packKeyFor(seg);
  if (pk) {
    const purl = await packUrl(pk);
    if (mine !== token) return;
    if (purl && (await playUrl(purl, seg, packRate()))) return;
  }
  if (mine !== token) return;
  if (seg.file && !failedFiles.has(seg.file)) {
    if (await playUrl(`audio/${seg.file}`, seg)) return;
    failedFiles.add(seg.file);
  }
  if (mine !== token) return;
  await speak(seg.text, seg.lang, seg.pitch);
}

function wait(ms) {
  return new Promise((resolve) => {
    currentResolve = resolve;
    setTimeout(resolve, ms);
  });
}

function playUrl(url, seg = null, rate = 1) {
  return new Promise((resolve) => {
    const a = new Audio(url);
    a.playbackRate = rate;
    currentAudio = a;
    currentResolve = resolve;
    a.onended = () => resolve(true);
    a.onerror = () => resolve(false);
    // tell the read-along when the voice really starts, and for how long it will speak
    a.onplaying = () => seg?.text && window.dispatchEvent(new CustomEvent('vt-voice', { detail: { text: seg.text, lang: seg.lang, ms: isFinite(a.duration) ? (a.duration * 1000) / rate : 0 } }));
    a.play().catch(() => resolve(false));
  });
}

// Natural-sounding voices first: names with Neural, Natural, Enhanced, Premium or Google
// usually sound much less robotic than the default ones.
export function rankVoice(v, lang) {
  const full = (TTS_LANG[lang] || 'en-US').toLowerCase();
  const tag = v.lang.replace('_', '-').toLowerCase();
  if (!tag.startsWith(lang)) return -1;
  let score = tag === full ? 10 : 5;
  if (/neural|natural|enhanced|premium|wavenet|studio/i.test(v.name)) score += 8;
  if (/google/i.test(v.name)) score += 4;
  if (/compact|espeak/i.test(v.name)) score -= 6;
  if (v.localService) score += 1;
  return score;
}

export function voicesFor(lang) {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis
    .getVoices()
    .filter((v) => rankVoice(v, lang) >= 0)
    .sort((a, b) => rankVoice(b, lang) - rankVoice(a, lang));
}

function pickVoice(lang) {
  const list = voicesFor(lang);
  return list.find((v) => v.name === prefs[lang]) || list[0];
}

// `pitch` lets comic characters sound different from each other (a goat squeaks, a wrestler booms)
function speak(text, lang, pitch = 1.05) {
  return new Promise((resolve) => {
    if (!text || !('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = TTS_LANG[lang] || 'en-US';
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.rate = prefs.rate || 0.9;
    u.pitch = Math.max(0.5, Math.min(2, pitch));
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    currentResolve = finish;
    u.onstart = () => window.dispatchEvent(new CustomEvent('vt-voice', { detail: { text, lang, ms: 0 } }));
    // word by word, for read-along highlighting (not every voice reports these)
    u.onboundary = (e) => {
      if (e.name === 'word' || e.name === undefined) window.dispatchEvent(new CustomEvent('vt-word', { detail: { text, charIndex: e.charIndex } }));
    };
    u.onend = finish;
    u.onerror = finish;
    // Some Android voices never fire onend; don't let the queue hang.
    setTimeout(finish, 1500 + text.length * 160);
    speechSynthesis.speak(u);
  });
}

// ---- building segments for content items ----

export function wordSegs(word, lang) {
  return [{ text: lang === 'hi' ? word.hi : word.en, lang, clipKey: `${word.id}_${lang}`, file: word.audio?.[lang] }];
}

export function letterSegs(letter) {
  const text = letter.say || (letter.lang === 'en' ? letter.char.toUpperCase() : letter.char);
  return [{ text, lang: letter.lang, clipKey: letter.id, file: letter.audio?.[letter.lang] }];
}

export function numberSegs(num, lang) {
  return [{ text: lang === 'hi' ? num.hi : num.en, lang, clipKey: `num-${num.value}_${lang}`, file: num.audio?.[lang] }];
}

export function soundSegs(word, lang) {
  return [{ text: word.sound[lang], lang, clipKey: `${word.id}-sound_${lang}` }];
}

export function sentenceSegs(sentence, lang) {
  return [{ text: sentence[lang], lang, clipKey: `sentence-${sentence.id}_${lang}`, file: sentence.audio?.[lang] }];
}

// A phrase from content.phrases with an optional item spliced in for {w}.
// itemSegs(lang) returns the item's own segments for that language.
export function phraseSegs(phrase, key, lang, itemSegs = null, itemText = '') {
  const template = phrase[lang];
  if (!template.includes('{w}')) return [{ text: template, lang, clipKey: `phrase-${key}_${lang}` }];
  const inner = itemSegs ? itemSegs(lang) : [];
  // Without a recording for the item, one TTS utterance sounds more natural than pieces.
  if (!inner.some(hasRecording)) return [{ text: fillTemplate(template, itemText), lang }];
  // the pieces around the word have their own recordings (a family's, or the voice pack's)
  let n = 0;
  return splitTemplate(template).flatMap((part) => {
    if (typeof part !== 'string') return inner;
    if (!/[\p{L}\p{N}]/u.test(part)) return [];
    return [{ text: part.trim(), lang, clipKey: phrasePartKey(key, n++, lang) }];
  });
}
