// Construction site: dig up letters (digger), deliver blocks to the matching sound (dump truck),
// build words with the crane. The cement mixer and bulldozer just play when tapped.
import { pickChoices, sample, splitTiles, createBuild, placeTile, tileChoices, langForRound } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, vehicleEl, activityMenu, flyTo, animate, bounce, wobble, ICONS } from './kit.js';

const MOUND =
  '<svg viewBox="0 0 120 80" aria-hidden="true"><ellipse cx="60" cy="76" rx="54" ry="4" fill="#1E1B4B" opacity="0.08"/><path d="M6 76 Q60 -12 114 76 Z" fill="#B9876B"/><path d="M6 76 Q60 -12 114 76 Q70 40 6 76 Z" fill="#A47864"/><circle cx="44" cy="54" r="5" fill="#8A5A44"/><circle cx="74" cy="42" r="4" fill="#8A5A44"/><circle cx="86" cy="62" r="6" fill="#8A5A44"/></svg>';

export default {
  start(ctx) {
    const W = ctx.word;
    const on = new Set(ctx.config.activities || ['dig', 'deliver', 'build']);
    if (!ctx.letters().length) on.delete('deliver');
    // a lesson with one activity starts it straight away
    if (on.size === 1) {
      const only = [...on][0];
      return void { dig, deliver, build }[only](ctx);
    }
    activityMenu(ctx, [
      on.has('dig') && { word: W('digger'), go: () => dig(ctx) },
      on.has('deliver') && { word: W('dumptruck'), go: () => deliver(ctx) },
      on.has('build') && { word: W('crane'), go: () => build(ctx) },
      {
        word: W('mixer'),
        play: (b) =>
          animate(b.querySelector('.pic'), [{ transform: 'rotate(0)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0)' }], {
            duration: 300,
            iterations: 4,
          }),
      },
      {
        word: W('bulldozer'),
        play: (b) => {
          ctx.sfx.vroom();
          animate(b.querySelector('.pic'), [{ transform: 'translateX(0)' }, { transform: 'translateX(25%)' }, { transform: 'translateX(0)' }], { duration: 1000 });
        },
      },
    ].filter(Boolean));
  },
};

