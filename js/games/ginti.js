// गिनती: Hindi numbers as their own strand (docs/ROADMAP.md 10.3). Hindi number words past ten are
// irregular (उन्नीस, सत्ताईस, निन्यानवे), so they need their own practice, and the Devanagari digits
// (१ २ ३) and the words of maths (जोड़, घटाना, ज़्यादा, कम, बराबर, आधा) come with them.
// A lesson's config: { modes: [...], from, to, rounds }. One round of each listed mode, in turn:
//   count    tap the things to count them aloud, then pick how many           (from Toddler)
//   show     hear a number, find the group with that many                      (from Toddler)
//   hear     hear a number, find its digits                                    (from Kindergarten)
//   digits   a Devanagari digit: which number is it?                           (from Kindergarten)
//   next     what comes after this number?                                     (from Kindergarten)
//   compare  two groups: which has more, which has fewer, or are they the same (ज़्यादा, कम, बराबर)
//   read     the digits shown: pick the Hindi number word                      (from Grade 1)
//   add      two groups put together (जोड़ो), take away (घटाओ), and half (आधा)
import { shuffle } from '../logic.js';
import { GINTI_MODES } from '../validate.js';
import { el, sleep, choose, runRounds, cheer, bounce, numberCard, readChoices, youngReader } from './kit.js';
// the things that are counted, in turn
const THINGS = ['apple', 'duck', 'ball', 'mango', 'fish', 'star', 'laddoo', 'car', 'flower', 'balloon'];

// Numbers near the answer (so the choice is about the number, not a wild guess), inside [lo, hi].
export function nearNumbers(answer, n, lo, hi, rng = Math.random) {
  const pool = [];
  for (let d = 1; pool.length < 12 && d <= hi - lo; d++) for (const v of [answer - d, answer + d]) if (v >= lo && v <= hi) pool.push(v);
  return shuffle([answer, ...shuffle(pool.slice(0, Math.max(n + 2, 4)), rng).slice(0, n - 1)], rng);
}

