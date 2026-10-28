// Farm: the tractor visits the animals. Rounds alternate between
// "Where is the cow?" (name) and "Who says moo?" (sound), always in both languages if chosen.
import { pickChoices, roundSequence } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, vehicleEl, flyTo } from './kit.js';

export default {
  async start(ctx) {
    const rounds = ctx.config.rounds;
    const animals = ctx.words(ctx.config.animals);
    const seq = roundSequence(animals, rounds, ctx.rng);
    const tractor = vehicleEl(ctx, 'tractor', 'rescuer');
    const field = el('div', { class: 'choices field' });
    ctx.stage.replaceChildren(field, el('div', { class: 'scene farm-road' }, [tractor]));
    tractor.addEventListener('click', () => ctx.sayItem(ctx.word('tractor')));

    const ok = await runRounds(ctx, rounds, async (i) => {
      const target = seq[i];
      const bySound = i % 2 === 1;
      const btns = pickChoices(animals, target, 3, ctx.rng).map((a) => Object.assign(ctx.wordCard(a, { showLabel: false, cls: 'animal' }), { item: a }));
      field.replaceChildren(...btns);
      // The sound is spoken like a word, so a family recording named e.g. "cow-sound_hi" is used if present.
      const sound = { id: `${target.id}-sound`, hi: target.sound.hi, en: target.sound.en };
      const prompt = () => (bySound ? ctx.say('whoSays', sound) : ctx.say('whereIs', target));
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.item.id === target.id, { onWrong: (b) => ctx.saySound(b.item) });
      ctx.sfx.vroom();
      await flyTo(tractor, right, { duration: 900, scale: 0.6, keep: false });
      await cheer(ctx, right);
      await ctx.saySound(target);
      await sleep(400);
    });
    if (ok) ctx.complete();
  },
};
