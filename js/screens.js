// Screens outside a lesson: splash, onboarding, the world hub, a world's path map,
// results, the sticker collection and the story library.
import { el, sleep, bounce, animate, sparkleAt, flyTo, ICONS, infoButton, forGrownups, drawWhenSeen } from './ui.js';
import { createMascot, mascotSvg, MASCOTS, MASCOT_IDS, setOutfit, currentOutfit } from './mascot.js';
import { REWARDS, REWARD_KINDS, unlockedRewards, nextReward, styleFor } from './rewards.js';
import { recordBook, playBook, bookPicture } from './mybooks.js';
import { MISSION_LEVELS, missionStories, readByAll } from './readfor.js';
import { festivalBanner, FESTIVALS } from './festivals.js';
import { giftDue, pickGift, riddleIndexes } from './surprise.js';
import { wordsChip } from './wordbook.js';
import { cornerButton } from './corner.js';
import { sceneSvg } from './art-scenes.js';
import { PLACEMENT_LEVELS, placementQuestions, placementResult } from './placement.js';
import { picture, pictureForWord, specialVehicle } from './art.js';
import { weekDays, trailSticker, dayFinished, weekFull, isoDay, stickyPlan } from './curriculum.js';
import { worldLessons, lessonRecord, isUnlocked, currentLesson, nextLesson, worldStars, hubWorlds, streak, nextCollectible, todayPlan, storyLang, worldStoryLang, storyNeeds, taughtMatras, decodability, nextDecodable, MATRA_SIGNS } from './curriculum.js';
import { SHOW_ICONS } from './show-icons.js';
import { greeting, timeSlot, HELLO, milestoneLine, totalStars } from './guide.js';
import { playersFrom, GROWN_UP } from './together.js';
import { load, KEYS, profileKey, backupReminderDue } from './storage.js';
import { freeplayDue } from './freeplay.js';
import { heartButton, favStories, storyWorld, HOME_FAVS } from './favourites.js';
import { homeWorld } from './curriculum.js';
import { voicesReady, hasVoice } from './audio.js';
import { deviceKind, VOICE_SETUP, readable } from './logic.js';

export function backdrop(world) {
  return el('div', { class: 'backdrop', html: sceneSvg(world?.theme || 'hub') });
}

function appTitle(api) {
  const t = api.state.content.phrases.title;
  return el('div', { class: 'title' }, [el('span', { class: 'title-hi', lang: 'hi', text: t.hi }), el('span', { class: 'title-en', text: t.en })]);
}

// English-only worlds (math) lead with English; Hindi worlds lead with Hindi.
const english = (w) => w.lang === 'en';
// One language rule for what a child reads (docs/ROADMAP.md 6.1). With the setting on Hindi: Hindi only.
// On English: English only. On both: the main language, with the other one small after it. The main
// language is Hindi, except in the worlds taught in English (maths, phonics), where it is English.
const langMode = (api) => api.state.settings.lang || 'both';
export function sayText(mode, t, lead = 'hi') {
  const main = mode === 'en' ? 'en' : mode === 'hi' ? 'hi' : lead;
  const other = main === 'hi' ? 'en' : 'hi';
  return { main: t[main] ?? t[other], mainLang: main, sub: mode === 'both' && t[other] !== t[main] ? t[other] || null : null, subLang: other };
}
const said = (api, t, lead = 'hi', mainTag = 'span') => {
  const x = sayText(langMode(api), t, lead);
  return [el(mainTag, { lang: x.mainLang, text: x.main }), x.sub ? el('small', { class: 'say-sub', lang: x.subLang, text: x.sub }) : null].filter(Boolean);
};
const one = (api, t, lead = 'hi') => sayText(langMode(api), t, lead).main;
const UNIT = { hi: 'भाग', en: 'Unit' };

// "Read again": the favourite stories, one tap from reading (roadmap 7.2)
function readAgain(api) {
  const { content, settings, progress } = api.state;
  const favs = favStories(content, progress).slice(0, HOME_FAVS);
  if (!favs.length) return null;
  return el('section', { class: 'read-again', 'aria-label': 'Read again' }, [
    el('h3', {}, [el('span', { class: 'read-again-heart', 'aria-hidden': 'true', text: '❤' }), ...said(api, { hi: 'फिर से पढ़ो', en: 'Read again' })]),
    el(
      'div',
      { class: 'read-again-books' },
      favs.map((s) => {
        const b = el('button', { class: 'fav-book', 'data-grow': `story:${s.id}`, 'aria-label': `Read again: ${s.title.en}` }, [
          el('span', { class: 'fav-cover', html: pictureForWord(api.word(s.cover)) }),
          el('span', { class: 'fav-title', lang: s.lang === 'en' ? 'en' : 'hi', text: s.lang === 'en' ? s.title.en : s.title.hi }),
        ]);
        b.addEventListener('click', () => {
          api.sfx.page();
          api.go('lesson', { worldId: storyWorld(content, settings, s).id, storyId: s.id }, { from: b });
        });
        return b;
      }),
    ),
  ]);
}

// put children into an element made earlier (one an ⓘ button needs to know about)
const fill = (node, kids) => {
  node.append(...kids.filter(Boolean));
  return node;
};

const bigName = (w, text, cls) => (english(w) ? el('span', { class: `${cls} latin`, text: text.en }) : el('span', { class: cls, lang: 'hi', text: text.hi }));

function subjectName(world) {
  return { math: { hi: 'गणित', en: 'Math' }, english: { hi: 'अंग्रेज़ी', en: 'English' } }[world.subject] || { hi: 'हिंदी', en: 'Hindi' };
}

// What a world teaches, from content.json "tags": Phonics, Grammar, Stories, Math …
const tagsOf = (api, w) => (w.tags || []).map((id) => ({ id, ...(api.state.content.tags?.[id] || { hi: id, en: id }) }));
const tagChips = (api, w) => el('span', { class: 'tag-chips' }, tagsOf(api, w).map((t) => el('span', { class: 'tag-chip', style: { '--tag': readable(t.color || '#6C63FF') }, lang: sayText(langMode(api), t).mainLang, text: one(api, t) })));
// a unit's skill ("Listening") in the child's language, from the tag of the same name when there is one
const SKILLS = { Colours: 'रंग', Concepts: 'समझ', Numbers: 'गिनती', Words: 'शब्द', 'Phonological awareness': 'आवाज़ें पहचानो', 'Rhymes and fluency': 'तुकबंदी', Comprehension: 'समझकर पढ़ो', Comics: 'कॉमिक्स' };
const skillName = (api, skill) =>
  skill
    .split(' · ')
    .map((part) => one(api, Object.values(api.state.content.tags || {}).find((t) => t.en === part) || { hi: SKILLS[part] || part, en: part }))
    .join(' · ');

// Tap a mascot and it does something silly.
export function mascotJoke(api, mascot) {
  const lines = api.state.content.mascotLines || [];
  const n = Math.floor(api.rng() * lines.length);
  const line = lines[n];
  if (!line) return;
  mascot.react(line.move || 'silly');
  api.sfx[line.move === 'sneeze' ? 'sneeze' : line.move === 'spin' ? 'whoosh' : line.move === 'dance' ? 'jingle' : 'boing']?.();
  api.sayLines(line, `mascot-${n + 1}`);
}

// ---------- splash ----------

export function splash(api) {
  const start = () => {
    api.sfx.unlock();
    api.music.unlock();
    api.sfx.jingle();
    const r = api.homeRoute();
    api.go(r.name, r.params, { replace: true });
    if (r.name !== 'onboard') greet(api);
  };
  const btn = el('button', { class: 'splash-play bubble green', 'aria-label': 'Play', html: ICONS.play, onclick: start });
  // with more than one child, each picks their own guide to start
  const { list } = api.state.profiles;
  const who =
    list.length > 1
      ? el('div', { class: 'who', role: 'group', 'aria-label': "Who's playing?" }, [
          el('p', { class: 'who-q' }, [el('b', { lang: 'hi', text: 'कौन खेलेगा?' }), el('span', { text: "Who's playing?" })]),
          el(
            'div',
            { class: 'who-list' },
            list.map((p, i) =>
              el('button', { class: 'who-btn', 'aria-label': p.name || `Child ${i + 1}`, onclick: () => (api.switchProfile(p.id), start()) }, [
                el('span', { class: 'who-face', html: mascotSvg(p.avatar) }),
                el('span', { class: 'who-name', text: p.name || `${i + 1}` }),
              ]),
            ),
          ),
        ])
      : null;
  // the guides stand in three staggered rows like a class photo; the back and front rows take any extras (7, 6, 7)
  const n = MASCOT_IDS.length;
  const mid = Math.floor(n / 3);
  const back = Math.ceil((n - mid) / 2);
  const rows = [MASCOT_IDS.slice(0, back), MASCOT_IDS.slice(back, back + mid), MASCOT_IDS.slice(back + mid)];
  let k = 0;
  const parade = el(
    'div',
    { class: 'parade', style: { '--per-row': String(Math.max(...rows.map((r) => r.length))) } },
    rows.map((ids) => el('div', { class: 'parade-row' }, ids.map((id) => el('div', { class: 'parade-item', style: { animationDelay: `${k++ * 0.12}s` }, html: mascotSvg(id) })))),
  );
  api.app.replaceChildren(el('div', { class: 'screen splash enter' }, [backdrop(null), el('div', { class: 'sunburst', 'aria-hidden': 'true' }), parade, appTitle(api), who || btn]));
}

// The guide says hello as the app opens: for the time of day, warmly after a few days away, or a first
// hello (js/guide.js). The oldest readers (Grades 7–8) get the plain "let's play".
const GREETED_LEVELS = ['toddler', 'kg', 'grade1', 'grade2', 'grade3', 'grade4'];
export function greet(api) {
  const { content, progress, settings } = api.state;
  const line = GREETED_LEVELS.includes(settings.level) ? greeting(content.guide, { days: progress.days, rng: api.rng }) : null;
  if (line) api.sayLines(line, `guide-${line.id}`);
  else api.say('welcome');
}
const hello = (name) => {
  const h = HELLO[timeSlot()].hi;
  return name ? `${h}, ${name}!` : `${h}!`;
};

// ---------- onboarding: who is learning ----------

export function onboard(api) {
  const s = api.state.settings;
  const pick = (level) => {
    s.level = level.id;
    s.onboarded = true;
    api.persistSettings();
    api.sfx.jingle();
    api.say('welcome');
    api.goHome();
  };
  api.app.replaceChildren(
    el('div', { class: 'screen onboard enter' }, [
      backdrop(null),
      el('div', { class: 'onboard-inner' }, [
        appTitle(api),
        el('h1', { text: 'Who is learning?' }),
        el('p', { class: 'note', text: 'Pick a grade. You can switch grades any time from the home screen.' }),
        el('button', { class: 'bubble placement-btn', onclick: () => api.go('placement') }, [el('b', { lang: 'hi', text: 'पता नहीं? छोटी-सी जाँच' }), el('span', { text: 'Not sure? Take a 2-minute check' })]),
        el(
          'div',
          { class: 'level-list' },
          api.state.content.levels.map((level) => levelCard(api, level, false, () => pick(level))),
        ),
      ]),
    ]),
  );
}

