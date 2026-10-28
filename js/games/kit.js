// Helpers shared by the games. No timers, no failure: a round only ends when the child finds the answer.
import { el, wobble, bounce, sleep } from '../ui.js';

export { el, sleep, wobble, bounce };
export { flyTo, animate, ICONS } from '../ui.js';

// Resolves with the correct button once it is tapped. Other taps call onWrong (gentle feedback only).
export function choose(buttons, isRight, { onRight, onWrong } = {}) {
  return new Promise((resolve) => {
    let finished = false;
    for (const b of buttons) {
      b.addEventListener('click', () => {
        if (finished) return;
        if (isRight(b)) {
          finished = true;
          onRight?.(b);
          resolve(b);
        } else {
          wobble(b);
          onWrong?.(b);
        }
      });
    }
  });
}

export function waitTap(node) {
  return new Promise((resolve) => node.addEventListener('click', () => resolve(node), { once: true }));
}

// Runs `count` rounds in order, updating the stars. Returns false if the child left the game.
export async function runRounds(ctx, count, playRound) {
  ctx.setProgress(0, count);
  for (let i = 0; i < count; i++) {
    if (!ctx.alive()) return false;
    await playRound(i);
    if (!ctx.alive()) return false;
    ctx.setProgress(i + 1, count);
    await sleep(500);
  }
  return ctx.alive();
}

// Positive feedback after a correct answer.
export async function cheer(ctx, node) {
  ctx.sfx.chime();
  if (node) bounce(node);
  await sleep(250);
}

export function vehicleEl(ctx, id, cls = '') {
  return el('div', { class: `vehicle ${cls}`, html: ctx.vehicleArt(id) });
}

// A menu of activities inside a place (each one big picture button).
export function activityMenu(ctx, items) {
  let started = false;
  const buttons = items.map((it) => {
    const b = el('button', { class: 'card activity', 'aria-label': it.word.en }, [
      el('span', { class: 'pic', html: ctx.vehicleArt(it.word.id) }),
      ctx.label(it.word),
    ]);
    b.addEventListener('click', async () => {
      ctx.sfx.pop();
      bounce(b);
      ctx.sayItem(it.word);
      if (it.play) return it.play(b);
      if (started) return;
      started = true;
      await sleep(900);
      if (ctx.alive()) it.go();
    });
    return b;
  });
  ctx.stage.replaceChildren(el('div', { class: 'choices menu' }, buttons));
  ctx.setRepeat(() => null);
  return buttons;
}
