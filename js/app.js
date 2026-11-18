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
  recordComprehension,
  practiceWeight,
  weightedSequence,
  COMBO_MILESTONES,
  comboText,
  voicePace,
  langRuns,
  synLine,
} from './logic.js';
import { findLesson, lessonRecord, lessonLetters, applyLessonResult, adaptTier, addPlayTime, isoDay, worldLessons } from './curriculum.js';
import { milestones, totalStars } from './guide.js';
import { freeplay } from './freeplay.js';
import { mergeContent, firstPacks } from './packs.js';
import { pictureExists, picture, pictureForWord, specialVehicle } from './art.js';
import { showCoach, needsCoach, coachKey, COACH_KINDS, COACH_MAX } from './coach.js';
import { applyMotion, liteMotion, slowDevice, watchMotion, isLite } from './motion.js';
import { styleFor, newRewards } from './rewards.js';
import { giftSoundToday } from './surprise.js';
import { readForScreen } from './readfor.js';
import { wordBook } from './wordbook.js';
import { cornerScreen, idiomScreen } from './corner.js';
import { initAudio, setVoicePack, preload, play, stop, isSpeaking, wordSegs, letterSegs, numberSegs, soundSegs, sentenceSegs, phraseSegs, setVoicePrefs, hasRecording } from './audio.js';
import { mathPlan } from './mathspeech.js';
import { KEYS, load, save, normalizeProfiles, profileKey, keepStorage } from './storage.js';
import { sfx, music, FEEDBACK } from './sfx.js';
import { el, sleep, bounce, ICONS, applyReadingComfort, applyLeftHanded } from './ui.js';
import { loadChanges, changesSince } from './changes.js';
import { createMascot, MASCOT_IDS, setOutfit } from './mascot.js';
import * as screens from './screens.js';

const app = document.getElementById('app');
const state = { content: null, settings: null, progress: null, special: null, warnings: [], token: 0, lang: 'both', depth: 0 };
const rng = makeRng();

// ---------- boot ----------

