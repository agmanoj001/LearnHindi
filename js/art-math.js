// Visual models for the math worlds: counters, ten frames, base-ten blocks, number lines, shapes,
// clocks, coins, picture graphs, balances and more. mathModel(model) returns an HTML string.
// Objects to count are separate elements (.mm-obj) so the child can tap each one while counting.
import { picture } from './art.js';

const INK = '#2B2D42';
const RED = '#FF5A5F';
const YELLOW = '#FFB020';
const BLUE = '#3D7BFF';
const GREEN = '#2EC27E';

let uid = 0;
const cache = new Map();
const pic = (id) => {
  if (!cache.has(id)) cache.set(id, picture(id));
  return cache.get(id);
};
// a picture placed inside another SVG
const nest = (id, x, y, w, h) => pic(id).replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const S = (vb, body, cls = '') => `<svg class="mm-svg ${cls}" viewBox="${vb}" aria-hidden="true">${body}</svg>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---------- objects to count ----------

function objects(m) {
  let k = 0;
  const total = m.groups.reduce((s, g) => s + g.n, 0);
  const one = (p, color, cls = '') => `<span class="mm-obj${cls}" data-i="${k++}">${p === 'dot' ? `<i class="mm-dot" style="--c:${color || RED}"></i>` : pic(p)}</span>`;
  const size = m.big ? 'big' : total > 12 || m.small ? 'many' : total > 6 ? 'some' : 'few';
  if (m.layout === 'scatter') {
    const g = m.groups[0];
    return `<div class="mm-objects scatter ${size}">${(m.spots || []).map(([x, y]) => one(g.pic, g.color).replace('<span ', `<span style="left:${x}%;top:${y}%" `)).join('')}</div>`;
  }
  if (m.layout === 'mixed') return `<div class="mm-objects mixed ${size}">${m.groups.map((g) => one(g.pic, g.color)).join('')}</div>`;
  // even rows: 6 is 3 + 3 and 7 is 4 + 3, never 5 + 1
  const colsFor = (n) => {
    const max = m.cols || 5;
    return n <= max ? Math.max(1, n) : Math.ceil(n / Math.ceil(n / max));
  };
  const groups = m.groups.map((g) => {
    const items = Array.from({ length: g.n }, (_, i) => one(g.pic, g.color, g.gone && i >= g.n - g.gone ? ' gone' : ''));
    return `<div class="mm-group${g.arrive ? ' arrive' : ''}" style="--cols:${colsFor(g.n)}">${items.join('')}</div>`;
  });
  const stacked = m.op && total > 8 ? ' stacked' : '';
  return `<div class="mm-objects rows ${size}${stacked}">${groups.join(m.op ? `<span class="mm-op">${m.op}</span>` : '')}</div>`;
}

// dice patterns for a quick look
const DICE = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [26, 26],
    [50, 50],
    [74, 74],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [26, 26],
    [74, 26],
    [50, 50],
    [26, 74],
    [74, 74],
  ],
  6: [
    [30, 24],
    [70, 24],
    [30, 50],
    [70, 50],
    [30, 76],
    [70, 76],
  ],
};
const dots = (m) => S('0 0 100 100', `<rect x="4" y="4" width="92" height="92" rx="20" fill="#fff" stroke="#E2E0F5" stroke-width="3"/>${DICE[m.n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${RED}"/>`).join('')}`, 'mm-dice');

// ten frame: a = red counters, b = yellow counters (or dashed "missing" spots when hideB)
function tenframe(m) {
  const frames = m.frames.map((f) => {
    let body = `<rect x="2" y="2" width="206" height="86" rx="10" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
    for (let i = 1; i < 5; i++) body += `<line x1="${2 + i * 41.2}" y1="2" x2="${2 + i * 41.2}" y2="88" stroke="${INK}" stroke-width="2"/>`;
    body += `<line x1="2" y1="45" x2="208" y2="45" stroke="${INK}" stroke-width="2"/>`;
    for (let i = 0; i < 10; i++) {
      const cx = 22.6 + (i % 5) * 41.2;
      const cy = 23.5 + Math.floor(i / 5) * 43;
      if (i < f.a) body += `<circle class="mm-counter" cx="${cx}" cy="${cy}" r="15" fill="${RED}"/>`;
      else if (i < f.a + (f.b || 0)) body += f.hideB ? `<circle class="mm-missing" cx="${cx}" cy="${cy}" r="14" fill="none" stroke="${BLUE}" stroke-width="3" stroke-dasharray="5 4"/>` : `<circle class="mm-counter b" cx="${cx}" cy="${cy}" r="15" fill="${YELLOW}"/>`;
      else if (f.b !== undefined && f.hideB) body += `<rect x="${cx - 18}" y="${cy - 18}" width="36" height="36" rx="6" fill="#EEF0F6"/>`;
    }
    return S('0 0 210 90', body, 'mm-frame');
  });
  return `<div class="mm-frames">${frames.join('')}</div>`;
}

// base-ten blocks: rods of ten and unit cubes (extra ones to add in green; tens being taken away crossed out)
function base10(m) {
  const rods = [];
  const rod = (x, color, gone) =>
    `<g class="mm-rod${gone ? ' gone' : ''}">${Array.from({ length: 10 }, (_, i) => `<rect x="${x}" y="${8 + i * 16}" width="16" height="16" fill="${color}" stroke="#fff" stroke-width="1.5"/>`).join('')}${gone ? `<path d="M${x - 3} 6 L${x + 19} 170 M${x + 19} 6 L${x - 3} 170" stroke="${INK}" stroke-width="3"/>` : ''}</g>`;
  const cube = (x, y, color) => `<rect x="${x}" y="${y}" width="16" height="16" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;
  let x = 6;
  for (let i = 0; i < m.tens; i++) {
    rods.push(rod(x, BLUE, m.goneTens && i >= m.tens - m.goneTens));
    x += 22;
  }
  const cubes = (n, color) => {
    let s = '';
    const x0 = x + 4;
    for (let i = 0; i < n; i++) s += cube(x0 + (i % 2) * 18, 152 - Math.floor(i / 2) * 18, color);
    if (n) x = x0 + (n > 1 ? 40 : 22);
    return s;
  };
  let body = rods.join('') + cubes(m.ones, YELLOW);
  if (m.addTens || m.addOnes) {
    body += `<text x="${x + 10}" y="100" font-size="34" font-weight="800" fill="${INK}" text-anchor="middle">+</text>`;
    x += 26;
    for (let i = 0; i < (m.addTens || 0); i++) {
      body += rod(x, GREEN);
      x += 22;
    }
    body += cubes(m.addOnes || 0, '#7BE0A8');
  }
  return S(`0 0 ${Math.max(x + 6, 60)} 176`, body, 'mm-base10');
}

function compare10(m) {
  const one = (v) => `<div class="mm-cmp-side">${base10({ tens: Math.floor(v / 10), ones: v % 10 })}<span class="mm-cmp-num">${v}</span></div>`;
  return `<div class="mm-compare">${one(m.a)}${one(m.b)}</div>`;
}

function numberline(m) {
  const n = m.to - m.from;
  const step = 560 / n;
  let body = `<line x1="14" y1="60" x2="586" y2="60" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  for (let i = 0; i <= n; i++) {
    const x = 20 + i * step;
    const v = m.from + i;
    body += `<line x1="${x}" y1="${v % 5 ? 52 : 46}" x2="${x}" y2="${v % 5 ? 68 : 74}" stroke="${INK}" stroke-width="${v % 5 ? 2 : 3}"/>`;
    body += `<text x="${x}" y="94" font-size="${n > 12 ? 15 : 20}" font-weight="700" fill="${v === m.start ? RED : INK}" text-anchor="middle">${v}</text>`;
  }
  if (m.start !== undefined) {
    const x = 20 + (m.start - m.from) * step;
    body += `<circle cx="${x}" cy="60" r="9" fill="${RED}"/><path d="M${x} 38 l-8 -14 h16 z" fill="${RED}"/>`;
  }
  return S('0 0 600 104', body, 'mm-line');
}

const sequence = (m) => `<div class="mm-seq">${m.items.map((v) => (v === null ? '<span class="mm-num gap">?</span>' : `<span class="mm-num">${v}</span>`)).join('')}</div>`;

// ---------- shapes ----------

function shapeBody(shape, color, { stretch = 1, marks } = {}) {
  const id = `mmg${++uid}`;
  const shade = (c, k) => `color-mix(in srgb, ${c} ${k}%, ${k > 100 ? 'white' : 'black'})`;
  let pts = null;
  let body = '';
  switch (shape) {
    case 'circle':
      body = `<circle cx="60" cy="60" r="46" fill="${color}"/>`;
      break;
    case 'square':
      pts = [
        [18, 18],
        [102, 18],
        [102, 102],
        [18, 102],
      ];
      break;
    case 'rectangle':
      pts = [
        [8, 32],
        [112, 32],
        [112, 88],
        [8, 88],
      ];
      break;
    case 'triangle': {
      const w = Math.min(52 * stretch, 56);
      pts = [
        [60, 14],
        [60 + w, 104],
        [60 - w, 104],
      ];
      break;
    }
    case 'hexagon':
      pts = Array.from({ length: 6 }, (_, i) => [60 + 48 * Math.cos((Math.PI / 3) * i), 60 + 48 * Math.sin((Math.PI / 3) * i)]);
      break;
    case 'cube':
      body = `<path d="M24 40 L60 22 L96 40 L60 58 Z" fill="${shade(color, 70)}" style="fill:color-mix(in srgb, ${color} 65%, white)"/><path d="M24 40 L60 58 V102 L24 84 Z" fill="${color}"/><path d="M96 40 L60 58 V102 L96 84 Z" fill="${color}" style="fill:color-mix(in srgb, ${color} 75%, black)"/>`;
      break;
    case 'sphere':
      body = `<defs><radialGradient id="${id}" cx="0.36" cy="0.32" r="0.75"><stop offset="0" stop-color="#fff" stop-opacity="0.85"/><stop offset="0.25" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0.75"/></radialGradient></defs><ellipse cx="60" cy="108" rx="34" ry="5" fill="#1E1B4B" opacity="0.12"/><circle cx="60" cy="60" r="44" fill="url(#${id})"/>`;
      break;
    case 'cone':
      body = `<ellipse cx="60" cy="96" rx="38" ry="12" fill="${color}" style="fill:color-mix(in srgb, ${color} 70%, black)"/><path d="M60 12 L98 96 A38 12 0 0 1 22 96 Z" fill="${color}"/><path d="M60 12 L72 96 A38 12 0 0 1 48 96 Z" fill="#fff" opacity="0.18"/>`;
      break;
    case 'cylinder':
      body = `<path d="M28 28 V92 A32 11 0 0 0 92 92 V28 Z" fill="${color}"/><ellipse cx="60" cy="28" rx="32" ry="11" fill="${color}" style="fill:color-mix(in srgb, ${color} 60%, white)"/><rect x="36" y="32" width="10" height="64" fill="#fff" opacity="0.2"/>`;
      break;
    default:
      body = `<circle cx="60" cy="60" r="46" fill="${color}"/>`;
  }
  if (pts) {
    const d = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    body = `<polygon points="${d}" fill="${color}" stroke="${color}" stroke-width="6" stroke-linejoin="round"/>`;
    if (marks === 'corners') body += pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="${INK}" stroke-width="3"/>`).join('');
    if (marks === 'sides')
      body += pts
        .map(([x, y], i) => {
          const [x2, y2] = pts[(i + 1) % pts.length];
          return `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${i % 2 ? '#fff' : INK}" stroke-width="5" stroke-linecap="round" opacity="0.85"/>`;
        })
        .join('');
  }
  return body;
}

const shape = (m) => S('0 0 120 120', `<g transform="rotate(${m.rot || 0} 60 60) translate(60 60) scale(${m.scale || 1}) translate(-60 -60)">${shapeBody(m.shape, m.color || BLUE, m)}</g>`, 'mm-shape');

// ---------- position: a table with a long cloth and a friend somewhere around it ----------

function position(m) {
  const table = `<rect x="40" y="84" width="168" height="12" rx="5" fill="#B9773E"/><path d="M48 96 H200 L194 150 Q124 160 54 150 Z" fill="#FFB5C8"/><path d="M54 150 Q124 160 194 150" fill="none" stroke="#FF8FB1" stroke-width="4"/><rect x="54" y="148" width="10" height="54" rx="3" fill="#9A5E2C"/><rect x="184" y="148" width="10" height="54" rx="3" fill="#9A5E2C"/>`;
  const floor = `<rect x="0" y="200" width="300" height="20" fill="#E4E9F7"/>`;
  const at = {
    above: [74, 16, 100, 70],
    below: [86, 150, 76, 53],
    beside: [204, 124, 96, 67],
    behind: [74, 36, 100, 70],
    front: [60, 116, 128, 90],
  }[m.where];
  const friend = nest(m.pic, ...at);
  const body = m.where === 'behind' ? floor + friend + table : floor + table + friend;
  return S('0 0 300 220', body, 'mm-position');
}

// ---------- length, height, weight ----------

function thingBar(thing, len, max, color) {
  const w = Math.max(30, (len / max) * 270);
  const x = 10;
  switch (thing) {
    case 'pencil':
      return `<rect x="${x}" y="12" width="12" height="20" rx="4" fill="#FF8FB1"/><rect x="${x + 10}" y="12" width="6" height="20" fill="#C9CED8"/><rect x="${x + 15}" y="12" width="${w - 38}" height="20" fill="${color}"/><path d="M${x + w - 23} 12 L${x + w} 22 L${x + w - 23} 32 Z" fill="#F4C99A"/><path d="M${x + w - 8} 19 L${x + w} 22 L${x + w - 8} 25 Z" fill="${INK}"/>`;
    case 'snake':
      return `<rect x="${x}" y="13" width="${w}" height="18" rx="9" fill="${color}"/>${Array.from({ length: Math.floor((w - 30) / 22) }, (_, i) => `<rect x="${x + 14 + i * 22}" y="13" width="8" height="18" fill="#fff" opacity="0.3"/>`).join('')}<circle cx="${x + w - 9}" cy="18" r="3.2" fill="#fff"/><circle cx="${x + w - 8.5}" cy="18" r="1.6" fill="${INK}"/><path d="M${x + w} 24 l7 2 -7 2" stroke="#E2463F" stroke-width="2" fill="none"/>`;
    case 'train': {
      const cars = Math.max(1, Math.round(w / 34));
      const cw = w / cars;
      let s = '';
      for (let i = 0; i < cars; i++) s += `<rect x="${x + i * cw + 1}" y="${i === cars - 1 ? 6 : 12}" width="${cw - 3}" height="${i === cars - 1 ? 24 : 18}" rx="4" fill="${i === cars - 1 ? color : `color-mix(in srgb, ${color} 70%, white)`}"/><circle cx="${x + i * cw + cw * 0.3}" cy="33" r="4" fill="${INK}"/><circle cx="${x + i * cw + cw * 0.7}" cy="33" r="4" fill="${INK}"/>`;
      return s;
    }
    default:
      return `<path d="M${x} 12 H${x + w} L${x + w - 8} 22 L${x + w} 32 H${x} L${x + 8} 22 Z" fill="${color}"/>`;
  }
}

const bar = (m) => S('0 0 300 40', thingBar(m.thing, m.len, m.max || 10, m.color || BLUE), 'mm-bar');

const tower = (m) => S('0 0 60 220', Array.from({ length: m.h }, (_, i) => `<rect x="8" y="${196 - i * 20}" width="44" height="20" rx="3" fill="${i % 2 ? `color-mix(in srgb, ${m.color} 70%, white)` : m.color}" stroke="#fff" stroke-width="2"/>`).join('') + '<rect x="0" y="216" width="60" height="4" fill="#C9CED8"/>', 'mm-tower');

function balance(m) {
  const deg = 14 * (Math.PI / 180) * (m.down === 'left' ? 1 : -1);
  const L = [150 - 110 * Math.cos(deg), 92 + 110 * Math.sin(deg)];
  const R = [150 + 110 * Math.cos(deg), 92 - 110 * Math.sin(deg)];
  const pan = ([x, y], who) => `<line x1="${x}" y1="${y}" x2="${x - 30}" y2="${y + 40}" stroke="#9AA3B5" stroke-width="2"/><line x1="${x}" y1="${y}" x2="${x + 30}" y2="${y + 40}" stroke="#9AA3B5" stroke-width="2"/><path d="M${x - 42} ${y + 40} H${x + 42} Q${x} ${y + 62} ${x - 42} ${y + 40} Z" fill="#FFB020"/>${nest(who, x - 40, y - 16, 80, 56)}`;
  return S(
    '0 0 300 210',
    `<path d="M150 92 L126 200 H174 Z" fill="#8B93A7"/><rect x="100" y="198" width="100" height="8" rx="4" fill="#6E768A"/><line x1="${L[0]}" y1="${L[1]}" x2="${R[0]}" y2="${R[1]}" stroke="#6E768A" stroke-width="8" stroke-linecap="round"/><circle cx="150" cy="92" r="8" fill="#FFB020"/>` + pan(L, m.left) + pan(R, m.right),
    'mm-balance',
  );
}

// ---------- time and money ----------

function clock(m) {
  let body = `<circle cx="100" cy="100" r="94" fill="#fff" stroke="${BLUE}" stroke-width="8"/>`;
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * 2 * Math.PI;
    body += `<text x="${(100 + 72 * Math.sin(a)).toFixed(1)}" y="${(100 - 72 * Math.cos(a) + 8).toFixed(1)}" font-size="22" font-weight="800" fill="${INK}" text-anchor="middle">${i}</text>`;
  }
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * 2 * Math.PI;
    const r1 = i % 5 ? 86 : 82;
    body += `<line x1="${(100 + r1 * Math.sin(a)).toFixed(1)}" y1="${(100 - r1 * Math.cos(a)).toFixed(1)}" x2="${(100 + 90 * Math.sin(a)).toFixed(1)}" y2="${(100 - 90 * Math.cos(a)).toFixed(1)}" stroke="#B7BDCB" stroke-width="${i % 5 ? 1.5 : 3}"/>`;
  }
  const ha = (((m.h % 12) + m.m / 60) / 12) * 360;
  const ma = (m.m / 60) * 360;
  body += `<line x1="100" y1="100" x2="100" y2="50" stroke="${RED}" stroke-width="10" stroke-linecap="round" transform="rotate(${ha} 100 100)"/>`;
  body += `<line x1="100" y1="100" x2="100" y2="26" stroke="${INK}" stroke-width="6" stroke-linecap="round" transform="rotate(${ma} 100 100)"/>`;
  body += `<circle cx="100" cy="100" r="8" fill="${INK}"/>`;
  return S('0 0 200 200', body, `mm-clock${m.small ? ' small' : ''}`);
}

