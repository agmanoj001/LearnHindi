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
export const PROPS = ['umbrella', 'magnifier', 'phone', 'book', 'stick', 'kite', 'bat', 'plate', 'lantern', 'rose', 'camera', 'bag', 'notebook', 'glass', 'laddoo', 'sword', 'scroll', 'diya', 'lemon', 'flask', 'pot', 'mango', 'coins', 'candle', 'trophy', 'mirror', 'apple'];
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
    case 'bob':
      return p(`M${hx - hr - 4} ${hy - 4} Q${hx - hr - 7} ${hy + 18} ${hx - hr + 1} ${hy + 22} H${hx + hr - 1} Q${hx + hr + 7} ${hy + 18} ${hx + hr + 4} ${hy - 4} Z`, h);
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
    case 'bob':
      // a rounded cap with straight bangs, and a clip on one side
      return (
        p(`M${hx - hr - 3} ${hy + 6} Q${hx - hr - 2} ${hy - hr - 7} ${hx} ${hy - hr - 6} Q${hx + hr + 2} ${hy - hr - 7} ${hx + hr + 3} ${hy + 6} L${hx + hr - 2} ${hy + 6} L${hx + hr - 4} ${hy - 9} Q${hx} ${hy - 7} ${hx - hr + 4} ${hy - 9} L${hx - hr + 2} ${hy + 6} Z`, h) +
        (o.clip ? r(hx + hr - 15, hy - 14, 12, 5, o.clip, 2, `stroke="${INK}" stroke-width="1.4"`) : '')
      );
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
    // a royal turban with a jewel and a plume
    case 'mughal': {
      const col = o.hatColor || '#FFF3B0';
      return (
        p(`M${hx - hr - 3} ${hy - 4} Q${hx - hr - 7} ${hy - hr - 16} ${hx} ${hy - hr - 17} Q${hx + hr + 7} ${hy - hr - 16} ${hx + hr + 3} ${hy - 4} Q${hx} ${hy - 13} ${hx - hr - 3} ${hy - 4} Z`, col) +
        `<path d="M${hx - hr - 1} ${hy - 12} Q${hx} ${hy - 26} ${hx + hr + 1} ${hy - 12} M${hx - hr + 2} ${hy - 22} Q${hx} ${hy - 36} ${hx + hr - 2} ${hy - 22}" fill="none" stroke="rgba(43,45,66,0.35)" stroke-width="2"/>` +
        p(`M${hx + 1} ${hy - hr - 8} q7 -20 -1 -32 q12 10 7 32 z`, '#fff', `stroke="${INK}" stroke-width="1.8"`) +
        c(hx + 1, hy - hr - 6, 5, '#E63946', `stroke="${INK}" stroke-width="1.8"`) +
        c(hx + 1, hy - hr - 6, 1.8, '#fff', '')
      );
    }
    // a wrapped turban with folds
    case 'pagdi': {
      const col = o.hatColor || '#F97316';
      return (
        p(`M${hx - hr - 2} ${hy - 4} Q${hx - hr - 5} ${hy - hr - 12} ${hx} ${hy - hr - 13} Q${hx + hr + 5} ${hy - hr - 12} ${hx + hr + 2} ${hy - 4} Q${hx} ${hy - 12} ${hx - hr - 2} ${hy - 4} Z`, col) +
        `<path d="M${hx - hr} ${hy - 10} L${hx + 8} ${hy - hr - 10} M${hx - hr + 6} ${hy - 4} L${hx + hr - 2} ${hy - hr - 4}" fill="none" stroke="rgba(43,45,66,0.35)" stroke-width="2.4"/>` +
        c(hx - 2, hy - hr - 4, 3.4, '#FFD43B', `stroke="${INK}" stroke-width="1.6"`)
      );
    }
    case 'crown':
    case 'tiara': {
      const t = o.hat === 'tiara' ? 0.55 : 1;
      const top = hy - hr - 2 - 14 * t;
      return (
        p(`M${hx - hr + 3} ${hy - 12} L${hx - hr + 1} ${top + 4} L${hx - 11} ${top + 12 * t} L${hx - 5} ${top - 4 * t} L${hx} ${top + 10 * t} L${hx + 5} ${top - 4 * t} L${hx + 11} ${top + 12 * t} L${hx + hr - 1} ${top + 4} L${hx + hr - 3} ${hy - 12} Q${hx} ${hy - 18} ${hx - hr + 3} ${hy - 12} Z`, '#FBBF24') +
        c(hx, hy - 15, 3.2, '#E63946', `stroke="${INK}" stroke-width="1.4"`) +
        c(hx - 12, hy - 14, 2.4, '#3D7BFF', '') +
        c(hx + 12, hy - 14, 2.4, '#2EC27E', '')
      );
    }
    case 'tophat':
      return r(hx - hr - 6, hy - 14, hr * 2 + 12, 7, '#1F2340', 3) + r(hx - 15, hy - hr - 30, 30, hr + 18, '#1F2340', 3) + r(hx - 15, hy - 22, 30, 6, o.hatColor || '#E63946', 0, '');
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
    case 'sword':
      return p(`M${x - 2.5} ${y - 6} L${x - 2.5} ${y - 52} L${x} ${y - 60} L${x + 2.5} ${y - 52} L${x + 2.5} ${y - 6} Z`, '#E5E7EB', `stroke="${INK}" stroke-width="1.8"`) + r(x - 9, y - 8, 18, 5, '#FBBF24', 2, `stroke="${INK}" stroke-width="1.6"`) + r(x - 2.5, y - 3, 5, 10, '#7C2D12', 1, `stroke="${INK}" stroke-width="1.4"`);
    case 'scroll':
      return r(x - 11, y - 14, 22, 26, '#FFF3C4', 2, `stroke="${INK}" stroke-width="1.8"`) + e(x, y - 14, 13, 3.5, '#E9C46A', `stroke="${INK}" stroke-width="1.6"`) + e(x, y + 12, 13, 3.5, '#E9C46A', `stroke="${INK}" stroke-width="1.6"`) + ln(x - 6, y - 5, x + 6, y - 5, '#9AA3B5', 1.4) + ln(x - 6, y + 1, x + 5, y + 1, '#9AA3B5', 1.4);
    case 'diya':
      return p(`M${x - 13} ${y - 4} Q${x} ${y + 12} ${x + 13} ${y - 4} Z`, '#C2410C', `stroke="${INK}" stroke-width="1.8"`) + p(`M${x + 4} ${y - 5} q3 -8 0 -15 q-6 7 0 15 z`, '#FBBF24', `stroke="#F97316" stroke-width="1.2"`);
    case 'lemon':
      return c(x, y - 4, 8, '#FDE047', `stroke="${INK}" stroke-width="1.8"`) + c(x, y - 4, 5, '#FEF9C3', '') + ln(x - 4, y - 4, x + 4, y - 4, '#EAB308', 1.2) + ln(x, y - 8, x, y, '#EAB308', 1.2);
    case 'flask':
      return p(`M${x - 4} ${y - 22} V${y - 10} L${x - 13} ${y + 6} H${x + 13} L${x + 4} ${y - 10} V${y - 22} Z`, '#E0F2FE', `stroke="${INK}" stroke-width="1.8"`) + p(`M${x - 9} ${y - 1} L${x - 12} ${y + 5} H${x + 12} L${x + 9} ${y - 1} Z`, '#F472B6', '');
    case 'pot':
      return c(x, y, 13, '#C2410C', `stroke="${INK}" stroke-width="1.8"`) + r(x - 7, y - 18, 14, 7, '#C2410C', 2, `stroke="${INK}" stroke-width="1.6"`) + ln(x - 10, y - 3, x + 10, y - 3, '#FDBA74', 2);
    case 'mango':
      return e(x + 1, y - 4, 7, 10, '#FBBF24', `stroke="${INK}" stroke-width="1.8"`) + p(`M${x + 2} ${y - 14} q6 -6 10 -2 q-5 4 -10 2 z`, '#22C55E', `stroke="${INK}" stroke-width="1.2"`);
    case 'coins':
      return [0, 1, 2].map((k) => e(x, y + 4 - k * 5, 10, 3.5, '#FBBF24', `stroke="${INK}" stroke-width="1.6"`)).join('');
    case 'candle':
      return r(x - 4, y - 20, 8, 22, '#FFFBEB', 2, `stroke="${INK}" stroke-width="1.6"`) + p(`M${x} ${y - 21} q4 -6 0 -12 q-4 6 0 12 z`, '#FBBF24', `stroke="#F97316" stroke-width="1.2"`);
    case 'trophy':
      return p(`M${x - 10} ${y - 24} H${x + 10} Q${x + 10} ${y - 8} ${x} ${y - 6} Q${x - 10} ${y - 8} ${x - 10} ${y - 24} Z`, '#FBBF24', `stroke="${INK}" stroke-width="1.8"`) + r(x - 2, y - 7, 4, 7, '#FBBF24', 0, `stroke="${INK}" stroke-width="1.4"`) + r(x - 8, y, 16, 5, '#B45309', 1, `stroke="${INK}" stroke-width="1.4"`);
    case 'mirror':
      return e(x, y - 14, 9, 12, '#BFE6FF', `stroke="#B45309" stroke-width="3"`) + ln(x, y - 2, x, y + 8, '#B45309', 3) + p(`M${x - 4} ${y - 20} q3 -3 6 -2`, 'none', `stroke="#fff" stroke-width="2" fill="none"`);
    case 'apple':
      return c(x, y - 5, 8, '#EF4444', `stroke="${INK}" stroke-width="1.8"`) + p(`M${x} ${y - 13} q2 -5 6 -6`, 'none', `stroke="#7C4A2A" stroke-width="2" fill="none"`) + e(x + 4, y - 15, 3, 1.6, '#22C55E', '');
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

  // ---- behind: hair, a royal or magician's cape
  s += hairBack(o, hx, hy, hr);
  if (o.cape) s += p(`M${hx - shW - 2} ${shY + 2} L${hx - shW - 18} 184 Q${hx} 190 ${hx + shW + 18} 184 L${hx + shW + 2} ${shY + 2} Z`, o.cape);

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
      if (o.emblem === 'heart') s += p(`M${hx} ${shY + 30} C${hx - 12} ${shY + 21} ${hx - 9} ${shY + 13} ${hx} ${shY + 19} C${hx + 9} ${shY + 13} ${hx + 12} ${shY + 21} ${hx} ${shY + 30} Z`, '#FFFFFF', `stroke="${INK}" stroke-width="1.6"`);
  }
  if (o.apron) s += p(`M${hx - 15} ${shY + 6} H${hx + 15} L${hx + 18} ${tb + 10} H${hx - 18} Z`, '#FFFFFF') + ln(hx - 15, shY + 6, hx - 9, shY - 2, INK, 1.8) + ln(hx + 15, shY + 6, hx + 9, shY - 2, INK, 1.8);
  if (o.pallu) s += p(`M${hx - shW} ${shY + 2} L${hx - shW + 10} ${shY - 2} L${hx + shW + 4} ${waist - 4} L${hx + shW - 6} ${waist + 6} Z`, o.pallu);
  if (o.shawl) s += p(`M${hx - shW - 3} ${shY + 2} Q${hx} ${shY + 18} ${hx + shW + 3} ${shY + 2} L${hx + shW + 6} ${shY + 34} Q${hx} ${shY + 44} ${hx - shW - 6} ${shY + 34} Z`, o.shawl);
  if (o.medal) s += c(hx - 9, shY + 16, 4, '#FFD43B') + r(hx - 11, shY + 6, 4, 6, '#E63946', 0, '');
  if (o.pearls) s += Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (i / 8); return c((hx - 13 * Math.cos(a)).toFixed(1), (shY + 3 + 11 * Math.sin(a)).toFixed(1), 2.4, '#FFFBEB', `stroke="${INK}" stroke-width="1"`); }).join('');
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

