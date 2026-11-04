// Screens outside a lesson: splash, onboarding, the world hub, a world's path map,
// results, the sticker collection and the story library.
import { el, sleep, bounce, animate, ICONS } from './ui.js';
import { createMascot, mascotSvg, MASCOTS, MASCOT_IDS } from './mascot.js';
import { sceneSvg } from './art-scenes.js';
import { picture, pictureForWord, specialVehicle } from './art.js';
import { worldLessons, lessonRecord, isUnlocked, currentLesson, nextLesson, worldStars, hubWorlds, streak, nextCollectible } from './curriculum.js';

export function backdrop(world) {
  return el('div', { class: 'backdrop', html: sceneSvg(world?.theme || 'hub') });
}

function appTitle(api) {
  const t = api.state.content.phrases.title;
  return el('div', { class: 'title' }, [el('span', { class: 'title-hi', lang: 'hi', text: t.hi }), el('span', { class: 'title-en', text: t.en })]);
}

// English-only worlds (math) lead with English; Hindi worlds lead with Hindi.
const english = (w) => w.lang === 'en';
const bigName = (w, text, cls) => (english(w) ? el('span', { class: `${cls} latin`, text: text.en }) : el('span', { class: cls, lang: 'hi', text: text.hi }));

function subjectName(world) {
  return world.subject === 'math' ? { hi: 'गणित', en: 'Math' } : { hi: 'हिन्दी', en: 'Hindi' };
}

// Tap a mascot and it does something silly.
export function mascotJoke(api, mascot) {
  const lines = api.state.content.mascotLines || [];
  const line = lines[Math.floor(api.rng() * lines.length)];
  if (!line) return;
  mascot.react(line.move || 'silly');
  api.sfx[line.move === 'sneeze' ? 'sneeze' : line.move === 'spin' ? 'whoosh' : line.move === 'dance' ? 'jingle' : 'boing']?.();
  api.sayLines(line);
}

// ---------- splash ----------

export function splash(api) {
  const btn = el('button', { class: 'splash-play bubble green', 'aria-label': 'Play', html: ICONS.play });
  btn.addEventListener('click', () => {
    api.sfx.unlock();
    api.music.unlock();
    api.sfx.jingle();
    const r = api.homeRoute();
    api.go(r.name, r.params, { replace: true });
    if (r.name !== 'onboard') api.say('welcome');
  });
  const parade = el(
    'div',
    { class: 'parade' },
    MASCOT_IDS.map((id, i) => el('div', { class: 'parade-item', style: { animationDelay: `${i * 0.12}s` }, html: mascotSvg(id) })),
  );
  api.app.replaceChildren(el('div', { class: 'screen splash enter' }, [backdrop(null), parade, appTitle(api), btn]));
}

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

