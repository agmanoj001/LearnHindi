// Math problems for the English math worlds, following the North Carolina Standard Course of Study
// for Kindergarten and Grade 1. Pure and testable: no DOM, no randomness except the rng passed in.
//
//   makeProblem(skillId, { tier, n, rng }) → {
//     ask      what the child sees (short), spoken unless `say` is given
//     say      what is spoken (a story, or the equation in words)
//     eq       an equation with "?" for the gap, shown big ("3 + ? = 7")
//     model    a visual model drawn by art-math.js (objects, ten frames, base-ten blocks, clocks…)
//     options  [{ value, label?, say?, model? }]: number bubbles, word bubbles or pictures to tap
//     answer   the value of the right option
//     explain  spoken after the right answer ("3 and 4 make 7!")
//     hint     spoken after a second wrong tap (a strategy, never the answer)
//   }
//
// Tiers follow concrete → pictorial → abstract: tier 0 has small numbers and objects to count,
// tier 2 has bigger numbers and fewer pictures. `n` is how many options to show (2–4).

const int = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// things to count: picture id, one, many
const THINGS = [
  ['apple', 'apple', 'apples'],
  ['fish', 'fish', 'fish'],
  ['duck', 'duck', 'ducks'],
  ['balloon', 'balloon', 'balloons'],
  ['car', 'car', 'cars'],
  ['penguin', 'penguin', 'penguins'],
  ['flower', 'flower', 'flowers'],
  ['butterfly', 'butterfly', 'butterflies'],
  ['starfish', 'starfish', 'starfish'],
  ['laddoo', 'laddoo', 'laddoos'],
  ['snowflake', 'snowflake', 'snowflakes'],
  ['kite', 'kite', 'kites'],
  ['banana', 'banana', 'bananas'],
  ['shell', 'shell', 'shells'],
  ['chick', 'chick', 'chicks'],
  ['carrot', 'carrot', 'carrots'],
];
const thing = (rng, not = []) => {
  const [pic, one, many] = pick(
    rng,
    THINGS.filter((t) => !not.includes(t[0])),
  );
  return { pic, one, many, of: (k) => (k === 1 ? one : many) };
};

// ---------- options ----------

const swapDigits = (v) => {
  if (v < 10) return null;
  if (v < 100) return (v % 10) * 10 + Math.floor(v / 10);
  return 100 + (v % 10) * 10 + Math.floor((v % 100) / 10);
};

// The answer and n−1 nearby wrong numbers (tricky ones like 31 for 13 first), smallest first.
export function numberOptions(answer, n, rng, { min = 0, max = 20, tricky = [], trickyCount = 1 } = {}) {
  const wrong = [];
  const add = (v, list) => {
    if (Number.isInteger(v) && v >= 0 && v !== answer && !wrong.includes(v) && !list.includes(v)) list.push(v);
  };
  const trick = [];
  for (const v of tricky) add(v, trick);
  const near = [];
  for (let d = 1; near.length < n + 2 && d <= max - min + 1; d++) {
    if (answer + d <= max) add(answer + d, near);
    if (answer - d >= min) add(answer - d, near);
  }
  wrong.push(...shuffle(trick, rng).slice(0, trickyCount), ...shuffle(near.slice(0, Math.max(3, n + 1)), rng));
  const values = [...new Set([answer, ...wrong])].slice(0, n).sort((a, b) => a - b);
  return values.map((v) => ({ value: v, label: String(v) }));
}

const textOptions = (answer, others, n, rng) =>
  shuffle([answer, ...shuffle(others.filter((o) => o !== answer), rng).slice(0, n - 1)], rng).map((v) => ({ value: v, label: v }));

// ---------- skills ----------

const COLORS = ['#FF5A5F', '#3D7BFF', '#2EC27E', '#FFB020', '#A66BFF', '#FF7AB6'];
const SHAPES_2D = ['circle', 'square', 'triangle', 'rectangle', 'hexagon'];
const SHAPES_3D = ['cube', 'sphere', 'cone', 'cylinder'];
const SIDES = { triangle: 3, square: 4, rectangle: 4, hexagon: 6, circle: 0 };
const POSITIONS = {
  above: 'above',
  below: 'below',
  beside: 'beside',
  front: 'in front of',
  behind: 'behind',
};

// Scatter n things over a 4×3 grid with a little jitter (positions in % of the box).
function scatter(n, rng) {
  const cells = shuffle(
    Array.from({ length: 12 }, (_, i) => i),
    rng,
  ).slice(0, n);
  return cells.map((c) => [12 + (c % 4) * 25 + int(rng, -5, 5), 16 + Math.floor(c / 4) * 33 + int(rng, -6, 6)]);
}

const seqModel = (start, step, len, gap) => ({ kind: 'sequence', items: Array.from({ length: len }, (_, i) => (i === gap ? null : start + i * step)) });

function sequence(rng, { start, step = 1, len = 4, gapAtEnd = true, max }) {
  const gap = gapAtEnd ? len - 1 : int(rng, 1, len - 1);
  const answer = start + gap * step;
  const shown = Array.from({ length: len }, (_, i) => (i === gap ? '…' : start + i * step));
  return {
    answer,
    model: seqModel(start, step, len, gap),
    say: `${shown.join(', ')}. What number ${gap === len - 1 ? 'comes next' : 'is missing'}?`,
    ask: gap === len - 1 ? 'What comes next?' : 'What number is missing?',
    max,
  };
}

function hoursLabel(h, m) {
  return `${h}:${m === 0 ? '00' : '30'}`;
}
function hoursSay(h, m) {
  return m === 0 ? `${h} o'clock` : `${h} thirty`;
}

const COINS = {
  penny: { cents: 1, name: 'penny' },
  nickel: { cents: 5, name: 'nickel' },
  dime: { cents: 10, name: 'dime' },
  quarter: { cents: 25, name: 'quarter' },
};

// the racers for first, second, third (k-ordinal)
const RACERS = ['penguin', 'duck', 'cat', 'rabbit', 'chick', 'monkey'];
const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth'];

const HEAVY = [
  ['elephant', 'mouse'],
  ['cow', 'chick'],
  ['truck', 'bicycle'],
  ['bear', 'rabbit'],
  ['whale', 'fish'],
  ['buffalo', 'duck'],
];

// ---------- Grade 2 and up ----------

const ONES_W = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS_W = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
// 342 → "three hundred forty-two" (and on into the thousands)
export function numberWords(v) {
  if (v < 20) return ONES_W[v];
  if (v < 100) return TENS_W[Math.floor(v / 10)] + (v % 10 ? `-${ONES_W[v % 10]}` : '');
  if (v < 1000) return `${ONES_W[Math.floor(v / 100)]} hundred${v % 100 ? ` ${numberWords(v % 100)}` : ''}`;
  if (v < 1000000) return `${numberWords(Math.floor(v / 1000))} thousand${v % 1000 ? ` ${numberWords(v % 1000)}` : ''}`;
  return `${numberWords(Math.floor(v / 1000000))} million${v % 1000000 ? ` ${numberWords(v % 1000000)}` : ''}`;
}
// the answer and n−1 wrong numbers that look like it: the tricky ones first, then a ten, one or a hundred off
function bigOptions(answer, n, rng, tricky = []) {
  const seen = new Set([answer]);
  const keep = (list) => list.filter((v) => Number.isInteger(v) && v >= 0 && !seen.has(v) && seen.add(v));
  const wrong = [...shuffle(keep(tricky), rng), ...shuffle(keep([10, 1, 100, 2, 20].flatMap((d) => [answer + d, answer - d])), rng)];
  return [answer, ...wrong.slice(0, n - 1)].sort((a, b) => a - b).map((v) => ({ value: v, label: String(v) }));
}
// 4:05, and how it is said
const clockLabel = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
const clockSay = (h, m) => (m === 0 ? `${h} o'clock` : m < 10 ? `${h} oh ${m}` : `${h} ${m}`);
// a day's times for a.m. and p.m.: [what you do, the hour, a.m. or p.m.]
const DAY_TIMES = [
  ['eat breakfast', 7, 'a.m.'],
  ['wake up', 6, 'a.m.'],
  ['go to school', 8, 'a.m.'],
  ['eat lunch', 12, 'p.m.'],
  ['eat dinner', 7, 'p.m.'],
  ['go to sleep', 9, 'p.m.'],
  ['look at the stars', 10, 'p.m.'],
  ['brush your teeth before school', 7, 'a.m.'],
];
const UNIT_CHOICES = [
  ['a door', 'feet'],
  ['a crayon', 'inches'],
  ['a bed', 'feet'],
  ['a spoon', 'inches'],
  ['a car', 'feet'],
  ['an eraser', 'inches'],
  ['a classroom', 'feet'],
  ['a leaf', 'inches'],
];
// money in cents (a dollar is a bill)
const MONEY = { dollar: 100, quarter: 25, dime: 10, nickel: 5, penny: 1 };
// shapes by their number of sides
const POLY_SIDES = { triangle: 3, square: 4, rectangle: 4, rhombus: 4, trapezoid: 4, pentagon: 5, hexagon: 6 };

