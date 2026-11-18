// Content checks (docs/ROADMAP.md 8.8): every Hindi string against the word rules (bookish words, one
// spelling per word, punctuation, sentence length by grade) and every picture against the art rules.
// The rules themselves are in tools/style-rules.mjs (roadmap 6.6 writes them up as a style guide).
//
//   npm run check-content                  the report: problems first, then notes
//   node tools/content-check.mjs --notes   with every note listed, not just counted
//
// npm test runs the same checks (tests/round27.test.js) and fails on any problem; notes are advice.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOKISH, SPELLING, MAX_WORDS, KEEP_AS_IS, EXEMPT_LEVELS } from './style-rules.mjs';

const DEVANAGARI = /[ऀ-ॿ]/;
const YOUNG = new Set(['toddler', 'kg', 'grade1', 'grade2']);

// ---------- every Hindi string, with where it is and the grade it is for ----------
export function hindiStrings(content) {
  // quizzes and sorting games belong to the grade of the lessons that use them
  const levelOf = {};
  for (const w of content.worlds || [])
    for (const u of w.units)
      for (const l of u.lessons) {
        for (const id of [l.config?.bank, l.config?.sort]) if (id && !levelOf[id]) levelOf[id] = w.level;
      }
  const out = [];
  const walk = (node, path, level, poem) => {
    if (typeof node === 'string') {
      if (DEVANAGARI.test(node)) out.push({ text: node, path, level, poem });
      return;
    }
    if (!node || typeof node !== 'object') return;
    const lv = typeof node.level === 'string' ? node.level : level;
    const isPoem = poem || node.kind === 'poem';
    for (const [k, v] of Object.entries(node)) {
      // ids, picture names and sound keys are not text a child reads
      if (['id', 'picture', 'word', 'cover', 'scene', 'act', 'translit', 'sound', 'clipKey', 'answer'].includes(k) && typeof v === 'string' && !DEVANAGARI.test(v)) continue;
      // a word's synonyms are taught on purpose ("हाथी, यानी गज"), so they may be bookish
      if (k === 'syn') continue;
      walk(v, `${path}.${k}`, lv, isPoem);
    }
  };
  for (const [key, val] of Object.entries(content)) {
    if (key === 'quizzes' || key === 'sorts') {
      for (const [id, v] of Object.entries(val || {})) walk(v, `${key}.${id}`, levelOf[id] || null, false);
    } else if (Array.isArray(val)) val.forEach((v, i) => walk(v, `${key}[${v?.id ?? i}]`, null, false));
    else walk(val, key, null, false);
  }
  return out;
}

// whole Hindi words only: a word is bounded by anything that is not a Devanagari letter or sign
const wordRe = (w) => new RegExp(`(^|[^\\u0900-\\u0963\\u0966-\\u097F])${w}(?=$|[^\\u0900-\\u0963\\u0966-\\u097F])`, 'u');
const BOOKISH_RE = Object.keys(BOOKISH).map((w) => [w, wordRe(w)]);
const SPELLING_RE = Object.keys(SPELLING).map((w) => [w, wordRe(w)]);

// a bookish word is fine inside brackets (the school term after the everyday word), after "यानी"
// (the app teaches synonyms that way), or in a set phrase on the keep list
function bookishOk(text, word) {
  const bracketed = new RegExp(`\\([^)]*${word}[^)]*\\)`, 'u').test(text);
  const synonym = new RegExp(`(यानी|मतलब|अर्थात)\\s+[^।?!]*${word}`, 'u').test(text);
  return bracketed || synonym || KEEP_AS_IS.some((p) => text.includes(p) && p.includes(word));
}