// The content comes as a core and a pack per grade (js/packs.js, roadmap 2.1). When every pack is already
// saved on this device they all load before the first screen. On a first open only the child's own grade
// does, the home screen comes up, and the rest follows; any other screen waits for it (render() below).
const getJSON = async (file) => {
  const res = await fetch(`content/${file}`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${file}: ${res.status}`);
  return res.json();
};
async function loadContent(level) {
  // index.html may have started these already
  const early = window.__early || {};
  const core = await (early.core || getJSON('core.json')).catch(() => getJSON('core.json'));
  const all = core.packs || [];
  const saved = typeof caches !== 'undefined' && navigator.serviceWorker?.controller ? (await Promise.all(all.map((p) => caches.match(`content/${p.file}`)))).every(Boolean) : false;
  const first = saved ? all : firstPacks(core, level);
  const loaded = await Promise.all(first.map((p) => (early.packs?.[p.file] || getJSON(p.file)).catch(() => getJSON(p.file))));
  const rest = all.filter((p) => !first.includes(p));
  return { core, loaded, rest };
}
// the checks are only needed once all the content is here, so their code loads then (roadmap 8.5)
const checkContent = async (content) => {
  const { validateContent } = await import('./validate.js');
  const { errors, warnings } = validateContent(content, { pictureExists });
  state.warnings = warnings;
  return errors;
};
// a screen whose code loads the first time it is opened, not before the first screen (roadmap 8.5)
const later = (load, draw) => {
  const t = state.token;
  load()
    .then((m) => t === state.token && draw(m))
    .catch((e) => showError([`Could not open this screen: ${e.message}`]));
};
const showsCode = () => import('./shows.js');

async function boot() {
  let pieces;
  // the grade of the child last playing, to load their pack first
  const profiles = normalizeProfiles(load(KEYS.profiles), MASCOT_IDS);
  const level = load(profileKey(KEYS.settings, profiles.current))?.level || 'kg';
  try {
    pieces = await loadContent(level);
  } catch (e) {
    return showError(['Could not load the content: ' + e.message]);
  }
  const content = mergeContent(pieces.core, pieces.loaded);
  for (const [id, w] of Object.entries(content.words)) w.id = id;
  state.content = content;
  if (!pieces.rest.length) {
    const errors = await checkContent(content);
    if (errors.length) return showError(errors);
    state.contentComplete = true;
    state.contentReady = Promise.resolve(true);
  } else {
    // the other grades' packs start once the first screen is up, so they don't slow it down
    let go;
    state.contentReady = new Promise((r) => (go = r))
      .then(() => Promise.all(pieces.rest.map((p) => getJSON(p.file))))
      .then(async (more) => {
        // everything else uses the same content object, so it is filled in where it is
        Object.assign(state.content, mergeContent(pieces.core, [...pieces.loaded, ...more]));
        const errors = await checkContent(state.content);
        if (errors.length) showError(errors);
        return !errors.length;
      })
      .catch(() => false);
    state.startRest = go;
  }
  state.contentReady.then((ok) => (state.contentComplete = ok));
  state.profiles = profiles;
  loadProfile();
  state.special = load(KEYS.special);
  await initAudio();
  startPlayClock();
  initCaptions();
  initParallax();
  history.replaceState({ name: 'splash', depth: 0 }, '');
  // every round button (back, home, the speaker, the 💡, the ⓘ) and every results bubble answers a tap
  // with the same soft tick and touch (roadmap 5.7)
  document.addEventListener('click', (e) => e.target.closest?.('.round-btn, .bubble, .info-btn') && sfx.feel('tap'), true);
  window.addEventListener('popstate', (e) => {
    const route = e.state || { name: 'hub', depth: 0 };
    // going back from a screen that grew out of a card: it shrinks back into that card
    const leaving = state.current;
    if (leaving?.grow && route.depth < (leaving.depth || 0)) return grow(() => render(route), app.querySelector('.screen'), () => app.querySelector(`[data-grow="${CSS.escape(leaving.grow)}"]`));
    render(route);
  });
  render({ name: 'splash', depth: 0 });
  // a first open: now fetch the rest of the content (roadmap 2.1 and 8.5)
  if (state.startRest) requestAnimationFrame(() => setTimeout(state.startRest, 50));
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

// ---------- depth: the background layers follow a finger or a tilt a little (styles.css .layer) ----------
function initParallax() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let raf = 0;
  const set = (x, y) => {
    if (isLite()) return; // lighter animations: the background stays still
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--px', Math.max(-1, Math.min(1, x)).toFixed(3));
      document.documentElement.style.setProperty('--py', Math.max(-1, Math.min(1, y)).toFixed(3));
    });
  };
  // the far layers move the opposite way to the finger, so the nearest things seem closest
  window.addEventListener('pointermove', (e) => set(-(e.clientX / innerWidth - 0.5) * 2, -(e.clientY / innerHeight - 0.5) * 2), { passive: true });
  window.addEventListener('deviceorientation', (e) => e.gamma != null && set(-e.gamma / 30, -(e.beta - 45) / 30), { passive: true });
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
  setVoicePrefs({ ...state.settings.voice, ...voicePace(state.settings) });
  setVoicePack(null, state.settings.storyVoices);
  sfx.enabled = state.settings.sfx;
  music.enabled = state.settings.music;
  applyMotion(liteMotion(state.settings.motion, slowDevice()));
  applyReadingComfort(state.settings.readingComfort);
  applyLeftHanded(state.settings.leftHanded);
  applyStyle();
}

// the guides' outfit and the buttons' sound the child chose (js/rewards.js, roadmap 7.5)
function applyStyle() {
  const st = styleFor(state.progress, totalStars(state.progress));
  setOutfit(st.outfit);
  // today's surprise may be a funny sound for the buttons (roadmap 7.12)
  sfx.tapSound = giftSoundToday(state.progress) || st.sound;
  return st;
}

// the motion budget (js/motion.js, roadmap 5.5): the first few screens of each start are timed
const motionCheck = watchMotion(() => state.settings.motion);

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

// Tapping a world, a lesson, a story or an episode grows that card into the next screen, and going back
// shrinks the screen into the card again (roadmap 5.4): the card and the screen share a view-transition
// name, so the browser morphs one into the other. Browsers without View Transitions, and "reduce
// motion", keep the usual slide-in.
const canGrow = () => typeof document.startViewTransition === 'function' && !isLite() && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function grow(change, from, to) {
  if (!from?.isConnected || !canGrow()) return change();
  from.style.viewTransitionName = 'grow';
  document.documentElement.classList.add('growing');
  let target = null;
  const t = document.startViewTransition(() => {
    from.style.viewTransitionName = '';
    change();
    target = to();
    target?.style.setProperty('view-transition-name', 'grow');
  });
  t.finished.finally(() => {
    document.documentElement.classList.remove('growing');
    target?.style.removeProperty('view-transition-name');
  });
}

function go(name, params = {}, { replace = false, from = null } = {}) {
  const route = { name, params, depth: replace ? state.depth : state.depth + 1, ...(from?.dataset?.grow ? { grow: from.dataset.grow } : {}) };
  if (replace) history.replaceState(route, '');
  else history.pushState(route, '');
  if (from) return grow(() => render(route), from, () => app.querySelector('.screen'));
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

// screens that can come up before every grade's content is here (a first open)
const EARLY_ROUTES = ['splash', 'onboard', 'placement', 'hub'];
function render(route) {
  if (!state.contentComplete && !EARLY_ROUTES.includes(route.name)) {
    // wait for the rest of the content (a moment, on a first open), then open the screen asked for
    const t = ++state.token;
    app.querySelector('.screen')?.classList.add('waiting');
    state.contentReady.then((ok) => {
      if (t !== state.token) return;
      if (ok) state.contentComplete = true;
      render(route);
    });
    return;
  }
  state.token++;
  stop();
  state.depth = route.depth || 0;
  state.route = route.name;
  state.current = route;
  if (route.name !== 'splash') setTimeout(motionCheck, 600);
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
      return later(showsCode, (m) => m.showsHome(api));
    case 'together':
      enterWorld(null);
      return screens.together(api);
    case 'rewards':
      enterWorld(null);
      return screens.rewards(api);
    case 'readfor':
      enterWorld(null);
      return readForScreen(api, p);
    case 'words':
      enterWorld(null);
      return wordBook(api);
    case 'corner':
      enterWorld(null);
      return cornerScreen(api);
    case 'idiom':
      enterWorld(null);
      return idiomScreen(api);
    case 'comicmaker':
      enterWorld(null);
      return later(() => import('./comicmaker.js'), (m) => m.comicMaker(api));
    case 'duel':
      enterWorld(null);
      return later(() => import('./duel.js'), (m) => m.duelScreen(api));
    case 'freeplay':
      return world ? freeplay(api, world) : goHome();
    case 'show': {
      const show = (state.content.shows || []).find((s) => s.id === p.showId);
      if (!show) return goHome();
      enterWorld(worldById(show.world));
      return overLimit() ? screens.rest(api) : later(showsCode, (m) => m.showPlayer(api, show));
    }
    case 'radio':
      enterWorld(null);
      return overLimit() ? screens.rest(api) : later(showsCode, (m) => m.radio(api));
    case 'parent':
      return later(() => import('./parent.js'), (m) => m.showParent(api));
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
const PAUSE = { pause: 200 };

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

// A line said from its text. A maths line made up on the spot, or any English line with no recording of its
// own, is said in recorded pieces (js/mathspeech.js, roadmap 6.8), under one caption for the whole line;
// the device voice is only for a line whose pieces aren't all there (the voice pack not downloaded yet).
function sayText(text, lang) {
  const whole = { text, lang };
  if (lang === 'en' && text && !hasRecording(whole)) {
    const plan = mathPlan(text);
    const segs = plan.map((p) => (typeof p === 'number' ? { pause: p } : { text: p, lang: 'en', quiet: true }));
    if (segs.length && segs.every((x) => x.pause || hasRecording(x))) {
      window.dispatchEvent(new CustomEvent('vt-caption', { detail: { text, lang } }));
      return play(segs);
    }
  }
  return play([whole]);
}
// a line in Hindi and English runs (a talk prompt quoting the story), each run in its own voice
function sayMixed(text) {
  return play(langRuns(text));
}

function sayItem(item, ls = itemLangs(item)) {
  return play(joinLangs(ls, (l) => itemSegs(item, l)));
}

// After a right answer: the word, then its synonym if it has one (in Hindi).
async function sayAnswer(item, ls) {
  await sayItem(item, ls);
  await saySynonym(item, ls);
}
function saySynonym(item, ls) {
  const line = synLine(item);
  if (line && langs().includes('hi') && (!ls || ls.includes('hi'))) return play([{ pause: 150 }, { text: line, lang: 'hi' }]);
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
function sayLines(text, key = null) {
  return play(joinLangs(langs().filter((l) => text[l]), (l) => [{ text: text[l], lang: l, ...(key ? { clipKey: `${key}_${l}` } : {}) }]));
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
  // the grade or the beginner's pace may have changed (roadmap 6.7)
  setVoicePrefs({ ...state.settings.voice, ...voicePace(state.settings) });
}

function persistProgress() {
  save(profileKey(KEYS.progress, state.profiles.current), state.progress);
}

// lesson id -> story id, for counting the stories read (the guide cheers at 1, 5, 10 …)
let storyLessons = null;
function storyLessonMap() {
  if (!storyLessons) {
    storyLessons = new Map();
    for (const w of state.content.worlds) for (const l of worldLessons(w)) if (l.game === 'story' && l.config?.story) storyLessons.set(l.id, l.config.story);
  }
  return storyLessons;
}

// ---------- lesson frame ----------

function startLesson({ lessonId, worldId, storyId, together }) {
  const found = storyId || together ? null : findLesson(state.content, lessonId);
  const world = found?.world || worldById(worldId);
  if (!world) return goHome();
  // two players on one device (js/together.js), and stories opened from the library, play like lessons
  const lesson = found?.lesson || (together && { id: 'together', game: 'together', icon: 'balloons', title: { hi: 'साथ खेलो', en: 'Play together' }, config: together }) || {
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
  // the hint button shows while a question waits for an answer
  let hintFn = null;
  const BULB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21h6v-1.5H9zM12 2.5a6.5 6.5 0 0 0-3.8 11.8c.5.4.8 1 .8 1.7v1h6v-1c0-.7.3-1.3.8-1.7A6.5 6.5 0 0 0 12 2.5z" fill="currentColor"/></svg>';
  const hintBtn = el('button', { class: 'round-btn hint-btn', 'aria-label': 'Hint', html: BULB, hidden: true, onclick: () => hintFn && hintFn() });
  const mascot = createMascot(world.mascot, { size: 'small', onTap: () => screens.mascotJoke(api, mascot) });
  const screen = el('div', { class: `screen game game-${lesson.game} theme-${world.theme} enter`, style: { '--place': world.color } }, [
    screens.backdrop(world),
    el('header', { class: 'game-head' }, [backBtn, progressBar, hintBtn, speakBtn]),
    stage,
    el('div', { class: 'mascot-corner' }, [mascot.node]),
  ]);
  app.replaceChildren(screen);
  // "how to play", the first time this child meets this kind of game (js/coach.js, roadmap 4.5): once the
  // game has said its question, a hand shows what to do while the guide says it
  let coaching = false;
  const coach = async (kind, targets, waitingFor = null) => {
    if (coaching || !needsCoach(state.progress.coached, lesson.game, kind)) return;
    coaching = true;
    try {
      for (let i = 0; i < 50 && isSpeaking(); i++) await sleep(150);
      await sleep(250);
      // the child may have answered already, or left
      if (token !== state.token || (waitingFor && hintFn !== waitingFor)) return;
      const list = (typeof targets === 'function' ? targets() : targets || []).filter((t) => t?.isConnected);
      if (!list.length) return;
      state.progress.coached = [...(state.progress.coached || []), coachKey(lesson.game, kind)].slice(-COACH_MAX);
      persistProgress();
      const stopHand = showCoach(screen, kind, list);
      mascot.react?.('wave');
      await say(COACH_KINDS[kind]);
      await sleep(700);
      stopHand();
    } finally {
      coaching = false;
    }
  };
  let live = { tier, right: 0, miss: 0 };
  // a little celebration when the level goes up; going down happens quietly
  const levelUp = () => {
    sfx.sparkle();
    sfx.haptic(FEEDBACK.reward.haptic);
    mascot.react('dance');
    const badge = el('div', { class: 'level-up', text: { hi: '★ शाबाश! अगला स्तर', en: '★ Level up!', both: '★ Level up! · शाबाश!' }[state.lang] || '★ Level up!' });
    screen.append(badge);
    setTimeout(() => badge.remove(), 1900);
  };
  // several right first time in a row: a quick cheer for keeping at it
  const comboCheer = (n) => {
    sfx.sparkle();
    sfx.haptic(FEEDBACK.reward.haptic);
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
    sayAnswer,
    saySynonym,
    sayText,
    sayLetterWithWord,
    saySound,
    sayAbout,
    sayLines,
    saySentence: (sentence, ls = langs()) => play(joinLangs(ls, (l) => sentenceSegs(sentence, l))),
    playSegs: (segs) => play(segs),
    preload,
    stop,
    sfx,
    // the guide does something (singing along, roadmap 7.7), and the music sits like a song under the words
    react: (kind) => mascot.react(kind),
    setMusicMood: (m) => music.setMood(m),
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
    setHint: (fn, how) => {
      hintFn = fn;
      hintBtn.hidden = !fn;
      if (fn && how?.kind) coach(how.kind, how.targets, fn);
      // a new question: the guide thinks along
      if (fn && !coaching) mascot.react('think');
    },
    coach: (kind, targets) => coach(kind, targets),
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
      // the guide claps for a first-time answer and cheers one found with help (roadmap 5.3)
      mascot.react(firstTry ? 'clap' : 'cheer');
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
    // story questions by type, and stories read alone, for the parent area (roadmap 3.4)
    comprehend(type, firstTry) {
      state.progress = { ...state.progress, comprehension: recordComprehension(state.progress.comprehension, type, firstTry) };
      ctx.progress = state.progress;
      persistProgress();
    },
    readAlone(storyId) {
      const had = state.progress.readAlone || {};
      state.progress = { ...state.progress, readAlone: { ...had, [storyId]: (had[storyId] || 0) + 1 } };
      ctx.progress = state.progress;
      persistProgress();
    },
    // any wrong tap (choose() reports them too): the guide says "you can do it"
    miss() {
      sfx.feel('wrong');
      mascot.react('encourage');
    },
    practice: (pool, n) => weightedSequence(pool, n, rng, (x) => practiceWeight(state.progress.stats[itemKey(x)])),
    // which story was read (for the talk-together prompts on the results screen)
    markStory: (id) => (session.story = id),
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
      const before = state.progress;
      // lessons finished since the app opened: free play is offered after every two (js/freeplay.js)
      state.sessionLessons = (state.sessionLessons || 0) + 1;
      const result = applyLessonResult(state.progress, { world, lesson, collection, firstTry: session.firstTry, answered: session.answered, tier: live.tier });
      state.progress = result.progress;
      persistProgress();
      const reached = milestones(before, state.progress, { storyLessons: storyLessonMap(), worldLessonIds: worldLessons(world).map((l) => l.id) });
      screens.results(api, { world, lesson, result, collection, session, milestones: reached, rewards: newRewards(totalStars(before), totalStars(state.progress)) });
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
  sayMixed,
  sayAbout,
  saySound,
  stop,
  sfx,
  music,
  persistSettings,
  persistProgress,
  applyStyle,
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
  // the version this page is running, so the refresh bar can say what is new since then (roadmap 8.6)
  loadChanges().then((c) => (state.runningVersion = c[0]?.version || null));
  // a new version has taken over (not the very first install): offer a refresh at a calm moment, with what changed
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', async () => {
    if (!hadController) return;
    state.updateNotes = changesSince(await loadChanges(), state.runningVersion);
    state.updateReady = true;
    offerUpdate();
  });
}

// ---------- a new version is ready ----------

// Never in the middle of a lesson, a show or the radio: only on the home screen, a map or a collection.
const CALM_ROUTES = ['hub', 'world', 'collection', 'library', 'shows'];
function offerUpdate() {
  if (!state.updateReady || !CALM_ROUTES.includes(state.route) || document.querySelector('.update-bar')) return;
  // the newest change's headline says what this version brings; "What's new" lists every line
  const notes = state.updateNotes || [];
  const top = notes[0];
  const bar = el('div', { class: 'update-bar', role: 'status' }, [
    el('span', { class: 'update-text' }, [
      el('b', { lang: 'hi', text: top ? `नया: ${top.hi}` : 'कुछ नया आया है!' }),
      el('span', { text: top ? `New: ${top.en}. Refresh to get it.` : 'A new version is ready.' }),
      notes.length ? el('button', { class: 'update-more', onclick: () => showChanges(notes) }, [el('span', { lang: 'hi', text: 'क्या नया है?' }), el('small', { text: "What's new" })]) : null,
    ]),
    el('button', { class: 'update-btn', onclick: () => location.reload() }, [el('span', { lang: 'hi', text: 'ताज़ा करें' }), el('small', { text: 'Refresh' })]),
    el('button', { class: 'update-close', 'aria-label': 'Later', onclick: () => bar.remove() }, ['×']),
  ]);
  document.body.append(bar);
}
// every line of the new versions, in Hindi and English
function showChanges(notes) {
  const sheet = el('div', { class: 'talk-sheet changes-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': "What's new" });
  const close = () => sheet.remove();
  sheet.append(
    el('div', { class: 'talk-card' }, [
      el('header', { class: 'talk-head' }, [
        el('div', {}, [el('b', { lang: 'hi', text: 'क्या नया है' }), el('small', { text: "What's new" })]),
        el('button', { class: 'round-btn small', 'aria-label': 'Close', html: ICONS.check, onclick: close }),
      ]),
      ...notes.map((c) =>
        el('section', { class: 'change' }, [
          el('h3', {}, [el('span', { lang: 'hi', text: c.hi }), el('small', { text: c.en })]),
          el('ul', { class: 'change-list' }, (c.items || []).map((i) => el('li', {}, [el('span', { lang: 'hi', text: i.hi }), el('small', { text: i.en })]))),
        ]),
      ),
    ]),
  );
  sheet.addEventListener('click', (e) => e.target === sheet && close());
  document.body.append(sheet);
  sheet.querySelector('.round-btn')?.focus();
}
// installed on the home screen: ask to keep progress and recordings safe from clean-ups
if (window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone) keepStorage();

boot();
