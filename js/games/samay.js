// समय और पैसे: days, months, seasons, telling the time and rupees, in Hindi (docs/ROADMAP.md 10.6). Everyday
// number talk at home is in these words; they are vocabulary and maths at once. Every sentence is a fixed
// one (js/samay.js), so all of it is recorded.
// A lesson's config: { modes: [...], rounds }. One round of each listed mode, in turn:
//   days     a week train: what comes after a day; at the next level "आज सोमवार है, कल कौन-सा दिन होगा / था?"
//   months   a year of calendar pages: what comes after or before a month; the first and last month
//   seasons  which season: rain, sweaters, mangoes, Holi … (four seasons, each with its picture)
//   ritu     the six ऋतुएँ in order, and how many there are (for older children)
//   clock    "कितने बजे हैं?": whole hours, then साढ़े, then सवा, पौने, डेढ़ and ढाई
//   count    "कितने रुपये हैं?": coins and notes to add up
//   pay      the market: pay the exact price with coins and notes, then ✓
import { el, sleep, choose, runRounds, cheer, wobble, readChoices, youngReader, stepHint, ICONS } from './kit.js';
import { mathModel } from '../art-math.js';
import { shuffle } from '../logic.js';
import { DAYS, MONTHS, SEASONS, SEASON_QS, RITU, timeHi, TIME_MINUTES, RUPEES, rupeeLabel, MONEY_LEVELS, MARKET, LINES, SAMAY_MODES } from '../samay.js';

const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const pick = (rng, xs) => xs[Math.floor(rng() * xs.length)];
const at = (list, i) => list[((i % list.length) + list.length) % list.length];

