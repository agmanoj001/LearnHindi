// Simple, bright vector art drawn in code. Every picture is an SVG string.
// Pure module (no DOM access) so tests can check that every content picture exists.

const INK = '#263238';
const OUT = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;
const GLASS = '#b3e5fc';

const svg = (body, vb = '0 0 200 140') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
const rect = (x, y, w, h, fill, rx = 0, extra = OUT) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const circ = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const ell = (cx, cy, rx, ry, fill, extra = OUT) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const path = (d, fill, extra = OUT) => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, color = INK, w = 4) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
const win = (x, y, w, h) => rect(x, y, w, h, GLASS, 4, `stroke="${INK}" stroke-width="2.5"`);
const wheel = (x, y, r = 15) => circ(x, y, r, INK) + circ(x, y, r * 0.45, '#cfd8dc');
const eye = (x, y, r = 4) => circ(x, y, r, INK) + circ(x + r * 0.35, y - r * 0.35, r * 0.35, '#fff');
const tracks = (x, y, w, h = 26) => {
  let s = rect(x, y, w, h, '#37474f', h / 2);
  const n = Math.max(3, Math.round(w / 28));
  for (let i = 0; i < n; i++) s += circ(x + h / 2 + (i * (w - h)) / (n - 1), y + h / 2, h / 2 - 5, '#90a4ae');
  return s;
};

function car(color) {
  return (
    path('M20 100 V76 Q20 65 34 63 L58 58 L78 34 Q82 30 90 30 H128 Q136 30 140 36 L158 60 L172 64 Q182 68 182 80 V100 Z', color) +
    path('M86 38 H108 V58 H68 Z', GLASS, `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`) +
    path('M114 38 H128 Q132 38 134 42 L148 58 H114 Z', GLASS, `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`) +
    circ(176, 76, 5, '#fff59d') +
    rect(20, 86, 10, 6, '#ff7043', 2, '') +
    wheel(56, 102, 17) +
    wheel(148, 102, 17)
  );
}

