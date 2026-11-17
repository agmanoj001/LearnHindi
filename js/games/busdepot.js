// Bus depot: first the bus picks up whoever is called (animals and letters),
// then passengers get on and off and the child counts them (1-10, Hindi and English).
import { pickChoices, makeCountTrip, numberChoices, langForRound } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, vehicleEl, flyTo, animate, bounce, miniPic, numberCard } from './kit.js';

export default {
  async start(ctx) {
    // "parts" picks the bus ride, the counting or both
    const parts = ctx.config.parts || ['pickup', 'count'];
    const pickupRounds = parts.includes('pickup') ? ctx.config.pickupRounds : 0;
    const countRounds = parts.includes('count') ? ctx.config.countRounds : 0;
    const total = pickupRounds + countRounds;
    if (pickupRounds && !(await pickup(ctx, total))) return;
    if (countRounds && !(await count(ctx, pickupRounds, total))) return;
    ctx.complete();
  },
};

function pickup(ctx, total) {
  const n = ctx.config.pickupRounds;
  const animals = ctx.words(ctx.config.passengers);
  const letters = ctx.letters();
  const animalSeq = ctx.practice(animals, n);
  const letterSeq = ctx.practice(letters, n);
  const bus = vehicleEl(ctx, 'bus');
  const riders = el('div', { class: 'riders' });
  const stop = el('div', { class: 'choices' });
  ctx.stage.replaceChildren(el('div', { class: 'scene' }, [bus]), riders, el('div', { class: 'bus-stop' }, [stop]));

  return runRounds(
    ctx,
    n,
    async (i) => {
      const useLetter = i % 2 === 1 && ctx.config.letters !== false && letters.length >= 3;
      const target = useLetter ? letterSeq[i] : animalSeq[i];
      const options = useLetter ? pickChoices(letters.filter((l) => l.lang === target.lang), target, ctx.nChoices, ctx.rng) : pickChoices(animals, target, ctx.nChoices, ctx.rng);
      const btns = options.map((o) => Object.assign(useLetter ? ctx.letterCard(o) : ctx.wordCard(o, { showLabel: false }), { item: o }));
      stop.replaceChildren(...btns);
      ctx.sfx.toot();
      await animate(bus, [{ transform: 'translateX(-60vw)' }, { transform: 'translateX(0)' }], { duration: 900, easing: 'ease-out' });
      const prompt = () => ctx.say('pickUp', target);
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.item.id === target.id, { ctx, onWrong: (b) => ctx.say('thisIs', b.item) });
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

// Counting on the bus (docs/ROADMAP.md 4.3): the animals are big, and each one hops and wears its number
// as it is counted, so a child can count along at a glance.
export const countLabel = (num, lang) => (lang === 'hi' ? num.digitHi || String(num.value) : String(num.value));
function hop(m) {
  return m.animate?.([{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-26%) scale(1.15)' }, { transform: 'translateY(0) scale(0.96)' }, { transform: 'translateY(0) scale(1)' }], { duration: 480, easing: 'ease-out' });
}
function tag(m, text) {
  m.querySelector('.count-tag')?.remove();
  m.append(el('b', { class: 'count-tag', 'aria-hidden': 'true', text }));
  m.classList.add('counted');
  hop(m);
}
// seats per row for n passengers: as big as the bus allows, in up to three rows
export const busSeats = (n) => {
  const cols = n <= 4 ? Math.max(2, n) : n <= 6 ? 3 : 4;
  return { cols, rows: Math.max(1, Math.ceil(n / cols)) };
};
const fit = (inside) => {
  const { cols, rows } = busSeats(inside.children.length);
  inside.style.setProperty('--seats', String(cols));
  inside.style.setProperty('--rows', String(rows));
};
const untag = (inside) => {
  for (const m of inside.children) {
    m.classList.remove('counted');
    m.querySelector('.count-tag')?.remove();
  }
};

function count(ctx, offset, total) {
  const { countRounds, maxPassengers } = ctx.config;
  const animals = ctx.words(ctx.config.passengers);
  const num = (v) => ctx.numbers[v - 1];
  const onboard = [];
  const bus = vehicleEl(ctx, 'bus');
  const inside = el('div', { class: 'inside count-bus', 'aria-label': 'inside the bus' });
  fit(inside);
  const choices = el('div', { class: 'choices' });
  ctx.stage.replaceChildren(el('div', { class: 'scene' }, [bus]), inside, choices);

  return runRounds(
    ctx,
    countRounds,
    async (i) => {
      const lang = langForRound(ctx.settings.lang, i);
      // bigger jumps on and off the bus as the level goes up
      const trip = makeCountTrip(onboard.length, maxPassengers, ctx.rng, [2, 3, 4][ctx.tier]);
      choices.replaceChildren();
      untag(inside);
      ctx.setRepeat(() => ctx.say(trip.op === 'on' ? 'getOn' : 'getOff', null, [lang]));
      await ctx.say(trip.op === 'on' ? 'getOn' : 'getOff', null, [lang]);
      for (let k = 1; k <= trip.amount; k++) {
        if (!ctx.alive()) return;
        if (trip.op === 'on') {
          const a = animals[Math.floor(ctx.rng() * animals.length)];
          const m = miniPic(ctx, a);
          inside.append(m);
          onboard.push(a);
          fit(inside);
          await animate(m, [{ transform: 'translateY(-80px) scale(0.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450 });
          tag(m, countLabel(num(k), lang));
          ctx.sfx.pop();
          await ctx.sayItem(num(k), [lang]);
        } else {
          // the one getting off wears its number, then hops out
          const m = [...inside.children].reverse().find((x) => !x.classList.contains('counted'));
          tag(m, countLabel(num(k), lang));
          ctx.sfx.pop();
          await ctx.sayItem(num(k), [lang]);
          onboard.pop();
          await animate(m, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(80px) scale(0.3)', opacity: 0 }], { duration: 450 });
          m.remove();
          fit(inside);
        }
      }
      await sleep(300);
      const answer = trip.result;
      const btns = numberChoices(answer, maxPassengers, Math.max(3, ctx.nChoices), ctx.rng).map((v) => numberCard(ctx, num(v)));
      choices.replaceChildren(...btns);
      const prompt = () => ctx.say('howMany', null, [lang]);
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.num.value === answer, { ctx, onWrong: (b) => ctx.sayItem(b.num, [lang]) });
      await cheer(ctx, right);
      // count everyone on board together, each one hopping with its number
      untag(inside);
      for (let k = 0; k < onboard.length; k++) {
        if (!ctx.alive()) return;
        tag(inside.children[k], countLabel(num(k + 1), lang));
        await ctx.sayItem(num(k + 1), [lang]);
      }
    },
    { offset, total },
  );
}