export const SKILLS = {
  // ======================= Kindergarten =======================
  'k-count': {
    code: 'NC.K.CC.5',
    name: 'Count to tell how many',
    gen(t, rng, n) {
      const v = int(rng, [1, 3, 8][t], [5, 10, 20][t]);
      const th = thing(rng);
      const layout = t === 1 && rng() < 0.5 ? 'scatter' : 'rows';
      return {
        ask: `How many ${th.many}?`,
        model: { kind: 'objects', groups: [{ n: v, pic: th.pic }], layout, spots: layout === 'scatter' ? scatter(v, rng) : undefined, countable: true },
        options: numberOptions(v, n, rng, { min: 1, max: [6, 11, 20][t] }),
        answer: v,
        explain: `${v} ${th.of(v)}!`,
        hint: 'Touch each one as you count.',
        countUp: true,
      };
    },
  },
  'k-quick': {
    code: 'NC.K.CC.4',
    name: 'Quick look: how many dots',
    gen(t, rng, n) {
      const v = t === 2 ? int(rng, 5, 10) : int(rng, 1, [4, 6][t]);
      return {
        ask: 'Quick look! How many dots?',
        model: t === 2 ? { kind: 'tenframe', frames: [{ a: v }] } : { kind: 'dots', n: v },
        options: numberOptions(v, n, rng, { min: 1, max: t === 2 ? 10 : 6 }),
        answer: v,
        explain: `${v}!`,
        hint: t === 2 ? 'A full row of the frame is 5.' : 'Look for the pattern, like on a dice.',
      };
    },
  },
  'k-numerals': {
    code: 'NC.K.CC.3',
    name: 'Read numbers 0 to 20',
    gen(t, rng, n) {
      const v = t === 2 ? int(rng, 11, 20) : int(rng, 0, [5, 10][t]);
      return {
        ask: `Find ${v}.`,
        say: `Find the number ${v}.`,
        options: numberOptions(v, n, rng, { min: 0, max: t === 2 ? 21 : 10, tricky: t === 2 ? [swapDigits(v)] : [] }),
        answer: v,
        explain: `That's ${v}!`,
      };
    },
  },
  'k-next': {
    code: 'NC.K.CC.2',
    name: 'Count forward from any number',
    gen(t, rng, n) {
      const top = [10, 30, 100][t];
      // tier 2 likes to cross a ten: 27, 28, 29, …
      const start = t === 2 && rng() < 0.6 ? int(rng, 1, 9) * 10 - int(rng, 2, 3) : int(rng, t ? 1 : 0, top - 3);
      const s = sequence(rng, { start, len: 4 });
      return {
        ...s,
        options: numberOptions(s.answer, n, rng, { min: 0, max: top, tricky: s.answer % 10 === 0 ? [s.answer - 10] : [] }),
        explain: `${s.answer - 1}, ${s.answer}!`,
        hint: 'Say the numbers out loud and keep going.',
      };
    },
  },
  'k-tens': {
    code: 'NC.K.CC.1',
    name: 'Count by tens to 100',
    gen(t, rng, n) {
      const len = 4;
      const start = int(rng, 1, [2, 7, 7][t]) * 10;
      const s = sequence(rng, { start, step: 10, len, gapAtEnd: t < 2 });
      const opts = numberOptions(s.answer / 10, n, rng, { min: 1, max: 10 }).map((o) => ({ value: o.value * 10, label: String(o.value * 10) }));
      return { ...s, ask: `Count by tens. ${s.ask}`, options: opts, explain: `${s.answer}!`, hint: 'Ten, twenty, thirty… each jump is ten more.' };
    },
  },
  'k-more': {
    code: 'NC.K.CC.6',
    name: 'More, fewer or the same',
    gen(t, rng) {
      const th = thing(rng);
      const fewer = t > 0 && rng() < 0.5;
      const same = t === 2 && rng() < 0.25;
      let a = int(rng, 1, t ? 9 : 5);
      let b = same ? a : int(rng, 1, t ? 9 : 5);
      while (!same && (b === a || (t === 0 && Math.abs(a - b) < 2))) b = int(rng, 1, t ? 9 : 5);
      // tier 2: the smaller group is drawn bigger, so the child has to count, not just look
      const big = t === 2 ? (a < b ? 'a' : 'b') : null;
      const answer = same ? 'same' : (a > b) !== fewer ? 'a' : 'b';
      const group = (k, key) => ({ kind: 'objects', groups: [{ n: k, pic: th.pic }], layout: 'rows', cols: 3, big: big === key, countable: true });
      const options = [
        { value: 'a', model: group(a, 'a'), say: `${a}` },
        { value: 'b', model: group(b, 'b'), say: `${b}` },
      ];
      if (t === 2) options.push({ value: 'same', label: 'Same', say: 'the same' });
      const word = fewer ? 'fewer' : 'more';
      return {
        ask: `Which has ${word} ${th.many}?`,
        say: t === 2 ? `Which has ${word} ${th.many}? Or are they the same?` : undefined,
        options,
        answer,
        explain: same ? `Both have ${a}. They are the same!` : `${Math.max(a, b)} is more than ${Math.min(a, b)}.`,
        hint: 'Count each group. Or match them up one by one.',
      };
    },
  },
  'k-compare': {
    code: 'NC.K.CC.7',
    name: 'Compare two numbers',
    gen(t, rng, n) {
      const top = [5, 10, 10][t];
      const k = Math.min(n, t === 0 ? 2 : n);
      let values;
      do values = shuffle(Array.from({ length: top }, (_, i) => i + 1), rng).slice(0, k);
      while (t === 0 && Math.abs(values[0] - values[1]) < 2);
      const small = t > 0 && rng() < 0.4;
      const answer = small ? Math.min(...values) : Math.max(...values);
      const word = k === 2 ? (small ? 'smaller' : 'bigger') : small ? 'smallest' : 'biggest';
      return {
        ask: `Which number is ${word}?`,
        options: values.sort((x, y) => x - y).map((v) => ({ value: v, label: String(v) })),
        answer,
        explain: `${answer} is the ${word === 'bigger' ? 'bigger' : word === 'smaller' ? 'smaller' : word} number.`,
        hint: 'Which comes later when you count? That one is bigger.',
      };
    },
  },
  'k-add': {
    code: 'NC.K.OA.2',
    name: 'Add with objects (story problems)',
    gen(t, rng, n) {
      const total = int(rng, 2, t ? 10 : 5);
      const a = int(rng, 1, total - 1);
      const b = total - a;
      const th = thing(rng);
      return {
        ask: `${a} and ${b} more. How many ${th.many}?`,
        say: `There ${a === 1 ? 'is' : 'are'} ${a} ${th.of(a)}. ${b} more ${b === 1 ? 'comes' : 'come'}. How many ${th.many} now?`,
        eq: `${a} + ${b} = ?`,
        model: { kind: 'objects', groups: [{ n: a, pic: th.pic }, { n: b, pic: th.pic, arrive: true }], op: '+', layout: 'rows', countable: true },
        options: numberOptions(total, n, rng, { min: 1, max: t ? 11 : 6 }),
        answer: total,
        explain: `${a} and ${b} make ${total}!`,
        hint: 'Count them all together.',
        countUp: true,
      };
    },
  },
  'k-sub': {
    code: 'NC.K.OA.2',
    name: 'Take away with objects (story problems)',
    gen(t, rng, n) {
      const total = int(rng, 2, t ? 10 : 5);
      const gone = int(rng, 1, total - 1);
      const left = total - gone;
      const [pic, one, many, verb] = pick(rng, [
        ['balloon', 'balloon', 'balloons', 'fly away'],
        ['bird', 'bird', 'birds', 'fly away'],
        ['fish', 'fish', 'fish', 'swim away'],
        ['penguin', 'penguin', 'penguins', 'slide away'],
        ['laddoo', 'laddoo', 'laddoos', 'get eaten'],
        ['car', 'car', 'cars', 'drive away'],
      ]);
      return {
        ask: `${total} take away ${gone}. How many are left?`,
        say: `${total} ${total === 1 ? one : many}. ${gone} ${verb}. How many are left?`,
        eq: `${total} − ${gone} = ?`,
        model: { kind: 'objects', groups: [{ n: total, pic, gone }], layout: 'rows', countable: true },
        options: numberOptions(left, n, rng, { min: 0, max: t ? 10 : 5 }),
        answer: left,
        explain: `${total} take away ${gone} leaves ${left}.`,
        hint: 'Count the ones that are still here.',
      };
    },
  },
  'k-facts5': {
    code: 'NC.K.OA.5',
    name: 'Add and subtract within 5',
    gen(t, rng, n) {
      const plus = t === 0 || rng() < 0.5;
      const a = int(rng, 1, plus ? 4 : 5);
      const b = plus ? int(rng, 0, 5 - a) : int(rng, 0, a);
      const answer = plus ? a + b : a - b;
      const sign = plus ? '+' : '−';
      return {
        ask: plus ? 'Add them up!' : 'Take away!',
        say: `${a} ${plus ? 'plus' : 'minus'} ${b}?`,
        eq: `${a} ${sign} ${b} = ?`,
        model: t === 2 ? null : plus ? { kind: 'objects', groups: [{ n: a, pic: 'dot', color: '#FF5A5F' }, { n: b, pic: 'dot', color: '#3D7BFF' }], op: '+', layout: 'rows' } : { kind: 'objects', groups: [{ n: a, pic: 'dot', color: '#FF5A5F', gone: b }], layout: 'rows' },
        options: numberOptions(answer, n, rng, { min: 0, max: 5 }),
        answer,
        explain: `${a} ${plus ? 'plus' : 'minus'} ${b} is ${answer}.`,
        hint: plus ? 'Start at the bigger number and count on.' : 'Count back.',
      };
    },
  },
  'k-partner': {
    code: 'NC.K.OA.3',
    name: 'Break apart numbers to 10',
    gen(t, rng, n) {
      const total = int(rng, 3, [5, 8, 10][t]);
      const a = int(rng, 1, total - 1);
      const b = total - a;
      return {
        ask: `${a} and how many more make ${total}?`,
        eq: `${a} + ? = ${total}`,
        model: { kind: 'tenframe', frames: [{ a, b, hideB: true }] },
        options: numberOptions(b, n, rng, { min: 0, max: total }),
        answer: b,
        explain: `${a} and ${b} make ${total}!`,
        hint: `Count on from ${a} until you get to ${total}.`,
      };
    },
  },
  'k-make10': {
    code: 'NC.K.OA.4',
    name: 'Make 10',
    gen(t, rng, n) {
      const a = int(rng, [6, 3, 1][t], 9);
      return {
        ask: 'How many more to make 10?',
        eq: `${a} + ? = 10`,
        model: { kind: 'tenframe', frames: [{ a, b: 10 - a, hideB: true }] },
        options: numberOptions(10 - a, n, rng, { min: 1, max: 9 }),
        answer: 10 - a,
        explain: `${a} and ${10 - a} make 10!`,
        hint: 'Count the empty boxes.',
      };
    },
  },
  'k-teens': {
    code: 'NC.K.NBT.1',
    name: 'Teen numbers: ten and some more',
    gen(t, rng, n) {
      const ones = int(rng, 1, t === 0 ? 5 : 9);
      const v = 10 + ones;
      const model = { kind: 'tenframe', frames: [{ a: 10 }, { a: 0, b: ones }] };
      if (t === 2) {
        return {
          ask: `${v} is 10 and how many more?`,
          eq: `${v} = 10 + ?`,
          model,
          options: numberOptions(ones, n, rng, { min: 1, max: 9 }),
          answer: ones,
          explain: `${v} is 10 and ${ones}.`,
          hint: `The 1 in ${v} is the full ten. Look at the other digit.`,
        };
      }
      return {
        ask: `10 and ${ones} make what number?`,
        eq: `10 + ${ones} = ?`,
        model,
        options: numberOptions(v, n, rng, { min: 11, max: 19, tricky: [swapDigits(v)] }),
        answer: v,
        explain: `10 and ${ones} make ${v}!`,
        hint: 'One full ten frame is 10. Count on from 10.',
      };
    },
  },
  'k-position': {
    code: 'NC.K.G.1',
    name: 'Positions: above, below, beside…',
    gen(t, rng, n) {
      const keys = t === 0 ? ['above', 'below', 'beside'] : Object.keys(POSITIONS);
      const where = pick(rng, keys);
      const th = pick(rng, ['penguin', 'duck', 'cat', 'rabbit', 'chick', 'monkey']);
      const name = th;
      return {
        ask: `Where is the ${name}?`,
        model: { kind: 'position', where, pic: th },
        options: textOptions(POSITIONS[where], keys.map((k) => POSITIONS[k]), Math.min(n, keys.length), rng),
        answer: POSITIONS[where],
        explain: `The ${name} is ${POSITIONS[where]} the box.`,
      };
    },
  },
  'k-shapes': {
    code: 'NC.K.G.2',
    name: 'Name flat shapes',
    gen(t, rng, n) {
      const pool = t === 0 ? ['circle', 'square', 'triangle'] : SHAPES_2D;
      const shape = pick(rng, pool);
      const others = shuffle(
        pool.filter((s) => s !== shape),
        rng,
      ).slice(0, n - 1);
      const color = t === 2 ? pick(rng, COLORS) : null;
      const opt = (s, i) => ({
        value: s,
        say: `a ${s}`,
        model: { kind: 'shape', shape: s, color: color || COLORS[(i + int(rng, 0, 5)) % COLORS.length], rot: t ? pick(rng, [0, 0, 15, 30, 45, 90]) : 0, scale: t === 2 ? pick(rng, [0.7, 0.85, 1]) : 1, stretch: t === 2 && s === 'triangle' ? pick(rng, [1, 1.5, 0.7]) : 1 },
      });
      return {
        ask: `Find the ${shape}.`,
        options: shuffle([shape, ...others], rng).map(opt),
        answer: shape,
        explain: shape === 'circle' ? 'A circle is round, with no corners!' : `A ${shape} has ${SIDES[shape]} sides!`,
      };
    },
  },
  'k-solids': {
    code: 'NC.K.G.3',
    name: 'Flat (2D) and solid (3D) shapes',
    gen(t, rng, n) {
      if (t === 0) {
        const solid = rng() < 0.5;
        const shape = solid ? pick(rng, SHAPES_3D) : pick(rng, ['circle', 'square', 'triangle']);
        return {
          ask: 'Is it flat or solid?',
          model: { kind: 'shape', shape, color: pick(rng, COLORS) },
          options: [
            { value: 'flat', label: 'flat' },
            { value: 'solid', label: 'solid' },
          ],
          answer: solid ? 'solid' : 'flat',
          explain: `A ${shape} is ${solid ? 'solid. You can hold it!' : 'flat, like paper.'}`,
        };
      }
      const shape = pick(rng, SHAPES_3D);
      const lookalike = { cube: 'square', sphere: 'circle', cone: 'triangle', cylinder: 'rectangle' }[shape];
      const pool = t === 2 ? [lookalike, ...SHAPES_3D.filter((s) => s !== shape)] : SHAPES_3D.filter((s) => s !== shape);
      const others = (t === 2 ? [lookalike, ...shuffle(pool.slice(1), rng)] : shuffle(pool, rng)).slice(0, n - 1);
      return {
        ask: `Find the ${shape}.`,
        options: shuffle([shape, ...others], rng).map((s, i) => ({ value: s, say: `a ${s}`, model: { kind: 'shape', shape: s, color: COLORS[i % COLORS.length] } })),
        answer: shape,
        explain: { cube: 'A cube is like a dice!', sphere: 'A sphere is like a ball!', cone: 'A cone is like an ice cream cone!', cylinder: 'A cylinder is like a can!' }[shape],
      };
    },
  },
  'k-measure': {
    code: 'NC.K.MD.2',
    name: 'Longer, taller, heavier',
    gen(t, rng) {
      const kind = t === 0 ? 'long' : t === 1 ? pick(rng, ['long', 'tall']) : pick(rng, ['long', 'tall', 'heavy']);
      if (kind === 'heavy') {
        const [heavy, light] = pick(rng, HEAVY);
        const flip = rng() < 0.5;
        const ask = rng() < 0.5 ? 'heavier' : 'lighter';
        return {
          ask: `Which is ${ask}?`,
          model: { kind: 'balance', left: flip ? light : heavy, right: flip ? heavy : light, down: flip ? 'right' : 'left' },
          options: shuffle(
            [
              { value: heavy, say: heavy, model: { kind: 'pic', pic: heavy } },
              { value: light, say: light, model: { kind: 'pic', pic: light } },
            ],
            rng,
          ),
          answer: ask === 'heavier' ? heavy : light,
          explain: ask === 'heavier' ? `The ${heavy} is heavier. Its side goes down!` : `The ${light} is lighter. Its side goes up!`,
          hint: 'The heavy side of the scale goes down.',
        };
      }
      const a = int(rng, 2, 9);
      let b = int(rng, 2, 9);
      while (Math.abs(a - b) < (t === 0 ? 3 : 1)) b = int(rng, 2, 9);
      const more = rng() < 0.6;
      const word = kind === 'long' ? (more ? 'longer' : 'shorter') : more ? 'taller' : 'shorter';
      const color = pick(rng, COLORS);
      const thingName = kind === 'long' ? pick(rng, ['pencil', 'snake', 'train']) : 'tower';
      const mk = (len, i) => (kind === 'long' ? { kind: 'bar', len, max: 10, thing: thingName, color: COLORS[(COLORS.indexOf(color) + i) % COLORS.length] } : { kind: 'tower', h: len, color: COLORS[(COLORS.indexOf(color) + i) % COLORS.length] });
      const answer = (a > b) === more ? 'a' : 'b';
      return {
        ask: `Which is ${word}?`,
        options: [
          { value: 'a', model: mk(a, 0), say: 'this one' },
          { value: 'b', model: mk(b, 1), say: 'this one' },
        ],
        layout: kind === 'long' ? 'stack' : 'row',
        answer,
        explain: `Yes, that one is ${word}!`,
        hint: kind === 'long' ? 'They start at the same place. Which one goes further?' : 'Which one reaches higher?',
      };
    },
  },
  // a pattern: what comes next? (the hands-on pattern train, js/games/handson.js, builds them)
  'k-pattern': {
    code: 'K.MP.7',
    name: 'Patterns: what comes next',
    gen(t, rng, n) {
      const unit = [['AB'], ['AAB', 'ABB'], ['ABC', 'AABB']][t][Math.floor(rng() * [1, 2, 2][t])];
      const kinds = [...new Set(unit)];
      const pics = shuffle(THINGS, rng).slice(0, Math.max(kinds.length + 1, Math.min(n, 4)));
      // every kind in the pattern is a choice, so the answer always is
      const of = (ch) => pics[kinds.indexOf(ch)][0];
      const shown = unit.length * 2 + (t === 2 ? 1 : 0);
      const seq = Array.from({ length: shown + 1 }, (_, i) => of(unit[i % unit.length]));
      const answer = seq[shown];
      return {
        ask: 'What comes next?',
        model: { kind: 'objects', groups: seq.slice(0, shown).map((pic) => ({ n: 1, pic })), layout: 'mixed' },
        options: shuffle(pics.slice(0, Math.max(kinds.length, Math.min(n, pics.length))), rng).map(([pic, one]) => ({ value: pic, say: one, model: { kind: 'pic', pic } })),
        answer,
        explain: `${seq.map((p) => THINGS.find((x) => x[0] === p)[1]).join(', ')}. The pattern goes on!`,
        hint: 'Say the pattern out loud. What comes after that?',
      };
    },
  },
  'k-sort': {
    code: 'NC.K.MD.3',
    name: 'Sort and count groups',
    gen(t, rng, n) {
      const kinds = t === 0 ? 2 : 3;
      const picked = shuffle(THINGS, rng).slice(0, kinds);
      let counts;
      do counts = picked.map(() => int(rng, 1, t === 2 ? 7 : 5));
      while (new Set(counts).size !== counts.length);
      const objs = shuffle(
        picked.flatMap(([pic], i) => Array.from({ length: counts[i] }, () => pic)),
        rng,
      );
      const model = { kind: 'objects', groups: objs.map((pic) => ({ n: 1, pic })), layout: 'mixed', countable: true };
      if (t === 2 && rng() < 0.5) {
        const most = counts.indexOf(Math.max(...counts));
        return {
          ask: 'Which group has the most?',
          model,
          options: picked.map(([pic, , many]) => ({ value: pic, say: many, model: { kind: 'pic', pic } })),
          answer: picked[most][0],
          explain: `There are ${counts[most]} ${picked[most][2]}. That's the most!`,
          hint: 'Count each kind.',
        };
      }
      const i = int(rng, 0, kinds - 1);
      return {
        ask: `How many ${picked[i][2]}?`,
        model,
        options: numberOptions(counts[i], n, rng, { min: 1, max: 8 }),
        answer: counts[i],
        explain: `${counts[i]} ${counts[i] === 1 ? picked[i][1] : picked[i][2]}!`,
        hint: `Only count the ${picked[i][2]}.`,
      };
    },
  },

  // ---- the gaps Grade 2 leans on (docs/ROADMAP.md 10.4) ----
  // counting back, like a rocket's countdown
  'k-countback': {
    code: 'NC.K.CC.2',
    name: 'Count back from 10',
    gen(t, rng, n) {
      const len = 4;
      const start = t === 0 ? int(rng, 4, 5) : int(rng, 3, 10);
      // tier 2: a number missing in the middle
      const gap = t === 2 ? int(rng, 1, len - 2) : len - 1;
      const items = Array.from({ length: len }, (_, i) => (i === gap ? null : start - i));
      const answer = start - gap;
      const last = gap === len - 1;
      return {
        ask: last ? 'Count back. What comes next?' : 'Count back. What number is missing?',
        say: `Count back: ${items.map((v) => (v === null ? '…' : v)).join(', ')}. ${last ? 'What comes next?' : 'What number is missing?'}`,
        model: { kind: 'sequence', items },
        options: numberOptions(answer, n, rng, { min: 0, max: 10, tricky: [answer + 2] }),
        answer,
        explain: `${answer + 1}, ${answer}!${answer === 0 ? ' Blast off!' : ''}`,
        hint: 'Counting back, each number is one less.',
      };
    },
  },
  // first, second, third: who is where in the race
  'k-ordinal': {
    code: 'NC.K.CC.4',
    name: 'First, second, third…',
    gen(t, rng, n) {
      const len = t === 0 ? 3 : 5;
      const racers = shuffle(RACERS, rng).slice(0, len);
      const i = int(rng, 0, len - 1);
      const model = { kind: 'queue', pics: racers };
      if (t === 2 && rng() < 0.5) {
        return {
          ask: `The ${racers[i]} is in which place?`,
          model,
          options: textOptions(ORDINALS[i], ORDINALS.slice(0, len), n, rng),
          answer: ORDINALS[i],
          explain: `The ${racers[i]} is ${ORDINALS[i]}!`,
          hint: 'Start at the flag: first, second, third…',
        };
      }
      const others = shuffle(
        racers.filter((_, k) => k !== i),
        rng,
      ).slice(0, n - 1);
      return {
        ask: `Who is ${ORDINALS[i]}?`,
        say: `Who is ${ORDINALS[i]} in the race?`,
        model,
        options: shuffle([racers[i], ...others], rng).map((p) => ({ value: p, say: `the ${p}`, model: { kind: 'pic', pic: p } })),
        answer: racers[i],
        explain: `The ${racers[i]} is ${ORDINALS[i]}!`,
        hint: 'Start at the flag and count: first, second, third…',
      };
    },
  },
  // a number bond: the whole on top, its two parts below
  'k-bond10': {
    code: 'NC.K.OA.3',
    name: 'Number bonds to 10',
    gen(t, rng, n) {
      const whole = t === 0 ? int(rng, 3, 5) : t === 1 ? int(rng, 5, 10) : 10;
      const a = int(rng, t === 2 ? 0 : 1, whole - 1);
      const b = whole - a;
      // tier 1 sometimes gives both parts and asks for the whole
      const missWhole = t === 1 && rng() < 0.3;
      return {
        ask: missWhole ? `${a} and ${b} make what?` : `${whole} is ${a} and what?`,
        say: missWhole ? `The parts are ${a} and ${b}. What is the whole?` : `${whole} is made of ${a} and how many more?`,
        eq: missWhole ? `${a} + ${b} = ?` : `${a} + ? = ${whole}`,
        model: { kind: 'bond', whole: missWhole ? null : whole, parts: [a, missWhole ? b : null], dots: t === 0 },
        options: numberOptions(missWhole ? whole : b, n, rng, { min: 0, max: 10 }),
        answer: missWhole ? whole : b,
        explain: `${a} and ${b} make ${whole}!`,
        hint: missWhole ? 'Put the two parts together.' : `Count on from ${a} to ${whole}.`,
      };
    },
  },

  // ======================= Grade 1 =======================
  // NC asks for counting to 150 in Grade 1 (Common Core stops at 120)
  'g1-count150': {
    code: 'NC.1.NBT.1',
    name: 'Count to 150 from any number',
    gen(t, rng, n) {
      const start = t === 2 ? int(rng, 95, 145) : int(rng, t ? 10 : 1, t ? 95 : 36);
      const s = sequence(rng, { start, len: 4, gapAtEnd: t === 0 });
      return { ...s, options: numberOptions(s.answer, n, rng, { min: 1, max: 155, tricky: [swapDigits(s.answer)] }), explain: `${s.answer}!`, hint: 'Count on by ones. Watch the tens change after 9.' };
    },
  },
  'g1-numerals': {
    code: 'NC.1.NBT.1',
    name: 'Read numbers to 150',
    gen(t, rng, n) {
      const v = t === 2 ? int(rng, 100, 150) : int(rng, t ? 21 : 11, t ? 99 : 50);
      // 105 is often read as 15, and 12 mixed up with 21
      const tricky = [swapDigits(v), v > 100 && v < 110 ? 10 + (v % 10) : null];
      return {
        ask: `Find ${v}.`,
        say: `Find the number ${v}.`,
        options: numberOptions(v, n, rng, { min: 1, max: 155, tricky: tricky.filter(Boolean) }),
        answer: v,
        explain: `That's ${v}!`,
      };
    },
  },
  'g1-place': {
    code: 'NC.1.NBT.2',
    name: 'Tens and ones',
    gen(t, rng, n) {
      const v = int(rng, [11, 20, 20][t], [19, 59, 99][t]);
      const tens = Math.floor(v / 10);
      const ones = v % 10;
      if (t > 0 && rng() < 0.4) {
        const askTens = rng() < 0.5;
        const answer = askTens ? tens : ones;
        return {
          ask: `How many ${askTens ? 'tens' : 'ones'} are in ${v}?`,
          model: t === 2 ? null : { kind: 'base10', tens, ones },
          options: numberOptions(answer, n, rng, { min: 0, max: 9, tricky: [askTens ? ones : tens] }),
          answer,
          explain: `${v} is ${tens} tens and ${ones} ones.`,
          hint: 'A long bar is a ten. A little cube is a one.',
        };
      }
      return {
        ask: t === 2 ? `${tens} tens and ${ones} ones make?` : 'What number is this?',
        model: t === 2 ? null : { kind: 'base10', tens, ones },
        options: numberOptions(v, n, rng, { min: 10, max: 99, tricky: [swapDigits(v), tens + ones] }),
        answer: v,
        explain: `${tens} tens and ${ones} ones make ${v}.`,
        hint: 'Count the tens first: ten, twenty, thirty… then count on the ones.',
      };
    },
  },
  'g1-compare': {
    code: 'NC.1.NBT.3',
    name: 'Compare two-digit numbers (> = <)',
    gen(t, rng) {
      const a = int(rng, 10, 99);
      let b = t === 2 ? Math.floor(a / 10) * 10 + int(rng, 0, 9) : int(rng, 10, 99);
      if (t === 2 && rng() < 0.3) b = swapDigits(a) >= 10 ? swapDigits(a) : b;
      if (t > 0 && rng() < 0.15) b = a;
      if (t === 0) {
        while (b === a) b = int(rng, 10, 99);
        return {
          ask: 'Which number is greater?',
          model: { kind: 'compare10', a, b },
          options: [a, b].sort((x, y) => x - y).map((v) => ({ value: v, label: String(v) })),
          answer: Math.max(a, b),
          explain: `${Math.max(a, b)} is greater than ${Math.min(a, b)}.`,
          hint: 'Look at the tens first.',
        };
      }
      const answer = a > b ? '>' : a < b ? '<' : '=';
      const words = { '>': 'is greater than', '<': 'is less than', '=': 'is equal to' };
      return {
        ask: 'Greater than, less than or equal?',
        eq: `${a} ? ${b}`,
        say: `${a}… ${b}. Which sign goes in the middle?`,
        model: t === 1 ? { kind: 'compare10', a, b } : null,
        options: [
          { value: '>', label: '>', say: 'greater than' },
          { value: '=', label: '=', say: 'equal to' },
          { value: '<', label: '<', say: 'less than' },
        ],
        answer,
        explain: `${a} ${words[answer]} ${b}.`,
        hint: 'The open mouth eats the bigger number. Compare the tens, then the ones.',
      };
    },
  },
  'g1-facts20': {
    code: 'NC.1.OA.6',
    name: 'Add and subtract within 20',
    gen(t, rng, n) {
      if (t < 2 || rng() < 0.5) {
        // tier 0: sums to 10 on one ten frame; tier 1+: make a ten (8 + 5 → fill the frame, 3 spill over)
        const a = t === 0 ? int(rng, 1, 8) : int(rng, 5, 9);
        const b = t === 0 ? int(rng, 1, 10 - a) : int(rng, 11 - a, 9);
        const sum = a + b;
        const model =
          t === 2
            ? null
            : sum <= 10
              ? { kind: 'tenframe', frames: [{ a, b }] }
              : {
                  kind: 'tenframe',
                  frames: [
                    { a, b: 10 - a },
                    { a: 0, b: sum - 10 },
                  ],
                };
        return {
          ask: 'Add them!',
          say: `${a} plus ${b}?`,
          eq: `${a} + ${b} = ?`,
          model,
          options: numberOptions(sum, n, rng, { min: 2, max: 20 }),
          answer: sum,
          explain: sum > 10 ? `${a} and ${10 - a} make 10, and ${sum - 10} more is ${sum}!` : `${a} plus ${b} is ${sum}.`,
          hint: sum > 10 ? `Fill the ten first. ${a} and ${10 - a} make 10.` : `Start at ${Math.max(a, b)} and count on.`,
        };
      }
      const whole = int(rng, 11, 18);
      const b = int(rng, whole - 9, 9);
      const answer = whole - b;
      return {
        ask: 'Take away!',
        say: `${whole} minus ${b}?`,
        eq: `${whole} − ${b} = ?`,
        model: { kind: 'numberline', from: 0, to: 20, start: whole },
        options: numberOptions(answer, n, rng, { min: 1, max: 19 }),
        answer,
        explain: `${whole} minus ${b} is ${answer}. And ${answer} plus ${b} is ${whole}!`,
        hint: `Think addition: ${b} plus what makes ${whole}?`,
      };
    },
  },
  'g1-story': {
    code: 'NC.1.OA.1',
    name: 'Word problems within 20',
    gen(t, rng, n) {
      const th = thing(rng, ['laddoo']);
      const top = t ? 20 : 10;
      const type = t === 0 ? pick(rng, ['add', 'take']) : pick(rng, ['add', 'take', 'together', 'compare']);
      if (type === 'add') {
        const a = int(rng, 2, top - 3);
        const b = int(rng, 1, Math.min(9, top - a));
        return {
          ask: `${a} and ${b} more. How many now?`,
          say: `Pip has ${a} ${th.of(a)}. Pip gets ${b} more. How many ${th.many} does Pip have now?`,
          eq: `${a} + ${b} = ?`,
          model: t === 2 ? null : { kind: 'objects', groups: [{ n: a, pic: th.pic }, { n: b, pic: th.pic, arrive: true }], op: '+', layout: 'rows', small: a + b > 10, countable: true },
          options: numberOptions(a + b, n, rng, { min: 1, max: top + 1 }),
          answer: a + b,
          explain: `${a} plus ${b} is ${a + b}.`,
          hint: `Start at ${a} and count on ${b}.`,
        };
      }
      if (type === 'take') {
        const a = int(rng, 4, top);
        const b = int(rng, 1, Math.min(9, a - 1));
        return {
          ask: `${a} take away ${b}. How many are left?`,
          say: `There are ${a} ${th.many}. ${b} go away. How many are left?`,
          eq: `${a} − ${b} = ?`,
          model: t === 2 ? null : { kind: 'objects', groups: [{ n: a, pic: th.pic, gone: b }], layout: 'rows', small: a > 10, countable: true },
          options: numberOptions(a - b, n, rng, { min: 0, max: top }),
          answer: a - b,
          explain: `${a} minus ${b} is ${a - b}.`,
          hint: `Count back ${b} from ${a}.`,
        };
      }
      if (type === 'together') {
        const a = int(rng, 2, 9);
        const b = int(rng, 2, Math.min(9, top - a));
        const th2 = thing(rng, [th.pic, 'laddoo']);
        return {
          ask: `${a} ${th.many} and ${b} ${th2.many}. How many in all?`,
          say: `There are ${a} ${th.many} and ${b} ${th2.many}. How many things in all?`,
          eq: `${a} + ${b} = ?`,
          model: t === 2 ? null : { kind: 'objects', groups: [{ n: a, pic: th.pic }, { n: b, pic: th2.pic }], op: '+', layout: 'rows', small: a + b > 10, countable: true },
          options: numberOptions(a + b, n, rng, { min: 2, max: top + 1 }),
          answer: a + b,
          explain: `${a} and ${b} make ${a + b} in all.`,
          hint: 'Put the two groups together and count.',
        };
      }
      const a = int(rng, 5, Math.min(12, top));
      const b = int(rng, 1, a - 1);
      return {
        ask: `How many more does Pip have?`,
        say: `Pip has ${a} ${th.many}. Tiko has ${b} ${th.of(b)}. How many more ${th.many} does Pip have than Tiko?`,
        eq: `${a} − ${b} = ?`,
        model: { kind: 'match', a, b, pic: th.pic },
        options: numberOptions(a - b, n, rng, { min: 1, max: 12 }),
        answer: a - b,
        explain: `Pip has ${a - b} more. ${a} minus ${b} is ${a - b}.`,
        hint: 'Match them up. Count the ones with no partner.',
      };
    },
  },
  'g1-three': {
    code: 'NC.1.OA.2',
    name: 'Add three numbers',
    gen(t, rng, n) {
      const top = [10, 15, 20][t];
      let a, b, c;
      do {
        a = int(rng, 1, 9);
        b = int(rng, 1, 9);
        c = int(rng, 1, 9);
        // tier 2: two of them make ten (7 + 5 + 3)
        if (t === 2 && rng() < 0.7) c = 10 - a;
      } while (a + b + c > top || c < 1);
      const sum = a + b + c;
      const ten = a + c === 10 ? `${a} and ${c} make 10. ` : a + b === 10 ? `${a} and ${b} make 10. ` : '';
      return {
        ask: 'Add all three!',
        say: `${a} plus ${b} plus ${c}?`,
        eq: `${a} + ${b} + ${c} = ?`,
        model: t === 0 ? { kind: 'objects', groups: [{ n: a, pic: 'dot', color: '#FF5A5F' }, { n: b, pic: 'dot', color: '#3D7BFF' }, { n: c, pic: 'dot', color: '#2EC27E' }], op: '+', layout: 'rows' } : null,
        options: numberOptions(sum, n, rng, { min: 3, max: top + 1 }),
        answer: sum,
        explain: `${ten}${a} plus ${b} plus ${c} is ${sum}!`,
        hint: 'Look for two numbers that make 10, and add those first.',
      };
    },
  },
  'g1-missing': {
    code: 'NC.1.OA.8',
    name: 'Find the missing number',
    gen(t, rng, n) {
      const top = t ? 20 : 10;
      const c = int(rng, 4, top);
      const a = int(rng, Math.max(1, c - 9), Math.min(9, c - 1));
      const b = c - a;
      const forms = t === 0 ? ['a+?'] : t === 1 ? ['a+?', '?+b'] : ['a+?', '?+b', 'c-?', '?-b'];
      const form = pick(rng, forms);
      const map = {
        'a+?': [`${a} + ? = ${c}`, b, `${a} plus what makes ${c}?`],
        '?+b': [`? + ${b} = ${c}`, a, `What plus ${b} makes ${c}?`],
        'c-?': [`${c} − ? = ${a}`, b, `${c} minus what is ${a}?`],
        '?-b': [`? − ${b} = ${a}`, c, `What minus ${b} is ${a}?`],
      };
      const [eq, answer, say] = map[form];
      return {
        ask: 'What is the missing number?',
        say,
        eq,
        model: t === 0 ? { kind: 'tenframe', frames: [{ a, b, hideB: true }] } : null,
        options: numberOptions(answer, n, rng, { min: 0, max: top }),
        answer,
        explain: eq.replace('?', String(answer)).replace('−', 'minus').replace('+', 'plus').replace('=', 'equals'),
        hint: form.endsWith('?') || form.startsWith('?+') ? 'Count on from the number you know.' : 'Think: what plus the other number makes the total?',
      };
    },
  },
  'g1-equal': {
    code: 'NC.1.OA.7',
    name: 'True or false: the equal sign',
    gen(t, rng) {
      const a = int(rng, 1, 9);
      const b = int(rng, 1, 9);
      const truth = rng() < 0.5;
      const off = pick(rng, [1, -1, 2]);
      let eq;
      let words;
      if (t === 0) {
        const r = truth ? a + b : a + b + off;
        eq = `${a} + ${b} = ${r}`;
        words = `${a} plus ${b} equals ${r}`;
      } else if (t === 1) {
        const r = truth ? a + b : a + b + off;
        eq = `${r} = ${a} + ${b}`;
        words = `${r} equals ${a} plus ${b}`;
      } else {
        const c = int(rng, 1, a + b - 1);
        const d = truth ? a + b - c : a + b - c + off;
        eq = `${a} + ${b} = ${c} + ${d}`;
        words = `${a} plus ${b} equals ${c} plus ${d}`;
      }
      return {
        ask: 'True or false?',
        say: `Is this true? ${words}.`,
        eq,
        options: [
          { value: true, label: 'True', say: 'true' },
          { value: false, label: 'False', say: 'false' },
        ],
        answer: truth,
        explain: truth ? 'True! Both sides are the same amount.' : 'False! The two sides are not the same amount.',
        hint: 'Work out each side. Equal means the same amount.',
      };
    },
  },
  'g1-tenmore': {
    code: 'NC.1.NBT.5',
    name: '10 more and 10 less',
    gen(t, rng, n) {
      const v = int(rng, 11, 89);
      const more = t === 0 || rng() < 0.5;
      const answer = more ? v + 10 : v - 10;
      return {
        ask: `What is 10 ${more ? 'more' : 'less'} than ${v}?`,
        model: t === 2 ? null : { kind: 'base10', tens: Math.floor(v / 10), ones: v % 10 },
        // the usual mix-ups: going the wrong way, or changing the ones instead of the tens
        options: numberOptions(answer, n, rng, { min: 1, max: 100, tricky: [more ? v - 10 : v + 10, more ? v + 1 : v - 1, v], trickyCount: 3 }),
        answer,
        explain: `10 ${more ? 'more' : 'less'} than ${v} is ${answer}. Only the tens changed!`,
        hint: `${more ? 'Add' : 'Take away'} one ten. The ones stay the same.`,
      };
    },
  },
  'g1-add100': {
    code: 'NC.1.NBT.4',
    name: 'Add and subtract tens within 100',
    gen(t, rng, n) {
      if (t === 2 && rng() < 0.5) {
        const a = int(rng, 2, 9) * 10;
        const b = int(rng, 1, a / 10 - 1) * 10;
        return {
          ask: 'Take away tens!',
          say: `${a} minus ${b}?`,
          eq: `${a} − ${b} = ?`,
          model: { kind: 'base10', tens: a / 10, ones: 0, goneTens: b / 10 },
          options: numberOptions((a - b) / 10, n, rng, { min: 1, max: 9 }).map((o) => ({ value: o.value * 10, label: String(o.value * 10) })),
          answer: a - b,
          explain: `${a / 10} tens take away ${b / 10} tens is ${(a - b) / 10} tens: ${a - b}.`,
          hint: 'Think of tens: 7 tens minus 3 tens.',
        };
      }
      const a = int(rng, 11, 79);
      const tensToo = t === 0 || rng() < 0.4;
      const b = tensToo ? int(rng, 1, Math.min(9 - Math.floor(a / 10), 5)) * 10 : int(rng, 1, t === 1 ? 9 - (a % 10) || 1 : 9);
      const sum = a + b;
      if (sum > 99 || (!tensToo && t === 1 && (a % 10) + b > 9)) return SKILLS['g1-add100'].gen(t, rng, n);
      return {
        ask: 'Add them!',
        say: `${a} plus ${b}?`,
        eq: `${a} + ${b} = ?`,
        model: { kind: 'base10', tens: Math.floor(a / 10), ones: a % 10, addTens: Math.floor(b / 10), addOnes: b % 10 },
        options: numberOptions(sum, n, rng, { min: 10, max: 99, tricky: tensToo ? [a + b / 10] : [sum + 10, sum - 10] }),
        answer: sum,
        explain: `${a} plus ${b} is ${sum}.`,
        hint: tensToo ? 'Add tens to tens. The ones stay the same.' : 'Add the ones. If you get 10 ones, make a new ten.',
      };
    },
  },
  'g1-length': {
    code: 'NC.1.MD.1',
    name: 'Order three things by length',
    gen(t, rng) {
      const k = t === 0 ? 2 : 3;
      // tier 2 uses lengths close together
      const base = t === 2 ? int(rng, 4, 7) : 0;
      const lens = t === 2 ? shuffle([base, base + 1, base + 2], rng) : shuffle([2, 4, 6, 8, 9], rng).slice(0, k);
      const longest = rng() < 0.6;
      const target = longest ? Math.max(...lens) : Math.min(...lens);
      const th = pick(rng, ['pencil', 'snake', 'train', 'ribbon']);
      const word = k === 2 ? (longest ? 'longer' : 'shorter') : longest ? 'longest' : 'shortest';
      return {
        ask: k === 2 ? `Which ${th} is ${word}?` : `Which ${th} is the ${word}?`,
        options: lens.map((len, i) => ({ value: len, say: 'this one', model: { kind: 'bar', len, max: 10, thing: th, color: COLORS[i] } })),
        layout: 'stack',
        answer: target,
        explain: `That one is the ${word}!`,
        hint: 'Line them up at the start. Which one goes the furthest?',
      };
    },
  },
  'g1-units': {
    code: 'NC.1.MD.2',
    name: 'Measure length with cubes',
    gen(t, rng, n) {
      const len = int(rng, [2, 3, 5][t], [5, 9, 12][t]);
      const th = pick(rng, ['pencil', 'snake', 'train', 'ribbon']);
      return {
        ask: `How many cubes long is the ${th}?`,
        model: { kind: 'measure', len, thing: th, color: pick(rng, COLORS), faint: t === 2 },
        options: numberOptions(len, n, rng, { min: 1, max: 13 }),
        answer: len,
        explain: `The ${th} is ${len} cubes long.`,
        hint: 'Count the cubes from one end to the other.',
      };
    },
  },
  'g1-time': {
    code: 'NC.1.MD.3',
    name: 'Tell time to the hour and half hour',
    gen(t, rng, n) {
      const h = int(rng, 1, 12);
      const m = t === 0 ? 0 : pick(rng, [0, 30]);
      const nextH = (h % 12) + 1;
      const prevH = ((h + 10) % 12) + 1;
      const label = hoursLabel(h, m);
      const pool = [hoursLabel(h, m === 0 ? 30 : 0), hoursLabel(m === 30 ? nextH : prevH, m), hoursLabel(nextH, m), hoursLabel(12 - h || 12, m), hoursLabel(prevH, 30)];
      const wrong = shuffle([...new Set(pool)].filter((x) => x !== label), rng).slice(0, n - 1);
      const opts = shuffle([label, ...wrong], rng);
      const parse = (s) => s.split(':').map(Number);
      if (t === 2) {
        return {
          ask: `Which clock shows ${label}?`,
          say: `Which clock shows ${hoursSay(h, m)}?`,
          options: opts.map((s) => ({ value: s, say: hoursSay(...parse(s)), model: { kind: 'clock', h: parse(s)[0], m: parse(s)[1], small: true } })),
          answer: label,
          explain: m === 30 ? `At ${hoursSay(h, m)} the hour hand is halfway between ${h} and ${nextH}.` : `At ${h} o'clock the long hand points to 12.`,
          hint: 'The short hand shows the hour. The long hand shows the minutes.',
        };
      }
      return {
        ask: 'What time is it?',
        model: { kind: 'clock', h, m },
        options: opts.map((s) => ({ value: s, label: s, say: hoursSay(...parse(s)) })),
        answer: label,
        explain: m === 30 ? `It's ${hoursSay(h, m)}: half past ${h}.` : `It's ${h} o'clock!`,
        hint: 'The short hand shows the hour. The long hand shows the minutes.',
      };
    },
  },
  'g1-coins': {
    code: 'NC.1.MD.5',
    name: 'Coins: penny, nickel, dime, quarter',
    gen(t, rng, n) {
      const ids = Object.keys(COINS);
      const coin = pick(rng, ids);
      const c = COINS[coin];
      const coinOpts = (labels) =>
        shuffle([coin, ...shuffle(ids.filter((x) => x !== coin), rng).slice(0, n - 1)], rng).map((id) => ({ value: id, say: `the ${id}`, model: { kind: 'coin', coin: id, label: labels } }));
      if (t === 0) return { ask: `Which coin is a ${c.name}?`, options: coinOpts(true), answer: coin, explain: `A ${c.name} is worth ${c.cents} ${c.cents === 1 ? 'cent' : 'cents'}.`, hint: 'Look at the size and the colour.' };
      if (t === 1 || rng() < 0.5) {
        const values = [1, 5, 10, 25];
        return {
          ask: `A ${c.name} is worth how many pennies?`,
          model: { kind: 'coin', coin, label: false, big: true },
          options: shuffle([c.cents, ...shuffle(values.filter((v) => v !== c.cents), rng).slice(0, n - 1)], rng)
            .sort((a, b) => a - b)
            .map((v) => ({ value: v, label: String(v) })),
          answer: c.cents,
          explain: `A ${c.name} is worth ${c.cents} ${c.cents === 1 ? 'penny' : 'pennies'}.`,
          hint: 'Penny 1, nickel 5, dime 10, quarter 25.',
        };
      }
      return { ask: `Which coin is worth ${c.cents} ${c.cents === 1 ? 'penny' : 'pennies'}?`, options: coinOpts(false), answer: coin, explain: `The ${c.name}! ${c.cents} cents.`, hint: 'The dime is small but worth more than the nickel.' };
    },
  },
  'g1-graph': {
    code: 'NC.1.MD.4',
    name: 'Read picture graphs',
    gen(t, rng, n) {
      const picked = shuffle(THINGS.slice(0, 10), rng).slice(0, 3);
      let counts;
      do counts = picked.map(() => int(rng, 1, t === 0 ? 4 : 7));
      while (new Set(counts).size !== 3);
      const model = { kind: 'graph', rows: picked.map(([pic], i) => ({ pic, n: counts[i] })), max: 7 };
      const q = t === 0 ? 'count' : t === 1 ? pick(rng, ['count', 'most', 'fewest']) : pick(rng, ['more', 'total', 'most']);
      const name = (i) => picked[i][2];
      if (q === 'most' || q === 'fewest') {
        const target = counts.indexOf(q === 'most' ? Math.max(...counts) : Math.min(...counts));
        return {
          ask: `Which has the ${q}?`,
          model,
          options: picked.map(([pic, , many]) => ({ value: pic, say: many, model: { kind: 'pic', pic } })),
          answer: picked[target][0],
          explain: `${name(target)}: ${counts[target]}. That's the ${q}!`,
          hint: q === 'most' ? 'Find the longest row.' : 'Find the shortest row.',
        };
      }
      if (q === 'more') {
        const [i, j] = counts[0] !== counts[1] ? (counts[0] > counts[1] ? [0, 1] : [1, 0]) : [0, 2];
        const answer = counts[i] - counts[j];
        return {
          ask: `How many more ${name(i)} than ${name(j)}?`,
          model,
          options: numberOptions(answer, n, rng, { min: 1, max: 7 }),
          answer,
          explain: `${counts[i]} take away ${counts[j]} is ${answer}. ${answer} more!`,
          hint: 'Compare the two rows. How many extra?',
        };
      }
      if (q === 'total') {
        const answer = counts.reduce((a, b) => a + b, 0);
        return {
          ask: 'How many in all?',
          model,
          options: numberOptions(answer, n, rng, { min: 3, max: 21 }),
          answer,
          explain: `${counts.join(' plus ')} is ${answer}.`,
          hint: 'Add up every row.',
        };
      }
      const i = int(rng, 0, 2);
      return {
        ask: `How many ${name(i)}?`,
        model,
        options: numberOptions(counts[i], n, rng, { min: 1, max: 7 }),
        answer: counts[i],
        explain: `${counts[i]} ${name(i)}.`,
        hint: 'Count the pictures in that row.',
      };
    },
  },
  'g1-sides': {
    code: 'NC.1.G.1',
    name: 'Sides and corners of shapes',
    gen(t, rng, n) {
      const pool = t === 0 ? ['triangle', 'square'] : ['triangle', 'square', 'rectangle', 'hexagon'];
      if (t > 0 && rng() < 0.45) {
        const want = pick(rng, t === 2 ? ['3 corners', '4 equal sides', 'no corners', '6 sides'] : ['3 corners', 'no corners', '6 sides']);
        const answer = { '3 corners': 'triangle', '4 equal sides': 'square', 'no corners': 'circle', '6 sides': 'hexagon' }[want];
        const others = shuffle(
          SHAPES_2D.filter((s) => s !== answer),
          rng,
        );
        // a square and a rectangle both have 4 sides: only the square's are all equal
        const opts = want === '4 equal sides' ? ['rectangle', ...others.filter((s) => s !== 'rectangle')] : others;
        return {
          ask: `Which shape has ${want}?`,
          options: shuffle([answer, ...opts.slice(0, n - 1)], rng).map((s, i) => ({ value: s, say: `the ${s}`, model: { kind: 'shape', shape: s, color: COLORS[i] } })),
          answer,
          explain: `The ${answer} has ${want}!`,
          hint: 'Count the straight sides with your finger.',
        };
      }
      const shape = pick(rng, pool);
      const corners = t > 0 && rng() < 0.5;
      const answer = SIDES[shape];
      return {
        ask: `How many ${corners ? 'corners' : 'sides'} does a ${shape} have?`,
        model: { kind: 'shape', shape, color: pick(rng, COLORS), marks: corners ? 'corners' : 'sides' },
        options: numberOptions(answer, n, rng, { min: 2, max: 8 }),
        answer,
        explain: `A ${shape} has ${answer} ${corners ? 'corners' : 'sides'}.`,
        hint: `Touch each ${corners ? 'corner' : 'side'} and count.`,
      };
    },
  },
  'g1-halves': {
    code: 'NC.1.G.3',
    name: 'Halves and fourths',
    gen(t, rng, n) {
      const shape = pick(rng, ['circle', 'square', 'rect']);
      if (t === 2 && rng() < 0.4) {
        const ans = rng() < 0.5 ? 'half' : 'fourth';
        return {
          ask: `Which piece is ${ans === 'half' ? 'bigger' : 'smaller'}?`,
          say: `Same pizza. Which piece is ${ans === 'half' ? 'bigger' : 'smaller'}: one half, or one fourth?`,
          options: [
            { value: 'half', label: 'one half', model: { kind: 'parts', shape: 'circle', parts: 2, equal: true, shade: 1 } },
            { value: 'fourth', label: 'one fourth', model: { kind: 'parts', shape: 'circle', parts: 4, equal: true, shade: 1 } },
          ],
          answer: ans,
          explain: 'More pieces means smaller pieces. A half is bigger than a fourth!',
          hint: 'Cutting into more pieces makes each piece smaller.',
        };
      }
      const want = t === 0 ? 'halves' : pick(rng, ['halves', 'fourths']);
      const choices = [
        { value: 'halves', parts: 2, equal: true },
        { value: 'fourths', parts: 4, equal: true },
        { value: 'unequal2', parts: 2, equal: false },
        { value: 'unequal4', parts: 4, equal: false },
      ];
      const pool = t === 0 ? choices.filter((c) => c.parts === 2) : choices;
      const right = pool.find((c) => c.value === want);
      const wrong = shuffle(
        pool.filter((c) => c !== right),
        rng,
      ).slice(0, Math.max(1, n - 1));
      return {
        ask: `Which shows ${want}?`,
        options: shuffle([right, ...wrong], rng).map((c) => ({ value: c.value, say: 'this one', model: { kind: 'parts', shape, parts: c.parts, equal: c.equal } })),
        answer: want,
        explain: `${want === 'halves' ? '2' : '4'} equal parts. Those are ${want}!`,
        hint: 'The parts must be the same size.',
      };
    },
  },
  'g1-compose': {
    code: 'NC.1.G.2',
    name: 'Put shapes together',
    gen(t, rng, n) {
      const sets = [
        { pieces: 'tri2', makes: 'square', say: 'two triangles' },
        { pieces: 'sq2', makes: 'rectangle', say: 'two squares' },
        { pieces: 'semi2', makes: 'circle', say: 'two half circles' },
        { pieces: 'tri4', makes: 'triangle', say: 'four little triangles' },
        { pieces: 'trap2', makes: 'hexagon', say: 'two trapezoids' },
      ];
      const set = pick(rng, t === 0 ? sets.slice(0, 3) : sets);
      const others = shuffle(
        SHAPES_2D.filter((s) => s !== set.makes),
        rng,
      ).slice(0, n - 1);
      return {
        ask: 'Put them together. What shape do they make?',
        say: `Put ${set.say} together. What shape do they make?`,
        model: { kind: 'compose', pieces: set.pieces },
        options: shuffle([set.makes, ...others], rng).map((s, i) => ({ value: s, say: `a ${s}`, model: { kind: 'shape', shape: s, color: COLORS[(i + 2) % COLORS.length] } })),
        answer: set.makes,
        explain: `${set.say[0].toUpperCase()}${set.say.slice(1)} make a ${set.makes}!`,
        hint: 'Imagine sliding the pieces together.',
      };
    },
  },
  // ---- the gaps Grade 2 leans on (docs/ROADMAP.md 10.4) ----
  'g1-countback': {
    code: 'NC.1.OA.5',
    name: 'Count back from 20 (and across a ten)',
    gen(t, rng, n) {
      const len = 4;
      // tier 2 crosses a ten going down: 52, 51, 50, …49
      const start = t === 2 ? int(rng, 3, 12) * 10 + int(rng, 1, 2) : int(rng, t === 0 ? 8 : 12, 20);
      const gap = t === 1 ? int(rng, 1, len - 2) : len - 1;
      const items = Array.from({ length: len }, (_, i) => (i === gap ? null : start - i));
      const answer = start - gap;
      const last = gap === len - 1;
      return {
        ask: last ? 'Count back. What comes next?' : 'Count back. What number is missing?',
        say: `Count back: ${items.map((v) => (v === null ? '…' : v)).join(', ')}. ${last ? 'What comes next?' : 'What number is missing?'}`,
        model: { kind: 'sequence', items },
        options: numberOptions(answer, n, rng, { min: 0, max: 125, tricky: [answer + 10, answer % 10 === 9 ? answer - 9 : swapDigits(answer)] }),
        answer,
        explain: `${answer + 1}, ${answer}!`,
        hint: answer % 10 === 9 ? 'After 0 ones, the tens go down by one and the ones start again at 9.' : 'Counting back, each number is one less.',
      };
    },
  },
  'g1-skip': {
    code: 'NC.1.OA.5',
    name: 'Skip count by 2s, 5s and 10s',
    gen(t, rng, n) {
      const step = t === 0 ? pick(rng, [10, 5]) : t === 1 ? pick(rng, [5, 2]) : pick(rng, [2, 5, 10]);
      if (t < 2) {
        // groups to count: rods of ten, or dots in fives and twos
        const groups = int(rng, 2, step === 2 ? 7 : 6);
        const answer = groups * step;
        const model = step === 10 ? { kind: 'base10', tens: groups, ones: 0 } : { kind: 'objects', groups: Array.from({ length: groups }, (_, i) => ({ n: step, pic: 'dot', color: COLORS[i % COLORS.length] })), layout: 'rows', small: true };
        const seq = Array.from({ length: groups }, (_, i) => (i + 1) * step);
        return {
          ask: `Count by ${step}s. How many?`,
          say: `Each group has ${step}. Count by ${step}s. How many in all?`,
          model,
          options: numberOptions(answer / step, n, rng, { min: 1, max: 10 }).map((o) => ({ value: o.value * step, label: String(o.value * step) })),
          answer,
          explain: `${seq.join(', ')}. ${answer}!`,
          hint: `Touch each group and say the next number: ${seq.slice(0, 2).join(', ')}…`,
        };
      }
      // tier 2: a skip-counting list that starts in the middle, with a gap
      const s = sequence(rng, { start: int(rng, 1, step === 10 ? 8 : 12) * step, step, len: 5, gapAtEnd: false });
      return {
        ...s,
        ask: `Count by ${step}s. ${s.ask}`,
        options: numberOptions(s.answer / step, n, rng, { min: 1, max: 20 }).map((o) => ({ value: o.value * step, label: String(o.value * step) })),
        explain: `Each jump is ${step} more. ${s.answer}!`,
        hint: `Add ${step} to the number before the gap.`,
      };
    },
  },
  'g1-doubles': {
    code: 'NC.1.OA.6',
    name: 'Doubles and near doubles',
    gen(t, rng, n) {
      const a = int(rng, 1, t === 0 ? 5 : 9);
      const near = t === 2 && rng() < 0.7;
      const b = near ? a + 1 : a;
      const answer = a + b;
      const dots = (k, c) => ({ n: k, pic: 'dot', color: c });
      return {
        ask: near ? 'A near double! What is it?' : `What is double ${a}?`,
        say: near ? `${a} plus ${b}? Think of double ${a}.` : `Double ${a}: ${a} plus ${a}?`,
        eq: `${a} + ${b} = ?`,
        model: t === 2 ? null : { kind: 'objects', groups: [dots(a, '#FF5A5F'), dots(b, '#3D7BFF')], op: '+', layout: 'rows' },
        options: numberOptions(answer, n, rng, { min: 2, max: 20, tricky: near ? [2 * a, 2 * b] : [answer + 1] }),
        answer,
        explain: near ? `Double ${a} is ${2 * a}, and one more is ${answer}!` : `Double ${a} is ${answer}!`,
        hint: near ? `Double ${a} is ${2 * a}. Then add one more.` : 'Both sides are the same. Count them all.',
      };
    },
  },
  'g1-bond20': {
    code: 'NC.1.OA.6',
    name: 'Number bonds to 20',
    gen(t, rng, n) {
      // tier 0: a teen number is 10 and some ones
      const whole = int(rng, 11, t === 0 ? 19 : 20);
      const a = t === 0 ? 10 : int(rng, 2, whole - 2);
      const b = whole - a;
      const missWhole = t === 2 && rng() < 0.4;
      return {
        ask: missWhole ? `${a} and ${b} make what?` : `${whole} is ${a} and what?`,
        say: missWhole ? `The parts are ${a} and ${b}. What is the whole?` : `${whole} is made of ${a} and how many more?`,
        eq: missWhole ? `${a} + ${b} = ?` : `${a} + ? = ${whole}`,
        model: { kind: 'bond', whole: missWhole ? null : whole, parts: [a, missWhole ? b : null] },
        options: numberOptions(missWhole ? whole : b, n, rng, { min: 0, max: 20, tricky: missWhole ? [] : [swapDigits(b)] }),
        answer: missWhole ? whole : b,
        explain: `${a} and ${b} make ${whole}!`,
        hint: a === 10 ? `${whole} is one ten and some ones. Look at the ones.` : missWhole ? 'Make a ten first, then add the rest.' : `Count on from ${a} to ${whole}, or take ${a} away from ${whole}.`,
      };
    },
  },
  // just the fact, no picture and no clock: facts missed come back later in the lesson (js/games/math.js)
  'g1-fluency': {
    code: 'NC.1.OA.6',
    name: 'Facts within 10 (and 20), no hurry',
    gen(t, rng, n) {
      const top = t === 2 ? 20 : 10;
      const plus = t === 0 || rng() < 0.5;
      const total = int(rng, t === 2 ? 11 : 2, top);
      const a = plus ? int(rng, 1, total - 1) : total;
      const b = plus ? total - a : int(rng, 1, total - 1);
      const answer = plus ? a + b : a - b;
      return {
        ask: plus ? 'Add!' : 'Take away!',
        say: `${a} ${plus ? 'plus' : 'minus'} ${b}?`,
        eq: `${a} ${plus ? '+' : '−'} ${b} = ?`,
        model: null,
        options: numberOptions(answer, n, rng, { min: 0, max: top }),
        answer,
        explain: `${a} ${plus ? 'plus' : 'minus'} ${b} is ${answer}.`,
        hint: plus ? 'Start with the bigger number and count on.' : `Think: ${b} plus what makes ${a}?`,
      };
    },
  },
  // ======================= Grade 2 (docs/ROADMAP.md 10.5) =======================
  'g2-place': {
    code: 'NC.2.NBT.1',
    name: 'Hundreds, tens and ones',
    gen(t, rng, n) {
      if (t === 0) {
        const [h, te, o] = [int(rng, 1, 3), int(rng, 0, 9), int(rng, 0, 9)];
        const v = h * 100 + te * 10 + o;
        return {
          ask: 'What number is this?',
          model: { kind: 'base10', hundreds: h, tens: te, ones: o },
          options: bigOptions(v, n, rng, [h * 100 + o * 10 + te, h + te + o]),
          answer: v,
          explain: `${h} hundreds, ${te} tens and ${o} ones make ${v}.`,
          hint: 'A big square is a hundred, a long bar is a ten, a little cube is a one.',
        };
      }
      if (t === 1) {
        // what one digit is worth (the three digits all different, so the question is clear)
        let d;
        do d = [int(rng, 1, 9), int(rng, 0, 9), int(rng, 0, 9)];
        while (new Set(d).size < 3);
        const v = d[0] * 100 + d[1] * 10 + d[2];
        const k = pick(rng, [0, 1, 2].filter((i) => d[i] > 0));
        const value = d[k] * [100, 10, 1][k];
        const others = shuffle(
          [...new Set([d[k], d[k] * 10, d[k] * 100, v])].filter((x) => x !== value),
          rng,
        ).slice(0, n - 1);
        return {
          ask: `What is the ${d[k]} worth in ${v}?`,
          say: `In ${v}, what is the ${d[k]} worth?`,
          options: [value, ...others].sort((a, b) => a - b).map((x) => ({ value: x, label: String(x) })),
          answer: value,
          explain: `In ${v} the ${d[k]} is in the ${['hundreds', 'tens', 'ones'][k]} place. It is worth ${value}.`,
          hint: 'Hundreds, tens, ones: which place is it in?',
        };
      }
      // expanded form, often with a zero: 400 + 6 is 406, not 46
      const h = int(rng, 1, 9);
      const o = int(rng, 1, 9);
      const te = rng() < 0.6 ? 0 : int(rng, 1, 9);
      const v = h * 100 + te * 10 + o;
      return {
        ask: 'What number is this?',
        eq: te ? `${h * 100} + ${te * 10} + ${o} = ?` : `${h * 100} + ${o} = ?`,
        options: bigOptions(v, n, rng, te ? [h * 100 + o * 10 + te] : [h * 10 + o, h * 100 + o * 10, h * 1000 + o]),
        answer: v,
        explain: te ? `${h} hundreds, ${te} tens and ${o} ones make ${v}.` : `${h} hundreds, no tens and ${o} ones: ${v}. The zero keeps the tens place.`,
        hint: 'Write the hundreds, then the tens, then the ones. No tens? Put a 0 there.',
      };
    },
  },
  'g2-readwrite': {
    code: 'NC.2.NBT.3',
    name: 'Read and write numbers to 1,000',
    gen(t, rng, n) {
      const h = int(rng, 1, 9);
      const te = t === 2 && rng() < 0.6 ? 0 : int(rng, 1, 9);
      const o = int(rng, t === 2 ? 1 : 0, 9);
      const v = h * 100 + te * 10 + o;
      if (t === 0)
        return {
          ask: `Find ${numberWords(v)}.`,
          options: bigOptions(v, n, rng, [h * 100 + o * 10 + te, h * 10 + te]),
          answer: v,
          explain: `${numberWords(v)[0].toUpperCase()}${numberWords(v).slice(1)} is ${v}.`,
          hint: 'Hundreds first, then tens, then ones.',
        };
      if (t === 1)
        return {
          ask: 'Which number is this?',
          eq: `${h * 100} + ${te * 10} + ${o} = ?`,
          options: bigOptions(v, n, rng, [h * 100 + o * 10 + te, o * 100 + te * 10 + h]),
          answer: v,
          explain: `${h * 100} and ${te * 10} and ${o} make ${v}.`,
          hint: 'The hundreds digit, then the tens digit, then the ones digit.',
        };
      // the number, and its name in words
      const others = [...new Set([h * 100 + o * 10 + (te || 0), h * 10 + o, h * 100 + (te + 1) * 10 + o, (h + 1) * 100 + te * 10 + o].filter((x) => x !== v && x < 1000).map(numberWords))];
      return {
        ask: `Which words say ${v}?`,
        options: textOptions(numberWords(v), others, n, rng),
        answer: numberWords(v),
        explain: `${v} is ${numberWords(v)}.`,
        hint: te ? 'Read the hundreds, then the last two digits together.' : 'There are no tens: say the hundreds, then the ones.',
      };
    },
  },
  'g2-compare': {
    code: 'NC.2.NBT.4',
    name: 'Compare three-digit numbers (> = <)',
    gen(t, rng) {
      const a = int(rng, 100, 999);
      // the closer the numbers, the more digits to look at
      let b = t === 0 ? int(rng, 100, 999) : t === 1 ? Math.floor(a / 100) * 100 + int(rng, 0, 99) : Math.floor(a / 10) * 10 + int(rng, 0, 9);
      if (t === 2 && rng() < 0.3) b = Math.floor(a / 100) * 100 + (a % 10) * 10 + Math.floor((a % 100) / 10);
      if (t > 0 && rng() < 0.12) b = a;
      if (t === 0) {
        while (b === a) b = int(rng, 100, 999);
        return {
          ask: 'Which number is greater?',
          options: [a, b].sort((x, y) => x - y).map((v) => ({ value: v, label: String(v) })),
          answer: Math.max(a, b),
          explain: `${Math.max(a, b)} is greater than ${Math.min(a, b)}.`,
          hint: 'Look at the hundreds first.',
        };
      }
      const answer = a > b ? '>' : a < b ? '<' : '=';
      const words = { '>': 'is greater than', '<': 'is less than', '=': 'is equal to' };
      return {
        ask: 'Greater than, less than or equal?',
        eq: `${a} ? ${b}`,
        say: `${a}… ${b}. Which sign goes in the middle?`,
        options: [
          { value: '>', label: '>', say: 'greater than' },
          { value: '=', label: '=', say: 'equal to' },
          { value: '<', label: '<', say: 'less than' },
        ],
        answer,
        explain: `${a} ${words[answer]} ${b}.`,
        hint: 'Hundreds first. Same hundreds? Look at the tens, then the ones.',
      };
    },
  },
  'g2-skip': {
    code: 'NC.2.NBT.2',
    name: 'Skip count by 5s, 10s and 100s to 1,000',
    gen(t, rng, n) {
      const step = t === 0 ? 100 : t === 1 ? 10 : pick(rng, [5, 10]);
      // tier 1 and 2 cross a hundred: 270, 280, 290, 300
      const start = t === 0 ? int(rng, 1, 5) * 100 : t === 1 ? int(rng, 1, 9) * 100 - int(rng, 2, 3) * 10 : int(rng, 2, 9) * 100 - int(rng, 2, 3) * step;
      const s = sequence(rng, { start, step, len: 5, gapAtEnd: t === 0 });
      const near = shuffle([s.answer - step, s.answer + step, s.answer + 2 * step, s.answer - 2 * step, s.answer + 1].filter((v) => v > 0), rng).slice(0, n - 1);
      return {
        ...s,
        ask: `Count by ${step}s. ${s.ask}`,
        options: [s.answer, ...near].sort((a, b) => a - b).map((v) => ({ value: v, label: String(v) })),
        explain: `Each jump is ${step} more. ${s.answer}!`,
        hint: step === 100 ? 'Only the hundreds digit changes.' : `Add ${step}. After 9 tens comes a new hundred.`,
      };
    },
  },
  'g2-tenmore': {
    code: 'NC.2.NBT.8',
    name: '10 or 100 more and less',
    gen(t, rng, n) {
      const d = t === 0 ? 10 : pick(rng, [10, 100]);
      const more = rng() < 0.5;
      const [h, o] = [int(rng, more ? 1 : 2, 8), int(rng, 0, 9)];
      // tier 2 crosses a hundred: 10 more than 395 is 405
      const te = t === 2 && d === 10 ? (more ? 9 : 0) : int(rng, 1, 8);
      const v = h * 100 + te * 10 + o;
      const answer = more ? v + d : v - d;
      const other = d === 10 ? 100 : 10;
      return {
        ask: `What is ${d} ${more ? 'more' : 'less'} than ${v}?`,
        model: t === 0 ? { kind: 'base10', hundreds: h, tens: te, ones: o } : null,
        options: bigOptions(answer, n, rng, [more ? v + other : v - other, more ? v + 1 : v - 1]),
        answer,
        explain: `${d} ${more ? 'more' : 'less'} than ${v} is ${answer}.${Math.floor(answer / 100) !== h && d === 10 ? ' The tens went past a hundred, so the hundreds changed too.' : ''}`,
        hint: d === 10 ? 'Change the tens digit by one.' : 'Change the hundreds digit by one.',
      };
    },
  },
  'g2-facts': {
    code: 'NC.2.OA.2',
    name: 'Add and subtract within 20 in your head',
    gen(t, rng, n) {
      const plus = t === 0 ? true : t === 1 ? false : rng() < 0.5;
      // make-ten facts: 8 + 5, 9 + 7
      const a = int(rng, 6, 9);
      const b = int(rng, 11 - a, 9);
      const sum = a + b;
      if (t === 2 && rng() < 0.4) {
        return {
          ask: 'What is missing?',
          eq: `${a} + ? = ${sum}`,
          model: null,
          options: numberOptions(b, n, rng, { min: 1, max: 12 }),
          answer: b,
          explain: `${a} + ${b} = ${sum}.`,
          hint: `Count on from ${a} to ${sum}.`,
        };
      }
      return {
        ask: plus ? 'Add!' : 'Take away!',
        say: plus ? `${a} plus ${b}?` : `${sum} minus ${b}?`,
        eq: plus ? `${a} + ${b} = ?` : `${sum} − ${b} = ?`,
        model: null,
        options: numberOptions(plus ? sum : a, n, rng, { min: 0, max: 20 }),
        answer: plus ? sum : a,
        explain: plus ? `${a} + ${b} = ${sum}. ${a} and ${10 - a} make ten, and ${sum - 10} more.` : `${sum} − ${b} = ${a}, because ${a} + ${b} = ${sum}.`,
        hint: plus ? `Make a ten: ${a} + ${10 - a} = 10, then add the rest.` : `Think addition: ${b} plus what makes ${sum}?`,
      };
    },
  },
  'g2-add100': {
    code: 'NC.2.NBT.5',
    name: 'Add two-digit numbers',
    gen(t, rng, n) {
      const regroup = t === 1 || (t === 2 && rng() < 0.6);
      let a;
      let b;
      do {
        a = int(rng, 12, 68);
        b = int(rng, 11, 49);
      } while (a + b > 99 || (a % 10) + (b % 10) >= 10 !== regroup || b % 10 === 0);
      const answer = a + b;
      const [at, ao, bt, bo] = [Math.floor(a / 10), a % 10, Math.floor(b / 10), b % 10];
      return {
        ask: 'Add them!',
        say: `${a} plus ${b}?`,
        eq: `${a} + ${b} = ?`,
        model: t === 2 ? null : { kind: 'base10', tens: at, ones: ao, addTens: bt, addOnes: bo },
        options: bigOptions(answer, n, rng, regroup ? [answer - 10, Number(`${at + bt}${ao + bo}`)] : [answer + 10, answer - 1]),
        answer,
        explain: regroup ? `${ao} + ${bo} = ${ao + bo}: ten ones make a new ten! ${a} + ${b} = ${answer}.` : `${at + bt} tens and ${ao + bo} ones: ${answer}.`,
        hint: 'Add the tens, then the ones. Ten ones make a new ten.',
      };
    },
  },
  'g2-sub100': {
    code: 'NC.2.NBT.5',
    name: 'Subtract two-digit numbers',
    gen(t, rng, n) {
      const regroup = t > 0 && (t === 1 || rng() < 0.7);
      let a;
      let b;
      do {
        a = int(rng, 31, 99);
        b = int(rng, 11, a - 5);
      } while ((a % 10 < b % 10) !== regroup || b % 10 === 0);
      const answer = a - b;
      const [at, ao, bt, bo] = [Math.floor(a / 10), a % 10, Math.floor(b / 10), b % 10];
      // a common slip: taking the smaller ones from the bigger (52 − 27 → 35)
      const slip = (at - bt) * 10 + Math.abs(ao - bo);
      return {
        ask: 'Take away!',
        say: `${a} minus ${b}?`,
        eq: `${a} − ${b} = ?`,
        model: t === 0 ? { kind: 'base10', tens: at, ones: ao, goneTens: bt, goneOnes: bo } : null,
        options: bigOptions(answer, n, rng, regroup ? [slip, answer + 10] : [answer + 10, answer - 10]),
        answer,
        explain: regroup ? `Not enough ones, so break a ten: ${ao + 10} − ${bo} = ${ao + 10 - bo}. ${a} − ${b} = ${answer}.` : `${at - bt} tens and ${ao - bo} ones: ${answer}.`,
        hint: regroup ? 'Not enough ones? Break a ten into 10 ones.' : 'Take away the tens, then the ones.',
      };
    },
  },
  'g2-add1000': {
    code: 'NC.2.NBT.7',
    name: 'Add and subtract within 1,000',
    gen(t, rng, n) {
      const plus = rng() < 0.55;
      let a;
      let b;
      if (t === 0) {
        a = int(rng, 1, 6) * 100;
        b = int(rng, 1, plus ? 9 - a / 100 : a / 100 - 1 || 1) * 100;
        if (!plus && b >= a) b = 100;
      } else if (t === 1) {
        // a hundreds, tens and ones number, and some tens or hundreds: no regrouping
        a = int(rng, 2, 7) * 100 + int(rng, 1, 5) * 10 + int(rng, 1, 9);
        b = pick(rng, [int(rng, 1, 3) * 10, int(rng, 1, 2) * 100]);
      } else {
        do {
          a = int(rng, 150, 850);
          b = int(rng, 110, plus ? 999 - a : a - 20);
        } while (b < 100);
      }
      if (!plus && b > a) [a, b] = [b, a];
      const answer = plus ? a + b : a - b;
      return {
        ask: plus ? 'Add them!' : 'Take away!',
        say: `${a} ${plus ? 'plus' : 'minus'} ${b}?`,
        eq: `${a} ${plus ? '+' : '−'} ${b} = ?`,
        options: bigOptions(answer, n, rng, plus ? [answer - 100, answer + 10] : [answer + 100, answer - 10]),
        answer,
        explain: `${a} ${plus ? 'plus' : 'minus'} ${b} is ${answer}.`,
        hint: 'Hundreds with hundreds, tens with tens, ones with ones.',
      };
    },
  },
  'g2-story': {
    code: 'NC.2.OA.1',
    name: 'Story problems in one and two steps',
    gen(t, rng, n) {
      const [A, B] = shuffle(['Gilu', 'Pip', 'Tiko', 'Kuku'], rng);
      const [one, many] = pick(rng, [
        ['mango', 'mangoes'],
        ['marble', 'marbles'],
        ['sticker', 'stickers'],
        ['kite', 'kites'],
        ['laddoo', 'laddoos'],
        ['shell', 'shells'],
      ]);
      const top = t === 0 ? 50 : 100;
      const kind = t === 2 ? pick(rng, ['two', 'two', 'start']) : pick(rng, t === 0 ? ['join', 'take'] : ['join', 'take', 'compare']);
      let say;
      let answer;
      let eq = null;
      let tricky = [];
      if (kind === 'join') {
        const a = int(rng, 10, top - 15);
        const b = int(rng, 5, top - a);
        answer = a + b;
        say = `${A} has ${a} ${many}. ${A} gets ${b} more. How many ${many} does ${A} have now?`;
        eq = `${a} + ${b} = ?`;
        tricky = [a - b > 0 ? a - b : a + b + 10];
      } else if (kind === 'take') {
        const a = int(rng, 20, top);
        const b = int(rng, 5, a - 5);
        answer = a - b;
        say = `${A} has ${a} ${many}. ${A} gives ${b} to ${B}. How many ${many} are left?`;
        eq = `${a} − ${b} = ?`;
        tricky = [a + b];
      } else if (kind === 'compare') {
        const a = int(rng, 20, top);
        const b = int(rng, 5, a - 3);
        answer = a - b;
        say = `${A} has ${a} ${many}. ${B} has ${b}. How many more ${many} does ${A} have than ${B}?`;
        tricky = [a + b];
      } else if (kind === 'start') {
        const start = int(rng, 10, 60);
        const b = int(rng, 5, 30);
        answer = start;
        say = `${A} had some ${many}. ${B} gave ${A} ${b} more. Now ${A} has ${start + b}. How many did ${A} have at first?`;
        tricky = [start + 2 * b];
      } else {
        const a = int(rng, 15, 60);
        const b = int(rng, 5, 30);
        const c = int(rng, 5, a + b - 5);
        answer = a + b - c;
        say = `${A} has ${a} ${many}. ${A} finds ${b} more, then gives ${c} to ${B}. How many ${many} does ${A} have now?`;
        tricky = [a + b, a - c];
      }
      return {
        ask: say,
        eq: t === 0 ? eq : null,
        options: numberOptions(answer, n, rng, { min: 0, max: 130, tricky }),
        answer,
        explain: `${answer} ${answer === 1 ? one : many}!`,
        hint: kind === 'two' ? 'Two steps: first add what was found, then take away what was given.' : kind === 'compare' ? 'How many more? Take the smaller number from the bigger one.' : kind === 'start' ? 'Think backwards: take away what was given.' : 'Is it getting more, or less?',
      };
    },
  },
  'g2-oddeven': {
    code: 'NC.2.OA.3',
    name: 'Odd and even',
    gen(t, rng, n) {
      const oe = [
        { value: 'even', label: 'even' },
        { value: 'odd', label: 'odd' },
      ];
      if (t === 2 && rng() < 0.6) {
        const wantEven = rng() < 0.5;
        let vals;
        do vals = Array.from({ length: Math.max(2, Math.min(n, 4)) }, () => int(rng, 11, 99));
        while (new Set(vals).size !== vals.length || vals.filter((v) => (v % 2 === 0) === wantEven).length !== 1);
        const answer = vals.find((v) => (v % 2 === 0) === wantEven);
        return {
          ask: `Which number is ${wantEven ? 'even' : 'odd'}?`,
          options: vals.sort((a, b) => a - b).map((v) => ({ value: v, label: String(v) })),
          answer,
          explain: `${answer} ends in ${answer % 10}, so it is ${wantEven ? 'even' : 'odd'}.`,
          hint: 'Look at the ones digit: 0, 2, 4, 6 and 8 are even.',
        };
      }
      const v = t === 0 ? int(rng, 2, 12) : int(rng, 5, t === 2 ? 99 : 20);
      const even = v % 2 === 0;
      const th = thing(rng);
      return {
        ask: t === 0 ? `${v} ${th.many}: odd or even?` : `Is ${v} odd or even?`,
        model: t === 0 ? { kind: 'objects', groups: [{ n: v, pic: th.pic }], layout: 'rows', cols: 2, countable: true } : null,
        options: oe,
        answer: even ? 'even' : 'odd',
        explain: even ? `${v} is even: every one has a partner. ${v / 2} + ${v / 2} = ${v}.` : `${v} is odd: one is left over without a partner.`,
        hint: t === 0 ? 'Make pairs. Is one left over?' : 'Look at the ones digit: 0, 2, 4, 6 and 8 are even.',
      };
    },
  },
  'g2-arrays': {
    code: 'NC.2.OA.4',
    name: 'Arrays: rows and columns',
    gen(t, rng, n) {
      const rows = int(rng, 2, t === 0 ? 3 : 5);
      const cols = int(rng, 2, t === 0 ? 4 : 5);
      const total = rows * cols;
      const th = thing(rng);
      const sum = Array.from({ length: rows }, () => cols).join(' + ');
      if (t === 2 && rng() < 0.5) {
        const wrong = [`${rows} + ${cols}`, Array.from({ length: rows + 1 }, () => cols).join(' + '), Array.from({ length: rows }, () => cols + 1).join(' + ')];
        return {
          ask: 'Which adding sentence matches the rows?',
          model: { kind: 'array', rows, cols, pic: th.pic },
          options: textOptions(sum, wrong, Math.min(n, 4), rng),
          answer: sum,
          explain: `${rows} rows of ${cols}: ${sum} = ${total}.`,
          hint: 'Count how many are in one row. How many rows are there?',
        };
      }
      return {
        ask: `${rows} rows of ${cols}. How many in all?`,
        eq: `${sum} = ?`,
        model: { kind: 'array', rows, cols, pic: th.pic },
        options: numberOptions(total, n, rng, { min: 4, max: 30, tricky: [rows + cols] }),
        answer: total,
        explain: `${sum} = ${total}. ${total} ${th.many}!`,
        hint: `Count by ${cols}s, one row at a time.`,
      };
    },
  },
  'g2-time': {
    code: 'NC.2.MD.7',
    name: 'Tell time to five minutes; a.m. and p.m.',
    gen(t, rng, n) {
      if (t === 2 && rng() < 0.4) {
        const [what, h, half] = pick(rng, DAY_TIMES);
        return {
          ask: `You ${what} at ${h}:${String(0).padStart(2, '0')}. Is it a.m. or p.m.?`,
          say: `You ${what} at ${h} o'clock. Is it a.m. or p.m.?`,
          options: [
            { value: 'a.m.', label: 'a.m.', say: 'a m, in the morning' },
            { value: 'p.m.', label: 'p.m.', say: 'p m, after noon' },
          ],
          answer: half,
          explain: half === 'a.m.' ? `${h} a.m. is in the morning.` : `${h} p.m. is after noon${h >= 7 && h !== 12 ? ', in the evening' : ''}.`,
          hint: 'a.m. is from midnight to noon. p.m. is from noon to midnight.',
        };
      }
      const h = int(rng, 1, 12);
      const m = t === 0 ? pick(rng, [0, 15, 30, 45]) : int(rng, 0, 11) * 5;
      const label = clockLabel(h, m);
      // the slips children make: the hands swapped, the hour after, the minutes read as the number pointed to
      const pool = [clockLabel(m / 5 || 12, (h % 12) * 5), clockLabel((h % 12) + 1, m), clockLabel(h, m / 5), clockLabel(h, (m + 5) % 60), clockLabel(((h + 10) % 12) + 1, m), clockLabel(h, (m + 30) % 60)];
      const wrong = shuffle([...new Set(pool)].filter((x) => x !== label), rng).slice(0, n - 1);
      const opts = shuffle([label, ...wrong], rng);
      const parse = (s) => s.split(':').map(Number);
      if (t === 2)
        return {
          ask: `Which clock shows ${label}?`,
          say: `Which clock shows ${clockSay(h, m)}?`,
          options: opts.map((s) => ({ value: s, say: clockSay(...parse(s)), model: { kind: 'clock', h: parse(s)[0], m: parse(s)[1], small: true } })),
          answer: label,
          explain: `The long hand on the ${m / 5 || 12} means ${m} minutes. It's ${clockSay(h, m)}.`,
          hint: 'Count by fives for the long hand: 5, 10, 15…',
        };
      return {
        ask: 'What time is it?',
        model: { kind: 'clock', h, m },
        options: opts.map((s) => ({ value: s, label: s, say: clockSay(...parse(s)) })),
        answer: label,
        explain: m ? `The short hand is just past ${h}. The long hand is on the ${m / 5}: ${m / 5} fives make ${m} minutes. It's ${clockSay(h, m)}.` : `It's ${h} o'clock!`,
        hint: 'The short hand shows the hour. Count by fives for the long hand: 5, 10, 15…',
      };
    },
  },
  'g2-money': {
    code: 'NC.2.MD.8',
    name: 'Count money: coins and dollars',
    gen(t, rng, n) {
      const kinds = t === 0 ? ['dime', 'nickel', 'penny'] : t === 1 ? ['quarter', 'dime', 'nickel', 'penny'] : ['quarter', 'dime', 'nickel', 'penny'];
      const coins = Array.from({ length: int(rng, t === 0 ? 2 : 3, t === 0 ? 5 : 6) }, () => pick(rng, kinds));
      const bills = t === 2 ? int(rng, 1, 2) : 0;
      const items = [...Array.from({ length: bills }, () => 'dollar'), ...coins.sort((a, b) => MONEY[b] - MONEY[a])];
      const total = items.reduce((s, k) => s + MONEY[k], 0);
      const label = (v) => (v >= 100 ? `$${(v / 100).toFixed(2)}` : `${v}¢`);
      const near = shuffle([1, 5, 10, 25, 100].flatMap((d) => [total + d, total - d]).filter((v) => v > 0 && v !== total), rng);
      const tricky = t === 0 ? [items.length] : [];
      const others = [...new Set([...tricky, ...near])].filter((v) => v !== total && v > 0).slice(0, n - 1);
      let run = 0;
      const steps = items.map((k) => (run += MONEY[k]));
      const asText = t > 0 && rng() < 0.3;
      const countOf = (k) => items.filter((x) => x === k).length;
      const list = Object.keys(MONEY)
        .filter((k) => countOf(k))
        .map((k) => `${countOf(k)} ${k === 'penny' && countOf(k) > 1 ? 'pennies' : countOf(k) > 1 ? `${k}s` : k}`)
        .join(', ');
      return {
        ask: asText ? `You have ${list}. How much money is that?` : 'How much money?',
        model: asText ? null : { kind: 'money', items },
        options: [total, ...others].sort((a, b) => a - b).map((v) => ({ value: v, label: label(v), say: v >= 100 ? `${Math.floor(v / 100)} dollar${v >= 200 ? 's' : ''} and ${v % 100} cents` : `${v} cents` })),
        answer: total,
        explain: `${steps.join(', ')}. ${label(total)}!`,
        hint: 'Start with the one worth the most, then count on.',
      };
    },
  },
  'g2-length': {
    code: 'NC.2.MD.1',
    name: 'Measure with a ruler: inches and centimetres',
    gen(t, rng, n) {
      const th = pick(rng, ['pencil', 'snake', 'train', 'ribbon']);
      if (t === 1 && rng() < 0.3) {
        const [what, unit] = pick(rng, UNIT_CHOICES);
        return {
          ask: `Would you measure ${what} in inches or in feet?`,
          options: [
            { value: 'inches', label: 'inches' },
            { value: 'feet', label: 'feet' },
          ],
          answer: unit,
          explain: unit === 'feet' ? `${what[0].toUpperCase()}${what.slice(1)} is big: feet!` : `${what[0].toUpperCase()}${what.slice(1)} is small: inches!`,
          hint: 'An inch is about as long as the top of your thumb. A foot is as long as a big ruler.',
        };
      }
      if (t === 2 && rng() < 0.4) {
        // how much longer (NC.2.MD.4)
        const a = int(rng, 8, 20);
        const b = int(rng, 3, a - 2);
        const [x, y] = shuffle(['ribbon', 'pencil', 'snake', 'worm', 'stick'], rng);
        return {
          ask: `The ${x} is ${a} cm long. The ${y} is ${b} cm long. How much longer is the ${x}?`,
          eq: `${a} − ${b} = ?`,
          options: numberOptions(a - b, n, rng, { min: 1, max: 20, tricky: [a + b] }),
          answer: a - b,
          explain: `${a} − ${b} = ${a - b}. The ${x} is ${a - b} centimetres longer.`,
          hint: 'How much longer? Take the shorter length from the longer one.',
        };
      }
      const unit = t === 0 ? 'in' : pick(rng, ['in', 'cm']);
      const len = unit === 'in' ? int(rng, 2, 6) : int(rng, 4, 13);
      // at the top level the thing does not start at 0
      const start = t === 2 ? int(rng, 1, 3) : 0;
      const word = unit === 'in' ? 'inches' : 'centimetres';
      return {
        ask: `How long is the ${th}?`,
        say: `How many ${word} long is the ${th}?`,
        model: { kind: 'ruler', unit, len, start, thing: th, color: pick(rng, COLORS) },
        options: numberOptions(len, n, rng, { min: 1, max: 16, tricky: start ? [start + len] : [] }).map((o) => ({ ...o, label: `${o.value} ${unit}`, say: `${o.value} ${word}` })),
        answer: len,
        explain: start ? `It starts at ${start} and ends at ${start + len}: ${len} ${word}.` : `The ${th} is ${len} ${word} long.`,
        hint: start ? 'It does not start at 0! Count the spaces from one end to the other.' : 'Start at 0 and read the number at the end.',
      };
    },
  },
  'g2-shapes': {
    code: 'NC.2.G.1',
    name: 'Shapes by their sides, angles and faces',
    gen(t, rng, n) {
      if (t === 2 && rng() < 0.4) {
        const [q, answer] = pick(rng, [
          ['faces does a cube have', 6],
          ['corners does a cube have', 8],
          ['angles does a pentagon have', 5],
          ['angles does a hexagon have', 6],
        ]);
        const solid = q.includes('cube');
        return {
          ask: `How many ${q}?`,
          model: { kind: 'shape', shape: solid ? 'cube' : q.split(' ').at(-2), color: pick(rng, COLORS), marks: solid ? undefined : 'corners' },
          options: numberOptions(answer, n, rng, { min: 3, max: 12 }),
          answer,
          explain: `A ${solid ? 'cube' : q.split(' ').at(-2)} has ${answer} ${q.split(' ')[0]}.`,
          hint: solid ? 'Picture a dice: count every side, even the ones you cannot see.' : 'An angle is a corner: count them.',
        };
      }
      if (t === 0) {
        const s = pick(rng, ['triangle', 'pentagon', 'hexagon', 'trapezoid', 'rhombus']);
        return {
          ask: `How many sides does this ${s} have?`,
          model: { kind: 'shape', shape: s, color: pick(rng, COLORS), marks: 'sides' },
          options: numberOptions(POLY_SIDES[s], n, rng, { min: 3, max: 8 }),
          answer: POLY_SIDES[s],
          explain: `A ${s} has ${POLY_SIDES[s]} sides.`,
          hint: 'Touch each side and count.',
        };
      }
      const want = pick(rng, ['triangle', 'quadrilateral', 'pentagon', 'hexagon']);
      const sides = { triangle: 3, quadrilateral: 4, pentagon: 5, hexagon: 6 }[want];
      const fits = Object.keys(POLY_SIDES).filter((s) => POLY_SIDES[s] === sides);
      const right = pick(rng, fits);
      const others = shuffle(
        Object.keys(POLY_SIDES).filter((s) => POLY_SIDES[s] !== sides),
        rng,
      );
      // never two of the same number of sides among the wrong ones' kinds… and never another right one
      const wrong = [];
      for (const s of others) if (wrong.length < n - 1 && !wrong.some((w) => POLY_SIDES[w] === POLY_SIDES[s])) wrong.push(s);
      return {
        ask: `Which one is a ${want}?`,
        options: shuffle([right, ...wrong], rng).map((s, i) => ({ value: s, say: `the ${s}`, model: { kind: 'shape', shape: s, color: COLORS[i % COLORS.length] } })),
        answer: right,
        explain: `A ${want} has ${sides} sides. This ${right} has ${sides}!`,
        hint: `A ${want} has ${sides} sides. Count the sides of each.`,
      };
    },
  },
  'g2-partition': {
    code: 'NC.2.G.2',
    name: 'Rows and columns of squares',
    gen(t, rng, n) {
      const rows = int(rng, 2, t === 0 ? 2 : 4);
      const cols = int(rng, 2, t === 0 ? 3 : 5);
      if (t === 2) {
        const key = (r, c) => `${r}x${c}`;
        const cands = [
          [rows, cols],
          [cols, rows],
          [rows, cols + 1],
          [rows + 1, cols],
        ].filter(([r, c], i, a) => a.findIndex(([r2, c2]) => key(r, c) === key(r2, c2)) === i);
        const [right, ...rest] = cands;
        const opts = [right, ...shuffle(rest, rng).slice(0, n - 1)];
        return {
          ask: `Which is cut into ${rows} rows of ${cols} squares?`,
          options: shuffle(opts, rng).map(([r, c]) => ({ value: key(r, c), say: `${r} rows of ${c}`, model: { kind: 'grid', rows: r, cols: c, small: true } })),
          answer: key(rows, cols),
          explain: `${rows} rows, ${cols} squares in each: ${rows * cols} squares.`,
          hint: 'Rows go across. Count the rows, then the squares in one row.',
        };
      }
      return {
        ask: 'How many squares?',
        model: { kind: 'grid', rows, cols },
        options: numberOptions(rows * cols, n, rng, { min: 2, max: 25, tricky: [rows + cols] }),
        answer: rows * cols,
        explain: `${rows} rows of ${cols}: ${Array.from({ length: rows }, () => cols).join(' + ')} = ${rows * cols}.`,
        hint: 'Count one row, then count by that number for each row.',
      };
    },
  },
  'g2-fractions': {
    code: 'NC.2.G.3',
    name: 'Halves, thirds and fourths',
    gen(t, rng, n) {
      const NAMES = { 2: ['halves', 'a half'], 3: ['thirds', 'a third'], 4: ['fourths', 'a fourth'] };
      const shape = pick(rng, ['circle', 'rect']);
      if (t === 0) {
        const k = pick(rng, [2, 3, 4]);
        const cands = [
          { parts: k, equal: true },
          ...shuffle(
            [2, 3, 4].filter((x) => x !== k).map((x) => ({ parts: x, equal: true })),
            rng,
          ),
          { parts: k, equal: false },
        ];
        const opts = [cands[0], ...shuffle(cands.slice(1), rng).slice(0, n - 1)];
        return {
          ask: `Which shows ${NAMES[k][0]}?`,
          options: shuffle(opts, rng).map((c) => ({ value: `${c.parts}${c.equal ? '' : 'u'}`, say: 'this one', model: { kind: 'parts', shape, parts: c.parts, equal: c.equal } })),
          answer: `${k}`,
          explain: `${k} equal parts: ${NAMES[k][0]}!`,
          hint: 'Count the parts. Are they all the same size?',
        };
      }
      const k = pick(rng, [2, 3, 4]);
      if (t === 2 && rng() < 0.5) {
        return {
          ask: `How many ${NAMES[k][0]} make a whole?`,
          model: { kind: 'parts', shape, parts: k, equal: true },
          options: numberOptions(k, n, rng, { min: 1, max: 6 }),
          answer: k,
          explain: `${k} ${NAMES[k][0]} make one whole.`,
          hint: 'Count the equal parts in the whole shape.',
        };
      }
      return {
        ask: 'The shape is cut into equal parts. What is the orange part called?',
        model: { kind: 'parts', shape, parts: k, equal: true, shade: 1 },
        options: textOptions(NAMES[k][1], ['a half', 'a third', 'a fourth'], Math.min(n, 3), rng),
        answer: NAMES[k][1],
        explain: `${k} equal parts, so each part is ${NAMES[k][1]}.`,
        hint: 'Count all the equal parts: 2 is halves, 3 is thirds, 4 is fourths.',
      };
    },
  },
  'g2-graph': {
    code: 'NC.2.MD.10',
    name: 'Bar graphs',
    gen(t, rng, n) {
      const cats = t === 0 ? 3 : 4;
      const picked = shuffle(THINGS.slice(0, 12), rng).slice(0, cats);
      let counts;
      do counts = picked.map(() => int(rng, 1, t === 0 ? 6 : 10));
      while (new Set(counts).size !== cats);
      const model = { kind: 'bars', rows: picked.map(([pic, , many], i) => ({ pic, label: many, n: counts[i] })), max: t === 0 ? 6 : 10 };
      const name = (i) => picked[i][2];
      const q = t === 0 ? pick(rng, ['count', 'most']) : t === 1 ? pick(rng, ['count', 'more', 'fewest']) : pick(rng, ['more', 'total', 'fewer']);
      if (q === 'most' || q === 'fewest') {
        const target = counts.indexOf(q === 'most' ? Math.max(...counts) : Math.min(...counts));
        return {
          ask: `Which has the ${q}?`,
          model,
          options: picked.map(([pic, , many]) => ({ value: pic, say: many, model: { kind: 'pic', pic } })).slice(0, Math.max(n, 2)).concat(picked.slice(Math.max(n, 2)).map(([pic, , many]) => ({ value: pic, say: many, model: { kind: 'pic', pic } }))).slice(0, 4),
          answer: picked[target][0],
          explain: `${name(target)}: ${counts[target]}. That's the ${q}!`,
          hint: q === 'most' ? 'Find the tallest bar.' : 'Find the shortest bar.',
        };
      }
      const [i, j] = shuffle([0, 1, 2, 3].slice(0, cats), rng);
      if (q === 'more' || q === 'fewer') {
        const [big, small] = counts[i] > counts[j] ? [i, j] : [j, i];
        const answer = counts[big] - counts[small];
        return {
          ask: q === 'more' ? `How many more ${name(big)} than ${name(small)}?` : `How many fewer ${name(small)} than ${name(big)}?`,
          model,
          options: numberOptions(answer, n, rng, { min: 1, max: 10, tricky: [counts[big] + counts[small]] }),
          answer,
          explain: `${counts[big]} − ${counts[small]} = ${answer}.`,
          hint: 'Read both bars, then take the smaller from the bigger.',
        };
      }
      if (q === 'total') {
        const answer = counts[i] + counts[j];
        return {
          ask: `How many ${name(i)} and ${name(j)} in all?`,
          model,
          options: numberOptions(answer, n, rng, { min: 2, max: 20 }),
          answer,
          explain: `${counts[i]} + ${counts[j]} = ${answer}.`,
          hint: 'Read both bars and add them.',
        };
      }
      return {
        ask: `How many ${name(i)}?`,
        model,
        options: numberOptions(counts[i], n, rng, { min: 1, max: 10 }),
        answer: counts[i],
        explain: `The bar for ${name(i)} goes up to ${counts[i]}.`,
        hint: 'Follow the top of the bar across to the numbers.',
      };
    },
  },
};

export const SKILL_IDS = Object.keys(SKILLS);

// What the parent's progress view shows for a skill.
export function skillName(id) {
  return SKILLS[id] ? `${SKILLS[id].name} (${SKILLS[id].code})` : id;
}

export function makeProblem(skillId, { tier = 0, n = 3, rng = Math.random } = {}) {
  const skill = SKILLS[skillId];
  if (!skill) throw new Error(`unknown math skill "${skillId}"`);
  const t = Math.max(0, Math.min(2, tier | 0));
  const p = skill.gen(t, rng, Math.max(2, Math.min(4, n)));
  return { skill: skillId, tier: t, layout: 'row', ...p };
}
