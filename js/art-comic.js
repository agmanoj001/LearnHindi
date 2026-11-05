// Comic art: the cast of the two comic series, their faces and poses, and panel backgrounds.
// Original characters in the spirit of classic Indian comics, drawn in code with ink outlines.
// Pure module (no DOM), so tests can check every character and background a comic names.

const INK = '#2B2D42';
const OL = `stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
const p = (d, fill, extra = OL) => `<path d="${d}" fill="${fill}" ${extra}/>`;
const c = (cx, cy, r, fill, extra = OL) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const e = (cx, cy, rx, ry, fill, extra = OL) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r = (x, y, w, h, fill, rx = 0, extra = OL) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const ln = (x1, y1, x2, y2, color = INK, w = 2.4) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
// a limb: an ink outline under a coloured stroke
const limb = (d, color, w = 9) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 4.4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

export const FACES = ['smile', 'grin', 'laugh', 'shock', 'angry', 'sad', 'think', 'sly', 'worried', 'sleep', 'wink', 'chew'];
export const PROPS = ['umbrella', 'magnifier', 'phone', 'book', 'stick', 'kite', 'bat', 'plate', 'lantern', 'rose', 'camera', 'bag', 'notebook', 'glass', 'laddoo'];
export const ARMS = ['down', 'point', 'up', 'hips', 'chin', 'wave'];

// ---------- people ----------

function face(hx, hy, f, { kid, glasses, sun }) {
  const ex = 9;
  const ey = hy + 1;
  let s = '';
  // brows
  const brow = {
    angry: [`M${hx - 15} ${hy - 9} L${hx - 4} ${hy - 4}`, `M${hx + 15} ${hy - 9} L${hx + 4} ${hy - 4}`],
    sad: [`M${hx - 14} ${hy - 5} L${hx - 4} ${hy - 9}`, `M${hx + 14} ${hy - 5} L${hx + 4} ${hy - 9}`],
    worried: [`M${hx - 14} ${hy - 6} L${hx - 4} ${hy - 10}`, `M${hx + 14} ${hy - 6} L${hx + 4} ${hy - 10}`],
    think: [`M${hx - 14} ${hy - 7} Q${hx - 9} ${hy - 9} ${hx - 4} ${hy - 7}`, `M${hx + 4} ${hy - 12} Q${hx + 9} ${hy - 15} ${hx + 14} ${hy - 11}`],
    sly: [`M${hx - 14} ${hy - 6} L${hx - 4} ${hy - 6}`, `M${hx + 4} ${hy - 11} Q${hx + 9} ${hy - 14} ${hx + 14} ${hy - 10}`],
    shock: [`M${hx - 14} ${hy - 12} Q${hx - 9} ${hy - 16} ${hx - 4} ${hy - 12}`, `M${hx + 4} ${hy - 12} Q${hx + 9} ${hy - 16} ${hx + 14} ${hy - 12}`],
  }[f] || [`M${hx - 14} ${hy - 8} Q${hx - 9} ${hy - 11} ${hx - 4} ${hy - 8}`, `M${hx + 4} ${hy - 8} Q${hx + 9} ${hy - 11} ${hx + 14} ${hy - 8}`];
  s += brow.map((d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`).join('');
  // eyes
  const eyes = (x) => {
    if (sun) return '';
    if (f === 'laugh' || f === 'sleep' || f === 'grin') return `<path d="M${x - 4} ${ey + 1} Q${x} ${f === 'sleep' ? ey + 4 : ey - 3} ${x + 4} ${ey + 1}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    if (f === 'wink' && x > hx) return `<path d="M${x - 4} ${ey} H${x + 4}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    if (f === 'shock') return `<circle cx="${x}" cy="${ey}" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="${ey}" r="1.9" fill="${INK}"/>`;
    const look = f === 'sly' || f === 'think' ? 1.6 : 0;
    return `<ellipse cx="${x + look}" cy="${ey}" rx="2.9" ry="3.7" fill="${INK}"/><circle cx="${x + look + 1}" cy="${ey - 1.3}" r="1.1" fill="#fff"/>`;
  };
  s += eyes(hx - ex) + eyes(hx + ex);
  if (sun) s += r(hx - 16, ey - 5, 13, 9, '#1F2340', 3, '') + r(hx + 3, ey - 5, 13, 9, '#1F2340', 3, '') + ln(hx - 3, ey - 2, hx + 3, ey - 2, INK, 2);
  if (glasses) s += `<g fill="rgba(255,255,255,0.25)" stroke="${INK}" stroke-width="2"><circle cx="${hx - ex}" cy="${ey}" r="7"/><circle cx="${hx + ex}" cy="${ey}" r="7"/></g>` + ln(hx - 2, ey - 1, hx + 2, ey - 1, INK, 2);
  // nose
  s += `<path d="M${hx - 1} ${hy + 6} Q${hx + 3} ${hy + 10} ${hx - 1} ${hy + 11}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  // cheeks
  if (kid) s += `<ellipse cx="${hx - 13}" cy="${hy + 10}" rx="4" ry="2.4" fill="#FF8FA3" opacity="0.6"/><ellipse cx="${hx + 13}" cy="${hy + 10}" rx="4" ry="2.4" fill="#FF8FA3" opacity="0.6"/>`;
  // mouth
  const my = hy + 16;
  const m = {
    smile: `<path d="M${hx - 6} ${my} Q${hx} ${my + 5} ${hx + 6} ${my}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
    grin: `<path d="M${hx - 8} ${my - 1} Q${hx} ${my + 10} ${hx + 8} ${my - 1} Z" fill="#7A2E3A" stroke="${INK}" stroke-width="2"/><path d="M${hx - 6} ${my} H${hx + 6}" stroke="#fff" stroke-width="2.4"/>`,
    laugh: `<path d="M${hx - 9} ${my - 2} Q${hx} ${my + 13} ${hx + 9} ${my - 2} Z" fill="#7A2E3A" stroke="${INK}" stroke-width="2"/><ellipse cx="${hx}" cy="${my + 5}" rx="4" ry="2.2" fill="#FF8FA3"/>`,
    shock: `<ellipse cx="${hx}" cy="${my + 2}" rx="4.5" ry="5.5" fill="#7A2E3A" stroke="${INK}" stroke-width="2"/>`,
    angry: `<path d="M${hx - 7} ${my + 3} Q${hx} ${my - 3} ${hx + 7} ${my + 3}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`,
    sad: `<path d="M${hx - 6} ${my + 3} Q${hx} ${my - 2} ${hx + 6} ${my + 3}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
    worried: `<path d="M${hx - 6} ${my + 1} Q${hx - 3} ${my - 2} ${hx} ${my + 1} Q${hx + 3} ${my + 4} ${hx + 6} ${my + 1}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`,
    think: `<path d="M${hx - 3} ${my + 1} H${hx + 6}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
    sly: `<path d="M${hx - 6} ${my + 1} Q${hx + 2} ${my + 4} ${hx + 7} ${my - 2}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
    sleep: `<ellipse cx="${hx}" cy="${my + 1}" rx="3" ry="2.4" fill="#7A2E3A"/>`,
    wink: `<path d="M${hx - 6} ${my} Q${hx} ${my + 6} ${hx + 7} ${my - 1}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
  };
  s += m[f] || m.smile;
  return s;
}

function hairBack(o, hx, hy, hr) {
  const h = o.hairColor;
  switch (o.hair) {
    case 'bun':
      return c(hx + (o.bunSide ? 18 : 0), hy - hr - (o.bunSide ? -2 : 3), 10, h);
    case 'long':
      return p(`M${hx - hr - 2} ${hy - 4} Q${hx - hr - 6} ${hy + 30} ${hx - hr + 2} ${hy + 40} H${hx + hr - 2} Q${hx + hr + 6} ${hy + 30} ${hx + hr + 2} ${hy - 4} Z`, h);
    case 'ponytail':
      return p(`M${hx + hr - 6} ${hy - 12} Q${hx + hr + 20} ${hy - 6} ${hx + hr + 12} ${hy + 28} Q${hx + hr + 4} ${hy + 10} ${hx + hr - 8} ${hy + 2} Z`, h);
    default:
      return '';
  }
}

function hairFront(o, hx, hy, hr) {
  const h = o.hairColor;
  const cap = (dip = 6) => p(`M${hx - hr} ${hy - 1} Q${hx - hr + 1} ${hy - hr - 5} ${hx} ${hy - hr - 4} Q${hx + hr - 1} ${hy - hr - 5} ${hx + hr} ${hy - 1} Q${hx + 8} ${hy - hr + dip} ${hx - hr} ${hy - 1} Z`, h);
  const parted = p(`M${hx - hr} ${hy + 2} Q${hx - hr + 1} ${hy - hr - 5} ${hx} ${hy - hr - 3} Q${hx + hr - 1} ${hy - hr - 5} ${hx + hr} ${hy + 2} Q${hx + hr - 6} ${hy - hr + 8} ${hx} ${hy - hr + 4} Q${hx - hr + 6} ${hy - hr + 8} ${hx - hr} ${hy + 2} Z`, h);
  switch (o.hair) {
    case 'braids': {
      const plait = (x, dir) => {
        let s = '';
        for (let i = 0; i < 4; i++) s += e(x + dir * (i % 2 ? 2 : 0), hy + 10 + i * 9, 5.5, 6, h);
        return s + `<path d="M${x - 7} ${hy + 46} l7 -5 l7 5 l-7 4 z" fill="${o.ribbon || '#FF5A5F'}" stroke="${INK}" stroke-width="1.8"/>`;
      };
      return plait(hx - hr + 1, -1) + plait(hx + hr - 1, 1) + parted;
    }
    case 'bun':
    case 'long':
      return parted;
    case 'ponytail':
      return cap(4) + (o.band ? `<path d="M${hx - hr + 2} ${hy - 8} Q${hx} ${hy - hr - 6} ${hx + hr - 2} ${hy - 8}" fill="none" stroke="${o.band}" stroke-width="4"/>` : '');
    case 'short':
      return cap(8) + p(`M${hx - 10} ${hy - hr + 2} Q${hx - 2} ${hy - 8} ${hx + 8} ${hy - hr + 4}`, 'none', `stroke="${h}" stroke-width="6" stroke-linecap="round"`);
    case 'neat':
      return p(`M${hx - hr} ${hy - 2} Q${hx - hr} ${hy - hr - 5} ${hx + 2} ${hy - hr - 4} Q${hx + hr} ${hy - hr - 4} ${hx + hr} ${hy - 2} Q${hx + hr - 4} ${hy - 14} ${hx - 6} ${hy - hr + 4} Q${hx - hr + 4} ${hy - 12} ${hx - hr} ${hy - 2} Z`, h);
    case 'spiky':
      return p(`M${hx - hr} ${hy} L${hx - hr + 2} ${hy - hr} L${hx - 12} ${hy - hr - 12} L${hx - 6} ${hy - hr - 2} L${hx} ${hy - hr - 14} L${hx + 6} ${hy - hr - 2} L${hx + 14} ${hy - hr - 12} L${hx + hr - 2} ${hy - hr} L${hx + hr} ${hy} Q${hx} ${hy - hr + 4} ${hx - hr} ${hy} Z`, h);
    case 'curly':
      return [-18, -9, 0, 9, 18].map((dx, i) => c(hx + dx, hy - hr + 2 + (i % 2) * 3, 8, h)).join('') + c(hx - hr + 2, hy - 6, 6, h) + c(hx + hr - 2, hy - 6, 6, h);
    case 'bald':
      return p(`M${hx - hr - 1} ${hy + 4} Q${hx - hr - 3} ${hy - 8} ${hx - hr + 6} ${hy - 12}`, 'none', `stroke="${h}" stroke-width="6" stroke-linecap="round"`) + p(`M${hx + hr + 1} ${hy + 4} Q${hx + hr + 3} ${hy - 8} ${hx + hr - 6} ${hy - 12}`, 'none', `stroke="${h}" stroke-width="6" stroke-linecap="round"`);
    case 'crew':
      return p(`M${hx - hr + 1} ${hy - 6} Q${hx} ${hy - hr - 6} ${hx + hr - 1} ${hy - 6} Q${hx} ${hy - hr + 2} ${hx - hr + 1} ${hy - 6} Z`, h) + p(`M${hx + 2} ${hy - hr - 3} q4 -8 0 -12`, 'none', `stroke="${h}" stroke-width="3" stroke-linecap="round"`);
    case 'flat':
      return r(hx - hr + 1, hy - hr - 4, hr * 2 - 2, 12, h, 4);
    default:
      return cap();
  }
}

function hat(o, hx, hy, hr) {
  switch (o.hat) {
    case 'police':
      return p(`M${hx - hr - 2} ${hy - 10} Q${hx} ${hy - hr - 16} ${hx + hr + 2} ${hy - 10} Z`, '#C9A36B') + r(hx - hr - 4, hy - 12, hr * 2 + 8, 6, '#6B4F2A', 3) + c(hx, hy - hr - 4, 3.5, '#FFD43B');
    case 'topi':
      return p(`M${hx - hr + 2} ${hy - 12} L${hx - hr + 6} ${hy - hr - 8} H${hx + hr - 6} L${hx + hr - 2} ${hy - 12} Z`, '#F7F7F2');
    case 'cap':
      return p(`M${hx - hr} ${hy - 8} Q${hx} ${hy - hr - 12} ${hx + hr} ${hy - 8} Z`, o.hatColor || '#FF5A5F') + p(`M${hx + 4} ${hy - 10} H${hx + hr + 14} Q${hx + hr + 14} ${hy - 6} ${hx + hr} ${hy - 6} H${hx + 4} Z`, o.hatColor || '#FF5A5F');
    case 'saffa':
      return p(`M${hx - hr - 2} ${hy - 6} Q${hx - hr} ${hy - hr - 12} ${hx} ${hy - hr - 12} Q${hx + hr} ${hy - hr - 12} ${hx + hr + 2} ${hy - 6} Q${hx} ${hy - 12} ${hx - hr - 2} ${hy - 6} Z`, o.hatColor || '#FF9F1C') + p(`M${hx + hr - 2} ${hy - 10} q10 4 6 18`, 'none', `stroke="${o.hatColor || '#FF9F1C'}" stroke-width="5" stroke-linecap="round"`);
    case 'chef':
      return r(hx - 14, hy - hr - 16, 28, 14, '#fff', 4) + c(hx - 9, hy - hr - 18, 8, '#fff') + c(hx + 2, hy - hr - 22, 9, '#fff') + c(hx + 11, hy - hr - 17, 7, '#fff');
    default:
      return '';
  }
}

function moustache(o, hx, hy) {
  const m = o.moustache;
  const col = o.moColor || o.hairColor;
  const y = hy + 12;
  if (m === 'handlebar') return p(`M${hx} ${y} Q${hx - 10} ${y - 5} ${hx - 16} ${y + 1} Q${hx - 20} ${y - 6} ${hx - 22} ${y - 2} Q${hx - 18} ${y + 6} ${hx - 10} ${y + 3} Q${hx - 4} ${y + 3} ${hx} ${y + 1} Q${hx + 4} ${y + 3} ${hx + 10} ${y + 3} Q${hx + 18} ${y + 6} ${hx + 22} ${y - 2} Q${hx + 20} ${y - 6} ${hx + 16} ${y + 1} Q${hx + 10} ${y - 5} ${hx} ${y} Z`, col);
  if (m === 'thick') return p(`M${hx - 11} ${y + 3} Q${hx - 9} ${y - 4} ${hx} ${y - 1} Q${hx + 9} ${y - 4} ${hx + 11} ${y + 3} Q${hx} ${y + 1} ${hx - 11} ${y + 3} Z`, col);
  if (m === 'thin') return `<path d="M${hx - 9} ${y + 1} Q${hx} ${y - 3} ${hx + 9} ${y + 1}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (m === 'walrus') return p(`M${hx - 13} ${y + 7} Q${hx - 12} ${y - 5} ${hx} ${y - 2} Q${hx + 12} ${y - 5} ${hx + 13} ${y + 7} Q${hx} ${y + 2} ${hx - 13} ${y + 7} Z`, col);
  return '';
}

