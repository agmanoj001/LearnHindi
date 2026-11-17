// Maths you do with your hands (docs/ROADMAP.md 10.1). Not answer cards: the child fills a ten-frame,
// hops a frog along a number line, adds blocks to a balance until it is level, pays with coins, builds a
// pattern train, turns a clock's hands, builds a shape from pieces, and lays cubes along a snake. Each round
// ends when the child presses ✓ with the thing made right; a wrong ✓ says what is there now and what is
// wanted, and two of them (or the 💡) show the next step. Young children learn number by moving things.
// A lesson names its activity: { "activity": "tenframe", "rounds": 5 }.
import { el, sleep, runRounds, cheer, bounce, wobble, flyTo, ICONS, stepHint } from './kit.js';
import { mathModel } from '../art-math.js';
import { shuffle } from '../logic.js';

export const ACTIVITIES = ['tenframe', 'numberline', 'pattern', 'shapes', 'measure', 'balance', 'shop', 'clock', 'bonds', 'jumps', 'array'];
// the skill each records (js/mathgen.js), so the grown-ups' area shows it with the others
export const ACTIVITY_SKILL = { tenframe: 'k-make10', numberline: 'k-add', pattern: 'k-pattern', shapes: 'g1-compose', measure: 'g1-units', balance: 'g1-equal', shop: 'g1-coins', clock: 'g1-time', bonds: 'k-bond10', jumps: 'g2-add100', array: 'g2-arrays' };

const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const pick = (rng, xs) => xs[Math.floor(rng() * xs.length)];
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

// ---- the frame every activity shares: what to do, the thing to work on, and the ✓ ----
function board(ctx, ask, cls) {
  const askEl = el('p', { class: 'math-ask hands-ask', text: ask });
  const work = el('div', { class: `hands-work ${cls}` });
  const tools = el('div', { class: 'hands-tools' });
  const check = el('button', { class: 'bubble green big hands-check', 'aria-label': 'Check', html: ICONS.check });
  ctx.stage.replaceChildren(el('div', { class: 'hands-board' }, [askEl, work]), el('div', { class: 'hands-bar' }, [tools, check]));
  const say = () => ctx.sayText(ask, 'en');
  ctx.setRepeat(say);
  say();
  return { work, tools, check, askEl };
}
// wait for a ✓ that finds the thing made right. `isRight()` -> true, or what to say about it now.
// Returns whether it was right the first time, with no hint.
function untilRight(ctx, check, isRight, hint) {
  return new Promise((resolve) => {
    let wrong = 0;
    check.addEventListener('click', async () => {
      const r = isRight();
      if (r === true) {
        hint.done();
        resolve(wrong === 0 && hint.used === 0);
        return;
      }
      wrong++;
      wobble(check);
      ctx.miss?.();
      hint.miss();
      if (r) ctx.sayText(r, 'en');
    });
  });
}
const toolBtn = (label, cls, aria) => el('button', { class: `bubble hands-tool ${cls}`, 'aria-label': aria || label, text: label });

// ---------- 1. fill the ten-frame (NC.K.OA.4, NC.K.CC.5) ----------
async function tenframe(ctx) {
  const t = ctx.tier;
  const start = t === 2 ? int(ctx.rng, 3, 8) : 0;
  const target = t === 2 ? 10 : t === 1 ? int(ctx.rng, 5, 10) : int(ctx.rng, 1, 5);
  const ask = t === 2 ? `There are ${start}. Fill the frame to make 10.` : `Put ${target} counters in the ten-frame.`;
  const { work, tools, check } = board(ctx, ask, 'hands-tenframe');
  const count = el('b', { class: 'hands-count', text: String(start) });
  const cells = Array.from({ length: 10 }, (_, i) => {
    const c = el('button', { class: `tf-cell${i < start ? ' on given' : ''}`, 'aria-label': `Box ${i + 1}` });
    c.addEventListener('click', () => {
      if (c.classList.contains('given')) return bounce(c);
      c.classList.toggle('on');
      ctx.sfx.pop();
      const n = cells.filter((x) => x.classList.contains('on')).length;
      count.textContent = String(n);
      if (c.classList.contains('on')) ctx.sayText(String(n), 'en');
      hint.step();
    });
    return c;
  });
  work.append(el('div', { class: 'tf-frame' }, cells), el('p', { class: 'hands-readout' }, [count, el('span', { text: ' in the frame' })]));
  tools.append(el('span', { class: 'hands-help', text: 'Tap a box to put a counter in, or take it out.' }));
  const n = () => cells.filter((x) => x.classList.contains('on')).length;
  const hint = stepHint(ctx, () => (n() < target ? cells.find((c) => !c.classList.contains('on')) : n() > target ? cells.filter((c) => c.classList.contains('on') && !c.classList.contains('given')).at(-1) : check), { coach: 'each' });
  const first = await untilRight(ctx, check, () => (n() === target ? true : `You have ${n()}. ${t === 2 ? 'Make 10' : `Make ${target}`}.`), hint);
  return { first, explain: t === 2 ? `${start} and ${10 - start} make 10!` : `${target}! ${WORDS[target] ? `${WORDS[target][0].toUpperCase()}${WORDS[target].slice(1)} counters.` : ''}`, node: work };
}

