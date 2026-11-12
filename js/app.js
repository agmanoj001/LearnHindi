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
  COMBO_MILESTONES,
  comboText,
} from './logic.js';
import { findLesson, lessonRecord, lessonLetters, applyLessonResult, adaptTier, addPlayTime, isoDay } from './curriculum.js';
import { validateContent } from './validate.js';
import { pictureExists, picture, pictureForWord, specialVehicle } from './art.js';
import { initAudio, setVoicePack, play, stop, wordSegs, letterSegs, numberSegs, soundSegs, sentenceSegs, phraseSegs, setVoicePrefs } from './audio.js';
import { KEYS, load, save, normalizeProfiles, profileKey, keepStorage } from './storage.js';
import { sfx, music } from './sfx.js';
import { el, sleep, bounce, ICONS } from './ui.js';
import { createMascot, MASCOT_IDS } from './mascot.js';
import * as screens from './screens.js';
import * as shows from './shows.js';
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
  state.profiles = normalizeProfiles(load(KEYS.profiles), MASCOT_IDS);
  loadProfile();
  state.special = load(KEYS.special);
  await initAudio();
  startPlayClock();
  initCaptions();
  history.replaceState({ name: 'splash', depth: 0 }, '');
  window.addEventListener('popstate', (e) => render(e.state || { name: 'hub', depth: 0 }));
  render({ name: 'splash', depth: 0 });
}

// ---------- play time and the daily limit ----------
// Time counts while the app is on screen. A parent can set a daily limit (WHO and AAP advise about an
// hour a day of good-quality screen time for young children); when it is reached, the next lesson
// shows a friendly break screen instead. A grown-up can allow 10 more minutes.

const TICK = 15;
function startPlayClock() {
  setInterval(() => {
    if (document.hidden || !state.content) return;
    state.progress = addPlayTime(state.progress, TICK);
    persistProgress();
  }, TICK * 1000);
}

function minutesToday() {
  return Math.floor((state.progress.time?.[isoDay(Date.now())] || 0) / 60);
}

function overLimit() {
  const limit = state.settings.dailyLimit;
  if (!limit) return false;
  return minutesToday() >= limit + (state.extraMinutes?.[isoDay(Date.now())] || 0);
}

function allowMore(minutes = 10) {
  const day = isoDay(Date.now());
  state.extraMinutes = { ...(state.extraMinutes || {}), [day]: (state.extraMinutes?.[day] || 0) + minutes };
}

// ---------- captions ----------

function initCaptions() {
  const bar = el('div', { class: 'caption-bar', role: 'status', 'aria-live': 'polite' });
  document.body.append(bar);
  let hide = 0;
  window.addEventListener('vt-caption', (e) => {
    if (!state.settings.captions) return;
    clearTimeout(hide);
    bar.lang = e.detail.lang === 'hi' ? 'hi' : 'en';
    bar.textContent = e.detail.text;
    bar.classList.add('on');
  });
  window.addEventListener('vt-speaking', (e) => {
    if (e.detail) return;
    clearTimeout(hide);
    hide = setTimeout(() => bar.classList.remove('on'), 1400);
  });
}

// ---------- children's profiles ----------

function loadProfile() {
  const id = state.profiles.current;
  state.settings = normalizeSettings(load(profileKey(KEYS.settings, id)), state.content);
  state.progress = normalizeProgress(load(profileKey(KEYS.progress, id)), state.content);
  state.lang = state.settings.lang;
  state.hubTag = null;
  setVoicePrefs(state.settings.voice);
  setVoicePack(null, state.settings.storyVoices);
  sfx.enabled = state.settings.sfx;
  music.enabled = state.settings.music;
}

function saveProfiles(profiles) {
  state.profiles = normalizeProfiles(profiles, MASCOT_IDS);
  save(KEYS.profiles, state.profiles);
}

