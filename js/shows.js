// Show time: short animated comic episodes acted out by the guides, and Story radio.
// Episodes are scripts in content.json "shows" (see README). Nothing is a video file: the player
// builds every scene from the app's own drawings, so an episode weighs a few kilobytes and works
// offline. Every line can be spoken by a family recording (Grown-ups › Record your voice › Shows).
import { el, sleep, bounce, wobble, ICONS } from './ui.js';
import { createMascot, mascotSvg } from './mascot.js';
import { sceneSvg } from './art-scenes.js';
import { picture, pictureForWord } from './art.js';
import { mathModel } from './art-math.js';
import { play, stop as stopSpeech } from './audio.js';
import { langsFor, BEAT_KINDS, beatKind, showLines } from './logic.js';
import { isoDay } from './curriculum.js';
import { lookOf, SERIES } from './games/comic.js';

// ---------- pure helpers (tested in tests/shows.test.js) ----------

export { BEAT_KINDS, beatKind, showLines };
export const AUTOPLAY_MAX = 3; // episodes in a row before a stretch break
export const ASK_WAIT_MS = 6000; // watch mode: how long a question waits before the answer is shown

// This grade's episodes first, then the rest in grade order.
export function showOrder(content, level) {
  const order = (content.levels || []).map((l) => l.id);
  const rank = (s) => (s.level === level ? -1 : order.indexOf(s.level));
  return (content.shows || []).map((s, i) => ({ s, i })).sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i).map((x) => x.s);
}

export function nextShow(content, level, id, progress) {
  const list = showOrder(content, level);
  const at = list.findIndex((s) => s.id === id);
  const rest = [...list.slice(at + 1), ...list.slice(0, Math.max(0, at))];
  return rest.find((s) => !progress?.shows?.[s.id]) || rest[0] || null;
}

// Split Hindi into letter clusters (क्ष, ना …) so a syllable can be lit without breaking the script.
export function clusters(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) return Array.from(new Intl.Segmenter('hi', { granularity: 'grapheme' }).segment(text), (x) => x.segment);
  return Array.from(text);
}
export const markClusters = (text, mark) => clusters(text).map((t) => ({ text: t, on: !!mark && t.includes(mark) }));

// "6 + 4 = 10" said out loud
export const speakMath = (t) => t.replace(/\+/g, ' plus ').replace(/=/g, ' is ').replace(/\s+/g, ' ').trim();

// Story radio: this grade's and the grade below's stories and rhymes, a rhyme after every two stories.
// Grades 7 and 8 read comics instead of picture stories, so there the radio plays the comics as radio
// plays: this grade's first (taking turns between the series), then the grade below's. A grade with
// nothing of its own or below (Toddler) gets the next grade's.
export function radioPlaylist(content, level) {
  const order = (content.levels || []).map((l) => l.id);
  const i = order.indexOf(level);
  const levels = order.slice(Math.max(0, i - 1), i + 1);
  const all = (content.stories || []).filter((s) => levels.includes(s.level));
  const mine = (s) => (s.level === level ? 0 : 1);
  const stories = all.filter((s) => s.kind !== 'poem').sort((a, b) => mine(a) - mine(b));
  const poems = all.filter((s) => s.kind === 'poem').sort((a, b) => mine(a) - mine(b));
  const out = [];
  for (const lv of [level, ...levels.filter((l) => l !== level).reverse()]) out.push(...takeTurns((content.comics || []).filter((c) => c.level === lv)));
  while (stories.length || poems.length) {
    out.push(...stories.splice(0, 2));
    if (poems.length) out.push(poems.shift());
  }
  // nothing at this grade or below (the youngest grade): play the next grade's rhymes and stories
  if (!out.length && i >= 0 && i + 1 < order.length) return radioPlaylist(content, order[i + 1]);
  return out;
}

// one comic from each series in turn, keeping each series in its own order
function takeTurns(comics) {
  const bySeries = new Map();
  for (const c of comics) bySeries.set(c.series, [...(bySeries.get(c.series) || []), c]);
  const queues = [...bySeries.values()];
  const out = [];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift());
  return out;
}

// What the radio says for a comic: the series and title, then every panel. A caption or sound is read by
// the narrator; each character speaks in their own voice pitch, named whenever the speaker changes. A
// mystery or riddle stops for a "think" before its reveal, and the comic ends with one of its questions.
export function comicRadioSteps(comic) {
  const series = SERIES[comic.series];
  const narrator = (text) => ({ text, lang: 'hi' });
  const steps = [{ sfx: 'jingle' }, { pause: 700 }];
  steps.push({ show: 'title', say: [narrator(`अब सुनो रेडियो-नाटक${series ? `, ${series.hi}` : ''}: ${comic.title.hi}`)] });
  let last = null;
  comic.panels.forEach((p, n) => {
    if (comic.guess && n === comic.guess.at) {
      steps.push({ pause: 600 }, { show: 'think', say: [narrator(`सोचो: ${comic.guess.q}`)] }, { pause: 5000, show: 'think' });
      last = null;
    }
    const say = [];
    if (p.cap) say.push(narrator(p.cap)), (last = null);
    if (p.sfx) say.push(narrator(p.sfx));
    for (const b of p.say || []) {
      const look = lookOf(comic, b.who);
      const name = look?.name || '';
      const lead = b.kind === 'think' ? `${name} ने मन में सोचा: ` : b.kind === 'whisper' ? `${name}, धीरे से: ` : b.who !== last ? `${name}: ` : '';
      say.push({ text: lead + b.text, lang: 'hi', pitch: look?.pitch ?? 1 });
      last = b.who;
    }
    if (say.length) steps.push({ pause: 350 }, { show: 'page', page: n, say });
  });
  const q = (comic.questions || [])[0];
  if (q) steps.push({ pause: 600 }, { show: 'think', say: [narrator(`सोचो: ${q.q}`)] }, { pause: 3500, show: 'think' }, { show: 'answer', say: [narrator(`जवाब: ${q.answer}`)] });
  steps.push({ pause: 1800 });
  return steps;
}

