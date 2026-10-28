import {
  makeRng,
  langsFor,
  normalizeSettings,
  normalizeProgress,
  applyCompletion,
  activeLetters,
  activeLetterSets,
  visiblePlaces,
  clipKeysFor,
  clipKeyFromFileName,
} from './logic.js';
import { validateContent } from './validate.js';
import { KNOWN_PICTURES, picture, pictureForWord, specialVehicle } from './art.js';
import { initAudio, play, stop, refreshClipKeys, hasVoice, wordSegs, letterSegs, numberSegs, soundSegs, sentenceSegs, phraseSegs } from './audio.js';
import { KEYS, load, save, clips, resizeImage } from './storage.js';
import { sfx } from './sfx.js';
import { el, sleep, bounce, ICONS } from './ui.js';

const app = document.getElementById('app');
const state = { content: null, settings: null, progress: null, special: null, warnings: [], token: 0 };
const rng = makeRng();

// ---------- boot ----------

async function boot() {
  let content;
  try {
    const res = await fetch('content.json', { cache: 'no-cache' });
    content = await res.json();
  } catch (e) {
    return showError(['Could not load content.json: ' + e.message]);
  }
  const { errors, warnings } = validateContent(content, { knownPictures: KNOWN_PICTURES });
  if (errors.length) return showError(errors);
  for (const [id, w] of Object.entries(content.words)) w.id = id;
  state.content = content;
  state.warnings = warnings;
  state.settings = normalizeSettings(load(KEYS.settings), content);
  state.progress = normalizeProgress(load(KEYS.progress), content);
  state.special = load(KEYS.special);
  await initAudio();
  history.replaceState({ screen: 'map' }, '');
  window.addEventListener('popstate', () => showMap());
  showSplash();
}

function showError(errors) {
  app.replaceChildren(
    el('div', { class: 'error-screen' }, [
      el('h1', { text: 'content.json needs fixing' }),
      el('p', { text: 'A grown-up needs to fix these problems (see the README):' }),
      el('ul', {}, errors.map((e) => el('li', { text: e }))),
    ]),
  );
}

function showSplash() {
  const btn = el('button', { class: 'splash-play', 'aria-label': 'Play', html: ICONS.play });
  btn.addEventListener('click', () => {
    sfx.unlock();
    sfx.toot();
    say('welcome');
    showMap();
  });
  app.replaceChildren(el('div', { class: 'splash' }, [el('div', { class: 'splash-art', html: picture('bus') }), btn]));
}

// ---------- speech helpers ----------

const word = (id) => state.content.words[id];
const langs = () => langsFor(state.settings.lang);
const isLetter = (item) => item && typeof item.char === 'string';
const isNumber = (item) => item && typeof item.value === 'number';
const itemLangs = (item) => (isLetter(item) ? [item.lang] : langs());
const itemText = (item, lang) => (isLetter(item) ? item.say || item.char : item[lang]);
const PAUSE = { pause: 300 };

function itemSegs(item, lang) {
  if (isLetter(item)) return letterSegs(item);
  if (isNumber(item)) return numberSegs(item, lang);
  return wordSegs(item, lang);
}

function joinLangs(ls, fn) {
  return ls.flatMap((l, i) => (i ? [PAUSE, ...fn(l)] : fn(l)));
}

function phraseFor(key, item, lang) {
  return phraseSegs(state.content.phrases[key], key, lang, item ? (l) => itemSegs(item, l) : null, item ? itemText(item, lang) : '');
}

function say(key, item = null, ls = item ? itemLangs(item) : langs()) {
  return play(joinLangs(ls, (l) => phraseFor(key, item, l)));
}

function sayText(text, lang) {
  return play([{ text, lang }]);
}

function sayItem(item, ls = itemLangs(item)) {
  return play(joinLangs(ls, (l) => itemSegs(item, l)));
}

// A letter, then its example word in the same language ("क ... कार").
function sayLetterWithWord(letter) {
  const segs = letterSegs(letter);
  if (letter.word) segs.push(PAUSE, ...wordSegs(word(letter.word), letter.lang));
  return play(segs);
}

function saySound(w) {
  return play(joinLangs(langs(), (l) => [...wordSegs(w, l), PAUSE, ...soundSegs(w, l)]));
}

function sayAbout(w) {
  const options = (state.content.sentences || []).filter((s) => s.about === w.id);
  const segs = joinLangs(langs(), (l) => wordSegs(w, l));
  if (options.length) {
    const s = options[Math.floor(rng() * options.length)];
    segs.push(PAUSE, ...joinLangs(langs(), (l) => sentenceSegs(s, l)));
  }
  return play(segs);
}