export function levelCard(api, level, selected, onPick) {
  return el('button', { class: `level-card ${selected ? 'selected' : ''}`, 'aria-pressed': selected ? 'true' : 'false', onclick: onPick }, [
    el('span', { class: 'level-pic', html: picture(api.word(level.picture)?.picture || level.picture) }),
    el('span', { class: 'level-text' }, [
      el('span', { class: 'level-name' }, [el('b', { text: level.name.en }), el('span', { lang: 'hi', text: ` · ${level.name.hi}` })]),
      el('span', { class: 'level-age', text: `Age ${level.age}` }),
      el('span', { class: 'level-about', text: level.about }),
    ]),
  ]);
}

// ---------- hub: one card per world ----------

// Children who can't read yet get a simple home screen (docs/ROADMAP.md 4.2): their guide and one big play
// button, Show time and Story radio, and their own worlds. No filters, skill tags or other grades; those
// stay for older children and in the grown-ups' area ("Simple home screen" turns it off).
export const PRE_READERS = ['toddler', 'kg'];
export const simpleHome = (settings) => settings.simpleHome !== false && PRE_READERS.includes(settings.level);

export function hub(api) {
  const { content, settings, progress } = api.state;
  const simple = simpleHome(settings);
  const all = simple ? hubWorlds(content, settings).filter((w) => w.level === settings.level) : hubWorlds(content, settings);
  // a row of tags filters the worlds: "show me everything about Grammar"
  const filter = !simple && api.state.hubTag && all.some((w) => (w.tags || []).includes(api.state.hubTag)) ? api.state.hubTag : null;
  const worlds = filter ? all.filter((w) => (w.tags || []).includes(filter)) : all;
  const mine = worlds.filter((w) => w.level === settings.level);
  const others = worlds.filter((w) => w.level !== settings.level);
  const usedTags = Object.entries(content.tags || {}).filter(([id]) => all.some((w) => (w.tags || []).includes(id)));
  const tagBtn = (id, t) =>
    el('button', {
      class: `tag-filter${(filter || null) === id ? ' on' : ''}`,
      style: { '--tag': readable(t?.color || '#6C63FF') },
      lang: sayText(langMode(api), t || { hi: 'सब', en: 'All' }).mainLang,
      text: one(api, t || { hi: 'सब', en: 'All' }),
      onclick: () => {
        api.sfx.pop();
        api.state.hubTag = id;
        if (t) api.sayLines(t);
        hub(api);
      },
    });
  const level = (id) => content.levels.find((l) => l.id === id);
  const days = streak(progress.days, Date.now());

  // the first two cards are drawn at once; the rest as they come near the screen (roadmap 8.5)
  let drawn = 0;
  const card = (world) => {
    const now = drawn++ < 2;
    const st = worldStars(progress, world);
    const sub = subjectName(world);
    const c = el('button', { class: `world-card theme-${world.theme}`, style: { '--place': world.color }, 'data-grow': `world:${world.id}`, 'aria-label': `${world.name.en}, ${level(world.level).name.en}` }, [
      drawWhenSeen('div', { class: 'world-card-scene' }, () => sceneSvg(world.theme, { crop: 'bottom' }), { now }),
      drawWhenSeen('div', { class: 'world-card-mascot' }, () => mascotSvg(world.mascot), { now }),
      el('div', { class: 'world-card-text' }, [
        el('span', { class: 'chips' }, [el('span', { class: 'chip grade', text: one(api, level(world.level).name) }), el('span', { class: `chip subject ${world.subject}`, text: one(api, sub, english(world) ? 'en' : 'hi') })]),
        bigName(world, world.name, 'world-name-hi'),
        langMode(api) === 'both' ? el('span', { class: 'world-name-en', lang: english(world) ? 'hi' : 'en', text: english(world) ? world.name.hi : world.name.en }) : null,
        simple ? null : tagChips(api, world),
        el('span', { class: 'world-stars' }, [
          el('span', { class: 'star-icon', html: ICONS.star }),
          el('span', { text: `${st.got} / ${st.max}` }),
          el('span', { class: 'world-progress', 'aria-hidden': 'true' }, [el('i', { style: { width: `${st.max ? Math.round((100 * st.got) / st.max) : 0}%` } })]),
        ]),
      ]),
    ]);
    c.addEventListener('click', async () => {
      api.sfx.pop();
      bounce(c);
      api.sayLines(world.name);
      await sleep(250);
      api.go('world', { worldId: world.id }, { from: c });
    });
    return c;
  };

  // a dot on the grown-ups' button when a monthly backup is due (roadmap 2.2)
  const gate = parentGate(api, { cls: backupReminderDue() ? 'backup-due' : '' });
  api.state.showRun = 0;
  const voiceTip = el('div', { class: 'voice-tip-slot' });
  checkHindiVoice(api, voiceTip);
  // Show time and Story radio: watching and listening that still teaches (good for journeys)
  const showtime = (content.shows || []).length
    ? el('div', { class: 'showtime-row' }, [
        el('button', { class: 'showtime-btn tv', 'aria-label': 'Show time', onclick: () => (api.sfx.pop(), api.go('shows')) }, [el('span', { class: 'showtime-icon', html: SHOW_ICONS.tv }), el('span', { class: 'showtime-text' }, said(api, { hi: 'कार्टून', en: 'Show time' }, 'hi', 'b'))]),
        el('button', { class: 'showtime-btn radio', 'aria-label': 'Story radio', onclick: () => (api.sfx.pop(), api.go('radio')) }, [el('span', { class: 'showtime-icon', html: SHOW_ICONS.radio }), el('span', { class: 'showtime-text' }, said(api, { hi: 'कहानी रेडियो', en: 'Story radio' }, 'hi', 'b'))]),
      ])
    : null;
  // today's path stays the same all day, so it can be finished (roadmap 7.4)
  const sticky = stickyPlan(content, progress, all.filter((w) => w.level === settings.level));
  const plan = sticky.steps;
  if (sticky.today !== progress.today) {
    api.state.progress = { ...api.state.progress, today: sticky.today };
    api.persistProgress();
  }
  api.app.replaceChildren(
    el('div', { class: `screen hub enter${simple ? ' simple' : ''}` }, [
      // the background the child chose (roadmap 7.5)
      backdrop(styleFor(progress, totalStars(progress)).backdrop ? { theme: styleFor(progress, totalStars(progress)).backdrop } : null),
      el('header', { class: 'hub-head' }, [
        appTitle(api),
        el('div', { class: 'head-right' }, [
          musicToggle(api),
          gate,
        ]),
      ]),
      el('div', { class: 'hub-scroll' }, [
        // a festival near today: decorations, its story, its sticker (roadmap 7.11)
        filter
          ? null
          : festivalBanner(api, {
              art: (id) => (api.word(id) ? pictureForWord(api.word(id)) : ''),
              openStory: (id, from) => {
                const s = content.stories.find((x) => x.id === id);
                if (s) api.go('lesson', { worldId: storyWorld(content, settings, s).id, storyId: id }, { from });
              },
            }),
        // today's path (or the big play button), and beside it on a tablet: Show time, Story radio and
        // Play together (roadmap 4.7); on a phone they stack as before
        filter
          ? null
          : el('div', { class: 'hub-top' }, [
              (simple ? playHero : todayCard)(api, plan, all),
              el('div', { class: 'hub-side' }, [
                showtime,
                readAgain(api),
                // how many words this child knows, and the book of them (roadmap 7.13)
                wordsChip(api),
                prizesButton(api),
                missionCard(api),
                // Grades 7–8: the riddle and idiom of the day, comics to make, quiz duels (roadmap 7.16)
                cornerButton(api),
                el('button', { class: 'together-btn', 'aria-label': 'Play together', onclick: () => (api.sfx.pop(), api.go('together')) }, [el('span', { class: 'together-icon', 'aria-hidden': 'true', text: '👫' }), el('span', {}, said(api, { hi: 'साथ खेलो', en: 'Play together' }, 'hi', 'b'))]),
              ]),
            ]),
        filter ? null : voiceTip,
        !simple && usedTags.length > 1 ? el('div', { class: 'tag-filters', role: 'toolbar', 'aria-label': 'Show worlds about' }, [tagBtn(null, null), ...usedTags.map(([id, t]) => tagBtn(id, t))]) : null,
        mine.length && !simple ? el('h2', { class: 'hub-section' }, said(api, level(settings.level).name)) : null,
        el('div', { class: 'world-cards' }, mine.map(card)),
        others.length ? el('h2', { class: 'hub-section' }, said(api, { hi: 'और दुनिया', en: 'More worlds' })) : null,
        others.length ? el('div', { class: 'world-cards' }, others.map(card)) : null,
      ]),
    ]),
  );
  // today's three just finished: celebrate, and the day's sticker goes on the week's trail (roadmap 7.4)
  if (!filter && dayFinished(progress, plan)) {
    const screen = api.app.querySelector('.screen.hub');
    setTimeout(() => screen?.isConnected && celebrateDay(api, screen), 700);
  }
}

// ---------- music on or off, one tap from the home screen (a car ride, a quiet room) ----------
function musicToggle(api) {
  const s = api.state.settings;
  const btn = el('button', { class: 'music-toggle' });
  const draw = () => {
    btn.innerHTML = s.music ? ICONS.music : ICONS.musicOff;
    btn.classList.toggle('off', !s.music);
    btn.setAttribute('aria-pressed', String(s.music));
    btn.setAttribute('aria-label', s.music ? 'Music on' : 'Music off');
  };
  btn.addEventListener('click', () => {
    s.music = !s.music;
    api.persistSettings();
    api.music.setEnabled(s.music);
    api.sfx.pop();
    draw();
  });
  draw();
  return btn;
}

// ---------- no Hindi voice on this device ----------
// The app speaks with the device's own voices. Without a Hindi one, Hindi is silent or garbled, so tell the
// grown-ups how to add it on this kind of device (or to record their own voice), until they hide the tip.
const TIP_KEY = 'vt.voiceTipHidden';
async function checkHindiVoice(api, slot) {
  if (api.state.settings.lang === 'en') return;
  let hidden = false;
  try {
    hidden = localStorage.getItem(TIP_KEY) === '1';
  } catch {}
  if (hidden || !(await voicesReady()) || hasVoice('hi') || !slot.isConnected) return;
  const help = VOICE_SETUP[deviceKind(navigator.userAgent, navigator.maxTouchPoints || 0)];
  const status = el('p', { class: 'voice-tip-status', role: 'status' });
  // the setup steps are for grown-ups: behind the ⓘ (roadmap 4.6)
  const card = el('section', { class: 'voice-tip' });
  fill(card, [
    el('div', { class: 'voice-tip-head' }, [el('b', { lang: 'hi', text: 'यह डिवाइस अभी हिंदी नहीं बोल पाता' }), el('span', { text: `This ${help.device} has no Hindi voice yet` }), infoButton(card)]),
    forGrownups(el('p', { class: 'voice-tip-steps', text: help.steps })),
    forGrownups(el('p', { class: 'voice-tip-note', text: 'Or record your own voice: Grown-ups › Record your voice. Your recordings are used instead.' })),
    status,
    el('div', { class: 'voice-tip-actions' }, [
      el('button', {
        class: 'voice-tip-btn',
        text: 'Check again',
        onclick: async () => {
          if (hasVoice('hi')) return card.remove();
          status.textContent = 'Still no Hindi voice. After installing it, close and reopen the app.';
        },
      }),
      el('button', {
        class: 'voice-tip-btn ghost',
        text: 'Hide',
        onclick: () => {
          try {
            localStorage.setItem(TIP_KEY, '1');
          } catch {}
          card.remove();
        },
      }),
    ]),
  ]);
  slot.replaceChildren(card);
}

