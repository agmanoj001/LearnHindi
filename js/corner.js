// The fun corner for Grades 7–8 (docs/ROADMAP.md 7.16): a reason to come back each day once the comics
// are read. A riddle of the day (पहेली), an idiom of the day (मुहावरा) with a comic strip, a comic maker
// using the comic cast, and quiz duels for two on one device. This age likes wit, making things and
// competing. The riddle and the idiom come round in turn, one a day, so a month goes by before one repeats.
import { el, bounce, wobble, ICONS } from './ui.js';
import { isoDay } from './curriculum.js';
import { play, stop as stopSpeech } from './audio.js';
import { castSvg, comicBg, CAST } from './art-comic.js';

export const CORNER_LEVELS = ['grade7', 'grade8'];
export const cornerLevel = (level) => (level === 'grade8' ? 'grade8' : 'grade7');

// days since 1 Jan 1970 for a "YYYY-MM-DD" day: the same everywhere, whatever the time zone
const dayNumber = (day) => Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
// today's one from a list: they take turns, one a day
export function ofTheDay(list, day) {
  if (!list?.length) return null;
  const n = dayNumber(day);
  return list[((n % list.length) + list.length) % list.length];
}

const hash = (s) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
};
// the choices in an order that stays the same for a riddle (so the answer isn't always first)
export function fixedShuffle(items, seed) {
  const out = [...items];
  let h = hash(seed);
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------- the riddle of the day ----------
export const riddlesFor = (content, level) => (content.riddles || []).filter((r) => r.level === cornerLevel(level));
export const riddleOfDay = (content, level, now = Date.now()) => ofTheDay(riddlesFor(content, level), isoDay(now));
export const riddleChoices = (r) => fixedShuffle(r.options, r.id);
// progress.riddles: { riddleId: the day it was solved }
export const riddlesSolved = (progress) => Object.keys(progress?.riddles || {}).length;
export const riddleDoneToday = (progress, r, now = Date.now()) => !!r && progress?.riddles?.[r.id] === isoDay(now);

const say = (text, lang = 'hi') => play([{ text, lang }]);
// a riddle's lines, one under the other
const verse = (text) => text.split(/(?<=[।;?])\s+/).map((line) => el('span', { class: 'verse-line', text: line }));

function riddleCard(api) {
  const { content, settings } = api.state;
  const r = riddleOfDay(content, settings.level);
  if (!r) return null;
  const both = settings.lang !== 'hi';
  const count = el('small', { class: 'corner-count', text: `✓ ${riddlesSolved(api.state.progress)}` });
  const why = el('p', { class: 'riddle-why', hidden: true }, [el('b', { lang: 'hi', text: `${r.answer}! ${r.why.hi}` }), both ? el('span', { text: r.why.en }) : null]);
  const tryAgain = el('p', { class: 'riddle-try', hidden: true, lang: 'hi', text: 'फिर से सोचो!' });
  const opts = riddleChoices(r).map((o) => el('button', { class: 'riddle-opt', lang: 'hi', text: o }));
  const solved = () => {
    for (const b of opts) {
      b.disabled = true;
      b.classList.toggle('right', b.textContent === r.answer);
    }
    tryAgain.hidden = true;
    why.hidden = false;
    card.classList.add('solved');
  };
  for (const b of opts)
    b.addEventListener('click', async () => {
      if (b.textContent === r.answer) {
        api.state.progress = { ...api.state.progress, riddles: { ...(api.state.progress.riddles || {}), [r.id]: isoDay(Date.now()) } };
        api.persistProgress();
        count.textContent = `✓ ${riddlesSolved(api.state.progress)}`;
        solved();
        bounce(b);
        api.sfx.feel?.('right');
        await api.say('riddleRight');
        if (card.isConnected) say(`${r.answer}! ${r.why.hi}`);
      } else {
        b.disabled = true;
        b.classList.add('wrong');
        wobble(b);
        api.sfx.feel?.('wrong');
        tryAgain.hidden = false;
        api.say('riddleTry');
      }
    });
  const hear = el('button', { class: 'round-btn small corner-hear', 'aria-label': 'Hear the riddle', html: ICONS.speaker, onclick: () => say(r.hi) });
  const card = el('section', { class: 'corner-card riddle-card', 'aria-label': 'Riddle of the day' }, [
    el('header', { class: 'corner-card-head' }, [el('span', { class: 'corner-emoji', 'aria-hidden': 'true', text: '🧩' }), el('span', { class: 'corner-title' }, [el('b', { lang: 'hi', text: 'आज की पहेली' }), el('small', { text: 'Riddle of the day' })]), count, hear]),
    el('p', { class: 'riddle-text', lang: 'hi' }, verse(r.hi)),
    both ? el('p', { class: 'riddle-en', text: r.en }) : null,
    el('div', { class: 'riddle-opts' }, opts),
    tryAgain,
    why,
  ]);
  if (riddleDoneToday(api.state.progress, r)) {
    solved();
    why.append(el('small', { class: 'riddle-next', lang: 'hi', text: 'कल नई पहेली आएगी!' }));
  }
  return card;
}

// ---------- the idiom of the day ----------
export const idiomsFor = (content, level) => (content.idioms || []).filter((x) => x.level === cornerLevel(level));
export const idiomOfDay = (content, level, now = Date.now()) => ofTheDay(idiomsFor(content, level), isoDay(now));
export const idiomChoices = (x) => fixedShuffle(x.options, x.id);
// progress.idioms: { idiomId: the day its meaning was found }
export const idiomsLearnt = (progress) => Object.keys(progress?.idioms || {}).length;
export const idiomDoneToday = (progress, x, now = Date.now()) => !!x && progress?.idioms?.[x.id] === isoDay(now);
// a character says a line in their own voice (the comic voices in the voice pack)
export const castLine = (who, text) => ({ text, lang: 'hi', pitch: CAST[who]?.pitch ?? 1, voice: who });

// One panel of a strip, drawn like the comics (js/games/comic.js): background, cast, caption, bubbles.
// The comic maker (js/comicmaker.js) draws the child's panels with it too.
export function stripPanel(p, i, onBubble) {
  const bubbles = (p.say || []).map((b) => {
    const node = el('div', { class: `comic-bubble ${b.kind || 'say'}`, lang: 'hi', tabindex: '0', 'data-who': b.who, 'aria-label': `${CAST[b.who]?.name?.hi || ''}: ${b.text}`, text: b.text });
    node.addEventListener('click', () => onBubble(node, castLine(b.who, b.text)));
    return node;
  });
  return el('figure', { class: `comic-panel strip-panel${p.dark ? ' dark' : ''}`, 'data-i': String(i) }, [
    el('div', { class: 'comic-bg', html: comicBg(p.bg) }),
    el('div', { class: 'comic-top' }, [p.cap ? el('div', { class: 'comic-cap', lang: 'hi', text: p.cap }) : null, bubbles.length ? el('div', { class: 'comic-bubbles' }, bubbles) : null]),
    el('div', { class: 'comic-stage' }, [
      ...(p.cast || []).map((ch) => el('div', { class: `comic-char${ch.flip ? ' flip' : ''}`, style: { left: `${ch.at}%` }, 'data-who': ch.who, html: CAST[ch.who] ? castSvg(ch.who, { face: ch.face, arms: ch.arms, hold: ch.hold }) : '' })),
      p.sfx ? el('div', { class: 'comic-sfx', lang: 'hi', text: p.sfx }) : null,
    ]),
  ]);
}
// point each bubble's tail at whoever is speaking
export function aimTails(panels) {
  for (const panel of panels)
    for (const b of panel.querySelectorAll('.comic-bubble')) {
      const who = panel.querySelector(`.comic-char[data-who="${CSS.escape(b.dataset.who || '')}"]`);
      const bb = b.getBoundingClientRect();
      if (!who || !bb.width) continue;
      const wb = who.getBoundingClientRect();
      const x = wb.left + wb.width / 2 - bb.left;
      b.style.setProperty('--tail', `${Math.max(22, Math.min(bb.width - 22, x))}px`);
      b.classList.toggle('tail-left', x < bb.width * 0.35);
    }
}

// The idiom screen: the strip up to Chippu's mistake, "what does it really mean?", then the last panel,
// the meaning and a sentence that uses it.
export function idiomScreen(api) {
  const { content, settings } = api.state;
  const x = idiomOfDay(content, settings.level);
  if (!x) return api.back();
  const both = settings.lang !== 'hi';
  let token = 0;
  const sayNode = async (node, seg) => {
    const t = ++token;
    stopSpeech();
    node.classList.add('reading');
    await play([seg]);
    if (t === token) node.classList.remove('reading');
  };
  const panels = x.strip.map((p, i) => stripPanel(p, i, sayNode));
  const last = panels.at(-1);
  const meaning = el('section', { class: 'idiom-meaning', hidden: true }, [
    el('p', {}, [el('small', { lang: 'hi', text: 'मतलब' }), el('b', { lang: 'hi', text: x.meaning.hi }), both ? el('span', { text: x.meaning.en }) : null]),
    el('p', {}, [el('small', { lang: 'hi', text: 'वाक्य में' }), el('b', { lang: 'hi', text: x.example.hi }), both ? el('span', { text: x.example.en }) : null]),
  ]);
  const opts = idiomChoices(x).map((o) => el('button', { class: 'riddle-opt', lang: 'hi', text: o }));
  const guess = el('section', { class: 'idiom-guess' }, [el('b', { lang: 'hi', text: 'चिप्पू से पहले तुम बताओ: इसका असली मतलब क्या है?' }), both ? el('small', { text: 'Before Chippu does: what does it really mean?' }) : null, el('div', { class: 'riddle-opts' }, opts)]);
  const open = (quiet) => {
    last.classList.remove('locked');
    guess.classList.add('done');
    for (const b of opts) (b.disabled = true), b.classList.toggle('right', b.textContent === x.meaning.hi);
    meaning.hidden = false;
    requestAnimationFrame(() => aimTails([last]));
    if (!quiet) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  for (const b of opts)
    b.addEventListener('click', async () => {
      if (b.textContent !== x.meaning.hi) {
        b.disabled = true;
        b.classList.add('wrong');
        wobble(b);
        api.sfx.feel?.('wrong');
        return api.say('riddleTry');
      }
      api.state.progress = { ...api.state.progress, idioms: { ...(api.state.progress.idioms || {}), [x.id]: isoDay(Date.now()) } };
      api.persistProgress();
      bounce(b);
      api.sfx.feel?.('right');
      open(false);
      await api.say('idiomRight');
      // the last panel, read out, then the meaning
      for (const node of last.querySelectorAll('.comic-bubble')) {
        if (!screen.isConnected) return;
        await sayNode(node, castLine(node.dataset.who, node.textContent));
      }
      if (screen.isConnected) await play([{ text: `${x.hi}: ${x.meaning.hi}`, lang: 'hi' }]);
    });
  // hear the whole strip, a bubble at a time
  const readAll = async () => {
    const t = ++token;
    for (const node of panels.filter((p) => !p.classList.contains('locked')).flatMap((p) => [...p.querySelectorAll('.comic-bubble')])) {
      if (t !== token || !screen.isConnected) return;
      node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      node.classList.add('reading');
      await play([castLine(node.dataset.who, node.textContent)]);
      node.classList.remove('reading');
    }
  };
  const head = el('header', { class: 'game-head' }, [
    el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => (token++, stopSpeech(), api.back()) }),
    el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: 'आज का मुहावरा' }), el('span', { class: 'world-name-en', text: 'Idiom of the day' })]),
    el('button', { class: 'round-btn', 'aria-label': 'Read the strip aloud', html: ICONS.speaker, onclick: () => readAll() }),
  ]);
  last.classList.add('locked');
  const screen = el('div', { class: 'screen idiom-screen enter' }, [
    head,
    el('main', { class: 'idiom-main' }, [
      el('h1', { class: 'idiom-title', lang: 'hi', text: x.hi }),
      el('div', { class: 'idiom-strip' }, [...panels.slice(0, -1), guess, last]),
      meaning,
    ]),
  ]);
  api.app.replaceChildren(screen);
  requestAnimationFrame(() => aimTails(panels));
  if (idiomDoneToday(api.state.progress, x)) open(true);
  else
    setTimeout(async () => {
      if (!screen.isConnected) return;
      await play([{ text: x.hi, lang: 'hi' }]);
      if (screen.isConnected) api.say('idiomGuess');
    }, 400);
}

