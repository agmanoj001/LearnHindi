// The guide has more to say (docs/ROADMAP.md 7.10): a greeting that fits the time of day, a warm
// "I missed you" after a few days away (never a broken-streak message), and a cheer for every milestone
// (the first lesson, so many stars, so many stories, so many days played, a whole world finished).
// The lines are in content.json "guide"; each has an id, and is recorded as guide-<id>_hi / _en.
// Pure: no DOM, so the tests can use it.
import { isoDay } from './curriculum.js';

export const SLOTS = ['morning', 'day', 'evening', 'night'];
export function timeSlot(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}
// the big hello on the home screen
export const HELLO = { morning: { hi: 'सुप्रभात', en: 'Good morning' }, day: { hi: 'नमस्ते', en: 'Hello' }, evening: { hi: 'नमस्ते', en: 'Good evening' }, night: { hi: 'शुभ रात्रि', en: 'Good night' } };

// Days since the child last played before today (null if never).
export function daysAway(days = [], now = Date.now()) {
  const today = isoDay(now);
  const before = days.filter((d) => d < today).sort();
  if (!before.length) return null;
  return Math.round((Date.parse(today) - Date.parse(before.at(-1))) / 86400000);
}
export const AWAY_DAYS = 3;

// What the guide says on the home screen: the very first time, after a few days away, or for the time.
export function greeting(guide, { days = [], now = Date.now(), rng = Math.random } = {}) {
  if (!guide) return null;
  const pick = (list) => list?.[Math.floor(rng() * list.length)] || null;
  const away = daysAway(days, now);
  const today = isoDay(now);
  if (away === null && !days.includes(today)) return pick(guide.first);
  if (away !== null && away >= AWAY_DAYS && !days.includes(today)) return pick(guide.back);
  return pick(guide.greet?.[timeSlot(new Date(now))]);
}

// ---- milestones ----
export const STAR_STEPS = [10, 25, 50, 100, 200, 300, 500];
export const STORY_STEPS = [1, 5, 10, 25, 50];
export const DAY_STEPS = [3, 7, 14, 30, 50, 100];

export const totalStars = (progress) => Object.values(progress.lessons || {}).reduce((a, r) => a + (r.stars || 0), 0);
// stories read: from the library (story:<id>) or as a story lesson on a map
export function storiesRead(progress, storyLessons = new Map()) {
  const read = new Set();
  for (const [id, r] of Object.entries(progress.lessons || {})) {
    if (!(r.stars > 0)) continue;
    if (id.startsWith('story:')) read.add(id.slice(6));
    else if (storyLessons.has(id)) read.add(storyLessons.get(id));
  }
  return read.size;
}
const crossed = (steps, a, b) => steps.filter((s) => a < s && b >= s);

// The milestones a lesson's result reached, most special first.
export function milestones(before, after, { storyLessons, worldLessonIds = [] } = {}) {
  const out = [];
  const done = (p, ids) => ids.length > 0 && ids.every((id) => (p.lessons?.[id]?.stars || 0) > 0);
  if (done(after, worldLessonIds) && !done(before, worldLessonIds)) out.push('world');
  if (totalStars(before) === 0 && totalStars(after) > 0) out.push('first-lesson');
  for (const s of crossed(STAR_STEPS, totalStars(before), totalStars(after)).reverse()) out.push(`stars-${s}`);
  for (const s of crossed(STORY_STEPS, storiesRead(before, storyLessons), storiesRead(after, storyLessons)).reverse()) out.push(`stories-${s}`);
  for (const s of crossed(DAY_STEPS, (before.days || []).length, (after.days || []).length).reverse()) out.push(`days-${s}`);
  // the very first lesson may also be the first story: the first lesson says it
  return out.includes('first-lesson') ? out.filter((m) => m !== 'stories-1') : out;
}
export const milestoneLine = (guide, id) => guide?.milestones?.find((m) => m.id === id) || null;

// Every line the guide can say, with its recording key (for the voice pack).
export function guideLines(guide) {
  if (!guide) return [];
  const out = [];
  for (const slot of SLOTS) for (const l of guide.greet?.[slot] || []) out.push(l);
  for (const l of [...(guide.first || []), ...(guide.back || []), ...(guide.milestones || [])]) out.push(l);
  return out.map((l) => ({ ...l, key: `guide-${l.id}` }));
}
