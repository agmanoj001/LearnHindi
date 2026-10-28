// Rescue (fire station, police station, hospital): the siren calls out a letter or word;
// tap the window that has it and the place's vehicle races over to help.
import { pickChoices, roundSequence } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, vehicleEl, flyTo, animate } from './kit.js';

export default {
  async start(ctx) {
    const rounds = ctx.config.rounds;
    const letters = ctx.letters();
    const words = ctx.words(ctx.config.words);
    const letterSeq = roundSequence(letters, rounds, ctx.rng);
    const wordSeq = roundSequence(words, rounds, ctx.rng);
    const vehicleId = ctx.options.vehicle;
    const vehicle = vehicleEl(ctx, vehicleId, 'rescuer');
    const windows = el('div', { class: 'windows' });
    const building = el('div', { class: 'building' }, [el('div', { class: 'roof' }), windows]);
    ctx.stage.replaceChildren(building, el('div', { class: 'scene street' }, [vehicle]));
    vehicle.addEventListener('click', () => ctx.sayItem(ctx.word(vehicleId)));

    const ok = await runRounds(ctx, rounds, async (i) => {
      const useLetter = i % 2 === 0;
      const target = useLetter ? letterSeq[i] : wordSeq[i];
      const options = useLetter ? pickChoices(letters.filter((l) => l.lang === target.lang), target, 3, ctx.rng) : pickChoices(words, target, 3, ctx.rng);
      const btns = options.map((o) =>
        Object.assign(useLetter ? ctx.letterCard(o, { cls: 'window' }) : ctx.wordCard(o, { showLabel: false, cls: 'window' }), { item: o }),
      );
      windows.replaceChildren(...btns);
      const prompt = async () => {
        ctx.sfx.siren();
        await sleep(1300);
        if (ctx.alive()) ctx.say('rescue', target);
      };
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.item.id === target.id, { onWrong: (b) => ctx.say('thisIs', b.item) });
      ctx.sfx.siren();
      await flyTo(vehicle, right, { duration: 900, scale: 0.7, keep: false });
      right.classList.add('done');
      await cheer(ctx, right);
      ctx.sayItem(target);
      await animate(vehicle, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 400 });
      await sleep(1200);
    });
    if (ok) ctx.complete();
  },
};