export function hub(api) {
  const { content, settings, progress } = api.state;
  const worlds = hubWorlds(content, settings);
  const mine = worlds.filter((w) => w.level === settings.level);
  const others = worlds.filter((w) => w.level !== settings.level);
  const level = (id) => content.levels.find((l) => l.id === id);
  const days = streak(progress.days, Date.now());

  const card = (world) => {
    const st = worldStars(progress, world);
    const sub = subjectName(world);
    const c = el('button', { class: `world-card theme-${world.theme}`, style: { '--place': world.color }, 'aria-label': `${world.name.en}, ${level(world.level).name.en}` }, [
      el('div', { class: 'world-card-scene', html: sceneSvg(world.theme, { crop: 'bottom' }) }),
      el('div', { class: 'world-card-mascot', html: mascotSvg(world.mascot) }),
      el('div', { class: 'world-card-text' }, [
        el('span', { class: 'chips' }, [el('span', { class: 'chip grade', text: level(world.level).name.en }), el('span', { class: `chip subject ${world.subject}`, text: `${sub.en} · ${sub.hi}` })]),
        bigName(world, world.name, 'world-name-hi'),
        el('span', { class: 'world-name-en', lang: english(world) ? 'hi' : 'en', text: english(world) ? world.name.hi : world.name.en }),
        el('span', { class: 'world-stars' }, [el('span', { class: 'star-icon', html: ICONS.star }), el('span', { text: `${st.got} / ${st.max}` })]),
      ]),
    ]);
    c.addEventListener('click', async () => {
      api.sfx.pop();
      bounce(c);
      api.sayLines(world.name);
      await sleep(250);
      api.go('world', { worldId: world.id });
    });
    return c;
  };

  const gate = parentGate(api);
  api.app.replaceChildren(
    el('div', { class: 'screen hub enter' }, [
      backdrop(null),
      el('header', { class: 'hub-head' }, [
        appTitle(api),
        el('div', { class: 'head-right' }, [
          days ? el('span', { class: 'streak-chip', 'aria-label': `${days} day streak` }, [el('span', { class: 'sun-icon', html: ICONS.sun }), el('b', { text: String(days) })]) : null,
          gate,
        ]),
      ]),
      el('div', { class: 'hub-scroll' }, [
        el('h2', { class: 'hub-section', text: `${level(settings.level).name.en} · ${level(settings.level).name.hi}` }),
        el('div', { class: 'world-cards' }, mine.map(card)),
        others.length ? el('h2', { class: 'hub-section', text: 'More worlds · और दुनिया' }) : null,
        others.length ? el('div', { class: 'world-cards' }, others.map(card)) : null,
      ]),
    ]),
  );
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
      const node = el('button', { class: `node ${cls}`, 'aria-label': `${lesson.title.en}${open ? '' : ' (locked)'}` }, [
        el('span', { class: 'node-icon', html: api.iconHtml(lesson.icon) }),
        !open ? el('span', { class: 'node-lock', html: ICONS.lock }) : null,
      ]);
      const stars = el(
        'span',
        { class: 'node-stars' },
        [0, 1, 2].map((k) => el('span', { class: `mini-star ${k < rec.stars ? 'on' : ''}`, html: ICONS.star })),
      );
      const x = SNAKE[i % SNAKE.length];
      const row = el('div', { class: `node-row ${cls} ${x > 0 ? 'guide-left' : ''}`, style: { '--x': String(x) } }, [
        node,
        el('span', { class: 'node-title' }, english(w) ? [el('span', { class: 'latin', text: lesson.title.en })] : [el('span', { lang: 'hi', text: lesson.title.hi }), el('span', { class: 'en', text: lesson.title.en })]),
        stars,
      ]);
      node.addEventListener('click', () => {
        if (!open) {
          api.sfx.boing();
          animate(node, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
          return;
        }
        api.sfx.pop();
        api.go('lesson', { lessonId: lesson.id });
      });
      if (isCurrent) {
        currentNode = row;
        row.append(el('div', { class: 'node-guide' }, [mascot.node]));
      }
      return row;
    });
    const done = unit.lessons.every((l) => lessonRecord(progress, l.id).stars > 0);
    const banner = el('button', { class: `unit-banner ${done ? 'done' : ''}`, 'aria-label': unit.title.en }, [
      el('span', { class: 'unit-icon', html: api.iconHtml(unit.icon) }),
      el('span', { class: 'unit-text' }, [
        el('span', { class: 'unit-skill', text: `Unit ${ui + 1} · ${unit.skill}` }),
        bigName(w, unit.title, 'unit-title-hi'),
        english(w) ? null : el('span', { class: 'unit-title-en', text: unit.title.en }),
      ]),
      done ? el('span', { class: 'unit-trophy', html: ICONS.trophy }) : null,
    ]);
    banner.addEventListener('click', () => api.sayLines(unit.title));
    return el('section', { class: 'unit' }, [banner, el('div', { class: 'nodes' }, rows)]);
  });

  const canLeave = !settings.lockGrade;
  const head = el('header', { class: 'world-head' }, [
    canLeave ? el('button', { class: 'round-btn', 'aria-label': 'All worlds', html: ICONS.back, onclick: () => api.back() }) : parentGate(api),
    el('div', { class: 'world-title' }, [bigName(w, w.name, 'world-name-hi'), el('span', { class: 'world-name-en', text: english(w) ? `${subjectName(w).en} · in English` : `${w.name.en} · ${subjectName(w).en}` })]),
    el('span', { class: 'star-chip' }, [el('span', { class: 'star-icon', html: ICONS.star }), el('b', { text: String(st.got) })]),
    el('button', { class: 'round-btn small', 'aria-label': 'My collection', html: ICONS.album, onclick: () => api.go('collection', { worldId: w.id }) }),
    w.subject === 'hindi' && api.state.content.stories.some((s) => storyLevels(api, w).includes(s.level))
      ? el('button', { class: 'round-btn small', 'aria-label': 'Story library', html: ICONS.book, onclick: () => api.go('library', { worldId: w.id }) })
      : null,
  ]);
  const path = el('div', { class: 'path' }, units);
  api.app.replaceChildren(
    el('div', { class: `screen world-map theme-${w.theme} enter`, style: { '--place': w.color } }, [backdrop(w), head, el('div', { class: 'path-scroll' }, [path])]),
  );
  requestAnimationFrame(() => currentNode?.scrollIntoView({ block: 'center' }));
  const unit = w.units.find((u) => u.lessons.some((l) => l.id === current.id));
  setTimeout(() => {
    mascot.react('wave');
    api.sayLines(unit.title);
  }, 500);
}

