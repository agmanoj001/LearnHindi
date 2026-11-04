// Parking (Grade 2+): park each car next to its partner word.
// opposite: बड़ा -> छोटा · plural: केला -> केले · female: शेर -> शेरनी
import { makePairRound } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, flyTo } from './kit.js';

const PROMPT = { opposite: 'oppositeOf', plural: 'pluralOf', female: 'femaleOf' };

export default {
  async start(ctx) {
    const kinds = ctx.config.kinds;
    const ok = await runRounds(ctx, ctx.config.rounds, async () => {
      const round = makePairRound(ctx.config.sets, kinds, ctx.rng, ctx.nChoices);
      const from = ctx.word(round.from);
      const parked = ctx.wordCard(from);
      const space = el('div', { class: 'parking-space' });
      const lot = el('div', { class: 'parking-lot' }, [el('div', { class: 'parking-space filled' }, [parked]), space]);
      const btns = round.options.map((id) => Object.assign(ctx.wordCard(ctx.word(id)), { item: ctx.word(id) }));
      ctx.stage.replaceChildren(lot, el('div', { class: 'choices' }, btns));
      const prompt = () => ctx.say(PROMPT[round.kind], from);
      parked.onclick = () => ctx.sayItem(from);
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.item.id === round.to, { ctx, onWrong: (b) => ctx.say('thisIs', b.item) });
      ctx.sfx.vroom();
      await flyTo(right, space, { duration: 650 });
      right.classList.add('used');
      space.replaceChildren(ctx.wordCard(right.item));
      space.classList.add('filled');
      await cheer(ctx, space);
      await ctx.sayItem(from);
      await ctx.sayItem(right.item);
      await sleep(300);
    });
    if (ok) ctx.complete();
  },
};