// the corner's card for it
function idiomCard(api) {
  const { content, settings, progress } = api.state;
  const x = idiomOfDay(content, settings.level);
  if (!x) return null;
  const done = idiomDoneToday(progress, x);
  const b = el('button', { class: `corner-card idiom-card${done ? ' solved' : ''}`, 'aria-label': `Idiom of the day: ${x.hi}` }, [
    el('span', { class: 'corner-card-head' }, [el('span', { class: 'corner-emoji', 'aria-hidden': 'true', text: '💬' }), el('span', { class: 'corner-title' }, [el('b', { lang: 'hi', text: 'आज का मुहावरा' }), el('small', { text: 'Idiom of the day' })]), el('small', { class: 'corner-count', text: `✓ ${idiomsLearnt(progress)}` })]),
    el('span', { class: 'idiom-peek' }, [el('span', { class: 'idiom-peek-pic', html: castSvg('chippu', { face: done ? 'grin' : 'think', arms: done ? 'wave' : 'chin' }) }), el('b', { lang: 'hi', text: x.hi })]),
    el('span', { class: 'idiom-go', lang: 'hi', text: done ? 'कॉमिक फिर से पढ़ो ›' : 'चिप्पू का कॉमिक पढ़ो ›' }),
  ]);
  b.addEventListener('click', () => (api.sfx.pop(), api.go('idiom')));
  return b;
}

