// Library (Grade 1+): read-along picture stories, a few questions about the story and, for folktales, the moral.
// Every word on the page can be tapped to hear it. Each visit opens the next story for the stage.
import { sentenceTokens, shuffle, isKeyToken } from '../logic.js';
import { storyLang, worldStoryLang } from '../curriculum.js';
import { el, sleep, choose, runRounds, cheer, waitTap, bounce, ICONS } from './kit.js';
import { clips } from '../storage.js';
import { sceneHtml, sceneClass, sceneSound } from '../scene.js';

const bare = (token) => token.replace(/[।.!?,"“”‘’]/g, '');

export default {
  async start(ctx) {
    const levels = ctx.config.levels || [ctx.level.id];
    const wanted = worldStoryLang(ctx.world);
    const stories = ctx.content.stories.filter((s) => levels.includes(s.level) && storyLang(s) === wanted);
    const key = levels.join('+');
    const pos = ctx.progress.storyPos?.[key] ?? 0;
    // a lesson (or the library) can name the story; otherwise each visit opens the next one
    const story = ctx.config.story ? ctx.content.stories.find((s) => s.id === ctx.config.story) : stories[pos % stories.length];
    if (!ctx.config.story) ctx.saveProgress({ storyPos: { ...ctx.progress.storyPos, [key]: pos + 1 } });

    // an English-only story (a nursery rhyme) is always read in English
    const langs = story.lang === 'en' ? ['en'] : ctx.langs;
    const total = story.pages.length + story.questions.length;
    ctx.setProgress(0, total);
    const lines = (text) => langs.map((l) => ({ text: text[l], lang: l }));
    const pageSegs = (page, n) => langs.flatMap((l, i) => [...(i ? [{ pause: 400 }] : []), { text: page[l], lang: l, clipKey: `story-${story.id}-${n}_${l}` }]);

    // ---- cover ----
    const coverWord = ctx.word(story.cover);
    const play = el('button', { class: 'round-btn big go', 'aria-label': 'Read it to me', html: ICONS.play });
    // From Grade 1 a child can choose to read it themselves: no reading aloud unless they ask (the speaker
    // button, or tapping a word), so they practise reading and listen only for help.
    const canReadSelf = !['toddler', 'kg'].includes(story.level);
    const mine = canReadSelf
      ? el('button', { class: 'bubble self-read', 'aria-label': 'I will read it myself' }, [
          el('span', { class: 'self-icon', html: ICONS.book }),
          el('span', { class: 'self-label' }, [el('b', { lang: 'hi', text: 'मैं ख़ुद पढ़ूँ' }), el('small', { text: "I'll read it" })]),
        ])
      : null;
    ctx.stage.replaceChildren(
      el('div', { class: 'story-cover' }, [
        el('div', { class: 'pic', html: ctx.picture(coverWord) }),
        ...lines(story.title).map((t) => el('div', { class: `story-title ${t.lang}`, lang: t.lang, text: t.text })),
      ]),
      play,
      ...(mine ? [mine] : []),
    );
    // the intro stops for good once the child taps play (it used to talk over the first page)
    let onCover = true;
    const intro = async () => {
      await ctx.say('listenStory');
      if (ctx.alive() && onCover) ctx.playSegs(langs.map((l) => ({ text: story.title[l], lang: l })));
    };
    ctx.setRepeat(intro);
    intro();
    const selfRead = (await Promise.race([waitTap(play), ...(mine ? [waitTap(mine)] : [])])) === mine;
    onCover = false;
    ctx.stop?.();

    // ---- pages ----
    for (const [i, page] of story.pages.entries()) {
      if (!ctx.alive()) return;
      const n = i + 1;
      const pageWord = ctx.word(page.word);
      // a page with an "act" is a little moving scene that follows the story; tapping it plays it again
      const pic = page.act ? stageScene(ctx, page) : el('div', { class: 'pic', html: ctx.picture(pageWord) });
      const textLines = langs.map((l) =>
        el(
          'p',
          { class: `story-line ${l}${langs.length === 1 ? ' main' : ''}`, lang: l },
          sentenceTokens(page[l]).map((t) => {
            // the word that names the picture is marked; tapping it says the word in every language and
            // plays the picture, so the word and the thing it names go together
            const key = isKeyToken(t, pageWord, l);
            const w = el('button', { class: `story-word${key ? ' key' : ''}`, text: t });
            w.addEventListener('click', () => {
              bounce(w);
              if (key) {
                ctx.sayItem(pageWord);
                if (pic.play) pic.play();
                else bounce(pic);
              } else ctx.sayText(bare(t), l);
            });
            return w;
          }),
        ),
      );
      const next = el('button', { class: 'round-btn big go next-page', 'aria-label': 'Next', html: ICONS.next });
      const dots = el('div', { class: 'page-dots', 'aria-label': `Page ${n} of ${story.pages.length}` }, story.pages.map((_, k) => el('i', { class: k < i ? 'done' : k === i ? 'now' : '' })));
      const card = el('div', { class: `story-page${selfRead ? ' self' : ''}` }, [dots, pic, el('div', { class: 'story-text' }, textLines)]);
      ctx.stage.replaceChildren(card, next);
      swipeToTurn(card, next);
      if (page.act) await pic.play();
      if (!ctx.alive()) return;
      const read = async () => {
        card.classList.add('reading');
        const stopHighlight = readAlong(textLines, page, langs, ctx.settings.voice?.rate || 0.9);
        await ctx.playSegs(pageSegs(page, n));
        stopHighlight();
        card.classList.remove('reading');
        next.classList.add('ready');
      };
      ctx.setRepeat(read);
      // reading it themselves: the page waits quietly; the speaker button reads it if they want help
      if (selfRead) next.classList.add('ready');
      else read();
      await waitTap(next);
      ctx.stop?.();
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

// Swipe a page to the left to turn it, like a book (a tap on a word still works).
function swipeToTurn(card, next) {
  let x0 = null;
  let y0 = 0;
  card.addEventListener('pointerdown', (e) => {
    x0 = e.clientX;
    y0 = e.clientY;
  });
  card.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0;
    const dy = e.clientY - y0;
    x0 = null;
    if (dx < -60 && Math.abs(dy) < Math.abs(dx) * 0.6) next.click();
  });
  card.addEventListener('pointercancel', () => (x0 = null));
}

// A page's moving scene. play() starts it (again) with its sound, and waits a moment so the sound
// is heard before the reading starts.
function stageScene(ctx, page) {
  const scene = el('button', {
    class: `pic ${sceneClass(page.act)}`,
    'aria-label': 'Play the picture again',
    html: sceneHtml(page.act, page.word, (id) => ctx.picture(ctx.word(id))),
  });
  const sound = sceneSound(page.act);
  scene.play = async () => {
    scene.classList.remove('play');
    void scene.offsetWidth; // restart the CSS animations
    scene.classList.add('play');
    if (sound && ctx.sfx[sound]) {
      ctx.sfx[sound]();
      await sleep(350);
    }
  };
  scene.addEventListener('click', () => scene.play());
  return scene;
}

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
