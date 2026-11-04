// Audio-first speech. For every thing we say, try in order:
//   1. a family recording loaded from the device (IndexedDB, never in the repo)
//   2. a file in the audio/ folder named in content.json (audio/ is git-ignored)
//   3. the browser's text-to-speech (hi-IN / en-US)
import { clips } from './storage.js';
import { splitTemplate, fillTemplate } from './logic.js';

const TTS_LANG = { hi: 'hi-IN', en: 'en-US' };
let clipKeys = new Set();
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
  return (seg.clipKey && clipKeys.has(seg.clipKey)) || (seg.file && !failedFiles.has(seg.file));
}

async function playSegment(seg, mine) {
  if (seg.pause) return wait(seg.pause);
  // captions: whatever is said is also shown as text (for deaf and hard-of-hearing children, and for early readers)
  if (seg.text) window.dispatchEvent(new CustomEvent('vt-caption', { detail: { text: seg.text, lang: seg.lang } }));
  const url = seg.clipKey ? await clipUrl(seg.clipKey) : null;
  if (mine !== token) return;
  if (url && (await playUrl(url))) return;
  if (seg.file && !failedFiles.has(seg.file)) {
    if (await playUrl(`audio/${seg.file}`)) return;
    failedFiles.add(seg.file);
  }
  if (mine !== token) return;
  await speak(seg.text, seg.lang);
}

function wait(ms) {
  return new Promise((resolve) => {
    currentResolve = resolve;
    setTimeout(resolve, ms);
  });
}

function playUrl(url) {
  return new Promise((resolve) => {
    const a = new Audio(url);
    currentAudio = a;
    currentResolve = resolve;
    a.onended = () => resolve(true);
    a.onerror = () => resolve(false);
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

function speak(text, lang) {
  return new Promise((resolve) => {
    if (!text || !('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = TTS_LANG[lang] || 'en-US';
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.rate = prefs.rate || 0.9;
    u.pitch = 1.05;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    currentResolve = finish;
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
  return splitTemplate(template).flatMap((part) => (typeof part === 'string' ? [{ text: part, lang }] : inner));
}
