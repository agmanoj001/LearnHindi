// App shell: boot, navigation (with the phone's back button), speech helpers and the lesson frame.
import {
  makeRng,
  langsFor,
  normalizeSettings,
  normalizeProgress,
  expandWords,
  wordsForMatras,
  lessonConfig,
  itemKey,
  recordAnswer,
  practiceWeight,
  weightedSequence,
} from './logic.js';
import { findLesson, lessonRecord, lessonLetters, applyLessonResult, homeWorld, adaptTier } from './curriculum.js';
import { validateContent } from './validate.js';
import { pictureExists, picture, pictureForWord, specialVehicle } from './art.js';
import { initAudio, play, stop, wordSegs, letterSegs, numberSegs, soundSegs, sentenceSegs, phraseSegs, setVoicePrefs } from './audio.js';
import { KEYS, load, save } from './storage.js';
import { sfx, music } from './sfx.js';
import { el, sleep, bounce, ICONS } from './ui.js';
import { createMascot } from './mascot.js';
import * as screens from './screens.js';
import { showParent } from './parent.js';

const app = document.getElementById('app');
const state = { content: null, settings: null, progress: null, special: null, warnings: [], token: 0, lang: 'both', depth: 0 };
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
  const { errors, warnings } = validateContent(content, { pictureExists });
  if (errors.length) return showError(errors);
  for (const [id, w] of Object.entries(content.words)) w.id = id;
  state.content = content;
  state.warnings = warnings;
  state.settings = normalizeSettings(load(KEYS.settings), content);
  state.progress = normalizeProgress(load(KEYS.progress), content);
  state.special = load(KEYS.special);
  state.lang = state.settings.lang;
  setVoicePrefs(state.settings.voice);
  sfx.enabled = state.settings.sfx;
  music.enabled = state.settings.music;
  await initAudio();
  history.replaceState({ name: 'splash', depth: 0 }, '');
  window.addEventListener('popstate', (e) => render(e.state || { name: 'hub', depth: 0 }));
  render({ name: 'splash', depth: 0 });
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

// ---------- navigation ----------
// Every screen is a history entry, so Android's back button (and the in-app back arrows) walk back up:
// lesson -> world map -> hub.

function homeRoute() {
  const s = state.settings;
  if (!s.onboarded) return { name: 'onboard', params: {} };
  if (s.lockGrade) return { name: 'world', params: { worldId: homeWorld(state.content, s).id } };
  return { name: 'hub', params: {} };
}

function go(name, params = {}, { replace = false } = {}) {
  const route = { name, params, depth: replace ? state.depth : state.depth + 1 };
  if (replace) history.replaceState(route, '');
  else history.pushState(route, '');
  render(route);
}

function back() {
  if (state.depth > 0) history.back();
  else goHome();
}

function goHome() {
  const r = homeRoute();
  go(r.name, r.params, { replace: true });
}

function render(route) {
  state.token++;
  stop();
  state.depth = route.depth || 0;
  const p = route.params || {};
  const world = p.worldId ? worldById(p.worldId) : null;
  if (world) enterWorld(world);
  switch (route.name) {
    case 'splash':
      return screens.splash(api);
    case 'onboard':
      return screens.onboard(api);
    case 'hub':
      enterWorld(null);
      return screens.hub(api);
    case 'world':
      return world ? screens.world(api, world) : goHome();
    case 'collection':
      return world ? screens.collection(api, world) : goHome();
    case 'library':
      return world ? screens.library(api, world) : goHome();
    case 'lesson':
      return startLesson(p);
    case 'parent':
      return showParent(api);
    default:
      return goHome();
  }
}

function worldById(id) {
  return state.content.worlds.find((w) => w.id === id) || null;
}

// Math worlds are English only; Hindi worlds follow the parent's language setting.
function enterWorld(world) {
  state.world = world;
  state.lang = world?.lang || state.settings.lang;
  music.play(world?.theme || 'hub');
}

// ---------- speech helpers ----------

const word = (id) => state.content.words[id];
const langs = () => langsFor(state.lang);
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

// Say {hi, en} text (titles, questions) in the current language mix.
function sayLines(text) {
  return play(joinLangs(langs().filter((l) => text[l]), (l) => [{ text: text[l], lang: l }]));
}

// ---------- shared visual helpers ----------