// What the radio says for one story: a jingle, the title, every page, the moral, then a "think" question.
export function radioSteps(story, langs, words = {}) {
  const ls = story.lang === 'en' ? ['en'] : langs;
  const line = (text, l, clipKey) => ({ text, lang: l, ...(clipKey ? { clipKey } : {}) });
  const both = (t, keyBase) => ls.filter((l) => t[l]).map((l) => line(t[l], l, keyBase ? `${keyBase}_${l}` : null));
  const steps = [{ sfx: 'jingle' }, { pause: 700 }];
  const intro = story.kind === 'poem' ? { hi: 'अब सुनो कविता', en: 'Now, a rhyme' } : { hi: 'अब सुनो कहानी', en: 'Now, a story' };
  steps.push({ show: 'title', say: ls.flatMap((l) => [line(`${intro[l]}: ${story.title[l] || story.title.hi}`, l)]) });
  story.pages.forEach((p, n) => {
    steps.push({ pause: 500 }, { show: 'page', page: n, say: both(p, `story-${story.id}-${n + 1}`) });
  });
  if (story.moral) steps.push({ pause: 500 }, { show: 'moral', say: [...ls.map((l) => line(l === 'hi' ? 'सीख:' : 'The lesson:', l)), ...both(story.moral, `story-${story.id}-moral`)] });
  const q = (story.questions || [])[0];
  if (q) {
    const answer = q.text ? { hi: q.answer, en: q.answer } : words[q.answer] ? { hi: words[q.answer].hi, en: words[q.answer].en } : null;
    steps.push({ pause: 600 }, { show: 'think', say: ls.filter((l) => q[l]).map((l) => line(`${l === 'hi' ? 'सोचो' : 'Think'}: ${q[l]}`, l)) }, { pause: 3500, show: 'think' });
    if (answer) steps.push({ show: 'answer', say: (q.text ? ['hi'] : ls).map((l) => line(`${l === 'hi' ? 'जवाब' : 'The answer'}: ${answer[l]}`, l)) });
  }
  steps.push({ pause: 1800 });
  return steps;
}

// ---------- shared bits ----------

const TV = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8 3l4 4 4-4"/><path d="M10 11v5l4-2.5z" fill="currentColor"/></svg>';
const RADIO = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M7 8l10-5"/><circle cx="15.5" cy="14" r="2.6"/><path d="M6.5 12.5h4M6.5 15.5h4"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.5"/><rect x="13.5" y="5" width="4" height="14" rx="1.5"/></svg>';
const EAR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4"/></svg>';
export const SHOW_ICONS = { tv: TV, radio: RADIO };

const levelName = (api, id) => api.state.content.levels.find((l) => l.id === id)?.name || { hi: id, en: id };
const worldOf = (api, show) => api.state.content.worlds.find((w) => w.id === show.world);

function markWatched(api, show) {
  const p = api.state.progress;
  const prev = p.shows?.[show.id];
  api.state.progress = { ...p, shows: { ...(p.shows || {}), [show.id]: { views: (prev?.views || 0) + 1, last: isoDay(Date.now()) } } };
  api.persistProgress();
}

function wordText(text, mark) {
  return el('span', { class: 'show-word-text', lang: 'hi' }, markClusters(text, mark).map((c) => el('span', { class: c.on ? 'lit' : '', text: c.text })));
}

// Light each word of a spoken line as it is said (karaoke subtitles, like Same Language Subtitling).
function karaoke(spans, text, rate = 0.9) {
  let at = 0;
  const words = spans.map((s) => {
    const start = text.indexOf(s.textContent, at);
    at = start >= 0 ? start + s.textContent.length : at;
    return { s, start: Math.max(0, start), end: at };
  });
  let timer = 0;
  let exact = false;
  const light = (w) => words.forEach((x) => x.s.classList.toggle('now', x === w));
  const estimate = (k) => {
    if (exact || !words[k]) return;
    light(words[k]);
    timer = setTimeout(() => estimate(k + 1), (200 + 75 * words[k].s.textContent.length) / rate);
  };
  const onWord = (e) => {
    if (e.detail.text !== text) return;
    exact = true;
    clearTimeout(timer);
    light(words.find((w) => e.detail.charIndex >= w.start && e.detail.charIndex < w.end) || null);
  };
  window.addEventListener('vt-word', onWord);
  estimate(0);
  return () => {
    clearTimeout(timer);
    window.removeEventListener('vt-word', onWord);
    light(null);
  };
}