// ---------- 2. hop the frog along the number line (NC.K.OA.2, NC.K.OA.5) ----------
async function numberline(ctx) {
  const t = ctx.tier;
  const back = t === 2 && ctx.rng() < 0.5;
  const b = int(ctx.rng, 1, t === 0 ? 3 : 5);
  const a = back ? int(ctx.rng, b + 1, 10) : int(ctx.rng, 0, 10 - b);
  const answer = back ? a - b : a + b;
  const ask = back ? `The frog is on ${a}. Hop back ${b}. Where does it land?` : `The frog is on ${a}. Hop ${b} more. Where does it land?`;
  const { work, tools, check } = board(ctx, ask, 'hands-line');
  const eq = el('p', { class: 'math-eq' }, [`${a} ${back ? '−' : '+'} ${b} = `, el('span', { class: 'gap', text: '?' })]);
  const X = (n) => 20 + n * 36; // 0..10 across 400
  let at = a;
  let hops = 0;
  const arcs = el('div', { class: 'nl-arcs' });
  const frog = el('div', { class: 'nl-frog', html: ctx.picture(ctx.word('frog')) });
  const ticks = Array.from({ length: 11 }, (_, n) => `<line x1="${X(n)}" y1="40" x2="${X(n)}" y2="56" stroke="#2B2D42" stroke-width="3"/><text x="${X(n)}" y="80" text-anchor="middle" font-size="20" font-weight="800" fill="#2B2D42">${n}</text>`).join('');
  const line = el('div', { class: 'nl-line', html: `<svg viewBox="0 0 400 90" aria-hidden="true"><line x1="10" y1="48" x2="390" y2="48" stroke="#2B2D42" stroke-width="4" stroke-linecap="round"/>${ticks}<circle cx="${X(a)}" cy="48" r="9" fill="#FFC93C" stroke="#2B2D42" stroke-width="2.5"/></svg>` }, [arcs, frog]);
  const place = () => {
    frog.style.left = `${(X(at) / 400) * 100}%`;
    arcs.replaceChildren(...Array.from({ length: hops }, (_, k) => el('i', { class: 'nl-arc', style: { left: `${(X(back ? a - k - 1 : a + k) / 400) * 100}%`, width: `${(36 / 400) * 100}%` } })));
  };
  place();
  const hopBtn = toolBtn(back ? '⬅ Hop back' : 'Hop ➡', 'hop', back ? 'Hop back' : 'Hop');
  const undo = toolBtn('↩', 'undo', 'Undo a hop');
  hopBtn.addEventListener('click', () => {
    const next = back ? at - 1 : at + 1;
    if (next < 0 || next > 10) return wobble(hopBtn);
    at = next;
    hops++;
    place();
    frog.classList.remove('jump');
    void frog.offsetWidth;
    frog.classList.add('jump');
    ctx.sfx.boing?.();
    ctx.sayText(String(at), 'en');
    hint.step();
  });
  undo.addEventListener('click', () => {
    if (!hops) return wobble(undo);
    at += back ? 1 : -1;
    hops--;
    place();
    ctx.sfx.pop();
  });
  tools.append(undo, hopBtn);
  work.append(eq, line);
  const hint = stepHint(ctx, () => (hops < b ? hopBtn : hops > b ? undo : check), { coach: 'order' });
  const first = await untilRight(ctx, check, () => (at === answer ? true : `The frog hopped ${hops} ${hops === 1 ? 'time' : 'times'}. Hop ${b}.`), hint);
  eq.querySelector('.gap').textContent = String(answer);
  eq.classList.add('done');
  return { first, explain: `${a} ${back ? 'take away' : 'plus'} ${b} is ${answer}!`, node: frog };
}