// ---------- a world's path map ----------

const SNAKE = [0, 1, 1.6, 1, 0, -1, -1.6, -1];

export function world(api, w) {
  const { progress, settings } = api.state;
  const lessons = worldLessons(w);
  const current = currentLesson(progress, w);
  const st = worldStars(progress, w);
  const mascot = createMascot(w.mascot, { size: 'medium', onTap: () => mascotJoke(api, mascot) });
  let index = 0;
  let currentNode = null;

  const units = w.units.map((unit, ui) => {
    const rows = unit.lessons.map((lesson) => {
      const i = index++;
      const rec = lessonRecord(progress, lesson.id);
      const open = isUnlocked(progress, w, lesson.id, settings.unlockAll);
      const isCurrent = lesson.id === current.id;
      const cls = rec.stars ? 'done' : isCurrent ? 'current' : open ? 'open' : 'locked';
      const node = el('button', { class: `node ${cls}`, 'data-grow': `lesson:${lesson.id}`, 'aria-label': `${lesson.title.en}${open ? '' : ' (locked)'}` }, [
        el('span', { class: 'node-icon', html: api.iconHtml(lesson.icon) }),
        !open ? el('span', { class: 'node-lock', html: ICONS.lock }) : null,
      ]);
      const stars = el(
        'span',
        { class: 'node-stars' },
        // drawn by CSS, not 144 little SVGs on a big map (the motion budget, roadmap 5.5)
        [0, 1, 2].map((k) => el('span', { class: `mini-star ${k < rec.stars ? 'on' : ''}` })),
      );
      const x = SNAKE[i % SNAKE.length];
      const row = el('div', { class: `node-row ${cls} ${x > 0 ? 'guide-left' : ''}`, style: { '--x': String(x) } }, [
        node,
        el('span', { class: 'node-title' }, english(w) ? [el('span', { class: 'latin', text: lesson.title.en })] : [el('span', { lang: 'hi', text: lesson.title.hi }), langMode(api) === 'both' ? el('span', { class: 'en', text: lesson.title.en }) : null]),
        stars,
      ]);
      node.addEventListener('click', () => {
        if (!open) {
          api.sfx.boing();
          animate(node, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
          return;
        }
        api.sfx.pop();
        api.go('lesson', { lessonId: lesson.id }, { from: node });
      });
      if (isCurrent) {
        currentNode = row;
        row.append(el('div', { class: 'node-guide' }, [mascot.node]));
        row.prepend(el('span', { class: 'node-start', 'aria-hidden': 'true' }, [el('span', { html: ICONS.play }), english(w) ? el('span', { text: 'Start' }) : el('span', { lang: 'hi', text: 'चलो!' })]));
      }
      return row;
    });
    const done = unit.lessons.every((l) => lessonRecord(progress, l.id).stars > 0);
    const banner = el('button', { class: `unit-banner ${done ? 'done' : ''}`, 'aria-label': unit.title.en }, [
      el('span', { class: 'unit-icon', html: api.iconHtml(unit.icon) }),
      el('span', { class: 'unit-text' }, [
        el('span', { class: 'unit-skill', text: `${one(api, UNIT, english(w) ? 'en' : 'hi')} ${ui + 1} · ${english(w) ? unit.skill : skillName(api, unit.skill)}` }),
        bigName(w, unit.title, 'unit-title-hi'),
        english(w) || langMode(api) !== 'both' ? null : el('span', { class: 'unit-title-en', text: unit.title.en }),
      ]),
      done ? el('span', { class: 'unit-trophy', html: ICONS.trophy }) : null,
    ]);
    banner.addEventListener('click', () => api.sayLines(unit.title));
    return el('section', { class: 'unit' }, [banner, el('div', { class: 'nodes' }, rows)]);
  });

  const head = el('header', { class: 'world-head' }, [
    el('button', { class: 'round-btn', 'aria-label': 'All worlds', html: ICONS.back, onclick: () => api.back() }),
    el('div', { class: 'world-title' }, [
      bigName(w, w.name, 'world-name-hi'),
      el('span', { class: 'world-name-en', text: [english(w) || langMode(api) !== 'both' ? null : w.name.en, ...tagsOf(api, w).map((t) => one(api, t))].filter(Boolean).join(' · ') }),
      el('span', { class: 'title-stars', 'aria-label': `${st.got} of ${st.max} stars` }, [el('span', { class: 'star-icon', html: ICONS.star }), el('b', { text: `${st.got} / ${st.max}` })]),
    ]),
    el('span', { class: 'star-chip' }, [el('span', { class: 'star-icon', html: ICONS.star }), el('b', { text: String(st.got) })]),
    el('button', { class: 'round-btn small', 'aria-label': 'My collection', html: ICONS.album, onclick: () => api.go('collection', { worldId: w.id }) }),
    w.subject !== 'math' && !(w.tags || []).includes('comics') && api.state.content.stories.some((s) => storyLevels(api, w).includes(s.level) && storyLang(s) === worldStoryLang(w))
      ? el('button', { class: 'round-btn small', 'aria-label': 'Story library', html: ICONS.book, onclick: () => api.go('library', { worldId: w.id }) })
      : null,
  ]);
  const path = el('div', { class: 'path' }, units);
  api.app.replaceChildren(
    el('div', { class: `screen world-map theme-${w.theme} enter`, style: { '--place': w.color } }, [backdrop(w), head, el('div', { class: 'path-scroll' }, [path])]),
  );
  const walked = Math.max(0, lessons.findIndex((l) => l.id === current.id));
  // The trail is measured from the laid-out stops, which forces a full layout of the map. It is drawn in
  // a task of its own once the map has painted (and again, at most once a frame, when the map resizes),
  // never in the frame that builds the map: on a slow phone that frame was the longest in the app (5.5).
  let pending = 0;
  const draw = () => {
    if (pending) return;
    pending = requestAnimationFrame(() => setTimeout(() => ((pending = 0), drawTrail(path, walked)), 0));
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(draw).observe(path);
  else draw();
  requestAnimationFrame(() => currentNode?.scrollIntoView({ block: 'center' }));
  const unit = w.units.find((u) => u.lessons.some((l) => l.id === current.id));
  setTimeout(() => {
    mascot.react('wave');
    api.sayLines(unit.title);
  }, 500);
}

// A winding trail through the lesson stops: solid up to the current stop, dotted after it.
// Measured from the laid-out nodes, so it follows the snake on any screen size.
export function trailPath(points) {
  if (!points.length) return '';
  const f = (n) => Math.round(n * 10) / 10;
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [points[i - 1] || points[i], points[i], points[i + 1], points[i + 2] || points[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

function drawTrail(path, walked) {
  if (!path.isConnected) return;
  const box = path.getBoundingClientRect();
  const scale = box.width / (path.offsetWidth || box.width) || 1; // the screen may still be zooming in
  const points = [...path.querySelectorAll('.node')].map((n) => {
    const r = n.getBoundingClientRect();
    return [(r.left + r.width / 2 - box.left) / scale, (r.top + r.height / 2 - box.top) / scale];
  });
  path.querySelector('.trail')?.remove();
  if (points.length < 2) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'trail');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', String(path.offsetWidth));
  svg.setAttribute('height', String(path.offsetHeight));
  const line = (cls, pts) => {
    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute('class', cls);
    p.setAttribute('d', trailPath(pts));
    svg.append(p);
  };
  line('trail-road', points);
  line('trail-ahead', points.slice(walked));
  if (walked > 0) line('trail-walked', points.slice(0, walked + 1));
  path.prepend(svg);
}

function storyLevels(api, w) {
  const order = api.state.content.levels.map((l) => l.id);
  const i = order.indexOf(w.level);
  // this grade and the one before; the youngest grade gets the one after instead (as on Story radio)
  return i > 0 ? order.slice(i - 1, i + 1) : order.slice(0, 2);
}

// ---------- results ----------

export async function results(api, { world, lesson, result, collection, session, milestones = [], rewards = [] }) {
  const mascot = createMascot(world.mascot, { size: 'large', onTap: () => mascotJoke(api, mascot) });
  // after a story: the grown-up's talk-together prompts (docs/ROADMAP.md 7.6)
  const talkStory = session?.story ? api.state.content.stories.find((s) => s.id === session.story && s.talk?.length) : null;
  // the most special milestone this lesson reached (a whole world, the first lesson, so many stars …)
  const milestone = milestones.map((id) => milestoneLine(api.state.content.guide, id)).find(Boolean) || null;
  const stars = el(
    'div',
    { class: 'result-stars' },
    [0, 1, 2].map(() => el('span', { class: 'big-star-slot', html: ICONS.star })),
  );
  const next = nextLesson(world, lesson.id);
  const isStory = lesson.id.startsWith('story:');
  // free play after every two lessons (docs/ROADMAP.md 7.14); not for the oldest readers' comics and grammar
  const playTime = freeplayDue(world.level, api.state.sessionLessons || 0);
  const btns = el('div', { class: 'result-buttons' }, [
    el('button', { class: 'bubble ghost', 'aria-label': 'Back to the map', html: ICONS.map, onclick: () => api.back() }),
    el('button', { class: 'bubble ghost', 'aria-label': 'Play again', html: ICONS.replay, onclick: () => (lesson.id === 'together' ? api.go('together', {}, { replace: true }) : api.go('lesson', isStory ? { worldId: world.id, storyId: lesson.config.story } : { lessonId: lesson.id }, { replace: true })) }),
    playTime ? el('button', { class: 'bubble freeplay-go big', 'aria-label': 'Free play', onclick: () => api.go('freeplay', { worldId: world.id }, { replace: true }) }, [el('span', { 'aria-hidden': 'true', text: world.collection === 'vehicles' ? '🚗' : world.id === 'farm' ? '🥕' : '🎨' })]) : null,
    next && !isStory ? el('button', { class: 'bubble green big', 'aria-label': 'Next lesson', html: ICONS.next, onclick: () => api.go('lesson', { lessonId: next.id }, { replace: true }) }) : null,
  ]);
  const item = result.item ? api.word(result.item) : null;
  const reward = item
    ? el('div', { class: 'reward' }, [
        el('span', { class: 'reward-label', text: collection.name.en }),
        el('div', { class: 'reward-card' }, [el('div', { class: 'reward-back', html: ICONS.sparkle }), el('div', { class: 'reward-front' }, [el('span', { class: 'pic', html: pictureForWord(item) }), api.label(item)])]),
      ])
    : null;
  api.app.replaceChildren(
    el('div', { class: `screen results theme-${world.theme} enter`, style: { '--place': world.color } }, [
      backdrop(world),
      el('div', { class: 'burst' }),
      el('div', { class: 'confetti' }, Array.from({ length: 36 }, (_, i) => el('i', { style: { left: `${(i * 37) % 100}%`, animationDelay: `${(i % 12) * 0.1}s`, background: ['#FF5A5F', '#FFC93C', '#2EC27E', '#3D7BFF', '#A66BFF', '#FF8FB1'][i % 6] } }))),
      el('div', { class: `result-card${result.stars === 3 ? ' perfect' : ''}` }, [
        el('div', { class: 'result-mascot' }, [mascot.node]),
        praiseRibbon(world, result.stars),
        stars,
        session?.answered
          ? el('div', { class: 'result-stats' }, [
              el('span', { class: 'stat-chip' }, [el('span', { class: 'stat-icon', html: ICONS.check }), el('b', { text: `${session.firstTry} / ${session.answered}` }), el('span', { text: 'right first time' })]),
              (session.best || 0) >= 3 ? el('span', { class: 'stat-chip gold' }, [el('span', { class: 'stat-icon', html: ICONS.sparkle }), el('b', { text: String(session.best) }), el('span', { text: 'in a row' })]) : null,
            ])
          : null,
        result.unitComplete ? el('div', { class: 'unit-complete' }, [el('span', { html: ICONS.trophy }), el('span', { text: 'Unit complete!' })]) : null,
        milestone ? el('div', { class: 'milestone' }, [el('span', { class: 'milestone-icon', html: ICONS.sparkle }), ...said(api, milestone, english(world) ? 'en' : 'hi', 'b')]) : null,
        reward,
        talkStory ? el('div', { class: 'story-after' }, [heartButton(api, talkStory, { cls: 'big' }), talkButton(api, talkStory)]) : null,
        ...rewards.map((r) => newPrizeCard(api, r)),
        giftDue(api.state.progress) && lesson.id !== 'together' ? giftBox(api, world, collection, mascot) : null,
        btns,
      ]),
    ]),
  );
  mascot.react('dance');
  api.sfx.cheer();
  const token = api.state.token;
  for (let i = 0; i < result.stars; i++) {
    await sleep(380);
    if (token !== api.state.token) return;
    stars.children[i].classList.add('on');
    sparkleAt(stars.children[i], { count: 8, colors: ['#FFC93C', '#FFE27A', '#FFFFFF', '#FF9F43'] });
    api.sfx.star(i);
  }
  await sleep(300);
  if (token !== api.state.token) return;
  if (reward) {
    reward.classList.add('flip');
    api.sfx.sparkle();
    await sleep(500);
    await api.say(collection.id === 'vehicles' ? 'newVehicle' : 'newItem', item);
  } else await api.say(result.stars === 3 ? 'great' : 'yay');
  if (result.unitComplete && token === api.state.token) await api.say('unitDone');
  if (playTime && token === api.state.token) await api.say('freeplayTime');
  if (milestone && token === api.state.token) {
    mascot.react('dance');
    api.sfx.cheer();
    await api.sayLines(milestone, `guide-${milestone.id}`);
  }
  if (rewards.length && token === api.state.token) {
    api.sfx.jingle();
    await api.say('newPrize');
  }
}

// ---------- a surprise each day (roadmap 7.12, js/surprise.js) ----------
// After the first lesson of the day: a gift box to open. Inside, one small thing.
function giftBox(api, world, collection, mascot) {
  const box = el('button', { class: 'gift-box', 'aria-label': "Open today's present" }, [
    el('span', { class: 'gift-lid', 'aria-hidden': 'true' }),
    el('span', { class: 'gift-body', 'aria-hidden': 'true' }),
    el('span', { class: 'gift-label' }, said(api, { hi: 'आज का तोहफ़ा!', en: "Today's present!" }, 'hi', 'b')),
  ]);
  const wrap = el('div', { class: 'gift' }, [box]);
  setTimeout(() => wrap.isConnected && !box.classList.contains('open') && api.say('giftHere'), 2600);
  box.addEventListener('click', async () => {
    if (box.classList.contains('open')) return;
    const { content } = api.state;
    const day = isoDay(Date.now());
    const col = collection?.items ? collection : null;
    const sticker = col ? col.items.find((id) => !(api.state.progress.collected?.[col.id] || []).includes(id)) : null;
    const lines = content.mascotLines || [];
    const gift = pickGift(day, { sticker, jokes: riddleIndexes(lines) });
    const progress = { ...api.state.progress, gift };
    if (gift.kind === 'sticker') progress.collected = { ...progress.collected, [col.id]: [...(progress.collected?.[col.id] || []), sticker] };
    api.state.progress = progress;
    api.persistProgress();
    api.applyStyle();
    box.classList.add('open');
    api.sfx.feel?.('reward');
    sparkleAt(box, { count: 14 });
    await sleep(500);
    let inside;
    if (gift.kind === 'sticker') {
      inside = el('div', { class: 'gift-inside' }, [el('span', { class: 'gift-pic', html: pictureForWord(api.word(sticker)) }), ...said(api, { hi: 'नया स्टिकर!', en: 'A new sticker!' }, 'hi', 'b')]);
      wrap.append(inside);
      await api.say('giftSticker');
      api.sayItem(api.word(sticker));
    } else if (gift.kind === 'joke') {
      const line = lines[gift.value];
      inside = el('div', { class: 'gift-inside' }, [el('span', { class: 'gift-pic emoji', text: '😄' }), el('b', { lang: 'hi', text: line.hi }), el('small', { text: line.en })]);
      wrap.append(inside);
      mascot.react('silly');
      await api.sayLines(line, `mascot-${gift.value + 1}`);
    } else {
      inside = el('div', { class: 'gift-inside' }, [el('span', { class: 'gift-pic emoji', text: '🔔' }), ...said(api, { hi: 'आज बटनों की नई आवाज़!', en: 'A new sound for the buttons today!' }, 'hi', 'b')]);
      wrap.append(inside);
      api.sfx.tick();
      await api.say('giftSound');
    }
  });
  return wrap;
}

// ---------- little rewards that aren't stars (roadmap 7.5, js/rewards.js) ----------
const KIND_NAME = { outfit: { hi: 'साथी की पोशाक', en: 'Outfits for your guide' }, backdrop: { hi: 'घर का दृश्य', en: 'Home backgrounds' }, sound: { hi: 'बटन की आवाज़', en: 'Button sounds' } };
const SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
// the picture of a prize: the guide wearing it, the background, or a speaker
function prizePicture(api, r) {
  if (r.kind === 'backdrop') return sceneSvg(r.id, { crop: 'bottom' });
  if (r.kind === 'sound') return SPEAKER;
  const was = currentOutfit();
  setOutfit(r.id);
  const art = mascotSvg(homeWorld(api.state.content, api.state.settings)?.mascot || 'gappu');
  setOutfit(was);
  return art;
}
// wear it, use it, or (tapped again) put it away
function usePrize(api, r) {
  const st = { ...(api.state.progress.style || {}) };
  st[r.kind] = st[r.kind] === r.id ? null : r.id;
  api.state.progress = { ...api.state.progress, style: st };
  api.persistProgress();
  api.applyStyle();
  if (r.kind === 'sound') api.sfx.tick();
  return st[r.kind] === r.id;
}
function newPrizeCard(api, r) {
  const use = el('button', { class: 'bubble green prize-use' }, said(api, r.kind === 'outfit' ? { hi: 'पहनो', en: 'Wear it' } : { hi: 'लगाओ', en: 'Use it' }));
  use.addEventListener('click', () => {
    usePrize(api, r);
    use.disabled = true;
    use.replaceChildren(...said(api, { hi: 'लग गया!', en: 'Done!' }));
    api.sfx.feel?.('reward');
  });
  return el('div', { class: `new-prize kind-${r.kind}` }, [
    el('span', { class: 'prize-ribbon' }, said(api, { hi: 'नया इनाम!', en: 'A new prize!' })),
    el('span', { class: 'prize-pic', html: prizePicture(api, r) }),
    el('b', { lang: 'hi', text: one(api, r.name) }),
    use,
  ]);
}
// Grades 7–8: read a story for a little brother or sister (roadmap 7.9)
function missionCard(api) {
  if (!MISSION_LEVELS.includes(api.state.settings.level)) return null;
  const done = Object.keys(readByAll()).filter((id) => missionStories(api.state.content).some((s) => s.id === id)).length;
  return el('button', { class: 'mission-card', 'aria-label': 'Read to your brother or sister', onclick: () => (api.sfx.pop(), api.go('readfor')) }, [
    el('span', { class: 'mission-icon', 'aria-hidden': 'true', text: '📖' }),
    el('span', { class: 'mission-text' }, [el('b', { lang: 'hi', text: 'छोटों के लिए कहानी पढ़ो' }), el('small', { text: 'Read a story for your brother or sister' })]),
    done ? el('small', { class: 'prizes-count', text: `✓ ${done}` }) : null,
  ]);
}
function prizesButton(api) {
  const n = unlockedRewards(totalStars(api.state.progress)).length;
  return el('button', { class: 'prizes-btn', 'aria-label': 'My prizes', onclick: () => (api.sfx.pop(), api.go('rewards')) }, [
    el('span', { class: 'prizes-icon', 'aria-hidden': 'true', text: '🎁' }),
    el('span', {}, said(api, { hi: 'मेरे इनाम', en: 'My prizes' }, 'hi', 'b')),
    el('small', { class: 'prizes-count', text: `${n}/${REWARDS.length}` }),
  ]);
}
// the wardrobe: every prize, the ones unlocked ready to wear or use, the rest waiting for their stars
export function rewards(api, { quiet = false } = {}) {
  const stars = totalStars(api.state.progress);
  const have = new Set(unlockedRewards(stars).map((r) => r.id));
  const st = styleFor(api.state.progress, stars);
  const next = nextReward(stars);
  const tile = (r) => {
    const on = st[r.kind] === r.id;
    const b = el('button', { class: `prize-tile kind-${r.kind}${have.has(r.id) ? '' : ' locked'}${on ? ' on' : ''}`, 'aria-pressed': String(on), 'aria-label': `${r.name.en}${have.has(r.id) ? '' : ` (at ${r.stars} stars)`}` }, [
      el('span', { class: 'prize-pic', html: prizePicture(api, r) }),
      el('b', { lang: 'hi', text: one(api, r.name) }),
      have.has(r.id) ? null : el('small', { class: 'prize-lock' }, [el('span', { class: 'star-icon', html: ICONS.star }), el('span', { text: String(r.stars) })]),
    ]);
    b.addEventListener('click', () => {
      if (!have.has(r.id)) return api.sfx.boing();
      usePrize(api, r);
      api.sfx.feel?.('select');
      rewards(api, { quiet: true });
    });
    return b;
  };
  api.app.replaceChildren(
    el('div', { class: 'screen rewards-screen enter' }, [
      backdrop(st.backdrop ? { theme: st.backdrop } : null),
      el('header', { class: 'game-head' }, [
        el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
        el('div', { class: 'head-title' }, said(api, { hi: 'मेरे इनाम', en: 'My prizes' }, 'hi', 'span')),
        el('span', { class: 'star-chip' }, [el('span', { class: 'star-icon', html: ICONS.star }), el('b', { text: String(stars) })]),
      ]),
      el('main', { class: 'rewards-main' }, [
        next ? el('p', { class: 'prize-next' }, said(api, { hi: `अगला इनाम ${next.stars} तारों पर: ${next.name.hi}`, en: `Next prize at ${next.stars} stars: ${next.name.en}` })) : el('p', { class: 'prize-next' }, said(api, { hi: 'सारे इनाम मिल गए!', en: 'Every prize found!' })),
        ...REWARD_KINDS.map((k) => el('section', { class: 'prize-shelf' }, [el('h3', {}, said(api, KIND_NAME[k], 'hi', 'span')), el('div', { class: 'prize-tiles' }, REWARDS.filter((r) => r.kind === k).map(tile))])),
        // the festival stickers collected (roadmap 7.11): each festival's, the ones still to come greyed
        el('section', { class: 'prize-shelf' }, [
          el('h3', {}, said(api, { hi: 'त्योहार के स्टिकर', en: 'Festival stickers' }, 'hi', 'span')),
          el(
            'div',
            { class: 'prize-tiles' },
            FESTIVALS.map((f) => {
              const got = Object.keys(api.state.progress.festStickers || {}).some((k) => k.startsWith(`${f.id}-`));
              return el('div', { class: `prize-tile fest-tile${got ? '' : ' locked'}`, role: 'img', 'aria-label': `${f.name.en}${got ? '' : ' (comes on the festival)'}` }, [el('span', { class: 'prize-pic', html: api.word(f.sticker) ? pictureForWord(api.word(f.sticker)) : '' }), el('b', { lang: 'hi', text: one(api, f.name) })]);
            }),
          ),
        ]),
      ]),
    ]),
  );
  if (!quiet) api.say('prizesHello');
}

// ---------- साथ खेलो: two players on one device (docs/ROADMAP.md 7.6) ----------
// Pick two players: any child on this device (each plays at their own grade) or a grown-up.
export function together(api) {
  const { content, profiles, settings } = api.state;
  const levelOf = (id) => (id === profiles.current ? settings.level : load(profileKey(KEYS.settings, id))?.level);
  const people = playersFrom(profiles, levelOf, MASCOT_IDS);
  const levelName = (lv) => (lv === GROWN_UP ? { hi: 'बड़े', en: 'Grown-up' } : content.levels.find((l) => l.id === lv)?.name || { hi: lv, en: lv });
  const others = people.filter((p) => p.id !== profiles.current);
  const picked = [people.find((p) => p.id === profiles.current) || people[0], others.find((p) => p.id !== GROWN_UP) || others.at(-1)];
  let slot = 1;
  const face = (p) => el('span', { class: 'player-face', html: p.avatar ? mascotSvg(p.avatar) : '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="34" r="20" fill="#F2C29A"/><path d="M18 98 Q20 62 50 62 Q80 62 82 98 Z" fill="#6C63FF"/></svg>' });
  const label = (p) => p.name || (p.id === GROWN_UP ? 'बड़े' : `बच्चा ${p.n}`);
  const slots = el('div', { class: 'together-slots' });
  const list = el('div', { class: 'together-people', role: 'listbox', 'aria-label': 'Who is playing?' });
  const draw = () => {
    slots.replaceChildren(
      ...picked.map((p, i) =>
        el('button', { class: `together-slot p${i + 1}${slot === i ? ' choosing' : ''}`, 'aria-label': `Player ${i + 1}: ${label(p)}`, onclick: () => ((slot = i), draw()) }, [
          el('small', { lang: 'hi', text: i ? 'दूसरा खिलाड़ी' : 'पहला खिलाड़ी' }),
          face(p),
          el('b', { text: label(p) }),
          el('span', { class: 'slot-level' }, said(api, levelName(p.level))),
        ]),
      ),
    );
    list.replaceChildren(
      ...people.map((p) =>
        el('button', { class: `together-person${picked.includes(p) ? ' picked' : ''}`, 'aria-label': label(p), onclick: () => {
          api.sfx.pop();
          if (picked[1 - slot] === p) picked[1 - slot] = picked[slot];
          picked[slot] = p;
          slot = 1 - slot;
          draw();
        } }, [face(p), el('b', { text: label(p) }), el('small', {}, said(api, levelName(p.level)))]),
      ),
    );
  };
  draw();
  const start = el('button', { class: 'bubble green big', 'aria-label': 'Start', html: ICONS.play, onclick: () => {
    api.sfx.jingle();
    api.go('lesson', { worldId: homeWorld(content, settings).id, together: { players: picked.map((p) => ({ name: p.name, avatar: p.avatar, level: p.level })) } }, { replace: true });
  } });
  api.app.replaceChildren(
    el('div', { class: 'screen together-setup enter' }, [
      backdrop(null),
      el('header', { class: 'game-head' }, [el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }), el('div', { class: 'head-title' }, said(api, { hi: 'साथ खेलो', en: 'Play together' }, 'hi', 'span')), el('span', { class: 'round-spacer' })]),
      el('main', { class: 'together-main' }, [
        el('p', { class: 'together-help' }, said(api, { hi: 'दो खिलाड़ी चुनो। बारी-बारी से खेलो, हर किसी को अपनी कक्षा का सवाल मिलेगा। तारे दोनों के!', en: 'Pick two players. Take turns; each gets a question for their own grade. The stars belong to both!' })),
        slots,
        list,
        start,
      ]),
    ]),
  );
  api.say('togetherHi');
}

// ---------- talk together: prompts for a grown-up after a story (docs/ROADMAP.md 1.4, 7.6) ----------
// Dialogic reading (Whitehurst's CROWD prompts): finish the line, remember, look and tell, why, and
// "what about you". They are for the grown-up to ask, so they sit behind a button, and they are not said.
export const TALK_LABELS = {
  complete: { hi: 'पूरा करो', en: 'Finish the line' },
  recall: { hi: 'याद करो', en: 'Remember' },
  open: { hi: 'देखो और बताओ', en: 'Look and tell' },
  why: { hi: 'क्यों?', en: 'Why?' },
  you: { hi: 'तुम्हारी बात', en: 'About you' },
};
function talkButton(api, story) {
  const b = el('button', { class: 'talk-btn', 'aria-label': 'Talk together: questions for a grown-up to ask' }, [
    el('span', { class: 'talk-icon', 'aria-hidden': 'true', text: '💬' }),
    el('span', { class: 'talk-text' }, [el('b', { lang: 'hi', text: 'साथ में बात करें' }), el('small', { text: 'Talk together · for grown-ups' })]),
  ]);
  b.addEventListener('click', () => {
    api.sfx.pop();
    showTalk(api, story);
  });
  return b;
}
export function showTalk(api, story) {
  const sheet = el('div', { class: 'talk-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Talk about ${story.title.en}` });
  const close = () => sheet.remove();
  sheet.append(
    el('div', { class: 'talk-card' }, [
      el('header', { class: 'talk-head' }, [
        el('div', {}, [el('b', { lang: 'hi', text: `"${story.title.hi || story.title.en}" पर बात करें` }), el('small', { text: `Talk about "${story.title.en}"` })]),
        el('button', { class: 'round-btn small', 'aria-label': 'Close', html: ICONS.check, onclick: close }),
      ]),
      el('p', { class: 'talk-intro' }, [
        el('span', { lang: 'hi', text: 'इनमें से एक-दो सवाल पूछिए। कोई जवाब ग़लत नहीं; बातचीत ही सीख है।' }),
        el('small', { text: 'Ask one or two of these. There are no wrong answers: the talk is the learning.' }),
      ]),
      el(
        'ol',
        { class: 'talk-list' },
        story.talk.map((t) =>
          el('li', { class: `talk-item ${t.type}` }, [
            el('span', { class: 'talk-kind' }, [el('b', { lang: 'hi', text: TALK_LABELS[t.type]?.hi || t.type }), el('small', { text: TALK_LABELS[t.type]?.en || '' })]),
            el('span', { class: 'talk-q', lang: 'hi', text: t.hi }),
            el('small', { class: 'talk-en', text: t.en }),
          ]),
        ),
      ),
    ]),
  );
  sheet.addEventListener('click', (e) => e.target === sheet && close());
  (api.app.querySelector('.screen') || api.app).append(sheet);
  sheet.querySelector('.round-btn')?.focus();
}

// A ribbon across the results card. Praise names the effort, not the child (Mueller & Dweck).
export const PRAISE = [
  { hi: 'अच्छी कोशिश!', en: 'Good try!' },
  { hi: 'अच्छी कोशिश!', en: 'Good try!' },
  { hi: 'शाबाश!', en: 'Well done!' },
  { hi: 'शानदार!', en: 'Amazing!' },
];
function praiseRibbon(world, starCount) {
  const p = PRAISE[Math.max(0, Math.min(3, starCount | 0))];
  return el('div', { class: 'result-ribbon' }, english(world) ? [el('b', { text: p.en })] : [el('b', { lang: 'hi', text: p.hi }), el('span', { text: p.en })]);
}

// ---------- collection ----------

// A collection is a picture to play with (docs/ROADMAP.md 7.1): the world's own scene, and a tray of the
// stickers the child has earned. Tap or drag a sticker into the picture; drag it around (lower down is
// nearer, so bigger); tap it to hear it; drag it back out to take it away. The album button shows them all
// as cards. What's in the picture is saved with the progress (progress.scenes).
export const SCENE_MAX = 30;
export const stickerSize = (y) => 0.62 + (Math.max(0, Math.min(100, y)) / 100) * 0.62;

export function collection(api, w) {
  const { content, progress } = api.state;
  const col = content.collections[w.collection];
  const have = new Set(progress.collected[w.collection] || []);
  const special = w.collection === 'vehicles' && api.state.special;
  const artOf = (id) => (id === 'special' ? specialVehicle(api.state.special) : pictureForWord(api.word(id)));
  const sayOf = (id) => (id === 'special' ? (api.sfx.vroom(), api.say('special')) : api.sayAbout(api.word(id)));
  const view = api.state.collectionView || 'scene';
  const owned = [...(special ? ['special'] : []), ...col.items.filter((id) => have.has(id))];
  const flip = el('button', {
    class: 'round-btn small',
    'aria-label': view === 'scene' ? 'All stickers' : 'My picture',
    html: view === 'scene' ? ICONS.album : ICONS.picture,
    onclick: () => {
      api.sfx.pop();
      api.state.collectionView = view === 'scene' ? 'album' : 'scene';
      collection(api, w);
    },
  });
  const head = el('header', { class: 'game-head' }, [
    el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
    el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: col.name.hi }), el('span', { class: 'world-name-en', text: langMode(api) === 'both' ? `${have.size} / ${col.items.length} · ${col.name.en}` : `${have.size} / ${col.items.length}` })]),
    flip,
  ]);
  const next = nextCollectible(progress, { id: w.collection, ...col });
  const hint = next ? el('p', { class: 'collection-hint' }, said(api, { hi: 'पाठ पूरे करो, और दोस्त पाओ!', en: 'Finish lessons to find more!' })) : null;
  const body = view === 'scene' ? stickerScene(api, w, owned, col, artOf, sayOf) : stickerAlbum(api, col, have, special, artOf, sayOf);
  api.app.replaceChildren(el('div', { class: `screen collection ${view} theme-${w.theme} enter`, style: { '--place': w.color } }, [backdrop(w), head, body, hint]));
  if (view === 'scene' && !(progress.scenes?.[w.collection] || []).length && owned.length) api.sayLines({ hi: 'स्टिकर उठाओ और तस्वीर में लगाओ!', en: 'Pick a sticker and put it in the picture!' });
  else api.sayLines(col.name);
}

