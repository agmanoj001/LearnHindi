// "साथ खेलो" (docs/ROADMAP.md 7.6): two players on one device take turns, each with a question at their
// own level, and share one score. Brothers and sisters of different ages (a Kindergartner and a Grade 7
// reader), or a child and a grown-up, can play the same game. Nobody wins alone: every right answer adds a
// star to the team's jar, and the other player may help (the 💡 hint).
// Pure: no DOM, so the tests can use it. js/games/together.js plays it.
import { shuffle } from './logic.js';

export const TOGETHER_ROUNDS = 10;
export const GROWN_UP = 'adult';
// what kind of question each level gets
export const KIND_BY_LEVEL = {
  toddler: 'hear-pic', // hear a word, find its picture
  kg: 'hear-pic',
  grade1: 'read-pic', // read a word, find its picture
  grade2: 'read-pic',
  grade3: 'quiz', // a question from that grade's quizzes
  grade4: 'quiz',
  grade7: 'quiz', // idioms and meanings
  grade8: 'quiz',
  [GROWN_UP]: 'number', // a Hindi number word past 20 (harder than it sounds!)
};
export const kindFor = (level) => KIND_BY_LEVEL[level] || 'hear-pic';

// Everyday words with a picture, for the picture questions.
export function picturePool(content) {
  const seen = new Set();
  return Object.entries(content.words || {})
    .filter(([id, w]) => !/^(comic|place|shape)-/.test(id) && !String(w.picture).includes(':') && w.hi && !w.hi.includes(' ') && [undefined, 'kg', 'grade1', 'grade2'].includes(w.level))
    .filter(([, w]) => (seen.has(w.hi) ? false : seen.add(w.hi)))
    .map(([id, w]) => ({ id, ...w }));
}

// The quiz questions of a grade (from the quiz banks its worlds use).
export function quizPool(content, level) {
  const banks = new Set();
  for (const w of content.worlds || []) if (w.level === level) for (const u of w.units) for (const l of u.lessons) if (l.config?.bank) banks.add(l.config.bank);
  return [...banks].flatMap((b) => (content.quizzes?.[b]?.questions || []).map((q) => ({ ...q, bank: b }))).filter((q) => Array.isArray(q.options) && q.options.includes(q.answer));
}

const near = (v, n, lo, hi, rng) => {
  const out = new Set([v]);
  for (let d = 1; out.size < n && d < 40; d++) for (const x of shuffle([v - d, v + d], rng)) if (x >= lo && x <= hi && out.size < n) out.add(x);
  return shuffle([...out], rng);
};

// One question for a player of `level`. `used` (a Set) keeps a game from asking the same thing twice.
// Returns { kind, answer, options, word?, quiz?, number? }.
export function togetherQuestion(content, level, rng = Math.random, used = new Set()) {
  let kind = kindFor(level);
  if (kind === 'quiz' && !quizPool(content, level).length) kind = 'read-pic';
  if (kind === 'hear-pic' || kind === 'read-pic') {
    const pool = picturePool(content);
    const fresh = pool.filter((w) => !used.has(w.id));
    const word = shuffle(fresh.length ? fresh : pool, rng)[0];
    used.add(word.id);
    const others = shuffle(pool.filter((w) => w.id !== word.id), rng).slice(0, 2);
    return { kind, word, answer: word.id, options: shuffle([word.id, ...others.map((w) => w.id)], rng) };
  }
  if (kind === 'quiz') {
    const pool = quizPool(content, level);
    const fresh = pool.filter((q) => !used.has(`${q.bank}:${q.hi}`));
    const quiz = shuffle(fresh.length ? fresh : pool, rng)[0];
    used.add(`${quiz.bank}:${quiz.hi}`);
    return { kind, quiz, answer: quiz.answer, options: shuffle([...quiz.options], rng) };
  }
  // a grown-up: a Hindi number word, find its digits
  let v;
  do v = 21 + Math.floor(rng() * 79);
  while (used.has(`n${v}`) && used.size < 70);
  used.add(`n${v}`);
  return { kind: 'number', number: content.numbers[v - 1], answer: v, options: near(v, 4, 21, 99, rng) };
}

// Who can play: each child on this device (with the grade from their own settings), and a grown-up.
export function playersFrom(profiles, levelOf, mascots = []) {
  const kids = (profiles?.list || []).map((p, i) => ({ id: p.id, name: p.name || '', avatar: p.avatar || mascots[0] || 'gappu', level: levelOf(p.id) || 'kg', n: i + 1 }));
  return [...kids, { id: GROWN_UP, name: '', avatar: null, level: GROWN_UP, n: kids.length + 1 }];
}
