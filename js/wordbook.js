// "Words I know" (docs/ROADMAP.md 7.13): every word a child has got right first time three times goes into
// a picture dictionary to flip through, hear, and show a grown-up, with the count on the home screen.
// Stars count lessons; children and parents care about words. Built from progress.stats (w:<id>).
import { el, bounce, ICONS } from './ui.js';
import { pictureForWord, pictureExists } from './art.js';

export const KNOWN_AT = 3;
// the words known, in the order the book shows them (the word list's order)
export function wordsKnown(progress, content) {
  const stats = progress?.stats || {};
  return Object.keys(content.words).filter((id) => (stats[`w:${id}`]?.first || 0) >= KNOWN_AT && pictureExists(content.words[id].picture) && !/^(comic|place|shape)-/.test(id));
}

// the home screen's count
export function wordsChip(api) {
  const n = wordsKnown(api.state.progress, api.state.content).length;
  return el('button', { class: 'words-chip', 'aria-label': `Words I know: ${n}`, onclick: () => (api.sfx.pop(), api.go('words')) }, [
    el('span', { class: 'words-icon', 'aria-hidden': 'true', text: '📚' }),
    el('span', { class: 'words-text' }, [el('b', { lang: 'hi', text: 'मेरे शब्द' }), el('small', { text: 'Words I know' })]),
    el('b', { class: 'words-count', text: String(n) }),
  ]);
}

// The book: one word a page (flip with the arrows or a swipe), or all of them on one page.
export function wordBook(api, { at = 0, grid = false, hello = true } = {}) {
  const { content } = api.state;
  const ids = wordsKnown(api.state.progress, content);
  const n = ids.length;
  const head = el('header', { class: 'game-head' }, [
    el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
    el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: 'मेरे शब्द' }), el('span', { class: 'world-name-en', text: 'My word book' })]),
    n ? el('button', { class: 'round-btn small', 'aria-label': grid ? 'One word a page' : 'All my words', html: grid ? ICONS.book : ICONS.album, onclick: () => wordBook(api, { at, grid: !grid, hello: false }) }) : el('span', { class: 'round-spacer' }),
  ]);
  // what to show a grown-up
  const brag = el('p', { class: 'words-brag' }, [el('b', { lang: 'hi', text: `मुझे ${n} शब्द आते हैं!` }), el('span', { text: `I know ${n} word${n === 1 ? '' : 's'}!` })]);
  let body;
  if (!n) {
    body = el('div', { class: 'words-empty' }, [el('span', { class: 'words-icon', text: '📖' }), el('b', { lang: 'hi', text: 'खेलो और शब्द सीखो!' }), el('span', { text: `A word goes in the book when you get it right ${KNOWN_AT} times.` })]);
  } else if (grid) {
    body = el(
      'div',
      { class: 'words-grid' },
      ids.map((id, i) => {
        const w = api.word(id);
        const b = el('button', { class: 'words-cell', 'aria-label': w.en }, [el('span', { class: 'words-pic', html: pictureForWord(w) }), el('b', { lang: 'hi', text: w.hi })]);
        b.addEventListener('click', () => wordBook(api, { at: i, hello: false }));
        return b;
      }),
    );
  } else {
    const i = Math.max(0, Math.min(n - 1, at));
    const w = api.word(ids[i]);
    const say = () => api.sayItem(w);
    const page = el('button', { class: 'words-page', 'aria-label': `${w.en}: hear it` }, [
      el('span', { class: 'words-pic big', html: pictureForWord(w) }),
      el('b', { class: 'words-hi', lang: 'hi', text: w.hi }),
      el('span', { class: 'words-en', text: w.en }),
      el('small', { class: 'words-n', text: `${i + 1} / ${n}` }),
    ]);
    page.addEventListener('click', () => (bounce(page), say()));
    const go = (d) => {
      const j = i + d;
      if (j < 0 || j >= n) return;
      api.sfx.feel?.('page');
      wordBook(api, { at: j, hello: false });
    };
    // a swipe turns the page too
    let x0 = null;
    page.addEventListener('pointerdown', (e) => (x0 = e.clientX));
    page.addEventListener('pointerup', (e) => {
      if (x0 != null && Math.abs(e.clientX - x0) > 60) go(e.clientX < x0 ? 1 : -1);
      x0 = null;
    });
    body = el('div', { class: 'words-flip' }, [
      el('button', { class: 'round-btn', 'aria-label': 'Previous word', html: ICONS.back, disabled: i === 0, onclick: () => go(-1) }),
      page,
      el('button', { class: 'round-btn', 'aria-label': 'Next word', html: ICONS.next, disabled: i >= n - 1, onclick: () => go(1) }),
    ]);
  }
  const screen = el('div', { class: `screen word-book enter${grid ? ' grid' : ''}` }, [head, n ? brag : null, el('main', { class: 'words-main' }, [body])]);
  api.app.replaceChildren(screen);
  // on opening: a hello (or, empty, a nudge), then the first word; turning a page just says the word
  setTimeout(async () => {
    if (hello) await api.say(n ? 'wordsHello' : 'wordsEmpty');
    if (n && !grid && screen.isConnected) api.sayItem(api.word(ids[Math.max(0, Math.min(n - 1, at))]));
  }, 300);
}