function stickerAlbum(api, col, have, special, artOf, sayOf) {
  const cards = [];
  if (special) {
    const c = el('button', { class: 'card sticker special', 'aria-label': 'special vehicle', html: artOf('special') });
    c.addEventListener('click', () => (bounce(c), sayOf('special')));
    cards.push(c);
  }
  for (const id of col.items) {
    const w0 = api.word(id);
    const got = have.has(id);
    const c = el('button', { class: `card sticker ${got ? '' : 'locked'}`, 'aria-label': got ? w0.en : 'not found yet' }, [el('span', { class: 'pic', html: pictureForWord(w0) }), got ? api.label(w0) : el('span', { class: 'q', text: '?' })]);
    c.addEventListener('click', () => {
      if (!got) return void api.sfx.boing();
      api.sfx.pop();
      bounce(c);
      sayOf(id);
    });
    cards.push(c);
  }
  return el('main', { class: 'sticker-grid' }, cards);
}

function stickerScene(api, w, owned, col, artOf, sayOf) {
  const key = w.collection;
  const ok = new Set(owned);
  let placed = (api.state.progress.scenes?.[key] || []).filter((p) => ok.has(p.id)).slice(0, SCENE_MAX);
  const save = () => {
    api.state.progress = { ...api.state.progress, scenes: { ...(api.state.progress.scenes || {}), [key]: placed.map(({ id, x, y }) => ({ id, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })) } };
    api.persistProgress();
  };
  const stage = el('div', { class: 'scene-stage', html: sceneSvg(w.theme), role: 'application', 'aria-label': 'My picture' });
  const layer = el('div', { class: 'scene-stickers' });
  stage.append(layer);
  const tray = el('div', { class: 'sticker-tray', role: 'toolbar', 'aria-label': 'My stickers' });
  const at = (e) => {
    const r = stage.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom };
  };
  const place = (node, p) => {
    node.style.left = `${p.x}%`;
    node.style.top = `${p.y}%`;
    node.style.setProperty('--s', stickerSize(p.y).toFixed(3));
    node.style.zIndex = String(Math.round(p.y * 10));
  };
  // a sticker in the picture: drag it, tap it, or drag it out to take it away
  const addNode = (p, { fresh = false } = {}) => {
    const node = el('div', { class: `placed${fresh ? ' fresh' : ''}`, html: artOf(p.id), role: 'img', 'aria-label': p.id === 'special' ? 'special vehicle' : api.word(p.id).en, style: { '--bob': `${(p.x * 0.07) % 2}s` } });
    place(node, p);
    node.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      node.setPointerCapture(e.pointerId);
      const start = { x: e.clientX, y: e.clientY };
      let moved = false;
      node.classList.add('lifted');
      const move = (ev) => {
        if (!moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 8) return;
        moved = true;
        const q = at(ev);
        p.x = Math.max(0, Math.min(100, q.x));
        p.y = Math.max(0, Math.min(100, q.y));
        place(node, p);
        node.classList.toggle('leaving', !q.inside);
      };
      const up = (ev) => {
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', up);
        node.removeEventListener('pointercancel', up);
        node.classList.remove('lifted');
        if (!moved) {
          bounce(node);
          sayOf(p.id);
          return;
        }
        if (!at(ev).inside) {
          placed = placed.filter((x) => x !== p);
          api.sfx.pop();
          node.classList.add('gone');
          setTimeout(() => node.remove(), 260);
        } else api.sfx.pop();
        save();
      };
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', up);
      node.addEventListener('pointercancel', up);
    });
    layer.append(node);
    return node;
  };
  for (const p of placed) addNode(p);
  // a free-ish spot in the lower part of the picture for a tapped sticker
  const spot = () => {
    const n = placed.length;
    return { x: 14 + ((n * 37) % 72), y: 58 + ((n * 23) % 30) };
  };
  const drop = (id, p) => {
    if (placed.length >= SCENE_MAX) {
      api.sfx.boing();
      return api.sayLines({ hi: 'तस्वीर भर गई! पहले कुछ हटाओ।', en: 'The picture is full! Take some out first.' });
    }
    const item = { id, ...p };
    placed.push(item);
    const node = addNode(item, { fresh: true });
    api.sfx.pop();
    sparkleAt(node, { count: 8 });
    sayOf(id);
    save();
  };
  for (const id of owned) {
    const b = el('button', { class: 'tray-sticker', html: artOf(id), 'aria-label': `Put ${id === 'special' ? 'my vehicle' : api.word(id).en} in the picture` });
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const start = { x: e.clientX, y: e.clientY };
      let ghost = null;
      const move = (ev) => {
        if (!ghost && Math.abs(ev.clientY - start.y) < 10 && Math.abs(ev.clientX - start.x) < 10) return;
        // a mostly sideways move scrolls the tray; up out of it picks the sticker up
        if (!ghost && Math.abs(ev.clientX - start.x) > Math.abs(ev.clientY - start.y) * 1.2) return cleanup();
        if (!ghost) ghost = el('div', { class: 'placed ghost', html: artOf(id) });
        if (!ghost.isConnected) document.body.append(ghost);
        ghost.style.left = `${ev.clientX}px`;
        ghost.style.top = `${ev.clientY}px`;
      };
      const up = (ev) => {
        cleanup();
        if (!ghost) return drop(id, spot());
        ghost.remove();
        const q = at(ev);
        if (q.inside) drop(id, { x: q.x, y: q.y });
      };
      const cleanup = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', cleanup);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', cleanup);
    });
    b.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), drop(id, spot())));
    tray.append(b);
  }
  // stickers still to find: a "?" each, so a child can see there is more
  for (const id of col.items.filter((x) => !ok.has(x)).slice(0, 4)) tray.append(el('button', { class: 'tray-sticker locked', 'aria-label': 'not found yet', html: '<span>?</span>', onclick: () => api.sfx.boing() }));
  // make-your-own story (roadmap 7.8): tell a story about the picture, and it becomes a book
  const tell = el('button', { class: 'bubble tell-story', 'aria-label': 'Tell a story about my picture' }, [el('span', { 'aria-hidden': 'true', text: '🎙️' }), el('span', {}, said(api, { hi: 'मेरी कहानी', en: 'My story' }, 'hi', 'b'))]);
  tell.addEventListener('click', () => {
    if (!placed.length) return api.sayLines({ hi: 'पहले कुछ स्टिकर तस्वीर में लगाओ!', en: 'First put some stickers in the picture!' });
    api.sfx.pop();
    recordBook(api, w, placed, artOf);
  });
  return el('main', { class: 'scene-play' }, [stage, el('div', { class: 'scene-actions' }, [tell]), tray]);
}

