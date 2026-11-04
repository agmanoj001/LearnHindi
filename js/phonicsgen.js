// English phonics for Kindergarten and Grade 1, following the NC Standard Course of Study for
// English Language Arts, Reading: Foundational Skills (NC.K.RF.1–3, NC.1.RF.2–3). Pure: no DOM.
//
//   makePhonics(skillId, { tier, n, rng }) → {
//     ask, say       what is shown / spoken
//     pic            a picture id to show (tap to hear the word)
//     word           { text, gap: [start, end] } a written word, maybe with a gap to fill
//     tiles          letters to read one by one (blending)
//     options        [{ value, label?, pic?, say? }]: letters, word parts, words or pictures
//     answer, explain, hint, parts (syllables shown after a clapping question)
//   }
//
// Phonemes can't be spoken reliably by text-to-speech, so sounds are always given with a key word
// ("c, as in cat"). Grown-ups can record real letter sounds in the parent area.

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

// ---------- word lists (word → picture id) ----------

export const PIC = {
  cat: 'cat', bag: 'bag', cap: 'cap', fan: 'fan', hat: 'hat', van: 'postvan', bed: 'bed', hen: 'hen', pen: 'pen', net: 'net',
  pig: 'pig', dog: 'dog', fox: 'fox', pot: 'pot', box: 'box', log: 'log', sun: 'sun', bus: 'bus', cup: 'cup', bug: 'bug',
  fish: 'fish', ship: 'ship', milk: 'milk', duck: 'duck', drum: 'drum', apple: 'apple', ant: 'ant', bee: 'bee', banana: 'banana',
  book: 'book', boat: 'boat', car: 'car', cake: 'cake', cow: 'cow', crab: 'crab', egg: 'dinoegg', elephant: 'elephant', fork: 'fork',
  frog: 'frog', flag: 'flag', goat: 'goat', grapes: 'grapes', girl: 'girl', horse: 'horse', house: 'house', igloo: 'igloo', jar: 'jar',
  jellyfish: 'jellyfish', kite: 'kite', king: 'king', lion: 'lion', leaf: 'leaf', lock: 'lock', moon: 'moon', monkey: 'monkey',
  mouse: 'mouse', octopus: 'octopus', owl: 'owl', plane: 'plane', rabbit: 'rabbit', rose: 'rose', rocket: 'rocket', seal: 'seal',
  snake: 'snake', tiger: 'tiger', tree: 'tree', train: 'train', turtle: 'turtle', umbrella: 'umbrella', whale: 'whale', window: 'window',
  zebra: 'zebra', shell: 'shell', shoe: 'shoe', sheep: 'sheep', shark: 'shark', chair: 'chair', chick: 'chick', clock: 'clock',
  star: 'shape-star', snail: 'snail', snowman: 'snowman', truck: 'truck', crow: 'crow', crown: 'crown', crocodile: 'crocodile',
  plant: 'plant', spoon: 'spoon', bridge: 'bridge', glasses: 'glasses', swan: 'swan', swing: 'swing', flower: 'flower', bone: 'bone',
  coat: 'coat', tea: 'tea', corn: 'corn', bird: 'bird', bell: 'bell', camel: 'camel', butterfly: 'butterfly', helicopter: 'helicopter',
  ambulance: 'ambulance', dinosaur: 'trex',
};

const CVC = {
  a: ['cat', 'bag', 'cap', 'fan', 'hat', 'van'],
  e: ['bed', 'hen', 'pen', 'net'],
  i: ['pig', 'fish', 'ship', 'milk'],
  o: ['dog', 'fox', 'pot', 'box', 'log'],
  u: ['sun', 'bus', 'cup', 'bug', 'duck', 'drum'],
};
const SHORT3 = Object.values(CVC)
  .flat()
  .filter((w) => w.length === 3);

