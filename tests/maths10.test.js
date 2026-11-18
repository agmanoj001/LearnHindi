// Section 10 of docs/ROADMAP.md: maths to add (10.4 onwards).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SKILLS, makeProblem } from '../js/mathgen.js';
import { mathModel } from '../js/art-math.js';
import { ACTIVITIES, ACTIVITY_SKILL } from '../js/games/handson.js';
import { validateContent } from '../js/validate.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const lessons = content.worlds.flatMap((w) => w.units.flatMap((u) => u.lessons.map((l) => ({ ...l, world: w, unit: u }))));
const lesson = (id) => lessons.find((l) => l.id === id);

// ---- 10.4 the gaps in Kindergarten and Grade 1 ----

test('10.4: each new skill is a lesson in the right unit and comes back in the review', () => {
  const where = {
    'k-countback': 'km-count',
    'k-pattern': 'km-count',
    'k-ordinal': 'km-numbers',
    'k-bond10': 'km-ten',
    'g1-countback': 'g1m-count',
    'g1-skip': 'g1m-count',
    'g1-doubles': 'g1m-facts',
    'g1-bond20': 'g1m-facts',
    'g1-fluency': 'g1m-facts',
  };
  for (const [skill, unit] of Object.entries(where)) {
    assert.ok(SKILLS[skill], skill);
    assert.ok(
      lessons.some((l) => l.unit.id === unit && l.game === 'math' && l.config.skills.length === 1 && l.config.skills[0] === skill),
      `${skill} has its own lesson in ${unit}`,
    );
  }
  const review = lessons.filter((l) => /party|challenge/.test(l.unit.id)).flatMap((l) => l.config.skills);
  for (const s of ['k-countback', 'k-bond10', 'k-ordinal', 'g1-doubles', 'g1-skip', 'g1-bond20', 'g1-countback']) assert.ok(review.includes(s), `${s} is in the review`);
  // a unit with a hands-on lesson still ends with one
  for (const w of content.worlds.filter((x) => x.subject === 'math'))
    for (const u of w.units) {
      const hands = u.lessons.findIndex((l) => l.game === 'handson');
      if (hands >= 0) assert.equal(u.lessons.at(-1).game, 'handson', u.id);
    }
  assert.deepEqual(validateContent(content).errors, []);
});

test('10.4: counting back goes down by one, and the gap is the number before', () => {
  const rng = seeded(3);
  for (const id of ['k-countback', 'g1-countback'])
    for (const tier of [0, 1, 2])
      for (let i = 0; i < 40; i++) {
        const p = makeProblem(id, { tier, n: 3, rng });
        const items = p.model.items;
        const gap = items.indexOf(null);
        const known = items.map((v, k) => (v === null ? null : [k, v])).filter(Boolean);
        const [k0, v0] = known[0];
        for (const [k, v] of known) assert.equal(v, v0 - (k - k0), `${id}: ${items}`);
        assert.equal(p.answer, v0 - (gap - k0));
        assert.ok(p.answer >= 0);
        if (id === 'k-countback') assert.ok(items.every((v) => v === null || v <= 10));
      }
  // Grade 1's top level crosses a ten going down
  for (let i = 0; i < 30; i++) {
    const p = makeProblem('g1-countback', { tier: 2, n: 3, rng });
    const all = p.model.items.map((v) => v ?? p.answer);
    assert.ok(all.some((v) => v % 10 === 0) && all.some((v) => v % 10 === 9), String(all));
  }
});

test('10.4: first, second, third: the answer is in that place from the flag', () => {
  const rng = seeded(5);
  const ORD = ['first', 'second', 'third', 'fourth', 'fifth'];
  for (const tier of [0, 1, 2])
    for (let i = 0; i < 40; i++) {
      const p = makeProblem('k-ordinal', { tier, n: 3, rng });
      const pics = p.model.pics;
      assert.equal(pics.length, tier === 0 ? 3 : 5);
      if (ORD.includes(p.answer)) assert.ok(p.ask.includes(pics[ORD.indexOf(p.answer)]));
      else assert.equal(pics.indexOf(p.answer), ORD.indexOf(p.ask.match(/is (\w+)\?/)[1]));
    }
  assert.match(mathModel({ kind: 'queue', pics: ['duck', 'cat', 'penguin'] }), /mm-flag[\s\S]*mm-racer/);
});

