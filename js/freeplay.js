// Free play between lessons (docs/ROADMAP.md 7.14): a little sandbox with no right answer, offered on the
// results screen after every two lessons. Every world can colour a picture of something just earned;
// Vehicle Town also lets a child drive around the town, and the farm lets them feed the animals.
// Nothing is scored or saved: it's the pause between lessons.
import { el, bounce, sparkleAt, ICONS } from './ui.js';
import { sceneSvg } from './art-scenes.js';
import { pictureForWord } from './art.js';
import { backdrop } from './screens.js';

export const FREEPLAY_EVERY = 2; // lessons between offers
// the grades that get it (older readers have their comics and quizzes)
export const FREEPLAY_LEVELS = ['toddler', 'kg', 'grade1', 'grade2', 'grade3', 'grade4'];
// is it time to offer free play, after `lessonsThisSession` lessons in a world of `level`?
export const freeplayDue = (level, lessonsThisSession) => FREEPLAY_LEVELS.includes(level) && lessonsThisSession > 0 && lessonsThisSession % FREEPLAY_EVERY === 0;
// which sandboxes a world has (colouring is everywhere)
export const freeplayModes = (world) => [...(world.collection === 'vehicles' ? ['drive'] : []), ...(world.id === 'farm' ? ['feed'] : []), 'colour'];

export const PALETTE = ['#FF5A5F', '#FF9F43', '#FFD43B', '#2EC27E', '#3D7BFF', '#A66BFF', '#FF8FB1', '#8A5A44', '#2B2D42', '#FFFFFF'];
// the farm's animals and what each likes best (any food can be offered: there's no wrong answer)
export const FARM_FOOD = ['grass', 'carrot', 'grain', 'banana', 'leaf', 'roti'];
export const FARM_LIKES = { cow: ['grass', 'roti'], goat: ['leaf', 'grass'], rabbit: ['carrot'], hen: ['grain'], horse: ['carrot', 'grass'], duck: ['grain'] };

const SHAPES = 'path,rect,circle,ellipse,polygon,polyline,line';

// A picture made into a colouring page: every shape white with a grey outline, ready to fill.
export function colouringSvg(svgText) {
  return svgText.replace(/<(path|rect|circle|ellipse|polygon|polyline|line)\b([^>]*?)(\/?)>/g, (m, tag, attrs, close) => {
    const noFill = /fill="none"/.test(attrs);
    const clean = attrs.replace(/\s(fill|stroke|stroke-width|opacity)="[^"]*"/g, '');
    return noFill ? `<${tag}${clean} fill="none" stroke="#B8C2D1" stroke-width="3" data-line="1"${close}>` : `<${tag}${clean} fill="#FFFFFF" stroke="#B8C2D1" stroke-width="1.6" vector-effect="non-scaling-stroke"${close}>`;
  });
}

export function freeplay(api, world, mode = freeplayModes(world)[0]) {
  const modes = freeplayModes(world);
  const tab = (m) => {
    const name = { colour: { hi: 'रंग भरो', en: 'Colour' }, drive: { hi: 'गाड़ी चलाओ', en: 'Drive' }, feed: { hi: 'खाना खिलाओ', en: 'Feed' } }[m];
    return el('button', { class: `freeplay-tab${m === mode ? ' on' : ''}`, 'aria-pressed': String(m === mode), onclick: () => (api.sfx.pop(), freeplay(api, world, m)) }, [el('b', { lang: 'hi', text: name.hi }), el('small', { text: name.en })]);
  };
  const body = mode === 'drive' ? drive(api, world) : mode === 'feed' ? feed(api) : colour(api, world);
  api.app.replaceChildren(
    el('div', { class: `screen freeplay ${mode} theme-${world.theme} enter`, style: { '--place': world.color } }, [
      backdrop(world),
      el('header', { class: 'game-head' }, [
        el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: () => api.back() }),
        el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: 'खेल का समय!' }), el('span', { class: 'world-name-en', text: 'Free play' })]),
        el('span', { class: 'round-spacer' }),
      ]),
      modes.length > 1 ? el('div', { class: 'freeplay-tabs', role: 'tablist' }, modes.map(tab)) : null,
      body,
    ]),
  );
  api.say(mode === 'drive' ? 'driveIt' : mode === 'feed' ? 'feedIt' : 'colourIt');
}

// ---- colour a picture of something just earned ----
function colour(api, world) {
  const { progress, content } = api.state;
  const col = content.collections[world.collection];
  const have = progress.collected[world.collection] || [];
  // the latest stickers first (what was "just learned"), then the rest of the collection
  const ids = [...new Set([...have.slice().reverse(), ...col.items])].filter((id) => api.word(id)).slice(0, 8);
  let colourNow = PALETTE[0];
  const page = el('div', { class: 'colour-page' });
  const show = (id) => {
    page.innerHTML = colouringSvg(pictureForWord(api.word(id)));
    api.sayItem(api.word(id));
  };
  page.addEventListener('pointerdown', (e) => {
    const t = e.target.closest(SHAPES);
    if (!t || !page.contains(t)) return;
    if (t.dataset.line) t.setAttribute('stroke', colourNow);
    else t.setAttribute('fill', colourNow);
    api.sfx.pop();
  });
  const swatches = PALETTE.map((c, i) => {
    const b = el('button', { class: `swatch${i === 0 ? ' on' : ''}`, style: { '--c': c }, 'aria-label': `colour ${i + 1}` });
    b.addEventListener('click', () => {
      colourNow = c;
      for (const s of swatches) s.classList.toggle('on', s === b);
      bounce(b);
    });
    return b;
  });
  const pickers = ids.map((id) => {
    const b = el('button', { class: 'colour-pick', html: pictureForWord(api.word(id)), 'aria-label': api.word(id).en });
    b.addEventListener('click', () => (api.sfx.pop(), show(id)));
    return b;
  });
  const clear = el('button', { class: 'bubble ghost small', 'aria-label': 'Start again', html: ICONS.replay, onclick: () => show(page.dataset.id || ids[0]) });
  page.dataset.id = ids[0];
  show(ids[0]);
  pickers.forEach((b, i) => b.addEventListener('click', () => (page.dataset.id = ids[i])));
  return el('main', { class: 'freeplay-main' }, [page, el('div', { class: 'palette' }, [...swatches, clear]), el('div', { class: 'colour-picks' }, pickers)]);
}

