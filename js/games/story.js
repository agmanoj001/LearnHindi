// Library (Grade 1+): read-along picture stories, a few questions about the story and, for folktales, the moral.
// Every word on the page can be tapped to hear it. Each visit opens the next story for the stage.
import { sentenceTokens, shuffle } from '../logic.js';
import { el, sleep, choose, runRounds, cheer, waitTap, bounce, ICONS } from './kit.js';
import { clips } from '../storage.js';

const bare = (token) => token.replace(/[।.!?,"]/g, '');

export default {
  async start(ctx) {
    const levels = ctx.config.levels || [ctx.level.id];
    const stories = ctx.content.stories.filter((s) => levels.includes(s.level));
    const key = levels.join('+');
    const pos = ctx.progress.storyPos?.[key] ?? 0;
    // a lesson (or the library) can name the story; otherwise each visit opens the next one
    const story = ctx.config.story ? ctx.content.stories.find((s) => s.id === ctx.config.story) : stories[pos % stories.length];
    if (!ctx.config.story) ctx.saveProgress({ storyPos: { ...ctx.progress.storyPos, [key]: pos + 1 } });

    const langs = ctx.langs;
    const total = story.pages.length + story.questions.length;
    ctx.setProgress(0, total);
    const lines = (text) => langs.map((l) => ({ text: text[l], lang: l }));
    const pageSegs = (page, n) => langs.flatMap((l, i) => [...(i ? [{ pause: 400 }] : []), { text: page[l], lang: l, clipKey: `story-${story.id}-${n}_${l}` }]);

    // ---- cover ----
    const coverWord = ctx.word(story.cover);
    const play = el('button', { class: 'round-btn big go', 'aria-label': 'Start', html: ICONS.play });
    ctx.stage.replaceChildren(
      el('div', { class: 'story-cover' }, [
        el('div', { class: 'pic', html: ctx.picture(coverWord) }),
        ...lines(story.title).map((t) => el('div', { class: `story-title ${t.lang}`, lang: t.lang, text: t.text })),
      ]),
      play,
    );
    // the intro stops for good once the child taps play (it used to talk over the first page)
    let onCover = true;
    const intro = async () => {
      await ctx.say('listenStory');
      if (ctx.alive() && onCover) ctx.playSegs(langs.map((l) => ({ text: story.title[l], lang: l })));
    };
    ctx.setRepeat(intro);
    intro();
    await waitTap(play);
    onCover = false;

    // ---- pages ----
    for (const [i, page] of story.pages.entries()) {
      if (!ctx.alive()) return;
      const n = i + 1;
      const textLines = langs.map((l) =>
        el(
          'p',
          { class: `story-line ${l}`, lang: l },
          sentenceTokens(page[l]).map((t) => {
            const w = el('button', { class: 'story-word', text: t });
            w.addEventListener('click', () => {
              bounce(w);
              ctx.sayText(bare(t), l);
            });
            return w;
          }),
        ),
      );
      const next = el('button', { class: 'round-btn big go next-page', 'aria-label': 'Next', html: ICONS.next });
      const card = el('div', { class: 'story-page' }, [el('div', { class: 'pic', html: ctx.picture(ctx.word(page.word)) }), ...textLines]);
      ctx.stage.replaceChildren(card, next);
      const read = async () => {
        card.classList.add('reading');
        const stopHighlight = readAlong(textLines, page, langs, ctx.settings.voice?.rate || 0.9);
        await ctx.playSegs(pageSegs(page, n));
        stopHighlight();
        card.classList.remove('reading');
        next.classList.add('ready');
      };
      ctx.setRepeat(read);
      read();
      await waitTap(next);
      ctx.sfx.pop();
      ctx.setProgress(n, total);
    }

    // ---- questions ----
    const ok = await runRounds(
      ctx,
      story.questions.length,
      async (i) => {
        const q = story.questions[i];
        // picture questions show word cards; "text" questions (Grade 2+) show short Hindi answer bubbles.
        // Easier tiers drop some wrong options, always keeping the answer and at least one other.
        const wrong = shuffle(q.options.filter((o) => o !== q.answer), ctx.rng).slice(0, Math.max(1, ctx.nChoices - 1));
        const options = shuffle([q.answer, ...wrong], ctx.rng);
        const btns = options.map((o) =>
          q.text
            ? Object.assign(el('button', { class: 'card answer', lang: 'hi' }, [el('span', { class: 'word-text', text: o })]), { value: o })
            : Object.assign(ctx.wordCard(ctx.word(o)), { item: ctx.word(o), value: o }),
        );
        ctx.stage.replaceChildren(
          el('div', { class: 'story-question' }, lines(q).map((t) => el('p', { class: `story-line ${t.lang}`, lang: t.lang, text: t.text }))),
          el('div', { class: `choices${q.text ? ' answers' : ''}` }, btns),
        );
        const ask = () => ctx.playSegs(langs.flatMap((l, k) => [...(k ? [{ pause: 400 }] : []), { text: q[l], lang: l }]));
        ctx.setRepeat(ask);
        ask();
        const right = await choose(btns, (b) => b.value === q.answer, {
          ctx,
          onWrong: (b) => (q.text ? ctx.sayText(b.value, 'hi') : ctx.say('thisIs', b.item)),
        });
        await cheer(ctx, right);
        if (q.text) await ctx.sayText(q.answer, 'hi');
        else await ctx.sayItem(right.item);
        await sleep(300);
      },
      { offset: story.pages.length, total },
    );
    if (!ok) return;

    // ---- tell it back: the child retells the story in their own words (if a grown-up turned it on) ----
    if (ctx.settings.retell && story.kind !== 'poem' && typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      await tellItBack(ctx, story);
      if (!ctx.alive()) return;
    }

    // ---- the moral (सीख), for folktales that have one ----
    if (story.moral) {
      const done = el('button', { class: 'round-btn big go', 'aria-label': 'Done', html: ICONS.check });
      const card = el('div', { class: 'story-moral' }, [
        el('div', { class: 'moral-badge', html: ICONS.sparkle }),
        el('div', { class: 'moral-head' }, [el('span', { class: 'hi', lang: 'hi', text: 'सीख' }), el('span', { class: 'en', text: 'The lesson' })]),
        ...lines(story.moral).map((t) => el('p', { class: `story-line ${t.lang}`, lang: t.lang, text: t.text })),
      ]);
      ctx.stage.replaceChildren(card, done);
      ctx.sfx.sparkle();
      const read = async () => {
        await ctx.playSegs(langs.flatMap((l, k) => [...(k ? [{ pause: 400 }] : []), { text: story.moral[l], lang: l, clipKey: `story-${story.id}-moral_${l}` }]));
        done.classList.add('ready');
      };
      ctx.setRepeat(read);
      read();
      await waitTap(done);
      if (!ctx.alive()) return;
    }
    ctx.complete();
  },
};

// Read-along: light up each word as it is spoken. Voices that report word boundaries drive it
// exactly; otherwise (and for family recordings) the timing is estimated from word length.
function readAlong(lineEls, page, langs, rate) {
  const lines = langs.map((l, i) => {
    const text = page[l];
    let at = 0;
    const words = [...lineEls[i].querySelectorAll('.story-word')].map((btn) => {
      const start = text.indexOf(btn.textContent, at);
      at = start >= 0 ? start + btn.textContent.length : at;
      return { btn, start: Math.max(0, start), end: at };
    });
    return { lang: l, text, words };
  });
  let current = null;
  let timer = 0;
  let exact = false;
  const light = (w) => {
    for (const l of lines) for (const x of l.words) x.btn.classList.toggle('now', x === w);
  };
  const estimate = (line, k = 0) => {
    if (exact || !line.words[k]) return;
    light(line.words[k]);
    const ms = (180 + 70 * line.words[k].btn.textContent.length) / rate;
    timer = setTimeout(() => estimate(line, k + 1), ms);
  };
  const onCaption = (e) => {
    clearTimeout(timer);
    current = lines.find((l) => l.text === e.detail.text) || null;
    exact = false;
    if (current) estimate(current);
  };
  const onWord = (e) => {
    if (!current || e.detail.text !== current.text) return;
    exact = true;
    clearTimeout(timer);
    light(current.words.find((w) => e.detail.charIndex >= w.start && e.detail.charIndex < w.end + 1));
  };
  window.addEventListener('vt-caption', onCaption);
  window.addEventListener('vt-word', onWord);
  return () => {
    clearTimeout(timer);
    window.removeEventListener('vt-caption', onCaption);
    window.removeEventListener('vt-word', onWord);
    light(null);
  };
}

// Retelling a story in your own words is one of the best checks of understanding (and great
// speaking practice). The pictures help as prompts. The recording stays on this device.
async function tellItBack(ctx, story) {
  const key = `retell:${ctx.profileId}:${story.id}`;
  const strip = el('div', { class: 'retell-strip' }, story.pages.map((p) => el('span', { class: 'pic', html: ctx.picture(ctx.word(p.word)) })));
  const mic = el('button', { class: 'round-btn big retell-mic', 'aria-label': 'Record', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8 21h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' });
  const done = el('button', { class: 'round-btn big go', 'aria-label': 'Done', html: ICONS.check });
  const skip = el('button', { class: 'bubble ghost retell-skip', text: 'Skip · छोड़ो' });
  const status = el('p', { class: 'retell-status' });
  ctx.stage.replaceChildren(
    el('div', { class: 'retell-card' }, [
      el('p', { class: 'story-line hi', lang: 'hi', text: 'अब तुम कहानी सुनाओ!' }),
      el('p', { class: 'story-line en', text: 'Now you tell the story!' }),
      strip,
      status,
    ]),
    el('div', { class: 'retell-actions' }, [skip, mic, done]),
  );
  const prompt = () => ctx.sayLines({ hi: 'अब तुम कहानी सुनाओ! लाल बटन दबाओ और बोलो।', en: 'Now you tell the story! Press the red button and talk.' });
  ctx.setRepeat(prompt);
  prompt();
  let rec = null;
  let stopTimer = 0;
  const stopRec = () => rec && rec.state === 'recording' && rec.stop();
  mic.addEventListener('click', async () => {
    if (rec && rec.state === 'recording') return stopRec();
    ctx.stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        clearTimeout(stopTimer);
        stream.getTracks().forEach((t) => t.stop());
        mic.classList.remove('on');
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        await clips.put(key, blob).catch(() => {});
        status.textContent = 'Saved! Tap ✓ to finish, or record again.';
        const a = new Audio(URL.createObjectURL(blob));
        a.play().catch(() => {});
      };
      rec.start();
      mic.classList.add('on');
      status.textContent = 'Listening… tap the button again to stop.';
      stopTimer = setTimeout(stopRec, 90000);
    } catch {
      status.textContent = 'The microphone is not available. A grown-up can allow it in the browser.';
    }
  });
  await Promise.race([waitTap(done), waitTap(skip)]);
  stopRec();
  ctx.sfx.pop();
}
