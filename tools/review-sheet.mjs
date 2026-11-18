// Review sheets for a Hindi teacher (roadmap 6.5): every Hindi line a child reads or hears, with its English and
// an empty column for the teacher's note, as spreadsheets anyone can open, plus a short list of the words to
// listen to in the recorded voice (names and nasal sounds, where computer voices slip most).
//   node tools/review-sheet.mjs            → review/*.csv (git-ignored: a working copy for the reviewer)
// The steps for the reviewer are in docs/TEACHER-REVIEW.md.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { voiceLines } from '../js/logic.js';

const ROOT = new URL('../', import.meta.url);
const content = JSON.parse(readFileSync(new URL('content.json', ROOT), 'utf8'));
const csv = (rows) => '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n') + '\r\n';

// 1. stories: every page, question and talk prompt, grade by grade
export function storyRows(c = content) {
  const rows = [['grade', 'story', 'part', 'Hindi', 'English', 'teacher’s note']];
  for (const s of c.stories) {
    if (s.lang === 'en') continue;
    rows.push([s.level, s.id, 'title', s.title.hi, s.title.en, '']);
    s.pages.forEach((p, i) => rows.push([s.level, s.id, `page ${i + 1}`, p.hi, p.en, '']));
    (s.questions || []).forEach((q, i) => rows.push([s.level, s.id, `question ${i + 1}`, q.hi, q.en, '']));
    if (s.moral) rows.push([s.level, s.id, 'moral', s.moral.hi, s.moral.en, '']);
    for (const t of s.talk || []) rows.push([s.level, s.id, `talk: ${t.type}`, t.hi, t.en, '']);
    for (const w of s.words || []) rows.push([s.level, s.id, 'glossary', `${w.hi}: ${w.mean}`, w.en, '']);
  }
  return rows;
}

// 2. the app's own lines: prompts, praise, the guide's greetings
export function promptRows(c = content) {
  const rows = [['where', 'Hindi', 'English', 'teacher’s note']];
  for (const [k, p] of Object.entries(c.phrases || {})) if (p.hi) rows.push([`prompt ${k}`, p.hi, p.en, '']);
  for (const m of c.mascotLines || []) if (m.hi) rows.push(['guide joke', m.hi, m.en, '']);
  const g = c.guide || {};
  for (const m of [...Object.values(g.greet || {}).flat(), ...(g.first || []), ...(g.back || []), ...(g.milestones || [])]) if (m.hi) rows.push([`guide ${m.id}`, m.hi, m.en, '']);
  return rows;
}

// 3. words to listen to: names (capitalised in English) and words with a nasal sound (ँ or ं)
export function listenRows(c = content) {
  const seen = new Set();
  const rows = [['word', 'why', 'recording', 'sounds right? (yes / no + note)']];
  for (const l of voiceLines(c)) {
    if (l.lang !== 'hi') continue;
    for (const w of l.text.split(/\s+/)) {
      const bare = w.replace(/[।.!?,;:"'“”‘’()]/g, '');
      if (!bare || seen.has(bare)) continue;
      if (/[ँं]/.test(bare)) {
        seen.add(bare);
        rows.push([bare, 'nasal sound', l.key, '']);
      }
    }
  }
  for (const w of Object.values(c.words || {})) if (/^[A-Z]/.test(w.en || '') && !seen.has(w.hi)) (seen.add(w.hi), rows.push([w.hi, `name (${w.en})`, `${w.id}_hi`, '']));
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = new URL('review/', ROOT);
  mkdirSync(out, { recursive: true });
  const sheets = { 'stories.csv': storyRows(), 'prompts.csv': promptRows(), 'listen.csv': listenRows() };
  for (const [name, rows] of Object.entries(sheets)) writeFileSync(new URL(name, out), csv(rows));
  console.log(Object.entries(sheets).map(([n, r]) => `review/${n}: ${r.length - 1} lines`).join('\n'));
}