// a matra on its own is written on a dotted circle (◌ा), the way textbooks show it
const MATRA = /^[\u0900-\u0903\u093A-\u094F\u0955-\u0957\u0962\u0963]+$/;
export const withBase = (t) => (MATRA.test(t) ? `\u25CC${t}` : t);

const splitWords = (text) => text.split(/(\s+)/).map((w) => (/^\s+$/.test(w) ? document.createTextNode(w) : el('span', { class: 'kw', text: w })));

// ---------- the episode list ----------

export function showsHome(api) {
  const { content, settings, progress } = api.state;
  api.state.showRun = 0;
  const list = showOrder(content, settings.level);
  const mode = settings.showMode === 'play' ? 'play' : 'watch';
  const modeBtn = (value, hi, en) =>
    el('button', {
      class: `mode-btn${mode === value ? ' on' : ''}`,
      'aria-pressed': mode === value ? 'true' : 'false',
      onclick: () => {
        settings.showMode = value;
        api.persistSettings();
        api.sfx.pop();
        showsHome(api);
      },
    }, [el('b', { lang: 'hi', text: hi }), el('span', { text: en })]);
  const card = (show) => {
    const w = worldOf(api, show);
    const seen = progress.shows?.[show.id];
    const first = show.scenes[0];
    const b = el('button', { class: `show-card theme-${first.bg}`, style: { '--place': w?.color || '#6C63FF' }, 'aria-label': show.title.en }, [
      el('span', { class: 'show-thumb', html: sceneSvg(first.bg, { crop: 'bottom' }) }, [el('span', { class: 'show-thumb-guide', html: mascotSvg(w?.mascot || 'gappu') }), el('span', { class: 'show-play', html: ICONS.play })]),
      el('span', { class: 'show-card-text' }, [
        el('span', { class: 'chips' }, [el('span', { class: 'chip grade', text: levelName(api, show.level).en }), el('span', { class: `chip subject ${show.lang === 'en' ? 'math' : 'hindi'}`, text: show.lang === 'en' ? 'English' : 'हिन्दी' })]),
        show.lang === 'en' ? el('b', { class: 'show-title latin', text: show.title.en }) : el('b', { class: 'show-title', lang: 'hi', text: show.title.hi }),
        show.lang === 'en' ? null : el('span', { class: 'show-sub', text: show.title.en }),
        el('span', { class: 'show-teaches', text: show.teaches.en }),
        seen ? el('span', { class: 'show-seen' }, [el('span', { html: ICONS.check }), el('span', { text: seen.views > 1 ? `Watched ×${seen.views}` : 'Watched' })]) : null,
      ]),
    ]);
    b.addEventListener('click', () => {
      api.sfx.pop();
      bounce(b);
      api.go('show', { showId: show.id });
    });
    return b;
  };
  const radioCard = el('button', { class: 'radio-card', onclick: () => (api.sfx.pop(), api.go('radio')) }, [
    el('span', { class: 'radio-card-icon', html: RADIO }),
    el('span', { class: 'show-card-text' }, [
      el('b', { lang: 'hi', text: 'कहानी रेडियो' }),
      el('span', { text: 'Story radio: stories and rhymes to listen to, with the screen dark. Good for car rides.' }),
    ]),
  ]);
  api.app.replaceChildren(
    el('div', { class: 'screen shows-home enter' }, [
      el('div', { class: 'backdrop', html: sceneSvg('hub') }),
      el('header', { class: 'game-head' }, [
        el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
        el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: 'कार्टून' }), el('span', { class: 'world-name-en', text: 'Show time' })]),
        el('span', { class: 'round-spacer' }),
      ]),
      el('div', { class: 'shows-scroll' }, [
        el('div', { class: 'mode-row', role: 'group', 'aria-label': 'How to watch' }, [modeBtn('watch', 'देखो', 'Just watch'), modeBtn('play', 'साथ खेलो', 'Play along')]),
        el('p', { class: 'mode-note', text: mode === 'watch' ? 'Questions wait a few seconds, then the answer is shown. Good for trips.' : 'Questions wait until your child taps an answer.' }),
        el('div', { class: 'show-cards' }, list.map(card)),
        radioCard,
      ]),
    ]),
  );
}

// ---------- the player ----------

