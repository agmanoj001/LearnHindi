// A surprise each day (docs/ROADMAP.md 7.12). After the first lesson of the day the results screen has a
// gift box; inside is one small thing: a sticker for the collection, a riddle from the guide, or a funny
// new sound for the buttons, just for today. Small and unpredictable; never bought, never lost.
// progress.gift: { day, kind, value } once today's box is opened.
import { isoDay } from './curriculum.js';

export const GIFT_KINDS = ['sticker', 'joke', 'sound'];
// the buttons' sound for the day (sfx.js tick plays these)
export const GIFT_SOUNDS = ['boing', 'toot', 'whoosh', 'splash'];

const hash = (s) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
};

// a box waits until today's has been opened
export const giftDue = (progress, now = Date.now()) => progress?.gift?.day !== isoDay(now);
// today's special button sound, if today's gift was one
export const giftSoundToday = (progress, now = Date.now()) => (progress?.gift?.day === isoDay(now) && progress.gift.kind === 'sound' ? progress.gift.value : null);

// What is in today's box: the kinds take turns from day to day (the order shuffled by the date), a sticker
// only if the collection still has one to find. `jokes` are the guide's riddles (their indexes).
export function pickGift(day, { sticker = null, jokes = [] } = {}) {
  const h = hash(day);
  const order = [0, 1, 2].map((i) => GIFT_KINDS[(h + i) % 3]);
  for (const kind of order) {
    if (kind === 'sticker' && sticker) return { day, kind, value: sticker };
    if (kind === 'joke' && jokes.length) return { day, kind, value: jokes[h % jokes.length] };
    if (kind === 'sound') return { day, kind, value: GIFT_SOUNDS[(h >>> 3) % GIFT_SOUNDS.length] };
  }
  return { day, kind: 'sound', value: GIFT_SOUNDS[0] };
}
// the guide's riddles: lines that ask something
export const riddleIndexes = (lines = []) => lines.map((l, i) => (/\?/.test(l.hi) ? i : -1)).filter((i) => i >= 0);