test('10.4: number bonds: the parts make the whole, and the gap is drawn as a ?', () => {
  const rng = seeded(11);
  for (const [id, top] of [
    ['k-bond10', 10],
    ['g1-bond20', 20],
  ])
    for (const tier of [0, 1, 2])
      for (let i = 0; i < 40; i++) {
        const p = makeProblem(id, { tier, n: 3, rng });
        const { whole, parts } = p.model;
        const [a, b] = parts;
        if (whole === null) assert.equal(p.answer, a + b);
        else assert.equal(a + p.answer, whole);
        assert.ok((whole ?? a + b) <= top);
        assert.match(mathModel(p.model), /mm-bond-gap/);
      }
});

test('10.4: skip counting, doubles and near doubles, and facts with no picture', () => {
  const rng = seeded(13);
  for (let i = 0; i < 60; i++) {
    const s = makeProblem('g1-skip', { tier: 2, n: 3, rng });
    const known = s.model.items.filter((v) => v !== null);
    const step = known[1] - known[0] || known[2] - known[1];
    assert.ok([2, 5, 10, 4, 15, 20, 30].includes(Math.abs(step)), String(s.model.items));
    assert.equal(s.answer % ([2, 5, 10].find((k) => s.ask.includes(`by ${k}s`)) || 1), 0);
    const d = makeProblem('g1-doubles', { tier: 2, n: 3, rng });
    const [x, y] = d.eq.split(' = ')[0].split(' + ').map(Number);
    assert.ok(y === x || y === x + 1);
    assert.equal(d.answer, x + y);
    const f = makeProblem('g1-fluency', { tier: 1, n: 3, rng });
    assert.equal(f.model, null);
    assert.ok(f.answer >= 0 && f.answer <= 10);
  }
  // the facts-practice lessons bring a missed fact back
  for (const id of ['km-add-facts', 'g1m-facts-fluency']) assert.equal(lesson(id).config.retry, true, id);
  assert.match(read('js/games/math.js'), /ctx\.config\.retry && !right\.firstTry/);
});

test('10.4: the number-bond bubbles make 10 in Kindergarten and 20 in Grade 1', () => {
  assert.ok(ACTIVITIES.includes('bonds'));
  assert.equal(ACTIVITY_SKILL.bonds, 'k-bond10');
  assert.equal(lesson('km-ten-bubbles').config.target, 10);
  assert.equal(lesson('g1m-facts-bubbles').config.target, 20);
  assert.equal(lesson('g1m-facts-bubbles').config.skill, 'g1-bond20');
  const bad = structuredClone(content);
  bad.worlds.flatMap((w) => w.units).flatMap((u) => u.lessons).find((l) => l.id === 'km-ten-bubbles').config.target = 12;
  assert.ok(validateContent(bad).errors.some((e) => e.includes('target must be 10 or 20')));
});

// ---- 10.5 the Grade 2 maths world ----
import { numberWords } from '../js/mathgen.js';
import { MASCOT_IDS } from '../js/mascot.js';
import { THEMES } from '../js/art-scenes.js';

test('10.5: Gilu\'s Number Bazaar: a Grade 2 maths world of about 24 lessons, with its own guide, scene and prizes', () => {
  const w = content.worlds.find((x) => x.id === 'bazaar');
  assert.equal(w.level, 'grade2');
  assert.equal(w.subject, 'math');
  assert.equal(w.lang, 'en');
  assert.ok(MASCOT_IDS.includes(w.mascot) && THEMES.includes(w.theme));
  assert.ok(content.collections[w.collection].items.every((id) => content.words[id]));
  const ls = w.units.flatMap((u) => u.lessons);
  assert.ok(ls.length >= 24, `${ls.length} lessons`);
  const skills = new Set(ls.flatMap((l) => (l.game === 'math' ? l.config.skills : [l.config.skill])));
  const g2 = Object.keys(SKILLS).filter((s) => s.startsWith('g2-'));
  assert.ok(g2.length >= 19);
  for (const s of g2) assert.ok(skills.has(s), `${s} is taught`);
  // the standards the roadmap names
  const codes = new Set(g2.map((s) => SKILLS[s].code));
  for (const c of ['NC.2.NBT.1', 'NC.2.NBT.5', 'NC.2.NBT.7', 'NC.2.OA.3', 'NC.2.OA.4', 'NC.2.MD.7', 'NC.2.MD.1', 'NC.2.MD.8', 'NC.2.G.3', 'NC.2.MD.10']) assert.ok(codes.has(c), c);
  // four hands-on games, each recording a Grade 2 skill
  const hands = ls.filter((l) => l.game === 'handson');
  assert.deepEqual(hands.map((l) => l.config.activity).sort(), ['array', 'clock', 'jumps', 'shop']);
  assert.ok(hands.every((l) => l.config.skill.startsWith('g2-')));
  assert.equal(hands.find((l) => l.config.activity === 'clock').config.minutes, 5);
  assert.equal(hands.find((l) => l.config.activity === 'shop').config.dollars, true);
});