export async function showPlayer(api, show) {
  const { content, settings } = api.state;
  const token = api.state.token;
  const alive = () => token === api.state.token;
  const world = worldOf(api, show);
  const mode = settings.lang;
  const main = show.lang === 'en' ? 'en' : mode === 'en' ? 'en' : 'hi';
  const sub = show.lang !== 'en' && mode === 'both' ? 'en' : null;
  const wordLangs = show.lang === 'en' ? ['en'] : langsFor(mode);
  const watch = settings.showMode !== 'play';
  const rate = settings.voice?.rate || 0.9;
  const lines = showLines(show);
  const lineFor = (beat, text) => lines.find((x) => x.beat === beat && x.hi === (text.hi || '') && x.en === (text.en || '')) || null;

  api.music.stop?.();
  const bg = el('div', { class: 'backdrop show-bg' });
  const narration = el('div', { class: 'show-narration', 'aria-live': 'polite' });
  const props = el('div', { class: 'show-props' });
  const askRow = el('div', { class: 'show-ask' });
  const bubble = el('div', { class: 'show-bubble' });
  const actorsLayer = el('div', { class: 'show-actors' });
  const wipe = el('div', { class: 'show-wipe' });
  const turn = el('div', { class: 'your-turn', 'aria-hidden': 'true' }, [el('span', { html: EAR }), el('b', { lang: 'hi', text: 'तुम्हारी बारी!' }), el('span', { text: 'Your turn!' })]);
  const dots = el('div', { class: 'scene-dots' }, show.scenes.map(() => el('span', { class: 'dot' })));
  const pauseBtn = el('button', { class: 'round-btn small show-pause', 'aria-label': 'Pause', html: PAUSE });
  const screen = el('div', { class: `screen show-screen theme-${show.scenes[0].bg}`, style: { '--place': world?.color || '#6C63FF' } }, [
    bg,
    el('header', { class: 'show-head' }, [
      el('button', { class: 'round-btn small', 'aria-label': 'Stop watching', html: ICONS.back, onclick: () => api.back() }),
      el('div', { class: 'show-head-title' }, [show.lang === 'en' ? el('b', { text: show.title.en }) : el('b', { lang: 'hi', text: show.title.hi }), dots]),
      pauseBtn,
    ]),
    narration,
    props,
    askRow,
    bubble,
    actorsLayer,
    turn,
    wipe,
  ]);
  api.app.replaceChildren(screen);

  // pause: speech stops; the beat that was playing starts again on resume
  let paused = false;
  let pauses = 0;
  let waiters = [];
  const untilResumed = () => (paused ? new Promise((r) => waiters.push(r)) : null);
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    screen.classList.toggle('paused', paused);
    pauseBtn.innerHTML = paused ? ICONS.play : PAUSE;
    pauseBtn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
    if (paused) {
      pauses++;
      stopSpeech();
    } else {
      waiters.forEach((r) => r());
      waiters = [];
    }
  });

  // ---- actors ----
  const actors = new Map();
  const actorEl = (id) => {
    if (actors.has(id)) return actors.get(id);
    const m = createMascot(id, { size: 'large', onTap: () => (m.react('silly'), api.sfx.boing()) });
    const node = el('div', { class: 'show-actor', style: { left: '-30%' } }, [el('div', { class: 'actor-face' }, [m.node])]);
    const a = { id, m, node, x: -30 };
    actorsLayer.append(node);
    actors.set(id, a);
    return a;
  };
  const walkTo = async (a, x) => {
    const dist = Math.abs(x - a.x);
    a.node.classList.toggle('facing-left', x < a.x);
    a.node.classList.add('walking');
    a.node.style.transitionDuration = `${Math.max(0.4, Math.min(1.6, dist / 55))}s`;
    a.node.style.left = `${x}%`;
    a.x = x;
    await sleep(Math.max(400, Math.min(1600, (dist / 55) * 1000)));
    a.node.classList.remove('walking');
  };
  const place = (id, x) => {
    const a = actorEl(id);
    a.node.style.transitionDuration = '0s';
    a.node.style.left = `${x}%`;
    a.x = x;
    a.node.classList.remove('facing-left');
  };

  // ---- talking: a comic bubble over the speaker, words lit as they are said ----
  const speakerX = (who) => (who && actors.get(who) ? actors.get(who).x : 50);
  const showBubble = (who, text, { big = false, extra = null } = {}) => {
    narration.classList.remove('on');
    for (const a of actors.values()) a.node.classList.toggle('talking', a.id === who);
    const mainText = text[main] || text.en || text.hi;
    const mainLine = el('p', { class: `bubble-main${big ? ' big' : ''}`, lang: main === 'hi' && text.hi ? 'hi' : 'en' }, splitWords(mainText));
    const subLine = sub && text[sub] && main !== sub ? el('p', { class: 'bubble-sub', text: text[sub] }) : null;
    bubble.replaceChildren(mainLine, subLine || '', extra || '');
    // keep the bubble inside the screen and point its tail at whoever is talking
    const W = screen.clientWidth || 400;
    bubble.style.left = '0px'; // measure at full width (an absolutely placed box shrinks near the edge)
    const w = bubble.offsetWidth;
    const sx = (speakerX(who) / 100) * W;
    const cx = Math.max(w / 2 + 10, Math.min(W - w / 2 - 10, sx));
    bubble.style.left = `${cx}px`;
    bubble.style.setProperty('--tail', `${Math.max(26, Math.min(w - 26, sx - (cx - w / 2)))}px`);
    bubble.classList.toggle('narrator', !who);
    bubble.classList.remove('on');
    void bubble.offsetWidth;
    bubble.classList.add('on');
    return { spans: [...mainLine.querySelectorAll('.kw')], text: mainText };
  };
  const hideBubble = () => {
    bubble.classList.remove('on');
    for (const a of actors.values()) a.node.classList.remove('talking');
  };
  // say a {hi, en} line in the episode's language, with a family recording when there is one
  const speak = async (beat, text, shown) => {
    const line = lineFor(beat, text);
    const t = text[main] || text.en || text.hi;
    const l = text[main] ? main : text.en ? 'en' : 'hi';
    const stopLight = shown ? karaoke(shown.spans, shown.text, rate) : () => {};
    await play([{ text: show.lang === 'en' ? speakMath(t) : t, lang: l, ...(line ? { clipKey: `${line.key}_${l}` } : {}) }]);
    stopLight();
  };

  // ---- props: pictures, word cards, letters, ten frames ----
  const propAt = (key, node, x = 50, { from } = {}) => {
    props.querySelector(`[data-key="${key}"]`)?.remove();
    node.dataset.key = key;
    node.classList.add('prop');
    node.style.left = `${x}%`;
    if (from) node.classList.add(`from-${from}`);
    props.append(node);
    // keep it on screen on narrow phones
    const W = props.clientWidth || 400;
    const w = node.offsetWidth;
    if (w) node.style.left = `${Math.max(w / 2 + 8, Math.min(W - w / 2 - 8, (x / 100) * W))}px`;
    return node;
  };
  const clearProps = async () => {
    for (const p of props.children) p.classList.add('leaving');
    await sleep(250);
    props.replaceChildren();
  };
  const wordCard = (id, mark) => {
    const w = api.word(id);
    return el('div', { class: 'show-card-word' }, [
      el('span', { class: 'pic', html: pictureForWord(w) }),
      show.lang === 'en' ? el('span', { class: 'show-word-text', text: w.en }) : wordText(w.hi, mark),
      sub || main === 'en' ? el('span', { class: 'show-word-en', text: w.en }) : null,
    ]);
  };

  // ---- scenes ----
  const setScene = async (i) => {
    const scene = show.scenes[i];
    if (i > 0) {
      wipe.className = 'show-wipe closing';
      api.sfx.whoosh();
      await sleep(450);
    }
    screen.className = screen.className.replace(/theme-\S+/, `theme-${scene.bg}`);
    bg.innerHTML = sceneSvg(scene.bg);
    props.replaceChildren();
    hideBubble();
    narration.classList.remove('on');
    for (const id of [...actors.keys()]) if (!scene.actors || !(id in scene.actors)) (actors.get(id).node.remove(), actors.delete(id));
    for (const [id, x] of Object.entries(scene.actors || {})) place(id, x);
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k <= i));
    if (i > 0) {
      wipe.className = 'show-wipe opening';
      await sleep(450);
      wipe.className = 'show-wipe';
    }
  };

  // ---- beats ----
  const runBeat = async (b) => {
    const k = beatKind(b);
    if (k === 'narrate') {
      hideBubble();
      const mainText = b[main] || b.en || b.hi;
      const mainLine = el('p', { lang: main === 'hi' && b.hi ? 'hi' : 'en' }, splitWords(mainText));
      narration.replaceChildren(mainLine, sub && b[sub] ? el('p', { class: 'sub', text: b[sub] }) : '');
      narration.classList.add('on');
      await speak(b, b, { spans: [...mainLine.querySelectorAll('.kw')], text: mainText });
    } else if (k === 'say') {
      const a = actorEl(b.say);
      if (a.x < 0 || a.x > 100) await walkTo(a, 50);
      if (b.do) a.m.react(b.do);
      await speak(b, b, showBubble(b.say, b));
    } else if (k === 'enter') {
      const a = actorEl(b.enter);
      const fromRight = b.from ? b.from === 'right' : b.at > 50;
      if (a.x < 0 || a.x > 100) place(b.enter, fromRight ? 125 : -25);
      void a.node.offsetWidth;
      await walkTo(a, b.at);
      a.m.react('wave');
    } else if (k === 'move') await walkTo(actorEl(b.move), b.to);
    else if (k === 'exit') {
      const a = actorEl(b.exit);
      await walkTo(a, b.to === 'left' ? -30 : 130);
      a.node.remove();
      actors.delete(b.exit);
    } else if (k === 'do') {
      actorEl(b.who).m.react(b.do);
      await sleep(800);
    } else if (k === 'show') {
      const w = api.word(b.show);
      propAt(`pic-${b.show}`, el('div', { class: 'show-pic', html: pictureForWord(w) }), b.at, { from: b.from });
      if (b.from) api.sfx.vroom();
      else api.sfx.pop();
      await sleep(b.from ? 900 : 500);
    } else if (k === 'glyph') {
      propAt('glyph', el('div', { class: 'show-glyph', lang: 'hi', text: withBase(b.glyph) }), b.at);
      api.sfx.sparkle();
      await sleep(700);
    } else if (k === 'letter') {
      hideBubble();
      const w = api.word(b.word);
      const node = propAt('letter', el('div', { class: 'show-letter' }, [el('span', { class: 'show-letter-glyph', lang: 'hi', text: b.letter }), w ? el('span', { class: 'pic', html: pictureForWord(w) }) : null]), b.at ?? 50);
      api.sfx.sparkle();
      const letter = content.letterSets.flatMap((s) => s.letters).find((l) => l.char === b.letter);
      await sleep(300);
      if (letter) await api.sayItem(letter);
      else await play([{ text: b.letter, lang: 'hi' }]);
      bounce(node);
    } else if (k === 'build') {
      hideBubble();
      const [a, m] = b.build;
      const tiles = el('div', { class: 'show-build', lang: 'hi' }, [el('span', { class: 'tile a', text: a }), el('span', { class: 'plus', text: '+' }), el('span', { class: 'tile m', text: withBase(m) })]);
      const node = propAt('build', tiles, 50);
      const said = speak(b, b, null);
      await sleep(1100);
      node.classList.add('merge');
      api.sfx.chime();
      await sleep(450);
      tiles.replaceChildren(el('span', { class: 'tile made', text: a + m }));
      await said;
      await sleep(300);
    } else if (k === 'word') {
      hideBubble();
      await clearProps();
      const card = propAt('word', wordCard(b.word, b.mark), 50);
      api.sfx.sparkle();
      await sleep(250);
      await api.sayItem(api.word(b.word), wordLangs);
      bounce(card);
      await sleep(500);
    } else if (k === 'tenframe') {
      propAt('tenframe', el('div', { class: 'show-math', html: mathModel({ kind: 'tenframe', frames: b.tenframe }) }), b.at ?? 50);
      api.sfx.pop();
      await sleep(600);
    } else if (k === 'number') {
      propAt('number', el('div', { class: 'show-number', text: String(b.number) }), b.at ?? 50);
      api.sfx.pop();
      await sleep(500);
    } else if (k === 'ask') return ask(b);
    else if (k === 'echo') await echo(b);
    else if (k === 'clear') {
      hideBubble();
      await clearProps();
    } else if (k === 'sfx') {
      api.sfx[b.sfx]?.();
      await sleep(400);
    } else if (k === 'wait') await sleep(b.wait);
    return null;
  };

  // a question: tap an answer, or (watch mode) the answer shows itself after a few seconds
  const ask = async (b) => {
    const who = b.who && actors.has(b.who) ? b.who : null;
    const before = pauses;
    const inline = b.kind === 'number';
    const opts = b.options.map((o) => {
      const btn =
        b.kind === 'number'
          ? el('button', { class: 'ask-opt number', text: String(o), 'aria-label': String(o) })
          : el('button', { class: 'ask-opt', 'aria-label': api.word(o).en }, [el('span', { class: 'pic', html: pictureForWord(api.word(o)) }), show.lang === 'en' ? el('span', { class: 'show-word-en', text: api.word(o).en }) : el('span', { lang: 'hi', text: api.word(o).hi })]);
      btn.option = o; // a button's own .value would turn numbers into text
      return btn;
    });
    const row = el('div', { class: `ask-opts${inline ? ' inline' : ''}` }, opts);
    // number questions keep the picture (a ten frame) in view: the choices sit inside the bubble
    await speak(b, b.ask, showBubble(who, b.ask, inline ? { extra: el('div', { class: 'ask-wait' }) } : {}));
    if (!alive()) return 'final';
    if (pauses !== before) return null; // paused while asking: ask again
    const timerBar = watch ? el('div', { class: 'ask-timer' }, [el('i', { style: { animationDuration: `${ASK_WAIT_MS}ms` } })]) : null;
    if (inline) {
      showBubble(who, b.ask, { extra: el('div', { class: 'ask-inline' }, [row, timerBar || '']) });
    } else {
      props.classList.add('dim');
      askRow.replaceChildren(row, timerBar || '');
      askRow.classList.add('on');
    }
    const right = opts.find((o) => o.option === b.answer);
    let tapped = null;
    const picked = new Promise((resolve) => {
      for (const o of opts)
        o.addEventListener('click', () => {
          if (tapped) return;
          if (o === right) {
            tapped = o;
            resolve(o);
          } else {
            wobble(o);
            api.sfx.boing();
            api.sfx.haptic?.([18, 60, 18]);
          }
        });
    });
    let timeout = 0;
    const waited = watch
      ? new Promise((resolve) => {
          const tick = async () => {
            if (paused) await untilResumed(); // the answer waits while paused
            resolve(null);
          };
          timeout = setTimeout(tick, ASK_WAIT_MS);
        })
      : new Promise(() => {});
    const result = await Promise.race([picked, waited]);
    clearTimeout(timeout);
    if (!alive()) return 'final';
    right.classList.add(result ? 'right' : 'reveal');
    if (result) {
      api.sfx.chime();
      api.sfx.haptic?.(14);
    } else api.sfx.sparkle();
    if (who) actors.get(who).m.react('cheer');
    bounce(right);
    await speak(b, b.then, showBubble(who, b.then));
    await sleep(600);
    askRow.classList.remove('on');
    askRow.replaceChildren();
    props.classList.remove('dim');
    return 'final';
  };

  // say it with me: the line, a pause for the child to say it, then the line again
  const echo = async (b) => {
    const who = [...actors.keys()][0] || null;
    const cue = show.lang === 'en' || main === 'en' ? { en: 'Say it with me!' } : { hi: 'मेरे साथ बोलो!', en: 'Say it with me!' };
    showBubble(who, cue);
    await play([{ text: cue[main] || cue.en, lang: cue[main] ? main : 'en' }]);
    const shown = showBubble(who, b.echo, { big: true });
    await speak(b, b.echo, shown);
    props.classList.add('dim');
    turn.classList.add('on');
    await sleep(2600);
    turn.classList.remove('on');
    props.classList.remove('dim');
    await speak(b, b.echo, showBubble(who, b.echo, { big: true }));
  };

  // ---- play it ----
  await sleep(300);
  for (let s = 0; s < show.scenes.length; s++) {
    if (!alive()) return;
    await setScene(s);
    const beats = show.scenes[s].beats;
    for (let i = 0; i < beats.length; i++) {
      if (!alive()) return;
      await untilResumed();
      if (!alive()) return;
      const before = pauses;
      const r = await runBeat(beats[i]);
      if (r !== 'final' && pauses !== before) i--; // paused in the middle: play this beat again
    }
  }
  if (!alive()) return;
  hideBubble();
  markWatched(api, show);
  recap(api, show, { screen, wordLangs, main, sub, watch, alive });
}

