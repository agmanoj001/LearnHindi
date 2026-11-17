// The comic maker for Grades 7–8 (docs/ROADMAP.md 7.16): make a three-panel comic with the cast of the
// app's comics. For each panel pick a place, up to two characters (their face and pose), and type what
// they say. Comics are kept with this child's progress (so they stay on this device and go into the
// backup), shown in "my comics", and read aloud in the characters' voices.
import { el, bounce, ICONS } from './ui.js';
import { play, stop as stopSpeech } from './audio.js';
import { castSvg, comicBg, CAST } from './art-comic.js';
import { stripPanel, aimTails, castLine } from './corner.js';

export const MAKER_MAX = 20; // comics kept
export const MAKER_PANELS = 3;
export const TEXT_MAX = 90; // letters in a bubble or a caption
export const TITLE_MAX = 40;
// who can be in a comic: the heroes and friends of all seven series
export const MAKER_CAST = ['kavya', 'chippu', 'nani', 'montu', 'mishti', 'bijli', 'buntu', 'colonel', 'laddoolal', 'teacher', 'dadi', 'mausi', 'roohi', 'pappu', 'inspector', 'akbar', 'birbal', 'vikram', 'betal', 'murari', 'golu', 'rimjhim', 'zoya', 'biscuit'];
export const MAKER_BGS = ['room', 'kitchen', 'classroom', 'street', 'bazaar', 'park', 'garden', 'terrace', 'fair', 'night', 'jungle', 'river', 'desert', 'stage', 'fort', 'hills', 'darbar', 'library'];
export const MAKER_FACES = [
  ['smile', '🙂'],
  ['grin', '😁'],
  ['laugh', '😂'],
  ['shock', '😲'],
  ['angry', '😠'],
  ['sad', '😢'],
  ['think', '🤔'],
  ['sly', '😏'],
  ['worried', '😟'],
  ['wink', '😉'],
  ['sleep', '😴'],
];
export const MAKER_ARMS = [
  ['down', '🧍'],
  ['wave', '👋'],
  ['point', '👉'],
  ['up', '🙌'],
  ['hips', '💁'],
  ['chin', '🤔'],
];
export const BUBBLE_KINDS = [
  ['say', 'बोलो', 'Say'],
  ['shout', 'चिल्लाओ', 'Shout'],
  ['whisper', 'फुसफुसाओ', 'Whisper'],
  ['think', 'सोचो', 'Think'],
];

// where the characters stand: one in the middle, two apart
const spots = (n) => (n === 1 ? [50] : [28, 72]);

// A new comic: Kavya and Chippu in three places, ready for words.
export function newComic(now = Date.now()) {
  const bgs = ['room', 'street', 'park'];
  return {
    id: `m${now.toString(36)}`,
    title: '',
    made: now,
    panels: bgs.map((bg) => ({ bg, cast: [{ who: 'kavya', at: 28, face: 'smile', arms: 'down' }, { who: 'chippu', at: 72, face: 'grin', arms: 'down' }], say: [] })),
  };
}
export const comicsOf = (progress) => progress?.myComics || [];
// keep a comic (newest first), at most MAKER_MAX
export function keepComic(list, comic) {
  return [comic, ...(list || []).filter((c) => c.id !== comic.id)].slice(0, MAKER_MAX);
}
// what a character says in a panel ('' if nothing)
export const lineOf = (panel, who) => panel.say.find((b) => b.who === who)?.text || '';
// set a character's words in a panel (an empty line removes the bubble), keeping the characters' order
export function setLine(panel, who, text, kind) {
  const t = String(text || '').slice(0, TEXT_MAX);
  const others = panel.say.filter((b) => b.who !== who);
  const mine = t.trim() ? [{ who, text: t, ...(kind && kind !== 'say' ? { kind } : {}) }] : [];
  const order = panel.cast.map((c) => c.who);
  return { ...panel, say: [...others, ...mine].sort((a, b) => order.indexOf(a.who) - order.indexOf(b.who)) };
}
// put a character in a slot (0 or 1), or take slot 1 out (who = null); the words go with the character
export function setCast(panel, slot, who) {
  let cast = panel.cast.map((c) => ({ ...c }));
  if (who === null) cast = cast.filter((_, i) => i !== slot);
  else if (cast[slot]) cast[slot] = { ...cast[slot], who };
  else cast.push({ who, face: 'smile', arms: 'down' });
  // one character can't be in a panel twice
  cast = cast.filter((c, i) => cast.findIndex((d) => d.who === c.who) === i);
  const at = spots(cast.length);
  cast = cast.map((c, i) => ({ ...c, at: at[i] }));
  const ids = new Set(cast.map((c) => c.who));
  const old = panel.cast[slot]?.who;
  const say = panel.say.map((b) => (b.who === old && who ? { ...b, who } : b)).filter((b) => ids.has(b.who));
  return { ...panel, cast, say };
}
// is there anything to read in it?
export const hasWords = (comic) => comic.panels.some((p) => p.say.length || (p.cap || '').trim());