test('10.5: place value with a zero, the slips as wrong answers, and numbers in words', () => {
  assert.equal(numberWords(406), 'four hundred six');
  assert.equal(numberWords(342), 'three hundred forty-two');
  assert.equal(numberWords(1729), 'one thousand seven hundred twenty-nine');
  const rng = seeded(17);
  let zero = 0;
  for (let i = 0; i < 60; i++) {
    const p = makeProblem('g2-place', { tier: 2, n: 4, rng });
    if (/^\d00 \+ \d = \?$/.test(p.eq)) {
      zero++;
      // 400 + 6: 46 is among the wrong answers
      const [h, o] = p.eq.match(/\d+/g).map(Number);
      assert.ok(p.options.some((x) => x.value === (h / 100) * 10 + o), p.eq);
    }
    const s = makeProblem('g2-sub100', { tier: 1, n: 4, rng });
    const [a, b] = s.eq.match(/\d+/g).map(Number);
    assert.equal(s.answer, a - b);
    assert.ok(a % 10 < b % 10, 'tier 1 always breaks a ten');
  }
  assert.ok(zero > 10);
  // base-ten pictures with hundreds, money with a dollar bill, a ruler, arrays, grids and bar graphs draw
  assert.match(mathModel({ kind: 'base10', hundreds: 2, tens: 3, ones: 4 }), /mm-flat/);
  assert.match(mathModel({ kind: 'money', items: ['dollar', 'quarter', 'dime'] }), /mm-bill[\s\S]*25¢/);
  assert.match(mathModel({ kind: 'ruler', unit: 'cm', len: 6, start: 2, thing: 'pencil' }), /cm/);
  assert.equal((mathModel({ kind: 'array', rows: 3, cols: 4, pic: 'apple' }).match(/mm-cell/g) || []).length, 12);
  assert.match(mathModel({ kind: 'grid', rows: 2, cols: 3 }), /mm-grid/);
  assert.match(mathModel({ kind: 'bars', rows: [{ pic: 'apple', n: 3 }], max: 6 }), /mm-barfill/);
  assert.match(mathModel({ kind: 'parts', shape: 'circle', parts: 3, equal: true, shade: 1 }), /mm-parts/);
});

// ---- 10.6 days, months, time and money in Hindi ----
import { DAYS, MONTHS, SEASONS, SEASON_QS, RITU, timeHi, samayLines, RUPEES, rupeeLabel, MONEY_LEVELS, SAMAY_MODES, SAMAY_SKILLS, MARKET } from '../js/samay.js';
import { textKey } from '../js/logic.js';
import { existsSync } from 'node:fs';

test('10.6: the time the Hindi way: सवा, साढ़े, पौने, डेढ़ and ढाई', () => {
  assert.equal(timeHi(1, 0), 'एक बजा है');
  assert.equal(timeHi(3, 0), 'तीन बजे हैं');
  assert.equal(timeHi(3, 15), 'सवा तीन बजे हैं');
  assert.equal(timeHi(3, 30), 'साढ़े तीन बजे हैं');
  assert.equal(timeHi(1, 30), 'डेढ़ बजे हैं');
  assert.equal(timeHi(2, 30), 'ढाई बजे हैं');
  assert.equal(timeHi(3, 45), 'पौने चार बजे हैं');
  assert.equal(timeHi(12, 45), 'पौने एक बजे हैं');
  assert.equal(DAYS.length, 7);
  assert.equal(MONTHS.length, 12);
  assert.equal(RITU.length, 6);
  for (const [, , id] of SEASON_QS) assert.ok(SEASONS.some((s) => s.id === id));
  for (const s of SEASONS) assert.ok(content.words[s.pic], s.pic);
  for (const id of MARKET) assert.ok(content.words[id], id);
});

