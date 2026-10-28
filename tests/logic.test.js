import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../js/logic.js';

const rng = () => L.makeRng(42);

test('makeRng is deterministic', () => {
  const a = L.makeRng(7);
  const b = L.makeRng(7);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});

test('shuffle keeps every item', () => {
  const arr = [1, 2, 3, 4, 5, 6];
  const out = L.shuffle(arr, rng());
  assert.deepEqual([...out].sort(), arr);
  assert.deepEqual(arr, [1, 2, 3, 4, 5, 6], 'input not mutated');
});

test('pickChoices includes the answer once and has distinct options', () => {
  const pool = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id }));
  for (let seed = 1; seed < 50; seed++) {
    const r = L.makeRng(seed);
    const out = L.pickChoices(pool, pool[2], 3, r);
    assert.equal(out.length, 3);
    assert.equal(out.filter((x) => x.id === 'c').length, 1);
    assert.equal(new Set(out.map((x) => x.id)).size, 3);
  }
});

test('pickChoices copes with a pool smaller than the count', () => {
  const out = L.pickChoices([{ id: 'a' }, { id: 'b' }], { id: 'a' }, 4, rng());
  assert.equal(out.length, 2);
});

test('roundSequence never repeats an item twice in a row', () => {
  const pool = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  for (let seed = 1; seed < 30; seed++) {
    const seq = L.roundSequence(pool, 12, L.makeRng(seed));
    assert.equal(seq.length, 12);
    for (let i = 1; i < seq.length; i++) assert.notEqual(seq[i].id, seq[i - 1].id);
  }
  assert.equal(L.roundSequence([{ id: 'x' }], 3, rng()).length, 3, 'single-item pool still works');
  assert.deepEqual(L.roundSequence([], 3, rng()), []);
});

test('langsFor and langForRound', () => {
  assert.deepEqual(L.langsFor('hi'), ['hi']);
  assert.deepEqual(L.langsFor('en'), ['en']);
  assert.deepEqual(L.langsFor('both'), ['hi', 'en']);
  assert.equal(L.langForRound('both', 0), 'hi');
  assert.equal(L.langForRound('both', 1), 'en');
  assert.equal(L.langForRound('en', 3), 'en');
});

test('splitTemplate finds the word slot', () => {
  assert.deepEqual(L.splitTemplate('Find {w}'), ['Find ', { word: true }]);
  assert.deepEqual(L.splitTemplate('{w} ढूँढो'), [{ word: true }, ' ढूँढो']);
  assert.deepEqual(L.splitTemplate('Yay!'), ['Yay!']);
  assert.equal(L.fillTemplate('Find {w}', 'bus'), 'Find bus');
});

test('splitTiles uses syllables for Hindi and letters for English', () => {
  const car = { hi: 'कार', en: 'car', syllables: ['का', 'र'] };
  assert.deepEqual(L.splitTiles(car, 'hi'), ['का', 'र']);
  assert.deepEqual(L.splitTiles(car, 'en'), ['C', 'A', 'R']);
  assert.deepEqual(L.splitTiles({ hi: 'बस', en: 'bus' }, 'hi'), ['ब', 'स']);
  assert.deepEqual(L.splitTiles({ hi: 'x', en: 'dump truck' }, 'en'), ['D', 'U', 'M', 'P', 'T', 'R', 'U', 'C', 'K']);
});

test('graphemes keeps vowel signs with their consonant', () => {
  assert.deepEqual(L.graphemes('कार'), ['का', 'र']);
});

test('crane build accepts only the next tile and never fails', () => {
  let s = L.createBuild(['B', 'U', 'S']);
  let r = L.placeTile(s, 'S');
  assert.equal(r.ok, false);
  assert.equal(r.state, s, 'wrong tile leaves state unchanged');
  for (const t of ['B', 'U', 'S']) {
    r = L.placeTile(s, t);
    assert.ok(r.ok);
    s = r.state;
  }
  assert.ok(s.done);
  assert.equal(L.placeTile(s, 'B').ok, false);
});

