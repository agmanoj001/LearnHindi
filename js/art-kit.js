// Drawing helpers shared by every art module. Each returns an SVG string fragment.

export const INK = '#2B2D42';
// Flat, outline-free style: shapes are separated by colour, not by black lines.
export const OUT = '';
export const GLASS = '#CFEFFF';

export const svg = (body, vb = '0 0 200 140') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
export const rect = (x, y, w, h, fill, rx = 0, extra = OUT) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
export const circ = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
export const ell = (cx, cy, rx, ry, fill, extra = OUT) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
export const path = (d, fill, extra = OUT) => `<path d="${d}" fill="${fill}" ${extra}/>`;
export const line = (x1, y1, x2, y2, color = INK, w = 4) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
export const win = (x, y, w, h) => rect(x, y, w, h, GLASS, 6, '');
export const wheel = (x, y, r = 15) => circ(x, y, r, INK) + circ(x, y, r * 0.45, '#D9DEE7');
// an eye; in a story scene it blinks and shows the mood (styles.css .scene .eye)
export const eye = (x, y, r = 4) => `<g class="eye">${circ(x, y, r, INK) + circ(x + r * 0.35, y - r * 0.35, r * 0.35, '#fff')}</g>`;
export const tracks = (x, y, w, h = 26) => {
  let s = rect(x, y, w, h, '#3B4252', h / 2);
  const n = Math.max(3, Math.round(w / 28));
  for (let i = 0; i < n; i++) s += circ(x + h / 2 + (i * (w - h)) / (n - 1), y + h / 2, h / 2 - 5, '#94A3B8');
  return s;
};

export function starPoints(cx, cy, r1, r2, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = (Math.PI / n) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

