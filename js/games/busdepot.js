// Bus depot: first the bus picks up whoever is called (animals and letters),
// then passengers get on and off and the child counts them (1-10, Hindi and English).
import { pickChoices, roundSequence, makeCountTrip, numberChoices, langForRound } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, vehicleEl, flyTo, animate, bounce, miniPic, numberCard } from './kit.js';

export default {
  async start(ctx) {
    const { pickupRounds, countRounds } = ctx.config;
    const total = pickupRounds + countRounds;
    if ((await pickup(ctx, total)) && (await count(ctx, pickupRounds, total))) ctx.complete();
  },
};

function pickup(ctx, total) {
  const n = ctx.config.pickupRounds;
  const animals = ctx.words(ctx.config.passengers);
  const letters = ctx.letters();
  const animalSeq = roundSequence(animals, n, ctx.rng);
  const letterSeq = roundSequence(letters, n, ctx.rng);
  const bus = vehicleEl(ctx, 'bus');
  const riders = el('div', { class: 'riders' });
  const stop = el('div', { class: 'choices' });
  ctx.stage.replaceChildren(el('div', { class: 'scene' }, [bus]), riders, el('div', { class: 'bus-stop' }, [stop]));

  return runRounds(
    ctx,
    n,
    async (i) => {
      const useLetter = i % 2 === 1;
      const target = useLetter ? letterSeq[i] : animalSeq[i];
      const options = useLetter ? pickChoices(letters.filter((l) => l.lang === target.lang), target, 3, ctx.rng) : pickChoices(animals, target, 3, ctx.rng);
      const btns = options.map((o) => Object.assign(useLetter ? ctx.letterCard(o) : ctx.wordCard(o, { showLabel: false }), { item: o }));
      stop.replaceChildren(...btns);
      ctx.sfx.toot();
      await animate(bus, [{ transform: 'translateX(-60vw)' }, { transform: 'translateX(0)' }], { duration: 900, easing: 'ease-out' });
      const prompt = () => ctx.say('pickUp', target);
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.item.id === target.id, { onWrong: (b) => ctx.say('thisIs', b.item) });
      await cheer(ctx, right);
      ctx.sayItem(target);
      await flyTo(right, bus, { scale: 0.3, duration: 700 });
      right.style.visibility = 'hidden';
      riders.append(useLetter ? el('span', { class: 'mini glyph', lang: target.lang, text: target.char }) : miniPic(ctx, target));
      bounce(bus);
      await sleep(900);
      ctx.sfx.vroom();
      await animate(bus, [{ transform: 'translateX(0)' }, { transform: 'translateX(70vw)' }], { duration: 900, easing: 'ease-in' });
    },
    { total },
  );
}

function count(ctx, offset, total) {
  const { countRounds, maxPassengers } = ctx.config;
  const animals = ctx.words(ctx.config.passengers);
  const num = (v) => ctx.numbers[v - 1];
  const onboard = [];
  const bus = vehicleEl(ctx, 'bus');
  const inside = el('div', { class: 'inside', 'aria-label': 'inside the bus' });
  const choices = el('div', { class: 'choices' });
  ctx.stage.replaceChildren(el('div', { class: 'scene' }, [bus]), inside, choices);

  return runRounds(
    ctx,
    countRounds,
    async (i) => {
      const lang = langForRound(ctx.settings.lang, i);
      const trip = makeCountTrip(onboard.length, maxPassengers, ctx.rng);
      choices.replaceChildren();
      ctx.setRepeat(() => ctx.say(trip.op === 'on' ? 'getOn' : 'getOff', null, [lang]));
      await ctx.say(trip.op === 'on' ? 'getOn' : 'getOff', null, [lang]);
      for (let k = 1; k <= trip.amount; k++) {
        if (!ctx.alive()) return;
        if (trip.op === 'on') {
          const a = animals[Math.floor(ctx.rng() * animals.length)];
          const m = miniPic(ctx, a);
          inside.append(m);
          onboard.push(a);
          animate(m, [{ transform: 'translateY(-80px) scale(0.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450 });
        } else {
          const m = inside.lastElementChild;
          onboard.pop();
          await animate(m, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(80px) scale(0.3)', opacity: 0 }], { duration: 450 });
          m.remove();
        }
        ctx.sfx.pop();
        await ctx.sayItem(num(k), [lang]);
      }
      await sleep(300);
      const answer = trip.result;
      const btns = numberChoices(answer, maxPassengers, 3, ctx.rng).map((v) => numberCard(ctx, num(v)));
      choices.replaceChildren(...btns);
      const prompt = () => ctx.say('howMany', null, [lang]);
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.num.value === answer, { onWrong: (b) => ctx.sayItem(b.num, [lang]) });
      await cheer(ctx, right);
      // count everyone on board together
      for (let k = 0; k < onboard.length; k++) {
        if (!ctx.alive()) return;
        bounce(inside.children[k]);
        await ctx.sayItem(num(k + 1), [lang]);
      }
    },
    { offset, total },
  );
}
