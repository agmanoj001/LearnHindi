// Quiz duels for Grades 7–8 (docs/ROADMAP.md 7.16): two players face each other across one phone or
// tablet lying flat. The top half is turned round for the player opposite. Both see the same question from
// the grade's quiz banks (the idioms and meanings); the first right tap wins the point, and a wrong tap
// locks that player out for the round. Ten rounds, then a winner (or a draw) and a rematch.
import { el, bounce, wobble, ICONS } from './ui.js';
import { play, stop as stopSpeech } from './audio.js';
import { quizPool } from './together.js';
import { shuffle } from './logic.js';

export const DUEL_ROUNDS = 10;
export const DUEL_WAIT_MS = 20000; // a round nobody answers shows the answer after this
export const DUEL_LEVELS = ['grade7', 'grade8'];
export const BOTTOM = 0;
export const TOP = 1;

// ---- the rules (no DOM, so the tests can play them) ----
export function duelQuestions(content, level, n = DUEL_ROUNDS, rng = Math.random) {
  const pool = quizPool(content, level).filter((q) => q.hi && q.options.length >= 2 && q.options.length <= 4);
  return shuffle(pool, rng)
    .slice(0, n)
    .map((q) => ({ hi: q.hi, en: q.en, answer: q.answer, options: shuffle(q.options, rng) }));
}
export const newDuel = (questions) => ({ qs: questions, at: 0, score: [0, 0], locked: [false, false], won: null, done: !questions.length });
// a tap: 'right' (the point), 'wrong' (locked out this round), or 'ignored' (the round is over, or locked)
export function tap(duel, player, option) {
  if (duel.done || duel.won !== null || duel.locked[player]) return { duel, result: 'ignored' };
  const q = duel.qs[duel.at];
  if (option === q.answer) {
    const score = [...duel.score];
    score[player] += 1;
    return { duel: { ...duel, score, won: player }, result: 'right' };
  }
  const locked = [...duel.locked];
  locked[player] = true;
  // both wrong: nobody gets it, the answer is shown
  return { duel: { ...duel, locked, won: locked[0] && locked[1] ? -1 : null }, result: 'wrong' };
}
// time ran out: nobody gets the point
export const timeUp = (duel) => (duel.won === null && !duel.done ? { ...duel, won: -1 } : duel);
export function nextRound(duel) {
  const at = duel.at + 1;
  return { ...duel, at, locked: [false, false], won: null, done: at >= duel.qs.length };
}
// who won the duel: BOTTOM, TOP, or -1 for a draw
export const duelWinner = (duel) => (duel.score[0] === duel.score[1] ? -1 : duel.score[0] > duel.score[1] ? BOTTOM : TOP);

// ---- the screen ----
const levelName = { grade7: { hi: 'कक्षा 7', en: 'Grade 7' }, grade8: { hi: 'कक्षा 8', en: 'Grade 8' } };

export function duelScreen(api, { level = null } = {}) {
  const lv = DUEL_LEVELS.includes(level) ? level : DUEL_LEVELS.includes(api.state.settings.level) ? api.state.settings.level : 'grade7';
  // ---- getting ready: which questions, how to sit ----
  const start = el('button', { class: 'bubble green big duel-start', 'aria-label': 'Start the duel', html: ICONS.play });
  start.addEventListener('click', () => (api.sfx.pop(), play_(api, lv)));
  api.app.replaceChildren(
    el('div', { class: 'screen duel-setup enter' }, [
      el('header', { class: 'game-head' }, [
        el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
        el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: 'क्विज़ मुक़ाबला' }), el('span', { class: 'world-name-en', text: 'Quiz duel' })]),
        el('span', { class: 'round-spacer' }),
      ]),
      el('main', { class: 'duel-setup-main' }, [
        el('div', { class: 'duel-how', 'aria-hidden': 'true' }, [el('span', { class: 'duel-p p2', text: '🧑' }), el('span', { class: 'duel-phone', text: '📱' }), el('span', { class: 'duel-p p1', text: '🧑' })]),
        el('p', { class: 'duel-tip' }, [el('b', { lang: 'hi', text: 'आमने-सामने बैठो, फ़ोन बीच में रखो।' }), el('span', { text: 'Sit face to face with the phone flat between you.' })]),
        el('p', { class: 'duel-tip' }, [el('b', { lang: 'hi', text: `${DUEL_ROUNDS} सवाल। जो पहले सही जवाब दबाए, उसका अंक! ग़लत दबाया, तो उस सवाल से बाहर।` }), el('span', { text: `${DUEL_ROUNDS} questions. First right tap scores; a wrong tap is out for that question.` })]),
        el('div', { class: 'mode-row', role: 'group', 'aria-label': 'Questions from' }, DUEL_LEVELS.map((l) => el('button', { class: `mode-btn${l === lv ? ' on' : ''}`, 'aria-pressed': l === lv ? 'true' : 'false', onclick: () => (api.sfx.pop(), duelScreen(api, { level: l })) }, [el('b', { lang: 'hi', text: levelName[l].hi }), el('span', { text: levelName[l].en })]))),
        start,
      ]),
    ]),
  );
  if (!level) api.say('duelHello');
}

