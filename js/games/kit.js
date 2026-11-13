// Helpers shared by the games. No timers, no failure: a round only ends when the child finds the answer.
import { el, wobble, bounce, sleep } from '../ui.js';

export { el, sleep, wobble, bounce };
export { flyTo, animate, ICONS, sparkleAt } from '../ui.js';
import { sparkleAt } from '../ui.js';

// Resolves with the correct button once it is tapped. Other taps call onWrong (gentle feedback only).
// With `ctx`, the answer is recorded for the parent's progress view (right on the first tap or not).
let hintCount = 0;
export function choose(buttons, isRight, { ctx, onRight, onWrong } = {}) {
  return new Promise((resolve) => {
    let finished = false;
    let misses = 0;
    // Hints, from the 💡 button or after two wrong taps: first one wrong answer is taken away, then
    // the right one glows. A hint is help, not a penalty, but the answer no longer counts as first try.
    let hints = 0;
    const hint = () => {
      if (finished) return;
      hintCount++; // stops answers being read out over the hint
      const right = buttons.find((b) => isRight(b));
      const wrong = buttons.filter((b) => !isRight(b) && !b.classList.contains('ruled-out'));
      if (hints === 0 && wrong.length >= 2) {
        const out = wrong[Math.floor(Math.random() * wrong.length)];
        out.classList.add('ruled-out');
        out.setAttribute('aria-disabled', 'true');
        ctx?.say?.('hintOne');
      } else {
        right?.classList.add('hint');
        ctx?.say?.('hintLook');
      }
      hints++;
    };
    ctx?.setHint?.(hint);
    for (const b of buttons) {
      b.addEventListener('click', () => {
        if (finished || b.classList.contains('ruled-out')) return;
        if (isRight(b)) {
          finished = true;
          ctx?.setHint?.(null);
          b.firstTry = misses === 0 && hints === 0;
          b.classList.remove('hint');
          ctx?.record(b.item ?? b.letter ?? b.num ?? b.word, b.firstTry);
          onRight?.(b);
          resolve(b);
        } else {
          misses++;
          wobble(b);
          // a brief red edge, so the "no" is seen as well as felt
          b.classList.add('wrong');
          setTimeout(() => b.classList.remove('wrong'), 480);
          ctx?.sfx.haptic?.([18, 60, 18]);
          onWrong?.(b);
          // two misses: help without being asked (after the wrong answer has been said)
          if (misses >= 2) setTimeout(hint, 1300);
        }
      });
    }
  });
}

export function waitTap(node) {
  return new Promise((resolve) => node.addEventListener('click', () => resolve(node), { once: true }));
}

// Runs `count` rounds in order, updating the stars. Returns false if the child left the game.
// `offset`/`total` let a game with two parts share one row of stars.
export async function runRounds(ctx, count, playRound, { offset = 0, total = count } = {}) {
  ctx.setProgress(offset, total);
  for (let i = 0; i < count; i++) {
    if (!ctx.alive()) return false;
    await playRound(i);
    if (!ctx.alive()) return false;
    ctx.setProgress(offset + i + 1, total);
    await sleep(300);
  }
  return ctx.alive();
}

// Positive feedback after a correct answer.
export async function cheer(ctx, node) {
  ctx.sfx.chime();
  ctx.sfx.haptic?.(14);
  if (node) {
    bounce(node);
    sparkleAt(node);
    // a green ring that grows out of the card
    const ring = el('i', { class: 'cheer-ring', 'aria-hidden': 'true' });
    node.append(ring);
    setTimeout(() => ring.remove(), 700);
  }
  await sleep(120);
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

export function miniPic(ctx, word) {
  return el('span', { class: 'mini', html: ctx.picture(word) });
}

// A big number card: the digit in the script(s) of the current language mix.
export function numberCard(ctx, num) {
  const mode = ctx.settings.lang;
  const b = el('button', { class: 'card number', 'aria-label': num.en }, [
    el('span', { class: 'glyph', lang: mode === 'en' ? 'en' : 'hi', text: mode === 'hi' ? num.digitHi : String(num.value) }),
    mode === 'both' ? el('span', { class: 'sub', lang: 'hi', text: num.digitHi }) : null,
  ]);
  b.num = num;
  return b;
}

// Little ones can't read the answers yet: after the question, each answer lights up and is said in turn.
// A tap on any answer stops the reading at once (its own sound plays instead).
export const youngReader = (ctx) => ['toddler', 'kg', 'grade1'].includes(ctx.level?.id);
export async function readChoices(ctx, btns, segsOf) {
  let stop = false;
  const off = () => (stop = true);
  const hintsAtStart = hintCount;
  for (const b of btns) b.addEventListener('pointerdown', off, { once: true });
  try {
    for (const b of btns) {
      if (stop || hintCount !== hintsAtStart || !ctx.alive() || !b.isConnected) break;
      if (b.classList.contains('ruled-out')) continue;
      b.classList.add('reading');
      await ctx.playSegs(segsOf(b));
      b.classList.remove('reading');
      if (!stop) await sleep(120);
    }
  } finally {
    for (const b of btns) b.classList.remove('reading');
  }
}
