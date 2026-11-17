// साथ खेलो: two players take turns on one device, each at their own level; one shared jar of stars
// (js/together.js picks the questions). The other player may help with the 💡.
import { togetherQuestion, TOGETHER_ROUNDS } from '../together.js';
import { el, sleep, choose, runRounds, cheer, numberCard, sparkleAt } from './kit.js';
import { mascotSvg } from '../mascot.js';

const GAP = '___';
const personSvg = () =>
  '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="34" r="20" fill="#F2C29A"/><path d="M50 12 Q30 12 30 34 Q34 20 50 20 Q66 20 70 34 Q70 12 50 12 Z" fill="#2B2D42"/><path d="M18 98 Q20 62 50 62 Q80 62 82 98 Z" fill="#6C63FF"/></svg>';

export default {
  async start(ctx) {
    const players = (ctx.config.players || []).slice(0, 2);
    if (players.length < 2) return void ctx.complete();
    const rounds = ctx.config.rounds || TOGETHER_ROUNDS;
    const used = new Set();
    let stars = 0;
    const jar = el('b', { class: 'team-count', text: '0' });
    const chips = players.map((p, i) =>
      el('div', { class: `player-chip p${i + 1}` }, [
        el('span', { class: 'player-face', html: p.avatar ? mascotSvg(p.avatar) : personSvg() }),
        el('span', { class: 'player-name', text: p.name || (p.level === 'adult' ? 'बड़े' : `खिलाड़ी ${i + 1}`) }),
      ]),
    );
    const bar = el('div', { class: 'team-bar' }, [chips[0], el('div', { class: 'team-jar', 'aria-label': 'Team stars' }, [el('span', { text: '★' }), jar]), chips[1]]);
    const area = el('div', { class: 'together-area' });
    ctx.stage.replaceChildren(bar, area);

    const ok = await runRounds(ctx, rounds, async (i) => {
      const who = i % 2;
      const p = players[who];
      chips.forEach((c, k) => c.classList.toggle('turn', k === who));
      const q = togetherQuestion(ctx.content, p.level, ctx.rng, used);
      let btns;
      let shown = [];
      let prompt;
      if (q.kind === 'hear-pic' || q.kind === 'read-pic') {
        btns = q.options.map((id) => Object.assign(ctx.wordCard(ctx.word(id), { showLabel: false }), { item: ctx.word(id), v: id }));
        if (q.kind === 'read-pic') shown = [el('div', { class: 'together-word', lang: 'hi', text: q.word.hi })];
        prompt = () => (q.kind === 'hear-pic' ? ctx.say('find', ctx.word(q.word.id)) : ctx.say('readWord'));
      } else if (q.kind === 'quiz') {
        const pics = q.quiz.pictures;
        btns = q.options.map((o) => Object.assign(pics ? ctx.wordCard(ctx.word(o)) : el('button', { class: 'card answer', lang: 'hi' }, [el('span', { class: 'word-text', text: o })]), { v: o }));
        shown = [
          el('div', { class: 'quiz-question' }, [el('p', { class: 'quiz-q hi', lang: 'hi', text: q.quiz.hi }), ctx.settings.lang !== 'hi' && q.quiz.en ? el('p', { class: 'quiz-q en', text: q.quiz.en }) : null]),
          q.quiz.show ? el('div', { class: 'quiz-sentence', lang: 'hi', text: q.quiz.show.replace(GAP, ' … ') }) : null,
        ];
        prompt = () => ctx.sayLines(q.quiz);
      } else {
        btns = q.options.map((v) => Object.assign(numberCard(ctx, ctx.numbers[v - 1]), { v }));
        shown = [el('div', { class: 'together-word', lang: 'hi', text: q.number.hi })];
        prompt = () => ctx.say('gintiRead');
      }
      area.replaceChildren(el('div', { class: `turn-banner p${who + 1}` }, [el('span', { lang: 'hi', text: who ? 'दूसरे खिलाड़ी की बारी' : 'पहले खिलाड़ी की बारी' }), el('small', { text: p.name ? ` · ${p.name}` : '' })]), ...shown.filter(Boolean), el('div', { class: `choices${q.kind === 'quiz' && !q.quiz.pictures ? ' answers' : ''}` }, btns));
      ctx.setRepeat(async () => {
        await ctx.say(who ? 'turnTwo' : 'turnOne');
        await prompt();
      });
      await ctx.say(who ? 'turnTwo' : 'turnOne');
      prompt();
      const right = await choose(btns, (b) => b.v === q.answer, { ctx });
      await cheer(ctx, right);
      stars++;
      jar.textContent = String(stars);
      sparkleAt(jar.parentNode, { count: 10 });
      await sleep(500);
    });
    if (!ok) return;
    chips.forEach((c) => c.classList.add('turn'));
    await ctx.say('teamDone');
    ctx.complete();
  },
};