// hands end up here, per arm pose (right arm is the one on the viewer's right)
function armPoints(arms, sh, kid) {
  const [lx, rx, y] = sh;
  const low = kid ? 116 : 122;
  return (
    {
      down: [[[lx - 6, y + 22], [lx - 4, low]], [[rx + 6, y + 22], [rx + 4, low]]],
      point: [[[lx - 6, y + 22], [lx - 4, low]], [[rx + 16, y + 6], [rx + 30, y - 4]]],
      up: [[[lx - 14, y - 10], [lx - 10, y - 34]], [[rx + 14, y - 10], [rx + 10, y - 34]]],
      hips: [[[lx - 18, y + 18], [lx + 4, y + 36]], [[rx + 18, y + 18], [rx - 4, y + 36]]],
      chin: [[[lx - 6, y + 22], [lx - 4, low]], [[rx + 4, y + 26], [rx - 14, y - 6]]],
      wave: [[[lx - 6, y + 22], [lx - 4, low]], [[rx + 16, y - 2], [rx + 14, y - 30]]],
    }[arms] || null
  );
}

function prop(name, [x, y]) {
  switch (name) {
    case 'umbrella':
      return `<path d="M${x} ${y - 30} V${y + 30} q0 8 -7 8 q-6 0 -6 -6" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>` + p(`M${x - 5} ${y - 30} L${x} ${y - 48} L${x + 5} ${y - 30} Q${x + 6} ${y + 10} ${x} ${y + 14} Q${x - 6} ${y + 10} ${x - 5} ${y - 30} Z`, '#2B2D42', `stroke="${INK}" stroke-width="1.5"`);
    case 'magnifier':
      return ln(x, y, x + 12, y - 12, '#8A5A44', 4) + c(x + 18, y - 18, 9, 'rgba(207,239,255,0.7)', `stroke="${INK}" stroke-width="3"`);
    case 'phone':
      return r(x - 5, y - 12, 11, 18, '#2B2D42', 2.5) + r(x - 3, y - 10, 7, 13, '#7DD3FC', 1.5, '');
    case 'book':
      return r(x - 10, y - 8, 20, 15, '#FF5A5F', 2) + ln(x, y - 8, x, y + 7, INK, 1.6);
    case 'stick':
      return `<path d="M${x} ${y - 6} V${y + 70}" stroke="#8A5A44" stroke-width="4" stroke-linecap="round"/>`;
    case 'kite':
      return `<path d="M${x} ${y} L${x + 14} ${y - 30}" stroke="#fff" stroke-width="1"/>` + p(`M${x + 14} ${y - 52} L${x + 28} ${y - 34} L${x + 14} ${y - 16} L${x} ${y - 34} Z`, '#FF5A5F') + ln(x + 14, y - 52, x + 14, y - 16, INK, 1.4);
    case 'bat':
      return p(`M${x - 3} ${y + 4} L${x + 3} ${y + 4} L${x + 8} ${y - 40} Q${x + 2} ${y - 46} ${x - 4} ${y - 40} Z`, '#E8C27A');
    case 'plate':
      return e(x, y, 16, 5, '#D9DEE7') + c(x - 7, y - 5, 5, '#FFB703') + c(x + 2, y - 6, 5, '#FFB703') + c(x + 9, y - 4, 4.5, '#FFB703');
    case 'lantern':
      return r(x - 7, y - 4, 14, 18, '#FFE58A', 4) + `<path d="M${x - 6} ${y - 4} Q${x} ${y - 14} ${x + 6} ${y - 4}" fill="none" stroke="${INK}" stroke-width="2"/>`;
    case 'rose':
      return ln(x, y, x + 2, y - 22, '#2E9E5B', 3) + c(x + 2, y - 26, 6, '#E63946');
    case 'camera':
      return r(x - 11, y - 8, 22, 15, '#2B2D42', 3) + c(x + 1, y, 5, '#7DD3FC', `stroke="#fff" stroke-width="1.6"`);
    case 'bag':
      return r(x - 9, y - 4, 18, 16, '#8A5A44', 3);
    case 'notebook':
      return r(x - 8, y - 11, 16, 20, '#FFF3B0', 2) + ln(x - 5, y - 5, x + 5, y - 5, INK, 1.4) + ln(x - 5, y, x + 5, y, INK, 1.4);
    case 'glass':
      return p(`M${x - 6} ${y - 12} H${x + 6} L${x + 4} ${y + 6} H${x - 4} Z`, '#FFFFFF') + r(x - 5, y - 4, 10, 8, '#F1F5F9', 1, '');
    case 'laddoo':
      return c(x, y - 4, 7, '#FFB703');
    default:
      return '';
  }
}