// Biscuit, Rimjhim's puppy: floppy ears, a wagging tail and a red collar with a bell
function dog({ face: f = 'smile' } = {}) {
  const fur = '#E9B872';
  const patch = '#FFF7E6';
  let s = `<ellipse cx="60" cy="194" rx="34" ry="4" fill="#1E1B4B" opacity="0.12"/>`;
  // tail, wagging up
  s += `<path d="M86 160 Q106 150 104 128" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M86 160 Q106 150 104 128" fill="none" stroke="${fur}" stroke-width="6" stroke-linecap="round"/>`;
  // legs and body
  s += [40, 52, 72, 84].map((x) => limb(`M${x} 170 V188`, fur, 8)).join('') + [40, 52, 72, 84].map((x) => e(x, 190, 6, 3.6, patch)).join('');
  s += e(62, 164, 30, 18, fur) + e(60, 170, 14, 9, patch, '');
  // head and ears
  s += p('M28 118 Q16 120 18 146 Q22 154 30 146 Q30 132 34 124 Z', '#B7793E');
  s += p('M92 118 Q104 120 102 146 Q98 154 90 146 Q90 132 86 124 Z', '#B7793E');
  s += c(60, 130, 28, fur);
  s += e(60, 146, 15, 11, patch, '');
  // eyes
  const ey = 126;
  if (f === 'sleep' || f === 'laugh' || f === 'grin') s += `<path d="M44 ${ey + 1} q5 ${f === 'sleep' ? 4 : -5} 10 0 M66 ${ey + 1} q5 ${f === 'sleep' ? 4 : -5} 10 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
  else if (f === 'shock') s += c(49, ey, 5.5, '#fff', `stroke="${INK}" stroke-width="1.8"`) + c(71, ey, 5.5, '#fff', `stroke="${INK}" stroke-width="1.8"`) + c(49, ey, 2, INK, '') + c(71, ey, 2, INK, '');
  else if (f === 'wink') s += e(49, ey, 3.4, 4.2, INK, '') + `<path d="M66 ${ey} h10" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
  else s += e(49, ey, 3.4, 4.2, INK, '') + e(71, ey, 3.4, 4.2, INK, '') + c(50.2, ey - 1.4, 1.2, '#fff', '') + c(72.2, ey - 1.4, 1.2, '#fff', '');
  // brows for the moods
  if (f === 'angry') s += `<path d="M42 116 l11 4 M78 116 l-11 4" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (f === 'sad' || f === 'worried') s += `<path d="M43 119 l10 -4 M77 119 l-10 -4" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (f === 'think' || f === 'sly') s += `<path d="M66 115 q5 -3 10 1" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  // nose and mouth
  s += e(60, 140, 6, 4.4, INK, '');
  if (f === 'laugh' || f === 'grin') s += p('M50 148 Q60 162 70 148 Z', '#7A2E3A', `stroke="${INK}" stroke-width="1.8"`) + e(60, 155, 4, 3, '#FF8FA3', '');
  else if (f === 'shock') s += e(60, 152, 4, 5, '#7A2E3A', `stroke="${INK}" stroke-width="1.6"`);
  else if (f === 'chew') s += `<path d="M50 150 q3 -4 6 0 q4 4 8 0 q3 -4 6 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` + `<g transform="rotate(-14 30 152)">${r(18, 148, 20, 9, '#8A5A44', 4)}</g>`;
  else if (f === 'sad' || f === 'angry') s += `<path d="M52 152 q8 -5 16 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  else s += `<path d="M60 144 v4 M52 148 q8 6 16 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` + (f === 'smile' ? p('M57 151 q3 8 6 0 z', '#FF8FA3', `stroke="${INK}" stroke-width="1.4"`) : '');
  if (f === 'sleep') s += `<text x="84" y="106" font-size="14" font-weight="800" fill="${INK}">z z</text>`;
  // collar and bell
  s += r(42, 156, 36, 6, '#E63946', 3, `stroke="${INK}" stroke-width="1.6"`) + c(60, 165, 3.6, '#FFD43B', `stroke="${INK}" stroke-width="1.4"`);
  return s;
}