function label(w) {
  const mode = state.lang;
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

function textCard(w, lang, { cls = '' } = {}) {
  return el('button', { class: `card text ${cls}`, 'aria-label': `${w.en} ${w.translit}`, lang }, [
    el('span', { class: 'word-text', text: lang === 'en' ? w.en : w.hi }),
  ]);
}

function letterCard(letter, { cls = '' } = {}) {
  return el('button', { class: `card letter ${cls}`, 'aria-label': letter.translit, lang: letter.lang }, [el('span', { class: 'glyph', text: letter.char })]);
}

function vehicleArt(id) {
  if (id === 'special' && state.special) return specialVehicle(state.special);
  return picture(word(id)?.picture || id);
}

// Lesson and unit icons: a picture id, "letter:क" for a big letter, or "num" for numbers.
function iconHtml(icon) {
  if (typeof icon === 'string' && icon.startsWith('letter:')) return `<span class="icon-glyph">${icon.slice(7).replace(/[<&]/g, '')}</span>`;
  if (icon === 'num') return '<span class="icon-glyph num">123</span>';
  return picture(word(icon)?.picture || icon, { label: icon });
}

function persistSettings() {
  save(KEYS.settings, state.settings);
}

function persistProgress() {
  save(KEYS.progress, state.progress);
}

// ---------- lesson frame ----------

function startLesson({ lessonId, worldId, storyId }) {
  const found = storyId ? null : findLesson(state.content, lessonId);
  const world = found?.world || worldById(worldId);
  if (!world) return goHome();
  // stories opened from the library play like lessons
  const lesson = found?.lesson || {
    id: `story:${storyId}`,
    game: 'story',
    icon: 'bookbus',
    title: state.content.stories.find((s) => s.id === storyId)?.title || { hi: '', en: '' },
    config: { story: storyId },
  };
  enterWorld(world);
  const token = state.token;
  const tier = lessonRecord(state.progress, lesson.id).tier || 0;
  const config = lessonConfig(state.content, lesson);
  const session = { answered: 0, firstTry: 0 };
  const collection = { id: world.collection, ...state.content.collections[world.collection] };

  const fill = el('div', { class: 'progress-fill' });
  const rider = el('div', { class: 'progress-rider', html: picture(word(collection.items[0])?.picture || 'car') });
  const progressBar = el('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0 }, [
    el('div', { class: 'progress-track' }, [fill, rider]),
    el('span', { class: 'progress-flag', html: ICONS.flag }),
  ]);
  const stage = el('main', { class: 'stage' });
  let repeat = null;
  const backBtn = el('button', { class: 'round-btn home', 'aria-label': 'Back to the map', html: ICONS.back, onclick: back });
  const speakBtn = el('button', { class: 'round-btn speak', 'aria-label': 'Say it again', html: ICONS.speaker, onclick: () => repeat && repeat() });
  const mascot = createMascot(world.mascot, { size: 'small', onTap: () => screens.mascotJoke(api, mascot) });
  const screen = el('div', { class: `screen game game-${lesson.game} theme-${world.theme} enter`, style: { '--place': world.color } }, [
    screens.backdrop(world),
    el('header', { class: 'game-head' }, [backBtn, progressBar, speakBtn]),
    stage,
    el('div', { class: 'mascot-corner' }, [mascot.node]),
  ]);
  app.replaceChildren(screen);
  let live = { tier, right: 0, miss: 0 };
  // a little celebration when the level goes up; going down happens quietly
  const levelUp = () => {
    sfx.sparkle();
    mascot.react('dance');
    const badge = el('div', { class: 'level-up', text: { hi: '★ शाबाश! अगला स्तर', en: '★ Level up!', both: '★ Level up! · शाबाश!' }[state.lang] || '★ Level up!' });
    screen.append(badge);
    setTimeout(() => badge.remove(), 1900);
  };

  const lessonWords = (ids) => {
    let list = expandWords(ids, state.content).map(word);
    if (config.focus) list = wordsForMatras(list, state.content.matras, config.focus, config.allow || []);
    return list;
  };
  const letterSets = () => {
    if (config.letters === false) return [];
    // a lesson may name its letters ({ sets, from, to }); `true` or nothing means the world's letters
    const explicit = config.letters && typeof config.letters === 'object' && Array.isArray(config.letters.sets);
    const spec = explicit ? config.letters : { sets: world.letterSets };
    const ls = langsFor(state.lang);
    const sets = lessonLetters(state.content, spec);
    // explicit letter lessons keep their script; otherwise follow the language mix
    return explicit ? sets : sets.filter((s) => ls.includes(s.lang));
  };

  const ctx = {
    content: state.content,
    settings: { ...state.settings, lang: state.lang },
    progress: state.progress,
    special: world.collection === 'vehicles' ? state.special : null,
    world,
    lesson,
    place: { game: lesson.game, color: world.color },
    options: config,
    config,
    // the level moves inside the lesson (see adaptTier); games read these each round
    get tier() {
      return live.tier;
    },
    // how many choices to show: 2, 3 or 4 as the child gets better (lessons may override per tier)
    get nChoices() {
      return (config.choices || [2, 3, 4])[live.tier] ?? 3;
    },
    level: state.content.levels.find((l) => l.id === world.level),
    rng,
    stage,
    langs: langs(),
    alive: () => token === state.token,
    word,
    words: lessonWords,
    letters: () => letterSets().flatMap((s) => s.letters.map((l) => ({ ...l, lang: s.lang, setId: s.id }))),
    letterSets,
    numbers: state.content.numbers,
    say,
    sayItem,
    sayText,
    sayLetterWithWord,
    saySound,
    sayAbout,
    sayLines,
    saySentence: (sentence, ls = langs()) => play(joinLangs(ls, (l) => sentenceSegs(sentence, l))),
    playSegs: (segs) => play(segs),
    stop,
    sfx,
    mascot,
    label,
    wordCard,
    textCard,
    letterCard,
    vehicleArt,
    picture: pictureForWord,
    // Who helps in a game: a world names its own (a parrot delivers words in the jungle, a
    // pterodactyl in Dino Valley); otherwise the Vehicle Town one is used.
    helper(role, fallback) {
      const id = world.helpers?.[role] || fallback;
      if (!id) return null;
      return { id, word: word(id), vehicle: (state.content.collections.vehicles?.items || []).includes(id) };
    },
    // the sound of something moving off: an engine in Vehicle Town, a whoosh everywhere else
    moveSound: (h) => ((h ? h.vehicle : world.collection === 'vehicles') ? sfx.vroom() : sfx.whoosh()),
    iconHtml,
    collectedItems: () => state.progress.collected[world.collection] || [],
    unlockedVehicles: () => state.progress.collected[world.collection] || [],
    setRepeat: (fn) => (repeat = fn),
    setProgress(done, total) {
      const p = total ? Math.min(1, done / total) : 0;
      progressBar.style.setProperty('--p', p);
      progressBar.setAttribute('aria-valuemax', total);
      progressBar.setAttribute('aria-valuenow', done);
      if (done > 0) bounce(rider.firstElementChild);
    },
    // every answer: for stars, the difficulty tier, and the parent's practice lists
    record(item, firstTry) {
      session.answered++;
      if (firstTry) session.firstTry++;
      mascot.react(firstTry ? 'happy' : 'cheer');
      live = adaptTier(live, firstTry);
      if (live.changed > 0) levelUp();
      const key = itemKey(item);
      if (!key) return;
      state.progress = { ...state.progress, stats: recordAnswer(state.progress.stats, key, firstTry) };
      ctx.progress = state.progress;
      persistProgress();
    },
    // a wrong tap in a game that doesn't use choose(): the mascot encourages
    miss() {
      mascot.react('oops');
    },
    practice: (pool, n) => weightedSequence(pool, n, rng, (x) => practiceWeight(state.progress.stats[itemKey(x)])),
    saveProgress(update) {
      state.progress = { ...state.progress, ...update };
      ctx.progress = state.progress;
      persistProgress();
    },
    complete() {
      if (!ctx.alive()) return;
      state.token++;
      const result = applyLessonResult(state.progress, { world, lesson, collection, firstTry: session.firstTry, answered: session.answered, tier: live.tier });
      state.progress = result.progress;
      persistProgress();
      screens.results(api, { world, lesson, result, collection });
    },
  };
  import(`./games/${lesson.game}.js`).then((mod) => {
    if (ctx.alive()) mod.default.start(ctx);
  });
}

// ---------- the API screens use ----------

const api = {
  app,
  state,
  go,
  back,
  goHome,
  homeRoute,
  worldById,
  enterWorld,
  word,
  label,
  wordCard,
  iconHtml,
  vehicleArt,
  say,
  sayItem,
  sayLines,
  sayAbout,
  stop,
  sfx,
  music,
  persistSettings,
  persistProgress,
  rng,
  sleep,
};

// ---------- offline ----------

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

boot();
