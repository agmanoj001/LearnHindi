// "How to play" for first-timers (docs/ROADMAP.md 4.5). The first time a child meets each kind of game,
// once the game has said its question, a hand shows what to do (taps across the answers, taps the next
// tile, drags along the letter, taps the page arrow) while the guide says it. Nothing a child has to read,
// and it never shows again for that child (progress.coached, kept with the rest of their progress).
import { el } from './ui.js';

// the kinds of "what to do", and the line said for each (content.phrases)
export const COACH_KINDS = {
  tap: 'coachTap', // listen, then tap the right one
  order: 'coachOrder', // tap them one by one, in order
  each: 'coachEach', // tap each one
  drag: 'coachDrag', // put a finger down and drive along the letter
  any: 'coachAny', // any one is right
  page: 'coachPage', // tap the arrow to turn the page
};
export const coachKey = (game, kind) => `${game}:${kind}`;
export const needsCoach = (coached, game, kind) => !!COACH_KINDS[kind] && !(coached || []).includes(coachKey(game, kind));
export const COACH_MAX = 100;

const HAND =
  '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 30V10a5 5 0 0 1 10 0v16l2-1a5 5 0 0 1 6 3l1 1a5 5 0 0 1 7 4l1 1a5 5 0 0 1 6 5v8c0 9-7 16-16 16h-6c-6 0-10-3-13-8l-8-13a5 5 0 0 1 8-6z" fill="#FFE0BF" stroke="#2B2D42" stroke-width="3" stroke-linejoin="round"/><path d="M34 26v8M43 29v6M50 34v4" stroke="#2B2D42" stroke-width="2.6" stroke-linecap="round"/></svg>';

// The moves the hand makes, as points on the screen: [{ x, y, press }]
export function coachPath(kind, rects) {
  const c = (r, ax = 0.5, ay = 0.5) => ({ x: r.left + r.width * ax, y: r.top + r.height * ay });
  if (!rects.length) return [];
  if (kind === 'drag') {
    const r = rects[0];
    return [{ ...c(r, 0.25, 0.8) }, { ...c(r, 0.25, 0.8), press: true }, { ...c(r, 0.45, 0.45), press: true }, { ...c(r, 0.65, 0.3), press: true }, { ...c(r, 0.65, 0.3) }];
  }
  if (kind === 'tap') {
    // over each answer in turn ("one of these"), without picking one
    const over = rects.slice(0, 4).map((r) => c(r, 0.55, 0.6));
    return [...over, over[0]];
  }
  // order, each, any, page: tap the one to start with, twice
  const p = c(rects[0], 0.55, 0.6);
  return [{ x: p.x, y: p.y + 60 }, p, { ...p, press: true }, p, { ...p, press: true }, p];
}

// Show the hand over `targets` (elements) on `screen`. Returns stop(); a tap anywhere also stops it.
export function showCoach(screen, kind, targets) {
  const hand = el('div', { class: `coach-hand coach-${kind}`, html: HAND });
  const layer = el('div', { class: 'coach-layer', 'aria-hidden': 'true' }, [hand]);
  screen.append(layer);
  for (const t of targets) t.classList?.add('coach-target');
  const path = coachPath(kind, targets.map((t) => t.getBoundingClientRect()));
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let anim = null;
  const stop = () => {
    anim?.cancel?.();
    layer.remove();
    for (const t of targets) t.classList?.remove('coach-target');
    screen.removeEventListener('pointerdown', stop, true);
  };
  screen.addEventListener('pointerdown', stop, true);
  if (!path.length) return stop;
  const at = (p) => `translate(${p.x - 14}px, ${p.y - 6}px) scale(${p.press ? 0.86 : 1})`;
  if (reduce || !hand.animate) hand.style.transform = at(path[Math.min(1, path.length - 1)]);
  else
    anim = hand.animate(
      path.map((p) => ({ transform: at(p) })),
      { duration: Math.max(1600, path.length * 520), iterations: 2, easing: 'ease-in-out', fill: 'forwards' },
    );
  return stop;
}