test('tileChoices contains every tile plus distractors not in the word', () => {
  const out = L.tileChoices(['B', 'U', 'S'], ['A', 'B', 'C', 'D', 'S'], 2, rng());
  assert.equal(out.length, 5);
  for (const t of ['B', 'U', 'S']) assert.ok(out.includes(t));
  assert.equal(out.filter((t) => t === 'B').length, 1, 'no duplicate of a word tile as a distractor');
});

test('count trips stay between 1 and max', () => {
  for (let seed = 1; seed < 40; seed++) {
    const r = L.makeRng(seed);
    let n = 0;
    for (let i = 0; i < 20; i++) {
      const trip = L.makeCountTrip(n, 10, r);
      assert.ok(trip.amount >= 1 && trip.amount <= 3);
      assert.ok(trip.result >= 1 && trip.result <= 10, `result ${trip.result}`);
      assert.equal(trip.result, trip.op === 'on' ? n + trip.amount : n - trip.amount);
      n = trip.result;
    }
  }
  assert.equal(L.makeCountTrip(0, 10, rng()).op, 'on');
  assert.equal(L.makeCountTrip(10, 10, rng()).op, 'off');
});

test('numberChoices', () => {
  for (let a = 1; a <= 10; a++) {
    const c = L.numberChoices(a, 10, 3, L.makeRng(a));
    assert.equal(c.length, 3);
    assert.ok(c.includes(a));
    assert.equal(new Set(c).size, 3);
    assert.ok(c.every((n) => n >= 1 && n <= 10));
  }
});

test('alphabet train fills carriages in order and wraps around', () => {
  const letters = ['A', 'B', 'C', 'D', 'E'].map((c) => ({ id: c, char: c }));
  let t = L.createTrain(letters, 3, 4);
  assert.equal(L.expectedLetter(t).id, 'D');
  assert.equal(L.addCarriage(t, letters[0]).ok, false);
  const order = [];
  let done = false;
  while (!done) {
    const want = L.expectedLetter(t);
    order.push(want.id);
    const r = L.addCarriage(t, want);
    assert.ok(r.ok);
    t = r.train;
    done = r.done;
  }
  assert.deepEqual(order, ['D', 'E', 'A', 'B']);
  assert.equal(L.nextTrainStart(t), 2);
  const choices = L.trainChoices(L.createTrain(letters, 0, 3), 3, rng());
  assert.ok(choices.some((l) => l.id === 'A'));
});

test('sort rounds always contain a bin for the item', () => {
  const colors = ['red', 'blue', 'yellow', 'green'];
  const shapes = ['circle', 'square', 'star'];
  for (let seed = 1; seed < 30; seed++) {
    for (const mode of ['color', 'shape']) {
      const r = L.makeSortRound(colors, shapes, mode, 3, L.makeRng(seed));
      assert.equal(r.bins.length, 3);
      assert.ok(r.bins.includes(r.answer));
      assert.equal(r.answer, mode === 'color' ? r.item.color : r.item.shape);
      assert.ok(L.checkSort(r, r.answer));
      assert.ok(!L.checkSort(r, r.bins.find((b) => b !== r.answer)));
    }
  }
});

test('opposite rounds pick a target from the pair', () => {
  const pairs = [
    { a: 'big', b: 'small' },
    { a: 'up', b: 'down' },
  ];
  const r = L.makeOppositeRound(pairs, rng());
  assert.ok(['a', 'b'].includes(r.target));
  assert.deepEqual([...r.order].sort(), ['a', 'b']);
  const next = L.makeOppositeRound([pairs[0], pairs[1]], () => 0, { pair: pairs[0] });
  assert.equal(next.pair, pairs[1], 'avoids repeating the previous pair');
});