// Chippu, Kavya's home-made robot: a screen for a face, an antenna and very literal ideas
const LED = '#5EEAD4';
function screenFace(f) {
  const st = `fill="none" stroke="${LED}" stroke-width="3" stroke-linecap="round"`;
  const eye = (x) => {
    if (f === 'laugh' || f === 'grin') return `<path d="M${x - 5} 76 q5 -7 10 0" ${st}/>`;
    if (f === 'sleep') return `<path d="M${x - 5} 75 h10" ${st}/>`;
    if (f === 'wink' && x > 60) return `<path d="M${x - 5} 75 h10" ${st}/>`;
    if (f === 'shock') return `<circle cx="${x}" cy="74" r="5.5" ${st}/>`;
    return `<rect x="${x - 3}" y="69" width="6" height="10" rx="3" fill="${LED}"/>`;
  };
  let m = `<path d="M52 84 q8 6 16 0" ${st}/>`;
  if (f === 'grin' || f === 'laugh') m = `<path d="M50 83 q10 10 20 0 z" fill="${LED}"/>`;
  if (f === 'shock') m = `<circle cx="60" cy="86" r="3.5" ${st}/>`;
  if (f === 'sad' || f === 'worried') m = `<path d="M52 88 q8 -6 16 0" ${st}/>`;
  if (f === 'angry') m = `<path d="M52 87 h16" ${st}/>`;
  if (f === 'think') m = `<path d="M54 86 h8" ${st}/><text x="74" y="70" font-size="12" font-weight="800" fill="${LED}">?</text>`;
  if (f === 'chew') m = `<path d="M50 86 q3 -4 6 0 q3 4 6 0 q3 -4 6 0" ${st}/>`;
  if (f === 'sly') m = `<path d="M52 86 q9 3 16 -3" ${st}/>`;
  let brows = '';
  if (f === 'angry') brows = `<path d="M44 66 l10 3 M76 66 l-10 3" ${st}/>`;
  if (f === 'worried' || f === 'sad') brows = `<path d="M45 68 l9 -3 M75 68 l-9 -3" ${st}/>`;
  return brows + eye(48) + eye(72) + m + (f === 'sleep' ? `<text x="78" y="64" font-size="11" font-weight="800" fill="${LED}">z</text>` : '');
}
function robot({ face: f = 'smile', arms = 'down', hold } = {}) {
  let s = `<ellipse cx="60" cy="194" rx="30" ry="4" fill="#1E1B4B" opacity="0.12"/>`;
  // legs and feet
  s += limb('M48 168 V184', '#94A3B8', 8) + limb('M72 168 V184', '#94A3B8', 8) + r(36, 183, 22, 10, '#475569', 5) + r(62, 183, 22, 10, '#475569', 5);
  // arms
  const hands = {
    down: [[22, 162], [98, 162]],
    point: [[22, 162], [114, 108]],
    up: [[16, 84], [104, 84]],
    hips: [[34, 150], [86, 150]],
    chin: [[22, 162], [70, 102]],
    wave: [[22, 162], [106, 86]],
  }[arms] || [[22, 162], [98, 162]];
  const arm = ([sx, sy], [hx2, hy2]) => limb(`M${sx} ${sy} Q${(sx + hx2) / 2 + (hx2 < 60 ? -10 : 10)} ${(sy + hy2) / 2} ${hx2} ${hy2}`, '#94A3B8', 7) + c(hx2, hy2, 6.5, '#64748B');
  s += arm([34, 124], hands[0]);
  // body
  s += r(32, 108, 56, 64, '#38BDF8', 14) + r(42, 120, 36, 30, '#E0F2FE', 6) + `<path d="M46 136 l6 -6 l6 10 l6 -14 l6 10 l4 0" fill="none" stroke="#E63946" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` + c(48, 160, 3.4, '#FBBF24') + c(60, 160, 3.4, '#22C55E') + c(72, 160, 3.4, '#E63946');
  s += arm([86, 124], hands[1]);
  if (hold) s += prop(hold, hands[1]);
  // neck, head, antenna
  s += r(52, 98, 16, 12, '#94A3B8', 3) + ln(60, 50, 60, 34, INK, 3) + c(60, 31, 5, '#E63946');
  s += c(26, 76, 6, '#94A3B8') + c(94, 76, 6, '#94A3B8');
  s += r(28, 50, 64, 52, '#E2E8F0', 14) + r(36, 58, 48, 36, '#1E293B', 9);
  s += screenFace(f);
  return s;
}