// ---------- shared visual helpers ----------

function label(w) {
  const mode = state.settings.lang;
  return el('span', { class: 'label' }, [
    mode !== 'en' ? el('span', { class: 'hi', lang: 'hi', text: w.hi }) : null,
    mode !== 'hi' ? el('span', { class: 'en', lang: 'en', text: w.en }) : null,
  ]);
}

function wordCard(w, { showLabel = true, cls = '' } = {}) {
  return el('button', { class: `card ${cls}`, 'aria-label': `${w.en} ${w.translit}` }, [
    el('span', { class: 'pic', html: pictureForWord(w) }),
    showLabel ? label(w) : null,
  ]);
}

function letterCard(letter, { cls = '' } = {}) {
  return el('button', { class: `card letter ${cls}`, 'aria-label': letter.translit, lang: letter.lang }, [
    el('span', { class: 'glyph', text: letter.char }),
  ]);
}

function vehicleArt(id) {
  if (id === 'special' && state.special) return specialVehicle(state.special);
  return picture(word(id)?.picture || id);
}

// ---------- town map ----------

function showMap() {
  state.token++;
  stop();
  const places = visiblePlaces(state.content, state.settings);
  const tiles = places.map((p) => placeTile(word(p.word), p.color, () => openPlace(p)));
  tiles.push(placeTile(word('place-garage'), '#7986cb', () => navigate(showGarage)));
  app.replaceChildren(
    el('div', { class: 'screen map' }, [
      el('header', { class: 'map-head' }, [el('div', { class: 'map-sun' }), parentGate()]),
      el('div', { class: 'town' }, tiles),
    ]),
  );
}

function placeTile(w, color, onOpen) {
  const tile = el('button', { class: 'place', style: { '--place': color }, 'aria-label': w.en }, [
    el('span', { class: 'pic', html: pictureForWord(w) }),
    label(w),
  ]);
  tile.addEventListener('click', async () => {
    sfx.pop();
    sayItem(w);
    await bounce(tile);
    onOpen();
  });
  return tile;
}

function navigate(screenFn) {
  if (history.state?.screen === 'map') history.pushState({ screen: 'place' }, '');
  screenFn();
}

function goHome() {
  if (history.state?.screen === 'place') history.back();
  else showMap();
}

async function openPlace(place) {
  const mod = await import(`./games/${place.game}.js`);
  navigate(() => startGame(mod.default, place));
}

// ---------- game frame ----------

function startGame(game, place) {
  const token = ++state.token;
  stop();
  const stars = el('div', { class: 'stars' });
  const stage = el('main', { class: 'stage' });
  let repeat = null;
  const homeBtn = el('button', { class: 'round-btn home', 'aria-label': 'Home', html: ICONS.home, onclick: goHome });
  const speakBtn = el('button', {
    class: 'round-btn speak',
    'aria-label': 'Say it again',
    html: ICONS.speaker,
    onclick: () => repeat && repeat(),
  });
  app.replaceChildren(
    el('div', { class: `screen game game-${place.game}`, style: { '--place': place.color || '#4fc3f7' } }, [
      el('header', { class: 'game-head' }, [homeBtn, stars, speakBtn]),
      stage,
    ]),
  );

  const ctx = {
    content: state.content,
    settings: state.settings,
    progress: state.progress,
    special: state.special,
    place,
    options: place.options || {},
    config: state.content.games[place.game] || {},
    rng,
    stage,
    langs: langs(),
    alive: () => token === state.token,
    word,
    words: (ids) => ids.map(word),
    letters: () => activeLetters(state.content, state.settings),
    letterSets: () => activeLetterSets(state.content, state.settings),
    numbers: state.content.numbers,
    say,
    sayItem,
    sayText,
    sayLetterWithWord,
    saySound,
    sayAbout,
    stop,
    sfx,
    label,
    wordCard,
    letterCard,
    vehicleArt,
    picture: pictureForWord,
    unlockedVehicles: () => state.progress.unlockedVehicles,
    setRepeat: (fn) => (repeat = fn),
    setProgress(done, total) {
      stars.replaceChildren(
        ...Array.from({ length: total }, (_, i) => el('span', { class: `star ${i < done ? 'on' : ''}`, html: ICONS.star })),
      );
    },
    saveProgress(update) {
      state.progress = { ...state.progress, ...update };
      ctx.progress = state.progress;
      save(KEYS.progress, state.progress);
    },
    complete: () => (ctx.alive() ? celebrate(place.game) : null),
  };
  game.start(ctx);
}