// Digger: tap each pile of dirt to dig up a letter (or, for toddlers, a picture). Every tap is a success.
async function dig(ctx) {
  const n = ctx.config.digLetters;
  const letterPool = ctx.letters();
  const letters = letterPool.length ? sample(letterPool, n, ctx.rng) : sample(ctx.words(ctx.config.digWords), n, ctx.rng);
  const digger = vehicleEl(ctx, 'digger');
  const mounds = letters.map(() => el('button', { class: 'mound', 'aria-label': 'dirt', html: MOUND }));
  ctx.stage.replaceChildren(el('div', { class: 'scene' }, [digger]), el('div', { class: 'choices mounds' }, mounds));
  ctx.setProgress(0, n);
  ctx.setRepeat(() => ctx.say('dig'));
  ctx.say('dig');

  let dug = 0;
  await new Promise((resolve) =>
    mounds.forEach((m, i) =>
      m.addEventListener('click', async () => {
        const letter = letters[i];
        const isLetter = typeof letter.char === 'string';
        const sayIt = () => (isLetter ? ctx.sayLetterWithWord(letter) : ctx.sayItem(letter));
        if (m.dataset.dug) {
          bounce(m);
          sayIt();
          return;
        }
        m.dataset.dug = '1';
        ctx.sfx.thud();
        animate(digger, [{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0)' }], { duration: 350 });
        await animate(m, [{ transform: 'scale(1)' }, { transform: 'scaleY(0.2)', opacity: 0.2 }], { duration: 300 });
        if (isLetter) {
          const ex = letter.word ? ctx.word(letter.word) : null;
          m.replaceChildren(
            el('span', { class: 'glyph', lang: letter.lang, text: letter.char }),
            ex ? el('span', { class: 'mini-pic', html: ctx.picture(ex) }) : '',
          );
        } else m.replaceChildren(el('span', { class: 'mini-pic big', html: ctx.picture(letter) }));
        m.classList.add('dug');
        ctx.sfx.chime();
        bounce(m);
        sayIt();
        ctx.setProgress(++dug, n);
        if (dug === n) resolve();
      }),
    ),
  );
  await sleep(2500);
  ctx.complete();
}

// Dump truck: hear a letter, tap the block that matches it, the truck carries it away.
async function deliver(ctx) {
  const pool = ctx.letters();
  const targets = ctx.practice(pool, ctx.config.deliverRounds);
  const truck = vehicleEl(ctx, 'dumptruck');
  const sign = el('button', { class: 'round-btn big sound-sign', 'aria-label': 'Listen', html: ICONS.speaker });
  const blocks = el('div', { class: 'choices' });
  ctx.stage.replaceChildren(el('div', { class: 'scene' }, [truck, sign]), blocks);

  const ok = await runRounds(ctx, targets.length, async (i) => {
    const target = targets[i];
    const same = pool.filter((l) => l.lang === target.lang);
    const btns = pickChoices(same, target, 3, ctx.rng).map((l) => Object.assign(ctx.letterCard(l, { cls: 'block' }), { letter: l }));
    blocks.replaceChildren(...btns);
    const prompt = () => ctx.say('deliver', target);
    ctx.setRepeat(prompt);
    sign.onclick = prompt;
    prompt();
    const right = await choose(btns, (b) => b.letter.id === target.id, { ctx, onWrong: (b) => ctx.say('thisIs', b.letter) });
    await cheer(ctx, right);
    ctx.sayLetterWithWord(target);
    await flyTo(right, truck, { scale: 0.4, duration: 600 });
    right.style.visibility = 'hidden';
    ctx.sfx.vroom();
    await animate(truck, [{ transform: 'translateX(0)' }, { transform: 'translateX(35vw)' }, { transform: 'translateX(0)' }], { duration: 1500 });
  });
  if (ok) ctx.complete();
}

// Crane: lift letter tiles into the slots to build a word (बस, कार, BUS, CAR ...).
async function build(ctx) {
  const pool = ctx.words(ctx.config.buildWords);
  // short words only: at most 4 tiles, and English words without spaces
  const fits = (w, lang) => splitTiles(w, lang).length <= 4 && (lang === 'hi' || /^[a-z]+$/i.test(w.en));
  const words = [];
  for (let i = 0; i < ctx.config.buildRounds; i++) {
    const lang = langForRound(ctx.settings.lang, i);
    const options = pool.filter((w) => fits(w, lang) && !words.includes(w));
    if (options.length) words.push(options[Math.floor(ctx.rng() * options.length)]);
  }
  const charsOf = (lang) => ctx.content.letterSets.filter((s) => s.lang === lang).flatMap((s) => s.letters.map((l) => l.char.toUpperCase()));

  const ok = await runRounds(ctx, words.length, async (i) => {
    const w = words[i];
    const lang = langForRound(ctx.settings.lang, i);
    const tiles = splitTiles(w, lang);
    let state = createBuild(tiles);

    const crane = vehicleEl(ctx, 'crane');
    const pic = el('button', { class: 'prompt-pic', 'aria-label': w.en, html: ctx.picture(w) });
    const slots = tiles.map((t) => el('div', { class: 'slot', lang }, [el('span', { class: 'ghost', text: t })]));
    const ground = tileChoices(tiles, charsOf(lang), 2, ctx.rng).map((t) =>
      Object.assign(el('button', { class: 'card tile', lang, 'aria-label': t }, [el('span', { class: 'glyph', text: t })]), { tile: t }),
    );
    ctx.stage.replaceChildren(
      el('div', { class: 'scene' }, [crane, pic]),
      el('div', { class: 'slots' }, slots),
      el('div', { class: 'choices' }, ground),
    );
    slots[0].classList.add('next');
    const prompt = () => ctx.say('build', w, [lang]);
    pic.onclick = () => ctx.sayItem(w, [lang]);
    ctx.setRepeat(prompt);
    prompt();

    await new Promise((resolve) => {
      for (const b of ground) {
        b.addEventListener('click', async () => {
          if (state.done || b.classList.contains('used')) return;
          const r = placeTile(state, b.tile);
          ctx.sayText(b.tile, lang);
          if (!r.ok) return void wobble(b);
          state = r.state;
          const slot = slots[state.placed - 1];
          b.classList.add('lifting');
          ctx.sfx.pop();
          await flyTo(b, slot, { duration: 600 });
          b.classList.add('used');
          slot.replaceChildren(el('span', { class: 'glyph', text: b.tile }));
          slot.classList.remove('next');
          slot.classList.add('filled');
          slots[state.placed]?.classList.add('next');
          if (state.done) resolve();
        });
      }
    });
    await sleep(400);
    await cheer(ctx, pic);
    await ctx.sayItem(w, [lang]);
    await sleep(400);
  });
  if (ok) ctx.complete();
}