const readComic = async (panels, isLive) => {
  for (const node of panels.flatMap((p) => [...p.querySelectorAll('.comic-cap, .comic-bubble')])) {
    if (!isLive()) return;
    node.classList.add('reading');
    await play([node.classList.contains('comic-cap') ? { text: node.textContent, lang: 'hi' } : castLine(node.dataset.who, node.textContent)]);
    node.classList.remove('reading');
  }
};

const head = (api, title, onBack, right = null) =>
  el('header', { class: 'game-head' }, [
    el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => (stopSpeech(), onBack()) }),
    el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: title.hi }), el('span', { class: 'world-name-en', text: title.en })]),
    right || el('span', { class: 'round-spacer' }),
  ]);

// a small picture of a comic's first panel, for the shelf
const thumb = (comic) => {
  const p = comic.panels[0];
  return el('span', { class: 'maker-thumb', 'aria-hidden': 'true' }, [el('span', { class: 'maker-thumb-bg', html: comicBg(p.bg) }), ...p.cast.map((c) => el('span', { class: 'maker-thumb-char', style: { left: `${c.at}%` }, html: CAST[c.who] ? castSvg(c.who, { face: c.face, arms: c.arms }) : '' }))]);
};

// ---------- my comics, and reading one ----------
export function comicMaker(api, { id = null, edit = false } = {}) {
  const comics = comicsOf(api.state.progress);
  const comic = id && comics.find((c) => c.id === id);
  if (edit) return editor(api, comic ? structuredClone(comic) : newComic());
  if (comic) return viewer(api, comic);
  // the shelf: a new one, and the ones made
  const make = el('button', { class: 'maker-new', 'aria-label': 'Make a new comic', onclick: () => (api.sfx.pop(), comicMaker(api, { edit: true })) }, [el('span', { class: 'maker-new-plus', text: '+' }), el('b', { lang: 'hi', text: 'नया कॉमिक बनाओ' }), el('small', { text: 'Make a new comic' })]);
  const shelf = comics.map((c) => {
    const b = el('button', { class: 'maker-card', 'aria-label': c.title || 'My comic' }, [thumb(c), el('b', { lang: 'hi', text: c.title || 'मेरा कॉमिक' }), el('small', { text: new Date(c.made).toLocaleDateString() })]);
    b.addEventListener('click', () => (api.sfx.pop(), comicMaker(api, { id: c.id })));
    return b;
  });
  api.app.replaceChildren(el('div', { class: 'screen maker enter' }, [head(api, { hi: 'मेरे कॉमिक', en: 'My comics' }, () => api.back()), el('main', { class: 'maker-main' }, [el('div', { class: 'maker-shelf' }, [make, ...shelf])])]));
  if (!comics.length) api.say('makerHello');
}