// ---------- story library ----------

export function library(api, w) {
  const { content, progress } = api.state;
  const levels = storyLevels(api, w);
  const stories = content.stories.filter((s) => levels.includes(s.level) && storyLang(s) === worldStoryLang(w));
  // read from the library (story:<id>) or as a lesson on a map
  const readAsLesson = new Set(content.worlds.flatMap((x) => worldLessons(x)).filter((l) => l.config?.story && lessonRecord(progress, l.id).stars > 0).map((l) => l.config.story));
  const isRead = (s) => lessonRecord(progress, `story:${s.id}`).stars > 0 || readAsLesson.has(s.id);
  // learning to read Hindi (Grades 1 and 2): which books the child can already decode (docs/ROADMAP.md 1.3)
  const decoding = !english(w) && ['grade1', 'grade2'].includes(w.level);
  const taught = decoding ? taughtMatras(content, progress, api.state.settings.level) : null;
  const canRead = (s) => decodability(storyNeeds(s), taught);
  const next = decoding ? nextDecodable(stories, taught, isRead) : null;
  let shown = 0;
  const book = (s, { hero = false } = {}) => {
    const read = isRead(s);
    const d = decoding ? canRead(s) : null;
    const b = el('button', { class: `book ${read ? 'read' : ''} ${s.kind === 'poem' ? 'poem' : ''}${hero ? ' next-book' : ''}`, 'data-grow': `story:${s.id}`, 'aria-label': s.title.en }, [
      hero ? el('span', { class: 'next-ribbon' }, said(api, { hi: 'अब यह पढ़ो!', en: 'Read this next!' })) : null,
      s.kind === 'poem' ? el('span', { class: 'poem-ribbon', text: s.lang === 'en' ? 'Rhyme' : 'कविता · Poem' }) : null,
      drawWhenSeen('span', { class: 'book-cover' }, () => pictureForWord(api.word(s.cover)), { now: hero || shown++ < 6 }),
      // English rhymes lead with their English title
      s.lang === 'en' ? el('span', { class: 'book-title latin', text: s.title.en }) : el('span', { class: 'book-title', lang: 'hi', text: s.title.hi }),
      el('span', { class: 'book-title-en', lang: s.lang === 'en' ? 'hi' : 'en', text: s.lang === 'en' ? s.title.hi : s.title.en }),
      d?.ok && !hero ? el('span', { class: 'can-read', lang: 'hi', title: 'You can read this one yourself', text: 'ख़ुद पढ़ो' }) : null,
      d && !d.ok && d.missing.length <= 3 ? el('span', { class: 'needs-matras', title: 'Matras still to learn' }, d.missing.map((m) => el('i', { lang: 'hi', text: `◌${MATRA_SIGNS[m]}` }))) : null,
      read ? el('span', { class: 'book-badge', html: ICONS.check }) : null,
    ]);
    b.addEventListener('click', () => {
      api.sfx.page();
      api.go('lesson', { worldId: w.id, storyId: s.id }, { from: b });
    });
    // a heart on every book (roadmap 7.2); a sibling of the book, not inside its button
    return el('div', { class: `book-wrap${hero ? ' next-book-wrap' : ''}` }, [b, heartButton(api, s, { cls: 'on-book' })]);
  };
  // while learning to read, the books a child can read come first, then those needing the fewest new matras
  const order = decoding ? stories.map((s, i) => [s, canRead(s).missing.length, i]).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map((x) => x[0]) : stories;
  const books = order.filter((s) => !next || s !== next || !canRead(s).ok).map((s) => book(s));
  const hero = next && canRead(next).ok ? book(next, { hero: true }) : null;
  // each world's guide keeps its own library, on shelves that match the world
  const guide = MASCOTS[w.mascot]?.name || { hi: '', en: '' };
  const mascot = createMascot(w.mascot, { size: 'small', onTap: () => mascotJoke(api, mascot) });
  api.app.replaceChildren(
    el('div', { class: `screen library theme-${w.theme} enter`, style: { '--place': w.color } }, [
      backdrop(w),
      el('header', { class: 'game-head' }, [
        el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
        el('div', { class: 'head-title' }, english(w)
          ? [el('span', { class: 'world-name-hi latin', text: `${guide.en}'s library` }), el('span', { class: 'world-name-en', text: `${stories.length} rhymes and stories` })]
          : [el('span', { class: 'world-name-hi', lang: 'hi', text: `${guide.hi} का पुस्तकालय` }), el('span', { class: 'world-name-en', text: `${guide.en}'s library · ${stories.length} books` })]),
        el('span', { class: 'round-spacer' }),
      ]),
      el('main', { class: 'shelf' }, [myShelf(api, () => library(api, w)), hero, ...books]),
      el('div', { class: 'mascot-corner' }, [mascot.node]),
    ]),
  );
  setTimeout(() => mascot.react('wave'), 400);
  api.sayLines({ hi: `${guide.hi} के पुस्तकालय में स्वागत है! कौन सी कहानी पढ़ें?`, en: `Welcome to ${guide.en}'s library! Which story shall we read?` });
}

