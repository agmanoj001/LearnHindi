// Worlds, units and lessons: unlocking, stars, collectibles, streaks and difficulty tiers.
// Pure functions (no DOM, no storage) so every rule here is unit-tested.

export const TIERS = ['easy', 'medium', 'hard'];

// Every lesson of a world in path order, each with its unit.
export function worldLessons(world) {
  return world.units.flatMap((unit) => unit.lessons.map((lesson) => ({ ...lesson, unit })));
}

export function findLesson(content, lessonId) {
  for (const world of content.worlds) {
    for (const unit of world.units) {
      const lesson = unit.lessons.find((l) => l.id === lessonId);
      if (lesson) return { world, unit, lesson };
    }
  }
  return null;
}

export function lessonRecord(progress, lessonId) {
  return progress.lessons?.[lessonId] || { stars: 0, plays: 0, tier: 0 };
}

// A lesson is open if it is the first one, the one before it has a star, or a grown-up unlocked everything.
export function isUnlocked(progress, world, lessonId, unlockAll = false) {
  if (unlockAll) return true;
  const list = worldLessons(world);
  const i = list.findIndex((l) => l.id === lessonId);
  if (i <= 0) return i === 0;
  return lessonRecord(progress, list[i - 1].id).stars > 0;
}

// The lesson the child should play next: the first one without stars (or the last one).
export function currentLesson(progress, world) {
  const list = worldLessons(world);
  return list.find((l) => lessonRecord(progress, l.id).stars === 0) || list[list.length - 1];
}

export function nextLesson(world, lessonId) {
  const list = worldLessons(world);
  const i = list.findIndex((l) => l.id === lessonId);
  return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
}

// Stars never go below one: finishing a lesson is always a success.
export function starsFor(firstTry, answered) {
  if (!answered) return 3;
  const r = firstTry / answered;
  if (r >= 0.9) return 3;
  if (r >= 0.7) return 2;
  return 1;
}

// Easy -> medium -> hard as the child gets things right first time, and back down if it is too hard.
// Inside a lesson the level follows the child: two right first time in a row make it one step
// harder, two misses in a row one step easier. `changed` is +1, -1 or 0.
export function adaptTier({ tier = 0, right = 0, miss = 0 }, firstTry, max = TIERS.length - 1) {
  if (firstTry) {
    if (right + 1 >= 2 && tier < max) return { tier: tier + 1, right: 0, miss: 0, changed: 1 };
    return { tier, right: right + 1, miss: 0, changed: 0 };
  }
  if (miss + 1 >= 2 && tier > 0) return { tier: tier - 1, right: 0, miss: 0, changed: -1 };
  return { tier, right: 0, miss: miss + 1, changed: 0 };
}

export function nextTier(tier, firstTry, answered) {
  if (!answered) return tier;
  const r = firstTry / answered;
  if (r >= 0.85) return Math.min(TIERS.length - 1, tier + 1);
  if (r < 0.5) return Math.max(0, tier - 1);
  return tier;
}

export function worldStars(progress, world) {
  const list = worldLessons(world);
  return { got: list.reduce((n, l) => n + lessonRecord(progress, l.id).stars, 0), max: list.length * 3 };
}

export function unitDone(progress, unit) {
  return unit.lessons.every((l) => lessonRecord(progress, l.id).stars > 0);
}

// The next collectible a world gives, or null when the collection is complete.
export function nextCollectible(progress, collection) {
  const have = new Set(progress.collected?.[collection.id] || []);
  return collection.items.find((id) => !have.has(id)) ?? null;
}

