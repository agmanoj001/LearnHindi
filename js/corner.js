// The fun corner for Grades 7–8 (docs/ROADMAP.md 7.16): a reason to come back each day once the comics
// are read. A riddle of the day (पहेली), an idiom of the day (मुहावरा) with a comic strip, a comic maker
// using the comic cast, and quiz duels for two on one device. This age likes wit, making things and
// competing. The riddle and the idiom come round in turn, one a day, so a month goes by before one repeats.
import { el, bounce, wobble, ICONS } from './ui.js';
import { isoDay } from './curriculum.js';
import { play } from './audio.js';

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

// ---------- the corner ----------
export function cornerScreen(api) {
  const head = el('header', { class: 'game-head' }, [
    el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
    el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: 'मस्ती कोना' }), el('span', { class: 'world-name-en', text: 'Fun corner' })]),
    el('span', { class: 'round-spacer' }),
  ]);
  api.app.replaceChildren(el('div', { class: 'screen corner enter' }, [head, el('main', { class: 'corner-main' }, [riddleCard(api)])]));
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
