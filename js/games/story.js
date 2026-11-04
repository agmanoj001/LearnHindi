// Library (Grade 1+): read-along picture stories, a few questions about the story and, for folktales, the moral.
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
    // a lesson (or the library) can name the story; otherwise each visit opens the next one
    const story = ctx.config.story ? ctx.content.stories.find((s) => s.id === ctx.config.story) : stories[pos % stories.length];
    if (!ctx.config.story) ctx.saveProgress({ storyPos: { ...ctx.progress.storyPos, [key]: pos + 1 } });

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
        // picture questions show word cards; "text" questions (Grade 2+) show short Hindi answer bubbles.
        // Easier tiers drop some wrong options, always keeping the answer and at least one other.
        const wrong = shuffle(q.options.filter((o) => o !== q.answer), ctx.rng).slice(0, Math.max(1, ctx.nChoices - 1));
        const options = shuffle([q.answer, ...wrong], ctx.rng);
        const btns = options.map((o) =>
          q.text
            ? Object.assign(el('button', { class: 'card answer', lang: 'hi' }, [el('span', { class: 'word-text', text: o })]), { value: o })
            : Object.assign(ctx.wordCard(ctx.word(o)), { item: ctx.word(o), value: o }),
        );
        ctx.stage.replaceChildren(
          el('div', { class: 'story-question' }, lines(q).map((t) => el('p', { class: `story-line ${t.lang}`, lang: t.lang, text: t.text }))),
          el('div', { class: `choices${q.text ? ' answers' : ''}` }, btns),
        );
        const ask = () => ctx.playSegs(langs.flatMap((l, k) => [...(k ? [{ pause: 400 }] : []), { text: q[l], lang: l }]));
        ctx.setRepeat(ask);
        ask();
        const right = await choose(btns, (b) => b.value === q.answer, {
          ctx,
          onWrong: (b) => (q.text ? ctx.sayText(b.value, 'hi') : ctx.say('thisIs', b.item)),
        });
        await cheer(ctx, right);
        if (q.text) await ctx.sayText(q.answer, 'hi');
        else await ctx.sayItem(right.item);
        await sleep(300);
      },
      { offset: story.pages.length, total },
    );
    if (!ok) return;

    // ---- the moral (सीख), for folktales that have one ----
    if (story.moral) {
      const done = el('button', { class: 'round-btn big go', 'aria-label': 'Done', html: ICONS.check });
      const card = el('div', { class: 'story-moral' }, [
        el('div', { class: 'moral-badge', html: ICONS.sparkle }),
        el('div', { class: 'moral-head' }, [el('span', { class: 'hi', lang: 'hi', text: 'सीख' }), el('span', { class: 'en', text: 'The lesson' })]),
        ...lines(story.moral).map((t) => el('p', { class: `story-line ${t.lang}`, lang: t.lang, text: t.text })),
      ]);
      ctx.stage.replaceChildren(card, done);
      ctx.sfx.sparkle();
      const read = async () => {
        await ctx.playSegs(langs.flatMap((l, k) => [...(k ? [{ pause: 400 }] : []), { text: story.moral[l], lang: l, clipKey: `story-${story.id}-moral_${l}` }]));
        done.classList.add('ready');
      };
      ctx.setRepeat(read);
      read();
      await waitTap(done);
      if (!ctx.alive()) return;
    }
    ctx.complete();
  },
};
