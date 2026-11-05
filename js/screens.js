// Screens outside a lesson: splash, onboarding, the world hub, a world's path map,
// results, the sticker collection and the story library.
import { el, sleep, bounce, animate, ICONS } from './ui.js';
import { createMascot, mascotSvg, MASCOTS, MASCOT_IDS } from './mascot.js';
import { sceneSvg } from './art-scenes.js';
import { PLACEMENT_LEVELS, placementQuestions, placementResult } from './placement.js';
import { picture, pictureForWord, specialVehicle } from './art.js';
import { worldLessons, lessonRecord, isUnlocked, currentLesson, nextLesson, worldStars, hubWorlds, streak, nextCollectible, todayPlan, storyLang, worldStoryLang } from './curriculum.js';
import { SHOW_ICONS } from './shows.js';

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
  return { math: { hi: 'गणित', en: 'Math' }, english: { hi: 'अंग्रेज़ी', en: 'English' } }[world.subject] || { hi: 'हिन्दी', en: 'Hindi' };
}

// What a world teaches, from content.json "tags": Phonics, Grammar, Stories, Math …
const tagsOf = (api, w) => (w.tags || []).map((id) => ({ id, ...(api.state.content.tags?.[id] || { hi: id, en: id }) }));
const tagChips = (api, w) => el('span', { class: 'tag-chips' }, tagsOf(api, w).map((t) => el('span', { class: 'tag-chip', style: { '--tag': t.color || '#6C63FF' }, text: t.en })));

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
  const start = () => {
    api.sfx.unlock();
    api.music.unlock();
    api.sfx.jingle();
    const r = api.homeRoute();
    api.go(r.name, r.params, { replace: true });
    if (r.name !== 'onboard') api.say('welcome');
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
  // the guides stand in staggered rows (6, 6, 6) like a class photo
  const third = Math.floor(MASCOT_IDS.length / 3);
  const rows = [MASCOT_IDS.slice(0, third), MASCOT_IDS.slice(third, MASCOT_IDS.length - third), MASCOT_IDS.slice(MASCOT_IDS.length - third)];
  let k = 0;
  const parade = el(
    'div',
    { class: 'parade' },
    rows.map((ids) => el('div', { class: 'parade-row' }, ids.map((id) => el('div', { class: 'parade-item', style: { animationDelay: `${k++ * 0.12}s` }, html: mascotSvg(id) })))),
  );
  api.app.replaceChildren(el('div', { class: 'screen splash enter' }, [backdrop(null), el('div', { class: 'sunburst', 'aria-hidden': 'true' }), parade, appTitle(api), who || btn]));
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

export function hub(api) {
  const { content, settings, progress } = api.state;
  const all = hubWorlds(content, settings);
  // a row of tags filters the worlds: "show me everything about Grammar"
  const filter = api.state.hubTag && all.some((w) => (w.tags || []).includes(api.state.hubTag)) ? api.state.hubTag : null;
  const worlds = filter ? all.filter((w) => (w.tags || []).includes(filter)) : all;
  const mine = worlds.filter((w) => w.level === settings.level);
  const others = worlds.filter((w) => w.level !== settings.level);
  const usedTags = Object.entries(content.tags || {}).filter(([id]) => all.some((w) => (w.tags || []).includes(id)));
  const tagBtn = (id, t) =>
    el('button', {
      class: `tag-filter${(filter || null) === id ? ' on' : ''}`,
      style: { '--tag': t?.color || '#6C63FF' },
      text: t ? t.en : 'All',
      onclick: () => {
        api.sfx.pop();
        api.state.hubTag = id;
        if (t) api.sayLines(t);
        hub(api);
      },
    });
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
        tagChips(api, world),
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
      api.go('world', { worldId: world.id });
    });
    return c;
  };

  const gate = parentGate(api);
  api.state.showRun = 0;
  // Show time and Story radio: watching and listening that still teaches (good for journeys)
  const showtime = (content.shows || []).length
    ? el('div', { class: 'showtime-row' }, [
        el('button', { class: 'showtime-btn tv', 'aria-label': 'Show time', onclick: () => (api.sfx.pop(), api.go('shows')) }, [el('span', { class: 'showtime-icon', html: SHOW_ICONS.tv }), el('span', { class: 'showtime-text' }, [el('b', { lang: 'hi', text: 'कार्टून' }), el('span', { text: 'Show time' })])]),
        el('button', { class: 'showtime-btn radio', 'aria-label': 'Story radio', onclick: () => (api.sfx.pop(), api.go('radio')) }, [el('span', { class: 'showtime-icon', html: SHOW_ICONS.radio }), el('span', { class: 'showtime-text' }, [el('b', { lang: 'hi', text: 'कहानी रेडियो' }), el('span', { text: 'Story radio' })])]),
      ])
    : null;
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
        filter ? null : todayCard(api, todayPlan(content, progress, all.filter((w) => w.level === settings.level))),
        filter ? null : showtime,
        usedTags.length > 1 ? el('div', { class: 'tag-filters', role: 'toolbar', 'aria-label': 'Show worlds about' }, [tagBtn(null, null), ...usedTags.map(([id, t]) => tagBtn(id, t))]) : null,
        mine.length ? el('h2', { class: 'hub-section', text: `${level(settings.level).name.en} · ${level(settings.level).name.hi}` }) : null,
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
        row.prepend(el('span', { class: 'node-start', 'aria-hidden': 'true' }, [el('span', { html: ICONS.play }), english(w) ? el('span', { text: 'Start' }) : el('span', { lang: 'hi', text: 'चलो!' })]));
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

  const head = el('header', { class: 'world-head' }, [
    el('button', { class: 'round-btn', 'aria-label': 'All worlds', html: ICONS.back, onclick: () => api.back() }),
    el('div', { class: 'world-title' }, [bigName(w, w.name, 'world-name-hi'), el('span', { class: 'world-name-en', text: [english(w) ? null : w.name.en, ...tagsOf(api, w).map((t) => t.en)].filter(Boolean).join(' · ') })]),
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
  const draw = () => drawTrail(path, walked);
  draw();
  if (typeof ResizeObserver === 'function') new ResizeObserver(draw).observe(path);
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
        praiseRibbon(world, result.stars),
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
  const stories = content.stories.filter((s) => levels.includes(s.level) && storyLang(s) === worldStoryLang(w));
  const books = stories.map((s) => {
    const read = lessonRecord(progress, `story:${s.id}`).stars > 0;
    const b = el('button', { class: `book ${read ? 'read' : ''} ${s.kind === 'poem' ? 'poem' : ''}`, 'aria-label': s.title.en }, [
      s.kind === 'poem' ? el('span', { class: 'poem-ribbon', text: s.lang === 'en' ? 'Rhyme' : 'कविता · Poem' }) : null,
      el('span', { class: 'book-cover', html: pictureForWord(api.word(s.cover)) }),
      // English rhymes lead with their English title
      s.lang === 'en' ? el('span', { class: 'book-title latin', text: s.title.en }) : el('span', { class: 'book-title', lang: 'hi', text: s.title.hi }),
      el('span', { class: 'book-title-en', lang: s.lang === 'en' ? 'hi' : 'en', text: s.lang === 'en' ? s.title.hi : s.title.en }),
      read ? el('span', { class: 'book-badge', html: ICONS.check }) : null,
    ]);
    b.addEventListener('click', () => {
      api.sfx.page();
      api.go('lesson', { worldId: w.id, storyId: s.id });
    });
    return b;
  });
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
      el('main', { class: 'shelf' }, books),
      el('div', { class: 'mascot-corner' }, [mascot.node]),
    ]),
  );
  setTimeout(() => mascot.react('wave'), 400);
  api.sayLines({ hi: `${guide.hi} के पुस्तकालय में स्वागत है! कौन सी कहानी पढ़ें?`, en: `Welcome to ${guide.en}'s library! Which story shall we read?` });
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
    onDone();
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

