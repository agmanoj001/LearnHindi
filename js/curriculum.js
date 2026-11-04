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
export function applyLessonResult(progress, { world, lesson, collection, firstTry, answered, now = Date.now() }) {
  const before = lessonRecord(progress, lesson.id);
  const stars = starsFor(firstTry, answered);
  const firstTime = before.stars === 0;
  const lessons = {
    ...progress.lessons,
    [lesson.id]: { stars: Math.max(before.stars, stars), plays: before.plays + 1, tier: nextTier(before.tier || 0, firstTry, answered) },
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
  const all = content.worlds.slice().sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
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
