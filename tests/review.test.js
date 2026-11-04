import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as C from '../js/curriculum.js';
import * as L from '../js/logic.js';
import { normalizeProfiles, profileKey, addProfile, removeProfile, MAX_PROFILES } from '../js/storage.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const world = (id) => content.worlds.find((w) => w.id === id);
const day = (iso) => new Date(`${iso}T10:00:00`).getTime();

test('spaced review: strong lessons wait longer, weak ones come back tomorrow', () => {
  const town = world('town');
  const [a, b] = C.worldLessons(town);
  let p = L.defaultProgress(content);
  p = C.applyLessonResult(p, { world: town, lesson: a, collection: null, firstTry: 6, answered: 6, now: day('2026-11-01') }).progress;
  p = C.applyLessonResult(p, { world: town, lesson: b, collection: null, firstTry: 2, answered: 6, now: day('2026-11-01') }).progress;
  assert.equal(p.lessons[a.id].box, 0); // first 3-star result: the 1-day gap
  assert.equal(p.lessons[b.id].box, 0);
  assert.equal(p.lessons[a.id].last, '2026-11-01');
  assert.deepEqual(C.dueReviews(p, [town], day('2026-11-01')), []);
  const due = C.dueReviews(p, [town], day('2026-11-02')).map((r) => r.lesson.id);
  assert.deepEqual(due, [b.id, a.id]); // equally overdue: the weaker one first
  // a second 3-star play moves the lesson to the 2-day gap
  p = C.applyLessonResult(p, { world: town, lesson: a, collection: null, firstTry: 6, answered: 6, now: day('2026-11-02') }).progress;
  assert.equal(p.lessons[a.id].box, 1);
  assert.ok(!C.dueReviews(p, [town], day('2026-11-03')).some((r) => r.lesson.id === a.id));
  assert.ok(C.dueReviews(p, [town], day('2026-11-04')).some((r) => r.lesson.id === a.id));
  // a weak result sends it back to the start
  p = C.applyLessonResult(p, { world: town, lesson: a, collection: null, firstTry: 1, answered: 6, now: day('2026-11-04') }).progress;
  assert.equal(p.lessons[a.id].box, 0);
  assert.deepEqual(C.REVIEW_DAYS, [1, 2, 4, 7, 14]);
});

test("today's path: a new lesson in the least-done world, a due review, and a story", () => {
  const worlds = content.worlds.filter((w) => w.level === 'grade2');
  let p = L.defaultProgress(content);
  let plan = C.todayPlan(content, p, worlds, day('2026-11-01'));
  assert.deepEqual(plan.map((s) => s.kind), ['go', 'story']);
  // play the first dino lesson: now another world has the least done, and tomorrow it is due
  const dino = world('dino');
  const first = C.worldLessons(dino)[0];
  p = C.applyLessonResult(p, { world: dino, lesson: first, collection: null, firstTry: 3, answered: 6, now: day('2026-11-01') }).progress;
  plan = C.todayPlan(content, p, worlds, day('2026-11-02'));
  assert.notEqual(plan[0].world.id, 'dino');
  assert.equal(plan.find((s) => s.kind === 'review').lesson.id, first.id);
  assert.ok(plan.find((s) => s.kind === 'story').lesson.game === 'story');
  assert.ok(plan.every((s) => !s.done));
  const today = C.todayPlan(content, p, worlds, day('2026-11-01'));
  assert.ok(today.some((s) => s.done) || !today.some((s) => s.lesson.id === first.id));
});

test('play time adds up per day and the week view sums it', () => {
  let p = L.defaultProgress(content);
  p = C.addPlayTime(p, 600, day('2026-11-03'));
  p = C.addPlayTime(p, 300, day('2026-11-03'));
  p = C.addPlayTime(p, 120, day('2026-11-01'));
  const w = C.weekSummary(p, day('2026-11-03'));
  assert.equal(w.days.length, 7);
  assert.equal(w.days[6].minutes, 15);
  assert.equal(w.minutes, 17);
  // saved and loaded back
  const again = L.normalizeProgress(JSON.parse(JSON.stringify(p)), content);
  assert.equal(again.time['2026-11-03'], 900);
});

test('settings: captions on by default, the daily limit only takes the offered values', () => {
  const s = L.normalizeSettings({}, content);
  assert.equal(s.captions, true);
  assert.equal(s.dailyLimit, 0);
  assert.equal(L.normalizeSettings({ dailyLimit: 30 }, content).dailyLimit, 30);
  assert.equal(L.normalizeSettings({ dailyLimit: 7 }, content).dailyLimit, 0);
});

test('profiles: the first child keeps the old keys, up to four children', () => {
  let pr = normalizeProfiles(null, ['gappu', 'pip']);
  assert.deepEqual(pr.list.map((p) => p.id), ['p1']);
  assert.equal(profileKey('vt.progress', 'p1'), 'vt.progress');
  assert.equal(profileKey('vt.progress', 'p2'), 'vt.progress:p2');
  for (let i = 0; i < 6; i++) pr = addProfile(pr, 'pip');
  assert.equal(pr.list.length, MAX_PROFILES);
  pr = removeProfile({ ...pr, current: 'p3' }, 'p3');
  assert.equal(pr.current, 'p1');
  assert.ok(!pr.list.some((p) => p.id === 'p3'));
  assert.equal(removeProfile(pr, 'p1').list.length, pr.list.length, 'the first child cannot be removed');
  assert.equal(normalizeProfiles({ list: [{ id: 'p1', avatar: 'nope', name: 'x'.repeat(50) }] }, ['gappu']).list[0].name.length, 20);
});

test('every story world has a story-order lesson, and every grade has at least ten stories', () => {
  for (const id of ['jungle', 'forest', 'palace', 'mountain']) assert.ok(C.worldLessons(world(id)).some((l) => l.game === 'sequence'), id);
  for (const level of ['grade1', 'grade2', 'grade3', 'grade4']) assert.ok(content.stories.filter((s) => s.level === level).length >= 10, level);
});
