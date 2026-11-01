// Recycling yard: sort things into bins by colour, then by shape. The garbage truck collects at the end.
import { makeSortRound, checkSort } from '../logic.js';
import { shapePicture } from '../art.js';
import { el, sleep, choose, runRounds, cheer, vehicleEl, flyTo, animate } from './kit.js';

const binSvg = (fill, icon = '') =>
  `<svg viewBox="0 0 120 140" aria-hidden="true"><path d="M16 32 H104 L97 128 Q96 136 88 136 H32 Q24 136 23 128 Z" fill="${fill}"/>` +
  `<path d="M16 32 H104 L102 52 H18 Z" fill="#000" opacity="0.1"/>` +
  `<rect x="6" y="16" width="108" height="18" rx="9" fill="${fill}"/><rect x="46" y="6" width="28" height="12" rx="6" fill="#2B2D42" opacity="0.75"/>${icon}</svg>`;

export default {
  async start(ctx) {
    const { rounds, bins: binCount } = ctx.config;
    const colors = ctx.words(ctx.config.colors);
    const shapes = ctx.words(ctx.config.shapes);
    const shapeName = (w) => w.picture.replace('shape-', '');
    const truck = vehicleEl(ctx, 'garbagetruck', 'rescuer');
    const item = el('div', { class: 'sort-item' });
    const bins = el('div', { class: 'choices bins' });
    ctx.stage.replaceChildren(el('div', { class: 'scene' }, [truck, item]), bins);
    truck.addEventListener('click', () => ctx.sayItem(ctx.word('garbagetruck')));

    const ok = await runRounds(ctx, rounds, async (i) => {
      const mode = i % 2 === 0 ? 'color' : 'shape';
      const round = makeSortRound(colors, shapes, mode, binCount, ctx.rng);
      const { color, shape } = round.item;
      item.innerHTML = shapePicture(shapeName(shape), color.color);
      animate(item, [{ transform: 'translateY(-60px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 400 });
      const btns = round.bins.map((w) => {
        const icon = mode === 'shape' ? `<g transform="translate(20 42) scale(0.4)">${shapePicture(shapeName(w), '#fafafa').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>` : '';
        const b = el('button', { class: 'bin', 'aria-label': w.en, html: binSvg(mode === 'color' ? w.color : '#8492A6', icon) });
        b.word = w;
        return b;
      });
      bins.replaceChildren(...btns);
      const prompt = () => ctx.say('whichBin');
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => checkSort(round, b.word), { onWrong: (b) => ctx.say('thisIs', b.word) });
      await flyTo(item, right, { duration: 600, scale: 0.3, keep: false });
      item.innerHTML = '';
      await cheer(ctx, right);
      await ctx.sayItem(round.answer);
      await sleep(300);
    });
    if (!ok) return;
    bins.replaceChildren();
    ctx.sfx.vroom();
    await animate(truck, [{ transform: 'translateX(0)' }, { transform: 'translateX(-30vw)' }, { transform: 'translateX(110vw)' }], { duration: 2000, fill: 'forwards' });
    ctx.complete();
  },
};

