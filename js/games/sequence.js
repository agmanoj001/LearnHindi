// Story order (Grades 1–4): pictures from a story, shuffled; tap them in the order things happened.
// Retelling in sequence is a core comprehension skill (beginning, middle, end). Each card is read
// aloud as it goes into place. Harder levels use more of the story's pages.
import { shuffle } from '../logic.js';
import { storyLang, worldStoryLang } from '../curriculum.js';
import { el, sleep, runRounds, cheer, flyTo, animate, wobble, bounce } from './kit.js';

export default {
  async start(ctx) {
    const levels = ctx.config.levels || [ctx.level.id];
    const pool = ctx.config.story ? ctx.content.stories.filter((s) => s.id === ctx.config.story) : shuffle(ctx.content.stories.filter((s) => levels.includes(s.level) && s.pages.length >= 3 && storyLang(s) === worldStoryLang(ctx.world)), ctx.rng);
    const rounds = Math.min(ctx.config.rounds || 2, pool.length * (ctx.config.story ? 2 : 1));
    const lang = ctx.settings.lang === 'en' || worldStoryLang(ctx.world) === 'en' ? 'en' : 'hi';

    const ok = await runRounds(ctx, rounds, async (i) => {
      const story = pool[i % pool.length];
      // 3, 4 or 5 pages spread across the story, always with the first and the last
      const k = Math.min(story.pages.length, [3, 4, 5][ctx.tier]);
      const idx = [...new Set(Array.from({ length: k }, (_, j) => Math.round((j * (story.pages.length - 1)) / (k - 1))))];
      const pages = idx.map((p) => ({ ...story.pages[p], n: p }));
      const slots = pages.map((_, j) => el('div', { class: 'seq-slot', text: String(j + 1) }));
      const cards = shuffle(pages, ctx.rng).map((p) =>
        Object.assign(
          el('button', { class: 'card seq-card', lang, 'aria-label': p[lang] }, [el('span', { class: 'pic', html: ctx.picture(ctx.word(p.word)) }), el('span', { class: 'seq-text', text: p[lang] })]),
          { page: p },
        ),
      );
      ctx.stage.replaceChildren(
        el('div', { class: 'seq-title' }, [el('b', { lang: 'hi', text: story.title.hi }), el('span', { text: story.title.en })]),
        el('div', { class: 'seq-slots' }, slots),
        el('div', { class: 'choices seq-cards' }, cards),
      );
      const prompt = () => ctx.sayLines({ hi: `"${story.title.hi}" कहानी में पहले क्या हुआ, फिर क्या? सही क्रम में लगाओ।`, en: `What happened first in "${story.title.en}", and then? Put the pictures in order.` });
      ctx.setRepeat(prompt);
      prompt();

      let next = 0;
      let mistakes = 0;
      slots[0].classList.add('next');
      await new Promise((resolve) => {
        for (const c of cards) {
          c.addEventListener('click', async () => {
            if (c.classList.contains('used') || next >= pages.length) return;
            if (c.page.n !== pages[next].n) {
              mistakes++;
              ctx.miss();
              wobble(c);
              ctx.sayText(c.page[lang], lang);
              return;
            }
            const slot = slots[next++];
            slots[next]?.classList.add('next');
            ctx.sfx.pop();
            ctx.sayText(c.page[lang], lang);
            await flyTo(c, slot, { duration: 450, scale: 0.6 });
            c.classList.add('used');
            slot.classList.remove('next');
            slot.classList.add('filled');
            slot.replaceChildren(el('span', { class: 'pic', html: ctx.picture(ctx.word(c.page.word)) }), el('span', { class: 'seq-n', text: String(next) }));
            animate(slot, [{ transform: 'scale(0.8)' }, { transform: 'none' }], { duration: 250 });
            if (next === pages.length) resolve();
          });
        }
      });
      ctx.record(null, mistakes === 0);
      await cheer(ctx, slots[slots.length - 1]);
      slots.forEach((s, j) => setTimeout(() => bounce(s), j * 120));
      await ctx.sayLines({ hi: 'शाबाश! पहले, फिर, और आख़िर में।', en: 'Well done! First, then, and at the end.' });
      await sleep(300);
    });
    if (ok) ctx.complete();
  },
};