// ---------- 3. the pattern train ----------
const PATTERN_PICS = ['apple', 'duck', 'balloon', 'car', 'fish', 'star', 'heart', 'ball'];
async function pattern(ctx) {
  const t = ctx.tier;
  const units = t === 0 ? ['AB'] : t === 1 ? ['AAB', 'ABB'] : ['ABC', 'AABB'];
  const unit = pick(ctx.rng, units);
  const kinds = [...new Set(unit)];
  const pics = [...PATTERN_PICS].sort(() => ctx.rng() - 0.5).slice(0, kinds.length + 1);
  const of = (ch) => pics[kinds.indexOf(ch)];
  const length = unit.length * (t === 2 ? 2 : 3);
  const seq = Array.from({ length }, (_, i) => of(unit[i % unit.length]));
  const blanks = t === 2 ? 3 : 2;
  const ask = 'What comes next on the train? Fill the empty cars.';
  const { work, tools, check } = board(ctx, ask, 'hands-pattern');
  check.hidden = true; // the train fills car by car; it is done when it is full
  const name = (id) => ctx.word(id)?.en || id;
  const cars = seq.map((p, i) => {
    const empty = i >= length - blanks;
    return el('div', { class: `pt-car${empty ? ' empty' : ''}`, 'data-want': p, html: empty ? '' : ctx.picture(ctx.word(p)) });
  });
  work.append(el('div', { class: 'pt-train', style: { '--n': String(cars.length) } }, [el('div', { class: 'pt-engine', 'aria-hidden': 'true', html: ctx.picture(ctx.word('train')) }), ...cars]));
  const nextCar = () => cars.find((c) => c.classList.contains('empty'));
  let wrong = 0;
  const tray = pics.map((p) => {
    const b = el('button', { class: 'card pt-piece', 'aria-label': name(p), html: ctx.picture(ctx.word(p)) });
    b.pic = p;
    return b;
  });
  tools.append(el('div', { class: 'pt-tray' }, tray));
  const hint = stepHint(ctx, () => tray.find((b) => b.pic === nextCar()?.dataset.want), { coach: 'order' });
  const first = await new Promise((resolve) => {
    for (const b of tray)
      b.addEventListener('click', async () => {
        const car = nextCar();
        if (!car) return;
        if (b.pic !== car.dataset.want) {
          wrong++;
          wobble(b);
          ctx.miss?.();
          hint.miss();
          ctx.sayText(`Look at the train: ${seq.slice(0, unit.length).map(name).join(', ')}…`, 'en');
          return;
        }
        hint.step();
        const ghost = el('div', { class: 'pt-fly', html: b.innerHTML });
        document.body.append(ghost);
        const r = b.getBoundingClientRect();
        Object.assign(ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
        await flyTo(ghost, car, { duration: 380, keep: false });
        ghost.remove();
        car.classList.remove('empty');
        car.innerHTML = b.innerHTML;
        bounce(car);
        ctx.sfx.pop();
        ctx.sayText(name(b.pic), 'en');
        if (!nextCar()) {
          hint.done();
          resolve(wrong === 0 && hint.used === 0);
        }
      });
  });
  return { first, explain: `${seq.slice(0, unit.length * 2).map(name).join(', ')}. The pattern goes on!`, node: cars.at(-1) };
}

// ---------- 4. build a shape from pieces (NC.K.G.6, NC.1.G.2) ----------
const tri = (pts) => ({ shape: 'triangle', pts });
const sq = (x, y, w, h, shape = 'square') => ({ shape, pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] });
const circ = (cx, cy, r) => ({ shape: 'circle', cx, cy, r });
export const DESIGNS = [
  { id: 'square', name: 'a square', tier: 0, slots: [tri([[50, 20], [150, 20], [50, 120]]), tri([[150, 20], [150, 120], [50, 120]])], say: 'Two triangles make a square!' },
  { id: 'rectangle', name: 'a rectangle', tier: 0, slots: [sq(20, 30, 80, 80), sq(100, 30, 80, 80)], say: 'Two squares make a rectangle!' },
  { id: 'house', name: 'a house', tier: 0, slots: [sq(55, 70, 90, 70), tri([[45, 70], [155, 70], [100, 18]])], say: 'A square and a triangle make a house!' },
  { id: 'tree', name: 'a tree', tier: 1, slots: [tri([[100, 8], [165, 100], [35, 100]]), sq(86, 100, 28, 44, 'rectangle')], say: 'A triangle and a rectangle make a tree!' },
  { id: 'car', name: 'a car', tier: 1, slots: [sq(25, 62, 150, 46, 'rectangle'), sq(65, 22, 56, 40), circ(62, 116, 17), circ(138, 116, 17)], say: 'A rectangle, a square and two circles make a car!' },
  { id: 'rocket', name: 'a rocket', tier: 2, slots: [sq(78, 50, 44, 84, 'rectangle'), tri([[78, 50], [122, 50], [100, 8]]), tri([[78, 104], [78, 140], [52, 140]]), tri([[122, 104], [122, 140], [148, 140]])], say: 'A rectangle and three triangles make a rocket!' },
];
const PIECE_COLORS = { triangle: '#FF8A3D', square: '#3D7BFF', rectangle: '#2EC27E', circle: '#A66BFF' };
const slotSvg = (s, filled) => {
  const style = filled ? `fill="${PIECE_COLORS[s.shape]}" stroke="#2B2D42" stroke-width="3"` : 'fill="rgba(255,255,255,0.6)" stroke="#6B7090" stroke-width="3" stroke-dasharray="8 6"';
  return s.shape === 'circle' ? `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" ${style} stroke-linejoin="round"/>` : `<polygon points="${s.pts.map((p) => p.join(',')).join(' ')}" ${style} stroke-linejoin="round"/>`;
};
const pieceIcon = (shape) =>
  `<svg viewBox="0 0 60 60" aria-hidden="true">${
    { triangle: '<polygon points="8,52 52,52 8,8"', square: '<rect x="10" y="10" width="40" height="40"', rectangle: '<rect x="4" y="18" width="52" height="24"', circle: '<circle cx="30" cy="30" r="22"' }[shape]
  } fill="${PIECE_COLORS[shape]}" stroke="#2B2D42" stroke-width="3" stroke-linejoin="round"/></svg>`;
async function shapes(ctx) {
  const t = ctx.tier;
  const d = pick(ctx.rng, DESIGNS.filter((x) => x.tier <= t && x.tier >= t - 1));
  const ask = `Build ${d.name} with the shapes. Tap a shape to put it in.`;
  const { work, tools, check } = board(ctx, ask, 'hands-shapes');
  check.hidden = true; // done when every space is filled
  const filled = d.slots.map(() => false);
  const draw = () => (pic.innerHTML = `<svg viewBox="0 0 200 150" aria-hidden="true">${d.slots.map((s, i) => slotSvg(s, filled[i])).join('')}</svg>`);
  const pic = el('div', { class: 'sb-picture' });
  draw();
  work.append(pic);
  const kinds = [...new Set(d.slots.map((s) => s.shape))];
  const extra = ['triangle', 'square', 'rectangle', 'circle'].filter((k) => !kinds.includes(k));
  const trayKinds = [...kinds, ...extra.slice(0, Math.max(1, 4 - kinds.length - 1))].sort(() => ctx.rng() - 0.5);
  const tray = trayKinds.map((k) => Object.assign(el('button', { class: 'card sb-piece', 'aria-label': `a ${k}`, html: pieceIcon(k) }), { shape: k }));
  tools.append(el('div', { class: 'pt-tray' }, tray));
  let wrong = 0;
  const hint = stepHint(ctx, () => tray.find((b) => d.slots.some((s, i) => !filled[i] && s.shape === b.shape)), { coach: 'any' });
  const first = await new Promise((resolve) => {
    for (const b of tray)
      b.addEventListener('click', () => {
        const i = d.slots.findIndex((s, k) => !filled[k] && s.shape === b.shape);
        if (i < 0) {
          wrong++;
          wobble(b);
          ctx.miss?.();
          hint.miss();
          ctx.sayText(`A ${b.shape} doesn't fit. Look at the spaces.`, 'en');
          return;
        }
        filled[i] = true;
        draw();
        bounce(pic);
        ctx.sfx.pop();
        ctx.sayText(`A ${b.shape}!`, 'en');
        hint.step();
        if (filled.every(Boolean)) {
          hint.done();
          resolve(wrong === 0 && hint.used === 0);
        }
      });
  });
  return { first, explain: d.say, node: pic };
}