const COIN = {
  penny: { r: 40, fill: '#D08A4E', rim: '#A9652F', text: '1¢', ridged: false },
  nickel: { r: 46, fill: '#C3CAD3', rim: '#9AA3B0', text: '5¢', ridged: false },
  dime: { r: 34, fill: '#D3D8DF', rim: '#9AA3B0', text: '10¢', ridged: true },
  quarter: { r: 54, fill: '#CED4DC', rim: '#9AA3B0', text: '25¢', ridged: true },
};
function coin(m) {
  const c = COIN[m.coin];
  const star = (r) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * 2 * Math.PI - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      d += `${i ? 'L' : 'M'}${(60 + rr * Math.cos(a)).toFixed(1)} ${(60 + rr * Math.sin(a)).toFixed(1)}`;
    }
    return `<path d="${d}Z" fill="${c.rim}" opacity="0.35"/>`;
  };
  let body = `<circle cx="60" cy="62" r="${c.r}" fill="#1E1B4B" opacity="0.12"/><circle cx="60" cy="60" r="${c.r}" fill="${c.rim}"${c.ridged ? ` stroke="${c.rim}" stroke-width="4" stroke-dasharray="1.5 2.2"` : ''}/><circle cx="60" cy="60" r="${c.r - 5}" fill="${c.fill}"/><circle cx="60" cy="60" r="${c.r - 9}" fill="none" stroke="${c.rim}" stroke-width="1.5" opacity="0.6"/>`;
  body += m.label ? `<text x="60" y="${60 + c.r * 0.22}" font-size="${c.r * 0.62}" font-weight="800" fill="${c.rim}" text-anchor="middle" style="filter:brightness(0.7)">${c.text}</text>` : star(c.r * 0.55);
  return S('0 0 120 120', body, `mm-coin${m.big ? ' big' : ''}`);
}