test('traceCoverage', () => {
  const targets = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 20, y: 0 },
    { x: 30, y: 0 },
  ];
  assert.equal(L.traceCoverage(targets, [], 5), 0);
  assert.equal(L.traceCoverage(targets, [{ x: 1, y: 1 }, { x: 11, y: 0 }], 5), 0.5);
  assert.equal(L.traceCoverage(targets, targets, 1), 1);
  assert.equal(L.traceCoverage([], [], 5), 1);
  assert.equal(L.thinPoints([1, 2, 3, 4, 5, 6], 3).length, 3);
});

test('rewards unlock vehicles in order and stop when all are unlocked', () => {
  const ids = ['bus', 'car', 'rocket'];
  let p = { unlockedVehicles: ['bus'], completed: {} };
  let r = L.applyCompletion(p, 'construction', ids);
  assert.equal(r.newVehicle, 'car');
  r = L.applyCompletion(r.progress, 'construction', ids);
  assert.equal(r.newVehicle, 'rocket');
  assert.equal(r.progress.completed.construction, 2);
  r = L.applyCompletion(r.progress, 'farm', ids);
  assert.equal(r.newVehicle, null);
  assert.deepEqual(r.progress.unlockedVehicles, ids);
  assert.deepEqual(p.unlockedVehicles, ['bus'], 'input not mutated');
});

const content = {
  places: [{ id: 'a' }, { id: 'b', unlockedByDefault: false }],
  vehicles: [{ id: 'bus', unlockedByDefault: true }, { id: 'car' }],
  letterSets: [
    { id: 'hv', lang: 'hi', letters: [{ id: 'x', char: 'अ' }] },
    { id: 'en', lang: 'en', letters: [{ id: 'y', char: 'A' }] },
    { id: 'hc', lang: 'hi', enabledByDefault: false, letters: [{ id: 'z', char: 'क' }] },
  ],
};

test('settings defaults and normalisation ignore junk', () => {
  const d = L.defaultSettings(content);
  assert.deepEqual(d, { lang: 'both', places: { a: true, b: false }, letterSets: { hv: true, en: true, hc: false } });
  const n = L.normalizeSettings({ lang: 'fr', places: { a: false, zzz: true }, letterSets: { hc: 'yes' } }, content);
  assert.equal(n.lang, 'both');
  assert.deepEqual(n.places, { a: false, b: false });
  assert.equal(n.letterSets.hc, false);
  assert.deepEqual(L.normalizeSettings(null, content), d);
});

test('progress normalisation drops unknown vehicles and keeps defaults', () => {
  const p = L.normalizeProgress({ unlockedVehicles: ['car', 'spaceship'] }, content);
  assert.deepEqual(p.unlockedVehicles, ['bus', 'car']);
});

test('active letters follow the language mix, falling back when all sets are off', () => {
  const s = L.defaultSettings(content);
  assert.deepEqual(L.activeLetters(content, s).map((l) => l.id), ['x', 'y']);
  s.lang = 'hi';
  assert.deepEqual(L.activeLetters(content, s).map((l) => l.id), ['x']);
  assert.equal(L.activeLetters(content, s)[0].lang, 'hi');
  s.letterSets = { hv: false, en: false, hc: false };
  assert.deepEqual(L.activeLetters(content, s).map((l) => l.id), ['x', 'z']);
  s.lang = 'en';
  assert.deepEqual(L.activeLetters(content, s).map((l) => l.id), ['y']);
});

test('visiblePlaces respects the parent switches', () => {
  const s = L.defaultSettings(content);
  assert.deepEqual(L.visiblePlaces(content, s).map((p) => p.id), ['a']);
});

test('recording file names map to clip keys', () => {
  const keys = ['bus_hi', 'hc-ka', 'num-3_en'];
  assert.equal(L.clipKeyFromFileName('Bus_HI.m4a', keys), 'bus_hi');
  assert.equal(L.clipKeyFromFileName('hc-ka.mp3', keys), 'hc-ka');
  assert.equal(L.clipKeyFromFileName('holiday.mp3', keys), null);
});