function play_(api, level) {
  let duel = newDuel(duelQuestions(api.state.content, level));
  const token = api.state.token;
  const alive = () => token === api.state.token && screen.isConnected;
  let timer = 0;
  const half = (player) => {
    const score = el('b', { class: 'duel-score', text: '0' });
    const q = el('p', { class: 'duel-q', lang: 'hi' });
    const opts = el('div', { class: 'duel-opts' });
    const note = el('p', { class: 'duel-note', lang: 'hi' });
    const node = el('section', { class: `duel-half ${player === TOP ? 'top' : 'bottom'}`, 'aria-label': player === TOP ? 'Player 2 (top)' : 'Player 1 (bottom)' }, [el('div', { class: 'duel-bar' }, [el('span', { class: 'duel-who', text: player === TOP ? '🔴' : '🔵' }), score]), q, opts, note]);
    return { node, score, q, opts, note, buttons: [] };
  };
  const halves = [half(BOTTOM), half(TOP)];
  const count = el('span', { class: 'duel-count' });
  const mid = el('div', { class: 'duel-mid' }, [el('button', { class: 'round-btn small', 'aria-label': 'Stop the duel', html: ICONS.back, onclick: () => (clearTimeout(timer), stopSpeech(), duelScreen(api, { level })) }), count]);
  const screen = el('div', { class: 'screen duel' }, [halves[TOP].node, mid, halves[BOTTOM].node]);
  api.app.replaceChildren(screen);

  const showRound = () => {
    const q = duel.qs[duel.at];
    count.textContent = `${duel.at + 1} / ${duel.qs.length}`;
    for (const [p, h] of halves.entries()) {
      h.node.classList.remove('locked', 'won', 'lost');
      h.q.textContent = q.hi;
      h.note.textContent = '';
      h.buttons = q.options.map((o) => {
        const b = el('button', { class: 'duel-opt', lang: 'hi', text: o });
        b.addEventListener('click', () => onTap(p, o, b));
        return b;
      });
      h.opts.replaceChildren(...h.buttons);
    }
    play([{ text: q.hi, lang: 'hi' }]);
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!alive()) return;
      duel = timeUp(duel);
      endRound();
    }, DUEL_WAIT_MS);
  };
  const reveal = () => {
    const q = duel.qs[duel.at];
    for (const h of halves) for (const b of h.buttons) (b.disabled = true), b.classList.toggle('right', b.textContent === q.answer);
  };
  const endRound = async () => {
    clearTimeout(timer);
    reveal();
    const w = duel.won;
    for (const [p, h] of halves.entries()) {
      h.score.textContent = String(duel.score[p]);
      if (w === p) (h.node.classList.add('won'), (h.note.textContent = '+1 ✨'), bounce(h.score));
      else if (w !== -1) h.node.classList.add('lost');
      else h.note.textContent = 'किसी को नहीं मिला!';
    }
    if (w === -1) api.sfx.feel?.('wrong');
    else api.sfx.feel?.('right');
    await new Promise((r) => setTimeout(r, 1800));
    if (!alive()) return;
    duel = nextRound(duel);
    if (duel.done) finish();
    else showRound();
  };
  const onTap = (p, o, b) => {
    const r = tap(duel, p, o);
    duel = r.duel;
    if (r.result === 'ignored') return;
    if (r.result === 'wrong') {
      b.classList.add('wrong');
      wobble(b);
      api.sfx.boing?.();
      const h = halves[p];
      h.node.classList.add('locked');
      for (const x of h.buttons) x.disabled = true;
      h.note.textContent = 'ग़लत! इस सवाल से बाहर।';
      if (duel.won === -1) endRound();
      return;
    }
    stopSpeech();
    endRound();
  };
  const finish = () => {
    const w = duelWinner(duel);
    for (const [p, h] of halves.entries()) {
      const mine = w === p;
      h.node.className = `duel-half ${p === TOP ? 'top' : 'bottom'} over${mine ? ' won' : w === -1 ? '' : ' lost'}`;
      h.q.textContent = w === -1 ? 'बराबरी! 🤝' : mine ? 'जीत तुम्हारी! 🏆' : 'अगली बार! 💪';
      h.opts.replaceChildren(el('b', { class: 'duel-final', text: `${duel.score[p]} : ${duel.score[1 - p]}` }));
      h.note.textContent = '';
    }
    count.textContent = '';
    mid.append(el('button', { class: 'bubble green duel-again', 'aria-label': 'Play again', html: ICONS.replay, onclick: () => (api.sfx.pop(), play_(api, level)) }));
    api.sfx.feel?.('reward');
    api.say(w === -1 ? 'duelDraw' : w === TOP ? 'duelTopWins' : 'duelBottomWins');
  };
  showRound();
}