// the comic maker's card: the cast waiting, and how many comics have been made
function makerCard(api) {
  const n = (api.state.progress.myComics || []).length;
  const b = el('button', { class: 'corner-card maker-card-big', 'aria-label': 'Make a comic' }, [
    el('span', { class: 'corner-card-head' }, [el('span', { class: 'corner-emoji', 'aria-hidden': 'true', text: '🎨' }), el('span', { class: 'corner-title' }, [el('b', { lang: 'hi', text: 'कॉमिक बनाओ' }), el('small', { text: 'Make a comic' })]), n ? el('small', { class: 'corner-count', text: `✓ ${n}` }) : null]),
    el('span', { class: 'maker-cast-peek', 'aria-hidden': 'true' }, ['mishti', 'birbal', 'chippu', 'dadi', 'betal'].map((who, i) => el('span', { style: { '--i': String(i) }, html: castSvg(who, { face: i % 2 ? 'laugh' : 'grin', arms: i === 2 ? 'wave' : 'down' }) }))),
    el('span', { class: 'idiom-go', lang: 'hi', text: 'अपनी कहानी, अपने किरदार ›' }),
  ]);
  b.addEventListener('click', () => (api.sfx.pop(), api.go('comicmaker')));
  return b;
}

// ---------- the corner ----------
export function cornerScreen(api) {
  const head = el('header', { class: 'game-head' }, [
    el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
    el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: 'मस्ती कोना' }), el('span', { class: 'world-name-en', text: 'Fun corner' })]),
    el('span', { class: 'round-spacer' }),
  ]);
  api.app.replaceChildren(el('div', { class: 'screen corner enter' }, [head, el('main', { class: 'corner-main' }, [riddleCard(api), idiomCard(api), makerCard(api)])]));
  api.say('cornerHello');
}

// The home screen's door to the corner (Grades 7–8), with a dot while today's riddle waits.
export function cornerButton(api) {
  const { content, settings, progress } = api.state;
  if (!CORNER_LEVELS.includes(settings.level)) return null;
  const waiting = !riddleDoneToday(progress, riddleOfDay(content, settings.level));
  return el('button', { class: `corner-btn${waiting ? ' waiting' : ''}`, 'aria-label': 'Fun corner: riddle, idiom, comics and duels', onclick: () => (api.sfx.pop(), api.go('corner')) }, [
    el('span', { class: 'corner-emoji', 'aria-hidden': 'true', text: '🧩' }),
    el('span', { class: 'corner-title' }, [el('b', { lang: 'hi', text: 'मस्ती कोना' }), el('small', { text: 'Riddle · idiom · comics · duels' })]),
    waiting ? el('span', { class: 'corner-dot', 'aria-hidden': 'true' }) : null,
  ]);
}
