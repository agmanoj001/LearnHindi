// Grammar (Grades 7 and 8): learn a rule from a few short cards, then practise it. Practice mixes three
// kinds of question: choose the answer, tap the word in a sentence, and sort words into groups. After
// each answer a "क्यों?" box explains the rule, and waits until the reader is ready to go on.
// Topics live in content.json "grammar"; a lesson names one ({ "topic": "g7-sangya" }) or, for a
// review, several ({ "topics": [...] }) and then skips the cards.
import { el, sleep, choose, cheer, waitTap, bounce } from './kit.js';
import { shuffle, markParts, unmark, tapTokens } from '../logic.js';

const marked = (text) => markParts(text).map((p) => (typeof p === 'string' ? document.createTextNode(p) : el('mark', { text: p.mark })));

// Which questions a lesson asks: from each topic in turn, so a review covers every topic.
export function pickQuestions(topics, n, rng) {
  const pools = topics.map((t) => shuffle(t.practice.map((q) => ({ ...q, topicId: t.id, topicTitle: t.title })), rng));
  const out = [];
  for (let i = 0; out.length < n && pools.some((p) => p.length); i++) {
    const p = pools[i % pools.length];
    if (p.length) out.push(p.shift());
  }
  return out;
}

export default {
  async start(ctx) {
    const ids = ctx.config.topics || [ctx.config.topic];
    const topics = ids.map((id) => ({ id, ...ctx.content.grammar[id] })).filter((t) => t.practice);
    const review = ids.length > 1;
    const cards = review ? [] : topics[0].learn || [];
    const questions = pickQuestions(topics, Math.min(ctx.config.rounds || 8, topics.reduce((n, t) => n + t.practice.length, 0)), ctx.rng);
    const total = cards.length + questions.length;
    let step = 0;
    ctx.setProgress(0, total);
    const item = (topicId) => ({ grammar: topicId });
    const sayHi = (text) => ctx.playSegs([{ text: unmark(text), lang: 'hi' }]);

    // ---- learn: the rule, examples and a table ----
    for (let k = 0; k < cards.length; k++) {
      if (!ctx.alive()) return;
      const c = cards[k];
      const next = el('button', { class: 'gr-next', lang: 'hi' }, [el('span', { text: k < cards.length - 1 ? 'आगे' : 'अभ्यास करें' }), el('span', { class: 'gr-next-en', text: k < cards.length - 1 ? 'Next' : 'Practise' })]);
      const table = c.table
        ? el('div', { class: 'gr-table-wrap' }, [
            el('table', { class: 'gr-table', lang: 'hi' }, [
              c.table.head ? el('thead', {}, [el('tr', {}, c.table.head.map((h) => el('th', {}, marked(h))))]) : null,
              el('tbody', {}, c.table.rows.map((row) => el('tr', {}, row.map((cell, i) => el(i === 0 ? 'th' : 'td', { scope: i === 0 ? 'row' : null }, marked(cell)))))),
            ]),
          ])
        : null;
      const card = el('section', { class: 'gr-card learn' }, [
        el('div', { class: 'gr-kicker' }, [el('span', { lang: 'hi', text: `सीखो · ${k + 1}/${cards.length}` }), el('span', { text: topics[0].title.en })]),
        el('h2', { lang: 'hi', text: c.title }),
        c.text ? el('p', { class: 'gr-rule', lang: 'hi' }, marked(c.text)) : null,
        c.en ? el('p', { class: 'gr-en', text: c.en }) : null,
        table,
        c.examples ? el('ul', { class: 'gr-examples', lang: 'hi' }, c.examples.map((x) => el('li', {}, marked(x)))) : null,
        next,
      ]);
      ctx.stage.replaceChildren(el('div', { class: 'gr-scroll' }, [card]));
      const read = () => ctx.playSegs([c.title, c.text, ...(c.examples || [])].filter(Boolean).map((t) => ({ text: unmark(t), lang: 'hi' })));
      ctx.setRepeat(read);
      await waitTap(next);
      ctx.stop();
      ctx.sfx.page?.();
      ctx.setProgress(++step, total);
    }

    // ---- practise ----
    for (const q of questions) {
      if (!ctx.alive()) return;
      const head = el('div', { class: 'gr-kicker' }, [el('span', { lang: 'hi', text: q.topicTitle.hi }), el('span', { text: q.topicTitle.en })]);
      const prompt = el('p', { class: 'gr-prompt', lang: 'hi' }, marked(q.q));
      const why = el('div', { class: 'gr-why', lang: 'hi', 'aria-live': 'polite' });
      const next = el('button', { class: 'gr-next', lang: 'hi' }, [el('span', { text: 'आगे' }), el('span', { class: 'gr-next-en', text: 'Next' })]);
      const body = el('div', { class: 'gr-body' });
      const card = el('section', { class: `gr-card ask ${q.kind}` }, [head, prompt, body, why]);
      ctx.stage.replaceChildren(el('div', { class: 'gr-scroll' }, [card]));
      ctx.setRepeat(() => sayHi(q.q + (q.s ? `। ${q.s}` : '')));

      if (q.kind === 'tap') {
        const words = tapTokens(q.s).map((t) => Object.assign(el('button', { class: 'gr-word', lang: 'hi', text: t.text }), { core: t.core, item: item(q.topicId) }));
        body.append(el('div', { class: 'gr-sentence' }, words));
        const right = await choose(words, (b) => b.core === q.answer, { ctx, onWrong: () => ctx.sfx.boing() });
        right.classList.add('right');
        await cheer(ctx, right);
      } else if (q.kind === 'sort') {
        const bins = q.bins.map((b) => ({ name: b, list: el('div', { class: 'gr-bin-list', lang: 'hi' }) }));
        const binBox = el('div', { class: 'gr-bins' }, bins.map((b) => el('div', { class: 'gr-bin' }, [el('b', { lang: 'hi', text: b.name }), b.list])));
        const current = el('div', { class: 'gr-sort-item', lang: 'hi' });
        const buttons = el('div', { class: 'gr-options sort-buttons' });
        body.append(current, buttons, binBox);
        for (const it of shuffle(q.items, ctx.rng)) {
          if (!ctx.alive()) return;
          current.textContent = it.text;
          bounce(current);
          const btns = q.bins.map((b) => Object.assign(el('button', { class: 'gr-option', lang: 'hi', text: b }), { bin: b, item: item(q.topicId) }));
          buttons.replaceChildren(...btns);
          const right = await choose(btns, (b) => b.bin === it.bin, { ctx, onWrong: () => ctx.sfx.boing() });
          ctx.sfx.pop();
          bins.find((b) => b.name === right.bin).list.append(el('span', { class: 'gr-chip', text: it.text }));
          await sleep(250);
        }
        current.remove();
        buttons.remove();
        ctx.sfx.chime();
      } else {
        if (q.s) body.append(el('p', { class: 'gr-sentence-text', lang: 'hi' }, marked(q.s)));
        const opts = shuffle(q.options, ctx.rng).map((o) => Object.assign(el('button', { class: 'gr-option', lang: 'hi' }, marked(o)), { option: o, item: item(q.topicId) }));
        body.append(el('div', { class: 'gr-options' }, opts));
        const right = await choose(opts, (b) => b.option === q.answer, { ctx, onWrong: () => ctx.sfx.boing() });
        right.classList.add('right');
        for (const o of opts) o.disabled = o !== right;
        await cheer(ctx, right);
      }
      if (!ctx.alive()) return;
      // why: the rule behind the answer
      why.replaceChildren(el('b', { text: 'क्यों? ' }), ...marked(q.why), next);
      why.classList.add('on');
      why.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      ctx.setRepeat(() => sayHi(q.why));
      await waitTap(next);
      ctx.stop();
      ctx.setProgress(++step, total);
    }
    ctx.complete();
  },
};