const FIRST = {
  a: ['apple', 'ant'], b: ['bus', 'bag', 'bed', 'bee', 'banana', 'book', 'boat'], c: ['cat', 'cap', 'car', 'cup', 'cake', 'cow', 'crab'],
  d: ['dog', 'duck', 'drum'], e: ['egg', 'elephant'], f: ['fan', 'fox', 'fish', 'frog', 'flag', 'fork'], g: ['goat', 'grapes', 'girl'],
  h: ['hat', 'hen', 'horse', 'house'], i: ['igloo'], j: ['jar', 'jellyfish'], k: ['kite', 'king'], l: ['lion', 'log', 'leaf', 'lock'],
  m: ['moon', 'monkey', 'mouse', 'milk'], n: ['net'], o: ['octopus', 'owl'], p: ['pig', 'pen', 'pot', 'plane'], r: ['rabbit', 'rose', 'rocket'],
  s: ['sun', 'seal', 'snake'], t: ['tiger', 'tree', 'train', 'turtle'], u: ['umbrella'], v: ['van'], w: ['whale', 'window'], z: ['zebra'],
};
const LAST = { t: ['cat', 'hat', 'net', 'pot', 'boat', 'goat'], g: ['dog', 'bag', 'pig', 'log', 'bug'], n: ['fan', 'van', 'hen', 'pen', 'sun'], s: ['bus'], p: ['cap', 'cup', 'ship'], d: ['bed'], x: ['box', 'fox'], m: ['drum'], b: ['crab'], r: ['car', 'jar'], l: ['seal', 'shell', 'bell'] };

const RHYMES = [
  ['cat', 'hat'], ['fan', 'van'], ['hen', 'pen'], ['dog', 'log', 'frog'], ['box', 'fox'], ['cake', 'snake'], ['bee', 'tree'],
  ['boat', 'goat', 'coat'], ['car', 'star', 'jar'], ['shell', 'bell'], ['clock', 'lock'], ['moon', 'spoon'], ['mouse', 'house'], ['bug', 'rug'],
].map((g) => g.filter((w) => PIC[w]));

const SYLLABLES = {
  cat: ['cat'], sun: ['sun'], dog: ['dog'], frog: ['frog'], bee: ['bee'], book: ['book'],
  apple: ['ap', 'ple'], monkey: ['mon', 'key'], rabbit: ['rab', 'bit'], tiger: ['ti', 'ger'], rocket: ['rock', 'et'], turtle: ['tur', 'tle'],
  camel: ['cam', 'el'], window: ['win', 'dow'], flower: ['flow', 'er'], lion: ['li', 'on'], zebra: ['ze', 'bra'], igloo: ['ig', 'loo'],
  butterfly: ['but', 'ter', 'fly'], elephant: ['el', 'e', 'phant'], banana: ['ba', 'na', 'na'], umbrella: ['um', 'brel', 'la'],
  dinosaur: ['di', 'no', 'saur'], crocodile: ['croc', 'o', 'dile'], octopus: ['oc', 'to', 'pus'], ambulance: ['am', 'bu', 'lance'],
  helicopter: ['hel', 'i', 'cop', 'ter'],
};

const SIGHT_K = ['a', 'and', 'can', 'go', 'I', 'in', 'is', 'it', 'like', 'me', 'my', 'see', 'the', 'to', 'up', 'we', 'you', 'he', 'she', 'look'];
const SIGHT_1 = ['said', 'was', 'have', 'they', 'what', 'where', 'one', 'two', 'could', 'would', 'there', 'come', 'some', 'of', 'from', 'were', 'your', 'does', 'again', 'many', 'who', 'put', 'here', 'little'];

