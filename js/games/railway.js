// Railway station: the alphabet train. Each carriage holds the next letter in order.
// Hindi vowels, Hindi consonants and English A-Z are separate trains; each visit continues
// where the last one stopped.
import { createTrain, expectedLetter, addCarriage, trainChoices, nextTrainStart } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, flyTo, animate, bounce } from './kit.js';

export default {
  start(ctx) {
    const sets = ctx.letterSets();
    if (sets.length === 1) return ride(ctx, sets[0]);
    let started = false;
    const btns = sets.map((set) => {
      const b = el('button', { class: 'card train-set', 'aria-label': set.name.en }, [
        el('span', { class: 'pic', html: ctx.vehicleArt('train') }),
        el('span', { class: 'set-preview', lang: set.lang, text: set.letters.slice(0, 3).map((l) => l.char).join(' ') }),
      ]);
      b.addEventListener('click', async () => {
        if (started) return;
        started = true;
        ctx.sfx.toot();
        bounce(b);
        await ctx.sayItem({ ...set.letters[0], lang: set.lang });
        if (ctx.alive()) ride(ctx, set);
      });
      return b;
    });
    ctx.stage.replaceChildren(el('div', { class: 'choices menu' }, btns));
    ctx.setRepeat(() => null);
  },
};

async function ride(ctx, set) {
  const letters = set.letters.map((l) => ({ ...l, lang: set.lang, setId: set.id }));
  const start = ctx.progress.trainPos?.[set.id] ?? 0;
  let train = createTrain(letters, start, ctx.config.carriages);
  const before = start > 0 ? letters[start - 1] : null;

  const engine = el('div', { class: 'engine' }, [
    el('span', { class: 'pic', html: ctx.vehicleArt('train') }),
    before ? el('span', { class: 'engine-letter', lang: set.lang, text: before.char }) : null,
  ]);
  const cars = Array.from({ length: train.length }, () =>
    el('div', { class: 'carriage', lang: set.lang }, [el('span', { class: 'pic', html: ctx.vehicleArt('carriage') }), el('span', { class: 'cargo', text: '?' })]),
  );
  const rail = el('div', { class: 'rail' }, [el('div', { class: 'train' }, [...cars.slice().reverse(), engine])]);
  const choices = el('div', { class: 'choices' });
  ctx.stage.replaceChildren(rail, choices);
  engine.addEventListener('click', () => ctx.sayItem(ctx.word('train')));

  const ok = await runRounds(ctx, train.length, async (i) => {
    const want = expectedLetter(train);
    cars[i].classList.add('next');
    const btns = trainChoices(train, 3, ctx.rng).map((l) => Object.assign(ctx.letterCard(l), { item: l }));
    choices.replaceChildren(...btns);
    const prompt = () => ctx.say('nextLetter', null, [set.lang]);
    ctx.setRepeat(prompt);
    prompt();
    const right = await choose(btns, (b) => b.item.id === want.id, { onWrong: (b) => ctx.say('thisIs', b.item) });
    train = addCarriage(train, right.item).train;
    ctx.sayItem(want);
    await flyTo(right, cars[i], { duration: 600, scale: 0.6 });
    right.style.visibility = 'hidden';
    cars[i].classList.remove('next');
    cars[i].classList.add('full');
    cars[i].querySelector('.cargo').textContent = want.char;
    await cheer(ctx, cars[i]);
  });
  if (!ok) return;

  ctx.saveProgress({ trainPos: { ...ctx.progress.trainPos, [set.id]: nextTrainStart(train) } });
  choices.replaceChildren();
  ctx.sfx.toot();
  for (const [k, car] of cars.entries()) {
    if (!ctx.alive()) return;
    bounce(car);
    await ctx.sayItem(train.filled[k]);
  }
  await animate(rail.firstChild, [{ transform: 'translateX(0)' }, { transform: 'translateX(110vw)' }], { duration: 1800, easing: 'ease-in', fill: 'forwards' });
  await sleep(300);
  ctx.complete();
}