async function celebrate(gameId) {
  state.token++;
  const ids = state.content.vehicles.map((v) => v.id);
  const { progress, newVehicle } = applyCompletion(state.progress, gameId, ids);
  state.progress = progress;
  save(KEYS.progress, progress);
  sfx.cheer();
  const confetti = el(
    'div',
    { class: 'confetti' },
    Array.from({ length: 30 }, (_, i) =>
      el('i', { style: { left: `${(i * 37) % 100}%`, animationDelay: `${(i % 10) * 0.12}s`, background: ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#ab47bc'][i % 5] } }),
    ),
  );
  const w = newVehicle ? word(newVehicle) : null;
  const done = el('button', { class: 'round-btn big go', 'aria-label': 'Done', html: ICONS.check, onclick: goHome });
  app.replaceChildren(
    el('div', { class: 'screen celebrate' }, [
      confetti,
      el('div', { class: 'prize' }, [
        w ? el('div', { class: 'pic prize-pic', html: pictureForWord(w) }) : el('div', { class: 'big-star', html: ICONS.star }),
        w ? label(w) : null,
      ]),
      done,
    ]),
  );
  await sleep(900);
  if (w) await say('newVehicle', w);
  else await say('great');
}

// ---------- garage ----------

function showGarage() {
  state.token++;
  const unlocked = new Set(state.progress.unlockedVehicles);
  const cards = [];
  if (state.special) {
    const c = el('button', { class: 'card garage-car special', 'aria-label': 'special vehicle', html: specialVehicle(state.special) });
    c.addEventListener('click', () => {
      sfx.vroom();
      bounce(c);
      say('special');
    });
    cards.push(c);
  }
  for (const v of state.content.vehicles) {
    const w = word(v.id);
    const have = unlocked.has(v.id);
    const c = el('button', { class: `card garage-car ${have ? '' : 'locked'}`, 'aria-label': have ? w.en : 'locked' }, [
      el('span', { class: 'pic', html: pictureForWord(w) }),
      have ? label(w) : null,
    ]);
    c.addEventListener('click', () => {
      if (!have) return void sfx.boing();
      sfx.vroom();
      bounce(c);
      sayAbout(w);
    });
    cards.push(c);
  }
  const homeBtn = el('button', { class: 'round-btn home', 'aria-label': 'Home', html: ICONS.home, onclick: goHome });
  app.replaceChildren(
    el('div', { class: 'screen garage', style: { '--place': '#7986cb' } }, [
      el('header', { class: 'game-head' }, [homeBtn, label(word('place-garage')), el('span')]),
      el('main', { class: 'garage-grid' }, cards),
    ]),
  );
}

// ---------- parent settings (behind a 3-second press) ----------

function parentGate() {
  const btn = el('button', { class: 'gate', 'aria-label': 'Parent settings: press and hold for 3 seconds', html: ICONS.gear });
  let start = 0;
  let raf = 0;
  const reset = () => {
    cancelAnimationFrame(raf);
    start = 0;
    btn.style.setProperty('--p', 0);
  };
  const tick = () => {
    const p = Math.min(1, (performance.now() - start) / 3000);
    btn.style.setProperty('--p', p);
    if (p >= 1) {
      reset();
      showSettings();
    } else raf = requestAnimationFrame(tick);
  };
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    start = performance.now();
    raf = requestAnimationFrame(tick);
  });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) btn.addEventListener(ev, reset);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
  return btn;
}