const VEHICLES = {
  bus: () =>
    rect(12, 28, 176, 78, '#ffc107', 14) +
    [22, 54, 86, 118].map((x) => win(x, 40, 26, 26)).join('') +
    rect(152, 40, 26, 54, '#90caf9', 3, `stroke="${INK}" stroke-width="2.5"`) +
    rect(12, 76, 140, 8, '#ff7043', 0, '') +
    circ(182, 96, 5, '#fff59d') +
    wheel(50, 108, 16) +
    wheel(150, 108, 16),
  car: () => car('#e53935'),
  policecar: () =>
    car('#fafafa') +
    rect(22, 78, 158, 8, '#1e88e5', 0, '') +
    rect(92, 20, 17, 10, '#e53935', 3, `stroke="${INK}" stroke-width="2"`) +
    rect(109, 20, 17, 10, '#1e88e5', 3, `stroke="${INK}" stroke-width="2"`),
  ambulance: () =>
    rect(14, 34, 172, 68, '#fafafa', 12) +
    win(146, 44, 32, 24) +
    rect(14, 76, 172, 8, '#e53935', 0, '') +
    path('M80 66 C64 52 66 40 76 40 C82 40 86 46 86 46 C86 46 90 40 96 40 C106 40 108 52 92 66 L86 72 Z', '#e53935', '') +
    rect(64, 24, 30, 10, '#1e88e5', 3, `stroke="${INK}" stroke-width="2"`) +
    wheel(50, 106, 16) +
    wheel(150, 106, 16),
  firetruck: () =>
    rect(10, 46, 140, 56, '#e53935', 8) +
    rect(146, 34, 42, 68, '#e53935', 8) +
    win(154, 42, 26, 24) +
    rect(18, 32, 120, 10, '#cfd8dc', 3, `stroke="${INK}" stroke-width="2"`) +
    [30, 50, 70, 90, 110].map((x) => line(x, 32, x, 42, INK, 2)).join('') +
    circ(60, 72, 13, '#ffeb3b', OUT) +
    circ(60, 72, 5, '#fb8c00') +
    rect(158, 26, 18, 8, '#1e88e5', 3, '') +
    wheel(40, 106, 15) +
    wheel(100, 106, 15) +
    wheel(166, 106, 15),
  digger: () =>
    tracks(26, 96, 110) +
    rect(36, 62, 84, 34, '#fbc02d', 6) +
    rect(78, 28, 42, 38, '#fbc02d', 6) +
    win(84, 34, 30, 24) +
    `<polyline points="118,72 156,36 180,80" fill="none" stroke="#f9a825" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>` +
    path('M168 80 H194 L188 104 Q178 110 168 98 Z', '#757575'),
  dumptruck: () =>
    path('M14 38 H136 L130 90 H20 Z', '#ffa726') +
    path('M26 38 Q50 14 78 38 Q102 20 128 38 Z', '#8d6e63', `stroke="${INK}" stroke-width="2"`) +
    rect(140, 44, 46, 56, '#fb8c00', 8) +
    win(150, 52, 28, 22) +
    rect(14, 90, 172, 10, '#455a64', 2, '') +
    wheel(44, 108, 16) +
    wheel(160, 108, 16),
  crane: () =>
    rect(62, 22, 14, 62, '#fbc02d', 2) +
    rect(28, 14, 154, 10, '#fbc02d', 2) +
    line(162, 24, 162, 56, '#455a64', 3) +
    rect(150, 56, 24, 16, '#e53935', 3) +
    rect(20, 82, 132, 22, '#fbc02d', 6) +
    rect(146, 62, 42, 42, '#fbc02d', 6) +
    win(154, 68, 26, 20) +
    wheel(46, 108, 14) +
    wheel(96, 108, 14) +
    wheel(166, 108, 14),
  mixer: () =>
    `<g transform="rotate(-12 82 64)">` +
    ell(82, 64, 62, 34, '#eceff1') +
    path('M40 40 Q60 64 40 90 M74 32 Q94 64 74 96 M108 32 Q128 64 108 96', 'none', 'stroke="#fb8c00" stroke-width="7" stroke-linecap="round"') +
    `</g>` +
    rect(146, 46, 42, 56, '#1e88e5', 8) +
    win(154, 54, 26, 22) +
    rect(14, 96, 174, 8, '#455a64', 2, '') +
    wheel(44, 110, 14) +
    wheel(92, 110, 14) +
    wheel(164, 110, 14),
  bulldozer: () =>
    tracks(18, 94, 128, 28) +
    rect(32, 60, 100, 36, '#fbc02d', 6) +
    rect(52, 26, 50, 38, '#fbc02d', 6) +
    win(58, 32, 38, 26) +
    line(130, 80, 152, 84, '#455a64', 8) +
    path('M150 54 L180 48 Q190 86 180 124 L150 118 Z', '#9e9e9e'),
  tractor: () =>
    rect(56, 58, 80, 38, '#43a047', 8) +
    rect(128, 64, 52, 32, '#43a047', 6) +
    rect(50, 18, 62, 8, '#2e7d32', 3) +
    line(56, 26, 56, 60, INK, 4) +
    line(106, 26, 106, 60, INK, 4) +
    win(62, 30, 40, 26) +
    rect(150, 40, 7, 26, '#455a64', 2, '') +
    wheel(76, 100, 30) +
    wheel(162, 108, 18),
  train: () =>
    rect(14, 94, 172, 10, '#37474f', 2, '') +
    rect(64, 50, 96, 46, '#1e88e5', 8) +
    rect(16, 28, 56, 68, '#e53935', 6) +
    win(28, 38, 32, 24) +
    rect(130, 24, 18, 28, '#455a64', 3) +
    circ(146, 14, 8, '#cfd8dc') +
    circ(160, 8, 6, '#eceff1') +
    path('M160 80 L188 104 H160 Z', '#fbc02d') +
    circ(160, 64, 6, '#fff59d', OUT) +
    wheel(40, 110, 14) +
    wheel(92, 110, 16) +
    wheel(138, 110, 16),
  carriage: () =>
    rect(10, 6, 180, 94, '#fb8c00', 12) +
    rect(10, 96, 180, 8, '#37474f', 2, '') +
    wheel(46, 110, 14) +
    wheel(154, 110, 14),
  garbagetruck: () =>
    rect(10, 32, 130, 68, '#43a047', 10) +
    path('M50 50 L62 72 H38 Z M86 50 L98 72 H74 Z', '#c8e6c9', `stroke="${INK}" stroke-width="2"`) +
    rect(140, 46, 46, 54, '#66bb6a', 8) +
    win(150, 54, 28, 22) +
    rect(10, 96, 176, 8, '#455a64', 2, '') +
    wheel(42, 108, 15) +
    wheel(98, 108, 15) +
    wheel(162, 108, 15),
  plane: () =>
    path('M24 66 L12 26 H34 L62 60 Z', '#e53935') +
    path('M20 76 Q20 56 52 56 H158 Q190 60 192 76 Q188 94 158 94 H52 Q20 94 20 76 Z', '#eceff1') +
    [68, 86, 104, 122, 140].map((x) => circ(x, 70, 5, '#64b5f6')).join('') +
    path('M164 62 Q180 64 186 72 H164 Z', '#64b5f6', `stroke="${INK}" stroke-width="2"`) +
    path('M84 82 H124 L98 124 H80 Z', '#90a4ae'),
  helicopter: () =>
    line(46, 30, 176, 30, INK, 6) +
    rect(106, 30, 8, 18, '#455a64', 2, '') +
    rect(16, 64, 70, 12, '#fb8c00', 5) +
    circ(18, 70, 12, 'none', `stroke="${INK}" stroke-width="3"`) +
    ell(118, 76, 50, 30, '#fb8c00') +
    path('M130 54 Q164 56 166 80 H130 Z', GLASS, `stroke="${INK}" stroke-width="2.5"`) +
    line(92, 106, 98, 116) +
    line(140, 106, 136, 116) +
    line(80, 116, 158, 116, INK, 5),
  boat: () =>
    line(100, 22, 100, 90) +
    path('M104 24 L104 86 L152 86 Z', '#fafafa') +
    path('M96 34 L96 86 L60 86 Z', '#ffeb3b') +
    path('M28 90 H172 L152 118 H48 Z', '#8d6e63') +
    path('M0 124 Q25 116 50 124 T100 124 T150 124 T200 124 V140 H0 Z', '#4fc3f7', ''),
  ship: () =>
    rect(70, 30, 18, 32, '#e53935', 2) +
    rect(104, 30, 18, 32, '#e53935', 2) +
    rect(40, 58, 112, 28, '#fafafa', 4) +
    [56, 80, 104, 128].map((x) => circ(x, 72, 5, '#64b5f6', `stroke="${INK}" stroke-width="2"`)).join('') +
    path('M8 84 H192 L170 118 H30 Z', '#1e88e5') +
    path('M0 124 Q25 116 50 124 T100 124 T150 124 T200 124 V140 H0 Z', '#4fc3f7', ''),
  auto: () =>
    path('M34 104 V70 H160 L184 92 V104 Z', '#43a047') +
    path('M40 70 Q44 30 86 28 H150 Q162 30 162 70 Z', '#fdd835') +
    path('M120 36 H148 Q156 38 156 64 H120 Z', GLASS, `stroke="${INK}" stroke-width="2.5"`) +
    path('M54 64 Q58 38 86 36 H108 V64 Z', '#212121', '') +
    wheel(64, 108, 15) +
    wheel(168, 108, 15),
  scooter: () =>
    line(146, 92, 158, 38, '#e91e63', 10) +
    line(146, 34, 172, 34, INK, 6) +
    circ(162, 48, 6, '#fff59d', OUT) +
    path('M28 94 Q34 62 78 64 H102 V96 H32 Z', '#e91e63') +
    rect(96, 86, 56, 10, '#e91e63', 4) +
    rect(46, 52, 50, 12, INK, 6, '') +
    wheel(46, 106, 16) +
    wheel(160, 106, 16),
  bicycle: () =>
    circ(50, 96, 26, 'none', `stroke="${INK}" stroke-width="6"`) +
    circ(150, 96, 26, 'none', `stroke="${INK}" stroke-width="6"`) +
    `<polyline points="50,96 90,96 128,56 76,56 50,96" fill="none" stroke="#1e88e5" stroke-width="7" stroke-linejoin="round"/>` +
    line(90, 96, 72, 46, '#1e88e5', 7) +
    line(128, 56, 150, 96, '#1e88e5', 7) +
    line(128, 56, 122, 36, '#1e88e5', 6) +
    line(114, 36, 138, 36, INK, 6) +
    rect(58, 40, 30, 9, INK, 4, ''),
  motorbike: () =>
    line(140, 66, 156, 100, '#455a64', 8) +
    line(132, 50, 152, 44, INK, 6) +
    path('M64 72 Q100 48 136 66 L142 84 H76 Z', '#e53935') +
    rect(84, 80, 42, 20, '#607d8b', 4) +
    path('M40 70 H86 L80 62 H48 Z', INK, '') +
    circ(150, 66, 6, '#fff59d', OUT) +
    wheel(48, 100, 22) +
    wheel(156, 100, 22),
  truck: () =>
    rect(10, 28, 124, 72, '#29b6f6', 6) +
    path('M136 48 H168 Q186 50 188 72 V100 H136 Z', '#e53935') +
    win(146, 56, 26, 20) +
    rect(10, 96, 178, 8, '#455a64', 2, '') +
    wheel(40, 108, 15) +
    wheel(96, 108, 15) +
    wheel(162, 108, 15),
  rocket: () =>
    path('M84 112 Q100 140 116 112 Z', '#ff9800', '') +
    path('M74 86 L54 120 H76 Z', '#e53935') +
    path('M126 86 L146 120 H124 Z', '#e53935') +
    path('M100 6 Q128 30 128 80 V114 H72 V80 Q72 30 100 6 Z', '#eceff1') +
    circ(100, 54, 13, '#64b5f6', OUT) +
    rect(72, 96, 56, 8, '#e53935', 0, ''),
  submarine: () =>
    path('M86 34 H114 Q120 34 120 40 V56 H80 V40 Q80 34 86 34 Z', '#fdd835') +
    `<polyline points="108,34 108,16 124,16" fill="none" stroke="${INK}" stroke-width="5"/>` +
    ell(104, 80, 82, 32, '#fdd835') +
    [72, 104, 136].map((x) => circ(x, 78, 9, '#64b5f6', OUT)).join('') +
    path('M22 80 L8 64 V96 Z', '#fb8c00') +
    circ(178, 52, 5, 'none', 'stroke="#4fc3f7" stroke-width="2"') +
    circ(188, 36, 7, 'none', 'stroke="#4fc3f7" stroke-width="2"'),
};

