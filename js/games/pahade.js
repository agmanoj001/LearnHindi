// पहाड़े: times tables sung the Hindi way, with a beat, then a game (docs/ROADMAP.md 10.7).
// First the whole table is chanted call-and-response over a dhol beat: the guide says a line ("दो दूनी
// चार") on the first beat of a bar, and the next bar is the child's turn to say it back. Then the game:
// the chant runs up to a gap ("दो छक्के …?") and the child picks the number; at the next level the lines
// come in any order, and then without the table to look at.
// A lesson's config: { table: 2..10, rounds } — or { tables: [6, 7, 8, 9], rounds } for a mixed review
// with no chanting first.
import { el, sleep, choose, runRounds, cheer } from './kit.js';
import { shuffle } from '../logic.js';
import { TABLES, chantLine, askLine, titleLine, PAHADA_LINES } from '../pahade.js';

const BEAT = 500; // ms: four beats to a bar, a line in each bar (the longest recorded line is under 1.9 s)
const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

export default {
  async start(ctx) {
    const cfg = ctx.config;
    const tables = (cfg.tables || [cfg.table || 2]).filter((t) => TABLES.includes(t));
    const word = (n) => ctx.numbers[n - 1]?.hi || String(n);
    const hi = (text) => ({ text, lang: 'hi' });
    const sayLine = (text) => ctx.playSegs([hi(text)]);
    const mixed = tables.length > 1;

    // the table on a card: a row a line, in Hindi words and in digits
    const card = (t) => {
      const rows = Array.from({ length: 10 }, (_, i) => {
        const k = i + 1;
        return el('div', { class: 'ph-row', lang: 'hi' }, [el('span', { class: 'ph-words', text: chantLine(t, k, word) }), el('span', { class: 'ph-digits', lang: 'en', text: `${t} × ${k} = ${t * k}` })]);
      });
      return { node: el('div', { class: 'ph-card' }, [el('h3', { class: 'ph-title', lang: 'hi', text: titleLine(t, word) }), ...rows]), rows };
    };

    // ---- the chant: call and response over a steady beat ----
    if (!mixed) {
      const t = tables[0];
      const { node, rows } = card(t);
      const skip = el('button', { class: 'bubble ph-skip', 'aria-label': 'Skip the song', text: '⏭' });
      ctx.stage.replaceChildren(node, skip);
      let stopped = false;
      skip.addEventListener('click', () => {
        stopped = true;
        ctx.stop?.();
      });
      let beat = 0;
      // dha on the first beat of a bar, ta on the others
      const timer = setInterval(() => {
        if (!ctx.alive() || stopped) return;
        ctx.sfx.dhol?.(beat % 4 === 0);
        if (beat % 2 === 0) ctx.react?.(beat % 8 === 0 ? 'clap' : 'dance');
        beat++;
      }, BEAT);
      const nextBar = () => new Promise((r) => setTimeout(r, (4 - (beat % 4)) * BEAT));
      try {
        await sayLine(titleLine(t, word));
        await sayLine(PAHADA_LINES.singWithMe);
        for (let i = 0; i < 10 && !stopped && ctx.alive(); i++) {
          await nextBar();
          rows.forEach((r, j) => r.classList.toggle('now', j === i));
          rows[i].classList.add('sung');
          await sayLine(chantLine(t, i + 1, word));
          // the child's turn: one bar to say it back
          if (stopped || !ctx.alive()) break;
          await nextBar();
          rows[i].classList.add('echo');
          await sleep(4 * BEAT - 120);
          rows[i].classList.remove('echo');
        }
      } finally {
        clearInterval(timer);
      }
      if (!ctx.alive()) return;
      rows.forEach((r) => r.classList.remove('now'));
      skip.remove();
      await sayLine(PAHADA_LINES.yourTurn);
    }

    // ---- the game ----
    const rounds = cfg.rounds || 6;
    // the harder lines (6 to 9) more often
    const ks = shuffle(
      Array.from({ length: rounds }, (_, i) => (i % 3 === 0 ? int(ctx.rng, 2, 5) : int(ctx.rng, 6, 9))),
      ctx.rng,
    );
    const ok = await runRounds(ctx, rounds, async (i) => {
      const t = mixed ? tables[i % tables.length] : tables[0];
      const k = ks[i];
      const answer = t * k;
      const level = mixed ? Math.max(1, ctx.tier) : ctx.tier;
      // the numbers next to it in the table are the tempting wrong answers
      const near = shuffle([...new Set([t * (k - 1), t * (k + 1), answer + 1, answer - 1, answer + 2, t * (k + 2)])].filter((v) => v > 0 && v !== answer), ctx.rng).slice(0, Math.max(2, ctx.nChoices - 1));
      const btns = shuffle([answer, ...near], ctx.rng).map((v) => Object.assign(el('button', { class: 'card number ph-opt', 'aria-label': String(v) }, [el('span', { class: 'glyph', text: String(v) }), el('small', { lang: 'hi', text: word(v) })]), { v }));
      // level 0: the table so far is shown; level 1: only the question; level 2: no digits either
      const { node, rows } = card(t);
      rows.forEach((r, j) => {
        if (j + 1 > k || level > 0) r.classList.add('veiled');
        if (j + 1 === k) {
          r.classList.remove('veiled');
          r.classList.add('gap');
          r.querySelector('.ph-words').textContent = askLine(t, k, word).replace('?', ' … ?');
          r.querySelector('.ph-digits').textContent = level === 2 ? '' : `${t} × ${k} = ?`;
        }
      });
      ctx.stage.replaceChildren(node, el('div', { class: 'choices ph-choices' }, btns));
      const prompt = async () => {
        // at the first level the chant runs up to the gap, to the beat
        if (level === 0)
          for (let j = Math.max(1, k - 3); j < k; j++) {
            ctx.sfx.dhol?.(true);
            await sayLine(chantLine(t, j, word));
          }
        ctx.sfx.dhol?.(true);
        await sayLine(askLine(t, k, word));
        await sayLine(PAHADA_LINES.howMany);
      };
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.v === answer, { ctx, record: false });
      ctx.record({ skill: `pahada-${t}` }, right.firstTry);
      const row = rows[k - 1];
      row.querySelector('.ph-words').textContent = chantLine(t, k, word);
      row.querySelector('.ph-digits').textContent = `${t} × ${k} = ${answer}`;
      row.classList.remove('gap');
      row.classList.add('sung');
      await cheer(ctx, right);
      ctx.sfx.dhol?.(true);
      await sayLine(chantLine(t, k, word));
      await sleep(250);
    });
    if (ok) {
      if (!mixed) await sayLine(PAHADA_LINES.wellDone);
      ctx.complete();
    }
  },
};