// ---- drive around Vehicle Town ----
function drive(api, world) {
  const { progress } = api.state;
  const have = progress.collected[world.collection] || [];
  const vehicles = [...new Set(['car', 'bus', ...have])].filter((id) => api.word(id)).slice(0, 8);
  let id = vehicles[0];
  const road = el('div', { class: 'drive-road', html: sceneSvg('town') });
  const car = el('div', { class: 'drive-car', html: api.vehicleArt(id) });
  road.append(car);
  let pos = { x: 50, y: 82 };
  let target = { ...pos };
  let facing = 1;
  let raf = 0;
  const place = () => {
    car.style.left = `${pos.x}%`;
    car.style.top = `${pos.y}%`;
    car.style.setProperty('--face', String(facing));
  };
  const step = () => {
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    if (Math.abs(dx) > 0.3) facing = dx > 0 ? 1 : -1;
    pos = { x: pos.x + dx * 0.12, y: pos.y + dy * 0.12 };
    place();
    raf = Math.abs(dx) + Math.abs(dy) > 0.2 && road.isConnected ? requestAnimationFrame(step) : 0;
  };
  const go = (e) => {
    const r = road.getBoundingClientRect();
    target = { x: Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100)), y: Math.max(12, Math.min(94, ((e.clientY - r.top) / r.height) * 100)) };
    if (!raf) raf = requestAnimationFrame(step);
  };
  road.addEventListener('pointerdown', (e) => {
    road.setPointerCapture(e.pointerId);
    go(e);
    api.sfx.vroom?.();
  });
  road.addEventListener('pointermove', (e) => e.buttons && go(e));
  place();
  const honk = el('button', { class: 'bubble green honk', 'aria-label': 'Horn' }, [el('span', { lang: 'hi', text: 'पीं-पीं!' })]);
  honk.addEventListener('click', () => {
    api.sfx.toot?.();
    bounce(car);
  });
  const picks = vehicles.map((v) => {
    const b = el('button', { class: `colour-pick${v === id ? ' on' : ''}`, html: api.vehicleArt(v), 'aria-label': api.word(v).en });
    b.addEventListener('click', () => {
      id = v;
      car.innerHTML = api.vehicleArt(v);
      for (const x of picks) x.classList.toggle('on', x === b);
      api.sayItem(api.word(v));
      bounce(car);
    });
    return b;
  });
  return el('main', { class: 'freeplay-main' }, [road, el('div', { class: 'drive-controls' }, [honk]), el('div', { class: 'colour-picks' }, picks)]);
}

// ---- feed the farm animals ----
function feed(api) {
  const animals = Object.keys(FARM_LIKES).map((id) => api.word(id)).filter(Boolean);
  const foods = FARM_FOOD.map((id) => api.word(id)).filter(Boolean);
  let holding = null;
  const pen = el('div', { class: 'feed-pen' });
  const tray = el('div', { class: 'feed-tray' });
  const lift = (b, f) => {
    holding = f;
    for (const x of tray.children) x.classList.toggle('lifted', x === b);
    api.sayItem(f);
  };
  const give = async (a, card) => {
    if (!holding) {
      bounce(card);
      return api.saySound(a);
    }
    const f = holding;
    holding = null;
    for (const x of tray.children) x.classList.remove('lifted');
    const likes = FARM_LIKES[a.id]?.includes(f.id);
    card.classList.remove('yum', 'nope');
    void card.offsetWidth;
    card.classList.add(likes ? 'yum' : 'nope');
    if (likes) {
      sparkleAt(card, { count: 10, colors: ['#FF5A7A', '#FF8FB1', '#FFC93C'] });
      api.sfx.chime?.();
      await api.say('yum');
      if (a.sound) api.saySound(a);
    } else {
      api.sfx.boing?.();
      api.say('noThanks');
    }
  };
  for (const a of animals) {
    const card = el('button', { class: 'feed-animal', html: pictureForWord(a), 'aria-label': a.en });
    card.addEventListener('click', () => give(a, card));
    pen.append(card);
  }
  for (const f of foods) {
    const b = el('button', { class: 'feed-food', html: pictureForWord(f), 'aria-label': f.en });
    b.addEventListener('click', () => (api.sfx.pop(), lift(b, f)));
    tray.append(b);
  }
  return el('main', { class: 'freeplay-main' }, [pen, el('p', { class: 'feed-help' }, [el('span', { lang: 'hi', text: 'खाना चुनो, फिर जानवर पर टैप करो' }), el('small', { text: 'Pick some food, then tap an animal' })]), tray]);
}
