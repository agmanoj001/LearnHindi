import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SKILLS, SKILL_IDS, makeProblem, numberOptions, skillName } from '../js/mathgen.js';
import { mathModel } from '../js/art-math.js';
import { validateContent } from '../js/validate.js';
import { hubWorlds, worldLessons } from '../js/curriculum.js';
import { itemKey, normalizeSettings } from '../js/logic.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

test('every skill, tier and option count makes a fair problem', () => {
  const rng = seeded(42);
  for (const id of SKILL_IDS) {
    for (const tier of [0, 1, 2]) {
      for (const n of [2, 3, 4]) {
        for (let i = 0; i < 60; i++) {
          const p = makeProblem(id, { tier, n, rng });
          const values = p.options.map((o) => String(o.value));
          const at = `${id} tier ${tier} n ${n}: ${JSON.stringify(p.options.map((o) => o.value))} answer ${p.answer}`;
          assert.ok(values.includes(String(p.answer)), at);
          assert.equal(new Set(values).size, values.length, `duplicate options in ${at}`);
          assert.ok(values.length >= 2 && values.length <= 4, at);
          assert.ok(p.ask && p.explain, `${id} needs words`);
          for (const o of p.options) assert.ok(o.label || o.model, `${id}: every option shows something`);
          const html = mathModel(p.model) + p.options.map((o) => mathModel(o.model)).join('');
          assert.doesNotMatch(html, /undefined|NaN/, at);
        }
      }
    }
  }
});

test('number options are near the answer and in order', () => {
  const opts = numberOptions(7, 4, seeded(1), { min: 0, max: 10 });
  assert.equal(opts.length, 4);
  assert.ok(opts.some((o) => o.value === 7));
  assert.deepEqual(
    opts.map((o) => o.value),
    opts.map((o) => o.value).sort((a, b) => a - b),
  );
  assert.ok(opts.every((o) => Math.abs(o.value - 7) <= 3));
  // teen numbers bring their mirror image (13 and 31)
  const teen = numberOptions(13, 3, seeded(5), { min: 11, max: 19, tricky: [31] });
  assert.ok(teen.some((o) => o.value === 31));
});

test('higher tiers mean bigger numbers and fewer pictures', () => {
  const rng = seeded(7);
  const answers = (tier) => Array.from({ length: 80 }, () => makeProblem('k-count', { tier, n: 3, rng }).answer);
  assert.ok(Math.max(...answers(0)) <= 5);
  assert.ok(Math.min(...answers(2)) >= 8);
  const withModel = (tier) => Array.from({ length: 40 }, () => makeProblem('g1-place', { tier, n: 3, rng })).filter((p) => p.model).length;
  assert.equal(withModel(0), 40);
  assert.equal(withModel(2), 0);
  const halfHours = Array.from({ length: 40 }, () => makeProblem('g1-time', { tier: 0, n: 3, rng }).answer);
  assert.ok(halfHours.every((t) => t.endsWith(':00')), 'tier 0 tells time to the hour only');
});

test('the same seed gives the same problem', () => {
  const a = makeProblem('g1-story', { tier: 1, n: 3, rng: seeded(9) });
  const b = makeProblem('g1-story', { tier: 1, n: 3, rng: seeded(9) });
  assert.deepEqual(a, b);
  assert.throws(() => makeProblem('nope'));
});

test('a clock at half past shows the hour hand between two numbers', () => {
  const html = mathModel({ kind: 'clock', h: 3, m: 30 });
  assert.match(html, /rotate\(105 100 100\)/); // hour hand: 3.5 × 30°
  assert.match(html, /rotate\(180 100 100\)/); // minute hand on the 6
});

// ---- the math worlds ----

const math = content.worlds.filter((w) => w.subject === 'math');

test('Kindergarten and Grade 1 each have an English math world', () => {
  assert.deepEqual(
    math.map((w) => [w.level, w.lang]),
    [
      ['kg', 'en'],
      ['grade1', 'en'],
    ],
  );
  const { errors } = validateContent(content);
  assert.deepEqual(errors, []);
});

test('the Kindergarten world teaches K skills and the Grade 1 world Grade 1 skills, all of them', () => {
  const used = new Set();
  for (const w of math) {
    const prefix = w.level === 'kg' ? 'k-' : 'g1-';
    for (const lesson of worldLessons(w)) {
      assert.equal(lesson.game, 'math');
      for (const s of lesson.config.skills) {
        assert.ok(s.startsWith(prefix), `${w.id}: ${s}`);
        used.add(s);
      }
    }
  }
  assert.deepEqual(SKILL_IDS.filter((s) => !used.has(s)), []);
});

test('the skills cover the NC standards for K and Grade 1', () => {
  const codes = new Set(Object.values(SKILLS).map((s) => s.code));
  for (const code of ['NC.K.CC.1', 'NC.K.CC.2', 'NC.K.CC.3', 'NC.K.CC.4', 'NC.K.CC.5', 'NC.K.CC.6', 'NC.K.CC.7', 'NC.K.OA.2', 'NC.K.OA.3', 'NC.K.OA.4', 'NC.K.OA.5', 'NC.K.NBT.1', 'NC.K.MD.2', 'NC.K.MD.3', 'NC.K.G.1', 'NC.K.G.2', 'NC.K.G.3']) assert.ok(codes.has(code), code);
  for (const code of ['NC.1.OA.1', 'NC.1.OA.2', 'NC.1.OA.6', 'NC.1.OA.7', 'NC.1.OA.8', 'NC.1.NBT.1', 'NC.1.NBT.2', 'NC.1.NBT.3', 'NC.1.NBT.4', 'NC.1.NBT.5', 'NC.1.MD.1', 'NC.1.MD.2', 'NC.1.MD.3', 'NC.1.MD.4', 'NC.1.MD.5', 'NC.1.G.1', 'NC.1.G.2', 'NC.1.G.3']) assert.ok(codes.has(code), code);
  assert.match(skillName('k-make10'), /Make 10 \(NC\.K\.OA\.4\)/);
});

test('the validator rejects unknown skills and math worlds that are not in English', () => {
  const bad = structuredClone(content);
  const w = bad.worlds.find((x) => x.subject === 'math');
  w.units[0].lessons[0].config.skills = ['k-juggling'];
  w.lang = 'hi';
  const { errors } = validateContent(bad);
  assert.ok(errors.some((e) => e.includes('"k-juggling" is not a math skill')));
  assert.ok(errors.some((e) => e.includes('math worlds are in English')));
});

test('parents can hide the math worlds', () => {
  const on = normalizeSettings({ level: 'kg' }, content);
  assert.equal(on.math, true);
  assert.ok(hubWorlds(content, on).some((w) => w.subject === 'math'));
  const off = normalizeSettings({ level: 'kg', math: false }, content);
  assert.ok(!hubWorlds(content, off).some((w) => w.subject === 'math'));
});

test('math answers are tracked per skill for the parent view', () => {
  assert.equal(itemKey({ skill: 'k-count' }), 's:k-count');
});