function switchProfile(id) {
  saveProfiles({ ...state.profiles, current: id });
  loadProfile();
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
// lesson -> world map -> hub. With "Stay in this grade" the hub shows only that grade's worlds.

function homeRoute() {
  if (!state.settings.onboarded) return { name: 'onboard', params: {} };
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
  state.route = route.name;
  // quieter music in lessons and shows, where children need to hear every sound
  music.setMood(route.name === 'lesson' || route.name === 'show' ? 'lesson' : 'free');
  // the "new version" bar only lives on calm screens; it comes back on the next calm one
  if (!CALM_ROUTES.includes(route.name)) document.querySelector('.update-bar')?.remove();
  else queueMicrotask(offerUpdate);
  const p = route.params || {};
  const world = p.worldId ? worldById(p.worldId) : null;
  if (world) enterWorld(world);
  switch (route.name) {
    case 'splash':
      return screens.splash(api);
    case 'onboard':
      return screens.onboard(api);
    case 'placement':
      return screens.placement(api, {
        onPick: (level) => {
          state.settings.level = level.id;
          state.settings.onboarded = true;
          persistSettings();
          sfx.jingle();
          goHome();
        },
      });
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
      // past the daily limit, the next lesson waits for a grown-up (a lesson already started is never cut off)
      return overLimit() ? screens.rest(api) : startLesson(p);
    case 'shows':
      enterWorld(null);
      return shows.showsHome(api);
    case 'show': {
      const show = (state.content.shows || []).find((s) => s.id === p.showId);
      if (!show) return goHome();
      enterWorld(worldById(show.world));
      return overLimit() ? screens.rest(api) : shows.showPlayer(api, show);
    }
    case 'radio':
      enterWorld(null);
      return overLimit() ? screens.rest(api) : shows.radio(api);
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
  save(profileKey(KEYS.settings, state.profiles.current), state.settings);
}

function persistProgress() {
  save(profileKey(KEYS.progress, state.profiles.current), state.progress);
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
  const progressBar = el('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Lesson progress', 'aria-valuemin': 0 }, [
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
  // several right first time in a row: a quick cheer for keeping at it
  const comboCheer = (n) => {
    sfx.sparkle();
    mascot.react('dance');
    const badge = el('div', { class: 'level-up combo' }, [el('span', { class: 'combo-flame', html: ICONS.sparkle }), el('span', { text: comboText(n, state.lang) })]);
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
    profileId: state.profiles.current,
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
      session.combo = firstTry ? (session.combo || 0) + 1 : 0;
      session.best = Math.max(session.best || 0, session.combo);
      live = adaptTier(live, firstTry);
      if (live.changed > 0) levelUp();
      else if (COMBO_MILESTONES.includes(session.combo)) comboCheer(session.combo);
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
    // a reading preference a game can change (e.g. bigger text in the comics)
    setSetting(key, value) {
      state.settings[key] = value;
      ctx.settings[key] = value;
      persistSettings();
    },
    complete() {
      if (!ctx.alive()) return;
      state.token++;
      const result = applyLessonResult(state.progress, { world, lesson, collection, firstTry: session.firstTry, answered: session.answered, tier: live.tier });
      state.progress = result.progress;
      persistProgress();
      screens.results(api, { world, lesson, result, collection, session });
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
  minutesToday,
  allowMore,
  saveProfiles,
  switchProfile,
};

// ---------- offline ----------

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () =>
    navigator.serviceWorker
      .register('sw.js')
      .then((reg) => {
        // an app on the home screen can stay open for days: look for a new version whenever it comes back
        document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && reg.update().catch(() => {}));
      })
      .catch(() => {}),
  );
  // a new version has taken over (not the very first install): offer a refresh at a calm moment
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    state.updateReady = true;
    offerUpdate();
  });
}

// ---------- a new version is ready ----------

// Never in the middle of a lesson, a show or the radio: only on the home screen, a map or a collection.
const CALM_ROUTES = ['hub', 'world', 'collection', 'library', 'shows'];
function offerUpdate() {
  if (!state.updateReady || !CALM_ROUTES.includes(state.route) || document.querySelector('.update-bar')) return;
  const bar = el('div', { class: 'update-bar', role: 'status' }, [
    el('span', { class: 'update-text' }, [el('b', { lang: 'hi', text: 'कुछ नया आया है!' }), el('span', { text: 'A new version is ready.' })]),
    el('button', { class: 'update-btn', onclick: () => location.reload() }, [el('span', { lang: 'hi', text: 'ताज़ा करें' }), el('small', { text: 'Refresh' })]),
    el('button', { class: 'update-close', 'aria-label': 'Later', onclick: () => bar.remove() }, ['×']),
  ]);
  document.body.append(bar);
}
// installed on the home screen: ask to keep progress and recordings safe from clean-ups
if (window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone) keepStorage();

boot();