export function checkText(content) {
  const problems = [];
  const notes = [];
  for (const s of hindiStrings(content)) {
    const where = `${s.path}${s.level ? ` (${s.level})` : ''}`;
    const t = s.text;
    // punctuation: the Hindi full stop is ।, never | or a Latin full stop after Hindi; no space before it
    // (" | " with spaces round it is a separator, not a full stop)
    if (/[ऀ-ॿ]\|/u.test(t) || /[ऀ-ॿ]\s+\|\s*$/u.test(t)) problems.push(`${where}: "|" used for the full stop ।: ${t}`);
    // a Latin "." after a Hindi word ends a sentence, unless the word is a short abbreviation (डॉ., बी.ए.)
    if (!/[A-Za-z]/.test(t) && [...t.matchAll(/([ऀ-ॣ०-ॿ]+)\.(?=\s|$)/gu)].some((m) => m[1].length > 3)) problems.push(`${where}: a Latin "." ends a Hindi sentence (use ।): ${t}`);
    // no space between a word and its । ! or , (a mark on its own, as in "। और ? लगाओ" or "= ?", is a symbol)
    if (/[ऀ-ॣ०-ॿ]\s+[।!,](?=\s*$|\s*[^\sऀ-ॿ])/u.test(t) && !/[।?!]\s+(और|या)\s/u.test(t)) problems.push(`${where}: a space before punctuation: ${t}`);
    if (/ {2,}/.test(t)) problems.push(`${where}: two spaces in a row: ${t}`);
    // one spelling for each word
    for (const [w, re] of SPELLING_RE) if (re.test(t)) problems.push(`${where}: "${w}" is spelled "${SPELLING[w]}" in this app: ${t}`);
    if (s.poem || EXEMPT_LEVELS.includes(s.level)) continue;
    // the rest is about what a child reads: not the English lines, nor the prompts a grown-up reads out
    if (/\.en$|\.talk\b/.test(s.path)) continue;
    // everyday Hindi for ages 2–8 (no level: shared lines, said in every grade, so the youngest rules apply)
    const young = !s.level || YOUNG.has(s.level);
    for (const [w, re] of BOOKISH_RE) {
      if (!re.test(t) || bookishOk(t, w)) continue;
      if (young) problems.push(`${where}: "${w}" is a bookish word for this age, say "${BOOKISH[w]}": ${t}`);
      else notes.push(`${where}: "${w}": from Grade 3 a school word can stay, after the everyday "${BOOKISH[w]}" or in brackets: ${t}`);
    }
    // sentence length
    const max = MAX_WORDS[s.level || 'kg'];
    if (max)
      for (const sentence of t.split(/[।?!]/u)) {
        const n = sentence.trim().split(/\s+/).filter(Boolean).length;
        if (n > max) notes.push(`${where}: a sentence of ${n} words (keep to ${max} for ${s.level || 'every grade'}): ${sentence.trim()}`);
      }
  }
  return { problems, notes };
}

// ---------- the art rules ----------
// Every picture the content names exists, and every drawing is a safe, small, self-contained SVG:
// a viewBox, no scripts or event handlers, nothing loaded from outside, no embedded photos, under 12 KB.
export const ART_MAX_BYTES = 12 * 1024;
export async function checkArt(content) {
  const art = await import('../js/art.js');
  const problems = [];
  const named = new Set();
  for (const w of Object.values(content.words || {})) if (w.picture) named.add(w.picture);
  for (const s of content.stories || []) {
    if (s.cover && !content.words?.[s.cover]) named.add(s.cover);
    for (const p of s.pages) if (p.word && !content.words?.[p.word]) named.add(p.word);
  }
  for (const id of named) if (!art.pictureExists(id)) problems.push(`picture "${id}" is named in the content but not drawn`);
  for (const id of art.KNOWN_PICTURES) {
    const svg = art.picture(id);
    if (!/<svg[^>]*viewBox="[^"]+"/.test(svg)) problems.push(`picture "${id}": no viewBox`);
    if (/<script|\son[a-z]+=/i.test(svg)) problems.push(`picture "${id}": a script or event handler`);
    if (/(?:href|src)="(?!#)[^"]*"/.test(svg.replace(/xmlns(:\w+)?="[^"]*"/g, ''))) problems.push(`picture "${id}": loads something from outside`);
    if (/data:image\/(png|jpe?g|gif|webp)/.test(svg)) problems.push(`picture "${id}": an embedded photo`);
    if (svg.length > ART_MAX_BYTES) problems.push(`picture "${id}": ${(svg.length / 1024).toFixed(1)} KB, over ${ART_MAX_BYTES / 1024} KB`);
  }
  return { problems, pictures: art.KNOWN_PICTURES.length };
}

// ---------- the report ----------
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
  const text = checkText(content);
  const art = await checkArt(content);
  const problems = [...text.problems, ...art.problems];
  console.log(`Hindi strings checked: ${hindiStrings(content).length}. Pictures checked: ${art.pictures}.`);
  console.log(problems.length ? `\n${problems.length} problem${problems.length === 1 ? '' : 's'}:\n${problems.map((p) => `  - ${p}`).join('\n')}` : '\nNo problems.');
  if (text.notes.length) {
    console.log(`\n${text.notes.length} note${text.notes.length === 1 ? '' : 's'} (advice, not errors)${process.argv.includes('--notes') ? ':' : ': run with --notes to list them'}`);
    if (process.argv.includes('--notes')) console.log(text.notes.map((n) => `  - ${n}`).join('\n'));
  }
  process.exitCode = problems.length ? 1 : 0;
}