// ---------- 5. measure with cubes (NC.K.MD.2, NC.1.MD.2) ----------
const UNIT = 22; // the width of a cube in art-math's measure picture
async function measure(ctx) {
  const t = ctx.tier;
  const len = int(ctx.rng, [2, 4, 6][t], [5, 8, 12][t]);
  const thing = pick(ctx.rng, ['pencil', 'snake', 'train', 'ribbon']);
  const ask = `How long is the ${thing}? Lay cubes along it, end to end.`;
  const { work, tools, check } = board(ctx, ask, 'hands-measure');
  // the thing alone (art-math draws it with its cubes; those come off), on a strip long enough for 13 cubes
  const pic = el('div', { class: 'ms-picture', html: mathModel({ kind: 'measure', len, thing }) });
  const svg = pic.querySelector('svg');
  svg.querySelectorAll('.mm-unit').forEach((u) => u.remove());
  svg.setAttribute('viewBox', `0 0 ${10 + 13 * UNIT + 10} 76`);
  const row = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.append(row);
  let cubes = 0;
  const count = el('b', { class: 'hands-count', text: '0' });
  const draw = () => {
    row.innerHTML = Array.from({ length: cubes }, (_, i) => `<rect class="ms-cube" x="${10 + i * UNIT}" y="46" width="${UNIT}" height="${UNIT}" rx="2" fill="${i % 2 ? '#C7D2FE' : '#A5B4FC'}" stroke="#4C51BF" stroke-width="1.5"/>`).join('');
    count.textContent = String(cubes);
  };
  const add = toolBtn('+ cube', 'add', 'Add a cube');
  const take = toolBtn('− cube', 'take', 'Take a cube away');
  add.addEventListener('click', () => {
    if (cubes >= 13) return wobble(add);
    cubes++;
    draw();
    ctx.sfx.pop();
    ctx.sayText(String(cubes), 'en');
    hint.step();
  });
  take.addEventListener('click', () => {
    if (!cubes) return wobble(take);
    cubes--;
    draw();
    ctx.sfx.pop();
  });
  tools.append(take, add);
  work.append(pic, el('p', { class: 'hands-readout' }, [count, el('span', { text: ' cubes' })]));
  const hint = stepHint(ctx, () => (cubes < len ? add : cubes > len ? take : check), { coach: 'each' });
  const first = await untilRight(ctx, check, () => (cubes === len ? true : cubes < len ? `${cubes} cubes. The ${thing} is longer: add more.` : `${cubes} cubes go past the end. Take some away.`), hint);
  return { first, explain: `The ${thing} is ${len} cubes long.`, node: pic };
}

// ---------- 6. the balance: both sides the same (NC.1.OA.7) ----------
async function balance(ctx) {
  const t = ctx.tier;
  const a = int(ctx.rng, 1, t === 0 ? 5 : 8);
  const b = int(ctx.rng, 1, t === 0 ? 4 : 7);
  const total = a + b;
  const c = t === 0 ? 0 : int(ctx.rng, 1, total - 1);
  let added = t === 2 ? int(ctx.rng, 0, Math.max(0, total - c + 2)) : 0;
  if (t === 2 && c + added === total) added++;
  const ask = c ? `Make the scale level: ${a} + ${b} = ${c} + ?` : `Make the scale level: put ${a} + ${b} blocks on the other side.`;
  const { work, tools, check } = board(ctx, ask, 'hands-balance');
  const eq = el('p', { class: 'math-eq' }, [`${a} + ${b} = ${c ? `${c} + ` : ''}`, el('span', { class: 'gap', text: '?' })]);
  const blocks = (n, color) => Array.from({ length: n }, () => `<i style="--c:${color}"></i>`).join('');
  const left = el('div', { class: 'bl-pan left' });
  const right = el('div', { class: 'bl-pan right' });
  const beam = el('div', { class: 'bl-beam' }, [left, right]);
  const scale = el('div', { class: 'bl-scale' }, [beam, el('div', { class: 'bl-stand', 'aria-hidden': 'true' })]);
  const draw = () => {
    left.innerHTML = `<span class="bl-blocks">${blocks(a, '#FF5A5F')}${blocks(b, '#3D7BFF')}</span>`;
    right.innerHTML = `<span class="bl-blocks">${blocks(c, '#9AA3B5')}${blocks(added, '#2EC27E')}</span>`;
    const diff = c + added - total;
    beam.style.setProperty('--tilt', `${Math.max(-14, Math.min(14, diff * 3))}deg`);
    scale.classList.toggle('level', diff === 0);
  };
  draw();
  const add = toolBtn('+ block', 'add', 'Add a block');
  const take = toolBtn('− block', 'take', 'Take a block away');
  add.addEventListener('click', () => {
    if (c + added >= 20) return wobble(add);
    added++;
    draw();
    ctx.sfx.pop();
    hint.step();
  });
  take.addEventListener('click', () => {
    if (!added) return wobble(take);
    added--;
    draw();
    ctx.sfx.pop();
    hint.step();
  });
  tools.append(take, add);
  work.append(eq, scale);
  const hint = stepHint(ctx, () => (c + added < total ? add : c + added > total ? take : check), { coach: 'each' });
  const first = await untilRight(ctx, check, () => (c + added === total ? true : c + added < total ? 'That side is lighter. Add blocks.' : 'That side is heavier. Take blocks away.'), hint);
  eq.querySelector('.gap').textContent = String(added);
  eq.classList.add('done');
  return { first, explain: `${a} + ${b} = ${c ? `${c} + ${added}` : added}. Both sides are ${total}!`, node: scale };
}

