// Comics (Grades 7 and 8): a comic book to read at your own pace. Panels scroll like a comic strip;
// speech bubbles and narration boxes are in Hindi. Tap a bubble to hear it (each character has their
// own voice pitch), or tap the speaker button to have the whole comic read aloud. Underlined words
// show their meaning. Mysteries stop before the reveal so the reader can name the culprit first.
// At the end: the word list, then three questions; first-try answers earn the stars.
import { el, sleep, choose, cheer, bounce } from './kit.js';
import { castSvg, comicBg, CAST } from '../art-comic.js';
import { sceneSvg } from '../art-scenes.js';
import { shuffle } from '../logic.js';

// Each series has a cover pair, and (if its comics stop for a guess) the words on the guess card.
const DETECTIVE = { badge: 'जासूसी पहेली', en: 'Your turn, detective', sub: 'आगे पढ़ने से पहले अपना अनुमान लगाओ!', right: 'शाबाश, जासूस! तुमने सही पकड़ा। अब देखो, दादी ने कैसे साबित किया...', late: 'आख़िरकार पकड़ ही लिया! अब देखो, दादी ने कैसे साबित किया...' };
export const SERIES = {
  mishti: { hi: 'मिष्टी की मस्ती', en: "Mishti's Mischief", hero: 'mishti', sidekick: 'bijli' },
  rimjhim: { hi: 'रिमझिम का धमाल', en: "Rimjhim's Rumpus", hero: 'rimjhim', sidekick: 'biscuit' },
  dadi: { hi: 'जासूस दादी', en: 'Detective Dadi', hero: 'dadi', sidekick: 'mausi', guess: DETECTIVE },
  birbal: { hi: 'बीरबल की बुद्धि', en: "Birbal's Wit", hero: 'birbal', sidekick: 'akbar', guess: { badge: 'बीरबल की तरह सोचो', en: 'Think like Birbal', sub: 'आगे पढ़ने से पहले सोचो — बीरबल क्या करेगा?', right: 'वाह! बिल्कुल बीरबल जैसी सूझ-बूझ! अब देखो, बीरबल ने क्या किया...', late: 'ठीक पकड़ा! अब देखो, बीरबल ने क्या किया...' } },
  chippu: { hi: 'चिप्पू रोबो', en: 'Chippu the Robot', hero: 'kavya', sidekick: 'chippu', guess: { badge: 'असली मतलब बताओ', en: 'What does it really mean?', sub: 'चिप्पू से पहले तुम समझ लो!', right: 'सही! अब देखो, काव्या ने चिप्पू को कैसे समझाया...', late: 'ठीक! अब देखो, काव्या ने चिप्पू को कैसे समझाया...' } },
  betal: { hi: 'विक्रम और बेताल', en: 'Vikram and Betal', hero: 'vikram', sidekick: 'betal', guess: { badge: 'बेताल की पहेली', en: "Answer Betal's riddle", sub: 'राजा विक्रम से पहले तुम उत्तर दो!', right: 'वाह! तुमने राजा विक्रम जैसा न्याय किया। अब सुनो, विक्रम ने क्या कहा...', late: 'ठीक! अब सुनो, राजा विक्रम ने क्या कहा...' } },
  murari: { hi: 'मास्टर मुरारी', en: 'Master Murari', hero: 'murari', sidekick: 'golu', guess: { badge: 'विज्ञान की पहेली', en: "What's the science?", sub: 'मास्टरजी के बताने से पहले तुम बताओ!', right: 'शाबाश, वैज्ञानिक! अब देखो, मास्टरजी ने कैसे साबित किया...', late: 'ठीक पकड़ा! अब देखो, मास्टरजी ने कैसे समझाया...' } },
};

const LENS = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5 21 21"/></svg>';

