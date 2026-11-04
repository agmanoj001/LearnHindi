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

const HEAVY = [
  ['elephant', 'mouse'],
  ['cow', 'chick'],
  ['truck', 'bicycle'],
  ['bear', 'rabbit'],
  ['whale', 'fish'],
  ['buffalo', 'duck'],
];

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
