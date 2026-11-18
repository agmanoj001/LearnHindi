// Illustrated covers and a backdrop for the best-loved stories (roadmap 3.1). A cover is the story's own
// little painting: a backdrop of its place (the jungle, the river bank, the palace, a night sky) with its
// characters standing in it, drawn from the same pictures as the pages so everything matches. The same
// backdrop sits behind the story's daytime scenes. Pure strings, no DOM: the reader, the library and the
// tests all use it. Each backdrop is a few hundred bytes of SVG.
import { rect, circ, ell, path, line } from './art-kit.js';

const W = 320;
const H = 200;
const grad = (id, top, bottom) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>`;
const skyFill = (id, top, bottom, h = H) => grad(id, top, bottom) + rect(0, 0, W, h, `url(#${id})`);
const hills = (y, c1, c2) => path(`M0 ${y} Q60 ${y - 34} 120 ${y - 6} T240 ${y - 10} T320 ${y - 22} V${H} H0 Z`, c1) + path(`M0 ${y + 18} Q90 ${y - 6} 170 ${y + 12} T320 ${y + 4} V${H} H0 Z`, c2);
const cloud = (x, y, s = 1) => ell(x, y, 26 * s, 9 * s, '#fff', 'opacity="0.9"') + circ(x - 8 * s, y - 6 * s, 10 * s, '#fff', 'opacity="0.9"') + circ(x + 8 * s, y - 8 * s, 12 * s, '#fff', 'opacity="0.9"');
const tree = (x, y, s = 1, leaf = '#2EC27E', dark = '#1F9D63') =>
  rect(x - 5 * s, y - 40 * s, 10 * s, 42 * s, '#8A5A44', 3) + circ(x, y - 54 * s, 26 * s, dark) + circ(x - 16 * s, y - 44 * s, 18 * s, leaf) + circ(x + 16 * s, y - 46 * s, 18 * s, leaf) + circ(x, y - 66 * s, 16 * s, leaf);
const palm = (x, y, s = 1) =>
  path(`M${x} ${y} Q${x + 6 * s} ${y - 40 * s} ${x - 2 * s} ${y - 76 * s}`, 'none', `stroke="#8A5A44" stroke-width="${7 * s}" stroke-linecap="round"`) +
  [-1, 1].map((d) => path(`M${x - 2 * s} ${y - 76 * s} Q${x + d * 30 * s} ${y - 92 * s} ${x + d * 46 * s} ${y - 70 * s} Q${x + d * 24 * s} ${y - 80 * s} ${x - 2 * s} ${y - 76 * s} Z`, '#2EC27E')).join('') +
  path(`M${x - 2 * s} ${y - 76 * s} Q${x + 4 * s} ${y - 104 * s} ${x + 22 * s} ${y - 104 * s} Q${x + 6 * s} ${y - 92 * s} ${x - 2 * s} ${y - 76 * s} Z`, '#1F9D63');
const stars = (n, seed = 1) =>
  Array.from({ length: n }, (_, k) => {
    const x = ((k * 0.618 + seed * 0.37) % 1) * W;
    const y = ((k * 0.414 + seed * 0.21) % 1) * 110;
    return circ(x.toFixed(1), y.toFixed(1), k % 3 ? 1.4 : 2.2, '#FFF6CF');
  }).join('');
const hut = (x, y, s = 1, wall = '#E9B872') =>
  rect(x, y - 30 * s, 44 * s, 30 * s, wall, 2) + path(`M${x - 6 * s} ${y - 28 * s} L${x + 22 * s} ${y - 54 * s} L${x + 50 * s} ${y - 28 * s} Z`, '#B9774A') + rect(x + 16 * s, y - 18 * s, 12 * s, 18 * s, '#8A5A44', 2);
const water = (y, top = '#7DD3FC', deep = '#38BDF8') =>
  rect(0, y, W, H - y, deep) + rect(0, y, W, 10, top) + [40, 120, 200, 280].map((x, i) => path(`M${x} ${y + 24 + (i % 2) * 18} q10 -5 20 0 t20 0`, 'none', 'stroke="#E0F2FE" stroke-width="2.5" stroke-linecap="round"')).join('');

export const BACKDROPS = {
  jungle: () => skyFill('cv-jungle', '#BDEBD0', '#E9F9EF') + hills(120, '#8FD3A8', '#6CC08E') + tree(36, 150, 1.25) + tree(292, 156, 1.15, '#4FAF63', '#2F8F4E') + palm(250, 150, 0.9) + rect(0, 150, W, 50, '#5FB878') + [30, 90, 160, 230, 300].map((x) => path(`M${x} 160 l4 -10 l4 10 l4 -12 l4 12`, 'none', 'stroke="#3F9A5C" stroke-width="2.5" stroke-linecap="round"')).join(''),
  river: () => skyFill('cv-river', '#BFE6FF', '#E8F7FF') + cloud(70, 36) + cloud(250, 26, 0.8) + hills(104, '#9ED9A9', '#7CC791') + tree(40, 116, 0.8) + tree(280, 112, 0.7) + water(118) + path('M0 176 Q80 168 160 176 T320 172 V200 H0 Z', '#C9B79C'),
  village: () => skyFill('cv-village', '#CDEBFF', '#FFF6DE') + circ(268, 40, 18, '#FFD43B') + cloud(90, 40) + hills(118, '#B9E3A0', '#9FD38A') + hut(40, 150) + hut(214, 146, 0.9, '#F0C98E') + tree(150, 150, 0.8) + rect(0, 150, W, 50, '#D8C49A') + path('M120 200 Q150 170 180 150 L196 150 Q176 172 168 200 Z', '#E8D9B5'),
  night: () => skyFill('cv-night', '#1E2A5A', '#3B4A85') + stars(36, 3) + circ(262, 44, 20, '#FFF1A6') + circ(270, 38, 18, '#3B4A85', 'opacity="0.0"') + hills(136, '#26345F', '#1C2748') + rect(0, 170, W, 30, '#1A2340'),
  dawn: () => skyFill('cv-dawn', '#FFB4A2', '#FFE8C2') + circ(160, 132, 40, '#FFD166') + circ(160, 132, 54, '#FFE29A', 'opacity="0.45"') + hills(140, '#E9A07A', '#D98A63') + rect(0, 168, W, 32, '#C97B57'),
  palace: () => skyFill('cv-palace', '#CFE8FF', '#FFF3DC') + cloud(60, 30, 0.8) + rect(70, 70, 180, 90, '#F7E3C2') + path('M130 70 Q160 18 190 70 Z', '#F2D4A6') + circ(160, 22, 4, '#FFC93C') + [86, 234].map((x) => rect(x - 8, 40, 16, 120, '#F2D4A6') + path(`M${x - 12} 42 Q${x} 18 ${x + 12} 42 Z`, '#E9B872')).join('') + [104, 140, 180, 216].map((x) => path(`M${x - 10} 160 V120 Q${x} 104 ${x + 10} 120 V160 Z`, '#C98B5E')).join('') + rect(0, 158, W, 42, '#9FD38A') + rect(126, 158, 68, 42, '#E8D9B5'),
  field: () => skyFill('cv-field', '#BFE6FF', '#F0FAFF') + circ(56, 42, 20, '#FFD43B') + cloud(220, 40) + hills(116, '#B9E3A0', '#A6D98F') + rect(0, 140, W, 60, '#E9C46A') + [150, 162, 176, 192].map((y, i) => path(`M0 ${y} Q160 ${y - 8 - i * 2} 320 ${y}`, 'none', 'stroke="#D4A84B" stroke-width="3"')).join(''),
  sea: () => skyFill('cv-sea', '#9ED8FF', '#E0F4FF') + cloud(80, 34) + circ(270, 40, 16, '#FFD43B') + water(110, '#93C5FD', '#3B82F6') + path('M0 172 Q100 160 200 170 T320 166 V200 H0 Z', '#F5DEB3'),
  home: () => rect(0, 0, W, H, '#FFF1DE') + rect(0, 0, W, 40, '#FFE2BC') + rect(206, 34, 78, 64, '#A47864', 6) + rect(214, 42, 62, 48, '#CFEFFF', 4) + line(245, 42, 245, 90, '#A47864', 4) + rect(0, 150, W, 50, '#E2B98A') + ell(150, 172, 90, 14, '#E2583E', 'opacity="0.55"') + [30, 60, 90].map((x) => circ(x, 20, 5, '#FFC93C')).join(''),
  fair: () => skyFill('cv-fair', '#CFE8FF', '#FFF0D9') + circ(250, 86, 52, 'none', 'stroke="#FF5A5F" stroke-width="5"') + [0, 1, 2, 3, 4, 5].map((k) => line(250, 86, (250 + 52 * Math.cos((k * Math.PI) / 3)).toFixed(1), (86 + 52 * Math.sin((k * Math.PI) / 3)).toFixed(1), '#FFB4A2', 3)).join('') + path('M0 24 Q80 44 160 24 T320 24', 'none', 'stroke="#5B6478" stroke-width="2"') + [20, 60, 100, 140, 180, 220, 260, 300].map((x, i) => path(`M${x} ${28 + Math.sin(x / 50) * 4} l8 0 l-4 12 Z`, ['#FF5A5F', '#FFC93C', '#2EC27E', '#3D7BFF'][i % 4])).join('') + rect(20, 112, 70, 48, '#FFC2D6') + path('M14 114 L55 92 L96 114 Z', '#E2583E') + rect(0, 158, W, 42, '#E8D9B5'),
  desert: () => skyFill('cv-desert', '#FFD9A0', '#FFF2D6') + circ(250, 46, 22, '#FFB703') + path('M0 140 Q80 104 170 136 T320 124 V200 H0 Z', '#F4C47A') + path('M0 168 Q110 140 220 166 T320 160 V200 H0 Z', '#E9AE5C'),
  mountain: () => skyFill('cv-mountain', '#BFE6FF', '#EEF8FF') + path('M0 150 L70 64 L130 140 L190 50 L262 136 L320 80 V200 H0 Z', '#94A3B8') + path('M70 64 L56 82 L84 80 Z M190 50 L172 74 L206 72 Z', '#F8FAFC') + rect(0, 150, W, 50, '#86C88A'),
};
export const BACKDROP_IDS = Object.keys(BACKDROPS);

// The twenty best-loved stories: their backdrop, and who stands on the cover, as
// [picture word, x, y, width] in a 320 × 200 frame (each picture is 200 × 140, so its height is 0.7 × width).
export const COVERS = {
  'thirsty-crow': { bg: 'village', cast: [['pot', 150, 96, 110], ['crow', 60, 58, 110]] },
  'lion-mouse': { bg: 'jungle', cast: [['lion', 70, 70, 150], ['mouse', 196, 120, 70]] },
  'tortoise-hare': { bg: 'field', cast: [['rabbit', 26, 90, 110], ['tortoise', 176, 110, 110]] },
  capseller: { bg: 'jungle', cast: [['capseller', 30, 70, 130], ['monkey', 176, 64, 110]] },
  'ant-dove': { bg: 'river', cast: [['dove', 30, 18, 120], ['leaf', 150, 112, 96], ['ant', 176, 104, 80]] },
  'greedy-dog': { bg: 'river', cast: [['bridge', 80, 84, 160], ['dog', 116, 52, 96], ['bone', 192, 70, 38]] },
  'lomdi-kauwa': { bg: 'jungle', cast: [['crow', 160, 34, 100], ['fox', 40, 96, 130]] },
  'billi-bandar': { bg: 'village', cast: [['cat', 22, 104, 96], ['monkey', 112, 74, 104], ['cat', 214, 104, 96]] },
  'k2-monkey-croc': { bg: 'river', cast: [['monkey', 40, 44, 104], ['crocodile', 150, 100, 150]] },
  'k2-clever-rabbit': { bg: 'jungle', cast: [['lion', 160, 66, 140], ['rabbit', 40, 104, 96], ['well', 116, 112, 70]] },
  'hanuman-suraj': { bg: 'dawn', cast: [['sun', 196, 10, 110], ['hanuman', 30, 50, 140]] },
  'makhan-chor': { bg: 'home', cast: [['krishna', 50, 56, 140], ['butter', 190, 92, 100]] },
  'ganesh-chakkar': { bg: 'palace', cast: [['ganesh', 90, 50, 150]] },
  'gilhari-setu': { bg: 'sea', cast: [['squirrel', 30, 104, 100], ['ram', 176, 76, 130], ['stones', 116, 136, 76]] },
  'ram-diwali': { bg: 'night', cast: [['ram', 40, 50, 130], ['sita', 150, 50, 130], ['lamp', 250, 130, 60]] },
  'suraj-hawa': { bg: 'village', cast: [['sun', 20, 4, 100], ['wind', 200, 8, 110], ['farmer', 110, 72, 130]] },
  'k5-matka': { bg: 'jungle', cast: [['pot', 40, 100, 100], ['lion', 170, 70, 130]] },
  'talkative-tortoise': { bg: 'river', extra: line(64, 50, 256, 50, '#8A5A44', 5), cast: [['swan', 4, 12, 110], ['swan', 206, 12, 110], ['tortoise', 115, 44, 90]] },
  'birbal-khichdi': { bg: 'palace', cast: [['comic-akbar', 30, 60, 130], ['comic-birbal', 170, 60, 130], ['cookingpot', 132, 132, 60]] },
  'fest-idgah': { bg: 'fair', cast: [['boy', 50, 64, 130], ['chimta', 170, 74, 100]] },
};

// a picture placed in the frame: its own <svg> with a position and size
const place = (art, id, x, y, w) => art(id).replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${(w * 0.7).toFixed(1)}" `);

export function coverSvg(storyId, art, label = '') {
  const c = COVERS[storyId];
  if (!c) return null;
  const aria = label ? `role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="cover-art" ${aria} focusable="false">${BACKDROPS[c.bg]()}${c.extra || ''}${c.cast.map(([id, x, y, w]) => place(art, id, x, y, w)).join('')}</svg>`;
}

// A page shows the story's own backdrop instead of a plain daytime sky, or instead of a sky of the same kind
// of place (a home page on the home backdrop, a night page on the night one). Any other sky (a night page
// in a jungle story, rain, the sea) stays, since it says something about that moment of the story.
const SAME_PLACE = { night: 'night', dawn: 'dawn', river: 'river', sea: 'sea', home: 'home', field: 'field' };
export const usesBackdrop = (act, storyId) => !!act && (!act.sky || ['day', 'field'].includes(act.sky) || SAME_PLACE[COVERS[storyId]?.bg] === act.sky);

// the backdrop alone, as a CSS background behind the story's daytime scenes
export function backdropCss(storyId) {
  const c = COVERS[storyId];
  if (!c) return null;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${BACKDROPS[c.bg]()}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