// The figure: 120 x 200 box, feet on y = 194.
function figure(o, { face: f = 'smile', arms = 'down' } = {}) {
  const kid = !!o.kid;
  const hx = 60;
  const hy = kid ? 46 : 42;
  const hr = kid ? 27 : 24;
  const big = o.build === 'big';
  const round = o.build === 'round';
  const shW = big ? 30 : kid ? 17 : round ? 22 : 20;
  const shY = hy + hr + 6;
  const waist = kid ? 128 : 128;
  const sh = [hx - shW, hx + shW, shY + 4];
  const skin = o.skin || '#E0A774';
  const top = o.top || '#3D7BFF';
  const bot = o.bottom || '#3B4252';
  const sleeve = o.sleeves === 'long' ? top : o.sleeves === 'none' ? skin : top;
  let s = '';

  // ---- behind: hair, umbrella held behind
  s += hairBack(o, hx, hy, hr);

  // ---- legs and lower clothes
  const legL = `M${hx - 10} ${waist} V188`;
  const legR = `M${hx + 10} ${waist} V188`;
  const kind = o.lower || 'pants';
  if (kind === 'sari' || kind === 'lungi' || kind === 'long-skirt') {
    s += p(`M${hx - shW + 2} ${waist - 14} L${hx - shW - 6} 188 H${hx + shW + 6} L${hx + shW - 2} ${waist - 14} Z`, bot);
    if (kind === 'lungi') s += [0, 1, 2].map((i) => ln(hx - shW, 150 + i * 12, hx + shW, 150 + i * 12, 'rgba(0,0,0,0.25)', 2)).join('');
    if (o.border) s += p(`M${hx - shW - 6} 184 H${hx + shW + 6} V188 H${hx - shW - 6} Z`, o.border, '');
  } else if (kind === 'skirt' || kind === 'frock') {
    s += limb(legL, skin, 9) + limb(legR, skin, 9);
    s += p(`M${hx - shW + 1} ${waist - 18} L${hx - shW - 10} ${waist + 26} H${hx + shW + 10} L${hx + shW - 1} ${waist - 18} Z`, kind === 'frock' ? top : bot);
  } else if (kind === 'shorts') {
    s += limb(legL, skin, 10) + limb(legR, skin, 10);
    s += p(`M${hx - shW + 1} ${waist - 6} L${hx - shW - 2} ${waist + 24} H${hx - 1} V${waist + 4} H${hx + 1} V${waist + 24} H${hx + shW + 2} L${hx + shW - 1} ${waist - 6} Z`, bot);
  } else if (kind === 'pajama' || kind === 'dhoti') {
    s += p(`M${hx - shW + 1} ${waist - 6} L${hx - shW - 4} 188 H${hx - 2} L${hx} ${waist + 18} L${hx + 2} 188 H${hx + shW + 4} L${hx + shW - 1} ${waist - 6} Z`, bot);
  } else {
    s += limb(legL, bot, big ? 16 : 13) + limb(legR, bot, big ? 16 : 13);
  }
  // feet
  const shoe = o.shoes || INK;
  s += e(hx - 12, 191, 9, 4.5, shoe) + e(hx + 12, 191, 9, 4.5, shoe);

  // ---- arms (behind the body for the far shoulder look)
  const pts = armPoints(arms, sh, kid);
  const armW = big ? 12 : 8.5;
  const arm = ([sx, sy], [[ex, ey], [hx2, hy2]], side) => {
    const elbowColor = o.sleeves === 'long' ? sleeve : skin;
    const upper = `M${sx} ${sy} L${ex} ${ey}`;
    const lower = `M${ex} ${ey} L${hx2} ${hy2}`;
    return limb(upper, sleeve, armW) + limb(lower, elbowColor, armW - 1) + c(hx2, hy2, big ? 6.5 : 5, skin) + (side === 'r' && o.hold ? prop(o.hold, [hx2, hy2]) : '') + (side === 'l' && o.holdLeft ? prop(o.holdLeft, [hx2, hy2]) : '');
  };

  // ---- torso
  const longTop = o.topKind === 'kurta' || o.topKind === 'coat';
  const tb = longTop ? 156 : kind === 'sari' ? waist - 8 : waist;
  // a round build bulges at the belly; everyone else gets a straight torso
  const torso = round
    ? `M${hx - shW} ${shY + 4} Q${hx} ${shY - 4} ${hx + shW} ${shY + 4} Q${hx + shW + 16} ${shY + 36} ${hx + shW + 3} ${tb} H${hx - shW - 3} Q${hx - shW - 16} ${shY + 36} ${hx - shW} ${shY + 4} Z`
    : `M${hx - shW} ${shY + 4} Q${hx} ${shY - 4} ${hx + shW} ${shY + 4} L${hx + shW + 3} ${tb} H${hx - shW - 3} Z`;
  s += arm([sh[0], sh[2]], pts[0], 'l');
  s += p(torso, top);
  // details on the top
  switch (o.topKind) {
    case 'shirt':
      s += p(`M${hx - 8} ${shY - 1} L${hx} ${shY + 8} L${hx + 8} ${shY - 1}`, 'none', `stroke="${INK}" stroke-width="2" fill="none"`) + [0, 1, 2].map((i) => c(hx, shY + 16 + i * 12, 1.6, INK, '')).join('');
      break;
    case 'kurta':
      s += ln(hx, shY + 2, hx, shY + 22, INK, 1.8) + [0, 1].map((i) => c(hx + 3, shY + 8 + i * 8, 1.4, '#FFD43B', '')).join('');
      break;
    case 'uniform':
      s += r(hx - shW - 2, waist - 12, shW * 2 + 4, 7, '#6B4F2A', 0) + r(hx - 4, waist - 12, 8, 7, '#FFD43B', 1) + r(hx - shW + 5, shY + 10, 11, 10, 'none', 2) + r(hx + shW - 16, shY + 10, 11, 10, 'none', 2) + c(hx + shW - 10, shY + 6, 3, '#FFD43B');
      break;
    case 'coat':
      s += p(`M${hx - 9} ${shY} L${hx} ${shY + 26} L${hx + 9} ${shY}`, '#fff', `stroke="${INK}" stroke-width="2"`) + ln(hx, shY + 26, hx, 154, INK, 2);
      break;
    case 'vest':
      s += p(`M${hx - 9} ${shY - 2} Q${hx} ${shY + 14} ${hx + 9} ${shY - 2}`, 'none', `stroke="${INK}" stroke-width="2" fill="none"`);
      break;
    case 'blouse':
      break;
    default:
      if (o.emblem === 'star') s += `<polygon points="${starPts(hx, shY + 24, 8, 3.6)}" fill="#FFD43B" stroke="${INK}" stroke-width="1.6"/>`;
      if (o.emblem === 'stripe') s += r(hx - shW - 1, shY + 18, shW * 2 + 2, 7, 'rgba(255,255,255,0.75)', 0, '');
  }
  if (o.apron) s += p(`M${hx - 15} ${shY + 6} H${hx + 15} L${hx + 18} ${tb + 10} H${hx - 18} Z`, '#FFFFFF') + ln(hx - 15, shY + 6, hx - 9, shY - 2, INK, 1.8) + ln(hx + 15, shY + 6, hx + 9, shY - 2, INK, 1.8);
  if (o.pallu) s += p(`M${hx - shW} ${shY + 2} L${hx - shW + 10} ${shY - 2} L${hx + shW + 4} ${waist - 4} L${hx + shW - 6} ${waist + 6} Z`, o.pallu);
  if (o.shawl) s += p(`M${hx - shW - 3} ${shY + 2} Q${hx} ${shY + 18} ${hx + shW + 3} ${shY + 2} L${hx + shW + 6} ${shY + 34} Q${hx} ${shY + 44} ${hx - shW - 6} ${shY + 34} Z`, o.shawl);
  if (o.medal) s += c(hx - 9, shY + 16, 4, '#FFD43B') + r(hx - 11, shY + 6, 4, 6, '#E63946', 0, '');
  if (o.camera) s += `<path d="M${hx - 12} ${shY - 2} L${hx} ${shY + 20} L${hx + 12} ${shY - 2}" fill="none" stroke="${INK}" stroke-width="1.8"/>` + prop('camera', [hx, shY + 26]);
  s += arm([sh[1], sh[2]], pts[1], 'r');

  // ---- head
  s += r(hx - 6, hy + hr - 6, 12, 12, skin, 3);
  s += c(hx - hr + 1, hy + 4, 5, skin) + c(hx + hr - 1, hy + 4, 5, skin);
  s += c(hx, hy, hr, skin);
  if (o.earrings) s += c(hx - hr + 1, hy + 11, 2.4, '#FFD43B', '') + c(hx + hr - 1, hy + 11, 2.4, '#FFD43B', '');
  s += hairFront(o, hx, hy, hr);
  if (o.beard === 'stubble') s += `<path d="M${hx - 16} ${hy + 10} Q${hx} ${hy + 30} ${hx + 16} ${hy + 10}" fill="rgba(43,45,66,0.18)"/>`;
  if (o.beard === 'white') s += p(`M${hx - 18} ${hy + 8} Q${hx - 16} ${hy + 34} ${hx} ${hy + 36} Q${hx + 16} ${hy + 34} ${hx + 18} ${hy + 8} Q${hx} ${hy + 20} ${hx - 18} ${hy + 8} Z`, '#F1F1EE');
  s += face(hx, hy, f, { kid, glasses: o.glasses, sun: o.sunglasses });
  s += moustache(o, hx, hy);
  if (o.bindi) s += c(hx, hy - 11, 2.2, '#E63946', '');
  if (o.tilak) s += ln(hx, hy - 15, hx, hy - 8, '#E63946', 2.4);
  s += hat(o, hx, hy, hr);
  if (f === 'sleep') s += `<text x="${hx + 22}" y="${hy - 20}" font-size="14" font-weight="800" fill="${INK}">z</text>`;
  if (f === 'shock') s += `<path d="M${hx + hr + 4} ${hy - 18} l4 -6 M${hx + hr + 8} ${hy - 10} l6 -2" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  if (f === 'worried' || f === 'angry') s += `<path d="M${hx + hr - 3} ${hy - 14} q3 5 0 8 q-3 -3 0 -8 z" fill="#7DD3FC" stroke="${INK}" stroke-width="1.2"/>`;
  return s;
}

function starPts(cx, cy, r1, r2) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r2 : r1;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

// ---------- animals ----------

// Bijli, Mishti's goat: eats everything
function goat({ face: f = 'smile' } = {}) {
  let s = '';
  s += `<ellipse cx="60" cy="194" rx="40" ry="4" fill="#1E1B4B" opacity="0.12"/>`;
  s += [36, 48, 76, 88].map((x) => limb(`M${x} 160 V190`, '#F4F1EA', 6)).join('') + [36, 48, 76, 88].map((x) => r(x - 4, 188, 8, 5, INK, 1, '')).join('');
  s += p(`M92 142 q14 -6 10 -16`, 'none', `stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"`);
  s += e(62, 150, 34, 18, '#F4F1EA') + p('M70 136 q12 -2 16 8 q-8 8 -18 2 z', '#3B4252', '');
  // head
  s += p('M24 120 L18 104 L26 114 Z', '#C9B79C') + p('M38 118 L42 102 L44 116 Z', '#C9B79C');
  s += e(14, 134, 10, 5, '#F4F1EA', OL.replace('2.4', '2'));
  s += p('M20 118 Q34 112 42 124 Q46 140 38 150 Q30 158 22 154 Q12 148 14 132 Q15 122 20 118 Z', '#F4F1EA');
  s += p('M24 154 L22 168 L30 158 Z', '#C9B79C');
  const eyeY = 130;
  if (f === 'sleep') s += `<path d="M24 ${eyeY} q3 3 6 0 M34 ${eyeY} q3 3 6 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
  else if (f === 'shock') s += c(27, eyeY, 4, '#fff', `stroke="${INK}" stroke-width="1.8"`) + c(37, eyeY, 4, '#fff', `stroke="${INK}" stroke-width="1.8"`) + c(27, eyeY, 1.5, INK, '') + c(37, eyeY, 1.5, INK, '');
  else s += e(27, eyeY, 2.4, 3, INK, '') + e(37, eyeY, 2.4, 3, INK, '') + (f === 'sly' || f === 'grin' ? `<path d="M23 ${eyeY - 5} l8 2 M33 ${eyeY - 3} l8 -2" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` : '');
  s += e(29, 146, 5, 3, '#FFB4C2', '');
  if (f === 'chew') s += p('M24 148 q8 6 14 0', 'none', `stroke="${INK}" stroke-width="2" fill="none"`) + `<g transform="rotate(-12 18 150)">${r(6, 146, 16, 12, '#fff', 1)}${ln(9, 150, 19, 150, '#9AA3B5', 1.2)}${ln(9, 154, 17, 154, '#9AA3B5', 1.2)}</g>`;
  else if (f === 'shock') s += e(31, 149, 3, 3.6, '#7A2E3A', `stroke="${INK}" stroke-width="1.6"`);
  else s += `<path d="M25 148 q6 5 12 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  if (f === 'sleep') s += `<text x="44" y="112" font-size="14" font-weight="800" fill="${INK}">z z</text>`;
  s += r(46, 138, 8, 10, '#FF5A5F', 2, `stroke="${INK}" stroke-width="1.6"`) + c(50, 150, 3.4, '#FFD43B', `stroke="${INK}" stroke-width="1.4"`);
  return s;
}

