// Airport and harbour: opposites with planes, helicopters and boats.
// Two pictures show the same vehicle big/small, up/down or fast/slow; tap the one that is asked for.
import { makeOppositeRound } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, bounce } from './kit.js';

export default {
  async start(ctx) {
    const { rounds, pairs } = ctx.config;
    const panels = el('div', { class: 'choices opposites' });
    ctx.stage.replaceChildren(panels);
    let previous = null;

    const ok = await runRounds(ctx, rounds, async () => {
      const round = makeOppositeRound(pairs, ctx.rng, previous);
      previous = round;
      const { pair } = round;
      const btns = round.order.map((side) => {
        const w = ctx.word(pair[side]);
        const b = el('button', { class: `opp-panel ${pair.kind} side-${side}`, 'aria-label': w.en }, [
          el('div', { class: 'opp-vehicle', html: ctx.vehicleArt(pair.vehicle) }),
        ]);
        b.side = side;
        b.word = w;
        return b;
      });
      panels.replaceChildren(...btns);
      const target = ctx.word(pair[round.target]);
      const prompt = () => ctx.say('whichIs', target);
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.side === round.target, { onWrong: (b) => ctx.say('thisIs', b.word) });
      await cheer(ctx, right);
      await ctx.sayItem(target);
      // then the other one, so the pair is heard together
      const other = btns.find((b) => b !== right);
      bounce(other);
      await ctx.sayItem(other.word);
      await sleep(400);
    });
    if (ok) ctx.complete();
  },
};