// Who is drawn for a name in a panel: a one-off part of this comic ({look, name}) or the main cast.
export function lookOf(comic, who) {
  const part = comic.parts?.[who];
  if (part) {
    const { look, name, ...over } = part;
    return { look, name, over: Object.keys(over).length ? over : null, pitch: CAST[look]?.pitch ?? 1 };
  }
  const c = CAST[who];
  return c ? { look: who, name: c.name?.hi || who, over: null, pitch: c.pitch ?? 1 } : null;
}

// Mark each glossary word the first time it appears in the comic, so it can be tapped for its meaning.
export function glossSplit(text, words, used) {
  const out = [];
  let rest = text;
  for (;;) {
    let best = null;
    for (const w of words) {
      if (used.has(w.hi)) continue;
      const at = rest.indexOf(w.hi);
      if (at >= 0 && (!best || at < best.at)) best = { at, w };
    }
    if (!best) break;
    if (best.at) out.push(rest.slice(0, best.at));
    out.push(best.w);
    used.add(best.w.hi);
    rest = rest.slice(best.at + best.w.hi.length);
  }
  if (rest) out.push(rest);
  return out;
}

export default {
  async start(ctx) {
    const comic = (ctx.content.comics || []).find((c) => c.id === ctx.config.comic);
    if (!comic) return ctx.complete();
    const series = SERIES[comic.series] || SERIES.mishti;
    const screen = ctx.stage.closest('.screen');
    screen?.classList.add(`series-${comic.series}`);
    const words = comic.words || [];
    const used = new Set();
    const guess = comic.guess || null;
    const questions = comic.questions || [];
    const total = comic.panels.length + questions.length + (guess ? 1 : 0);
    const seen = new Set();
    let answered = 0;
    // set by the mystery card: reopened after solving it, show the answer and open the rest
    let solveQuietly = () => {};
    const progress = () => ctx.setProgress(seen.size + answered, total);
    progress();

    // ---- tap a word for its meaning ----
    const pop = el('div', { class: 'gloss-pop', role: 'status' });
    const showMeaning = (w, node) => {
      pop.replaceChildren(el('b', { lang: 'hi', text: w.hi }), el('span', { lang: 'hi', text: w.mean }), w.en ? el('small', { text: w.en }) : '');
      const box = node.getBoundingClientRect();
      const host = book.getBoundingClientRect();
      pop.style.left = `${Math.max(8, Math.min(host.width - 268, box.left - host.left - 20))}px`;
      pop.style.top = `${box.bottom - host.top + book.scrollTop + 6}px`;
      pop.classList.add('on');
      ctx.playSegs([{ text: w.hi, lang: 'hi' }]);
    };
    const textNodes = (text) =>
      glossSplit(text, words, used).map((part) => {
        if (typeof part === 'string') return document.createTextNode(part);
        const g = el('span', { class: 'gloss', tabindex: '0', text: part.hi });
        g.addEventListener('click', (e) => {
          e.stopPropagation();
          showMeaning(part, g);
        });
        return g;
      });

    // ---- reading aloud ----
    let readToken = 0;
    const lineSeg = (text, who) => ({ text, lang: 'hi', pitch: who ? lookOf(comic, who)?.pitch ?? 1 : 1 });
    const sayNode = async (node, seg) => {
      node.classList.add('reading');
      await ctx.playSegs([seg]);
      node.classList.remove('reading');
    };

    // ---- a panel ----
    const panelNode = (p, i) => {
      const chars = (p.cast || []).map((ch) => {
        const look = lookOf(comic, ch.who);
        return el('div', {
          class: `comic-char${ch.flip ? ' flip' : ''}`,
          style: { left: `${ch.at}%` },
          'data-who': ch.who,
          html: look ? castSvg(look.look, { face: ch.face, arms: ch.arms, hold: ch.hold, over: look.over }) : '',
        });
      });
      const lines = [];
      const cap = p.cap ? el('div', { class: 'comic-cap', lang: 'hi' }, textNodes(p.cap)) : null;
      if (cap) lines.push({ node: cap, seg: lineSeg(p.cap, null) });
      const bubbles = (p.say || []).map((b) => {
        const node = el('div', { class: `comic-bubble ${b.kind || 'say'}`, lang: 'hi', tabindex: '0', 'data-who': b.who, 'aria-label': `${lookOf(comic, b.who)?.name || ''}: ${b.text}` }, textNodes(b.text));
        const seg = lineSeg(b.text, b.who);
        node.addEventListener('click', () => {
          readToken++;
          pop.classList.remove('on');
          sayNode(node, seg);
        });
        lines.push({ node, seg });
        return node;
      });
      const prop = p.prop ? el('div', { class: 'comic-prop', style: { left: `${p.prop.at}%` }, html: ctx.picture(ctx.word(p.prop.word)) }) : null;
      const sfx = p.sfx ? el('div', { class: 'comic-sfx', lang: 'hi', text: p.sfx }) : null;
      const node = el('figure', { class: `comic-panel${p.wide ? ' wide' : ''}${p.dark ? ' dark' : ''}`, 'data-i': String(i) }, [
        el('div', { class: 'comic-bg', html: comicBg(p.bg) || sceneSvg(p.bg, { crop: 'bottom' }) }),
        el('div', { class: 'comic-top' }, [cap, bubbles.length ? el('div', { class: 'comic-bubbles' }, bubbles) : null]),
        el('div', { class: 'comic-stage' }, [prop, ...chars, sfx]),
      ]);
      node.lines = lines;
      return node;
    };

    // ---- the book ----
    const book = el('div', { class: 'comic-book' });
    const cover = el('section', { class: 'comic-cover' }, [
      el('div', { class: 'comic-logo' }, [el('b', { lang: 'hi', text: series.hi }), el('span', { text: series.en })]),
      el('h1', { lang: 'hi', text: comic.title.hi }),
      el('p', { class: 'comic-title-en', text: comic.title.en }),
      comic.blurb ? el('p', { class: 'comic-blurb', lang: 'hi', text: comic.blurb }) : null,
      el('div', { class: 'comic-cover-cast' }, [series.hero, series.sidekick].map((id) => el('span', { class: 'comic-cover-char', html: castSvg(id, { face: 'grin', arms: id === series.hero ? 'wave' : 'down' }) }))),
      el('p', { class: 'comic-howto', text: 'बुलबुले पर टैप करो तो सुनाई देगा · रेखांकित शब्दों का अर्थ देखो · Tap a bubble to hear it; tap an underlined word for its meaning.' }),
    ]);
    const panels = comic.panels.map(panelNode);
    const pages = el('div', { class: 'comic-pages' });
    const rest = el('div', { class: 'comic-pages' });
    const cut = guess ? guess.at : panels.length;
    pages.append(...panels.slice(0, cut));
    rest.append(...panels.slice(cut));
    const end = el('div', { class: 'comic-end' });
    book.append(cover, pages);
    if (guess) {
      rest.classList.add('locked');
      book.append(guessCard(), rest);
    }
    book.append(end, pop);

    // ---- bigger text, remembered for next time ----
    const sizeBtn = el('button', { class: 'comic-size', 'aria-label': 'Bigger text', html: '<span lang="hi">अ</span><b>+</b>' });
    const applySize = () => {
      const big = !!ctx.settings.bigText;
      book.classList.toggle('big-text', big);
      sizeBtn.classList.toggle('on', big);
      sizeBtn.setAttribute('aria-pressed', String(big));
      requestAnimationFrame(() => aimTails());
    };
    sizeBtn.addEventListener('click', () => {
      ctx.setSetting?.('bigText', !ctx.settings.bigText);
      ctx.sfx.pop?.();
      applySize();
    });

    // ---- where this comic was left last time ----
    const savedPos = ctx.progress.comicPos?.[comic.id];
    let furthest = savedPos?.panel ?? -1;
    let solved = !!savedPos?.solved;
    let saveTimer = 0;
    const savePos = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => ctx.alive() && ctx.saveProgress({ comicPos: { ...ctx.progress.comicPos, [comic.id]: { panel: Math.max(0, furthest), solved } } }), 500);
    };
    if (savedPos && savedPos.panel >= 2 && savedPos.panel < panels.length - 1) {
      const from = savedPos.panel;
      const resume = el('div', { class: 'comic-resume' }, [
        el('button', {
          class: 'comic-resume-btn',
          onclick: () => {
            resume.remove();
            if (solved && guess) solveQuietly();
            panels[from].scrollIntoView({ behavior: 'smooth', block: 'start' });
          },
        }, [el('b', { lang: 'hi', text: `पैनल ${from + 1} से आगे पढ़ो` }), el('small', { text: `Continue from panel ${from + 1}` })]),
        el('button', { class: 'comic-resume-btn ghost', onclick: () => resume.remove() }, [el('b', { lang: 'hi', text: 'शुरू से' }), el('small', { text: 'From the start' })]),
      ]);
      cover.append(resume);
    }

    ctx.stage.replaceChildren(book, sizeBtn);
    applySize();
    book.addEventListener('scroll', () => pop.classList.remove('on'), { passive: true });
    book.addEventListener('click', (e) => !e.target.closest('.gloss') && pop.classList.remove('on'));

    // point each bubble's tail at whoever is talking
    const aimTails = () => {
      for (const panel of panels) {
        for (const b of panel.querySelectorAll('.comic-bubble')) {
          const who = panel.querySelector(`.comic-char[data-who="${CSS.escape(b.dataset.who || '')}"]`);
          if (!who) {
            b.classList.add('off-panel');
            continue;
          }
          const bb = b.getBoundingClientRect();
          const wb = who.getBoundingClientRect();
          if (!bb.width) continue;
          const x = wb.left + wb.width / 2 - bb.left;
          b.style.setProperty('--tail', `${Math.max(22, Math.min(bb.width - 22, x))}px`);
          b.classList.toggle('tail-left', x < bb.width * 0.35);
          b.classList.toggle('tail-right', x > bb.width * 0.65);
        }
      }
    };
    requestAnimationFrame(aimTails);
    if (typeof ResizeObserver === 'function') new ResizeObserver(() => requestAnimationFrame(aimTails)).observe(book);

    // panels count as read once they have been on screen
    if (typeof IntersectionObserver === 'function') {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries)
            if (e.isIntersecting) {
              seen.add(e.target.dataset.i);
              io.unobserve(e.target);
              if (+e.target.dataset.i > furthest) (furthest = +e.target.dataset.i), savePos();
            }
          progress();
        },
        { root: book, threshold: 0.55 },
      );
      panels.forEach((p) => io.observe(p));
    } else panels.forEach((p) => seen.add(p.dataset.i));

    // the speaker button reads the comic aloud from the first panel on screen; tap again to stop
    const readAloud = async () => {
      const mine = ++readToken;
      if (screen?.classList.contains('reading-aloud')) {
        screen.classList.remove('reading-aloud');
        ctx.stop();
        return;
      }
      screen?.classList.add('reading-aloud');
      const top = book.getBoundingClientRect().top;
      let start = panels.findIndex((p) => p.isConnected && !p.closest('.locked') && p.getBoundingClientRect().bottom > top + 40);
      if (start < 0) start = 0;
      for (let i = start; i < panels.length; i++) {
        const panel = panels[i];
        if (panel.closest('.locked') || mine !== readToken || !ctx.alive()) break;
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(350);
        for (const line of panel.lines) {
          if (mine !== readToken || !ctx.alive()) break;
          await sayNode(line.node, line.seg);
          await sleep(180);
        }
      }
      if (mine === readToken) screen?.classList.remove('reading-aloud');
    };
    ctx.setRepeat(readAloud);

    // ---- guess the culprit (mysteries) ----
    function guessCard() {
      const words = series.guess || DETECTIVE;
      const opts = shuffle(guess.options, ctx.rng).map((o) => Object.assign(el('button', { class: 'comic-answer', lang: 'hi', text: o }), { option: o }));
      const hint = el('p', { class: 'guess-hint', lang: 'hi', text: `संकेत: ${guess.hint || 'कहानी फिर से ध्यान से पढ़ो।'}` });
      const verdict = el('p', { class: 'guess-verdict', lang: 'hi' });
      const card = el('section', { class: 'comic-guess' }, [
        el('div', { class: 'guess-badge' }, [el('span', { html: LENS }), el('b', { lang: 'hi', text: words.badge }), el('span', { text: words.en })]),
        el('p', { class: 'guess-q', lang: 'hi', text: guess.q }),
        el('p', { class: 'guess-sub', lang: 'hi', text: words.sub }),
        el('div', { class: 'comic-answers' }, opts),
        hint,
        verdict,
      ]);
      // reopened after solving it last time: show the answer and open the rest, without asking again
      solveQuietly = () => {
        if (!rest.classList.contains('locked')) return;
        opts.find((o) => o.option === guess.answer)?.classList.add('right');
        for (const o of opts) o.disabled = true;
        verdict.textContent = 'पिछली बार तुमने यह पहेली सुलझा ली थी! · You solved this last time.';
        verdict.classList.add('on');
        answered++;
        progress();
        rest.classList.remove('locked');
        requestAnimationFrame(aimTails);
      };
      choose(opts, (b) => b.option === guess.answer, { ctx, onWrong: () => (hint.classList.add('on'), ctx.sfx.boing()) }).then(async (right) => {
        if (!rest.classList.contains('locked')) return;
        solved = true;
        savePos();
        right.classList.add('right');
        answered++;
        progress();
        await cheer(ctx, right);
        verdict.textContent = right.firstTry ? words.right : words.late;
        verdict.classList.add('on');
        for (const o of opts) o.disabled = true;
        await sleep(700);
        rest.classList.remove('locked');
        requestAnimationFrame(aimTails);
        rest.firstElementChild?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return card;
    }

    // ---- after the last panel: words, then questions ----
    end.append(
      el('section', { class: 'comic-words' }, [
        el('h2', {}, [el('span', { lang: 'hi', text: 'शब्द-भंडार' }), el('small', { text: 'Words from this comic' })]),
        el(
          'ul',
          {},
          words.map((w) => {
            const li = el('li', { tabindex: '0' }, [el('b', { lang: 'hi', text: w.hi }), el('span', { lang: 'hi', text: w.mean }), w.en ? el('small', { text: w.en }) : '']);
            li.addEventListener('click', () => (bounce(li), ctx.playSegs([{ text: `${w.hi}। ${w.mean}`, lang: 'hi' }])));
            return li;
          }),
        ),
      ]),
    );
    const quiz = el('section', { class: 'comic-quiz' });
    end.append(quiz);

    // the questions wait until the comic is read to the end (and any mystery solved)
    await new Promise((resolve) => {
      const last = panels[panels.length - 1];
      if (typeof IntersectionObserver !== 'function') return resolve();
      const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && (io.disconnect(), resolve()), { root: book, threshold: 0.3 });
      io.observe(last);
    });
    if (!ctx.alive()) return;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const opts = shuffle(q.options, ctx.rng).map((o) => Object.assign(el('button', { class: 'comic-answer', lang: 'hi', text: o }), { option: o }));
      quiz.replaceChildren(
        el('h2', {}, [el('span', { lang: 'hi', text: 'समझ की जाँच' }), el('small', { text: `Question ${i + 1} of ${questions.length}` })]),
        el('p', { class: 'quiz-q', lang: 'hi', text: q.q }),
        el('div', { class: 'comic-answers' }, opts),
      );
      const right = await choose(opts, (b) => b.option === q.answer, { ctx });
      if (!ctx.alive()) return;
      right.classList.add('right');
      answered++;
      progress();
      await cheer(ctx, right);
      await sleep(700);
    }
    // finished: next time it opens at the cover
    clearTimeout(saveTimer);
    const { [comic.id]: _done, ...others } = ctx.progress.comicPos || {};
    ctx.saveProgress({ comicPos: others });
    ctx.complete();
  },
};