// ---- animals ----

function legs(xs, color, y = 92, h = 34, w = 12) {
  return xs.map((x) => rect(x, y, w, h, color, 4)).join('');
}

const ANIMALS = {
  cow: () =>
    path('M44 74 Q24 76 26 100', 'none', `stroke="${INK}" stroke-width="4" fill="none"`) +
    legs([58, 80, 120, 140], '#fafafa') +
    ell(100, 80, 58, 32, '#fafafa') +
    ell(80, 72, 14, 10, INK, '') +
    ell(118, 90, 12, 8, INK, '') +
    path('M140 34 L134 22 M172 34 L178 22', 'none', `stroke="#8d6e63" stroke-width="5" stroke-linecap="round"`) +
    ell(134, 44, 10, 6, '#fafafa') +
    ell(178, 44, 10, 6, '#fafafa') +
    circ(156, 54, 24, '#fafafa', OUT) +
    ell(158, 72, 18, 12, '#f8bbd0') +
    circ(152, 72, 2.5, INK) +
    circ(164, 72, 2.5, INK) +
    eye(148, 50) +
    eye(166, 50),
  dog: () =>
    path('M44 74 Q30 50 38 40', 'none', `stroke="${INK}" stroke-width="3" fill="none"`) +
    path('M44 74 Q30 50 38 40', 'none', 'stroke="#a1887f" stroke-width="8" stroke-linecap="round" fill="none"') +
    legs([60, 80, 118, 138], '#a1887f') +
    ell(100, 82, 54, 28, '#a1887f') +
    circ(152, 56, 26, '#a1887f', OUT) +
    ell(132, 60, 10, 20, '#6d4c41') +
    ell(170, 66, 14, 10, '#d7ccc8') +
    circ(178, 62, 5, INK) +
    eye(148, 50) +
    eye(164, 50),
  cat: () =>
    path('M46 80 Q20 70 28 40', 'none', 'stroke="#ffb74d" stroke-width="9" stroke-linecap="round" fill="none"') +
    legs([62, 80, 118, 136], '#ffb74d', 94, 32, 10) +
    ell(100, 84, 50, 26, '#ffb74d') +
    path('M132 44 L136 18 L152 36 Z M164 36 L180 18 L182 44 Z', '#ffb74d') +
    circ(156, 54, 26, '#ffb74d', OUT) +
    eye(146, 50) +
    eye(166, 50) +
    path('M152 62 L160 62 L156 67 Z', '#f06292', '') +
    line(140, 66, 120, 62, INK, 2) +
    line(140, 70, 120, 72, INK, 2) +
    line(172, 66, 192, 62, INK, 2) +
    line(172, 70, 192, 72, INK, 2),
  horse: () =>
    path('M46 70 Q28 84 34 112', 'none', 'stroke="#4e342e" stroke-width="10" stroke-linecap="round" fill="none"') +
    legs([58, 78, 120, 140], '#8d6e63', 88, 40) +
    ell(100, 78, 56, 28, '#8d6e63') +
    path('M136 66 L150 22 Q160 12 172 20 L190 52 Q192 62 182 64 L160 50 L152 74 Z', '#8d6e63') +
    path('M146 30 Q140 50 134 66', 'none', 'stroke="#4e342e" stroke-width="8" stroke-linecap="round" fill="none"') +
    eye(166, 32),
  goat: () =>
    legs([60, 80, 118, 136], '#e0e0e0') +
    ell(100, 80, 50, 28, '#eeeeee') +
    path('M146 34 Q140 12 124 16 M164 32 Q170 10 186 16', 'none', `stroke="#8d6e63" stroke-width="5" stroke-linecap="round" fill="none"`) +
    ell(156, 54, 20, 24, '#eeeeee') +
    path('M150 76 L156 96 L162 76 Z', '#bdbdbd') +
    eye(148, 50) +
    eye(164, 50),
  sheep: () =>
    legs([66, 86, 114, 132], INK, 96, 30, 10) +
    [
      [70, 70],
      [96, 62],
      [122, 68],
      [80, 92],
      [110, 92],
      [60, 86],
      [134, 86],
    ]
      .map(([x, y]) => circ(x, y, 22, '#fafafa', OUT))
      .join('') +
    ell(100, 80, 40, 20, '#fafafa', '') +
    ell(158, 62, 16, 22, '#424242') +
    eye(152, 56, 3.5) +
    eye(164, 56, 3.5),
  elephant: () =>
    legs([50, 76, 116, 140], '#90a4ae', 90, 40, 18) +
    ell(98, 78, 64, 40, '#90a4ae') +
    ell(140, 62, 26, 30, '#78909c') +
    circ(160, 58, 28, '#90a4ae', OUT) +
    path('M178 66 Q194 96 180 120 Q176 124 172 118 Q182 96 168 76 Z', '#90a4ae') +
    eye(166, 50),
  lion: () =>
    path('M44 80 Q20 82 22 110', 'none', `stroke="${INK}" stroke-width="3" fill="none"`) +
    circ(22, 112, 7, '#ef6c00') +
    legs([60, 80, 118, 136], '#ffca28') +
    ell(98, 82, 52, 28, '#ffca28') +
    circ(152, 56, 38, '#ef6c00', OUT) +
    circ(152, 58, 25, '#ffca28', OUT) +
    eye(144, 52) +
    eye(160, 52) +
    path('M148 64 H156 L152 70 Z', INK, ''),
  rabbit: () =>
    ell(84, 26, 9, 28, '#eeeeee') +
    ell(116, 26, 9, 28, '#eeeeee') +
    ell(84, 28, 4, 20, '#f8bbd0', '') +
    ell(116, 28, 4, 20, '#f8bbd0', '') +
    circ(62, 108, 10, '#fafafa', OUT) +
    ell(100, 100, 40, 30, '#eeeeee') +
    circ(100, 62, 26, '#eeeeee', OUT) +
    eye(90, 58) +
    eye(110, 58) +
    path('M96 68 H104 L100 73 Z', '#f06292', '') +
    ell(80, 128, 14, 7, '#eeeeee') +
    ell(120, 128, 14, 7, '#eeeeee'),
  monkey: () =>
    path('M64 112 Q24 110 34 76 Q40 62 52 70', 'none', 'stroke="#795548" stroke-width="8" stroke-linecap="round" fill="none"') +
    ell(100, 100, 36, 32, '#795548') +
    ell(100, 104, 20, 20, '#d7ccc8', '') +
    circ(68, 54, 12, '#d7ccc8', OUT) +
    circ(132, 54, 12, '#d7ccc8', OUT) +
    circ(100, 54, 30, '#795548', OUT) +
    ell(100, 62, 20, 16, '#d7ccc8', '') +
    eye(90, 50) +
    eye(110, 50) +
    path('M92 66 Q100 72 108 66', 'none', `stroke="${INK}" stroke-width="2.5" fill="none"`),
  parrot: () =>
    line(40, 118, 170, 118, '#6d4c41', 8) +
    path('M86 104 L64 136 L82 136 L98 108 Z', '#1e88e5') +
    ell(104, 80, 28, 40, '#43a047') +
    ell(94, 86, 14, 26, '#2e7d32', '') +
    circ(110, 40, 22, '#43a047', OUT) +
    path('M128 36 Q146 40 136 58 Q130 52 124 50 Z', '#e53935') +
    eye(112, 34) +
    line(96, 118, 98, 112, INK, 3) +
    line(112, 118, 110, 112, INK, 3),
  fish: () =>
    path('M44 70 L14 44 V96 Z', '#fb8c00') +
    ell(100, 70, 60, 34, '#ffa726') +
    path('M96 38 Q104 22 120 40', '#fb8c00') +
    path('M80 74 Q96 82 108 74', 'none', `stroke="${INK}" stroke-width="2.5" fill="none"`) +
    eye(136, 62, 6) +
    circ(176, 40, 4, 'none', 'stroke="#4fc3f7" stroke-width="2"') +
    circ(186, 26, 6, 'none', 'stroke="#4fc3f7" stroke-width="2"'),
  duck: () =>
    path('M0 118 Q25 110 50 118 T100 118 T150 118 T200 118 V140 H0 Z', '#4fc3f7', '') +
    path('M44 84 L30 66 L52 74 Z', '#fdd835') +
    ell(92, 92, 52, 26, '#fdd835') +
    path('M70 86 Q92 72 112 90', '#fbc02d') +
    circ(140, 56, 22, '#fdd835', OUT) +
    path('M158 56 Q182 56 182 64 Q176 70 158 66 Z', '#fb8c00') +
    eye(144, 50),
  rooster: () =>
    path('M60 76 Q30 40 50 20 Q60 50 72 64 Z', '#2e7d32') +
    path('M60 80 Q24 64 30 36 Q50 60 74 70 Z', '#1e88e5') +
    line(92, 106, 92, 128, '#fb8c00', 5) +
    line(112, 106, 112, 128, '#fb8c00', 5) +
    ell(100, 84, 40, 28, '#a1887f') +
    path('M120 70 Q118 40 132 34 L150 40 Q154 60 140 80 Z', '#a1887f') +
    path('M128 34 Q130 20 136 26 Q140 16 146 26 Q152 20 152 34 Z', '#e53935') +
    path('M150 44 L164 48 L150 54 Z', '#fdd835') +
    ell(148, 60, 4, 8, '#e53935', '') +
    eye(140, 44),
};