export function isoDay(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Days in a row with at least one finished lesson, counting back from today (or yesterday).
export function streak(days, today) {
  const set = new Set(days || []);
  const d = new Date(today);
  if (!set.has(isoDay(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(isoDay(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// Everything that changes when a lesson is finished.
// `tier` is where the level ended inside the lesson; the next visit starts from there.
export function applyLessonResult(progress, { world, lesson, collection, firstTry, answered, tier, now = Date.now() }) {
  const before = lessonRecord(progress, lesson.id);
  const stars = starsFor(firstTry, answered);
  // first and latest score (% right first time): a simple before-and-after measure of learning
  const score = answered ? Math.round((100 * firstTry) / answered) : null;
  const firstTime = before.stars === 0;
  const lessons = {
    ...progress.lessons,
    [lesson.id]: {
      stars: Math.max(before.stars, stars),
      plays: before.plays + 1,
      tier: nextTier(tier ?? (before.tier || 0), firstTry, answered),
      // spaced review: a strong result moves the lesson to a longer gap, a weak one back to the start
      box: stars === 3 ? Math.min(REVIEW_DAYS.length - 1, (before.box ?? -1) + 1) : stars === 2 ? Math.max(0, before.box ?? 0) : 0,
      last: isoDay(now),
      ...(score === null ? {} : { first: before.first ?? score, recent: score }),
    },
  };
  // a new collectible the first time a lesson is finished, and for every 3-star replay
  let collected = progress.collected || {};
  let item = null;
  if (collection && (firstTime || stars === 3)) {
    item = nextCollectible(progress, collection);
    if (item) collected = { ...collected, [collection.id]: [...(collected[collection.id] || []), item] };
  }
  const day = isoDay(now);
  const days = (progress.days || []).includes(day) ? progress.days : [...(progress.days || []), day].slice(-120);
  const unit = world.units.find((u) => u.lessons.some((l) => l.id === lesson.id));
  const next = { ...progress, lessons, collected, days };
  const unitComplete = unit ? !unitDone(progress, unit) && unitDone(next, unit) : false;
  return { progress: next, stars, item, firstTime, unitComplete, tier: lessons[lesson.id].tier };
}

// "@grade1" style references in letter lists: { sets: ["hindiConsonants"], from: 0, to: 10 }
export function lessonLetters(content, spec) {
  const sets = content.letterSets.filter((s) => spec.sets.includes(s.id));
  return sets.map((s) => {
    const from = spec.from ?? 0;
    const to = spec.to ?? s.letters.length;
    const sliced = from === 0 && to >= s.letters.length;
    return { ...s, id: sliced ? s.id : `${s.id}:${from}-${to}`, letters: s.letters.slice(from, to) };
  });
}

// Worlds shown on the hub: the child's grade first, then the rest in grade order.
export function hubWorlds(content, settings) {
  const order = content.levels.map((l) => l.id);
  const mine = settings.level;
  const all = content.worlds.filter((w) => w.subject !== 'math' || settings.math !== false).sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
  if (settings.lockGrade) return all.filter((w) => w.level === mine);
  return [...all.filter((w) => w.level === mine), ...all.filter((w) => w.level !== mine)];
}

export function homeWorld(content, settings) {
  return content.worlds.find((w) => w.level === settings.level && w.subject === 'hindi') || content.worlds.find((w) => w.level === settings.level) || content.worlds[0];
}

// Old saves (before worlds) kept vehicles in unlockedVehicles: move them into the vehicles collection.
export function migrateProgress(saved) {
  if (!saved || typeof saved !== 'object') return saved;
  if (Array.isArray(saved.unlockedVehicles) && !saved.collected) {
    return { ...saved, collected: { vehicles: saved.unlockedVehicles.slice() } };
  }
  return saved;
}

// ---------- spaced review and the daily plan ----------

// Days to wait before a lesson comes back for review, by "box": 1, 2, 4, 7, then 14 days
// (expanding intervals, as in a Leitner system).
export const REVIEW_DAYS = [1, 2, 4, 7, 14];

const dayNumber = (iso) => Math.round(new Date(`${iso}T12:00:00`).getTime() / 86400000);

// Finished lessons whose review is due, most overdue (then weakest) first.
export function dueReviews(progress, worlds, now = Date.now()) {
  const today = dayNumber(isoDay(now));
  const out = [];
  for (const world of worlds) {
    for (const lesson of worldLessons(world)) {
      const rec = lessonRecord(progress, lesson.id);
      if (!rec.stars || !rec.last) continue;
      const overdue = today - dayNumber(rec.last) - REVIEW_DAYS[rec.box ?? 0];
      if (overdue >= 0) out.push({ world, lesson, overdue, stars: rec.stars });
    }
  }
  return out.sort((a, b) => b.overdue - a.overdue || a.stars - b.stars);
}

// Today's path: three short steps for the child's grade.
//   go     the next new lesson, in the grade's world with the least done (keeps subjects balanced)
//   review a finished lesson that is due again (spaced repetition), if there is one
//   story  a story the child hasn't read yet (or any story lesson)
// Each step says whether it was already done today.
export function todayPlan(content, progress, worlds, now = Date.now()) {
  const today = isoDay(now);
  const done = (lessonId) => lessonRecord(progress, lessonId).last === today;
  const ratio = (w) => {
    const list = worldLessons(w);
    return list.filter((l) => lessonRecord(progress, l.id).stars > 0).length / list.length;
  };
  const steps = [];
  const open = worlds.filter((w) => worldLessons(w).some((l) => lessonRecord(progress, l.id).stars === 0));
  const goWorld = open.slice().sort((a, b) => ratio(a) - ratio(b))[0];
  if (goWorld) steps.push({ kind: 'go', world: goWorld, lesson: currentLesson(progress, goWorld) });
  const review = dueReviews(progress, worlds, now).find((r) => !steps.some((s) => s.lesson.id === r.lesson.id));
  if (review) steps.push({ kind: 'review', world: review.world, lesson: review.lesson });
  const stories = worlds.flatMap((w) => worldLessons(w).filter((l) => l.game === 'story').map((lesson) => ({ world: w, lesson })));
  const story = stories.find((s) => lessonRecord(progress, s.lesson.id).stars === 0) || stories.find((s) => !s.lesson.config?.story) || stories[0];
  if (story && !steps.some((s) => s.lesson.id === story.lesson.id)) steps.push({ kind: 'story', ...story });
  const watched = showPractice(content, progress, worlds, now);
  if (watched && !steps.some((s) => s.lesson.id === watched.lesson.id)) steps.splice(1, 0, { kind: 'watched', ...watched });
  return steps.map((s) => ({ ...s, done: done(s.lesson.id) }));
}

// An episode watched today or yesterday whose game hasn't been played since: practise it next.
export function showPractice(content, progress, worlds, now = Date.now()) {
  const today = isoDay(now);
  const yesterday = isoDay(new Date(now - 86400000));
  for (const show of content.shows || []) {
    const seen = progress.shows?.[show.id];
    if (!seen || (seen.last !== today && seen.last !== yesterday) || !show.lesson) continue;
    const world = worlds.find((w) => worldLessons(w).some((l) => l.id === show.lesson));
    if (!world) continue;
    const lesson = worldLessons(world).find((l) => l.id === show.lesson);
    const last = lessonRecord(progress, lesson.id).last;
    if (!last || last < seen.last) return { world, lesson, show };
  }
  return null;
}

// Minutes played per day, for the daily limit and the parent's week view.
export function addPlayTime(progress, seconds, now = Date.now()) {
  const day = isoDay(now);
  const time = { ...(progress.time || {}) };
  time[day] = Math.round((time[day] || 0) + seconds);
  // keep the last 60 days
  const keep = Object.keys(time).sort().slice(-60);
  return { ...progress, time: Object.fromEntries(keep.map((d) => [d, time[d]])) };
}

export function weekSummary(progress, now = Date.now()) {
  const days = [];
  const d = new Date(now);
  for (let i = 6; i >= 0; i--) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
    const iso = isoDay(day);
    days.push({ day: iso, minutes: Math.round((progress.time?.[iso] || 0) / 60), weekday: day.getDay() });
  }
  const recent = new Set(days.map((x) => x.day));
  const lessons = Object.values(progress.lessons || {}).filter((r) => recent.has(r.last)).length;
  return { days, minutes: days.reduce((n, x) => n + x.minutes, 0), lessons };
}

// Lessons played more than once, with their first and latest score: how much the child has improved.
export function learningGains(progress, content) {
  const rows = [];
  for (const w of content.worlds) {
    for (const lesson of worldLessons(w)) {
      const r = lessonRecord(progress, lesson.id);
      if (r.plays >= 2 && Number.isFinite(r.first) && Number.isFinite(r.recent)) rows.push({ world: w, lesson, first: r.first, recent: r.recent, gain: r.recent - r.first });
    }
  }
  rows.sort((a, b) => b.gain - a.gain);
  const avg = (k) => (rows.length ? Math.round(rows.reduce((n, r) => n + r[k], 0) / rows.length) : null);
  return { rows, first: avg('first'), recent: avg('recent') };
}

// Stories in a world's language: English worlds get the English-only ones (nursery rhymes),
// Hindi worlds everything else.
export const storyLang = (story) => story.lang || 'hi';
export const worldStoryLang = (world) => (world?.lang === 'en' ? 'en' : 'hi');