function viewer(api, comic) {
  let live = true;
  const panels = comic.panels.map((p, i) => stripPanel(p, i, async (node, seg) => (stopSpeech(), node.classList.add('reading'), await play([seg]), node.classList.remove('reading'))));
  const isLive = () => live && screen.isConnected;
  const screen = el('div', { class: 'screen maker enter' }, [
    head(api, { hi: comic.title || 'मेरा कॉमिक', en: 'My comic' }, () => ((live = false), comicMaker(api)), el('button', { class: 'round-btn', 'aria-label': 'Read it aloud', html: ICONS.speaker, onclick: () => readComic(panels, isLive) })),
    el('main', { class: 'maker-main' }, [
      el('div', { class: 'idiom-strip maker-strip' }, panels),
      el('div', { class: 'maker-actions' }, [
        el('button', { class: 'bubble', 'aria-label': 'Change it', onclick: () => ((live = false), comicMaker(api, { id: comic.id, edit: true })) }, [el('span', { lang: 'hi', text: '✏️ बदलो' })]),
        el('button', {
          class: 'bubble ghost',
          'aria-label': 'Delete it',
          onclick: (e) => {
            const b = e.currentTarget;
            if (!b.classList.contains('sure')) return b.classList.add('sure'), (b.firstChild.textContent = '🗑️ पक्का?');
            live = false;
            api.state.progress = { ...api.state.progress, myComics: comicsOf(api.state.progress).filter((c) => c.id !== comic.id) };
            api.persistProgress();
            comicMaker(api);
          },
        }, [el('span', { lang: 'hi', text: '🗑️ हटाओ' })]),
      ]),
    ]),
  ]);
  api.app.replaceChildren(screen);
  requestAnimationFrame(() => aimTails(panels));
}