// ---- shapes, colours and concepts ----

function starPoints(cx, cy, r1, r2, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = (Math.PI / n) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

export const SHAPES = {
  circle: (c) => circ(100, 70, 52, c, OUT),
  square: (c) => rect(52, 22, 96, 96, c, 6),
  triangle: (c) => path('M100 16 L156 120 H44 Z', c),
  star: (c) => `<polygon points="${starPoints(100, 72, 60, 26)}" fill="${c}" ${OUT}/>`,
  heart: (c) => path('M100 124 C40 84 38 44 66 30 C84 22 98 36 100 46 C102 36 116 22 134 30 C162 44 160 84 100 124 Z', c),
};

const CONCEPTS = {
  color: (c = '#e53935') =>
    path('M100 18 C140 18 172 40 166 74 C176 100 146 124 108 120 C70 128 30 110 34 78 C22 48 56 18 100 18 Z', c) +
    circ(80, 54, 9, '#fff', 'opacity="0.5"'),
  'size-big': () => rect(30, 10, 140, 120, '#ab47bc', 12),
  'size-small': () => rect(82, 82, 36, 36, '#ab47bc', 6),
  'dir-up': () => path('M100 12 L160 72 H122 V128 H78 V72 H40 Z', '#26a69a'),
  'dir-down': () => path('M100 128 L160 68 H122 V12 H78 V68 H40 Z', '#26a69a'),
  'speed-fast': () =>
    line(16, 50, 70, 50, '#90a4ae', 7) +
    line(6, 72, 70, 72, '#90a4ae', 7) +
    line(16, 94, 70, 94, '#90a4ae', 7) +
    path('M90 30 L170 72 L90 114 Z', '#ef5350'),
  'speed-slow': () =>
    // a snail
    path('M30 110 H170 Q176 110 172 104 L150 96 H40 Q26 100 30 110 Z', '#a5d6a7') +
    circ(90, 78, 34, '#ffb74d', OUT) +
    path('M90 78 m-6 0 a6 6 0 1 1 12 0 a14 14 0 1 1 -28 0 a22 22 0 1 1 44 0', 'none', `stroke="${INK}" stroke-width="3" fill="none"`) +
    line(150, 98, 160, 66, INK, 3) +
    line(160, 98, 176, 70, INK, 3) +
    eye(160, 64, 4) +
    eye(176, 68, 4),
};

// ---- places on the town map (viewBox 0 0 200 160) ----

const ground = (c = '#9ccc65') => rect(0, 128, 200, 32, c, 0, '');
const PLACES = {
  'place-construction': () =>
    ground('#d7ccc8') +
    rect(120, 20, 10, 110, '#fbc02d', 1) +
    rect(70, 16, 120, 10, '#fbc02d', 1) +
    line(176, 26, 176, 58, INK, 3) +
    rect(166, 58, 20, 14, '#e53935', 2) +
    path('M10 132 Q50 70 96 132 Z', '#8d6e63') +
    path('M40 132 L50 104 L60 132 Z', '#ff7043') +
    path('M140 132 L150 104 L160 132 Z', '#ff7043') +
    line(10, 140, 190, 140, '#fbc02d', 6),
  'place-busdepot': () =>
    ground() +
    rect(20, 40, 120, 12, '#1e88e5', 4) +
    line(30, 52, 30, 128) +
    line(130, 52, 130, 128) +
    rect(46, 104, 68, 10, '#8d6e63', 3) +
    line(166, 40, 166, 128, INK, 5) +
    circ(166, 36, 18, '#fdd835', OUT) +
    rect(156, 30, 20, 12, '#1e88e5', 3, ''),
  'place-fire': () =>
    ground() +
    path('M20 50 L100 14 L180 50 Z', '#b71c1c') +
    rect(26, 50, 148, 80, '#e53935', 0) +
    path('M60 130 V92 Q100 60 140 92 V130 Z', '#ffcdd2') +
    [74, 92, 110, 128].map((x) => line(x, 82, x, 130, '#e57373', 3)).join('') +
    circ(100, 36, 8, '#fdd835', OUT),
  'place-police': () =>
    ground() +
    rect(20, 40, 160, 90, '#1e88e5', 0) +
    rect(20, 32, 160, 12, '#0d47a1', 2) +
    rect(88, 12, 24, 20, '#e53935', 4) +
    `<polygon points="${starPoints(100, 70, 20, 9)}" fill="#fdd835" ${OUT}/>` +
    rect(84, 96, 32, 34, '#bbdefb', 3) +
    win(36, 60, 30, 26) +
    win(134, 60, 30, 26),
  'place-hospital': () =>
    ground() +
    rect(24, 30, 152, 100, '#fafafa', 0) +
    circ(100, 50, 16, '#1e88e5', OUT) +
    `<text x="100" y="58" text-anchor="middle" font-size="24" font-weight="bold" font-family="sans-serif" fill="#fff">H</text>` +
    path('M100 96 C80 82 82 70 92 70 C97 70 100 75 100 75 C100 75 103 70 108 70 C118 70 120 82 100 96 Z', '#e53935', '') +
    win(36, 76, 28, 24) +
    win(136, 76, 28, 24) +
    rect(84, 104, 32, 26, '#80cbc4', 3),
  'place-farm': () =>
    ground() +
    rect(146, 40, 36, 90, '#b0bec5', 16) +
    path('M24 60 L70 22 L116 60 V130 H24 Z', '#c62828') +
    rect(52, 80, 36, 50, '#fafafa', 2) +
    line(52, 80, 88, 130, '#c62828', 4) +
    line(88, 80, 52, 130, '#c62828', 4) +
    line(120, 112, 200, 112, '#8d6e63', 4) +
    line(130, 104, 130, 130, '#8d6e63', 4),
  'place-railway': () =>
    ground('#bcaaa4') +
    rect(30, 40, 140, 70, '#ffcc80', 0) +
    path('M20 44 L100 14 L180 44 Z', '#6d4c41') +
    circ(100, 64, 14, '#fff', OUT) +
    line(100, 64, 100, 55, INK, 3) +
    line(100, 64, 107, 67, INK, 3) +
    rect(88, 86, 24, 24, '#8d6e63', 2) +
    line(0, 128, 200, 128, '#5d4037', 4) +
    line(0, 146, 200, 146, '#5d4037', 4) +
    [10, 40, 70, 100, 130, 160, 190].map((x) => line(x - 6, 137, x + 6, 137, '#8d6e63', 6)).join(''),
  'place-recycling': () =>
    ground() +
    rect(14, 70, 50, 60, '#e53935', 6) +
    rect(76, 70, 50, 60, '#1e88e5', 6) +
    rect(138, 70, 50, 60, '#fdd835', 6) +
    path('M39 84 L49 102 H29 Z M101 84 L111 102 H91 Z M163 84 L173 102 H153 Z', '#fff', `stroke="${INK}" stroke-width="2"`) +
    rect(10, 60, 58, 10, '#b71c1c', 3) +
    rect(72, 60, 58, 10, '#0d47a1', 3) +
    rect(134, 60, 58, 10, '#f9a825', 3),
  'place-airport': () =>
    rect(0, 112, 200, 48, '#4fc3f7', 0, '') +
    rect(20, 40, 24, 74, '#eceff1', 2) +
    rect(12, 24, 40, 18, '#64b5f6', 4) +
    `<g transform="translate(70 4) scale(0.6)">${VEHICLES.plane()}</g>` +
    `<g transform="translate(90 84) scale(0.5)">${VEHICLES.boat()}</g>`,
  'place-trace': () =>
    ground() +
    path('M10 150 C10 60 80 120 100 70 S170 20 190 30', 'none', 'stroke="#546e7a" stroke-width="30" fill="none" stroke-linecap="round"') +
    path('M10 150 C10 60 80 120 100 70 S170 20 190 30', 'none', 'stroke="#fff" stroke-width="4" stroke-dasharray="10 10" fill="none"') +
    circ(190, 30, 12, '#e53935', OUT),
  'place-garage': () =>
    ground() +
    path('M14 56 L100 16 L186 56 Z', '#5c6bc0') +
    rect(24, 56, 152, 74, '#9fa8da', 0) +
    rect(46, 72, 108, 58, '#e8eaf6', 3) +
    [84, 96, 108, 120].map((y) => line(46, y, 154, y, '#9fa8da', 3)).join(''),
};

const ALL = { ...VEHICLES, ...ANIMALS, ...CONCEPTS, ...PLACES };
for (const [name, fn] of Object.entries(SHAPES)) ALL[`shape-${name}`] = fn;

export const KNOWN_PICTURES = Object.keys(ALL);

// The badge drawn when a parent adds a word whose picture has no built-in drawing.
function badge(label = '?', color = '#7e57c2') {
  const ch = String(label).trim().charAt(0).toUpperCase() || '?';
  const safe = ch.replace(/[&<>"]/g, '');
  return svg(
    circ(100, 70, 58, color, OUT) +
      `<text x="100" y="92" text-anchor="middle" font-size="64" font-weight="bold" font-family="sans-serif" fill="#fff">${safe}</text>`,
  );
}

export function picture(id, opts = {}) {
  const fn = ALL[id];
  if (!fn) return badge(opts.label, opts.color);
  const vb = id.startsWith('place-') ? '0 0 200 160' : '0 0 200 140';
  return svg(fn(opts.color), vb);
}

export function pictureForWord(word) {
  return picture(word.picture, { color: word.color, label: word.en });
}

export function shapePicture(shape, color) {
  return svg((SHAPES[shape] || SHAPES.circle)(color));
}

// A car frame with the parent's photo in the window. `src` is a data: URL from the device.
let clipCount = 0;
export function specialVehicle(src) {
  const id = `sv${++clipCount}`;
  const safe = String(src).replace(/"/g, '');
  return svg(
    `<defs><clipPath id="${id}"><circle cx="100" cy="58" r="42"/></clipPath></defs>` +
      rect(14, 58, 172, 46, '#ab47bc', 18) +
      circ(100, 58, 46, '#ab47bc', OUT) +
      `<image href="${safe}" x="58" y="16" width="84" height="84" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>` +
      wheel(50, 108, 18) +
      wheel(150, 108, 18),
  );
}