// ---------- 7. the coin shop (NC.1.MD.5) ----------
const COINS = { penny: 1, nickel: 5, dime: 10, quarter: 25, dollar: 100 };
const money = (c) => (c >= 100 ? `$${(c / 100).toFixed(2)}` : `${c}¢`);
const SHOP = ['ball', 'kite', 'balloon', 'apple', 'book', 'cake', 'drum', 'cap'];
async function shop(ctx) {
  const t = ctx.tier;
  // Grade 2 pays with dollar bills too (NC.2.MD.8): { "dollars": true }
  const dollars = !!ctx.config.dollars;
  const kinds = dollars ? ['dollar', 'quarter', 'dime', 'nickel', 'penny'] : t === 0 ? ['penny', 'nickel'] : t === 1 ? ['penny', 'nickel', 'dime'] : ['penny', 'nickel', 'dime', 'quarter'];
  const price = dollars ? int(ctx.rng, t === 0 ? 21 : 22, t === 0 ? 30 : 50) * 5 + (t === 2 ? int(ctx.rng, 1, 4) : 0) : int(ctx.rng, t === 0 ? 2 : 11, t === 0 ? 9 : t === 1 ? 40 : 75);
  const item = pick(ctx.rng, SHOP);
  const name = ctx.word(item)?.en || item;
  const ask = dollars ? `The ${name} costs ${money(price)}. Pay with money.` : `The ${name} costs ${price} cents. Pay with coins.`;
  const { work, tools, check } = board(ctx, ask, 'hands-shop');
  const paid = [];
  const tray = el('div', { class: 'sh-tray', 'aria-label': 'Coins paid' });
  const total = el('b', { class: 'hands-count' });
  const sum = () => paid.reduce((s, k) => s + COINS[k], 0);
  const draw = () => {
    tray.replaceChildren(
      ...paid.map((k, i) => {
        const b = el('button', { class: 'sh-coin paid', 'aria-label': `Take back the ${k}`, html: mathModel({ kind: 'coin', coin: k, label: t < 2 }) });
        b.addEventListener('click', () => {
          paid.splice(i, 1);
          ctx.sfx.pop();
          draw();
          hint.step();
        });
        return b;
      }),
    );
    // the running total helps at first; at the top tier the child adds it up
    total.textContent = t < 2 ? money(sum()) : '?';
  };
  work.append(el('div', { class: 'sh-item' }, [el('span', { class: 'sh-pic', html: ctx.picture(ctx.word(item)) }), el('b', { class: 'sh-price', text: money(price) })]), el('p', { class: 'hands-readout' }, [el('span', { text: 'Paid: ' }), total]), tray);
  const coins = kinds.map((k) => {
    const b = el('button', { class: `sh-coin${k === 'dollar' ? ' bill' : ''}`, 'aria-label': k === 'dollar' ? 'Add a dollar' : `Add a ${k}, ${COINS[k]} cents`, html: mathModel({ kind: 'coin', coin: k, label: true }) });
    b.addEventListener('click', () => {
      if (paid.length >= 15) return wobble(b);
      paid.push(k);
      ctx.sfx.pop();
      ctx.sayText(k === 'dollar' ? 'one dollar' : `${k}, ${COINS[k]} ${COINS[k] === 1 ? 'cent' : 'cents'}`, 'en');
      draw();
      hint.step();
    });
    b.coin = k;
    return b;
  });
  tools.append(el('div', { class: 'sh-purse' }, coins));
  draw();
  // the next coin to give: the biggest that still fits (or one to take back)
  const nextCoin = () => {
    const left = price - sum();
    if (left < 0) return tray.firstElementChild;
    if (!left) return check;
    return coins.filter((b) => COINS[b.coin] <= left).sort((x, y) => COINS[y.coin] - COINS[x.coin])[0];
  };
  const hint = stepHint(ctx, nextCoin, { coach: 'each' });
  const first = await untilRight(ctx, check, () => (sum() === price ? true : sum() < price ? `That's ${money(sum())}. The ${name} costs ${money(price)}.` : `That's ${money(sum())}: too much. Take some back.`), hint);
  return { first, explain: `${money(price)}. Thank you for shopping!`, node: tray };
}

