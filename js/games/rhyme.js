// Ice-cream van (Grade 1+): rhyming words. Hear a word, pick the scoop that rhymes with it (नल -> जल, car -> star).
import { makeRhymeRound, langForRound } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, vehicleEl, bounce, readChoices } from './kit.js';

export default {
  async start(ctx) {
    const groups = ctx.config.groups;
    const ok = await runRounds(ctx, ctx.config.rounds, async (i) => {
      let lang = langForRound(ctx.settings.lang, i);
      let round = makeRhymeRound(groups, lang, ctx.rng, ctx.nChoices - 1);
      if (!round) {
        lang = lang === 'hi' ? 'en' : 'hi';
        round = makeRhymeRound(groups, lang, ctx.rng, ctx.nChoices - 1);
      }
      const target = ctx.word(round.target);
      const vendor = ctx.helper('vendor', 'icecreamvan');
      const van = vehicleEl(ctx, vendor.id, `rescuer${vendor.vehicle ? '' : ' creature'}`);
      const scoop = (w, cls) => el('button', { class: `card scoop ${cls}`, 'aria-label': w.en }, [el('span', { class: 'pic', html: ctx.picture(w) }), el('span', { class: 'word-text small', lang, text: w[lang] })]);
      const big = scoop(target, 'target');
      const btns = round.options.map((id) => Object.assign(scoop(ctx.word(id), 'cone'), { item: ctx.word(id) }));
      ctx.stage.replaceChildren(el('div', { class: 'scene' }, [van, big]), el('div', { class: 'choices cones' }, btns));
      // rhyming is about hearing: every scoop is said aloud too, so no reading is needed
      let answered = false;
      const prompt = async () => {
        await ctx.say('rhymesWith', target, [lang]);
        if (ctx.alive() && !answered) await readChoices(ctx, btns, (b) => [{ text: b.item[lang], lang, clipKey: `${b.item.id}_${lang}` }]);
      };
      big.onclick = () => ctx.sayItem(target, [lang]);
      van.onclick = prompt;
      ctx.setRepeat(prompt);
      prompt();
      const right = await choose(btns, (b) => b.item.id === round.answer, { ctx, onWrong: (b) => ctx.sayItem(b.item, [lang]) });
      answered = true;
      await cheer(ctx, right);
      // say the pair together so the rhyme is heard
      await ctx.sayItem(target, [lang]);
      bounce(right);
      await ctx.sayAnswer(right.item, [lang]);
      await sleep(200);
    });
    if (ok) ctx.complete();
  },
};