export default {
  async start(ctx) {
    const cfg = ctx.config;
    const modes = (cfg.modes || ['count']).filter((m) => GINTI_MODES.includes(m));
    const lo = Math.max(1, cfg.from || 1);
    const hi = Math.min(ctx.numbers.length, cfg.to || 10);
    const num = (v) => ctx.numbers[v - 1];
    const rounds = cfg.rounds || 6;
    const n = Math.max(3, ctx.nChoices);
    const picks = ctx.practice(ctx.numbers.slice(lo - 1, hi), rounds);
    const thing = (i) => ctx.word(THINGS[i % THINGS.length]);
    const say = (key, item) => ctx.say(key, item);
    // numbers said one after another in Hindi (counting aloud)
    const sayNum = (v) => ctx.playSegs([{ text: num(v).hi, lang: 'hi', clipKey: `num-${v}_hi` }]);
    const group = (count, w, cls = '') => el('span', { class: `ginti-group ${cls}`, style: { '--n': String(count) } }, Array.from({ length: count }, () => el('span', { class: 'ginti-thing', html: ctx.picture(w) })));
    const wordCard = (v) => Object.assign(el('button', { class: 'card answer ginti-word', lang: 'hi', 'aria-label': num(v).en }, [el('span', { class: 'word-text', text: num(v).hi })]), { v: v, num: num(v) });
    const digitCard = (v) => Object.assign(numberCard(ctx, num(v)), { v: v });
    const youngRead = (btns, segs) => youngReader(ctx) && readChoices(ctx, btns, segs);
    const numSegs = (b) => [{ text: num(b.v).hi, lang: 'hi', clipKey: `num-${b.v}_hi` }];

    const ok = await runRounds(ctx, rounds, async (i) => {
      const mode = modes[i % modes.length];
      const target = picks[i];
      const v = target.value;
      let btns;
      let isRight = (b) => b.v === v;
      let prompt;
      let after = () => ctx.sayItem(num(v));

      if (mode === 'count' || mode === 'show') {
        const w = thing(i);
        const small = Math.min(v, 10);
        if (mode === 'count') {
          // tap each one to count it aloud; the numbers appear as they are counted
          let counted = 0;
          const things = Array.from({ length: small }, () => {
            const t = el('button', { class: 'ginti-thing big', html: ctx.picture(w), 'aria-label': w.en });
            t.addEventListener('click', () => {
              if (t.dataset.n) return void bounce(t);
              t.dataset.n = String(++counted);
              t.append(el('b', { class: 'ginti-tag', text: String(counted) }));
              bounce(t);
              sayNum(counted);
            });
            return t;
          });
          btns = nearNumbers(small, n, 1, Math.max(5, Math.min(10, hi)), ctx.rng).map(digitCard);
          isRight = (b) => b.v === small;
          ctx.stage.replaceChildren(el('div', { class: 'ginti-field' }, things), el('div', { class: 'choices' }, btns));
          prompt = async () => {
            await say('gintiCount');
            await youngRead(btns, numSegs);
          };
          after = () => ctx.sayItem(num(small));
        } else {
          // hear a number, find the group with that many
          const values = nearNumbers(small, Math.min(n, 3), 1, Math.max(5, Math.min(10, hi)), ctx.rng);
          btns = values.map((c) => Object.assign(el('button', { class: 'card ginti-card', 'aria-label': String(c) }, [group(c, w)]), { v: c, num: num(c) }));
          isRight = (b) => b.v === small;
          ctx.stage.replaceChildren(el('div', { class: 'choices ginti-choices' }, btns));
          prompt = () => say('find', num(small));
          after = () => ctx.sayItem(num(small));
        }
      } else if (mode === 'hear') {
        btns = nearNumbers(v, n, lo, hi, ctx.rng).map(digitCard);
        ctx.stage.replaceChildren(el('div', { class: 'ginti-ear', 'aria-hidden': 'true', text: '👂' }), el('div', { class: 'choices' }, btns));
        prompt = () => say('find', num(v));
      } else if (mode === 'digits' || mode === 'read') {
        // the number shown: Devanagari digits (digits) or both scripts (read); answer with its digits or its word
        const shown = mode === 'digits' ? num(v).digitHi : `${v}`;
        const big = el('div', { class: 'ginti-big', lang: 'hi' }, [el('span', { text: shown }), mode === 'read' ? el('small', { text: num(v).digitHi }) : null]);
        const values = nearNumbers(v, n, lo, hi, ctx.rng);
        btns = mode === 'read' ? values.map(wordCard) : values.map((c) => Object.assign(el('button', { class: 'card number', 'aria-label': num(c).en }, [el('span', { class: 'glyph', text: String(c) })]), { v: c, num: num(c) }));
        ctx.stage.replaceChildren(big, el('div', { class: `choices${mode === 'read' ? ' answers' : ''}` }, btns));
        prompt = () => say('gintiRead');
      } else if (mode === 'next') {
        const start = Math.min(Math.max(lo, v - 1), hi - 1);
        const row = el('div', { class: 'ginti-row' }, [start - 1 >= lo ? el('span', { text: String(start - 1) }) : null, el('span', { text: String(start) }), el('span', { class: 'gap', text: '?' })]);
        btns = nearNumbers(start + 1, n, lo, hi, ctx.rng).map(digitCard);
        isRight = (b) => b.v === start + 1;
        ctx.stage.replaceChildren(row, el('div', { class: 'choices' }, btns));
        prompt = () => say('numAfter', num(start));
        after = async () => {
          row.querySelector('.gap').textContent = String(start + 1);
          row.querySelector('.gap').classList.add('done');
          await ctx.sayItem(num(start + 1));
        };
      } else if (mode === 'compare') {
        // ज़्यादा, कम or बराबर
        const w = thing(i);
        const a = 1 + Math.floor(ctx.rng() * Math.min(9, hi));
        const same = ctx.rng() < 0.25;
        let b = same ? a : 1 + Math.floor(ctx.rng() * Math.min(9, hi));
        if (!same && b === a) b = a === 1 ? 2 : a - 1;
        const ask = same ? (ctx.rng() < 0.5 ? 'gintiMore' : 'gintiFewer') : ctx.rng() < 0.5 ? 'gintiMore' : 'gintiFewer';
        const sides = [a, b].map((c, k) => Object.assign(el('button', { class: 'card ginti-card', 'aria-label': String(c) }, [group(c, w)]), { v: c, side: k }));
        const equal = Object.assign(el('button', { class: 'card answer ginti-equal', lang: 'hi' }, [el('span', { class: 'word-text', text: '=' }), el('small', { text: 'बराबर' })]), { v: 'equal' });
        btns = [...sides, equal];
        const want = a === b ? 'equal' : ask === 'gintiMore' ? Math.max(a, b) : Math.min(a, b);
        isRight = (x) => x.v === want;
        ctx.stage.replaceChildren(el('div', { class: 'choices ginti-choices' }, btns));
        prompt = () => say(ask);
        after = () => (a === b ? say('gintiEqual') : ctx.sayItem(num(want)));
      } else if (mode === 'add' || mode === 'take') {
        const w = thing(i);
        const total = Math.max(2, Math.min(10, v));
        const part = 1 + Math.floor(ctx.rng() * (total - 1));
        const answer = mode === 'add' ? total : total - part;
        const scene =
          mode === 'add'
            ? el('div', { class: 'ginti-sum' }, [group(part, w), el('b', { text: '+' }), group(total - part, w)])
            : el('div', { class: 'ginti-sum' }, [group(total, ctx.word('balloon'), 'take')]);
        btns = nearNumbers(answer, n, 1, 10, ctx.rng).map(digitCard);
        isRight = (b) => b.v === answer;
        ctx.stage.replaceChildren(scene, el('div', { class: 'choices' }, btns));
        if (mode === 'take') {
          // some balloons float away
          const items = [...scene.querySelectorAll('.ginti-thing')];
          setTimeout(() => items.slice(0, part).forEach((t, k) => setTimeout(() => t.classList.add('gone'), k * 220)), 700);
        }
        prompt = async () => {
          await say(mode === 'add' ? 'gintiAdd' : 'gintiTake');
          await youngRead(btns, numSegs);
        };
        after = () => ctx.sayItem(num(answer));
      } else if (mode === 'half') {
        // आधा: a whole and a half of the same thing
        const w = ctx.word(['roti', 'apple', 'mango', 'laddoo'][i % 4]);
        const halfFirst = ctx.rng() < 0.5;
        btns = [true, false].map((half) => Object.assign(el('button', { class: `card ginti-card${half ? ' half' : ''}`, 'aria-label': half ? 'half' : 'whole' }, [el('span', { class: 'pic', html: ctx.picture(w) })]), { v: half }));
        if (!halfFirst) btns.reverse();
        isRight = (b) => b.v === true;
        ctx.stage.replaceChildren(el('div', { class: 'choices ginti-choices' }, btns));
        prompt = () => say('gintiHalf');
        after = () => say('gintiHalfIs');
      }

      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, isRight, { ctx });
      await cheer(ctx, right);
      await after();
      await sleep(300);
    });
    if (ok) ctx.complete();
  },
};
