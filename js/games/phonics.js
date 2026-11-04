// English phonics (Kindergarten and Grade 1): problems from phonicsgen.js. A picture to hear, a
// word with a gap, or letters to blend, then letters, word parts, words or pictures to choose from.
// Like math, rounds interleave the lesson's skills and the level moves with the child (ctx.tier).
import { makePhonics, PHONICS, soundOf } from '../phonicsgen.js';
import { picture } from '../art.js';
import { el, sleep, choose, runRounds, cheer, bounce, animate } from './kit.js';

export default {
  async start(ctx) {
    const skills = ctx.config.skills.filter((id) => PHONICS[id]);
    const rounds = ctx.config.rounds || 6;
    const items = skills.map((skill) => ({ skill, id: skill }));
    const first = items.slice(0, rounds);
    const order = [...first, ...ctx.practice(items, rounds - first.length)].map((x) => x.skill);
    const say = (text) => ctx.sayText(text, 'en');

    const ok = await runRounds(ctx, order.length, async (i) => {
      const p = makePhonics(order[i], { tier: ctx.tier, n: ctx.nChoices, rng: ctx.rng });
      const board = el('div', { class: 'math-board phonics-board' });
      board.append(el('p', { class: 'math-ask', text: p.ask }));
      if (p.pic) {
        const pic = el('button', { class: 'ph-pic', 'aria-label': 'Say it again', html: picture(p.pic) });
        pic.addEventListener('click', () => (bounce(pic), say(p.word?.text || p.say?.split('.')[0] || p.answer)));
        board.append(pic);
      }
      let gapEl = null;
      if (p.word) {
        const [a, b] = p.word.gap || [0, 0];
        const t = p.word.text;
        gapEl = p.word.gap ? el('span', { class: 'gap', text: '?' }) : null;
        board.append(el('div', { class: 'ph-word' }, [t.slice(0, a), gapEl, t.slice(b)].filter((x) => x !== null && x !== '')));
      }
      if (p.tiles) {
        // blending: tap each letter to hear its sound with a key word
        const tiles = p.tiles.map((c) => {
          const b = el('button', { class: 'ph-tile', text: c, 'aria-label': c });
          b.addEventListener('click', () => (bounce(b), ctx.sfx.pop(), say(soundOf(c))));
          return b;
        });
        board.append(el('div', { class: 'ph-tiles' }, tiles));
      }
      const partsEl = p.parts ? el('div', { class: 'ph-parts' }) : null;
      if (partsEl) board.append(partsEl);

      const btns = p.options.map((o) => {
        const inner = o.pic ? [el('span', { class: 'math-opt-model mm-pic', html: picture(o.pic) })] : [el('span', { class: 'word-text', text: o.label })];
        const kind = o.pic ? 'pictured' : String(o.label).length <= 2 ? 'num' : 'word';
        return Object.assign(el('button', { class: `card math-opt ${kind}`, 'aria-label': String(o.say || o.label || o.value) }, inner), { opt: o });
      });
      ctx.stage.replaceChildren(board, el('div', { class: 'choices math-options row' }, btns));
      animate(board, [{ transform: 'translateY(16px) scale(0.97)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300 });

      const prompt = () => say(p.say || p.ask);
      ctx.setRepeat(prompt);
      prompt();
      let misses = 0;
      const right = await choose(btns, (b) => b.opt.value === p.answer, {
        onWrong: (b) => {
          misses++;
          b.classList.add('tried');
          ctx.miss();
          say(misses >= 2 && p.hint ? p.hint : String(b.opt.say || b.opt.label || ''));
        },
      });
      ctx.record({ skill: p.skill }, right.firstTry);

      if (gapEl) {
        gapEl.textContent = String(p.answer);
        gapEl.classList.add('done');
      }
      if (partsEl) {
        // show the claps one by one
        for (const part of p.parts) {
          partsEl.append(el('span', { class: 'ph-part', text: part }));
          ctx.sfx.pop();
          await sleep(260);
        }
      }
      await cheer(ctx, right);
      await say(p.explain);
      await sleep(250);
    });
    if (ok) ctx.complete();
  },
};