// Betal, the riddling spirit of the old peepal tree: wild white hair, glowing eyes, and no feet at all
function ghost({ face: f = 'smile', arms = 'down', hold } = {}) {
  const skin = '#CBD5E1';
  let s = `<ellipse cx="60" cy="194" rx="22" ry="3.5" fill="#1E1B4B" opacity="0.1"/>`;
  // a wispy tail instead of legs
  s += p('M38 104 Q28 140 40 166 Q48 186 64 182 Q76 179 70 168 Q86 174 92 156 Q100 128 82 104 Z', '#E2E8F0');
  s += `<path d="M46 150 q8 10 18 4 M54 168 q6 4 12 0" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>`;
  const pts = armPoints(arms, [40, 80, 106], false);
  const arm = ([sx, sy], [[ex, ey], [hx2, hy2]], right) => limb(`M${sx} ${sy} L${ex} ${ey} L${hx2} ${Math.min(hy2, 150)}`, skin, 6.5) + c(hx2, Math.min(hy2, 150), 4.5, skin) + (right && hold ? prop(hold, [hx2, Math.min(hy2, 150)]) : '');
  s += arm([40, 108], pts[0], false);
  // body: a ragged shroud
  s += p('M38 98 Q60 90 82 98 L86 132 L78 126 L72 136 L64 128 L56 138 L48 128 L40 134 Z', '#F1F5F9');
  s += arm([80, 108], pts[1], true);
  // flame-like white hair behind the head
  s += p('M30 62 Q14 30 40 28 Q34 8 56 16 Q62 0 74 14 Q92 6 88 30 Q108 34 92 64 Q98 46 82 40 Q60 30 38 40 Q24 46 30 62 Z', '#F8FAFC');
  // pointy ears and the head
  s += p('M34 56 L22 44 L36 66 Z', skin) + p('M86 56 L98 44 L84 66 Z', skin);
  s += r(54, 86, 12, 12, skin, 3);
  s += c(60, 60, 26, skin);
  // glowing eyes behind the usual face
  s += c(51, 61, 7.5, '#FDE68A', '') + c(69, 61, 7.5, '#FDE68A', '');
  s += face(60, 60, f, { kid: false });
  s += `<path d="M53 77 l2 4 l2 -4 M63 77 l2 4 l2 -4" fill="#fff" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`;
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

  // ---- बीरबल की बुद्धि (Grade 7): Akbar–Birbal tales, retold from folk tradition ----
  akbar: { name: { hi: 'बादशाह अकबर', en: 'Emperor Akbar' }, pitch: 0.8, skin: SK.light, hair: 'neat', hairColor: '#2B2D42', moustache: 'thick', hat: 'mughal', hatColor: '#FFF3B0', topKind: 'coat', top: '#7C3AED', sleeves: 'long', lower: 'pajama', bottom: '#FDE68A', pearls: true, shoes: '#B45309' },
  birbal: { name: { hi: 'बीरबल', en: 'Birbal' }, pitch: 1.0, skin: SK.mid, hair: 'neat', hairColor: '#2B2D42', moustache: 'thin', tilak: true, hat: 'pagdi', hatColor: '#F97316', topKind: 'coat', top: '#FDE68A', sleeves: 'long', lower: 'pajama', bottom: '#FFFFFF', shoes: '#B45309' },
  chugal: { name: { hi: 'दरबारी चुगलचंद', en: 'Chugalchand, a jealous courtier' }, pitch: 0.9, build: 'round', skin: SK.tan, hair: 'bald', hairColor: '#2B2D42', moustache: 'handlebar', hat: 'pagdi', hatColor: '#16A34A', topKind: 'coat', top: '#0EA5E9', sleeves: 'long', lower: 'pajama', bottom: '#E5E7EB', shoes: '#7C2D12' },

  // ---- चिप्पू रोबो (Grade 7): Kavya's robot takes every idiom literally ----
  kavya: { name: { hi: 'काव्या', en: 'Kavya' }, pitch: 1.35, kid: true, skin: SK.tan, hair: 'curly', hairColor: '#2B2D42', top: '#14B8A6', emblem: 'stripe', lower: 'pants', bottom: '#6366F1', shoes: '#F59E0B' },
  chippu: { name: { hi: 'चिप्पू', en: 'Chippu the robot' }, pitch: 1.6, animal: 'robot' },
  nani: { name: { hi: 'नानी', en: "Kavya's grandmother" }, pitch: 1.0, skin: SK.mid, hair: 'bun', hairColor: '#F1F1EE', earrings: true, bindi: true, topKind: 'blouse', top: '#F472B6', lower: 'sari', bottom: '#FBCFE8', pallu: '#EC4899', border: '#FBBF24', shoes: '#8A5A44' },
  montu: { name: { hi: 'मोंटू', en: "Montu, Kavya's little brother" }, pitch: 1.55, kid: true, skin: SK.tan, hair: 'spiky', hairColor: '#2B2D42', top: '#EF4444', lower: 'shorts', bottom: '#1D4ED8', shoes: '#F8FAFC' },
  chameli: { name: { hi: 'चमेली आंटी', en: 'Chameli Aunty next door' }, pitch: 1.15, skin: SK.light, hair: 'bun', hairColor: '#3B2F2F', bindi: true, earrings: true, topKind: 'kurta', top: '#FACC15', sleeves: 'long', lower: 'pants', bottom: '#FEF08A', hold: 'phone', shoes: '#BE185D' },

  // ---- विक्रम और बेताल (Grade 8): riddle tales, retold from the Baital Pachisi tradition ----
  vikram: { name: { hi: 'राजा विक्रम', en: 'King Vikram' }, pitch: 0.85, skin: SK.mid, hair: 'neat', hairColor: '#2B2D42', moustache: 'thick', hat: 'crown', cape: '#B91C1C', topKind: 'coat', top: '#FBBF24', sleeves: 'long', lower: 'dhoti', bottom: '#FEF3C7', pearls: true, hold: 'sword', shoes: '#7C2D12' },
  betal: { name: { hi: 'बेताल', en: 'Betal' }, pitch: 0.7, animal: 'ghost' },

  // ---- मास्टर मुरारी (Grade 8): a retired science teacher against fake miracles ----
  murari: { name: { hi: 'मास्टर मुरारी', en: 'Master Murari' }, pitch: 0.85, skin: SK.mid, hair: 'crew', hairColor: '#D1D5DB', glasses: true, moustache: 'thick', moColor: '#D1D5DB', topKind: 'coat', top: '#0F766E', sleeves: 'long', lower: 'pajama', bottom: '#F8FAFC', hold: 'flask', shoes: '#7C2D12' },
  golu: { name: { hi: 'गोलू', en: 'Golu' }, pitch: 1.4, kid: true, skin: SK.mid, hair: 'short', hairColor: '#2B2D42', hat: 'cap', hatColor: '#F97316', top: '#3B82F6', emblem: 'stripe', lower: 'shorts', bottom: '#475569', shoes: '#E63946' },
  thagraj: { name: { hi: 'जादूगर ठगराज', en: 'Thagraj the fake magician' }, pitch: 0.95, skin: SK.light, hair: 'neat', hairColor: '#111827', moustache: 'handlebar', hat: 'tophat', hatColor: '#FBBF24', cape: '#4C1D95', topKind: 'coat', top: '#7C3AED', sleeves: 'long', lower: 'pants', bottom: '#1F2937', shoes: '#111827' },

  // ---- रिमझिम का धमाल (Grade 7): Rimjhim, eleven, her family, her best friend and her puppy ----
  rimjhim: { name: { hi: 'रिमझिम', en: 'Rimjhim' }, pitch: 1.4, kid: true, skin: SK.tan, hair: 'bob', hairColor: '#2B2D42', clip: '#FACC15', top: '#F43F5E', emblem: 'heart', lower: 'pants', bottom: '#2563EB', shoes: '#FACC15' },
  zoya: { name: { hi: 'ज़ोया', en: "Zoya, Rimjhim's best friend" }, pitch: 1.3, kid: true, skin: SK.light, hair: 'long', hairColor: '#3B2F2F', glasses: true, topKind: 'kurta', top: '#8B5CF6', sleeves: 'long', lower: 'pajama', bottom: '#EDE9FE', shoes: '#BE185D' },
  bablu: { name: { hi: 'बबलू', en: "Bablu, Rimjhim's little brother" }, pitch: 1.6, kid: true, build: 'round', skin: SK.tan, hair: 'spiky', hairColor: '#2B2D42', top: '#22C55E', emblem: 'star', lower: 'shorts', bottom: '#F97316', shoes: '#1D4ED8' },
  rmummy: { name: { hi: 'मम्मी', en: "Rimjhim's mother" }, pitch: 1.1, skin: SK.tan, hair: 'bun', hairColor: '#2B2D42', bindi: true, earrings: true, topKind: 'kurta', top: '#0D9488', sleeves: 'long', lower: 'pants', bottom: '#F1F5F9', shoes: '#7C2D12' },
  rpapa: { name: { hi: 'पापा', en: "Rimjhim's father" }, pitch: 0.9, skin: SK.mid, hair: 'neat', hairColor: '#2B2D42', glasses: true, beard: 'stubble', topKind: 'shirt', top: '#F59E0B', sleeves: 'long', lower: 'pants', bottom: '#334155' },
  amma: { name: { hi: 'दादी अम्मा', en: "Rimjhim's grandmother" }, pitch: 1.0, skin: SK.mid, hair: 'bun', hairColor: '#D1D5DB', glasses: true, earrings: true, bindi: true, topKind: 'blouse', top: '#16A34A', lower: 'sari', bottom: '#BBF7D0', pallu: '#15803D', border: '#F59E0B', shoes: '#8A5A44' },
  sunny: { name: { hi: 'सनी', en: 'Sunny, a classmate' }, pitch: 1.2, kid: true, skin: SK.light, hair: 'neat', hairColor: '#8A5A44', hat: 'cap', hatColor: '#DC2626', top: '#1D4ED8', emblem: 'stripe', lower: 'pants', bottom: '#111827', shoes: '#F8FAFC' },
  biscuit: { name: { hi: 'बिस्कुट', en: 'Biscuit the puppy' }, pitch: 1.7, animal: 'dog' },

  // more look-presets for one-off parts in the new series
  courtier: { pitch: 0.9, skin: SK.light, hair: 'neat', hairColor: '#2B2D42', moustache: 'thin', hat: 'pagdi', hatColor: '#DC2626', topKind: 'coat', top: '#14B8A6', sleeves: 'long', lower: 'pajama', bottom: '#F1F5F9' },
  king: { pitch: 0.8, skin: SK.light, hair: 'neat', hairColor: '#4B5563', moustache: 'walrus', moColor: '#E5E7EB', hat: 'crown', cape: '#1D4ED8', topKind: 'coat', top: '#FDE68A', sleeves: 'long', lower: 'pajama', bottom: '#FFFFFF', pearls: true },
  queen: { pitch: 1.1, skin: SK.mid, hair: 'long', hairColor: '#2B2D42', hat: 'tiara', bindi: true, earrings: true, pearls: true, topKind: 'blouse', top: '#DB2777', lower: 'sari', bottom: '#FBCFE8', pallu: '#BE185D', border: '#FBBF24' },
  princess: { pitch: 1.3, skin: SK.light, hair: 'long', hairColor: '#3B2F2F', hat: 'tiara', earrings: true, topKind: 'blouse', top: '#A855F7', lower: 'long-skirt', bottom: '#E9D5FF', border: '#FBBF24' },
  pandit: { pitch: 0.85, skin: SK.mid, hair: 'bald', hairColor: '#4B5563', tilak: true, topKind: 'kurta', top: '#FEF3C7', sleeves: 'long', lower: 'dhoti', bottom: '#FFFFFF', hold: 'book', shoes: '#8A5A44' },
  soldier: { pitch: 0.8, skin: SK.tan, hair: 'short', hairColor: '#111827', moustache: 'handlebar', hat: 'pagdi', hatColor: '#B91C1C', topKind: 'coat', top: '#7F1D1D', sleeves: 'long', lower: 'pajama', bottom: '#F1F5F9', hold: 'sword' },
  farmer: { pitch: 0.85, skin: SK.deep, hair: 'short', hairColor: '#111827', moustache: 'thick', hat: 'saffa', hatColor: '#FFFFFF', topKind: 'kurta', top: '#F8FAFC', sleeves: 'long', lower: 'dhoti', bottom: '#F8FAFC', shoes: '#8A5A44' },
  'boy-b': { pitch: 1.3, kid: true, skin: SK.deep, hair: 'curly', hairColor: '#111827', top: '#FBBF24', lower: 'shorts', bottom: '#166534' },
  doctor: { pitch: 0.95, skin: SK.light, hair: 'short', hairColor: '#2B2D42', glasses: true, topKind: 'coat', top: '#F8FAFC', sleeves: 'long', lower: 'pants', bottom: '#475569', hold: 'notebook' },
  'girl-b': { pitch: 1.35, kid: true, skin: SK.mid, hair: 'braids', hairColor: '#111827', ribbon: '#3D7BFF', top: '#22C55E', lower: 'skirt', bottom: '#F97316' },
};
export const CAST_IDS = Object.keys(CAST);
const CREATURES = { goat, cat, robot, ghost, dog };

