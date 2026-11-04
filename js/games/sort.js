// Sort (Grade 2+): one word at a time, tap the box it belongs in.
// e.g. naming words vs action words (संज्ञा / क्रिया), र् vs ्र, describing words vs naming words.
// Definitions live in content.json "sorts"; a lesson names one with { "sort": "g3-nouns" }.
import { sample } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, flyTo, animate } from './kit.js';

const COLORS = ['#3D7BFF', '#FF7A59', '#2EC27E', '#A66BFF'];

export default {
  async start(ctx) {
    const def = ctx.content.sorts[ctx.config.sort];
    const items = sample(def.items, Math.min(ctx.config.rounds || 8, def.items.length), ctx.rng);
    const counts = new Map(def.bins.map((b) => [b.id, 0]));
    const bins = def.bins.map((b, i) => {
      const badge = el('span', { class: 'bin-count', text: '0' });
      const btn = el('button', { class: 'sort-bin', style: { '--bin': COLORS[i % COLORS.length] }, 'aria-label': b.en }, [
        el('span', { class: 'sort-bin-hi', lang: 'hi', text: b.hi }),
        el('span', { class: 'sort-bin-en', text: b.en }),
        badge,
      ]);
      return Object.assign(btn, { bin: b, badge });
    });
    const card = el('div', { class: 'sort-card' });
    ctx.stage.replaceChildren(card, el('div', { class: 'sort-bins' }, bins));
    await ctx.sayLines(def.prompt);

    const ok = await runRounds(ctx, items.length, async (i) => {
      const item = items[i];
      const w = item.word ? ctx.word(item.word) : null;
      // the picture helps at first; at the top level the child reads the word alone
      const showPic = w && ctx.tier < 2;
      card.replaceChildren(...[showPic ? el('span', { class: 'pic', html: ctx.picture(w) }) : null, el('span', { class: 'word-text', lang: 'hi', text: item.text })].filter(Boolean));
      animate(card, [{ transform: 'translateY(-40px) scale(0.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350 });
      const say = () => ctx.sayText(item.text, 'hi');
      ctx.setRepeat(say);
      card.onclick = say;
      say();
      const right = await choose(bins, (b) => b.bin.id === item.bin, { ctx, onWrong: (b) => ctx.sayLines(b.bin) });
      ctx.sfx.pop();
      await flyTo(card, right, { duration: 450, scale: 0.3, keep: false });
      counts.set(item.bin, counts.get(item.bin) + 1);
      right.badge.textContent = String(counts.get(item.bin));
      card.replaceChildren();
      await cheer(ctx, right);
      await sleep(200);
    });
    if (ok) ctx.complete();
  },
};