test('10.6: rupees and paise: labels, levels and drawings', () => {
  assert.equal(rupeeLabel(1500), '₹15');
  assert.equal(rupeeLabel(1250), '₹12.50');
  assert.equal(rupeeLabel(50), '50 पैसे');
  for (const lv of MONEY_LEVELS) for (const k of lv.kinds) assert.ok(RUPEES[k], k);
  assert.ok(MONEY_LEVELS[2].kinds.includes('c50'), 'paise at the top level');
  for (const k of Object.keys(RUPEES)) assert.match(mathModel({ kind: 'rupee', id: k }), RUPEES[k].note ? /mm-note/ : /mm-rupee/, k);
});

test('10.6: lessons from Kindergarten to Grade 3, every sentence recorded, the skills named for grown-ups', () => {
  const samay = lessons.filter((l) => l.game === 'samay');
  const levels = new Set(samay.map((l) => l.world.level));
  for (const lv of ['kg', 'grade1', 'grade2', 'grade3']) assert.ok(levels.has(lv), lv);
  assert.ok(samay.every((l) => l.world.subject === 'hindi'));
  const modes = new Set(samay.flatMap((l) => l.config.modes));
  for (const m of Object.keys(SAMAY_MODES)) assert.ok(modes.has(m), `${m} is played`);
  for (const s of new Set(Object.values(SAMAY_MODES))) assert.ok(SAMAY_SKILLS[s], s);
  // every fixed sentence has a recording in the voice pack
  const index = JSON.parse(read('voices/index.json'));
  const files = new Set(Object.keys(index.files || {}));
  const missing = samayLines().filter((t) => !files.has(textKey('hi', t)) && !existsSync(new URL(`../voices/${textKey('hi', t)}.mp3`, import.meta.url)));
  assert.deepEqual(missing, [], 'run tools/make-voices.mjs');
  assert.match(read('js/parent.js'), /SAMAY_SKILLS\[id\]/);
  assert.match(read('sw.js'), /'js\/games\/samay\.js'/);
  const bad = structuredClone(content);
  bad.worlds.flatMap((w) => w.units).flatMap((u) => u.lessons).find((l) => l.game === 'samay').config.modes = ['weather'];
  assert.ok(validateContent(bad).errors.some((e) => e.includes('kinds of round')));
});

// ---- 10.7 पहाड़े ----
import { MULT, TABLES, chantLine, askLine, pahadaLines, pahadaName } from '../js/pahade.js';