// Mausi, Dadi's sharp-eyed cat
function cat({ face: f = 'smile' } = {}) {
  let s = '';
  s += `<ellipse cx="60" cy="194" rx="28" ry="4" fill="#1E1B4B" opacity="0.12"/>`;
  s += `<path d="M80 186 Q104 182 98 156" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M80 186 Q104 182 98 156" fill="none" stroke="#9AA3B5" stroke-width="6" stroke-linecap="round"/>`;
  s += p('M40 192 Q34 160 48 146 H72 Q86 160 80 192 Z', '#9AA3B5') + p('M52 192 Q50 170 60 164 Q70 170 68 192 Z', '#E5E7EB', '');
  s += p('M40 128 L42 104 L54 118 Z', '#9AA3B5') + p('M80 128 L78 104 L66 118 Z', '#9AA3B5');
  s += c(60, 132, 22, '#9AA3B5');
  s += [0, 1, 2].map((i) => `<path d="M${52 + i * 8} 112 v6" stroke="#6B7280" stroke-width="2.4" stroke-linecap="round"/>`).join('');
  if (f === 'sleep') s += `<path d="M47 131 q4 3 8 0 M65 131 q4 3 8 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
  else if (f === 'sly') s += e(51, 131, 4.5, 2.2, '#86EFAC', `stroke="${INK}" stroke-width="1.6"`) + e(69, 131, 4.5, 2.2, '#86EFAC', `stroke="${INK}" stroke-width="1.6"`);
  else s += e(51, 131, 4.5, 5, '#86EFAC', `stroke="${INK}" stroke-width="1.6"`) + e(69, 131, 4.5, 5, '#86EFAC', `stroke="${INK}" stroke-width="1.6"`) + e(51, 131, 1.4, 4, INK, '') + e(69, 131, 1.4, 4, INK, '');
  s += p('M57 139 h6 l-3 3 z', '#FF8FA3', '') + `<path d="M60 142 q-4 4 -8 2 M60 142 q4 4 8 2" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;
  s += [-1, 1].map((d) => `<path d="M${60 + d * 10} 140 l${d * 18} -3 M${60 + d * 10} 143 l${d * 18} 2" stroke="${INK}" stroke-width="1.2"/>`).join('');
  return s;
}