// After the episode: the words again, then practise them in a game or watch the next episode.
async function recap(api, show, { screen, wordLangs, watch, alive }) {
  const { content, settings, progress } = api.state;
  api.state.showRun = (api.state.showRun || 0) + 1;
  const next = nextShow(content, settings.level, show.id, progress);
  const lesson = show.lesson ? content.worlds.flatMap((w) => w.units.flatMap((u) => u.lessons)).find((l) => l.id === show.lesson) : null;
  const tired = api.state.showRun >= AUTOPLAY_MAX;
  const items = show.recap?.words
    ? show.recap.words.map((id) => {
        const w = api.word(id);
        const b = el('button', { class: 'recap-item', 'aria-label': w.en }, [el('span', { class: 'pic', html: pictureForWord(w) }), show.lang === 'en' ? el('span', { class: 'show-word-en', text: w.en }) : wordText(w.hi, show.recap.mark), show.lang === 'en' || !wordLangs.includes('en') ? null : el('span', { class: 'show-word-en', text: w.en })]);
        b.addEventListener('click', () => (bounce(b), api.sayItem(w, wordLangs)));
        return { node: b, say: () => api.sayItem(w, wordLangs) };
      })
    : (show.recap?.lines || []).map((t) => {
        const b = el('button', { class: 'recap-item line', text: t });
        const sayIt = () => play([{ text: speakMath(t), lang: 'en' }]);
        b.addEventListener('click', () => (bounce(b), sayIt()));
        return { node: b, say: sayIt };
      });
  const nextBtn = next ? el('button', { class: 'bubble green big recap-next', 'aria-label': `Next: ${next.title.en}`, html: ICONS.next }) : null;
  const card = el('div', { class: 'show-recap' }, [
    el('h2', {}, show.lang === 'en' ? [el('span', { text: 'Remember!' })] : [el('span', { lang: 'hi', text: 'क्या तुमने देखा?' }), el('small', { text: 'Did you spot them?' })]),
    el('div', { class: 'recap-items' }, items.map((x) => x.node)),
    tired ? el('p', { class: 'recap-stretch' }, [el('b', { lang: 'hi', text: 'तीन कार्टून हो गए! अब उठो और खिंचाव करो।' }), el('span', { text: "That's three shows! Time to stand up and stretch." })]) : null,
    el('div', { class: 'recap-buttons' }, [
      el('button', { class: 'bubble ghost', 'aria-label': 'All shows', html: TV, onclick: () => api.back() }),
      el('button', { class: 'bubble ghost', 'aria-label': 'Watch again', html: ICONS.replay, onclick: () => api.go('show', { showId: show.id }, { replace: true }) }),
      lesson ? el('button', { class: 'recap-practise', 'aria-label': `Practise: ${lesson.title.en}`, onclick: () => api.go('lesson', { lessonId: lesson.id }, { replace: true }) }, [el('span', { html: ICONS.star }), el('span', { text: 'Play the game' })]) : null,
      nextBtn,
    ]),
  ]);
  screen.append(card);
  nextBtn?.addEventListener('click', () => api.go('show', { showId: next.id }, { replace: true }));
  api.sfx.cheer();
  await sleep(500);
  for (const it of items) {
    if (!alive()) return;
    bounce(it.node);
    await it.say();
    await sleep(250);
  }
  if (!next || !alive()) return;
  // watch mode: the next episode starts by itself, up to three in a row
  if (watch && !tired) {
    nextBtn.classList.add('counting');
    await sleep(8000);
    if (alive() && nextBtn.isConnected) api.go('show', { showId: next.id }, { replace: true });
  }
}