test('10.7: पहाड़े chanted the Hindi way, 2 to 10, with every line recorded', () => {
  const word = (n) => content.numbers[n - 1].hi;
  assert.deepEqual(TABLES, [2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(MULT.length, 10);
  assert.equal(chantLine(2, 1, word), 'दो एकम दो');
  assert.equal(chantLine(2, 2, word), 'दो दूनी चार');
  assert.equal(chantLine(2, 3, word), 'दो तिया छह');
  assert.equal(chantLine(7, 7, word), 'सात सत्ते उनचास');
  assert.equal(chantLine(10, 10, word), 'दस दहाई सौ');
  assert.equal(askLine(2, 6, word), 'दो छक्के?');
  assert.equal(pahadaName('pahada-7'), '7 का पहाड़ा · the 7 times table');
  // every table is a lesson (or in a mixed race), in Grades 2–4
  const ph = lessons.filter((l) => l.game === 'pahade');
  for (const t of TABLES) assert.ok(ph.some((l) => l.config.table === t), `the ${t} table has its own lesson`);
  assert.deepEqual([...new Set(ph.map((l) => l.world.level))].sort(), ['grade2', 'grade3', 'grade4']);
  const index = JSON.parse(read('voices/index.json'));
  const missing = pahadaLines(word).filter((t) => !index.files[textKey('hi', t)]);
  assert.deepEqual(missing, [], 'run tools/make-voices.mjs');
  // the beat, and the game's call and response
  assert.match(read('js/sfx.js'), /dhol: on\(/);
  const game = read('js/games/pahade.js');
  assert.match(game, /classList\.add\('echo'\)/);
  assert.match(game, /ctx\.sfx\.dhol\?\.\(beat % 4 === 0\)/);
  const bad = structuredClone(content);
  bad.worlds.flatMap((w) => w.units).flatMap((u) => u.lessons).find((l) => l.game === 'pahade').config.table = 13;
  assert.ok(validateContent(bad).errors.some((e) => e.includes('"table"')));
});

// ---- 10.8 the Grade 3 and Grade 4 maths worlds ----
import { commas, indian } from '../js/mathgen.js';

test('10.8: Robu\'s Number Factory (Grade 3) and Jugnu\'s Number Observatory (Grade 4), each teaching all its skills', () => {
  for (const [id, level, prefix, codes] of [
    ['factory', 'grade3', 'g3-', ['NC.3.OA.1', 'NC.3.OA.7', 'NC.3.OA.2', 'NC.3.NF.2', 'NC.3.MD.7', 'NC.3.MD.8', 'NC.3.MD.1', 'NC.3.NBT.1']],
    ['jantar', 'grade4', 'g4-', ['NC.4.NBT.5', 'NC.4.NBT.6', 'NC.4.NF.1', 'NC.4.NF.6', 'NC.4.MD.6', 'NC.4.OA.4']],
  ]) {
    const w = content.worlds.find((x) => x.id === id);
    assert.equal(w.level, level);
    assert.equal(w.subject, 'math');
    assert.ok(MASCOT_IDS.includes(w.mascot) && THEMES.includes(w.theme));
    assert.ok(content.collections[w.collection].items.every((x) => content.words[x]));
    const ls = w.units.flatMap((u) => u.lessons);
    assert.ok(ls.length >= 22, `${id}: ${ls.length} lessons`);
    const used = new Set(ls.flatMap((l) => (l.game === 'math' ? l.config.skills : [l.config.skill])));
    const own = Object.keys(SKILLS).filter((s) => s.startsWith(prefix));
    assert.ok(own.length >= 20);
    for (const s of own) assert.ok(used.has(s), `${s} is taught`);
    const have = new Set(own.map((s) => SKILLS[s].code));
    for (const c of codes) assert.ok(have.has(c), c);
  }
  assert.ok(SKILLS['g4-lakh'], 'lakh and crore');
  const hands = lessons.filter((l) => l.game === 'handson' && ['grade3', 'grade4'].includes(l.world.level)).map((l) => l.config.activity);
  for (const a of ['array', 'fraction', 'angle']) assert.ok(hands.includes(a), a);
});

test('10.8: big numbers the international and the Indian way, and the new pictures', () => {
  assert.equal(commas(345678), '345,678');
  assert.equal(indian(345678), '3,45,678');
  assert.equal(indian(10000000), '1,00,00,000');
  assert.equal(indian(999), '999');
  const rng = seeded(23);
  for (let i = 0; i < 40; i++) {
    const p = makeProblem('g4-divide', { tier: 2, n: 4, rng });
    const [dividend, d] = p.eq.match(/\d+/g).map(Number);
    const [q, r = 0] = p.answer.split(' R ').map(Number);
    assert.equal(q * d + r, dividend, p.eq);
    assert.ok(r < d);
    const f = makeProblem('g3-fracline', { tier: 1, n: 4, rng });
    const [k, b] = f.answer.split('/').map(Number);
    assert.equal(f.model.at, k);
    assert.equal(f.model.den, b);
  }
  for (const m of [
    { kind: 'frac', shape: 'circle', parts: 6, shade: 2 },
    { kind: 'frac', shape: 'bar', parts: 8, shade: 3 },
    { kind: 'fracline', den: 4, at: 3, to: 1 },
    { kind: 'rect', w: 6, h: 4, unit: 'cm' },
    { kind: 'poly', sides: [3, null, 5], unit: 'cm' },
    { kind: 'beaker', max: 10, v: 6 },
    { kind: 'longdiv', dividend: 1655, divisor: 2 },
    { kind: 'angle', deg: 120, protractor: true },
    { kind: 'angle', deg: 90, split: 35 },
    { kind: 'lines', type: 'perpendicular' },
    { kind: 'areamodel', a: 23, b: 14 },
    { kind: 'shape', shape: 'square', line: 45 },
  ])
    assert.doesNotMatch(mathModel(m), /undefined|NaN|class="mm">/, m.kind);
});

// ---- 10.9 maths stories and puzzles ----
test('10.9: maths stories for Grades 3–4 and maths comics for Grades 7–8, each reachable and complete', () => {
  const stories = ['birbal-biggest', 'tenali-jars', 'chess-rice', 'seventeen-camels', 'aryabhata-zero'].map((id) => content.stories.find((s) => s.id === id));
  for (const s of stories) {
    assert.ok(s, 'story');
    assert.ok(['grade3', 'grade4'].includes(s.level));
    assert.ok(s.pages.length >= 6 && s.questions.length === 3 && s.moral?.hi);
    assert.deepEqual(s.talk.map((x) => x.type).sort(), ['complete', 'open', 'recall', 'why', 'you']);
    for (const p of s.pages) assert.ok(content.words[p.word], `${s.id}: ${p.word}`);
    assert.ok(lessons.some((l) => l.game === 'story' && l.config.story === s.id), `${s.id} has a lesson`);
  }
  assert.ok(content.words.chessboard, 'a chessboard picture for the rice story');
  // the arithmetic in the stories is right
  assert.equal(2 ** 7, 128);
  assert.ok(2 ** 20 > 1000000 && 2 ** 19 < 1000000, 'the 21st square is the first above a million');
  assert.equal(18 / 2 + 18 / 3 + 18 / 9, 17);
  assert.equal(3 + 0.5 + 0 * 3, 2 + 1.5 + 0);
  const comics = ['mu-1729', 'r-shakuntala', 'b-crows', 'd-lock', 'd-coins'].map((id) => content.comics.find((c) => c.id === id));
  for (const cm of comics) {
    assert.ok(cm.guess && cm.guess.options.includes(cm.guess.answer), `${cm.id} stops for a guess`);
    assert.ok(lessons.some((l) => l.game === 'comic' && l.config.comic === cm.id), `${cm.id} has a lesson`);
  }
  assert.equal(1 ** 3 + 12 ** 3, 1729);
  assert.equal(9 ** 3 + 10 ** 3, 1729);
  assert.equal(34 * 11, 374);
  assert.equal(8000 * 12, 96000);
  // the lock: the first digit twice the second, the third one more than the second, all three make 13
  assert.ok(6 === 2 * 3 && 4 === 3 + 1 && 6 + 3 + 4 === 13);
});

// ---- 10.10 more maths in Show time ----
test('10.10: Pip\'s snowy numbers: an episode for each Kindergarten maths unit, chained by questions', () => {
  const sr = content.showSeries.find((s) => s.id === 'pip');
  assert.equal(sr.guide, 'pip');
  const eps = content.shows.filter((s) => s.series === 'pip').sort((a, b) => a.ep - b.ep);
  assert.equal(eps.length, 8);
  const igloo = content.worlds.find((w) => w.id === 'igloo');
  const units = igloo.units.map((u) => u.id);
  // every unit of the Kindergarten maths world has its episode, and each leads to a lesson in that unit
  for (const u of units) assert.ok(eps.some((s) => s.lesson.startsWith(`${u}-`)), `${u} has an episode`);
  for (const s of eps) {
    assert.equal(s.level, 'kg');
    assert.equal(s.world, 'igloo');
    assert.ok(lessons.some((l) => l.id === s.lesson && l.world.id === 'igloo'), s.lesson);
    // questions as the story goes
    assert.ok(s.scenes.flatMap((sc) => sc.beats).filter((b) => b.ask).length >= 2, `${s.id} asks`);
  }
  // each but the last ends on a question the next one answers
  assert.equal(eps.filter((s) => s.next).length, 7);
  assert.equal(eps.filter((s) => s.answer).length, 7);
  assert.ok(!eps[0].answer && !eps.at(-1).next);
});