function storyLevels(api, w) {
  const order = api.state.content.levels.map((l) => l.id);
  const i = order.indexOf(w.level);
  return order.slice(Math.max(0, i - 1), i + 1);
}

// ---------- results ----------

export async function results(api, { world, lesson, result, collection }) {
  const mascot = createMascot(world.mascot, { size: 'large', onTap: () => mascotJoke(api, mascot) });
  const stars = el(
    'div',
    { class: 'result-stars' },
    [0, 1, 2].map(() => el('span', { class: 'big-star-slot', html: ICONS.star })),
  );
  const next = nextLesson(world, lesson.id);
  const isStory = lesson.id.startsWith('story:');
  const btns = el('div', { class: 'result-buttons' }, [
    el('button', { class: 'bubble ghost', 'aria-label': 'Back to the map', html: ICONS.map, onclick: () => api.back() }),
    el('button', { class: 'bubble ghost', 'aria-label': 'Play again', html: ICONS.replay, onclick: () => api.go('lesson', isStory ? { worldId: world.id, storyId: lesson.config.story } : { lessonId: lesson.id }, { replace: true }) }),
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
      el('div', { class: 'result-card' }, [
        el('div', { class: 'result-mascot' }, [mascot.node]),
        stars,
        result.unitComplete ? el('div', { class: 'unit-complete' }, [el('span', { html: ICONS.trophy }), el('span', { text: 'Unit complete!' })]) : null,
        reward,
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
  if (result.unitComplete && token === api.state.token) api.say('unitDone');
}

// ---------- collection ----------

export function collection(api, w) {
  const { content, progress } = api.state;
  const col = content.collections[w.collection];
  const have = new Set(progress.collected[w.collection] || []);
  const cards = [];
  if (w.collection === 'vehicles' && api.state.special) {
    const c = el('button', { class: 'card sticker special', 'aria-label': 'special vehicle', html: specialVehicle(api.state.special) });
    c.addEventListener('click', () => {
      api.sfx.vroom();
      bounce(c);
      api.say('special');
    });
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
      api.sayAbout(w0);
    });
    cards.push(c);
  }
  const next = nextCollectible(progress, { id: w.collection, ...col });
  api.app.replaceChildren(
    el('div', { class: `screen collection theme-${w.theme} enter`, style: { '--place': w.color } }, [
      backdrop(w),
      el('header', { class: 'game-head' }, [
        el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
        el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: col.name.hi }), el('span', { class: 'world-name-en', text: `${have.size} / ${col.items.length} · ${col.name.en}` })]),
        el('span', { class: 'round-spacer' }),
      ]),
      el('main', { class: 'sticker-grid' }, cards),
      next ? el('p', { class: 'collection-hint', text: 'Finish lessons to find more! · पाठ पूरे करो, और दोस्त पाओ!' }) : null,
    ]),
  );
  api.sayLines(col.name);
}

// ---------- story library ----------

export function library(api, w) {
  const { content, progress } = api.state;
  const levels = storyLevels(api, w);
  const stories = content.stories.filter((s) => levels.includes(s.level));
  const books = stories.map((s) => {
    const read = lessonRecord(progress, `story:${s.id}`).stars > 0;
    const b = el('button', { class: `book ${read ? 'read' : ''}`, 'aria-label': s.title.en }, [
      el('span', { class: 'book-cover', html: pictureForWord(api.word(s.cover)) }),
      el('span', { class: 'book-title', lang: 'hi', text: s.title.hi }),
      el('span', { class: 'book-title-en', text: s.title.en }),
      read ? el('span', { class: 'book-badge', html: ICONS.check }) : null,
    ]);
    b.addEventListener('click', () => {
      api.sfx.page();
      api.go('lesson', { worldId: w.id, storyId: s.id });
    });
    return b;
  });
  api.app.replaceChildren(
    el('div', { class: `screen library theme-${w.theme} enter`, style: { '--place': w.color } }, [
      backdrop(w),
      el('header', { class: 'game-head' }, [
        el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
        el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: 'कहानियाँ' }), el('span', { class: 'world-name-en', text: `Story library · ${stories.length} books` })]),
        el('span', { class: 'round-spacer' }),
      ]),
      el('main', { class: 'shelf' }, books),
    ]),
  );
  api.sayLines({ hi: 'कौन सी कहानी पढ़ें?', en: 'Which story shall we read?' });
}

// ---------- parent gate: hold for 3 seconds ----------

export function parentGate(api) {
  const btn = el('button', { class: 'gate', 'aria-label': 'Grown-ups: press and hold for 3 seconds', html: ICONS.gear });
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
      api.go('parent');
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

export { MASCOTS };