// ---------- 8. turn the clock's hands (NC.1.MD.3) ----------
async function clock(ctx) {
  const t = ctx.tier;
  // Grade 2 tells time to five minutes (NC.2.MD.7): { "minutes": 5 }
  const five = ctx.config.minutes === 5;
  const step = five ? 5 : 15;
  const h = int(ctx.rng, 1, 12);
  const m = five ? (t === 0 ? pick(ctx.rng, [15, 30, 45]) : int(ctx.rng, 1, 11) * 5) : t === 2 ? 30 : 0;
  const pad = (x) => String(x).padStart(2, '0');
  const ask = five ? `Show ${h}:${pad(m)}. Turn the hands.` : m ? `Show half past ${h}. Turn the hands.` : `Show ${h} o'clock. Turn the short hand${t ? ' and the long hand' : ''}.`;
  const { work, tools, check } = board(ctx, ask, 'hands-clock');
  // where the hands start: not already right
  let hh = ((h + int(ctx.rng, 2, 9) - 1) % 12) + 1;
  let mm = five ? pick(ctx.rng, Array.from({ length: 12 }, (_, i) => i * 5).filter((x) => x !== m)) : t === 0 ? 0 : pick(ctx.rng, [15, 30, 45].filter((x) => x !== m));
  const face = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const a = (n / 12) * 2 * Math.PI;
    return `<text x="${(100 + 72 * Math.sin(a)).toFixed(1)}" y="${(100 - 72 * Math.cos(a) + 8).toFixed(1)}" font-size="22" font-weight="800" fill="#2B2D42" text-anchor="middle">${n}</text>`;
  }).join('');
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * 2 * Math.PI;
    const r1 = i % 5 ? 86 : 81;
    return `<line x1="${(100 + r1 * Math.sin(a)).toFixed(1)}" y1="${(100 - r1 * Math.cos(a)).toFixed(1)}" x2="${(100 + 90 * Math.sin(a)).toFixed(1)}" y2="${(100 - 90 * Math.cos(a)).toFixed(1)}" stroke="#B7BDCB" stroke-width="${i % 5 ? 1.5 : 3}"/>`;
  }).join('');
  const pic = el('div', { class: 'ck-face', html: `<svg viewBox="0 0 200 200" aria-label="A clock"><circle cx="100" cy="100" r="94" fill="#fff" stroke="#3D7BFF" stroke-width="8"/>${ticks}${face}<line class="ck-hour" x1="100" y1="100" x2="100" y2="52" stroke="#2B2D42" stroke-width="9" stroke-linecap="round"/><line class="ck-min" x1="100" y1="100" x2="100" y2="24" stroke="#FF5A5F" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="100" r="7" fill="#2B2D42"/></svg>` });
  const hourHand = pic.querySelector('.ck-hour');
  const minHand = pic.querySelector('.ck-min');
  const digital = el('b', { class: 'ck-digital' });
  const draw = () => {
    hourHand.setAttribute('transform', `rotate(${(hh % 12) * 30 + mm * 0.5} 100 100)`);
    minHand.setAttribute('transform', `rotate(${mm * 6} 100 100)`);
    digital.textContent = `${hh}:${String(mm).padStart(2, '0')}`;
  };
  draw();
  // drag a hand round: it snaps to the hours, and the long hand to the quarter hours
  const svg = pic.querySelector('svg');
  let grabbed = null;
  const angleAt = (e) => {
    const r = svg.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    return ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
  };
  const near = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
  svg.addEventListener('pointerdown', (e) => {
    const a = angleAt(e);
    grabbed = t === 0 && !five ? 'hour' : near(a, mm * 6) < near(a, (hh % 12) * 30 + mm * 0.5) ? 'min' : 'hour';
    svg.setPointerCapture?.(e.pointerId);
    move(e);
  });
  const move = (e) => {
    if (!grabbed) return;
    const a = angleAt(e);
    if (grabbed === 'hour') {
      const n = Math.round(a / 30) % 12 || 12;
      if (n !== hh) (hh = n), ctx.sfx.tick?.() || ctx.sfx.pop();
    } else {
      const n = (Math.round(a / (step * 6)) * step) % 60;
      if (n !== mm) (mm = n), ctx.sfx.pop();
    }
    draw();
    hint.step();
  };
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerup', () => (grabbed = null));
  svg.addEventListener('pointercancel', () => (grabbed = null));
  // buttons too, for anyone who finds dragging hard
  const hourBtn = toolBtn('Short hand ⟳', 'hour', 'Move the short hand on');
  const minBtn = toolBtn('Long hand ⟳', 'min', 'Move the long hand on');
  hourBtn.addEventListener('click', () => {
    hh = (hh % 12) + 1;
    ctx.sfx.pop();
    draw();
    hint.step();
  });
  minBtn.addEventListener('click', () => {
    mm = (mm + step) % 60;
    ctx.sfx.pop();
    draw();
    hint.step();
  });
  tools.append(hourBtn, ...(t || five ? [minBtn] : []));
  work.append(pic, t === 0 ? digital : null);
  const hint = stepHint(ctx, () => (hh !== h ? hourBtn : mm !== m ? minBtn : check), { coach: 'each' });
  const say = (H, M) => (five ? `${H}:${pad(M)}` : M === 30 ? `half past ${H}` : M === 0 ? `${H} o'clock` : `${H}:${pad(M)}`);
  const first = await untilRight(ctx, check, () => (hh === h && mm === m ? true : `The clock says ${say(hh, mm)}. Show ${say(h, m)}.`), hint);
  if (five) return { first, explain: `The long hand points to ${m / 5}: ${m / 5} fives make ${m} minutes. It's ${h}:${pad(m)}!`, node: pic };
  return { first, explain: m ? `The long hand points to 6: it's half past ${h}!` : `The short hand points to ${h} and the long hand to 12. It's ${h} o'clock!`, node: pic };
}