// ---------- the cast ----------
// Mishti series (Grade 7) and Jasoos Dadi series (Grade 8), plus a few look-presets for one-off parts.
const SK = { light: '#F2C29A', mid: '#E0A774', tan: '#C98D5A', deep: '#9C6644' };

export const CAST = {
  // मिष्टी की मस्ती
  mishti: { name: { hi: 'मिष्टी', en: 'Mishti' }, pitch: 1.35, kid: true, skin: SK.mid, hair: 'braids', hairColor: '#2B2D42', ribbon: '#FF5A5F', top: '#FFC233', emblem: 'star', lower: 'skirt', bottom: '#3D7BFF', shoes: '#FF5A5F' },
  bijli: { name: { hi: 'बिजली', en: 'Bijli the goat' }, pitch: 1.6, animal: 'goat' },
  buntu: { name: { hi: 'बंटू', en: 'Buntu' }, pitch: 1.15, kid: true, build: 'round', skin: SK.tan, hair: 'curly', hairColor: '#2B2D42', glasses: true, top: '#2EC27E', emblem: 'stripe', lower: 'shorts', bottom: '#8A5A44', shoes: '#3B4252' },
  colonel: { name: { hi: 'कर्नल कड़कसिंह', en: 'Colonel Kadak Singh' }, pitch: 0.75, skin: SK.light, hair: 'bald', hairColor: '#D9DEE7', moustache: 'handlebar', moColor: '#E5E7EB', topKind: 'shirt', top: '#5B7F3A', sleeves: 'long', lower: 'pants', bottom: '#3E4A2C', medal: true, shoes: '#3B2F2F' },
  mummy: { name: { hi: 'मम्मी', en: "Mishti's mother" }, pitch: 1.1, skin: SK.mid, hair: 'bun', bunSide: true, hairColor: '#2B2D42', bindi: true, earrings: true, topKind: 'blouse', top: '#A66BFF', lower: 'sari', bottom: '#C4A5FF', pallu: '#A66BFF', border: '#FFD43B', shoes: '#8A5A44' },
  papa: { name: { hi: 'पापा', en: "Mishti's father" }, pitch: 0.9, skin: SK.tan, hair: 'neat', hairColor: '#2B2D42', moustache: 'thick', topKind: 'shirt', top: '#7DA2F5', sleeves: 'long', lower: 'pants', bottom: '#3B4252' },
  dadaji: { name: { hi: 'दादाजी', en: 'Grandpa' }, pitch: 0.8, skin: SK.mid, hair: 'bald', hairColor: '#F1F1EE', glasses: true, moustache: 'walrus', moColor: '#F1F1EE', topKind: 'kurta', top: '#F7F7F2', sleeves: 'long', lower: 'pajama', bottom: '#F7F7F2', hold: 'stick', shoes: '#8A5A44' },
  laddoolal: { name: { hi: 'लड्डू लाल', en: 'Laddoo Lal, the sweet seller' }, pitch: 0.85, build: 'round', skin: SK.mid, hair: 'bald', hairColor: '#2B2D42', moustache: 'thick', tilak: true, topKind: 'vest', top: '#F7F7F2', apron: true, lower: 'dhoti', bottom: '#F7F7F2', shoes: '#8A5A44' },
  teacher: { name: { hi: 'शुक्ला मैडम', en: 'Mrs Shukla, the teacher' }, pitch: 1.05, skin: SK.light, hair: 'bun', hairColor: '#3B2F2F', glasses: true, bindi: true, topKind: 'blouse', top: '#2EC27E', lower: 'sari', bottom: '#86EFAC', pallu: '#2EC27E', border: '#FF5A5F', shoes: '#3B4252' },
  rocky: { name: { hi: 'रॉकी', en: 'Rocky' }, pitch: 1.1, kid: true, skin: SK.light, hair: 'spiky', hairColor: '#8A5A44', sunglasses: true, top: '#FF5A5F', lower: 'pants', bottom: '#2B2D42', shoes: '#fff' },
  guddu: { name: { hi: 'गुड्डू', en: 'Guddu' }, pitch: 1.5, kid: true, skin: SK.tan, hair: 'short', hairColor: '#2B2D42', top: '#FF9F1C', lower: 'shorts', bottom: '#3D7BFF', shoes: '#FF5A5F' },

  // जासूस दादी
  dadi: { name: { hi: 'दादी', en: 'Dadi' }, pitch: 0.95, skin: SK.mid, hair: 'bun', hairColor: '#ECECEC', glasses: true, earrings: true, topKind: 'blouse', top: '#E0F2FE', lower: 'sari', bottom: '#F8FAFC', pallu: '#93C5FD', border: '#3D7BFF', shawl: '#7C3AED', hold: 'umbrella', shoes: '#8A5A44' },
  roohi: { name: { hi: 'रूही', en: 'Roohi' }, pitch: 1.3, kid: true, skin: SK.mid, hair: 'ponytail', hairColor: '#2B2D42', band: '#FF5A5F', top: '#A66BFF', lower: 'pants', bottom: '#3D7BFF', shoes: '#fff', hold: 'phone' },
  pappu: { name: { hi: 'पहलवान पप्पू', en: 'Pappu the wrestler' }, pitch: 0.65, build: 'big', skin: SK.tan, hair: 'crew', hairColor: '#2B2D42', moustache: 'thick', topKind: 'vest', top: '#FF9F1C', sleeves: 'none', lower: 'pajama', bottom: '#F7F7F2', shoes: '#8A5A44' },
  mausi: { name: { hi: 'मौसी', en: "Mausi, Dadi's cat" }, pitch: 1.5, animal: 'cat' },
  inspector: { name: { hi: 'इंस्पेक्टर ढीलाराम', en: 'Inspector Dheelaram' }, pitch: 0.8, build: 'round', skin: SK.mid, hair: 'flat', hairColor: '#2B2D42', moustache: 'thick', hat: 'police', topKind: 'uniform', top: '#C9A36B', sleeves: 'long', lower: 'pants', bottom: '#A88552', shoes: '#3B2F2F' },
  chhedilal: { name: { hi: 'छलिया छेदीलाल', en: 'Chhedilal, master of disguise' }, pitch: 0.95, skin: SK.light, hair: 'neat', hairColor: '#2B2D42', moustache: 'thin', topKind: 'coat', top: '#4B5563', sleeves: 'long', lower: 'pants', bottom: '#1F2937', shoes: '#111827' },

  // look-presets for one-off parts (a comic gives them a name)
  'man-a': { pitch: 0.9, skin: SK.mid, hair: 'neat', hairColor: '#2B2D42', topKind: 'shirt', top: '#F59E0B', sleeves: 'long', lower: 'pants', bottom: '#374151' },
  'man-b': { pitch: 0.8, skin: SK.tan, hair: 'bald', hairColor: '#4B5563', moustache: 'thick', topKind: 'kurta', top: '#FDE68A', sleeves: 'long', lower: 'pajama', bottom: '#F7F7F2' },
  'man-c': { pitch: 0.95, skin: SK.light, hair: 'short', hairColor: '#3B2F2F', beard: 'stubble', topKind: 'shirt', top: '#60A5FA', sleeves: 'long', lower: 'pants', bottom: '#1F2937', camera: true },
  'man-d': { pitch: 0.85, skin: SK.deep, hair: 'neat', hairColor: '#111827', moustache: 'thin', topKind: 'coat', top: '#7C2D12', sleeves: 'long', lower: 'pants', bottom: '#1F2937' },
  'man-old': { pitch: 0.75, skin: SK.mid, hair: 'bald', hairColor: '#E5E7EB', beard: 'white', topKind: 'kurta', top: '#E5E7EB', sleeves: 'long', lower: 'dhoti', bottom: '#F7F7F2', hold: 'stick' },
  guard: { pitch: 0.8, skin: SK.tan, hair: 'short', hairColor: '#111827', moustache: 'thick', hat: 'cap', hatColor: '#1E3A8A', topKind: 'uniform', top: '#1E3A8A', sleeves: 'long', lower: 'pants', bottom: '#1E3A8A' },
  chef: { pitch: 0.9, build: 'round', skin: SK.mid, hair: 'short', hairColor: '#111827', hat: 'chef', topKind: 'shirt', top: '#FFFFFF', sleeves: 'long', apron: true, lower: 'pants', bottom: '#374151' },
  'woman-a': { pitch: 1.15, skin: SK.light, hair: 'long', hairColor: '#3B2F2F', bindi: true, earrings: true, topKind: 'kurta', top: '#F472B6', sleeves: 'long', lower: 'pants', bottom: '#FBCFE8' },
  'woman-b': { pitch: 1.05, skin: SK.tan, hair: 'bun', hairColor: '#111827', bindi: true, topKind: 'blouse', top: '#FB923C', lower: 'sari', bottom: '#FDBA74', pallu: '#EA580C', border: '#16A34A' },
  'boy-a': { pitch: 1.35, kid: true, skin: SK.mid, hair: 'short', hairColor: '#111827', top: '#22C55E', lower: 'shorts', bottom: '#1F2937' },
  'girl-a': { pitch: 1.4, kid: true, skin: SK.tan, hair: 'ponytail', hairColor: '#111827', band: '#22C55E', top: '#F472B6', lower: 'frock' },
  sadhu: { pitch: 0.9, skin: SK.mid, hair: 'long', hairColor: '#4B5563', beard: 'white', tilak: true, topKind: 'kurta', top: '#F97316', sleeves: 'long', lower: 'dhoti', bottom: '#F97316', shoes: '#111827' },
};
export const CAST_IDS = Object.keys(CAST);

