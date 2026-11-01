// Library (Grade 1+): read-along picture stories, then a few picture questions about the story.
// Every word on the page can be tapped to hear it. Each visit opens the next story for the stage.
import { sentenceTokens, shuffle } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, waitTap, bounce, ICONS } from './kit.js';

const bare = (token) => token.replace(/[।.!?,"]/g, '');

export default {
  async start(ctx) {
    const levels = ctx.config.levels || [ctx.level.id];
    const stories = ctx.content.stories.filter((s) => levels.includes(s.level));
    const key = levels.join('+');
    const pos = ctx.progress.storyPos?.[key] ?? 0;
    const story = stories[pos % stories.length];
    ctx.saveProgress({ storyPos: { ...ctx.progress.storyPos, [key]: pos + 1 } });

    const langs = ctx.langs;
    const total = story.pages.length + story.questions.length;
    ctx.setProgress(0, total);
    const lines = (text) => langs.map((l) => ({ text: text[l], lang: l }));
    const pageSegs = (page, n) => langs.flatMap((l, i) => [...(i ? [{ pause: 400 }] : []), { text: page[l], lang: l, clipKey: `story-${story.id}-${n}_${l}` }]);

    // ---- cover ----
    const coverWord = ctx.word(story.cover);
    const play = el('button', { class: 'round-btn big go', 'aria-label': 'Start', html: ICONS.play });
    ctx.stage.replaceChildren(
      el('div', { class: 'story-cover' }, [
        el('div', { class: 'pic', html: ctx.picture(coverWord) }),
        ...lines(story.title).map((t) => el('div', { class: `story-title ${t.lang}`, lang: t.lang, text: t.text })),
      ]),
      play,
    );
    const intro = async () => {
      await ctx.say('listenStory');
      if (ctx.alive()) ctx.playSegs(langs.map((l) => ({ text: story.title[l], lang: l })));
    };
    ctx.setRepeat(intro);
    intro();
    await waitTap(play);

    // ---- pages ----
    for (const [i, page] of story.pages.entries()) {
      if (!ctx.alive()) return;
      const n = i + 1;
      const textLines = langs.map((l) =>
        el(
          'p',
          { class: `story-line ${l}`, lang: l },
          sentenceTokens(page[l]).map((t) => {
            const w = el('button', { class: 'story-word', text: t });
            w.addEventListener('click', () => {
              bounce(w);
              ctx.sayText(bare(t), l);
            });
            return w;
          }),
        ),
      );
      const next = el('button', { class: 'round-btn big go next-page', 'aria-label': 'Next', html: ICONS.next });
      const card = el('div', { class: 'story-page' }, [el('div', { class: 'pic', html: ctx.picture(ctx.word(page.word)) }), ...textLines]);
      ctx.stage.replaceChildren(card, next);
      const read = async () => {
        card.classList.add('reading');
        await ctx.playSegs(pageSegs(page, n));
        card.classList.remove('reading');
        next.classList.add('ready');
      };
      ctx.setRepeat(read);
      read();
      await waitTap(next);
      ctx.sfx.pop();
      ctx.setProgress(n, total);
    }

    // ---- questions ----
    const ok = await runRounds(
      ctx,
      story.questions.length,
      async (i) => {
        const q = story.questions[i];
        const btns = shuffle(q.options, ctx.rng).map((id) => Object.assign(ctx.wordCard(ctx.word(id)), { item: ctx.word(id) }));
        ctx.stage.replaceChildren(
          el('div', { class: 'story-question' }, lines(q).map((t) => el('p', { class: `story-line ${t.lang}`, lang: t.lang, text: t.text }))),
          el('div', { class: 'choices' }, btns),
        );
        const ask = () => ctx.playSegs(langs.flatMap((l, k) => [...(k ? [{ pause: 400 }] : []), { text: q[l], lang: l }]));
        ctx.setRepeat(ask);
        ask();
        const right = await choose(btns, (b) => b.item.id === q.answer, { ctx, onWrong: (b) => ctx.say('thisIs', b.item) });
        await cheer(ctx, right);
        await ctx.sayItem(right.item);
        await sleep(300);
      },
      { offset: story.pages.length, total },
    );
    if (ok) ctx.complete();
  },
};