// ---------- 9. number-bond bubbles: tap two that make 10, or 20 (NC.K.OA.4, NC.1.OA.6; docs/ROADMAP.md 10.4) ----------
async function bonds(ctx) {
  const t = ctx.tier;
  const target = ctx.config.target === 20 ? 20 : 10;
  const count = t === 0 ? 2 : 3;
  // the smaller number of each pair, all different; for 20 at first, the pairs around 10 (3 and 17)
  const lows = shuffle(Array.from({ length: target / 2 }, (_, i) => i + 1).filter((a) => target === 10 || t > 0 || a >= 3), ctx.rng).slice(0, count);
  const values = lows.flatMap((a) => [a, target - a]);
  // at the top level, one bubble has no partner
  if (t === 2) {
    const free = Array.from({ length: target - 1 }, (_, i) => i + 1).filter((d) => !values.includes(d) && !values.includes(target - d));
    if (free.length) values.push(pick(ctx.rng, free));
  }
  const ask = `Pop two bubbles that make ${target}.`;
  const { work, tools, check } = board(ctx, ask, 'hands-bonds');
  check.hidden = true;
  const found = el('div', { class: 'bd-found', 'aria-live': 'polite' });
  let picked = null;
  let wrong = 0;
  let pairsFound = 0;
  let finish;
  const done = new Promise((r) => (finish = r));
  const bubbles = shuffle(values, ctx.rng).map((v, i) => {
    const dots = t === 0 && target === 10 ? `<span class="bd-dots">${'<i></i>'.repeat(v)}</span>` : '';
    const b = el('button', { class: 'bd-bubble', style: { '--i': String(i) }, 'aria-label': String(v), html: `<b>${v}</b>${dots}` });
    b.v = v;
    b.addEventListener('click', () => {
      if (b.classList.contains('popped')) return;
      if (!picked) {
        picked = b;
        b.classList.add('picked');
        ctx.sfx.pop();
        ctx.sayText(String(v), 'en');
        hint.step();
        return;
      }
      if (picked === b) {
        b.classList.remove('picked');
        picked = null;
        return;
      }
      const a = picked;
      picked = null;
      a.classList.remove('picked');
      if (a.v + b.v === target) {
        for (const x of [a, b]) x.classList.add('popped');
        found.append(el('span', { class: 'bd-pair', text: `${a.v} + ${b.v} = ${target}` }));
        ctx.sfx.feel ? ctx.sfx.feel('right') : ctx.sfx.chime();
        hint.step();
        ctx.sayText(`${a.v} and ${b.v} make ${target}!`, 'en');
        if (++pairsFound === count) {
          hint.done();
          setTimeout(finish, 700);
        }
      } else {
        wrong++;
        wobble(a);
        wobble(b);
        ctx.miss?.();
        hint.miss();
        ctx.sayText(`${a.v} and ${b.v} make ${a.v + b.v}. We need ${target}.`, 'en');
      }
    });
    return b;
  });
  work.append(el('div', { class: 'bd-field' }, bubbles), found);
  tools.append(el('span', { class: 'hands-help', text: `Tap one bubble, then the one that makes ${target} with it.` }));
  // the next step: the partner of the bubble picked, or any bubble that has a partner
  const partner = (b) => bubbles.find((x) => x !== b && !x.classList.contains('popped') && x.v + b.v === target);
  const hint = stepHint(ctx, () => (picked ? partner(picked) : bubbles.find((b) => !b.classList.contains('popped') && partner(b))), { coach: 'each' });
  await done;
  return { first: wrong === 0 && hint.used === 0, explain: `You found ${count} ways to make ${target}!`, node: found };
}

// ---------- 10. jumps of ten and one along a number line (NC.2.NBT.5; docs/ROADMAP.md 10.5) ----------
async function jumps(ctx) {
  const t = ctx.tier;
  const a = int(ctx.rng, 12, 58);
  const b = t === 0 ? int(ctx.rng, 1, 3) * 10 : int(ctx.rng, 11, t === 1 ? 29 : 39);
  const answer = a + b;
  const ask = `Start at ${a}. Jump ${b} more. Where do you land?`;
  const { work, tools, check } = board(ctx, ask, 'hands-jumps');
  const eq = el('p', { class: 'math-eq' }, [`${a} + ${b} = `, el('span', { class: 'gap', text: '?' })]);
  const hops = [];
  const at = () => a + hops.reduce((s, x) => s + x, 0);
  const span = b + 12;
  const X = (v) => 20 + ((v - a) / span) * 560;
  const line = el('div', { class: 'jl-line' });
  const readout = el('p', { class: 'hands-readout' }, [el('span', { text: 'On ' }), el('b', { class: 'hands-count', text: String(a) })]);
  const draw = () => {
    let arcs = '';
    let v = a;
    for (const hop of hops) {
      const [x1, x2] = [X(v), X(v + hop)];
      arcs += `<path d="M${x1.toFixed(1)} 70 Q${((x1 + x2) / 2).toFixed(1)} ${hop === 10 ? 8 : 40} ${x2.toFixed(1)} 70" fill="none" stroke="${hop === 10 ? '#3D7BFF' : '#2EC27E'}" stroke-width="${hop === 10 ? 4 : 3}"/>`;
      if (hop === 10) arcs += `<text x="${((x1 + x2) / 2).toFixed(1)}" y="32" font-size="15" font-weight="800" fill="#3D7BFF" text-anchor="middle">+10</text>`;
      v += hop;
    }
    const marks = [a, ...new Set(hops.map((_, i) => a + hops.slice(0, i + 1).reduce((s, x) => s + x, 0)).filter((x, i, all) => hops[i] === 10 || i === all.length - 1))];
    const labels = marks.map((m) => `<line x1="${X(m).toFixed(1)}" y1="62" x2="${X(m).toFixed(1)}" y2="78" stroke="#2B2D42" stroke-width="3"/><text x="${X(m).toFixed(1)}" y="100" font-size="17" font-weight="800" fill="${m === a ? '#FF5A5F' : '#2B2D42'}" text-anchor="middle">${m}</text>`).join('');
    line.innerHTML = `<svg viewBox="0 0 600 110" aria-hidden="true"><line x1="10" y1="70" x2="590" y2="70" stroke="#2B2D42" stroke-width="4" stroke-linecap="round"/>${arcs}${labels}<circle cx="${X(at()).toFixed(1)}" cy="70" r="10" fill="#FFC93C" stroke="#2B2D42" stroke-width="2.5"/></svg>`;
    readout.querySelector('b').textContent = String(at());
  };
  draw();
  const hop = (k, btn) => () => {
    if (at() + k > a + span) return wobble(btn);
    hops.push(k);
    draw();
    ctx.sfx.boing?.() || ctx.sfx.pop();
    ctx.sayText(String(at()), 'en');
    hint.step();
  };
  const ten = toolBtn('+10', 'ten', 'Jump ten');
  const one = toolBtn('+1', 'one', 'Jump one');
  const undo = toolBtn('↩', 'undo', 'Undo a jump');
  ten.addEventListener('click', hop(10, ten));
  one.addEventListener('click', hop(1, one));
  undo.addEventListener('click', () => {
    if (!hops.length) return wobble(undo);
    hops.pop();
    draw();
    ctx.sfx.pop();
  });
  tools.append(undo, one, ten);
  work.append(eq, line, readout);
  const hint = stepHint(ctx, () => (at() > answer ? undo : answer - at() >= 10 ? ten : answer - at() > 0 ? one : check), { coach: 'each' });
  const first = await untilRight(ctx, check, () => (at() === answer ? true : `You jumped ${at() - a}. Jump ${b} in all: tens first, then ones.`), hint);
  eq.querySelector('.gap').textContent = String(answer);
  eq.classList.add('done');
  return { first, explain: `${a} + ${b} = ${answer}: ${Math.floor(b / 10)} ${Math.floor(b / 10) === 1 ? 'jump' : 'jumps'} of ten and ${b % 10} of one.`, node: line };
}