// ---------- data ----------

function graph(m) {
  const rows = m.rows.map((r) => `<div class="mm-graph-row"><span class="mm-graph-key">${pic(r.pic)}</span>${Array.from({ length: m.max }, (_, i) => `<span class="mm-graph-cell">${i < r.n ? pic(r.pic) : ''}</span>`).join('')}</div>`);
  return `<div class="mm-graph" style="--max:${m.max}">${rows.join('')}</div>`;
}

function match(m) {
  const row = (who, n, cls) => `<div class="mm-match-row ${cls}"><span class="mm-match-who">${who}</span>${Array.from({ length: m.a }, (_, i) => `<span class="mm-match-cell${i >= n ? ' empty' : i >= m.b ? ' extra' : ''}">${i < n ? pic(m.pic) : ''}</span>`).join('')}</div>`;
  return `<div class="mm-match" style="--n:${m.a}">${row('Pip', m.a, 'a')}${row('Tiko', m.b, 'b')}</div>`;
}

// ---------- fractions and composing shapes ----------

function parts(m) {
  const fill = '#FFD666';
  const shadeFill = '#FF8A3D';
  let outline;
  let lines = '';
  let shaded = '';
  if (m.shape === 'circle') {
    outline = `<circle cx="60" cy="60" r="48" fill="${fill}" stroke="${INK}" stroke-width="4"/>`;
    if (m.parts === 2) {
      const x = m.equal ? 60 : 82;
      const dy = Math.sqrt(48 * 48 - (x - 60) ** 2);
      lines = `<line x1="${x}" y1="${60 - dy}" x2="${x}" y2="${60 + dy}" stroke="${INK}" stroke-width="4"/>`;
      if (m.shade) shaded = `<path d="M60 12 A48 48 0 0 0 60 108 Z" fill="${shadeFill}"/>`;
    } else {
      const c = m.equal ? 60 : 78;
      const dx = Math.sqrt(48 * 48 - (c - 60) ** 2);
      lines = `<line x1="${60 - dx}" y1="${c}" x2="${60 + dx}" y2="${c}" stroke="${INK}" stroke-width="4"/><line x1="${c}" y1="${60 - dx}" x2="${c}" y2="${60 + dx}" stroke="${INK}" stroke-width="4"/>`;
      if (m.equal) lines = `<line x1="12" y1="60" x2="108" y2="60" stroke="${INK}" stroke-width="4"/><line x1="60" y1="12" x2="60" y2="108" stroke="${INK}" stroke-width="4"/>`;
      if (m.shade) shaded = `<path d="M60 60 L60 12 A48 48 0 0 0 12 60 Z" fill="${shadeFill}"/>`;
    }
  } else {
    const [x0, y0, w, h] = m.shape === 'square' ? [14, 14, 92, 92] : [6, 28, 108, 64];
    outline = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${fill}" stroke="${INK}" stroke-width="4" rx="3"/>`;
    const mx = x0 + w * (m.equal ? 0.5 : 0.72);
    const my = y0 + h * (m.equal ? 0.5 : 0.3);
    lines = `<line x1="${mx}" y1="${y0}" x2="${mx}" y2="${y0 + h}" stroke="${INK}" stroke-width="4"/>`;
    if (m.parts === 4) lines += `<line x1="${x0}" y1="${my}" x2="${x0 + w}" y2="${my}" stroke="${INK}" stroke-width="4"/>`;
    if (m.shade) shaded = `<rect x="${x0}" y="${y0}" width="${mx - x0}" height="${m.parts === 4 ? my - y0 : h}" fill="${shadeFill}"/>`;
  }
  return S('0 0 120 120', outline + shaded + lines + outline.replace(/fill="[^"]+"/, 'fill="none"'), 'mm-parts');
}

const PIECES = {
  tri2: [`<path d="M10 10 H90 L10 90 Z" fill="${BLUE}"/>`, `<path d="M90 10 V90 H10 Z" fill="${RED}"/>`, 'diag'],
  sq2: [`<rect x="10" y="20" width="60" height="60" fill="${BLUE}"/>`, `<rect x="70" y="20" width="60" height="60" fill="${RED}"/>`, 'side'],
  semi2: [`<path d="M60 10 A40 40 0 0 0 60 90 Z" fill="${BLUE}"/>`, `<path d="M60 10 A40 40 0 0 1 60 90 Z" fill="${RED}"/>`, 'side'],
  tri4: [`<path d="M60 10 L35 50 H85 Z M35 50 L10 90 H60 Z M85 50 L60 90 H110 Z" fill="${BLUE}"/>`, `<path d="M35 50 H85 L60 90 Z" fill="${RED}"/>`, 'center'],
  trap2: [`<path d="M35 50 L48 15 H92 L105 50 Z" fill="${BLUE}"/>`, `<path d="M35 50 H105 L92 85 H48 Z" fill="${RED}"/>`, 'up'],
};
function compose(m) {
  const [a, b, dir] = PIECES[m.pieces];
  const apart = { diag: ['-14px, -14px', '14px, 14px'], side: ['-22px, 0', '22px, 0'], center: ['0, 0', '0, 26px'], up: ['0, -14px', '0, 14px'] }[dir];
  return S('-30 -30 200 160', `<g class="mm-piece" style="--apart:translate(${apart[0]})">${a}</g><g class="mm-piece" style="--apart:translate(${apart[1]})">${b}</g>`, 'mm-compose');
}

// ---------- entry ----------

const KINDS = { objects, dots, tenframe, base10, compare10, numberline, sequence, shape, position, bar, tower, balance, clock, coin, graph, match, parts, compose, pic: (m) => `<span class="mm-pic">${pic(m.pic)}</span>` };

export function mathModel(model) {
  if (!model) return '';
  const f = model.kind === 'measure' ? measureModel : KINDS[model.kind];
  return f ? `<div class="mm mm-k-${model.kind}">${f(model)}</div>` : `<div class="mm">${esc(model.kind)}</div>`;
}

// a thing drawn exactly as long as a row of cubes under it
function measureModel(m) {
  const unit = 22;
  const w = m.len * unit;
  let cubes = '';
  for (let i = 0; i < m.len; i++) cubes += `<rect class="mm-unit" x="${10 + i * unit}" y="46" width="${unit}" height="${unit}" rx="2" fill="${m.faint ? '#fff' : i % 2 ? '#C7D2FE' : '#A5B4FC'}" stroke="${m.faint ? '#9AA3B5' : '#fff'}" stroke-width="2"/>`;
  // thingBar draws len/max of 270px: len = w and max = 270 gives exactly w pixels
  const thingSvg = thingBar(m.thing, w, 270, m.color || BLUE);
  return S(`0 0 ${Math.max(300, w + 30)} 76`, thingSvg + cubes, 'mm-measure');
}

