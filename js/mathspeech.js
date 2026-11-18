// Every maths line in the Google voice (roadmap 6.8). The maths games make their questions up as the child
// plays, with new numbers, answers, hints and "why" lines each time, so the lines can't all be recorded
// whole. Each line is said as a plan of pieces instead, and every piece is recorded:
//   - a sentence with no number in it is one piece, said whole ("Count each group.");
//   - a list (a pattern: "fish, flower, fish, flower, fish.") is said item by item;
//   - a number is said as a few word pieces: "three hundred forty-five", "thousand", "six hundred
//     seventy-eight"; lakh and crore for numbers written the Indian way (3,45,678); and money ($2.31, 17¢),
//     clock times (7:35), fractions (3/4), decimals (0.78), percent and the signs (+ − × ÷ = < >);
//   - a number written in words ("three hundred forty-two") is said the same way;
//   - the text between numbers is a piece of its own ("What is", "plus", "?").
// mathVoiceLines() lists every piece for the voice generator; the game plays a line's pieces one after
// another (or the whole line, when it happens to be recorded). Pure: no DOM.

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

// 0 to 999 in words: "three hundred forty-five"
export function under1000(n) {
  n = Math.floor(n);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${under1000(n % 100)}` : ''}`;
}

// a whole number as word pieces; `indian` groups it in lakh and crore
export function numberPieces(n, indian = false) {
  n = Math.floor(Math.abs(n));
  if (n < 1000) return [under1000(n)];
  const out = [];
  const group = (v, unit) => v && out.push(under1000(v), unit);
  if (indian) {
    const crore = Math.floor(n / 1e7);
    if (crore) out.push(...numberPieces(crore, true), 'crore');
    group(Math.floor(n / 1e5) % 100, 'lakh');
    group(Math.floor(n / 1000) % 100, 'thousand');
  } else {
    if (n >= 1e9) out.push(...numberPieces(Math.floor(n / 1e9)), 'billion');
    group(Math.floor(n / 1e6) % 1000, 'million');
    group(Math.floor(n / 1000) % 1000, 'thousand');
  }
  if (n % 1000) out.push(under1000(n % 1000));
  return out;
}

// numbers written in words, back to a value ("three hundred forty-two" → 342), for "say it the same way"
const WORD_VALUE = Object.fromEntries([...ONES.map((w, i) => [w, i]), ...TENS.map((w, i) => [w, i * 10]).filter(([w]) => w)]);
const NUMBER_WORD = `(?:${Object.keys(WORD_VALUE).join('|')})`;
// only a phrase of number words ("three hundred forty-two", "forty-two"); a lone "one" ("one by one") stays text
const WORDS_RE = new RegExp(`\\b${NUMBER_WORD}(?:[- ](?:${NUMBER_WORD}|hundred|thousand|lakh|crore|million)\\b)+`, 'gi');
export function wordsValue(text) {
  let total = 0;
  let part = 0;
  for (const w of text.toLowerCase().split(/[\s-]+/)) {
    if (w in WORD_VALUE) part += WORD_VALUE[w];
    else if (w === 'hundred') part *= 100;
    else if (w === 'thousand' || w === 'lakh' || w === 'crore' || w === 'million') {
      total += part * { thousand: 1e3, lakh: 1e5, crore: 1e7, million: 1e6 }[w];
      part = 0;
    }
  }
  return total + part;
}