// The child's own books (roadmap 7.8): every picture they told a story about, newest first
function myShelf(api, redraw) {
  const books = api.state.progress.myBooks || [];
  if (!books.length) return null;
  const artOf = (id) => (id === 'special' ? specialVehicle(api.state.special) : api.word(id) ? pictureForWord(api.word(id)) : '');
  return el('section', { class: 'my-shelf' }, [
    el('h3', {}, said(api, { hi: 'मेरी किताबें', en: 'My books' }, 'hi', 'span')),
    el(
      'div',
      { class: 'my-books' },
      books.map((b) => {
        const world = api.state.content.worlds.find((x) => x.id === b.world);
        if (!world) return null;
        const btn = el('button', { class: 'my-book', 'aria-label': 'My book' }, [bookPicture(world, b, artOf, { cls: 'small' })]);
        btn.addEventListener('click', () => (api.sfx.page(), playBook(api, world, b, artOf, { onDelete: redraw })));
        return btn;
      }),
    ),
  ]);
}

// ---------- parent gate: press and hold ----------
// Holding (not tapping) keeps small children out of the grown-ups' area. A quick tap shows a hint,
// a ring fills while the button is held, and it opens after GATE_HOLD_MS. Enter or Space can be held too.

export const GATE_HOLD_MS = 1000;

