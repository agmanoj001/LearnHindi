// Quiz (Grade 1+): a question, maybe a picture and a sentence with a gap, and big answer bubbles.
// Used for grammar (लिंग, सर्वनाम, काल), same-meaning words, punctuation, idioms and more.
// Banks live in content.json "quizzes"; a lesson names one with { "bank": "g3-synonyms" }.
import { sample, shuffle } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, readChoices, youngReader } from './kit.js';

const GAP = '___';

export default {
  async start(ctx) {
    const bank = ctx.content.quizzes[ctx.config.bank];
    const questions = sample(bank.questions, Math.min(ctx.config.rounds || 5, bank.questions.length), ctx.rng);

    const ok = await runRounds(ctx, questions.length, async (i) => {
      const q = questions[i];
      // easier tiers show fewer options (never fewer than 2, always the answer)
      const wrong = shuffle(q.options.filter((o) => o !== q.answer), ctx.rng).slice(0, Math.max(1, ctx.nChoices - 1));
      const options = shuffle([q.answer, ...wrong], ctx.rng);
      const pic = q.word ? el('div', { class: 'prompt-pic', html: ctx.picture(ctx.word(q.word)) }) : null;
      const shown = q.show ? el('div', { class: 'quiz-sentence', lang: 'hi' }, q.show.split(GAP).flatMap((part, k) => (k ? [el('span', { class: 'gap', text: '?' }), part] : [part]))) : null;
      const question = el('div', { class: 'quiz-question' }, [
        el('p', { class: 'quiz-q hi', lang: 'hi', text: q.hi }),
        ctx.settings.lang !== 'hi' && q.en ? el('p', { class: 'quiz-q en', text: q.en }) : null,
      ]);
      const btns = options.map((o) =>
        Object.assign(
          q.pictures ? ctx.wordCard(ctx.word(o)) : el('button', { class: 'card answer', lang: 'hi' }, [el('span', { class: 'word-text', text: o })]),
          { item: q.pictures ? ctx.word(o) : null, value: o },
        ),
      );
      ctx.stage.replaceChildren(...[question, pic, shown, el('div', { class: 'choices answers' }, btns)].filter(Boolean));
      let answered = false;
      const prompt = async () => {
        await ctx.sayLines(q);
        if (ctx.alive() && q.show) await ctx.sayText(q.show.replace(GAP, ' … '), 'hi');
        // little ones hear the picture names, one by one
        if (ctx.alive() && !answered && q.pictures && youngReader(ctx)) await readChoices(ctx, btns, (b) => [{ text: b.item.hi, lang: 'hi', clipKey: `${b.item.id}_hi` }]);
      };
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.value === q.answer, {
        ctx,
        onWrong: (b) => (q.pictures ? ctx.say('thisIs', b.item) : ctx.sayText(b.value, 'hi')),
      });
      answered = true;
      if (shown) {
        shown.querySelector('.gap').textContent = q.answer;
        shown.classList.add('done');
      }
      await cheer(ctx, right);
      await ctx.sayText(q.say || (q.show ? q.show.replace(GAP, q.answer) : q.pictures ? ctx.word(q.answer).hi : q.answer), 'hi');
      if (q.pictures) await ctx.saySynonym(ctx.word(q.answer));
      await sleep(250);
    });
    if (ok) ctx.complete();
  },
};