// a phonics pattern and the words with a picture that show it, with where the pattern sits
const DIGRAPHS = { sh: ['ship', 'shell', 'shoe', 'sheep', 'shark', 'fish'], ch: ['chair', 'chick'], wh: ['whale'], ck: ['duck', 'clock', 'lock'] };
const BLENDS = { fr: ['frog'], fl: ['flag', 'flower'], st: ['star'], sn: ['snake', 'snail', 'snowman'], tr: ['train', 'tree', 'truck'], dr: ['drum'], cr: ['crab', 'crow', 'crown'], cl: ['clock'], pl: ['plane', 'plant'], gr: ['grapes'], sp: ['spoon'], br: ['bridge'], gl: ['glasses'], sw: ['swan', 'swing'] };
const TEAMS = { ee: ['tree', 'bee', 'sheep'], ea: ['seal', 'leaf', 'tea'], ai: ['snail', 'train'], oa: ['boat', 'goat', 'coat'], oo: ['moon', 'spoon'] };
const BOSSY_R = { ar: ['car', 'star', 'jar', 'shark'], or: ['corn', 'horse', 'fork'], ir: ['bird', 'girl'] };
const MAGIC_E = ['kite', 'cake', 'rose', 'bone', 'plane', 'snake'];
const PLURALS = [['cat', 'cats'], ['dog', 'dogs'], ['pig', 'pigs'], ['hat', 'hats'], ['bee', 'bees'], ['box', 'boxes'], ['bus', 'buses'], ['fox', 'foxes'], ['duck', 'ducks']];

const KEY = { a: 'apple', b: 'bus', c: 'cat', d: 'dog', e: 'egg', f: 'fish', g: 'goat', h: 'hat', i: 'igloo', j: 'jar', k: 'kite', l: 'lion', m: 'moon', n: 'net', o: 'octopus', p: 'pig', q: 'queen', r: 'rabbit', s: 'sun', t: 'tiger', u: 'umbrella', v: 'van', w: 'whale', x: 'box', y: 'yo-yo', z: 'zebra' };
export const soundOf = (letter) => `${letter}, as in ${KEY[letter.toLowerCase()] || letter}`;

const ABC = 'abcdefghijklmnopqrstuvwxyz'.split('');
const letterOpts = (answer, pool, n, rng, upper = false) =>
  shuffle([answer, ...shuffle(pool.filter((l) => l !== answer), rng).slice(0, n - 1)], rng).map((l) => ({ value: l, label: upper ? l.toUpperCase() : l, say: soundOf(l) }));
const picOpts = (answer, others, n, rng) => shuffle([answer, ...shuffle(others.filter((w) => w !== answer), rng).slice(0, n - 1)], rng).map((w) => ({ value: w, pic: PIC[w], say: w }));
const textOpts = (answer, others, n, rng) => shuffle([answer, ...shuffle([...new Set(others)].filter((w) => w !== answer), rng).slice(0, n - 1)], rng).map((w) => ({ value: w, label: w, say: w }));

// a pattern question: the word with its pattern hidden, pick the missing letters
function patternQuestion(groups, rng, n, { ask, explainWord }) {
  const keys = Object.keys(groups);
  const pat = pick(rng, keys);
  const w = pick(rng, groups[pat]);
  const at = w.indexOf(pat);
  return {
    ask,
    say: `${w}. ${ask}`,
    pic: PIC[w],
    word: { text: w, gap: [at, at + pat.length] },
    options: textOpts(pat, keys, n, rng),
    answer: pat,
    explain: explainWord(pat, w),
    hint: `Say it slowly: ${w}.`,
  };
}

