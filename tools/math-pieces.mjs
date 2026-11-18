// Every piece the maths games can say (roadmap 6.8), for the Google voice pack. The maths questions are made
// up as the child plays, so instead of whole lines the pieces are recorded (js/mathspeech.js plans a line in
// pieces): this samples every maths skill at every level many times, adds every line of the hands-on games
// (SAY in js/games/handson.js) and every piece of the number speller, and writes tools/math-pieces.json.
//   node tools/math-pieces.mjs        (then tools/make-voices.mjs records any new piece)
// A test fails when a maths line has a piece that is not in the list.
import { readFileSync, writeFileSync } from 'node:fs';
import { SKILLS, makeProblem } from '../js/mathgen.js';
import { mathPlan, numberVoicePieces } from '../js/mathspeech.js';
import { handsVoiceTexts } from '../js/games/handson.js';

const ROOT = new URL('../', import.meta.url);
const N = Number(process.argv[2]) || 1200;
export const LEVEL_OF_SKILL = (id) => ({ k: 'kg', g1: 'grade1', g2: 'grade2', g3: 'grade3', g4: 'grade4' })[id.split('-')[0]] || null;

// every line a maths problem says: the question, the hint, the "why", and each answer
export const problemLines = (p) => [p.say || p.ask, p.hint, p.explain, ...(p.options || []).map((o) => String(o.say ?? o.label ?? ''))].filter(Boolean).map(String);

export function samplePieces(n, seed0 = 1) {
  const level = new Map(); // piece -> its one level, or null when shared
  const note = (piece, lv) => level.set(piece, level.has(piece) && level.get(piece) !== lv ? null : lv);
  let seed = seed0;
  const rng = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (const id of Object.keys(SKILLS))
    for (let t = 0; t < 3; t++)
      for (let i = 0; i < n; i++) for (const line of problemLines(makeProblem(id, { tier: t, rng }))) for (const p of mathPlan(line)) if (typeof p === 'string') note(p, LEVEL_OF_SKILL(id));
  return level;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const content = JSON.parse(readFileSync(new URL('content.json', ROOT), 'utf8'));
  const level = samplePieces(N);
  const en = (id) => content.words[id]?.en || id;
  for (const line of handsVoiceTexts(en)) for (const p of mathPlan(line)) if (typeof p === 'string') level.set(p, null);
  for (const p of numberVoicePieces()) level.set(p, null);
  const pieces = [...level.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([text, lv]) => (lv ? [text, lv] : [text]));
  writeFileSync(new URL('tools/math-pieces.json', ROOT), `${JSON.stringify(pieces)}\n`);
  console.log(`tools/math-pieces.json: ${pieces.length} pieces`);
}