// One character, as an SVG string in a 120 x 200 box (feet at the bottom). `who` may be a cast id
// or a look-preset; `as` dresses someone in another look (a disguise) while keeping their name.
export function castSvg(who, { face: f = 'smile', arms = 'down', hold, scale, over } = {}) {
  const o = CAST[who] && over ? { ...CAST[who], ...over } : CAST[who];
  if (!o) return '';
  if (o.animal) return `<svg viewBox="0 0 120 200" aria-hidden="true">${CREATURES[o.animal]({ face: f, arms, hold })}</svg>`;
  const k = scale ?? (o.kid ? 0.8 : o.build === 'big' ? 1 : 0.9);
  const body = figure(hold ? { ...o, hold } : o, { face: f, arms });
  const shadow = `<ellipse cx="60" cy="194" rx="${o.build === 'big' ? 34 : 26}" ry="4" fill="#1E1B4B" opacity="0.12"/>`;
  return `<svg viewBox="0 0 120 200" aria-hidden="true">${shadow}<g transform="translate(60 194) scale(${k}) translate(-60 -194)">${body}</g></svg>`;
}

// For the picture library (200 x 140): head and shoulders, so characters work as icons and stickers.
export const COMIC_ART = Object.fromEntries(
  ['mishti', 'bijli', 'buntu', 'colonel', 'laddoolal', 'rocky', 'dadaji', 'teacher', 'mummy', 'papa', 'dadi', 'roohi', 'pappu', 'mausi', 'inspector', 'chhedilal', 'akbar', 'birbal', 'chugal', 'kavya', 'chippu', 'nani', 'montu', 'chameli', 'vikram', 'betal', 'murari', 'golu', 'thagraj', 'rimjhim', 'zoya', 'bablu', 'rmummy', 'rpapa', 'amma', 'sunny', 'biscuit'].map((id) => [
    `comic-${id}`,
    () => {
      const o = CAST[id];
      if (o.animal === 'goat') return `<g transform="translate(46 -150) scale(1.45)">${goat({ face: 'grin' })}</g>`;
      if (o.animal === 'cat') return `<g transform="translate(20 -152) scale(1.4)">${cat({ face: 'smile' })}</g>`;
      if (o.animal === 'robot') return `<g transform="translate(22 -14) scale(1.3)">${robot({ face: 'grin', arms: 'wave' })}</g>`;
      if (o.animal === 'ghost') return `<g transform="translate(30 2) scale(1.15)">${ghost({ face: 'grin', arms: 'up' })}</g>`;
      if (o.animal === 'dog') return `<g transform="translate(18 -150) scale(1.35)">${dog({ face: 'grin' })}</g>`;
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
const cloudBg = (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="8" rx="34" ry="12" fill="#fff" opacity="0.9"/><circle cx="-12" cy="0" r="14" fill="#fff" opacity="0.9"/><circle cx="10" cy="-4" r="17" fill="#fff" opacity="0.9"/></g>`;
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
  // ---- the new series ----
  // a royal court: cusped arches, a raised throne under a canopy, hanging lamps, a red carpet
  darbar: () =>
    plain('#FCE7B2') +
    [0, 100, 200, 300].map((x) => `<path d="M${x + 8} 200 V96 Q${x + 8} 60 ${x + 30} 54 Q${x + 50} 30 ${x + 70} 54 Q${x + 92} 60 ${x + 92} 96 V200 Z" fill="#F5C26B" stroke="#B45309" stroke-width="5"/>` + n(x - 4, 40, 14, 170, '#E9A84B') + n(x - 8, 34, 22, 10, '#B45309', 2)).join('') +
    `<path d="M150 70 Q200 34 250 70 Z" fill="#DC2626" stroke="#7F1D1D" stroke-width="3"/>` + n(156, 70, 6, 80, '#B45309') + n(238, 70, 6, 80, '#B45309') + n(160, 120, 80, 50, '#B91C1C', 10) + n(152, 150, 96, 22, '#FBBF24', 6) + `<circle cx="200" cy="132" r="9" fill="#FBBF24"/>` +
    [60, 340].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="34" stroke="#B45309" stroke-width="2"/><path d="M${x - 10} 34 h20 l-4 14 h-12 z" fill="#FBBF24" stroke="#B45309" stroke-width="2"/>`).join('') +
    floor(200, '#7F1D1D') + n(0, 200, 400, 8, '#FBBF24') + `<path d="M140 300 L170 208 H230 L260 300 Z" fill="#B91C1C"/><path d="M150 300 L176 214 M250 300 L224 214" stroke="#FBBF24" stroke-width="3"/>`,
  // a Mughal garden: a water channel with fountains between cypress trees, a pavilion behind
  bagh: () =>
    sky('#BFE6FF', '#FFF7E6') +
    `<g transform="translate(200 120)"><path d="M-50 0 V-30 Q-50 -60 0 -70 Q50 -60 50 -30 V0 Z" fill="#FFFBEB" stroke="#D6B98C" stroke-width="4"/><path d="M-14 0 V-26 Q0 -44 14 -26 V0 Z" fill="#D6B98C"/><circle cx="0" cy="-76" r="5" fill="#FBBF24"/></g>` +
    floor(150, '#86C46B') + [40, 110, 290, 360].map((x) => `<path d="M${x} 210 Q${x - 18} 160 ${x} 96 Q${x + 18} 160 ${x} 210 Z" fill="#166534"/>`).join('') +
    `<path d="M170 300 L190 150 H210 L230 300 Z" fill="#7DD3FC"/><path d="M180 260 L194 160 M220 260 L206 160" stroke="#E0F2FE" stroke-width="2"/>` +
    [180, 230].map((y) => `<path d="M200 ${y} q-8 -18 0 -30 q8 12 0 30" fill="#E0F2FE" opacity="0.9"/>`).join('') +
    Array.from({ length: 10 }, (_, i) => `<circle cx="${(i < 5 ? 30 : 240) + (i % 5) * 32}" cy="${250 + (i % 2) * 14}" r="7" fill="${['#F472B6', '#FBBF24', '#E63946'][i % 3]}"/>`).join(''),
  // the old peepal tree at night, where Betal hangs upside down
  peepal: () =>
    plain('#18213F') + `<circle cx="330" cy="54" r="30" fill="#FFF7D6"/><circle cx="330" cy="54" r="46" fill="#FFF7D6" opacity="0.12"/>` +
    Array.from({ length: 16 }, (_, i) => `<circle cx="${(i * 67) % 400}" cy="${10 + ((i * 29) % 100)}" r="1.4" fill="#fff"/>`).join('') +
    `<path d="M0 240 Q120 220 240 236 T400 232 V300 H0 Z" fill="#232B4A"/>` +
    `<path d="M70 300 Q86 220 72 160 Q60 120 30 100 M86 160 Q120 120 170 110 M78 190 Q40 170 0 176" fill="none" stroke="#3B2F2F" stroke-width="22" stroke-linecap="round"/>` +
    `<path d="M70 300 Q86 220 72 160 Q60 120 30 100" fill="none" stroke="#4A3B32" stroke-width="12" stroke-linecap="round"/>` +
    `<g fill="#1F3B2C">${[[20, 70, 50], [90, 60, 60], [160, 90, 46], [0, 140, 40]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>` +
    [120, 150, 175].map((x, i) => `<path d="M${x} ${112 + i * 2} V${170 + i * 14}" stroke="#2F2A28" stroke-width="2"/>`).join('') +
    Array.from({ length: 7 }, (_, i) => `<circle cx="${210 + i * 26}" cy="${170 + (i % 3) * 20}" r="2.4" fill="#FDE68A" opacity="0.8"/>`).join(''),
  // a forest by day
  jungle: () =>
    sky('#C7F0D8', '#F0FFF4') + [[0, 150, '#2F855A'], [-40, 175, '#276749']].map(([dx, y, col]) => `<path d="M${dx} ${y} Q60 ${y - 40} 120 ${y} T240 ${y} T360 ${y} T480 ${y} V300 H${dx} Z" fill="${col}"/>`).join('') +
    tree(40, 120, 1.2) + tree(360, 110, 1.3) + tree(300, 140, 0.8) + floor(230, '#5B8C3A') + `<path d="M150 300 Q180 260 230 230 H260 Q220 262 210 300 Z" fill="#C8A96E"/>` +
    [20, 90, 330, 380].map((x) => `<path d="M${x} 240 q-10 -16 0 -30 q10 14 0 30 M${x + 8} 242 q4 -18 16 -22" fill="none" stroke="#2F6B2F" stroke-width="3"/>`).join(''),
  // a river bank with a little boat
  river: () =>
    sky('#BDE3FF', '#F2FAFF') + `<path d="M0 120 Q100 100 200 116 T400 110 V140 H0 Z" fill="#7CB342"/>` +
    n(0, 136, 400, 74, '#4FA3E0') + [150, 172, 194].map((y, i) => `<path d="M${20 + i * 40} ${y} q15 -6 30 0 M${200 + i * 30} ${y + 6} q15 -6 30 0" fill="none" stroke="#E0F2FE" stroke-width="2.4" stroke-linecap="round"/>`).join('') +
    `<path d="M250 160 h80 l-12 16 h-56 z" fill="#8A5A44" stroke="${INK}" stroke-width="2"/><line x1="290" y1="160" x2="290" y2="120" stroke="${INK}" stroke-width="2"/><path d="M292 122 l22 30 h-22 z" fill="#FFF7E6" stroke="${INK}" stroke-width="1.6"/>` +
    floor(206, '#D9C08F') + [10, 50, 360].map((x) => `<path d="M${x} 214 q-4 -24 2 -40 M${x + 8} 214 q2 -20 10 -32" fill="none" stroke="#5B8C3A" stroke-width="3"/>`).join(''),
  // desert dunes and a khejri tree
  desert: () =>
    sky('#FFD9A0', '#FFF4DE') + `<circle cx="80" cy="60" r="28" fill="#FFE27A"/>` +
    `<path d="M0 170 Q100 120 210 160 T400 140 V300 H0 Z" fill="#F2C27B"/><path d="M0 220 Q140 170 260 210 T400 200 V300 H0 Z" fill="#E8B05E"/>` +
    `<g transform="translate(320 150)"><path d="M0 70 Q-4 30 4 0" stroke="#7C4A2A" stroke-width="7" fill="none"/><path d="M4 10 Q-30 -6 -38 6 M4 4 Q30 -16 40 -2" stroke="#7C4A2A" stroke-width="4" fill="none"/><ellipse cx="2" cy="-10" rx="40" ry="16" fill="#7A9A3A"/></g>`,
  // a workshop: a pegboard of tools, gears, jars and flasks, a bench
  workshop: () =>
    plain('#E8EEF6') + floor(222, '#A8A29E') + n(20, 30, 170, 110, '#D6B98C', 4) +
    Array.from({ length: 24 }, (_, i) => `<circle cx="${34 + (i % 8) * 20}" cy="${44 + Math.floor(i / 8) * 30}" r="1.8" fill="#8A6A3F"/>`).join('') +
    `<path d="M40 60 l18 40 M44 60 h10" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="110" cy="80" r="18" fill="none" stroke="#64748B" stroke-width="8" stroke-dasharray="7 5"/><rect x="146" y="56" width="10" height="46" rx="3" fill="#E63946"/>` +
    n(230, 40, 150, 10, '#8A5A44') + n(230, 100, 150, 10, '#8A5A44') + [[244, 14, '#FDE68A'], [280, 20, '#93C5FD'], [320, 16, '#F9A8D4'], [356, 18, '#86EFAC']].map(([x, h, col]) => n(x, 40 - h - 6, 18, h + 6, col, 3) + n(x, 100 - h - 10, 18, h + 10, col, 3)).join('') +
    n(0, 170, 400, 16, '#8A5A44', 2) + n(10, 186, 12, 40, '#6D4C41') + n(378, 186, 12, 40, '#6D4C41') +
    `<g transform="translate(320 150)"><path d="M-4 -24 V-12 L-14 6 H14 L4 -12 V-24 Z" fill="#E0F2FE" stroke="${INK}" stroke-width="2"/><path d="M-10 0 L-12 4 H12 L10 0 Z" fill="#22C55E"/></g>`,
  // a village square: a banyan tree with a platform, a hand pump, the panchayat board
  chaupal: () =>
    sky('#C9EBFF', '#FFF8E8') + `<path d="M0 190 Q200 176 400 190 V300 H0 Z" fill="#D9B97E"/>` +
    `<g transform="translate(110 70)"><rect x="-10" y="40" width="20" height="90" fill="#7C4A2A"/><path d="M-30 60 V130 M30 66 V130" stroke="#6B3F22" stroke-width="3"/><circle cx="0" cy="20" r="56" fill="#3F7D3A"/><circle cx="-50" cy="40" r="34" fill="#4A8C42"/><circle cx="52" cy="38" r="36" fill="#4A8C42"/></g>` +
    n(40, 186, 150, 22, '#C9A27E', 3) + n(36, 182, 158, 8, '#A47148', 2) +
    sign(240, 60, 130, 'ग्राम पंचायत', '#fff', '#B45309', 15) + n(300, 86, 6, 110, '#8A5A44') + n(250, 86, 6, 110, '#8A5A44') +
    `<g transform="translate(350 200)"><rect x="-4" y="-50" width="10" height="50" fill="#475569"/><path d="M6 -46 l20 -10" stroke="#475569" stroke-width="5" stroke-linecap="round"/><path d="M-4 -40 h-14 v6 h14" fill="#475569"/></g>`,
  // ---- longer comics ----
  // an old hill fort: battlements, a big gate and a flag
  fort: () =>
    sky('#BDE3FF', '#FFF6E5') + `<path d="M0 200 Q120 150 240 180 T400 160 V300 H0 Z" fill="#B7C98A"/>` +
    n(40, 70, 320, 150, '#C79A5B') + Array.from({ length: 11 }, (_, i) => n(40 + i * 30, 56, 18, 16, '#C79A5B')).join('') +
    [60, 300].map((x) => n(x, 40, 50, 180, '#B8874A') + Array.from({ length: 3 }, (_, i) => n(x + i * 18, 28, 12, 14, '#B8874A')).join('')).join('') +
    `<path d="M170 220 V140 Q200 104 230 140 V220 Z" fill="#5B3A1E"/><path d="M200 108 V128" stroke="#3F2A14" stroke-width="3"/>` +
    [90, 140, 260, 310].map((x) => n(x, 110, 12, 22, '#6B4A2A', 6)).join('') +
    `<line x1="85" y1="40" x2="85" y2="0" stroke="#3F2A14" stroke-width="3"/><path d="M87 2 h30 l-8 8 l8 8 h-30 z" fill="#FF9933"/>` + floor(220, '#D9C08F'),
  // a library: tall shelves, a reading table and a quiet sign
  library: () =>
    plain('#F5EBDD') + floor(230, '#B08860') +
    [10, 270].map((x) => n(x, 20, 120, 210, '#8A5A44') + [40, 90, 140, 190].map((y) => n(x + 6, y - 36, 108, 36, '#F5EBDD') + Array.from({ length: 9 }, (_, k) => n(x + 8 + k * 12, y - 34 + (k % 3) * 3, 10, 34 - (k % 3) * 3, ['#E76F51', '#2A9D8F', '#577590', '#F4A261', '#9D4EDD'][k % 5])).join('') + n(x, y, 120, 6, '#6D4C41')).join('')).join('') +
    sign(150, 30, 100, 'शांति रखें', '#fff', '#7C2D12', 14) + n(140, 170, 120, 14, '#8A5A44', 3) + n(150, 184, 8, 46, '#6D4C41') + n(242, 184, 8, 46, '#6D4C41') + n(176, 150, 26, 20, '#FDE68A', 2),
  // a hill station: pine-covered hills, a winding road, clouds below the peaks
  hills: () =>
    sky('#A7D8FF', '#EAF6FF') + `<path d="M0 170 L80 70 L150 150 L230 50 L320 140 L400 90 V300 H0 Z" fill="#7BA387"/><path d="M200 74 L230 50 L262 82 L246 78 L230 90 L214 78 Z" fill="#fff"/>` +
    `<path d="M0 210 Q100 170 200 200 T400 190 V300 H0 Z" fill="#4E8B5F"/>` +
    Array.from({ length: 9 }, (_, i) => `<path d="M${20 + i * 45} ${230 - (i % 2) * 14} l12 -34 l12 34 z" fill="#2F6B45"/>`).join('') +
    `<path d="M150 300 Q190 260 170 230 Q150 210 210 200" fill="none" stroke="#C9B48A" stroke-width="16"/>` + cloudBg(60, 120) + cloudBg(320, 100),
  // a clinic: a bed, a curtain, a chart and a cross
  clinic: () =>
    plain('#EAF6F4') + floor(230, '#BFD7D2') + n(30, 30, 80, 60, '#fff', 4) + `<path d="M62 44 h16 v12 h12 v16 h-12 v12 h-16 v-12 h-12 v-16 h12 z" fill="#E63946"/>` +
    n(150, 20, 10, 200, '#A3C4BC') + `<path d="M160 30 Q190 120 160 210 H230 Q210 120 230 30 Z" fill="#CDE7E1"/>` +
    n(250, 150, 140, 30, '#fff', 6) + n(250, 140, 40, 16, '#DCEFF5', 6) + n(254, 180, 8, 50, '#94A3B8') + n(378, 180, 8, 50, '#94A3B8') +
    n(300, 40, 60, 74, '#fff', 3) + [54, 66, 78, 90].map((y) => ln(308, y, 352, y, '#94A3B8', 2)).join(''),
  schoolbus: () =>
    plain('#FEF3C7') + n(0, 0, 400, 26, '#F59E0B') +
    [20, 150, 280].map((x) => n(x, 40, 110, 80, '#8A5A44', 8) + n(x + 6, 46, 98, 68, '#BFE6FF', 5) + tree(x + 30, 96, 0.5) + `<path d="M${x + 60} 70 h30" stroke="#fff" stroke-width="3" opacity="0.8"/>`).join('') +
    n(0, 128, 400, 6, '#9CA3AF') + n(0, 22, 400, 4, '#9CA3AF') +
    [10, 140, 270].map((x) => n(x, 160, 120, 80, '#2563EB', 14) + n(x + 8, 150, 104, 20, '#3B82F6', 8)).join('') +
    floor(240, '#6B7280') + n(0, 236, 400, 6, '#4B5563'),
  colony: () =>
    sky('#BDE3FF', '#FFF6E5') +
    [[0, 70, '#FDE68A'], [140, 40, '#FBCFE8'], [270, 80, '#BAE6FD']].map(([x, y, col]) => n(x, y, 130, 230 - y, col) + [0, 1, 2].map((k) => n(x + 14, y + 20 + k * 52, 40, 30, '#93C5FD', 3) + n(x + 72, y + 20 + k * 52, 40, 30, '#93C5FD', 3) + n(x + 10, y + 48 + k * 52, 108, 6, '#94A3B8')).join('')).join('') +
    `<path d="M150 112 Q195 124 240 112" fill="none" stroke="#475569" stroke-width="1.6"/>` + [160, 182, 206, 226].map((x, i) => n(x, 116, 12, 16, ['#F43F5E', '#FACC15', '#22C55E', '#38BDF8'][i], 2)).join('') +
    n(300, 52, 50, 28, '#334155', 4) +
    `<g>${[[18, 210], [34, 196], [48, 214], [26, 226]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#E879F9"/>`).join('')}<rect x="30" y="226" width="6" height="18" fill="#8A5A44"/></g>` +
    floor(236, '#D6D3D1') + n(0, 232, 400, 6, '#A8A29E') +
    [330, 342, 354].map((x) => n(x, 204, 4, 36, '#FDE68A')).join('') + n(328, 202, 30, 3, '#FDE68A'),
  stage: () => plain('#3B0764') + `<path d="M0 0 H400 V30 Q300 60 200 30 Q100 60 0 30 Z" fill="#B91C1C"/>` + n(0, 0, 40, 300, '#991B1B') + n(360, 0, 40, 300, '#991B1B') + `<path d="M120 0 L80 230 H320 L280 0 Z" fill="#FDE68A" opacity="0.18"/>` + floor(225, '#92400E'),
};
export const BACKGROUND_IDS = Object.keys(BACKGROUNDS);

export function comicBg(id) {
  const fn = BACKGROUNDS[id];
  return fn ? `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${fn()}</svg>` : '';
}