export function parentGate(api, { onDone = () => api.go('parent'), html = ICONS.gear, label = 'Grown-ups: press and hold', cls = '' } = {}) {
  const hint = el('span', { class: 'gate-hint', 'aria-hidden': 'true' }, [el('b', { lang: 'hi', text: 'बड़े: दबाए रखें' }), el('span', { text: 'Grown-ups: press and hold' })]);
  const btn = el('button', { class: `gate ${cls}`, 'aria-label': label }, [el('span', { class: 'gate-icon', html }), hint]);
  let start = 0;
  let raf = 0;
  let hintTimer = 0;
  const showHint = () => {
    clearTimeout(hintTimer);
    btn.classList.add('show-hint');
    hintTimer = setTimeout(() => btn.classList.remove('show-hint'), 2400);
  };
  const reset = () => {
    cancelAnimationFrame(raf);
    btn.classList.remove('holding');
    btn.style.setProperty('--p', 0);
    // let go too early: show what to do
    if (start && performance.now() - start < GATE_HOLD_MS) showHint();
    start = 0;
  };
  const tick = () => {
    if (!start || !btn.isConnected) return;
    const p = Math.min(1, (performance.now() - start) / GATE_HOLD_MS);
    btn.style.setProperty('--p', p);
    if (p < 1) return void (raf = requestAnimationFrame(tick));
    start = 0;
    reset();
    btn.classList.remove('show-hint');
    api.sfx?.pop?.();
    api.sfx?.haptic?.(30);
    grownUpCheck(api, onDone);
  };
  const begin = () => {
    if (start) return;
    start = performance.now();
    btn.classList.add('holding');
    raf = requestAnimationFrame(tick);
  };
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try {
      btn.setPointerCapture(e.pointerId); // a wobbly finger doesn't cancel the hold
    } catch {
      /* not supported */
    }
    begin();
  });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) btn.addEventListener(ev, reset);
  btn.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (!e.repeat) begin();
  });
  btn.addEventListener('keyup', (e) => (e.key === 'Enter' || e.key === ' ') && reset());
  btn.addEventListener('blur', reset);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
  return btn;
}

// ---------- the grown-up question (roadmap 8.4) ----------
// After the hold, a sum written in words ("twenty-six plus seven"): a young child can't read it, a grown-up
// answers in a second. The app stores require a gate like this before settings and anything outside play.
// Once answered, the gates stay open for a few minutes so a grown-up isn't asked again and again.

export const GROWN_UP_MINUTES = 10;
let grownUpUntil = 0;

export function grownUpQuestion(rng = Math.random, numbers = []) {
  const a = 11 + Math.floor(rng() * 19); // 11 to 29
  const b = 3 + Math.floor(rng() * 7); // 3 to 9
  const word = (n, lg) => numbers[n - 1]?.[lg] || String(n);
  return { a, b, answer: a + b, hi: `${word(a, 'hi')} और ${word(b, 'hi')} मिलाकर कितने?`, en: `What is ${word(a, 'en')} plus ${word(b, 'en')}?` };
}