// ---------- Story radio: stories and rhymes to listen to, screen dark ----------

export async function radio(api) {
  const { content, settings } = api.state;
  const token = api.state.token;
  const alive = () => token === api.state.token;
  const list = radioPlaylist(content, settings.level);
  const langs = langsFor(settings.lang);
  api.music.stop?.();
  let index = Math.max(0, list.findIndex((s) => s.id === api.state.radioAt));
  let paused = false;
  let gen = 0;
  let skip = 0;
  let waiters = [];
  const untilResumed = () => (paused ? new Promise((r) => waiters.push(r)) : null);

  const host = createMascot('mitthu', { size: 'large' });
  const title = el('div', { class: 'radio-title' });
  const status = el('p', { class: 'radio-status' });
  const cover = el('div', { class: 'radio-cover' });
  const playBtn = el('button', { class: 'radio-btn big', 'aria-label': 'Pause', html: PAUSE });
  const prevBtn = el('button', { class: 'radio-btn', 'aria-label': 'Previous story', html: ICONS.back });
  const nextBtn = el('button', { class: 'radio-btn', 'aria-label': 'Next story', html: ICONS.next });
  const screen = el('div', { class: 'screen radio-screen enter' }, [
    el('header', { class: 'game-head' }, [
      el('button', { class: 'round-btn small', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
      el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: 'कहानी रेडियो' }), el('span', { class: 'world-name-en', text: 'Story radio' })]),
      el('span', { class: 'round-spacer' }),
    ]),
    el('div', { class: 'radio-body' }, [el('div', { class: 'radio-host' }, [el('span', { class: 'waves' }), host.node]), cover, title, status, el('div', { class: 'radio-controls' }, [prevBtn, playBtn, nextBtn])]),
    el('p', { class: 'radio-note', text: 'The screen stays on but dark, so the stories keep playing. Tap anywhere to brighten it.' }),
  ]);
  api.app.replaceChildren(screen);

  // keep the screen awake (and dark) so speech doesn't stop when the phone would sleep
  let lock = null;
  const wake = () => navigator.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {});
  wake();
  const onVisible = () => document.visibilityState === 'visible' && alive() && wake();
  document.addEventListener('visibilitychange', onVisible);
  let dimTimer = 0;
  const brighten = () => {
    screen.classList.remove('dim');
    clearTimeout(dimTimer);
    dimTimer = setTimeout(() => screen.classList.add('dim'), 8000);
  };
  screen.addEventListener('pointerdown', brighten);
  brighten();

  const interrupt = () => {
    gen++;
    stopSpeech();
  };
  playBtn.addEventListener('click', () => {
    paused = !paused;
    playBtn.innerHTML = paused ? ICONS.play : PAUSE;
    playBtn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
    screen.classList.toggle('paused', paused);
    if (paused) interrupt();
    else (waiters.forEach((r) => r()), (waiters = []));
  });
  const jump = (d) => {
    skip = d;
    interrupt();
    if (paused) playBtn.click();
  };
  nextBtn.addEventListener('click', () => jump(1));
  prevBtn.addEventListener('click', () => jump(-1));

  const showStory = (story) => {
    const lead = story.lang === 'en' ? story.title.en : story.title.hi;
    title.replaceChildren(el('b', { lang: story.lang === 'en' ? 'en' : 'hi', text: lead }), story.lang === 'en' ? '' : el('span', { text: story.title.en }));
    // a comic's cover is its series' hero
    const coverId = story.panels ? `comic-${SERIES[story.series]?.hero}` : story.cover;
    cover.innerHTML = picture(api.word(coverId)?.picture || coverId);
    status.textContent = `${story.panels ? 'Comic' : story.kind === 'poem' ? 'Rhyme' : 'Story'} ${index + 1} of ${list.length}`;
  };

  // leaving the radio (even while paused) lets the screen sleep again
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    clearInterval(watchdog);
    clearTimeout(dimTimer);
    document.removeEventListener('visibilitychange', onVisible);
    lock?.release?.().catch?.(() => {});
    waiters.forEach((r) => r());
    waiters = [];
  };
  const watchdog = setInterval(() => !alive() && cleanup(), 1000);

  if (!list.length) status.textContent = 'No stories for this grade yet.';
  try {
    while (alive() && list.length) {
      const story = list[index];
      api.state.radioAt = story.id;
      showStory(story);
      const steps = story.panels ? comicRadioSteps(story) : radioSteps(story, langs, content.words);
      let step = 0;
      while (step < steps.length && alive()) {
        await untilResumed();
        if (!alive()) break;
        if (skip) break;
        const my = gen;
        const st = steps[step];
        screen.classList.toggle('thinking', st.show === 'think');
        if (st.sfx) api.sfx[st.sfx]?.();
        if (st.say) await play(st.say);
        else if (st.pause) await sleep(st.pause);
        if (my !== gen) continue; // paused or skipped mid-step: say it again (or move on below)
        step++;
      }
      if (!alive()) break;
      const d = skip || 1;
      skip = 0;
      index = (index + d + list.length) % list.length;
    }
  } finally {
    cleanup();
  }
}