export default {
  async start(ctx) {
    const modes = (ctx.config.modes || ['days']).filter((m) => SAMAY_MODES[m]);
    const rounds = ctx.config.rounds || 6;
    const hi = (text) => ({ text, lang: 'hi' });
    const num = (v) => ({ text: ctx.numbers[v - 1]?.hi || String(v), lang: 'hi', clipKey: `num-${v}_hi` });
    // "पंद्रह रुपये", "बारह रुपये पचास पैसे", "पचास पैसे"
    const moneySegs = (p) => {
      const [r, ps] = [Math.floor(p / 100), p % 100];
      return [...(r ? [num(r), hi(LINES.rupees)] : []), ...(ps ? [num(ps), hi(LINES.paise)] : [])];
    };
    const sayLine = (text) => ctx.playSegs([hi(text)]);
    // a card with the Hindi word (and the English under it)
    const card = (v, text, en, extra = null) => Object.assign(el('button', { class: 'card answer samay-card', lang: 'hi', 'aria-label': en || text }, [extra, el('span', { class: 'word-text', text }), en ? el('small', { lang: 'en', text: en }) : null].filter(Boolean)), { v, say: text });
    const numCard = (v) => Object.assign(el('button', { class: 'card number samay-num', 'aria-label': String(v) }, [el('span', { class: 'glyph', text: String(v) })]), { v, segs: [num(v)] });
    const readAloud = (btns) => youngReader(ctx) && readChoices(ctx, btns, (b) => b.segs || [hi(b.say)]);
    const n = Math.max(3, ctx.nChoices);
    // a lesson can start higher up (Grade 3: paise, quarter past and quarter to)
    const t = () => Math.max(ctx.config.minLevel || 0, ctx.tier);

    const ok = await runRounds(ctx, rounds, async (i) => {
      const mode = modes[i % modes.length];
      let btns;
      let isRight;
      let prompt;
      let after = async () => {};
      let board = null;

      if (mode === 'days' || mode === 'months') {
        const list = mode === 'days' ? DAYS : MONTHS;
        const k = int(ctx.rng, 0, list.length - 1);
        const level = t();
        // a count question now and then: 7 days, 12 months; the first and last month
        const extra = ctx.rng() < 0.2 ? (mode === 'days' ? 'count' : pick(ctx.rng, ['count', 'first', 'last'])) : null;
        if (extra === 'count') {
          const want = list.length;
          btns = shuffle([want, ...shuffle([5, 6, 10, 30, 52, 7, 12].filter((x) => x !== want), ctx.rng).slice(0, n - 1)], ctx.rng).map(numCard);
          isRight = (b) => b.v === want;
          const line = mode === 'days' ? LINES.weekDays : LINES.yearMonths;
          prompt = () => sayLine(line);
          board = el('div', { class: 'samay-strip' }, list.map((x) => el('span', { class: 'samay-chip', lang: 'hi', text: x.hi })));
          after = () => ctx.playSegs([num(want)]);
        } else {
          const back = mode === 'months' ? level > 0 && ctx.rng() < 0.5 : level === 2 && ctx.rng() < 0.6;
          const first = extra === 'first';
          const last = extra === 'last';
          const answer = first ? 0 : last ? 11 : back ? k - 1 : k + 1;
          const line = first ? LINES.firstMonth : last ? LINES.lastMonth : mode === 'days' ? (level === 0 ? LINES.dayAfter(list[k].hi) : back ? LINES.dayPrev(list[k].hi) : LINES.dayNext(list[k].hi)) : back ? LINES.monthBefore(list[k].hi) : LINES.monthAfter(list[k].hi);
          // the neighbours are the tempting wrong answers
          const wrongIdx = shuffle([answer + 1, answer - 1, answer + 2, answer + 3, k].filter((x) => at(list, x) !== at(list, answer)), ctx.rng);
          const ids = [answer, ...[...new Set(wrongIdx.map((x) => ((x % list.length) + list.length) % list.length))].slice(0, n - 1)];
          btns = shuffle(ids, ctx.rng).map((x) => card(at(list, x).hi, at(list, x).hi, at(list, x).en));
          isRight = (b) => b.v === at(list, answer).hi;
          prompt = () => sayLine(line);
          // the week train / the year: shown in full at first, then only the day asked about
          const show = level === 0 || mode === 'months';
          board = el(
            'div',
            { class: `samay-strip ${mode}` },
            list.map((x, j) => {
              const isK = j === k && !first && !last;
              const isGap = j === ((answer % list.length) + list.length) % list.length;
              return el('span', { class: `samay-chip${isK ? ' today' : ''}${isGap ? ' gap' : ''}${!show && !isK && !isGap ? ' veiled' : ''}`, lang: 'hi', text: isGap ? '?' : x.hi });
            }),
          );
          after = async () => {
            const gap = board.querySelector('.gap');
            if (gap) {
              gap.textContent = at(list, answer).hi;
              gap.classList.add('done');
            }
            await sayLine(at(list, answer).hi);
          };
        }
      } else if (mode === 'seasons') {
        const [q, en, id] = pick(ctx.rng, SEASON_QS);
        const right = SEASONS.find((s) => s.id === id);
        const others = shuffle(
          SEASONS.filter((s) => s !== right),
          ctx.rng,
        ).slice(0, Math.min(3, n - 1));
        btns = shuffle([right, ...others], ctx.rng).map((s) => card(s.id, s.hi, s.en, el('span', { class: 'pic', html: ctx.picture(ctx.word(s.pic)) })));
        isRight = (b) => b.v === id;
        board = el('p', { class: 'samay-q', lang: 'hi' }, [q, el('small', { lang: 'en', text: en })]);
        prompt = () => sayLine(q);
        after = () => sayLine(right.hi);
      } else if (mode === 'ritu') {
        if (ctx.rng() < 0.25) {
          btns = shuffle([6, 4, 3, 12].slice(0, Math.max(3, n)), ctx.rng).map(numCard);
          isRight = (b) => b.v === 6;
          prompt = () => sayLine(LINES.ritus);
          board = el('div', { class: 'samay-strip ritu' }, RITU.map((r) => el('span', { class: 'samay-chip', lang: 'hi', text: r.hi })));
          after = () => ctx.playSegs([num(6)]);
        } else {
          const k = int(ctx.rng, 0, RITU.length - 1);
          const answer = at(RITU, k + 1);
          const others = shuffle(
            RITU.filter((r) => r !== answer && r !== RITU[k]),
            ctx.rng,
          ).slice(0, n - 1);
          btns = shuffle([answer, ...others], ctx.rng).map((r) => card(r.hi, r.hi, r.en));
          isRight = (b) => b.v === answer.hi;
          prompt = () => sayLine(LINES.rituAfter(RITU[k].hi));
          // a ring of the six seasons, the asked one lit and the next a gap
          board = el(
            'div',
            { class: 'samay-strip ritu' },
            RITU.map((r, j) => el('span', { class: `samay-chip${j === k ? ' today' : ''}${r === answer ? ' gap' : ''}${t() === 2 && j !== k && r !== answer ? ' veiled' : ''}`, lang: 'hi', text: r === answer ? '?' : r.hi })),
          );
          after = async () => {
            const gap = board.querySelector('.gap');
            gap.textContent = answer.hi;
            gap.classList.add('done');
            await sayLine(answer.hi);
          };
        }
      } else if (mode === 'clock') {
        const mins = TIME_MINUTES[t()];
        const h = int(ctx.rng, 1, 12);
        const m = pick(ctx.rng, mins);
        const right = timeHi(h, m);
        // the same time said the wrong way, and the hour next door
        const pool = [...mins.filter((x) => x !== m).map((x) => timeHi(h, x)), timeHi((h % 12) + 1, m), timeHi(((h + 10) % 12) + 1, m), timeHi((h % 12) + 1, mins.at(-1))];
        const wrong = shuffle([...new Set(pool)].filter((x) => x !== right), ctx.rng).slice(0, n - 1);
        btns = shuffle([right, ...wrong], ctx.rng).map((x) => card(x, x, null));
        isRight = (b) => b.v === right;
        board = el('div', { class: 'samay-clock', html: mathModel({ kind: 'clock', h, m }) });
        prompt = async () => {
          await sayLine(LINES.whatTime);
          await readAloud(btns);
        };
        after = () => sayLine(right);
      } else if (mode === 'count') {
        const lv = MONEY_LEVELS[t()];
        const items = [];
        const target = int(ctx.rng, Math.min(300, lv.max / 2), lv.max);
        // biggest first, like counting money at a shop
        let left = target;
        const kinds = lv.kinds.slice().sort((a, b) => RUPEES[b].value - RUPEES[a].value);
        while (left > 0 && items.length < 7) {
          const fits = kinds.filter((k) => RUPEES[k].value <= left);
          if (!fits.length) break;
          const k = fits[Math.min(fits.length - 1, int(ctx.rng, 0, 1))];
          items.push(k);
          left -= RUPEES[k].value;
        }
        const total = items.reduce((s, k) => s + RUPEES[k].value, 0);
        const steps = t() === 2 ? [50, 100, 500, 1000] : [100, 200, 500, 1000];
        const wrong = shuffle([...new Set(steps.flatMap((d) => [total + d, total - d]))].filter((v) => v > 0 && v !== total), ctx.rng).slice(0, n - 1);
        btns = [total, ...wrong].sort((a, b) => a - b).map((p) => Object.assign(el('button', { class: 'card number samay-num', 'aria-label': rupeeLabel(p) }, [el('span', { class: 'glyph', text: rupeeLabel(p) })]), { v: p, segs: moneySegs(p) }));
        isRight = (b) => b.v === total;
        board = el('div', { class: 'samay-money' }, items.map((k) => el('span', { class: 'samay-coin', html: mathModel({ kind: 'rupee', id: k }) })));
        prompt = async () => {
          await sayLine(LINES.howMuch);
          await readAloud(btns);
        };
        after = () => ctx.playSegs(moneySegs(total));
      } else if (mode === 'pay') {
        const r = await pay();
        if (!ctx.alive()) return;
        ctx.record({ skill: SAMAY_MODES.pay }, r.first);
        await cheer(ctx, r.node);
        await sayLine(LINES.thanks);
        await sleep(300);
        return;
      }

      ctx.stage.replaceChildren(...[board, el('div', { class: `choices samay-choices ${mode}` }, btns)].filter(Boolean));
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, isRight, { ctx, record: false });
      ctx.record({ skill: SAMAY_MODES[mode] }, right.firstTry);
      await cheer(ctx, right);
      await after();
      await sleep(300);
    });
    if (ok) ctx.complete();

    // ---- the market: pay the exact price ----
    async function pay() {
      const lv = MONEY_LEVELS[t()];
      const id = pick(ctx.rng, MARKET);
      const w = ctx.word(id);
      const rupees = int(ctx.rng, t() === 0 ? 2 : 11, lv.max / 100 - (t() === 2 ? 1 : 0));
      const price = rupees * 100 + (t() === 2 && ctx.rng() < 0.5 ? 50 : 0);
      const itemSeg = { text: w.hi, lang: 'hi', clipKey: `${id}_hi` };
      const say = () => ctx.playSegs([itemSeg, ...moneySegs(price), hi(LINES.costs), hi(LINES.pay)]);
      const ask = el('p', { class: 'math-ask hands-ask', lang: 'hi', text: `${w.hi} ${rupeeLabel(price)} ${LINES.costs} ${LINES.pay}` });
      const tray = el('div', { class: 'sh-tray samay-tray', 'aria-label': 'दिए गए पैसे' });
      const total = el('b', { class: 'hands-count' });
      const paid = [];
      const sum = () => paid.reduce((s, k) => s + RUPEES[k].value, 0);
      const work = el('div', { class: 'hands-work hands-shop' }, [
        el('div', { class: 'sh-item' }, [el('span', { class: 'sh-pic', html: ctx.picture(w) }), el('b', { class: 'sh-price', text: rupeeLabel(price) })]),
        el('p', { class: 'hands-readout' }, [el('span', { lang: 'hi', text: 'दिए: ' }), total]),
        tray,
      ]);
      const check = el('button', { class: 'bubble green big hands-check', 'aria-label': 'Check', html: ICONS.check });
      const draw = () => {
        tray.replaceChildren(
          ...paid.map((k, j) => {
            const b = el('button', { class: `sh-coin paid${RUPEES[k].note ? ' bill' : ''}`, 'aria-label': `वापस लो ${rupeeLabel(RUPEES[k].value)}`, html: mathModel({ kind: 'rupee', id: k }) });
            b.addEventListener('click', () => {
              paid.splice(j, 1);
              ctx.sfx.pop();
              draw();
              hint.step();
            });
            return b;
          }),
        );
        // the running total helps at first; at the top level the child adds it up
        total.textContent = t() < 2 ? (sum() ? rupeeLabel(sum()) : '₹0') : '?';
      };
      const purse = lv.kinds.map((k) => {
        const b = el('button', { class: `sh-coin${RUPEES[k].note ? ' bill' : ''}`, 'aria-label': rupeeLabel(RUPEES[k].value), html: mathModel({ kind: 'rupee', id: k }) });
        b.addEventListener('click', () => {
          if (paid.length >= 15) return wobble(b);
          paid.push(k);
          ctx.sfx.pop();
          ctx.playSegs(moneySegs(RUPEES[k].value));
          draw();
          hint.step();
        });
        b.k = k;
        return b;
      });
      ctx.stage.replaceChildren(el('div', { class: 'hands-board' }, [ask, work]), el('div', { class: 'hands-bar' }, [el('div', { class: 'hands-tools' }, [el('div', { class: 'sh-purse' }, purse)]), check]));
      draw();
      ctx.setRepeat(say);
      say();
      // the next coin or note: the biggest that still fits (or one to give back)
      const next = () => {
        const left = price - sum();
        if (left < 0) return tray.firstElementChild;
        if (!left) return check;
        return purse.filter((b) => RUPEES[b.k].value <= left).sort((x, y) => RUPEES[y.k].value - RUPEES[x.k].value)[0];
      };
      const hint = stepHint(ctx, next, { coach: 'each' });
      let wrong = 0;
      await new Promise((resolve) => {
        check.addEventListener('click', () => {
          if (sum() === price) {
            hint.done();
            resolve();
            return;
          }
          wrong++;
          wobble(check);
          ctx.miss?.();
          hint.miss();
          sayLine(sum() > price ? LINES.tooMuch : LINES.tooLittle);
        });
      });
      return { first: wrong === 0 && hint.used === 0, node: tray };
    }
  },
};
