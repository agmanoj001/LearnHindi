// Math (Kindergarten and Grade 1, in English): problems from mathgen.js drawn with art-math.js.
// A lesson lists the skills it practises ({ "skills": ["k-count", "k-quick"] }); rounds interleave
// them, weaker skills come up more often, and the level moves inside the lesson: two right in a row
// make the next one harder, two misses in a row make it easier. Objects can be tapped to count them.
import { makeProblem, SKILLS } from '../mathgen.js';
import { mathModel } from '../art-math.js';
import { el, sleep, choose, runRounds, cheer, bounce, animate } from './kit.js';

const LEVEL_UP = ['Ooh, a trickier one!', 'Level up!', "You're on fire! Here's a harder one."];

export default {
  async start(ctx) {
    const skills = ctx.config.skills.filter((id) => SKILLS[id]);
    const rounds = ctx.config.rounds || 6;
    const choices = ctx.config.choices || [3, 3, 4];
    // every skill at least once (when there are enough rounds), then the weaker ones more often
    const items = skills.map((skill) => ({ skill, id: skill }));
    const first = items.slice(0, rounds);
    const seq = [...first, ...ctx.practice(items, rounds - first.length)].map((x) => x.skill);
    const order = seq.length > 1 ? interleave(seq, ctx.rng) : seq;

    let tier = ctx.tier;
    let rightRun = 0;
    let missRun = 0;
    let lastSay = 0;

    const ok = await runRounds(ctx, order.length, async (i) => {
      const p = makeProblem(order[i], { tier, n: choices[tier] || 3, rng: ctx.rng });
      const board = el('div', { class: `math-board${p.model ? '' : ' no-model'}` });
      const ask = el('p', { class: 'math-ask', text: p.ask });
      const eq = p.eq ? el('div', { class: 'math-eq' }, p.eq.split('?').flatMap((part, k) => (k ? [el('span', { class: 'gap', text: '?' }), part] : [part]))) : null;
      const model = p.model ? el('div', { class: 'math-model', html: mathModel(p.model) }) : null;
      board.append(...[ask, eq, model].filter(Boolean));

      const btns = p.options.map((o) => {
        const inner = o.model ? [el('span', { class: 'math-opt-model', html: mathModel(o.model) }), o.label ? el('span', { class: 'math-opt-label', text: o.label }) : null] : [el('span', { class: 'word-text', text: o.label })];
        // numbers and signs (> = <) get round bubbles; words get pills
        const kind = o.model ? 'pictured' : typeof o.value === 'number' || String(o.label).length <= 2 ? 'num' : 'word';
        return Object.assign(el('button', { class: `card math-opt ${kind}`, 'aria-label': String(o.say || o.label || o.value) }, inner.filter(Boolean)), { opt: o });
      });
      const opts = el('div', { class: `choices math-options ${p.layout || 'row'}` }, btns);
      ctx.stage.replaceChildren(board, opts);
      animate(board, [{ transform: 'translateY(16px) scale(0.97)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300 });

      // tap-to-count: each object gets the next number
      let counted = 0;
      for (const obj of board.querySelectorAll('.mm-obj:not(.gone)')) {
        obj.addEventListener('click', () => {
          if (obj.dataset.n) return bounce(obj);
          obj.dataset.n = String(++counted);
          obj.classList.add('counted');
          ctx.sfx.pop();
          ctx.sayText(String(counted), 'en');
        });
      }

      const prompt = () => ctx.sayText(p.say || p.ask, 'en');
      ctx.setRepeat(prompt);
      prompt();

      let misses = 0;
      const right = await choose(btns, (b) => b.opt.value === p.answer, {
        onWrong: (b) => {
          misses++;
          b.classList.add('tried');
          ctx.miss();
          const now = Date.now();
          if (misses >= 2 && p.hint) ctx.sayText(p.hint, 'en');
          else if (now - lastSay > 600) ctx.sayText(String(b.opt.say || b.opt.label || ''), 'en');
          lastSay = now;
        },
      });
      ctx.record({ skill: p.skill }, right.firstTry);

      // reveal: fill the gap, count the objects, slide shapes together
      const label = p.options.find((o) => o.value === p.answer)?.label ?? String(p.answer);
      const gap = eq?.querySelector('.gap');
      if (gap) gap.textContent = label;
      eq?.classList.add('done');
      board.querySelector('.mm-num.gap')?.replaceChildren(String(p.answer));
      board.querySelector('.mm-num.gap')?.classList.add('done');
      board.querySelector('.mm-compose')?.classList.add('joined');
      board.querySelector('.mm-match')?.classList.add('show-extra');
      await cheer(ctx, right);
      if (p.countUp) {
        const objs = [...board.querySelectorAll('.mm-obj:not(.gone)')];
        objs.forEach((o, k) => {
          setTimeout(() => {
            o.dataset.n = String(k + 1);
            o.classList.add('counted');
          }, k * 90);
        });
        await sleep(objs.length * 90);
      }
      await ctx.sayText(p.explain, 'en');

      // the level moves with the child
      if (right.firstTry) {
        missRun = 0;
        rightRun++;
        if (rightRun >= 2 && tier < 2) {
          tier++;
          rightRun = 0;
          ctx.sfx.sparkle();
          ctx.mascot?.react('dance');
          const badge = el('div', { class: 'level-up', text: `★ ${LEVEL_UP[Math.floor(ctx.rng() * LEVEL_UP.length)]}` });
          ctx.stage.append(badge);
          await ctx.sayText(badge.textContent.slice(2), 'en');
          await sleep(300);
        }
      } else {
        rightRun = 0;
        missRun++;
        if (missRun >= 2 && tier > 0) {
          tier--;
          missRun = 0;
        }
      }
      await sleep(250);
    });
    if (ok) ctx.complete();
  },
};

// Spread repeats apart so the same skill rarely comes twice in a row (interleaved practice).
function interleave(seq, rng) {
  const left = seq.slice();
  const out = [];
  while (left.length) {
    const prev = out[out.length - 1];
    const options = left.map((s, i) => [s, i]).filter(([s]) => s !== prev);
    const [, idx] = options.length ? options[Math.floor(rng() * options.length)] : [null, 0];
    out.push(left.splice(idx, 1)[0]);
  }
  return out;
}