const DENOM = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'], 5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'], 7: ['seventh', 'sevenths'], 8: ['eighth', 'eighths'], 9: ['ninth', 'ninths'], 10: ['tenth', 'tenths'], 12: ['twelfth', 'twelfths'], 100: ['hundredth', 'hundredths'] };
const SIGNS = { '+': 'plus', '−': 'minus', '–': 'minus', '×': 'times', '÷': 'divided by', '=': 'equals', '<': 'is less than', '>': 'is greater than', '≈': 'is about', '%': 'percent' };
const ORDINAL = { 1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth' };

// one number-like token as word pieces
function tokenPieces(t) {
  let m;
  if ((m = t.match(/^\$(\d[\d,]*)(?:\.(\d\d))?$/))) {
    const d = Number(m[1].replace(/,/g, ''));
    const c = Number(m[2] || 0);
    const out = [];
    if (d || !c) out.push(...numberPieces(d), d === 1 ? 'dollar' : 'dollars');
    if (d && c) out.push('and');
    if (c) out.push(under1000(c), c === 1 ? 'cent' : 'cents');
    return out;
  }
  if ((m = t.match(/^(\d+)¢$/))) return [under1000(Number(m[1])), Number(m[1]) === 1 ? 'cent' : 'cents'];
  if ((m = t.match(/^₹(\d[\d,]*)$/))) return [...numberPieces(Number(m[1].replace(/,/g, '')), /\d,\d\d,/.test(m[1])), Number(m[1]) === 1 ? 'rupee' : 'rupees'];
  if ((m = t.match(/^(\d{1,2}):(\d\d)$/))) {
    const h = Number(m[1]);
    const min = Number(m[2]);
    return min === 0 ? [under1000(h), "o'clock"] : min < 10 ? [under1000(h), 'oh', under1000(min)] : [under1000(h), under1000(min)];
  }
  if ((m = t.match(/^(\d+)\/(\d+)$/))) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    return DENOM[b] ? [...numberPieces(a), DENOM[b][a === 1 ? 0 : 1]] : [...numberPieces(a), 'over', ...numberPieces(b)];
  }
  if ((m = t.match(/^(\d[\d,]*)\.(\d+)$/))) return [...numberPieces(Number(m[1].replace(/,/g, ''))), 'point', ...[...m[2]].map((d) => ONES[Number(d)])];
  if ((m = t.match(/^(\d+)(st|nd|rd|th)$/))) return ORDINAL[Number(m[1])] ? [ORDINAL[Number(m[1])]] : [...numberPieces(Number(m[1])), 'th'];
  if (/^\d[\d,]*$/.test(t)) return numberPieces(Number(t.replace(/,/g, '')), /^\d{1,2}(,\d\d)+,\d{3}$/.test(t));
  if (SIGNS[t]) return [SIGNS[t]];
  return [t];
}

// the numbers, money, times, fractions and signs in a line
const TOKEN_RE = /\$\d[\d,]*(?:\.\d\d)?|₹\d[\d,]*|\d+¢|\d{1,2}:\d\d\b|\d+\/\d+|\d[\d,]*\.\d+|\d+(?:st|nd|rd|th)\b|\d{1,3}(?:,\d{2,3})+|\d+|[+−–×÷=<>≈%]/g;
const tidy = (s) => s.replace(/\s+/g, ' ').replace(/^[\s,;:]+|[\s,;:]+$/g, '');
// a piece worth saying: it has a letter in it
const sayable = (s) => /[A-Za-z]/.test(s);

// The pieces a maths line is said in, in order. A pause is a number of milliseconds.
export function mathPlan(line) {
  const out = [];
  const text = String(line ?? '').replace(/…/g, ' … ');
  // sentence by sentence (a full stop inside a number, as in 0.75, doesn't end one)
  for (const sentence of text.split(/(?<=[.!?])\s+(?=[A-Z0-9"“$₹(])/)) {
    // a sentence with no number in it is said whole; a list is said item by item
    const words = sentence.replace(WORDS_RE, (w) => `\u0000${wordsValue(w)}\u0000`);
    const hasNumber = TOKEN_RE.test(words) || words.includes('\u0000');
    TOKEN_RE.lastIndex = 0;
    if (!hasNumber) {
      const items = sentence.split(/\s*,\s*/);
      if (items.length >= 3 && items.every((i) => i.split(/\s+/).length <= 3)) for (const item of items) out.push(tidy(item.replace(/[.…]+$/, '')));
      else if (sayable(sentence) && sentence.replace(/[.…\s]/g, '')) out.push(tidy(sentence.replace(/\s*…\s*/g, ' ')));
      continue;
    }
    // text, numbers, text …
    let at = 0;
    const parts = words.split('\u0000');
    parts.forEach((part, k) => {
      if (k % 2) return out.push(...numberPieces(Number(part)));
      at = 0;
      for (const m of part.matchAll(TOKEN_RE)) {
        const before = tidy(part.slice(at, m.index));
        if (sayable(before)) out.push(...before.split(/\s*…\s*/).map(tidy).filter(sayable));
        else if (/…|,/.test(before)) out.push(200);
        out.push(...tokenPieces(m[0]));
        at = m.index + m[0].length;
      }
      const rest = tidy(part.slice(at));
      if (sayable(rest)) out.push(...rest.split(/\s*…\s*/).map(tidy).filter(sayable));
    });
  }
  return out.filter((p) => p !== '');
}

// every piece of the number speller, so any number at all can be said
export function numberVoicePieces() {
  const out = new Set();
  for (let n = 0; n < 1000; n++) out.add(under1000(n));
  for (const w of ['thousand', 'million', 'billion', 'lakh', 'crore', 'point', 'and', 'dollar', 'dollars', 'cent', 'cents', 'rupee', 'rupees', "o'clock", 'oh', 'over', 'th']) out.add(w);
  for (const [a, b] of Object.values(DENOM)) out.add(a).add(b);
  for (const w of Object.values(SIGNS)) out.add(w);
  for (const w of Object.values(ORDINAL)) out.add(w);
  return [...out];
}
