// Metro station (Grade 1+): hear a sentence, then put its word cards into the metro carriages in order.
import { sentenceTokens, shuffle, roundSequence, langForRound } from '../logic.js';
import { el, sleep, runRounds, cheer, flyTo, animate, wobble } from './kit.js';

const bare = (token) => token.replace(/[।.!?,"]/g, '');

export default {
  async start(ctx) {
    const levels = ctx.config.levels || [ctx.level.id];
    const pool = ctx.content.sentences.filter((s) => levels.includes(s.level));
    const picked = roundSequence(pool, ctx.config.rounds, ctx.rng);

    const ok = await runRounds(ctx, picked.length, async (i) => {
      const sentence = picked[i];
      const lang = langForRound(ctx.settings.lang, i);
      const tokens = sentenceTokens(sentence[lang]);
      const about = sentence.about ? ctx.word(sentence.about) : null;
      const pic = about ? el('button', { class: 'prompt-pic', 'aria-label': about.en, html: ctx.picture(about) }) : null;
      const slots = tokens.map(() => el('div', { class: 'car-slot', lang }));
      const metro = el('div', { class: 'metro-train' }, slots);
      // at the top level one extra word from another sentence sneaks in, so every word must be read
      const decoys = ctx.tier >= 2 ? shuffle(pool.filter((s) => s !== sentence).flatMap((s) => sentenceTokens(s[lang])).filter((t) => !tokens.includes(t)), ctx.rng).slice(0, 1) : [];
      const cards = shuffle([...tokens, ...decoys], ctx.rng).map((t) => Object.assign(el('button', { class: 'card word-chip', lang }, [el('span', { class: 'word-text', text: t })]), { token: t }));
      ctx.stage.replaceChildren(...[pic, el('div', { class: 'metro-track' }, [metro]), el('div', { class: 'choices chips' }, cards)].filter(Boolean));
      if (pic) pic.onclick = () => ctx.saySentence(sentence, [lang]);
      const prompt = async () => {
        await ctx.say('makeSentence', null, [lang]);
        if (ctx.alive()) ctx.saySentence(sentence, [lang]);
      };
      ctx.setRepeat(prompt);
      prompt();

      let next = 0;
      let mistakes = 0;
      slots[0].classList.add('next');
      await new Promise((resolve) => {
        for (const c of cards) {
          c.addEventListener('click', async () => {
            if (c.classList.contains('used') || next >= tokens.length) return;
            ctx.sayText(bare(c.token), lang);
            if (c.token !== tokens[next]) {
              mistakes++;
              ctx.miss();
              return void wobble(c);
            }
            const slot = slots[next++];
            slots[next]?.classList.add('next');
            ctx.sfx.pop();
            await flyTo(c, slot, { duration: 450 });
            c.classList.add('used');
            slot.textContent = c.token;
            slot.classList.remove('next');
            slot.classList.add('filled');
            if (next === tokens.length) resolve();
          });
        }
      });
      ctx.record(null, mistakes === 0);
      await cheer(ctx, metro);
      await ctx.saySentence(sentence, [lang]);
      ctx.sfx.vroom();
      await animate(metro, [{ transform: 'translateX(0)' }, { transform: 'translateX(110vw)' }], { duration: 1200, easing: 'ease-in', fill: 'forwards' });
      await sleep(200);
    });
    if (ok) ctx.complete();
  },
};
