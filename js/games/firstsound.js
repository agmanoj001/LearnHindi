// First sounds (KG): hear a letter, pick the picture whose word starts with it (क → कार).
// Phonemic awareness: linking a sound to the start of real words, before reading them.
import { pickChoices, shuffle } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, bounce } from './kit.js';

const startsWith = (w, letter) => (letter.lang === 'en' ? w.en.toUpperCase().startsWith(letter.char.toUpperCase()) : w.hi.startsWith(letter.char));

export default {
  async start(ctx) {
    const pool = ctx.words(ctx.config.words).filter((w) => !w.hi.includes(' ') && !w.en.includes(' '));
    // only letters that start at least one word, and leave enough words that don't
    const letters = ctx.letters().filter((l) => pool.some((w) => startsWith(w, l)) && pool.filter((w) => !startsWith(w, l)).length >= 3);
    const seq = ctx.practice(letters, ctx.config.rounds);
    const n = Math.max(2, ctx.nChoices);

    const ok = await runRounds(ctx, seq.length, async (i) => {
      const letter = seq[i];
      const answer = shuffle(pool.filter((w) => startsWith(w, letter)), ctx.rng)[0];
      // distractors start with different letters from the answer and from each other
      const used = new Set([letter.lang === 'en' ? answer.en[0].toUpperCase() : answer.hi[0]]);
      const others = [];
      for (const w of shuffle(pool, ctx.rng)) {
        const first = letter.lang === 'en' ? w.en[0].toUpperCase() : w.hi[0];
        if (used.has(first) || startsWith(w, letter)) continue;
        used.add(first);
        others.push(w);
        if (others.length >= n - 1) break;
      }
      const options = pickChoices([answer, ...others], answer, n, ctx.rng);
      const tile = el('button', { class: 'card letter big-letter', lang: letter.lang, 'aria-label': letter.translit }, [el('span', { class: 'glyph', text: letter.char })]);
      const btns = options.map((w) => Object.assign(ctx.wordCard(w, { showLabel: false }), { item: w }));
      ctx.stage.replaceChildren(el('div', { class: 'scene' }, [tile]), el('div', { class: 'choices' }, btns));
      tile.onclick = () => {
        bounce(tile);
        ctx.sayItem(letter);
      };
      const prompt = () => ctx.say('startsWith', letter);
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.item.id === answer.id, { onWrong: (b) => ctx.sayItem(b.item, [letter.lang]) });
      // the skill here is the letter's sound, so that is what the parent's view tracks
      ctx.record(letter, right.firstTry);
      await cheer(ctx, right);
      await ctx.playSegs([{ text: letter.say || letter.char, lang: letter.lang, clipKey: letter.id }, { pause: 250 }, { text: letter.lang === 'en' ? answer.en : answer.hi, lang: letter.lang, clipKey: `${answer.id}_${letter.lang}` }]);
      await sleep(250);
    });
    if (ok) ctx.complete();
  },
};
