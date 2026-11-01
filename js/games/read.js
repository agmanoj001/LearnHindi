// Post office (KG+): reading words.
// "find": a parcel shows a picture and says its word; deliver it to the house with that word written on it.
// "match": a letter shows a written word; find its picture (tap the word to hear it if stuck).
// Wrong choices look alike (same first letter or matras), so the child reads the whole word.
import { similarWords, shuffle } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, vehicleEl, flyTo, animate } from './kit.js';

export default {
  async start(ctx) {
    const pool = ctx.words(ctx.config.words);
    const modes = ctx.config.modes || ['find', 'match'];
    const targets = ctx.practice(pool, ctx.config.rounds);
    const lang = ctx.settings.lang === 'en' ? 'en' : 'hi';
    const van = vehicleEl(ctx, 'postvan', 'rescuer');
    van.addEventListener('click', () => ctx.sayItem(ctx.word('postvan')));

    const options = (target) => shuffle([target, ...similarWords(target, pool, 2, ctx.rng, ctx.content.matras)], ctx.rng);

    const ok = await runRounds(ctx, targets.length, async (i) => {
      const target = targets[i];
      if (modes[i % modes.length] === 'find') {
        const parcel = el('button', { class: 'parcel', 'aria-label': target.en, html: ctx.picture(target) });
        const houses = options(target).map((w) => Object.assign(ctx.textCard(w, lang, { cls: 'house' }), { item: w }));
        ctx.stage.replaceChildren(el('div', { class: 'scene' }, [van, parcel]), el('div', { class: 'choices street-houses' }, houses));
        const prompt = () => ctx.say('readFind', target);
        parcel.onclick = prompt;
        ctx.setRepeat(prompt);
        prompt();
        const right = await choose(houses, (b) => b.item.id === target.id, { ctx, onWrong: (b) => ctx.sayItem(b.item, [lang]) });
        await flyTo(parcel, right, { duration: 700, scale: 0.4 });
        parcel.style.visibility = 'hidden';
        await cheer(ctx, right);
        ctx.sfx.vroom();
        animate(van, [{ transform: 'translateX(0)' }, { transform: 'translateX(30vw)' }, { transform: 'translateX(0)' }], { duration: 1400 });
        await ctx.sayItem(target);
      } else {
        const letter = el('button', { class: 'card text letter-envelope', lang, 'aria-label': 'word' }, [el('span', { class: 'word-text', text: lang === 'en' ? target.en : target.hi })]);
        const pics = options(target).map((w) => Object.assign(ctx.wordCard(w, { showLabel: false }), { item: w }));
        ctx.stage.replaceChildren(el('div', { class: 'scene' }, [letter]), el('div', { class: 'choices' }, pics));
        letter.onclick = () => ctx.sayItem(target, [lang]);
        const prompt = () => ctx.say('readWord');
        ctx.setRepeat(prompt);
        prompt();
        const right = await choose(pics, (b) => b.item.id === target.id, { ctx, onWrong: (b) => ctx.say('thisIs', b.item) });
        await flyTo(letter, right, { duration: 600, scale: 0.5, keep: false });
        await cheer(ctx, right);
        await ctx.sayItem(target);
      }
      await sleep(300);
    });
    if (ok) ctx.complete();
  },
};