export const PHONICS = {
  // ======================= Kindergarten =======================
  'k-letters': {
    code: 'NC.K.RF.1d',
    name: 'Know the letters, big and small',
    gen(t, rng, n) {
      const l = pick(rng, ABC);
      if (t === 0) return { ask: `Find the letter ${l.toUpperCase()}.`, options: letterOpts(l, ABC, n, rng, true), answer: l, explain: `That's ${l.toUpperCase()}!` };
      if (t === 1) return { ask: `Find small ${l}.`, say: `Find the small letter ${l}.`, options: letterOpts(l, ABC, n, rng), answer: l, explain: `That's small ${l}.` };
      // tier 2: look-alike small letters (b d p q, m n, u n)
      const alike = { b: 'dpq', d: 'bpq', p: 'bdq', q: 'bdp', m: 'nw', n: 'mu', u: 'nv', w: 'mv' };
      const pool = alike[l] ? [...alike[l]] : ABC;
      return { ask: `Big ${l.toUpperCase()}. Which small letter goes with it?`, word: { text: l.toUpperCase() }, options: letterOpts(l, pool.length >= n - 1 ? pool : ABC, n, rng), answer: l, explain: `Big ${l.toUpperCase()}, small ${l}.` };
    },
  },
  'k-first-sound': {
    code: 'NC.K.RF.3a',
    name: 'First sounds: which letter does it start with?',
    gen(t, rng, n) {
      const letters = Object.keys(FIRST);
      const l = pick(rng, t === 0 ? letters.filter((x) => 'bcdfmst'.includes(x)) : letters);
      const w = pick(rng, FIRST[l]);
      return {
        ask: `What does ${w} start with?`,
        say: `${w}. What sound does ${w} start with?`,
        pic: PIC[w],
        options: letterOpts(l, letters, n, rng),
        answer: l,
        explain: `${w} starts with ${soundOf(l)}.`,
        hint: `Say it slowly: ${w}. Listen to the very first sound.`,
      };
    },
  },
  'k-last-sound': {
    code: 'NC.K.RF.2d',
    name: 'Last sounds: how does it end?',
    gen(t, rng, n) {
      const letters = Object.keys(LAST);
      const l = pick(rng, letters);
      const w = pick(rng, LAST[l]);
      return {
        ask: `What does ${w} end with?`,
        say: `${w}. What sound does ${w} end with?`,
        pic: PIC[w],
        options: letterOpts(l, letters, n, rng),
        answer: l,
        explain: `${w} ends with ${l}.`,
        hint: `Say it slowly and listen to the end: ${w}.`,
      };
    },
  },
  'k-rhyme': {
    code: 'NC.K.RF.2a',
    name: 'Rhyming words',
    gen(t, rng, n) {
      const group = pick(rng, RHYMES.filter((g) => g.length >= 2));
      const [target, answer] = shuffle(group, rng);
      const others = RHYMES.filter((g) => g !== group).flat();
      return {
        ask: `What rhymes with ${target}?`,
        say: `${target}. Which one rhymes with ${target}?`,
        pic: PIC[target],
        options: picOpts(answer, others, n, rng),
        answer,
        explain: `${target}, ${answer}. They rhyme!`,
        hint: 'Rhyming words sound the same at the end.',
      };
    },
  },
  'k-syllables': {
    code: 'NC.K.RF.2b',
    name: 'Clap the syllables',
    gen(t, rng) {
      const words = Object.keys(SYLLABLES).filter((w) => SYLLABLES[w].length <= [2, 3, 4][t]);
      const w = pick(rng, words);
      const k = SYLLABLES[w].length;
      return {
        ask: `Clap it: ${w}. How many claps?`,
        say: `Let's clap. ${w}. How many claps?`,
        pic: PIC[w],
        options: [1, 2, 3, 4].slice(0, t === 2 ? 4 : 3).map((v) => ({ value: v, label: String(v), say: String(v) })),
        answer: k,
        parts: SYLLABLES[w],
        explain: `${SYLLABLES[w].join(', ')}. ${k} ${k === 1 ? 'clap' : 'claps'}!`,
        hint: 'Put your hand under your chin. Each time your chin drops is one clap.',
      };
    },
  },
  'k-read-cvc': {
    code: 'NC.K.RF.3b',
    name: 'Read short words (CVC)',
    gen(t, rng, n) {
      const w = pick(rng, SHORT3);
      // look-alike distractors share letters with the word
      const others = shuffle(SHORT3.filter((x) => x !== w), rng).sort((a, b) => [...b].filter((c, i) => w[i] === c).length - [...a].filter((c, i) => w[i] === c).length);
      return {
        ask: 'Read the word. Which picture is it?',
        tiles: [...w],
        options: picOpts(w, t ? others.slice(0, 4) : others.slice(6), n, rng),
        answer: w,
        explain: `${[...w].join(', ')}. ${w}!`,
        hint: 'Tap each letter to hear its sound, then say them fast.',
      };
    },
  },
  'k-middle-vowel': {
    code: 'NC.K.RF.3b',
    name: 'Short vowels in the middle',
    gen(t, rng, n) {
      const vowels = t === 0 ? ['a', 'o', 'u'] : Object.keys(CVC);
      const v = pick(rng, vowels);
      const w = pick(rng, CVC[v].filter((x) => x.length === 3));
      return {
        ask: 'Which vowel is missing?',
        say: `${w}. Which vowel is in the middle of ${w}?`,
        pic: PIC[w],
        word: { text: w, gap: [1, 2] },
        options: letterOpts(v, vowels, Math.min(n, vowels.length), rng),
        answer: v,
        explain: `${w}: ${soundOf(v)}.`,
        hint: `Say it slowly: ${w}. Listen to the middle.`,
      };
    },
  },
  'k-sight': {
    code: 'NC.K.RF.3c',
    name: 'Sight words',
    gen(t, rng, n) {
      const pool = SIGHT_K.slice(0, [10, 15, 20][t]);
      const w = pick(rng, pool);
      return { ask: `Find the word "${w}".`, say: `Find the word ${w}.`, options: textOpts(w, pool, n, rng), answer: w, explain: `${w}. You know it by sight!` };
    },
  },

  // ======================= Grade 1 =======================
  'g1-short-vowels': {
    code: 'NC.1.RF.3b',
    name: 'Short vowels a e i o u',
    gen(t, rng, n) {
      const v = pick(rng, Object.keys(CVC));
      const w = pick(rng, CVC[v]);
      const at = [...w].findIndex((c) => 'aeiou'.includes(c));
      return {
        ask: 'Which vowel is missing?',
        say: `${w}. Which vowel is missing?`,
        pic: PIC[w],
        word: { text: w, gap: [at, at + 1] },
        options: letterOpts(v, ['a', 'e', 'i', 'o', 'u'], n, rng),
        answer: v,
        explain: `${w}: short ${v}.`,
        hint: `Say it slowly: ${w}.`,
      };
    },
  },
  'g1-digraphs': {
    code: 'NC.1.RF.3a',
    name: 'Digraphs: sh, ch, wh, ck',
    gen(t, rng, n) {
      return patternQuestion(DIGRAPHS, rng, n, { ask: 'Which two letters are missing?', explainWord: (p, w) => `${p} in ${w}! Two letters, one sound.` });
    },
  },
  'g1-blends': {
    code: 'NC.1.RF.2b',
    name: 'Blends: fr, st, tr, pl …',
    gen(t, rng, n) {
      return patternQuestion(BLENDS, rng, n, { ask: 'Which blend starts the word?', explainWord: (p, w) => `${p} in ${w}. You can hear both letters.` });
    },
  },
  'g1-magic-e': {
    code: 'NC.1.RF.3c',
    name: 'Magic e (kite, cake, bone)',
    gen(t, rng, n) {
      const w = pick(rng, MAGIC_E);
      const noE = w.slice(0, -1);
      const v = [...noE].reverse().find((c) => 'aeiou'.includes(c));
      // a made-up spelling with the wrong vowel (kute, cuke), never a real word or a name
      const swap = noE.replace(v, 'u') + 'e';
      return {
        ask: 'Which word matches the picture?',
        say: 'Which word matches the picture?',
        pic: PIC[w],
        options: textOpts(w, [noE, swap], Math.min(n, 3), rng),
        answer: w,
        explain: `${w}. The magic e makes the ${v} say its name!`,
        hint: 'A magic e at the end makes the vowel say its name.',
      };
    },
  },
  'g1-vowel-teams': {
    code: 'NC.1.RF.3c',
    name: 'Vowel teams: ee, ea, ai, oa, oo',
    gen(t, rng, n) {
      const groups = t === 0 ? { ee: TEAMS.ee, ai: TEAMS.ai, oa: TEAMS.oa } : TEAMS;
      return patternQuestion(groups, rng, n, { ask: 'Which vowel team is missing?', explainWord: (p, w) => `${p} in ${w}. When two vowels go walking, the first one does the talking!` });
    },
  },
  'g1-bossy-r': {
    code: 'NC.1.RF.3',
    name: 'Bossy r: ar, or, ir',
    gen(t, rng, n) {
      return patternQuestion(BOSSY_R, rng, n, { ask: 'Which letters are missing?', explainWord: (p, w) => `${p} in ${w}. The r is bossy and changes the vowel's sound!` });
    },
  },
  'g1-syllables': {
    code: 'NC.1.RF.3d',
    name: 'Syllables in longer words',
    gen(t, rng) {
      const w = pick(rng, Object.keys(SYLLABLES).filter((x) => SYLLABLES[x].length >= (t ? 2 : 1)));
      const k = SYLLABLES[w].length;
      return {
        ask: `How many syllables in ${w}?`,
        say: `${w}. How many syllables?`,
        pic: PIC[w],
        options: [1, 2, 3, 4].map((v) => ({ value: v, label: String(v), say: String(v) })),
        answer: k,
        parts: SYLLABLES[w],
        explain: `${SYLLABLES[w].join(' - ')}. ${k} syllables!`,
        hint: 'Every syllable has a vowel sound. Clap as you say it.',
      };
    },
  },
  'g1-endings': {
    code: 'NC.1.RF.3f',
    name: 'Endings: -s and -es',
    gen(t, rng, n) {
      const [one, many] = pick(rng, PLURALS);
      const wrong = many.endsWith('es') ? one + 's' : one + 'es';
      return {
        ask: 'Which word matches the picture?',
        pic: `many:${PIC[one]}`,
        options: textOpts(many, [one, wrong], Math.min(n, 3), rng),
        answer: many,
        explain: `Lots of them: ${many}! ${many.endsWith('es') ? 'Words ending in x or s add -es.' : 'Add -s for more than one.'}`,
        hint: 'There is more than one. What do we add?',
      };
    },
  },
  'g1-read-words': {
    code: 'NC.1.RF.3b',
    name: 'Read words with blends and digraphs',
    gen(t, rng, n) {
      const pool = [...new Set([...Object.values(BLENDS), ...Object.values(DIGRAPHS), ...Object.values(TEAMS)].flat())];
      const w = pick(rng, pool);
      const others = shuffle(pool.filter((x) => x !== w), rng).sort((a, b) => (b[0] === w[0]) - (a[0] === w[0]));
      return {
        ask: 'Read the word. Which picture is it?',
        tiles: [...w],
        options: picOpts(w, others.slice(0, t ? 3 : 8), n, rng),
        answer: w,
        explain: `${w}!`,
        hint: 'Look for letter teams like sh, tr or ee.',
      };
    },
  },
  'g1-sight': {
    code: 'NC.1.RF.3g',
    name: 'Tricky sight words',
    gen(t, rng, n) {
      const pool = SIGHT_1.slice(0, [10, 18, 24][t]);
      const w = pick(rng, pool);
      return { ask: `Find the word "${w}".`, say: `Find the word ${w}.`, options: textOpts(w, pool, n, rng), answer: w, explain: `${w}. A tricky word to know by heart!` };
    },
  },
};

export const PHONICS_IDS = Object.keys(PHONICS);

export function phonicsName(id) {
  return PHONICS[id] ? `${PHONICS[id].name} (${PHONICS[id].code})` : id;
}

export function makePhonics(skillId, { tier = 0, n = 3, rng = Math.random } = {}) {
  const skill = PHONICS[skillId];
  if (!skill) throw new Error(`unknown phonics skill "${skillId}"`);
  const t = Math.max(0, Math.min(2, tier | 0));
  return { skill: skillId, tier: t, ...skill.gen(t, rng, Math.max(2, Math.min(4, n))) };
}
