// Matra garage (Grade 1+): a consonant "car" gets matra stickers.
// 1. Explore one consonant's barakhadi (क का कि की ...) by tapping the tiles.
// 2. Rounds alternate: "Find की" among syllables of the same consonant, and
//    "add the right matra" to a word with one matra missing (म_र -> मोर).
import { barakhadi, maskMatra, pickChoices, roundSequence, shuffle } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, flyTo, bounce } from './kit.js';

const DOTTED = '◌'; // ◌ : shows a matra sign on its own

export default {
  async start(ctx) {
    const matras = ctx.config.matras.map((id) => ctx.content.matras.find((m) => m.id === id));
    const consonant = ctx.config.consonants[Math.floor(ctx.rng() * ctx.config.consonants.length)];
    const row = barakhadi(consonant, matras);
    const words = ctx.words(ctx.config.words).filter((w) => maskMatra(w, matras));
    const syllable = (text) => ({ id: `syl-${text}`, hi: text, en: text, translit: text });
    const total = ctx.config.rounds + 1;

    // ---- explore ----
    ctx.setProgress(0, total);
    const car = el('div', { class: 'matra-car' }, [el('span', { class: 'pic', html: ctx.vehicleArt('car') }), el('span', { class: 'matra-sticker', lang: 'hi', text: consonant })]);
    const heard = new Set();
    const tiles = row.map((r) => el('button', { class: 'card tile syllable', lang: 'hi', 'aria-label': r.text }, [el('span', { class: 'glyph', text: r.text })]));
    ctx.stage.replaceChildren(el('div', { class: 'scene' }, [car]), el('div', { class: 'choices barakhadi' }, tiles));
    const introduce = () => ctx.sayText(row.map((r) => r.text).join(' '), 'hi');
    ctx.setRepeat(introduce);
    introduce();
    await new Promise((resolve) =>
      tiles.forEach((t, i) =>
        t.addEventListener('click', () => {
          ctx.sfx.pop();
          bounce(t);
          car.querySelector('.matra-sticker').textContent = row[i].text;
          bounce(car);
          ctx.sayText(row[i].text, 'hi');
          heard.add(i);
          t.classList.add('heard');
          if (heard.size >= Math.min(6, row.length)) resolve();
        }),
      ),
    );
    if (!ctx.alive()) return;
    await cheer(ctx, car);
    await sleep(900);

    // ---- quiz ----
    const quizRow = row.filter((r) => r.matra);
    const sounds = roundSequence(quizRow, ctx.config.rounds, ctx.rng);
    const wordSeq = roundSequence(words, ctx.config.rounds, ctx.rng);
    const ok = await runRounds(
      ctx,
      ctx.config.rounds,
      async (i) => {
        if (i % 2 === 0 || !words.length) {
          // which tile says this syllable?
          const target = sounds[i];
          car.querySelector('.matra-sticker').textContent = consonant;
          const options = pickChoices(row, target, 3, ctx.rng);
          const btns = options.map((r) => Object.assign(el('button', { class: 'card tile syllable', lang: 'hi', 'aria-label': r.text }, [el('span', { class: 'glyph', text: r.text })]), { item: r }));
          ctx.stage.replaceChildren(el('div', { class: 'scene' }, [car]), el('div', { class: 'choices' }, btns));
          const prompt = () => ctx.say('find', syllable(target.text), ['hi']);
          ctx.setRepeat(prompt);
          prompt();
          const right = await choose(btns, (b) => b.item.id === target.id, { onWrong: (b) => ctx.sayText(b.item.text, 'hi') });
          await flyTo(right, car.querySelector('.matra-sticker'), { duration: 500, scale: 0.6, keep: false });
          car.querySelector('.matra-sticker').textContent = target.text;
          await cheer(ctx, car);
          await ctx.sayText(target.text, 'hi');
        } else {
          // put the missing matra back into a word
          const w = wordSeq[i];
          const gap = maskMatra(w, matras, ctx.rng);
          const slot = el('span', { class: 'matra-slot', text: DOTTED });
          const shown = el('div', { class: 'gap-word', lang: 'hi' }, [el('span', { text: gap.before + gap.base }), slot, el('span', { text: gap.after })]);
          const pic = el('button', { class: 'prompt-pic', 'aria-label': w.en, html: ctx.picture(w), onclick: () => ctx.sayItem(w, ['hi']) });
          const options = pickChoices(matras, gap.matra, 3, ctx.rng);
          const btns = shuffle(options, ctx.rng).map((m) =>
            Object.assign(el('button', { class: 'card tile sign', lang: 'hi', 'aria-label': m.vowel }, [el('span', { class: 'glyph', text: DOTTED + m.sign })]), { item: m }),
          );
          ctx.stage.replaceChildren(el('div', { class: 'scene' }, [pic]), shown, el('div', { class: 'choices' }, btns));
          const prompt = async () => {
            await ctx.say('fixMatra');
            if (ctx.alive()) ctx.sayItem(w, ['hi']);
          };
          ctx.setRepeat(prompt);
          prompt();
          const right = await choose(btns, (b) => b.item.id === gap.matra.id, { onWrong: (b) => ctx.sayText(gap.base + b.item.sign, 'hi') });
          await flyTo(right, slot, { duration: 500, scale: 0.6, keep: false });
          shown.replaceChildren(el('span', { text: w.hi }));
          shown.classList.add('done');
          await cheer(ctx, shown);
          await ctx.sayItem(w, ['hi']);
        }
        await sleep(300);
      },
      { offset: 1, total },
    );
    if (ok) ctx.complete();
  },
};