// One character, as an SVG string in a 120 x 200 box (feet at the bottom). `who` may be a cast id
// or a look-preset; `as` dresses someone in another look (a disguise) while keeping their name.
export function castSvg(who, { face: f = 'smile', arms = 'down', hold, scale, over } = {}) {
  const o = CAST[who] && over ? { ...CAST[who], ...over } : CAST[who];
  if (!o) return '';
  if (o.animal) return `<svg viewBox="0 0 120 200" aria-hidden="true">${o.animal === 'goat' ? goat({ face: f }) : cat({ face: f })}</svg>`;
  const k = scale ?? (o.kid ? 0.8 : o.build === 'big' ? 1 : 0.9);
  const body = figure(hold ? { ...o, hold } : o, { face: f, arms });
  const shadow = `<ellipse cx="60" cy="194" rx="${o.build === 'big' ? 34 : 26}" ry="4" fill="#1E1B4B" opacity="0.12"/>`;
  return `<svg viewBox="0 0 120 200" aria-hidden="true">${shadow}<g transform="translate(60 194) scale(${k}) translate(-60 -194)">${body}</g></svg>`;
}

// For the picture library (200 x 140): head and shoulders, so characters work as icons and stickers.
export const COMIC_ART = Object.fromEntries(
  ['mishti', 'bijli', 'buntu', 'colonel', 'laddoolal', 'rocky', 'dadaji', 'teacher', 'mummy', 'papa', 'dadi', 'roohi', 'pappu', 'mausi', 'inspector', 'chhedilal'].map((id) => [
    `comic-${id}`,
    () => {
      const o = CAST[id];
      if (o.animal === 'goat') return `<g transform="translate(46 -150) scale(1.45)">${goat({ face: 'grin' })}</g>`;
      if (o.animal === 'cat') return `<g transform="translate(20 -152) scale(1.4)">${cat({ face: 'smile' })}</g>`;
      return `<g transform="translate(40 ${o.kid ? -14 : -4}) scale(1)">${figure(o, { face: 'smile', arms: 'down' })}</g>`;
    },
  ]),
);

// clue cards for the detective's collection (200 x 140)
COMIC_ART['comic-clue-lens'] = () => `<ellipse cx="100" cy="128" rx="60" ry="6" fill="#1E1B4B" opacity="0.08"/>` + ln(118, 88, 156, 124, '#8A5A44', 14) + c(92, 62, 40, 'rgba(207,239,255,0.65)', `stroke="${INK}" stroke-width="9"`) + p('M72 46 q10 -12 26 -12', 'none', `stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"`);
COMIC_ART['comic-clue-print'] = () => `<g fill="none" stroke="#4F46E5" stroke-width="5" stroke-linecap="round">${[14, 26, 38, 50].map((r) => `<path d="M${100 - r} ${70 + r * 0.3} Q${100 - r} ${70 - r * 1.2} 100 ${70 - r * 1.1} Q${100 + r} ${70 - r * 1.2} ${100 + r} ${70 + r * 0.4}"/>`).join('')}<path d="M100 60 V100 M88 74 Q88 110 70 118 M112 74 Q112 104 128 116"/></g>`;
COMIC_ART['comic-clue-steps'] = () => [[56, 96, -10], [92, 66, 8], [126, 92, -6], [160, 60, 10]].map(([x, y, a]) => `<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="11" ry="17" fill="#8A5A44"/>${[0, 1, 2, 3].map((k) => `<circle cx="${x - 9 + k * 6}" cy="${y - 22 - (k === 1 || k === 2 ? 3 : 0)}" r="3.4" fill="#8A5A44"/>`).join('')}</g>`).join('');
COMIC_ART['comic-clue-key'] = () => `<ellipse cx="100" cy="128" rx="60" ry="6" fill="#1E1B4B" opacity="0.08"/>` + c(62, 70, 26, '#FFC233', `stroke="${INK}" stroke-width="5"`) + c(62, 70, 9, '#FFF8E7', `stroke="${INK}" stroke-width="4"`) + r(86, 64, 82, 13, '#FFC233', 4, `stroke="${INK}" stroke-width="4"`) + r(144, 76, 9, 18, '#FFC233', 2, `stroke="${INK}" stroke-width="4"`) + r(126, 76, 9, 13, '#FFC233', 2, `stroke="${INK}" stroke-width="4"`);

// ---------- panel backgrounds (400 x 300, cropped to fit each panel) ----------