// ---------- 11. build an array: rows of the same (NC.2.OA.4; docs/ROADMAP.md 10.5) ----------
async function arrayBuild(ctx) {
  const t = ctx.tier;
  const R = int(ctx.rng, 2, t === 0 ? 3 : 4);
  const C = int(ctx.rng, 2, t === 0 ? 4 : 5);
  const total = R * C;
  // at the top level only the total and the rows are given
  const byTotal = t === 2;
  const ask = byTotal ? `Make ${total} in ${R} equal rows.` : `Make ${R} rows of ${C}.`;
  const { work, tools, check } = board(ctx, ask, 'hands-array');
  const thingPic = pick(ctx.rng, ['apple', 'mango', 'laddoo', 'balloon', 'flower']);
  let rows = 1;
  let cols = 1;
  const pic = el('div', { class: 'ar-pic' });
  const readout = el('p', { class: 'hands-readout' });
  const draw = () => {
    pic.innerHTML = mathModel({ kind: 'array', rows, cols, pic: thingPic });
    readout.textContent = `${rows} ${rows === 1 ? 'row' : 'rows'} of ${cols}: ${rows * cols}`;
  };
  draw();
  const change = (dr, dc, btn) => () => {
    const [r, c] = [rows + dr, cols + dc];
    if (r < 1 || c < 1 || r > 6 || c > 6) return wobble(btn);
    [rows, cols] = [r, c];
    draw();
    ctx.sfx.pop();
    hint.step();
  };
  const addRow = toolBtn('+ row', 'add-row', 'Add a row');
  const subRow = toolBtn('− row', 'sub-row', 'Take a row away');
  const addCol = toolBtn('+ in each row', 'add-col', 'One more in each row');
  const subCol = toolBtn('− in each row', 'sub-col', 'One fewer in each row');
  addRow.addEventListener('click', change(1, 0, addRow));
  subRow.addEventListener('click', change(-1, 0, subRow));
  addCol.addEventListener('click', change(0, 1, addCol));
  subCol.addEventListener('click', change(0, -1, subCol));
  tools.append(subRow, addRow, subCol, addCol);
  work.append(pic, readout);
  const hint = stepHint(ctx, () => (rows < R ? addRow : rows > R ? subRow : cols < C ? addCol : cols > C ? subCol : check), { coach: 'each' });
  const first = await untilRight(ctx, check, () => (rows === R && cols === C ? true : `That's ${rows} ${rows === 1 ? 'row' : 'rows'} of ${cols}. ${ask}`), hint);
  return { first, explain: `${R} rows of ${C}: ${Array.from({ length: R }, () => C).join(' + ')} = ${total}!`, node: pic };
}

const PLAY = { tenframe, numberline, pattern, shapes, measure, balance, shop, clock, bonds, jumps, array: arrayBuild };

export default {
  async start(ctx) {
    const activity = PLAY[ctx.config.activity] ? ctx.config.activity : 'tenframe';
    const rounds = ctx.config.rounds || 5;
    const ok = await runRounds(ctx, rounds, async () => {
      const r = await PLAY[activity](ctx);
      if (!ctx.alive()) return;
      ctx.record({ skill: ctx.config.skill || ACTIVITY_SKILL[activity] }, r.first);
      await cheer(ctx, r.node);
      await ctx.sayText(r.explain, 'en');
      await sleep(350);
    });
    if (ok) ctx.complete();
  },
};