// ---------- break time: the daily limit was reached ----------

const OFFLINE_IDEAS = [
  { hi: 'बाहर जाकर खेलो!', en: 'Go and play outside!' },
  { hi: 'किसी के साथ एक असली किताब पढ़ो।', en: 'Read a real book with someone.' },
  { hi: 'आज जो सीखा, उसका चित्र बनाओ।', en: 'Draw a picture of what you learned today.' },
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
  api.app.replaceChildren(
    el('div', { class: 'screen rest-screen enter' }, [
      backdrop(api.state.world),
      el('div', { class: 'rest-card' }, [
        el('div', { class: 'rest-mascot' }, [mascot.node, el('span', { class: 'zzz', text: 'z z z' })]),
        el('h1', { lang: 'hi', text: 'आराम का समय!' }),
        el('p', { class: 'rest-en', text: `Time for a break! You played ${api.minutesToday()} minutes today.` }),
        el('p', { class: 'rest-idea', lang: 'hi', text: idea.hi }),
        el('p', { class: 'rest-en', text: idea.en }),
        el('div', { class: 'rest-actions' }, [el('button', { class: 'bubble green', 'aria-label': 'Home', html: ICONS.home, onclick: () => api.goHome() }), more]),
        el('p', { class: 'rest-note', text: 'Grown-ups: hold +10 for ten more minutes. The limit is in the parent area.' }),
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

export function todayCard(api, steps) {
  if (!steps.length) return null;
  const done = steps.filter((s) => s.done).length;
  return el('section', { class: 'today', 'aria-label': "Today's path" }, [
    el('div', { class: 'today-head' }, [el('b', { lang: 'hi', text: 'आज का सफ़र' }), el('span', { text: `Today · ${done} / ${steps.length}` })]),
    el(
      'div',
      { class: 'today-steps' },
      steps.map((s, i) => {
        const meta = STEP[s.kind];
        const b = el('button', { class: `today-step ${s.kind}${s.done ? ' done' : ''}`, style: { '--place': s.world.color }, 'aria-label': `${meta.en}: ${s.lesson.title.en}` }, [
          el('span', { class: 'today-icon', html: api.iconHtml(s.lesson.icon) }),
          el('span', { class: 'today-text' }, [el('b', { text: `${i + 1}. ${meta.en}` }), el('span', { class: 'today-lesson', text: s.lesson.title.en })]),
          el('span', { class: 'today-badge', html: s.done ? ICONS.check : ICONS[meta.icon] }),
        ]);
        b.addEventListener('click', () => {
          api.sfx.pop();
          bounce(b);
          api.go('lesson', { lessonId: s.lesson.id });
        });
        return b;
      }),
    ),
  ]);
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