export function grownUpCheck(api, onDone) {
  if (Date.now() < grownUpUntil) return onDone();
  let q = grownUpQuestion(api.rng || Math.random, api.state.content?.numbers);
  const ask = el('p', { class: 'grown-q' });
  const showQ = () => ask.replaceChildren(el('b', { lang: 'hi', text: q.hi }), el('span', { text: q.en }));
  showQ();
  const input = el('input', { class: 'grown-in', type: 'text', inputmode: 'numeric', pattern: '[0-9]*', autocomplete: 'off', 'aria-label': 'Answer in numbers' });
  const sheet = el('div', { class: 'talk-sheet grown-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'For grown-ups' });
  const close = () => sheet.remove();
  const check = () => {
    if (Number(input.value.trim()) === q.answer) {
      grownUpUntil = Date.now() + GROWN_UP_MINUTES * 60 * 1000;
      close();
      return onDone();
    }
    // a wrong answer: a new sum, so guessing doesn't help
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
    q = grownUpQuestion(api.rng || Math.random, api.state.content?.numbers);
    showQ();
    input.value = '';
    input.focus();
  };
  input.addEventListener('keydown', (e) => e.key === 'Enter' && check());
  const card = el('form', { class: 'talk-card grown-card', onsubmit: (e) => (e.preventDefault(), check()) }, [
    el('header', { class: 'talk-head' }, [
      el('div', {}, [el('b', { lang: 'hi', text: 'बड़ों के लिए' }), el('small', { text: 'For grown-ups: answer in numbers' })]),
      el('button', { type: 'button', class: 'round-btn small', 'aria-label': 'Close', html: ICONS.back, onclick: close }),
    ]),
    ask,
    el('div', { class: 'grown-row' }, [input, el('button', { type: 'submit', class: 'btn primary', text: 'OK' })]),
  ]);
  sheet.append(card);
  sheet.addEventListener('click', (e) => e.target === sheet && close());
  document.body.append(sheet);
  input.focus();
}

// ---------- break time: the daily limit was reached ----------

const OFFLINE_IDEAS = [
  { hi: 'बाहर जाकर खेलो!', en: 'Go and play outside!' },
  { hi: 'किसी के साथ एक असली किताब पढ़ो।', en: 'Read a real book with someone.' },
  { hi: 'आज जो सीखा, उसकी तस्वीर बनाओ।', en: 'Draw a picture of what you learned today.' },
  { hi: 'घर में चीज़ें गिनो: कितने चम्मच? कितनी कुर्सियाँ?', en: 'Count things at home: how many spoons? How many chairs?' },
  { hi: 'किसी को आज की कहानी सुनाओ।', en: 'Tell someone a story from today.' },
  { hi: 'काग़ज़ पर आज के शब्द लिखो।', en: "Write today's words on paper." },
];

export function rest(api) {
  const idea = OFFLINE_IDEAS[Math.floor(api.rng() * OFFLINE_IDEAS.length)];
  const mascot = createMascot(api.state.world?.mascot || 'gappu', { size: 'large', onTap: () => mascotJoke(api, mascot) });
  const more = parentGate(api, {
    cls: 'more-time',
    html: '<span>+10</span>',
    label: 'Grown-ups: press and hold for 10 more minutes',
    onDone: () => {
      api.allowMore(10);
      api.back();
    },
  });
  const restCard = el('div', { class: 'rest-card' });
  api.app.replaceChildren(
    el('div', { class: 'screen rest-screen enter' }, [
      backdrop(api.state.world),
      fill(restCard, [
        infoButton(restCard, { cls: 'corner' }),
        el('div', { class: 'rest-mascot' }, [mascot.node, el('span', { class: 'zzz', text: 'z z z' })]),
        el('h1', { lang: 'hi', text: 'आराम का समय!' }),
        el('p', { class: 'rest-en', text: `Time for a break! You played ${api.minutesToday()} minutes today.` }),
        el('p', { class: 'rest-idea', lang: 'hi', text: idea.hi }),
        el('p', { class: 'rest-en', text: idea.en }),
        el('div', { class: 'rest-actions' }, [el('button', { class: 'bubble green', 'aria-label': 'Home', html: ICONS.home, onclick: () => api.goHome() }), more]),
        forGrownups(el('p', { class: 'rest-note', text: 'Grown-ups: hold +10 for ten more minutes. The limit is in the parent area.' })),
      ]),
    ]),
  );
  api.sayLines({ hi: `आराम का समय! ${idea.hi}`, en: `Time for a break! ${idea.en}` });
}

// ---------- today's path: keep going, a review, a story ----------

const STEP = {
  go: { hi: 'आगे बढ़ो', en: 'Keep going', icon: 'play' },
  review: { hi: 'दोहराओ', en: 'Review', icon: 'replay' },
  story: { hi: 'कहानी', en: 'Story time', icon: 'star' },
  watched: { hi: 'कार्टून वाला खेल', en: 'Play what you watched', icon: 'play' },
};

// The simple home screen's hero: the guide says hello, and one big button plays the next thing to do.
export function playHero(api, steps, worlds = []) {
  const next = steps.find((s) => !s.done) || steps[0];
  const world = next?.world || worlds[0];
  if (!world) return null;
  const lesson = next?.lesson || currentLesson(api.state.progress, world);
  const guide = createMascot(world.mascot, { onTap: () => mascotJoke(api, guide) });
  const { list = [], current } = api.state.profiles || {};
  const name = list.find((p) => p.id === current)?.name?.trim();
  const play = el('button', { class: 'big-play', style: { '--place': world.color }, 'data-grow': `lesson:${lesson.id}`, 'aria-label': `Play: ${lesson.title.en}` }, [
    el('span', { class: 'big-play-pic', html: api.iconHtml(lesson.icon) }),
    el('span', { class: 'big-play-btn', html: ICONS.play }),
  ]);
  play.addEventListener('click', () => {
    api.sfx.pop();
    bounce(play);
    api.go('lesson', { lessonId: lesson.id }, { from: play });
  });
  return el('section', { class: 'play-hero', 'aria-label': 'Play' }, [
    el('div', { class: 'play-hero-guide' }, [guide.node, el('b', { class: 'play-hello', lang: 'hi', text: hello(name) })]),
    play,
    steps.length > 1
      ? el('span', { class: 'play-dots', role: 'img', 'aria-label': `${steps.filter((s) => s.done).length} of ${steps.length} done today` }, steps.map((s) => el('i', { class: s.done ? 'done' : s === next ? 'now' : '' })))
      : null,
    weekTrail(api),
  ]);
}

export function todayCard(api, steps) {
  if (!steps.length) return null;
  const done = steps.filter((s) => s.done).length;
  // the guide of the next thing to do greets the child by name; the ring fills as the day's path is walked
  const next = steps.find((s) => !s.done) || steps[0];
  const guide = createMascot(next.world.mascot, { size: 'small', onTap: () => mascotJoke(api, guide) });
  const { list = [], current } = api.state.profiles || {};
  const name = list.find((p) => p.id === current)?.name?.trim();
  const days = streak(api.state.progress.days, Date.now());
  const allDone = done >= steps.length;
  return el('section', { class: 'today', 'aria-label': "Today's path" }, [
    el('div', { class: 'today-hero' }, [
      el('span', { class: 'hero-guide' }, [guide.node]),
      el('span', { class: 'hero-text' }, [
        el('b', { lang: 'hi', text: hello(name) }),
        el('span', { class: 'hero-sub' }, said(api, allDone ? { hi: 'आज का सफ़र पूरा!', en: 'All done for today!' } : { hi: 'आज का सफ़र', en: "Today's path" })),
        days > 1 ? el('span', { class: 'hero-streak', 'aria-label': `${days} day streak` }, [el('span', { class: 'sun-icon', html: ICONS.sun }), el('span', { text: one(api, { hi: `लगातार ${days} दिन`, en: `${days} days in a row` }) })]) : null,
      ]),
      el('span', { class: `goal-ring${allDone ? ' full' : ''}`, style: { '--p': String(done / steps.length) }, role: 'img', 'aria-label': `${done} of ${steps.length} done today` }, [allDone ? el('span', { class: 'ring-check', html: ICONS.check }) : el('b', { text: `${done}/${steps.length}` })]),
    ]),
    el(
      'div',
      { class: 'today-steps' },
      steps.map((s, i) => {
        const meta = STEP[s.kind];
        const b = el('button', { class: `today-step ${s.kind}${s.done ? ' done' : ''}`, style: { '--place': s.world.color }, 'data-grow': `lesson:${s.lesson.id}`, 'aria-label': `${meta.en}: ${s.lesson.title.en}` }, [
          el('span', { class: 'today-icon', html: api.iconHtml(s.lesson.icon) }),
          el('span', { class: 'today-text' }, [
            el('b', {}, [`${i + 1}. `, ...said(api, meta)]),
            el('span', { class: 'today-lesson', lang: sayText(langMode(api), s.lesson.title, english(s.world) ? 'en' : 'hi').mainLang, text: one(api, s.lesson.title, english(s.world) ? 'en' : 'hi') }),
          ]),
          el('span', { class: 'today-badge', html: s.done ? ICONS.check : ICONS[meta.icon] }),
        ]);
        b.addEventListener('click', () => {
          api.sfx.pop();
          bounce(b);
          api.go('lesson', { lessonId: s.lesson.id }, { from: b });
        });
        return b;
      }),
    ),
    weekTrail(api),
  ]);
}

// ---------- a gentle daily rhythm (roadmap 7.4): the week's sticker trail, and a celebration ----------
const WEEKDAY = [
  { hi: 'सोम', en: 'Mon' },
  { hi: 'मंगल', en: 'Tue' },
  { hi: 'बुध', en: 'Wed' },
  { hi: 'गुरु', en: 'Thu' },
  { hi: 'शुक्र', en: 'Fri' },
  { hi: 'शनि', en: 'Sat' },
  { hi: 'रवि', en: 'Sun' },
];
// Monday to Sunday: a sticker on each day today's path was finished; today's place waits, dashed
export function weekTrail(api, now = Date.now()) {
  const trail = api.state.progress.trail || {};
  const today = isoDay(now);
  return el(
    'div',
    { class: 'week-trail', role: 'img', 'aria-label': `This week: ${weekDays(now).filter((d) => trail[d]).length} of 7 days done` },
    weekDays(now).map((d, i) =>
      el('span', { class: `trail-day${trail[d] ? ' got' : ''}${d === today ? ' today' : ''}${d > today ? ' later' : ''}`, 'data-day': d }, [
        el('span', { class: 'trail-sticker', html: trail[d] && api.word(trail[d]) ? pictureForWord(api.word(trail[d])) : '' }),
        el('small', { lang: langMode(api) === 'en' ? 'en' : 'hi', text: one(api, WEEKDAY[i]) }),
      ]),
    ),
  );
}
// Today's path just finished: the day's sticker, a little party, and its place on the trail
export async function celebrateDay(api, screen, now = Date.now()) {
  const day = isoDay(now);
  const id = trailSticker(day);
  api.state.progress = { ...api.state.progress, trail: { ...(api.state.progress.trail || {}), [day]: id } };
  api.persistProgress();
  const full = weekFull(api.state.progress.trail, now);
  const sticker = el('span', { class: 'day-done-sticker', html: api.word(id) ? pictureForWord(api.word(id)) : '' });
  const party = el('div', { class: 'day-done', role: 'status' }, [
    el('div', { class: 'confetti' }, Array.from({ length: 30 }, (_, i) => el('i', { style: { left: `${(i * 37) % 100}%`, animationDelay: `${(i % 10) * 0.1}s`, background: ['#FF5A5F', '#FFC93C', '#2EC27E', '#3D7BFF', '#A66BFF', '#FF8FB1'][i % 6] } }))),
    el('div', { class: 'day-done-card' }, [
      sticker,
      el('b', { lang: 'hi', text: full ? 'पूरा हफ़्ता!' : 'आज के तीनों पूरे!' }),
      el('span', { text: full ? 'A sticker for every day this week!' : "All three done today! Here's today's sticker." }),
    ]),
  ]);
  screen.append(party);
  api.sfx.cheer();
  api.sfx.feel?.('reward');
  await api.say(full ? 'weekDone' : 'dayDone');
  // the sticker flies to today's place on the trail
  const slot = screen.querySelector(`.trail-day[data-day="${day}"] .trail-sticker`);
  if (slot?.isConnected) {
    await flyTo(sticker, slot, { scale: 0.3, duration: 700 }).catch?.(() => {});
    slot.innerHTML = sticker.innerHTML;
    slot.parentNode.classList.add('got', 'just');
  }
  party.classList.add('gone');
  setTimeout(() => party.remove(), 400);
}

// ---------- placement check: which grade should we start in? ----------

export async function placement(api, { onPick } = {}) {
  const { content } = api.state;
  const answers = {};
  const mascot = createMascot('gappu', { size: 'small' });
  const stage = el('main', { class: 'stage' });
  const bar = el('div', { class: 'placement-dots' }, PLACEMENT_LEVELS.map(() => el('span', { class: 'dot' })));
  api.app.replaceChildren(
    el('div', { class: 'screen game placement enter' }, [
      backdrop(null),
      el('header', { class: 'game-head' }, [el('button', { class: 'round-btn home', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }), bar, el('span', { class: 'round-spacer' })]),
      stage,
      el('div', { class: 'mascot-corner' }, [mascot.node]),
    ]),
  );
  const token = api.state.token;
  const alive = () => token === api.state.token;
  await api.sayLines({ hi: 'चलो, एक छोटा सा खेल खेलें। जितना आता है, करो!', en: "Let's play a little game. Just do what you can!" });
  let result = null;
  for (const [li, level] of PLACEMENT_LEVELS.entries()) {
    let right = 0;
    for (const q of placementQuestions(level)) {
      if (!alive()) return;
      // shuffled, so the answer isn't always in the same place
      const shuffled = q.options.map((o) => [api.rng(), o]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
      const btns = shuffled.map((o) =>
        Object.assign(
          q.pictures ? api.wordCard(api.word(o), { showLabel: false }) : el('button', { class: 'card answer', lang: 'hi' }, [el('span', { class: 'word-text', text: o })]),
          { value: o },
        ),
      );
      stage.replaceChildren(
        ...[
          el('div', { class: 'quiz-question' }, [el('p', { class: 'quiz-q hi', lang: 'hi', text: q.ask.hi }), el('p', { class: 'quiz-q en', text: q.ask.en })]),
          q.show ? el('div', { class: 'quiz-sentence placement-word', lang: 'hi', text: q.show }) : null,
          el('div', { class: 'choices answers' }, btns),
        ].filter(Boolean),
      );
      api.sayLines(q.ask);
      // one tap per question: right or not, we move on (this is a check, not a lesson)
      const tapped = await new Promise((resolve) => btns.forEach((b) => b.addEventListener('click', () => resolve(b), { once: true })));
      api.sfx.pop();
      bounce(tapped);
      if (tapped.value === q.answer) right++;
      await sleep(350);
    }
    answers[level] = right;
    bar.children[li].classList.add(right === 2 ? 'good' : 'tried');
    result = placementResult(answers);
    if (result) break;
  }
  if (!alive()) return;
  const lv = content.levels.find((l) => l.id === result);
  const start = el('button', { class: 'bubble green big', text: `Start ${lv.name.en}`, onclick: () => onPick(lv) });
  stage.replaceChildren(
    el('div', { class: 'placement-result' }, [
      el('p', { class: 'rest-en', text: 'A good place to start:' }),
      levelCard(api, lv, true, () => onPick(lv)),
      el('p', { class: 'note', text: result === 'kg' ? 'Under 3? The Toddler stage is gentler: choose it in the list instead.' : 'You can change the grade any time in the parent area.' }),
      start,
    ]),
  );
  mascot.react('dance');
  api.sfx.jingle();
  api.sayLines({ hi: `शाबाश! चलो ${lv.name.hi} से शुरू करें।`, en: `Well done! Let's start with ${lv.name.en}.` });
}

export { MASCOTS };