const sky = (top, bottom) => `<defs><linearGradient id="g${top.slice(1)}${bottom.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g${top.slice(1)}${bottom.slice(1)})"/>`;
const plain = (fill) => `<rect width="400" height="300" fill="${fill}"/>`;
const floor = (y, fill) => `<rect x="0" y="${y}" width="400" height="${300 - y}" fill="${fill}"/>`;
const n = (x, y, w, h, fill, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const sign = (x, y, w, text, bg = '#FFD43B', fg = '#7C2D12', size = 15) => n(x, y, w, 26, bg, 4) + `<text x="${x + w / 2}" y="${y + 18}" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="${size}" fill="${fg}">${text}</text>`;
const windowFrame = (x, y, w, h, glass = '#BFE6FF') => n(x - 5, y - 5, w + 10, h + 10, '#8A5A44', 4) + n(x, y, w, h, glass, 2) + `<line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#8A5A44" stroke-width="4"/><line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#8A5A44" stroke-width="4"/>`;
const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-6" y="0" width="12" height="60" fill="#8A5A44"/><circle cx="0" cy="-10" r="34" fill="#4CAF50"/><circle cx="-22" cy="8" r="22" fill="#43A047"/><circle cx="22" cy="6" r="24" fill="#66BB6A"/></g>`;
const house = (x, w, h, col, roof = '#B45309') => n(x, 300 - 90 - h, w, h + 90, col) + n(x - 4, 300 - 96 - h, w + 8, 10, roof) + n(x + w * 0.2, 300 - 70 - h, w * 0.25, 30, '#BFE6FF', 3) + n(x + w * 0.58, 300 - 70 - h, w * 0.25, 30, '#BFE6FF', 3) + n(x + w * 0.1, 300 - 112, w * 0.8, 6, '#8A5A44') + [0, 1, 2, 3, 4].map((i) => n(x + w * 0.12 + i * w * 0.18, 300 - 112, 3, 18, '#8A5A44')).join('');

export const BACKGROUNDS = {
  room: () => plain('#FDE7C7') + floor(220, '#C08457') + windowFrame(40, 50, 90, 80) + n(30, 40, 20, 110, '#E76F51', 6) + n(120, 40, 20, 110, '#E76F51', 6) + n(240, 60, 70, 52, '#fff', 3) + n(246, 66, 58, 40, '#86C5F5', 2) + `<circle cx="290" cy="80" r="8" fill="#FFD43B"/>` + n(200, 170, 170, 60, '#3D7BFF', 14) + n(196, 156, 178, 26, '#5B8DEF', 12) + `<circle cx="360" cy="30" r="14" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M360 22 v8 l6 4" stroke="${INK}" stroke-width="2.5" fill="none"/>`,
  kitchen: () => plain('#E0F2F1') + floor(220, '#B0BEC5') + n(0, 150, 400, 70, '#8D6E63') + n(0, 144, 400, 10, '#BCAAA4') + [40, 120, 200, 280].map((x) => n(x, 40, 60, 60, '#A1887F', 4)).join('') + `<ellipse cx="300" cy="138" rx="34" ry="8" fill="#455A64"/><rect x="270" y="110" width="60" height="28" rx="6" fill="#90A4AE"/>`,
  classroom: () => plain('#FFF3D6') + floor(230, '#D7A86E') + n(70, 30, 260, 120, '#2E5E4E', 6) + n(64, 24, 272, 132, 'none', 8).replace('fill="none"', `fill="none" stroke="#8A5A44" stroke-width="8"`) + `<text x="200" y="80" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-size="26" font-weight="700" fill="#F1F5F9">आज का पाठ</text><path d="M110 110 H290" stroke="#E2E8F0" stroke-width="3" stroke-dasharray="10 8"/>` + [20, 290].map((x) => n(x, 200, 90, 14, '#8A5A44', 3) + n(x + 6, 214, 8, 40, '#6D4C41') + n(x + 76, 214, 8, 40, '#6D4C41')).join(''),
  street: () => sky('#BDE3FF', '#FFF4E0') + house(0, 110, 40, '#F9C74F') + house(120, 120, 70, '#90BE6D', '#577590') + house(250, 150, 30, '#F8961E') + floor(250, '#9AA3B5') + n(0, 244, 400, 8, '#C9CED9') + `<path d="M0 60 Q200 90 400 50" fill="none" stroke="${INK}" stroke-width="1.5"/><rect x="236" y="40" width="8" height="210" fill="#6B7280"/>`,
  bazaar: () => sky('#FFE3B3', '#FFF7E6') + [0, 135, 270].map((x, i) => n(x + 4, 90, 126, 160, ['#F4A261', '#E9C46A', '#E76F51'][i]) + `<path d="M${x} 90 h134 l-8 26 h-118 z" fill="${['#2A9D8F', '#E63946', '#264653'][i]}"/>` + [0, 1, 2, 3, 4, 5].map((k) => `<path d="M${x + 8 + k * 22} 116 l11 -26 l11 26 z" fill="#fff" opacity="0.5"/>`).join('') + n(x + 18, 150, 98, 70, '#FFF8E7', 4)).join('') + sign(14, 60, 110, 'लड्डू भंडार') + sign(150, 60, 104, 'किराना', '#fff', '#E63946') + sign(284, 60, 104, 'खिलौने', '#A7F3D0', '#065F46') + floor(250, '#C2A27A'),
  park: () => sky('#BDE3FF', '#E8F8E0') + `<circle cx="340" cy="50" r="26" fill="#FFE27A"/>` + tree(70, 140, 1.1) + tree(320, 150, 0.9) + floor(200, '#8BC34A') + `<path d="M150 300 Q190 240 230 200 H260 Q230 240 220 300 Z" fill="#E7D3A8"/>` + n(250, 190, 100, 12, '#8A5A44', 3) + n(258, 202, 8, 26, '#6D4C41') + n(334, 202, 8, 26, '#6D4C41'),
  garden: () => sky('#CFEFFF', '#F1FBEA') + floor(190, '#7CB342') + `<g>${Array.from({ length: 9 }, (_, i) => `<line x1="${10 + i * 48}" y1="150" x2="${10 + i * 48}" y2="215" stroke="#F5F5F5" stroke-width="7"/>`).join('')}<line x1="0" y1="165" x2="400" y2="165" stroke="#F5F5F5" stroke-width="6"/><line x1="0" y1="195" x2="400" y2="195" stroke="#F5F5F5" stroke-width="6"/></g>` + Array.from({ length: 7 }, (_, i) => `<g transform="translate(${30 + i * 56} 230)"><path d="M0 0 V-26" stroke="#2E7D32" stroke-width="4"/><circle cx="0" cy="-30" r="10" fill="${['#E63946', '#FF8FA3', '#E63946', '#FFD43B'][i % 4]}"/></g>`).join('') + house(300, 100, 60, '#FFF3E0', '#8D6E63'),
  terrace: () => sky('#8FD3FF', '#FFF0D9') + floor(210, '#BDBDBD') + n(0, 196, 400, 18, '#9E9E9E') + n(300, 120, 70, 80, '#424242', 6) + `<text x="335" y="165" text-anchor="middle" font-size="14" fill="#fff" font-weight="700">टंकी</text>` + [[80, 60, '#FF5A5F'], [180, 40, '#3D7BFF'], [250, 90, '#FFD43B']].map(([x, y, col]) => `<path d="M${x} ${y} l14 18 l-14 18 l-14 -18 z" fill="${col}"/><path d="M${x} ${y + 36} q10 30 -6 60" fill="none" stroke="#fff" stroke-width="1"/>`).join(''),
  fair: () => sky('#FFD6E7', '#FFF1D6') + `<g transform="translate(300 120)"><circle r="80" fill="none" stroke="#FF8FB1" stroke-width="8"/>${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="0" y1="0" x2="${80 * Math.cos(i)}" y2="${80 * Math.sin(i)}" stroke="#fff" stroke-width="4"/><circle cx="${80 * Math.cos(i)}" cy="${80 * Math.sin(i)}" r="12" fill="${['#FF5A5F', '#FFC233', '#2EC27E', '#3D7BFF', '#A66BFF', '#FF8FB1'][i]}"/>`).join('')}</g>` + [0, 110].map((x, i) => n(x + 10, 140, 100, 90, ['#F4A261', '#2A9D8F'][i]) + `<path d="M${x + 4} 140 h112 l-10 -30 h-92 z" fill="${['#E63946', '#FFD43B'][i]}"/>`).join('') + sign(20, 150, 80, 'जलेबी', '#fff', '#E63946', 14) + floor(240, '#D4B483'),
  night: () => plain('#1E2A4A') + `<circle cx="330" cy="60" r="28" fill="#FFF3B0"/><circle cx="318" cy="52" r="26" fill="#1E2A4A"/>` + Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 73) % 400}" cy="${20 + ((i * 37) % 90)}" r="1.6" fill="#fff"/>`).join('') + [0, 90, 200, 300].map((x, i) => n(x, 120 - i * 10, 90, 180, ['#2C3E66', '#34497A', '#2A3A60', '#3B4F84'][i]) + [0, 1, 2].map((k) => n(x + 14 + k * 24, 140 - i * 10, 12, 16, k === i % 3 ? '#FFE58A' : '#1A2442', 2)).join('')).join('') + floor(250, '#2B2D42') + n(60, 120, 6, 130, '#6B7280') + `<path d="M48 120 h30 l-6 12 h-18 z" fill="#FFE58A"/><path d="M40 132 L20 250 H110 L86 132 Z" fill="#FFE58A" opacity="0.18"/>`,
  train: () => plain('#E8DCC4') + n(0, 0, 400, 30, '#B39B72') + windowFrame(150, 60, 110, 70, '#9ED8F5') + `<path d="M160 100 h40 M210 85 h40 M170 115 h70" stroke="#fff" stroke-width="3" opacity="0.8"/>` + n(0, 150, 130, 18, '#2E7D6B', 4) + n(0, 168, 130, 60, '#1F6F5C', 4) + n(270, 150, 130, 18, '#2E7D6B', 4) + n(270, 168, 130, 60, '#1F6F5C', 4) + n(0, 40, 130, 14, '#2E7D6B', 3) + n(270, 40, 130, 14, '#2E7D6B', 3) + floor(240, '#8D7B68'),
  station: () => sky('#CDE7FF', '#FFF7E8') + n(0, 70, 400, 14, '#B91C1C') + [30, 160, 290].map((x) => n(x, 84, 12, 120, '#7F1D1D')).join('') + `<rect x="180" y="96" width="70" height="26" rx="4" fill="#fff" stroke="${INK}" stroke-width="2"/><text x="215" y="114" text-anchor="middle" font-size="14" font-weight="800" font-family="'Baloo 2', sans-serif" fill="${INK}">प्लेटफ़ॉर्म 2</text>` + n(0, 150, 400, 70, '#3B82F6') + [10, 70, 130, 190, 250, 310, 370].map((x) => n(x, 162, 40, 28, '#BFE6FF', 4)).join('') + floor(220, '#9CA3AF') + n(0, 216, 400, 8, '#FACC15'),
  museum: () => plain('#F3EBDD') + floor(230, '#B8A07E') + [30, 330].map((x) => n(x, 20, 40, 210, '#E7DCC8') + n(x - 6, 14, 52, 12, '#D6C7AA') + n(x - 6, 224, 52, 10, '#D6C7AA')).join('') + n(150, 150, 100, 80, '#D6C7AA', 4) + `<path d="M175 150 Q170 110 200 96 Q230 110 225 150 Z" fill="#C49A3A" stroke="${INK}" stroke-width="2"/><circle cx="200" cy="88" r="14" fill="#C49A3A" stroke="${INK}" stroke-width="2"/>` + n(95, 50, 50, 64, '#8A5A44', 3) + n(100, 55, 40, 54, '#93C5FD', 2) + n(255, 50, 50, 64, '#8A5A44', 3) + n(260, 55, 40, 54, '#FCA5A5', 2) + `<path d="M140 228 h120" stroke="#E63946" stroke-width="3"/>`,
  wedding: () => plain('#FFF1E6') + `<path d="M0 0 H400 V40 Q200 90 0 40 Z" fill="#E63946"/>` + Array.from({ length: 9 }, (_, i) => `<g transform="translate(${20 + i * 46} 50)">${[0, 1, 2, 3].map((k) => `<circle cx="0" cy="${k * 14}" r="7" fill="${k % 2 ? '#FFB703' : '#FB8500'}"/>`).join('')}</g>`).join('') + Array.from({ length: 12 }, (_, i) => `<circle cx="${15 + i * 34}" cy="${30 + (i % 2) * 6}" r="3" fill="#FFF3B0"/>`).join('') + floor(220, '#C1121F') + [60, 160, 260, 340].map((x) => n(x, 180, 34, 40, '#FFD6A5', 6)).join(''),
  police: () => plain('#E6EEF5') + floor(230, '#94A3B8') + n(40, 40, 120, 90, '#C4A484', 4) + [0, 1, 2].map((i) => n(50 + i * 36, 50 + (i % 2) * 20, 30, 24, '#FFF8E7', 2)).join('') + `<text x="100" y="125" text-anchor="middle" font-size="12" font-weight="800" fill="#7C2D12">सूचना</text>` + n(220, 30, 140, 30, '#1E3A8A', 4) + `<text x="290" y="51" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-size="16" font-weight="800" fill="#fff">पुलिस थाना</text>` + n(200, 170, 180, 18, '#6D4C41', 3) + n(210, 188, 160, 42, '#8D6E63') + `<circle cx="200" cy="12" r="0"/><g stroke="#475569" stroke-width="4"><line x1="300" y1="0" x2="300" y2="22"/><line x1="270" y1="24" x2="330" y2="24"/></g>`,
  haveli: () => plain('#F5DEB3') + floor(230, '#D2B48C') + [20, 150, 280].map((x) => `<path d="M${x} 230 V90 Q${x + 50} 30 ${x + 100} 90 V230" fill="#E8C994" stroke="#A0522D" stroke-width="6"/><path d="M${x + 20} 230 V110 Q${x + 50} 70 ${x + 80} 110 V230" fill="#6B4226"/>`).join('') + `<line x1="200" y1="0" x2="200" y2="40" stroke="#A0522D" stroke-width="3"/><path d="M180 40 h40 l-8 18 h-24 z" fill="#FFD43B" stroke="${INK}" stroke-width="2"/>`,
  ground: () => sky('#BDE3FF', '#E6F8D8') + n(0, 120, 400, 180, '#7CB342') + [0, 1, 2, 3, 4, 5].map((i) => n(0, 120 + i * 30, 400, 15, i % 2 ? '#8BC34A' : '#7CB342')).join('') + n(170, 180, 60, 100, '#E7D3A8') + [188, 198, 208].map((x) => n(x, 180, 4, 34, '#F5F5F5')).join('') + `<path d="M20 120 V70 H140 V120" fill="#fff" stroke="#9E9E9E" stroke-width="3"/><path d="M10 72 L80 40 L150 72 Z" fill="#E63946"/>`,
  dairy: () => sky('#D7F0FF', '#FFF8E6') + n(0, 100, 260, 130, '#BC6C25') + `<path d="M-10 104 L130 50 L270 104 Z" fill="#7F4F24"/>` + n(30, 140, 70, 90, '#6F4518') + sign(120, 120, 120, 'शुद्ध दूध डेयरी', '#fff', '#1D4ED8', 13) + [290, 330, 370].map((x) => n(x - 14, 180, 28, 46, '#CBD5E1', 6) + n(x - 10, 172, 20, 10, '#94A3B8', 3)).join('') + floor(230, '#A3B18A'),
  bank: () => plain('#EEF2FF') + floor(230, '#CBD5E1') + n(0, 120, 400, 110, '#6366F1') + n(0, 110, 400, 14, '#4338CA') + [40, 160, 280].map((x) => n(x, 40, 80, 70, '#C7D2FE', 2) + `<line x1="${x}" y1="40" x2="${x}" y2="110" stroke="#4338CA" stroke-width="3"/><line x1="${x + 80}" y1="40" x2="${x + 80}" y2="110" stroke="#4338CA" stroke-width="3"/>`).join('') + sign(130, 10, 140, 'नगर बैंक', '#fff', '#4338CA', 15),
  village: () => sky('#BFE6FF', '#F3FBE8') + `<circle cx="320" cy="60" r="26" fill="#FFE27A"/>` + `<path d="M0 200 Q100 170 200 200 T400 200 V300 H0 Z" fill="#A9D96A"/>` + [[40, 120], [250, 110]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="0" y="40" width="90" height="60" fill="#E9C9A0"/><path d="M-12 44 L45 0 L102 44 Z" fill="#B07A35"/><rect x="34" y="62" width="22" height="38" fill="#8A5A44"/></g>`).join('') + tree(200, 170, 0.7),
  school: () => sky('#CFEFFF', '#FFF8EA') + n(40, 70, 320, 150, '#F4A261') + n(30, 60, 340, 16, '#B5651D') + [70, 140, 240, 310].map((x) => n(x, 100, 40, 34, '#BFE6FF', 3)).join('') + n(180, 150, 40, 70, '#8A5A44', 2) + sign(130, 26, 140, 'सरकारी स्कूल', '#fff', '#B5651D', 14) + floor(220, '#D4B483'),
  stage: () => plain('#3B0764') + `<path d="M0 0 H400 V30 Q300 60 200 30 Q100 60 0 30 Z" fill="#B91C1C"/>` + n(0, 0, 40, 300, '#991B1B') + n(360, 0, 40, 300, '#991B1B') + `<path d="M120 0 L80 230 H320 L280 0 Z" fill="#FDE68A" opacity="0.18"/>` + floor(225, '#92400E'),
};
export const BACKGROUND_IDS = Object.keys(BACKGROUNDS);

export function comicBg(id) {
  const fn = BACKGROUNDS[id];
  return fn ? `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${fn()}</svg>` : '';
}