function showSettings() {
  stop();
  const { content } = state;
  const s = state.settings;
  const persist = () => save(KEYS.settings, state.settings);
  const section = (title, ...kids) => el('section', {}, [el('h2', { text: title }), ...kids]);
  const check = (text, checked, onchange) =>
    el('label', { class: 'check' }, [el('input', { type: 'checkbox', checked, onchange: (e) => onchange(e.target.checked) }), el('span', { text })]);

  const langRow = el(
    'div',
    { class: 'seg' },
    [
      ['hi', 'हिन्दी Hindi'],
      ['en', 'English'],
      ['both', 'Both / दोनों'],
    ].map(([value, text]) =>
      el('label', {}, [
        el('input', {
          type: 'radio',
          name: 'lang',
          value,
          checked: s.lang === value,
          onchange: () => {
            s.lang = value;
            persist();
          },
        }),
        el('span', { text }),
      ]),
    ),
  );
  const voiceNote = el('p', { class: 'note' });
  const missing = ['hi', 'en'].filter((l) => !hasVoice(l));
  if (missing.length && 'speechSynthesis' in window)
    voiceNote.textContent = `This device has no ${missing.map((l) => (l === 'hi' ? 'Hindi' : 'English')).join(' or ')} text-to-speech voice. Add one in Android Settings › Text-to-speech, or load recordings below.`;

  const places = content.places.map((p) =>
    check(`${word(p.word).en} · ${word(p.word).hi}`, s.places[p.id], (v) => {
      s.places[p.id] = v;
      persist();
    }),
  );
  const sets = content.letterSets.map((set) =>
    check(`${set.name.en} · ${set.name.hi}`, s.letterSets[set.id], (v) => {
      s.letterSets[set.id] = v;
      persist();
    }),
  );

  // special vehicle
  const preview = el('div', { class: 'special-preview', html: state.special ? specialVehicle(state.special) : '' });
  const photoInput = el('input', { type: 'file', accept: 'image/*', class: 'visually-hidden', id: 'photo-in' });
  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;
    try {
      state.special = await resizeImage(file);
      if (!save(KEYS.special, state.special)) alert('This browser could not save the photo.');
      preview.innerHTML = specialVehicle(state.special);
    } catch {
      alert('That file could not be opened as a picture.');
    }
  });
  const removePhoto = el('button', {
    class: 'btn',
    text: 'Remove photo',
    onclick: () => {
      state.special = null;
      save(KEYS.special, null);
      preview.innerHTML = '';
    },
  });

  // family voice recordings
  const validKeys = clipKeysFor(content);
  const audioStatus = el('p', { class: 'note' });
  const showCount = async () => {
    const keys = await clips.keys();
    audioStatus.textContent = `${keys.length} recording(s) saved on this device.`;
  };
  showCount();
  const audioInput = el('input', { type: 'file', accept: 'audio/*', multiple: true, class: 'visually-hidden', id: 'audio-in' });
  audioInput.addEventListener('change', async () => {
    let added = 0;
    const unknown = [];
    for (const f of audioInput.files) {
      const key = clipKeyFromFileName(f.name, validKeys);
      if (!key) {
        unknown.push(f.name);
        continue;
      }
      try {
        await clips.put(key, f);
        added++;
      } catch {
        unknown.push(f.name);
      }
    }
    refreshClipKeys(await clips.keys());
    await showCount();
    if (unknown.length) audioStatus.textContent += ` Not recognised: ${unknown.join(', ')}.`;
    audioStatus.textContent = `Added ${added}. ` + audioStatus.textContent;
  });
  const clearAudio = el('button', {
    class: 'btn',
    text: 'Remove all recordings',
    onclick: async () => {
      if (!confirm('Remove all voice recordings from this device?')) return;
      await clips.clear();
      refreshClipKeys([]);
      showCount();
    },
  });
  const names = el('details', {}, [
    el('summary', { text: `Recording file names (${validKeys.length})` }),
    el('p', { class: 'note', text: 'Name each file after what it says, e.g. bus_hi.m4a or hc-ka.mp3. Any audio type works.' }),
    el('pre', { class: 'names', text: validKeys.join('\n') }),
  ]);

  const resetBtn = el('button', {
    class: 'btn danger',
    text: 'Reset garage and progress',
    onclick: () => {
      if (!confirm('Lock the garage vehicles again and reset progress?')) return;
      state.progress = normalizeProgress(null, content);
      save(KEYS.progress, state.progress);
    },
  });

  const close = el('button', { class: 'btn primary', text: 'Done', onclick: () => showMap() });
  app.replaceChildren(
    el('div', { class: 'screen settings' }, [
      el('h1', { text: 'Parent settings' }),
      section('Language', langRow, voiceNote),
      section('Places on the map', ...places),
      section('Letter sets', ...sets, el('p', { class: 'note', text: 'Only sets in the chosen language are used.' })),
      section(
        'My special vehicle',
        el('p', { class: 'note', text: 'Pick a photo from this device. It stays only in this browser and is never uploaded.' }),
        preview,
        el('div', { class: 'row' }, [el('label', { class: 'btn', for: 'photo-in', text: 'Choose photo' }), photoInput, removePhoto]),
      ),
      section(
        'Family voices',
        el('p', { class: 'note', text: 'Load voice recordings from this device. They stay only in this browser.' }),
        el('div', { class: 'row' }, [el('label', { class: 'btn', for: 'audio-in', text: 'Load recordings' }), audioInput, clearAudio]),
        audioStatus,
        names,
      ),
      section('Progress', resetBtn),
      state.warnings.length ? section('Content warnings', el('ul', {}, state.warnings.map((w) => el('li', { text: w })))) : null,
      close,
    ]),
  );
}

// ---------- offline ----------

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

boot();