// ---------- making one ----------
function editor(api, comic) {
  let at = 0; // the panel being made
  const preview = el('div', { class: 'maker-preview' });
  const tabs = el('div', { class: 'maker-tabs', role: 'tablist' });
  const controls = el('div', { class: 'maker-controls' });
  const title = el('input', { class: 'maker-title', lang: 'hi', type: 'text', maxlength: String(TITLE_MAX), placeholder: 'कॉमिक का नाम', 'aria-label': 'Title', value: comic.title });
  title.addEventListener('input', () => (comic.title = title.value.slice(0, TITLE_MAX)));
  const panel = () => comic.panels[at];
  const update = (p) => {
    comic.panels[at] = p;
    drawPreview();
    drawTabs();
  };
  const drawPreview = () => {
    const node = stripPanel(panel(), at, (n, seg) => play([seg]));
    preview.replaceChildren(node);
    requestAnimationFrame(() => aimTails([node]));
  };
  const drawTabs = () =>
    tabs.replaceChildren(
      ...comic.panels.map((p, i) => {
        const t = el('button', { class: `maker-tab${i === at ? ' on' : ''}`, role: 'tab', 'aria-selected': i === at ? 'true' : 'false', 'aria-label': `Panel ${i + 1}` }, [thumb({ panels: [p] }), el('b', { text: String(i + 1) })]);
        t.addEventListener('click', () => {
          at = i;
          api.sfx.feel?.('select');
          drawAll();
        });
        return t;
      }),
    );
  const row = (cls, items) => el('div', { class: `maker-row ${cls}` }, items);
  const pick = (on, label, content, onclick, cls = '') => {
    const b = el('button', { class: `maker-pick ${cls}${on ? ' on' : ''}`, 'aria-label': label, 'aria-pressed': on ? 'true' : 'false' }, content);
    b.addEventListener('click', () => (api.sfx.feel?.('select'), onclick()));
    return b;
  };
  const drawControls = () => {
    const p = panel();
    const slot = (i) => {
      const c = p.cast[i];
      const kind = p.say.find((b) => b.who === c?.who)?.kind || 'say';
      const who = row(
        'cast',
        [
          ...(i === 1 ? [pick(!c, 'Nobody', [el('span', { class: 'maker-none', text: '✕' })], () => (update(setCast(p, 1, null)), drawControls()))] : []),
          ...MAKER_CAST.map((id) => pick(c?.who === id, CAST[id].name.en, [el('span', { class: 'maker-face', html: castSvg(id, { face: 'smile' }) }), el('small', { lang: 'hi', text: CAST[id].name.hi })], () => (update(setCast(p, i, id)), drawControls()))),
        ],
      );
      if (!c) return el('section', { class: 'maker-slot' }, [el('b', { lang: 'hi', text: `किरदार ${i + 1}` }), who]);
      const set = (k, v) => update({ ...p, cast: p.cast.map((d, j) => (j === i ? { ...d, [k]: v } : d)) });
      const words = el('textarea', { class: 'maker-words', lang: 'hi', rows: '2', maxlength: String(TEXT_MAX), placeholder: `${CAST[c.who].name.hi} क्या बोले?`, 'aria-label': `What ${CAST[c.who].name.en} says` });
      words.value = lineOf(p, c.who);
      words.addEventListener('input', () => {
        comic.panels[at] = setLine(comic.panels[at], c.who, words.value, kind);
        drawPreview();
      });
      return el('section', { class: 'maker-slot' }, [
        el('b', { lang: 'hi', text: `किरदार ${i + 1}: ${CAST[c.who].name.hi}` }),
        who,
        row('faces', MAKER_FACES.map(([f, e]) => pick(c.face === f, f, [el('span', { text: e })], () => (set('face', f), drawControls())))),
        row('arms', MAKER_ARMS.map(([a, e]) => pick(c.arms === a, a, [el('span', { text: e })], () => (set('arms', a), drawControls())))),
        words,
        row('kinds', BUBBLE_KINDS.map(([k, hi, en]) => pick(kind === k, en, [el('span', { lang: 'hi', text: hi })], () => (update(setLine(panel(), c.who, lineOf(panel(), c.who), k)), drawControls()), 'kind'))),
      ]);
    };
    const cap = el('input', { class: 'maker-cap', lang: 'hi', type: 'text', maxlength: String(TEXT_MAX), placeholder: 'कहानी की पंक्ति (चाहो तो)', 'aria-label': 'Caption' });
    cap.value = p.cap || '';
    cap.addEventListener('input', () => {
      const v = cap.value.slice(0, TEXT_MAX);
      const q = { ...comic.panels[at] };
      if (v.trim()) q.cap = v;
      else delete q.cap;
      comic.panels[at] = q;
      drawPreview();
    });
    controls.replaceChildren(
      el('section', { class: 'maker-slot' }, [el('b', { lang: 'hi', text: 'जगह' }), row('bgs', MAKER_BGS.map((bg) => pick(p.bg === bg, bg, [el('span', { class: 'maker-bg', html: comicBg(bg) })], () => (update({ ...panel(), bg }), drawControls()), 'bg')))]),
      slot(0),
      slot(1),
      el('section', { class: 'maker-slot' }, [el('b', { lang: 'hi', text: 'पंक्ति' }), cap]),
    );
  };
  const drawAll = () => (drawPreview(), drawTabs(), drawControls());
  const save = () => {
    comic.title = title.value.trim().slice(0, TITLE_MAX);
    comic.made = comic.made || Date.now();
    api.state.progress = { ...api.state.progress, myComics: keepComic(comicsOf(api.state.progress), comic) };
    api.persistProgress();
    api.sfx.feel?.('reward');
    api.say('makerSaved');
    comicMaker(api, { id: comic.id });
  };
  const saveBtn = el('button', { class: 'round-btn maker-save', 'aria-label': 'Save', html: ICONS.check });
  saveBtn.addEventListener('click', () => (bounce(saveBtn), save()));
  api.app.replaceChildren(
    el('div', { class: 'screen maker making enter' }, [
      head(api, { hi: 'कॉमिक बनाओ', en: 'Make a comic' }, () => comicMaker(api), saveBtn),
      el('main', { class: 'maker-main' }, [title, tabs, el('div', { class: 'maker-work' }, [preview, controls])]),
    ]),
  );
  drawAll();
}
