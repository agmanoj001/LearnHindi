// Pictures for the phase word lists (KG, Grade 1 matras, Grade 2 conjuncts, Grade 3 stories),
// plus the vehicles and places of the reading games. Same flat style as art.js, 200x140 grid.
import { INK, GLASS, rect, circ, ell, path, line, win, wheel, eye, starPoints } from './art-kit.js';

const stroke = (color, w) => `stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
const rot = (deg, cx, cy, body) => `<g transform="rotate(${deg} ${cx} ${cy})">${body}</g>`;
const mirror = (body) => `<g transform="translate(200 0) scale(-1 1)">${body}</g>`;
const SKIN = '#F6B99A';

// Things that rest on the ground get a soft shadow; things in the air (kite, sun ...) do not.
export const FLOATING = new Set(['sun', 'moon', 'kite', 'butterfly', 'balloon', 'fly', 'garland', 'arrow', 'eye', 'envelope', 'river']);

export const WORD_ART = {
  // ---------- KG: words without matras ----------
  house: () =>
    rect(48, 62, 104, 62, '#FFB55C', 6) +
    rect(124, 28, 14, 26, '#D63A3F', 3) +
    path('M36 68 L100 20 L164 68 Q166 72 160 72 H40 Q34 72 36 68 Z', '#FF5A5F') +
    rect(88, 88, 24, 36, '#8A5A44', 6) +
    win(60, 80, 20, 18) +
    win(120, 80, 20, 18),
  tap: () =>
    rect(10, 30, 70, 16, '#94A3B8', 8) +
    rect(66, 24, 44, 28, '#B8C2D1', 12) +
    rect(84, 8, 12, 18, '#FF5A5F', 4) +
    rect(72, 6, 36, 8, '#FF5A5F', 4) +
    path('M100 32 H132 Q146 32 146 46 V62 H130 V50 Q130 46 126 46 H100 Z', '#94A3B8') +
    path('M138 76 Q146 90 138 96 Q130 90 138 76 Z', '#6AAEFF') +
    path('M138 104 Q145 116 138 121 Q131 116 138 104 Z', '#6AAEFF'),
  fruit: () =>
    circ(76, 66, 22, '#FF5A5F') +
    circ(124, 64, 22, '#FF9F43') +
    path('M84 86 Q98 44 146 52 Q114 64 100 86 Z', '#FFD43B') +
    ell(80, 44, 8, 4, '#2EC27E') +
    path('M36 84 H164 Q160 126 100 126 Q40 126 36 84 Z', '#A66BFF') +
    rect(36, 80, 128, 10, '#8B56F0', 5),
  cup: () =>
    path('M84 42 Q76 32 84 22 M104 42 Q96 32 104 22', 'none', stroke('#C4C9D4', 5)) +
    circ(136, 80, 15, 'none', 'stroke="#3D7BFF" stroke-width="9"') +
    path('M60 50 H132 V96 Q132 120 108 120 H84 Q60 120 60 96 Z', '#3D7BFF') +
    rect(60, 50, 72, 8, '#2F5BD3', 3) +
    ell(96, 124, 56, 7, '#B8C2D1'),
  water: () =>
    path('M64 24 H136 L125 122 Q124 128 117 128 H83 Q76 128 75 122 Z', '#E4F2FF') +
    path('M69 58 Q86 52 100 58 T131 58 L125 122 Q124 128 117 128 H83 Q76 128 75 122 Z', '#6AAEFF') +
    rect(82, 66, 7, 48, '#fff', 3, 'opacity="0.55"'),
  lotus: () =>
    ell(100, 120, 84, 10, '#7DD3FC') +
    ell(58, 114, 32, 8, '#2EC27E') +
    path('M100 102 Q64 110 44 90 Q76 80 100 102 Z', '#FFC2D6') +
    path('M100 102 Q136 110 156 90 Q124 80 100 102 Z', '#FFC2D6') +
    path('M100 100 Q64 92 56 58 Q90 64 100 100 Z', '#FF8FB1') +
    path('M100 100 Q136 92 144 58 Q110 64 100 100 Z', '#FF8FB1') +
    path('M100 34 Q122 68 100 102 Q78 68 100 34 Z', '#FF6B9A'),
  pen: () =>
    rot(
      -32,
      100,
      70,
      rect(30, 60, 118, 20, '#3D7BFF', 10) +
        rect(52, 53, 46, 7, '#B8C2D1', 3) +
        rect(126, 60, 22, 20, '#2F5BD3', 4) +
        path('M146 60 L176 70 L146 80 Z', '#FFC93C') +
        circ(173, 70, 3, INK),
    ),
  button: () =>
    circ(100, 70, 50, '#FF7A59') +
    circ(100, 70, 38, '#FF9A7A') +
    [
      [88, 58],
      [112, 58],
      [88, 82],
      [112, 82],
    ]
      .map(([x, y]) => circ(x, y, 6, '#C2462A'))
      .join(''),
  peas: () =>
    path('M28 82 Q100 18 172 70 Q100 112 28 82 Z', '#2EC27E') +
    path('M44 78 Q100 40 156 70 Q100 98 44 78 Z', '#A7E8B8') +
    circ(72, 72, 13, '#1F9D63') +
    circ(100, 66, 14, '#1F9D63') +
    circ(128, 66, 13, '#1F9D63') +
    path('M170 70 Q184 62 186 48', 'none', stroke('#1F9D63', 5)),
  crocodile: () =>
    path('M30 94 Q12 98 4 112 Q22 106 38 104 Z', '#2EC27E') +
    rect(54, 100, 14, 22, '#1F9D63', 6) +
    rect(118, 100, 14, 22, '#1F9D63', 6) +
    ell(94, 92, 66, 20, '#2EC27E') +
    path('M146 80 H190 Q198 86 190 94 H146 Z', '#2EC27E') +
    path('M154 94 l5 6 l5 -6 l5 6 l5 -6 l5 6 l5 -6', 'none', stroke('#fff', 2.5)) +
    [56, 76, 96, 116].map((x) => path(`M${x} 74 l9 -10 l9 10 Z`, '#1F9D63')).join('') +
    circ(150, 74, 9, '#2EC27E') +
    eye(151, 72, 4),
  envelope: () =>
    rect(34, 34, 132, 86, '#FFF1A6', 12) +
    path('M34 116 L84 78 M166 116 L116 78', 'none', stroke('#F2D45C', 3)) +
    path('M38 36 H162 Q168 36 164 42 L100 90 L36 42 Q32 36 38 36 Z', '#FFE45C') +
    circ(100, 84, 10, '#FF5A5F'),

  // ---------- Grade 1: matras ----------
  mango: () =>
    path('M70 50 Q122 18 148 66 Q162 112 110 120 Q58 122 54 86 Q52 62 70 50 Z', '#FFB52E') +
    ell(118, 96, 30, 18, '#FF9F43', 'opacity="0.6"') +
    path('M90 46 Q108 18 138 24 Q118 48 90 46 Z', '#2EC27E') +
    line(90, 46, 86, 34, '#7A5444', 4),
  lock: () =>
    path('M70 62 V44 Q70 16 100 16 Q130 16 130 44 V62', 'none', stroke('#94A3B8', 14)) +
    rect(54, 56, 92, 70, '#FFC233', 18) +
    circ(100, 84, 9, '#7A5444') +
    rect(96, 86, 8, 20, '#7A5444', 4),
  carrot: () =>
    path('M148 32 Q160 18 166 8 Q170 26 156 38 Z', '#2EC27E') +
    path('M154 38 Q172 24 190 30 Q176 44 158 44 Z', '#4ADE80') +
    path('M150 30 Q162 40 152 52 L62 124 Q48 130 52 116 L132 34 Q140 24 150 30 Z', '#FF9F43') +
    path('M112 62 L122 70 M92 82 L102 90 M74 100 L82 106', 'none', stroke('#E07B1F', 3)),
  tea: () =>
    path('M84 44 Q76 34 84 24 M108 44 Q100 34 108 24', 'none', stroke('#C4C9D4', 5)) +
    circ(152, 78, 14, 'none', 'stroke="#E3E6ED" stroke-width="8"') +
    path('M52 56 H148 Q144 114 100 118 Q56 114 52 56 Z', '#F3F4F8') +
    ell(100, 57, 48, 8, '#B66A3C') +
    circ(100, 90, 9, '#FF6B9A') +
    ell(100, 122, 64, 8, '#E3E6ED'),
  garland: () => {
    let s = '';
    for (let i = 0; i <= 12; i++) {
      const t = (Math.PI * i) / 12;
      s += circ((100 + 60 * Math.cos(t)).toFixed(1), (24 + 82 * Math.sin(t)).toFixed(1), 10, i % 2 ? '#FFD43B' : '#FF9F43');
    }
    return s + circ(100, 124, 10, '#FF5A5F') + circ(100, 124, 4, '#FFD43B');
  },
  fort: () =>
    rect(30, 64, 140, 62, '#E8A87C', 0) +
    rect(20, 42, 40, 84, '#D98C5F', 4) +
    rect(140, 42, 40, 84, '#D98C5F', 4) +
    [20, 32, 44, 140, 152, 164].map((x) => rect(x, 32, 8, 12, '#D98C5F', 2)).join('') +
    [64, 80, 96, 112, 128].map((x) => rect(x, 54, 9, 12, '#E8A87C', 2)).join('') +
    path('M82 126 V100 Q100 78 118 100 V126 Z', '#8A5A44') +
    line(40, 32, 40, 8, '#7A5444', 3) +
    path('M40 8 L62 14 L40 21 Z', '#FF5A5F'),
  butterfly: () =>
    path('M100 70 Q62 8 38 38 Q28 70 100 70 Z', '#A66BFF') +
    path('M100 70 Q138 8 162 38 Q172 70 100 70 Z', '#A66BFF') +
    path('M100 72 Q60 122 50 98 Q48 80 100 72 Z', '#FF6B9A') +
    path('M100 72 Q140 122 150 98 Q152 80 100 72 Z', '#FF6B9A') +
    circ(64, 46, 8, '#FFD43B') +
    circ(136, 46, 8, '#FFD43B') +
    ell(100, 74, 6, 30, INK) +
    path('M97 46 Q90 28 80 24 M103 46 Q110 28 120 24', 'none', stroke(INK, 3)),
  book: () =>
    path('M26 38 Q64 30 100 44 Q136 30 174 38 V122 Q136 114 100 128 Q64 114 26 122 Z', '#3D7BFF') +
    path('M100 44 Q70 30 34 36 V114 Q70 108 100 120 Z', '#F3F4F8') +
    path('M100 44 Q130 30 166 36 V114 Q130 108 100 120 Z', '#E8ECF4') +
    [56, 70, 84, 98].map((y) => line(46, y, 88, y + 4, '#C4C9D4', 3) + line(112, y + 4, 154, y, '#C4C9D4', 3)).join(''),
  arrow: () =>
    rot(
      -24,
      100,
      70,
      rect(30, 66, 126, 8, '#A47864', 4) + path('M150 54 L184 70 L150 86 Z', '#94A3B8') + path('M32 70 L16 54 H36 L48 70 Z M32 70 L16 86 H36 L48 70 Z', '#FF5A5F'),
    ),
  lamp: () =>
    circ(100, 64, 34, '#FFE45C', 'opacity="0.25"') +
    path('M100 36 Q120 64 100 84 Q80 64 100 36 Z', '#FF9F43') +
    path('M100 52 Q109 68 100 80 Q91 68 100 52 Z', '#FFE45C') +
    path('M34 88 H166 Q152 126 100 126 Q48 126 34 88 Z', '#E07B4F') +
    ell(100, 88, 66, 10, '#C2603A') +
    ell(100, 88, 56, 6, '#FFC233'),
  whistle: () =>
    path('M150 40 Q166 48 162 62 M156 30 Q178 40 174 62', 'none', stroke('#C4C9D4', 4)) +
    rect(30, 56, 96, 30, '#3D7BFF', 10) +
    circ(120, 86, 30, '#3D7BFF') +
    circ(120, 86, 14, '#2F5BD3') +
    rect(94, 56, 16, 8, INK, 3) +
    circ(40, 54, 9, 'none', 'stroke="#94A3B8" stroke-width="4"'),
  cucumber: () =>
    path('M28 92 Q40 60 100 56 Q168 54 174 78 Q172 100 104 102 Q42 106 28 92 Z', '#2EC27E') +
    path('M44 84 Q100 70 160 76', 'none', stroke('#7EE0A8', 4)) +
    [60, 84, 108, 132, 152].map((x, i) => circ(x, 88 - (i % 2) * 6, 3, '#1F9D63')).join(''),
  bridge: () =>
    ell(100, 126, 92, 9, '#7DD3FC') +
    path('M8 64 H192 V124 H162 Q160 82 100 82 Q40 82 38 124 H8 Z', '#E8A87C') +
    rect(4, 54, 192, 12, '#D98C5F', 5) +
    [20, 50, 80, 110, 140, 170].map((x) => rect(x, 38, 8, 18, '#D98C5F', 3)).join('') +
    rect(10, 38, 180, 6, '#D98C5F', 3),
  rose: () =>
    line(100, 76, 100, 130, '#2EC27E', 6) +
    path('M100 106 Q78 92 68 104 Q84 118 100 110 Z', '#2EC27E') +
    path('M100 96 Q122 82 132 94 Q116 108 100 100 Z', '#4ADE80') +
    circ(100, 52, 32, '#FF5A5F') +
    path('M68 50 Q70 84 100 84 Q80 76 68 50 Z', '#D63A3F') +
    path('M100 34 Q120 38 116 56 Q110 72 92 66 Q80 58 92 46 Q100 42 104 50', 'none', stroke('#D63A3F', 4)),
  flower: () =>
    line(100, 76, 100, 130, '#2EC27E', 6) +
    path('M100 112 Q76 96 66 110 Q82 124 100 116 Z', '#2EC27E') +
    [0, 60, 120, 180, 240, 300].map((a) => circ((100 + 24 * Math.cos((a * Math.PI) / 180)).toFixed(1), (50 + 24 * Math.sin((a * Math.PI) / 180)).toFixed(1), 17, '#FF6B9A')).join('') +
    circ(100, 50, 15, '#FFC93C'),
  bear: () =>
    ell(100, 100, 46, 34, '#A47864') +
    ell(100, 106, 26, 22, '#E9DCD3') +
    circ(74, 26, 12, '#A47864') +
    circ(126, 26, 12, '#A47864') +
    circ(74, 26, 6, '#E9DCD3') +
    circ(126, 26, 6, '#E9DCD3') +
    circ(100, 50, 31, '#A47864') +
    ell(100, 62, 15, 11, '#E9DCD3') +
    ell(100, 57, 6, 4, INK) +
    eye(88, 45) +
    eye(112, 45) +
    ell(68, 126, 16, 8, '#8A5A44') +
    ell(132, 126, 16, 8, '#8A5A44'),
  sun: () =>
    Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return line((100 + 44 * Math.cos(a)).toFixed(1), (70 + 44 * Math.sin(a)).toFixed(1), (100 + 60 * Math.cos(a)).toFixed(1), (70 + 60 * Math.sin(a)).toFixed(1), '#FFB52E', 8);
    }).join('') +
    circ(100, 70, 36, '#FFC93C') +
    eye(88, 64, 4) +
    eye(112, 64, 4) +
    path('M88 80 Q100 90 112 80', 'none', stroke('#C97A00', 3.5)),
  shoe: () =>
    path('M30 106 V82 Q30 62 52 64 Q72 66 84 82 L122 90 Q162 96 172 108 Z', '#FF5A5F') +
    path('M44 66 Q52 84 52 104', 'none', stroke('#D63A3F', 4)) +
    path('M70 76 L80 70 M78 82 L88 76 M86 86 L96 80', 'none', stroke('#fff', 3)) +
    rect(24, 104, 154, 16, '#F3F4F8', 8),
  mouse: () =>
    path('M44 112 Q16 108 22 82', 'none', stroke('#A0A7B4', 4)) +
    path('M40 112 Q50 60 110 70 Q152 78 164 106 Q150 116 40 112 Z', '#A0A7B4') +
    circ(108, 62, 17, '#A0A7B4') +
    circ(108, 62, 10, '#FFC2D6') +
    circ(166, 104, 5, '#FF6B9A') +
    eye(140, 90) +
    path('M158 100 L178 94 M158 104 L180 106', 'none', stroke(INK, 1.5)),
  swing: () =>
    line(28, 130, 58, 14, '#A47864', 8) +
    line(172, 130, 142, 14, '#A47864', 8) +
    line(46, 16, 154, 16, '#8A5A44', 10) +
    line(80, 18, 80, 96, '#7A5444', 3) +
    line(120, 18, 120, 96, '#7A5444', 3) +
    rect(68, 94, 64, 10, '#FF5A5F', 5),
  potato: () =>
    path('M42 80 Q38 48 80 44 Q112 38 142 52 Q170 66 162 92 Q150 118 104 116 Q50 116 42 80 Z', '#D9A066') +
    [
      [72, 70],
      [110, 60],
      [134, 86],
      [92, 96],
      [62, 92],
    ]
      .map(([x, y]) => circ(x, y, 3, '#B7834A'))
      .join(''),
  banana: () =>
    path('M40 54 Q60 120 152 100 Q168 96 162 88 Q92 102 64 46 Q58 36 48 40 Q38 44 40 54 Z', '#FFD43B') +
    path('M60 60 Q84 96 150 94', 'none', stroke('#F5C518', 4)) +
    circ(45, 44, 4, '#7A5444') +
    circ(162, 92, 3, '#7A5444'),
  apple: () =>
    path('M100 44 Q130 30 150 52 Q166 80 142 110 Q126 128 100 116 Q74 128 58 110 Q34 80 50 52 Q70 30 100 44 Z', '#FF5A5F') +
    ell(72, 68, 8, 14, '#fff', 'opacity="0.35"') +
    line(100, 44, 104, 24, '#7A5444', 5) +
    path('M104 30 Q124 12 138 22 Q124 38 104 30 Z', '#2EC27E'),
  tree: () =>
    rect(90, 76, 20, 52, '#A47864', 6) +
    circ(100, 48, 36, '#2EC27E') +
    circ(68, 68, 26, '#2EC27E') +
    circ(132, 68, 26, '#2EC27E') +
    circ(88, 38, 14, '#4ADE80') +
    circ(76, 64, 5, '#FF5A5F') +
    circ(124, 52, 5, '#FF5A5F') +
    circ(112, 80, 5, '#FF5A5F'),
  table: () =>
    rect(40, 66, 12, 60, '#8A5A44', 4) +
    rect(148, 66, 12, 60, '#8A5A44', 4) +
    rect(40, 66, 120, 10, '#8A5A44') +
    rect(24, 54, 152, 16, '#A47864', 7) +
    path('M86 54 Q84 34 92 28 H108 Q116 34 114 54 Z', '#3D7BFF') +
    circ(94, 22, 7, '#FF6B9A') +
    circ(106, 20, 7, '#FFC93C'),
  foot: () =>
    path('M98 128 Q66 128 66 98 Q66 68 80 58 Q98 46 116 60 Q132 74 126 102 Q120 128 98 128 Z', SKIN) +
    circ(78, 42, 11, SKIN) +
    circ(98, 34, 9, SKIN) +
    circ(115, 36, 8, SKIN) +
    circ(129, 44, 7, SKIN) +
    circ(139, 56, 6, SKIN),
  ox: () =>
    path('M44 74 Q24 80 28 104', 'none', stroke('#8A5A44', 4)) +
    [56, 78, 118, 138].map((x) => rect(x, 92, 13, 34, '#B98A62', 5)).join('') +
    ell(98, 82, 58, 30, '#C9A27E') +
    ell(128, 58, 18, 12, '#C9A27E') +
    path('M148 42 Q138 18 124 24 M172 42 Q182 18 196 24', 'none', stroke('#F3F4F8', 6)) +
    circ(160, 60, 23, '#C9A27E') +
    ell(166, 74, 14, 10, '#E9DCD3') +
    eye(156, 54),
  bag: () =>
    path('M70 54 Q70 20 100 20 Q130 20 130 54', 'none', stroke('#1F9D63', 8)) +
    path('M46 50 H154 L144 122 Q143 128 136 128 H64 Q57 128 56 122 Z', '#2EC27E') +
    [
      [76, 76],
      [100, 90],
      [124, 76],
      [88, 108],
      [112, 108],
    ]
      .map(([x, y]) => circ(x, y, 5, '#A7E8B8'))
      .join(''),
  peacock: () => {
    let s = ell(100, 72, 88, 60, '#1F9D63') + ell(100, 76, 72, 48, '#2EC27E');
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (Math.PI * (i + 0.5)) / 9;
      const x = (100 + 64 * Math.cos(a)).toFixed(1);
      const y = (78 + 50 * Math.sin(a)).toFixed(1);
      s += circ(x, y, 9, '#FFC93C') + circ(x, y, 5, '#3D7BFF');
    }
    return (
      s +
      line(94, 118, 92, 132, '#F5A623', 4) +
      line(106, 118, 108, 132, '#F5A623', 4) +
      ell(100, 102, 16, 24, '#2F5BD3') +
      path('M96 84 Q94 64 104 58', 'none', stroke('#3D7BFF', 9)) +
      circ(106, 56, 9, '#3D7BFF') +
      path('M114 54 L122 57 L114 60 Z', '#F5A623') +
      path('M104 47 L100 36 M108 47 L108 35 M112 48 L116 37', 'none', stroke('#2F5BD3', 2)) +
      eye(108, 54, 2.5)
    );
  },
  drum: () =>
    path('M60 48 Q100 20 140 48', 'none', stroke('#8A5A44', 4)) +
    ell(44, 82, 14, 34, '#F3F4F8') +
    path('M44 48 H156 Q170 82 156 116 H44 Q30 82 44 48 Z', '#FF5A5F') +
    path('M52 50 L72 114 L92 50 L112 114 L132 50 L152 114', 'none', stroke('#FFD43B', 3)) +
    ell(156, 82, 14, 34, '#E3E6ED'),
  cap: () =>
    path('M48 98 Q50 44 104 42 Q152 44 154 98 Z', '#3D7BFF') +
    path('M78 50 Q86 74 84 98', 'none', stroke('#2F5BD3', 3)) +
    path('M140 92 H184 Q192 98 184 104 H140 Z', '#2F5BD3') +
    rect(48, 92, 106, 8, '#2F5BD3', 4) +
    circ(104, 42, 5, '#2F5BD3'),
  bottle: () =>
    rect(84, 14, 32, 14, '#3D7BFF', 5) +
    rect(88, 26, 24, 26, '#7DD3FC', 4) +
    path('M88 48 Q74 58 72 72 V120 Q72 128 80 128 H120 Q128 128 128 120 V72 Q126 58 112 48 Z', '#7DD3FC') +
    rect(72, 84, 56, 28, '#FFC93C') +
    rect(80, 62, 6, 56, '#fff', 3, 'opacity="0.5"'),
  crow: () =>
    path('M54 82 L18 70 L26 98 Z', '#2B2D42') +
    line(90, 108, 86, 128, '#5B6478', 3) +
    line(106, 108, 108, 128, '#5B6478', 3) +
    ell(96, 86, 48, 28, '#3B4252') +
    circ(142, 60, 21, '#3B4252') +
    path('M158 54 L188 62 L158 70 Z', '#5B6478') +
    path('M68 72 Q100 60 126 86 Q96 102 68 72 Z', '#2B2D42') +
    circ(148, 56, 5, '#fff') +
    circ(149, 56, 2.5, INK),
  plant: () =>
    line(100, 92, 100, 48, '#1F9D63', 5) +
    path('M100 66 Q70 62 62 40 Q90 38 100 66 Z', '#2EC27E') +
    path('M100 56 Q130 50 138 28 Q108 28 100 56 Z', '#4ADE80') +
    path('M100 48 Q92 30 100 18 Q108 30 100 48 Z', '#2EC27E') +
    path('M66 92 H134 L126 128 H74 Z', '#E07B4F') +
    rect(60, 86, 80, 12, '#C2603A', 5),
  fan: () =>
    ell(100, 126, 40, 7, '#94A3B8') +
    rect(94, 92, 12, 34, '#94A3B8', 4) +
    circ(100, 60, 46, '#EAF6FF') +
    [0, 120, 240].map((a) => rot(a, 100, 60, ell(100, 38, 13, 22, '#3D7BFF'))).join('') +
    circ(100, 60, 9, '#2F5BD3') +
    circ(100, 60, 46, 'none', 'stroke="#94A3B8" stroke-width="4"'),
  kite: () =>
    path('M100 112 Q88 124 102 130 Q116 136 106 140', 'none', stroke(INK, 2)) +
    path('M96 124 L90 118 L90 130 Z M108 132 L114 126 L114 138 Z', '#FFC93C') +
    path('M100 12 L152 62 L100 112 L48 62 Z', '#FF5A5F') +
    path('M100 12 L48 62 H100 Z', '#FFD43B') +
    path('M100 62 H152 L100 112 Z', '#FF9F43') +
    line(100, 12, 100, 112, '#D63A3F', 2.5) +
    line(48, 62, 152, 62, '#D63A3F', 2.5),
  grapes: () =>
    path('M100 34 Q104 18 116 14', 'none', stroke('#7A5444', 4)) +
    path('M108 26 Q128 12 142 22 Q128 36 108 26 Z', '#2EC27E') +
    [
      [72, 48],
      [94, 46],
      [116, 46],
      [138, 48],
      [82, 68],
      [104, 66],
      [126, 68],
      [92, 88],
      [114, 88],
      [102, 108],
    ]
      .map(([x, y]) => circ(x, y, 12, '#9B5DE5') + circ(x - 4, y - 4, 3, '#fff', 'opacity="0.4"'))
      .join(''),
  moon: () =>
    path('M118 16 A54 54 0 1 0 156 112 A44 44 0 1 1 118 16 Z', '#FFD43B') +
    `<polygon points="${starPoints(152, 34, 10, 4)}" fill="#FFE45C"/>` +
    `<polygon points="${starPoints(170, 70, 7, 3)}" fill="#FFE45C"/>` +
    `<polygon points="${starPoints(40, 30, 6, 2.5)}" fill="#FFE45C"/>`,
  camel: () =>
    path('M48 76 Q34 84 38 100', 'none', stroke('#D19D60', 4)) +
    [58, 76, 112, 130].map((x) => rect(x, 94, 9, 34, '#D19D60', 4)).join('') +
    ell(96, 80, 52, 24, '#E0B47A') +
    ell(80, 58, 18, 18, '#E0B47A') +
    ell(114, 58, 18, 18, '#E0B47A') +
    path('M138 78 Q156 62 150 36 L166 30 Q172 62 152 90 Z', '#E0B47A') +
    ell(166, 34, 18, 11, '#E0B47A') +
    eye(164, 30, 3),
  snake: () =>
    path('M28 112 Q60 132 80 104 Q100 76 120 100 Q140 124 160 96 Q170 80 160 66', 'none', stroke('#2EC27E', 18)) +
    path('M40 118 Q60 124 74 108 M96 88 Q108 84 118 96 M136 112 Q150 108 158 92', 'none', stroke('#A7E8B8', 3)) +
    path('M170 56 L184 52 M184 52 L190 46 M184 52 L190 56', 'none', stroke('#FF5A5F', 2.5)) +
    ell(160, 58, 16, 12, '#2EC27E') +
    eye(156, 54, 3) +
    eye(166, 54, 3),
  eye: () =>
    path('M30 70 Q100 8 170 70 Q100 132 30 70 Z', '#F3F4F8') +
    circ(100, 70, 30, '#3D7BFF') +
    circ(100, 70, 14, INK) +
    circ(110, 60, 6, '#fff') +
    path('M50 48 L42 36 M76 34 L72 20 M100 30 V16 M124 34 L128 20 M150 48 L158 36', 'none', stroke(INK, 3)),
  umbrella: () =>
    line(100, 34, 100, 118, INK, 5) +
    path('M100 118 Q100 132 88 132 Q78 132 78 122', 'none', stroke(INK, 5)) +
    path('M22 78 Q100 -8 178 78 Q162 68 146 78 Q130 68 114 78 Q100 70 86 78 Q70 68 54 78 Q38 68 22 78 Z', '#A66BFF') +
    path('M100 18 Q80 40 86 78 M100 18 Q120 40 114 78', 'none', stroke('#8B56F0', 3)) +
    circ(100, 18, 4, INK),

  // ---------- Grade 2: conjunct words ----------
  leaf: () =>
    line(36, 104, 16, 126, '#1F9D63', 5) +
    path('M32 108 Q30 30 164 28 Q166 108 32 108 Z', '#2EC27E') +
    line(40, 100, 150, 38, '#1F9D63', 4) +
    path('M70 82 L66 58 M96 68 L94 44 M122 54 L122 36 M76 80 L102 84 M104 66 L130 70', 'none', stroke('#1F9D63', 3)),
  spoon: () => rot(-38, 100, 70, ell(52, 70, 30, 20, '#C4C9D4') + ell(52, 70, 22, 13, '#E3E6ED') + rect(78, 64, 100, 12, '#C4C9D4', 6)),
  fly: () =>
    rot(-18, 86, 56, ell(86, 56, 18, 32, GLASS, 'opacity="0.9"')) +
    rot(18, 112, 54, ell(112, 54, 18, 32, '#E4F2FF', 'opacity="0.9"')) +
    path('M84 100 L76 120 M100 104 L100 124 M116 100 L124 120', 'none', stroke(INK, 3)) +
    ell(100, 88, 30, 20, '#3B4252') +
    path('M84 76 V100 M100 72 V106 M116 76 V100', 'none', stroke('#5B6478', 3)) +
    circ(132, 82, 14, '#3B4252') +
    circ(138, 74, 7, '#D63A3F'),
  school: () =>
    rect(28, 62, 144, 64, '#FFC233', 4) +
    path('M18 66 L100 24 L182 66 Z', '#FF5A5F') +
    circ(100, 50, 10, '#fff') +
    line(100, 50, 100, 44, INK, 2) +
    line(100, 50, 105, 52, INK, 2) +
    rect(86, 92, 28, 34, '#3D7BFF', 5) +
    win(40, 76, 26, 20) +
    win(134, 76, 26, 20) +
    win(40, 102, 26, 18) +
    win(134, 102, 26, 18),
  balloon: () =>
    path('M76 80 Q90 104 104 128 M118 74 Q110 100 104 128 M100 96 Q104 112 104 128', 'none', stroke('#94A3B8', 2)) +
    ell(74, 50, 24, 30, '#FF5A5F') +
    ell(124, 44, 24, 30, '#3D7BFF') +
    ell(100, 70, 22, 27, '#FFC93C') +
    path('M74 80 l-4 6 h8 Z M124 74 l-4 6 h8 Z M100 97 l-4 6 h8 Z', '#5B6478') +
    ell(66, 40, 5, 9, '#fff', 'opacity="0.4"') +
    ell(116, 34, 5, 9, '#fff', 'opacity="0.4"'),
  glasses: () =>
    path('M36 68 L14 54', 'none', stroke('#2B2D42', 6)) +
    path('M164 68 L186 54', 'none', stroke('#2B2D42', 6)) +
    circ(66, 76, 30, '#CFEFFF', 'stroke="#2B2D42" stroke-width="8"') +
    circ(134, 76, 30, '#CFEFFF', 'stroke="#2B2D42" stroke-width="8"') +
    path('M94 70 Q100 60 106 70', 'none', stroke('#2B2D42', 6)) +
    path('M52 66 L62 58 M120 66 L130 58', 'none', stroke('#fff', 4)),
  bucket: () =>
    path('M46 58 Q100 -2 154 58', 'none', stroke('#94A3B8', 5)) +
    path('M46 56 H154 L140 124 Q139 128 134 128 H66 Q61 128 60 124 Z', '#3D7BFF') +
    ell(100, 56, 54, 10, '#2F5BD3') +
    ell(100, 56, 46, 7, '#7DD3FC'),

  // ---------- Grade 3: stories and word pairs ----------
  lioness: () =>
    path('M44 80 Q20 82 22 110', 'none', stroke('#E8B23A', 4)) +
    circ(22, 112, 6, '#C98A1E') +
    [60, 80, 118, 136].map((x) => rect(x, 92, 12, 34, '#F4C04E', 5)).join('') +
    ell(98, 82, 52, 27, '#FFC93C') +
    circ(140, 40, 8, '#FFC93C') +
    circ(166, 40, 8, '#FFC93C') +
    circ(152, 58, 24, '#FFC93C') +
    ell(156, 68, 11, 8, '#FFE7A8') +
    eye(144, 52) +
    eye(160, 52) +
    path('M152 64 H160 L156 69 Z', INK),
  hen: () =>
    line(90, 104, 90, 128, '#F5A623', 5) +
    line(110, 104, 110, 128, '#F5A623', 5) +
    path('M58 84 Q40 64 48 52 Q62 64 70 72 Z', '#B9927F') +
    ell(98, 84, 42, 30, '#D9B79A') +
    path('M72 80 Q96 70 116 90 Q94 100 72 80 Z', '#C9A285') +
    circ(132, 52, 20, '#D9B79A') +
    path('M126 34 Q130 26 136 32 Q140 26 144 34 Z', '#FF5A5F') +
    path('M150 50 L164 54 L150 58 Z', '#FFC93C') +
    ell(146, 64, 3, 6, '#FF5A5F') +
    eye(138, 48),
  peahen: () =>
    path('M70 96 L34 104 L44 118 Z', '#8A6A55') +
    line(94, 116, 92, 132, '#F5A623', 4) +
    line(108, 116, 110, 132, '#F5A623', 4) +
    ell(98, 96, 34, 26, '#A47864') +
    path('M106 80 Q104 60 116 52', 'none', stroke('#4ADE80', 10)) +
    circ(118, 50, 11, '#4ADE80') +
    path('M126 48 L136 51 L126 54 Z', '#F5A623') +
    path('M114 40 L110 28 M118 39 L118 27 M122 40 L126 29', 'none', stroke('#2EC27E', 2)) +
    eye(120, 48, 2.5),
  river: () =>
    rect(0, 20, 200, 120, '#9BE07A', 16) +
    path('M0 70 Q50 50 100 72 T200 66 V112 Q150 128 100 110 T0 116 Z', '#6AAEFF') +
    path('M30 86 Q50 80 70 88 M120 92 Q140 86 160 94', 'none', stroke('#CFEFFF', 3)) +
    circ(40, 40, 12, '#2EC27E') +
    rect(37, 46, 6, 14, '#A47864', 2) +
    circ(160, 38, 14, '#2EC27E') +
    rect(157, 46, 6, 16, '#A47864', 2),
  pot: () =>
    circ(100, 82, 46, '#C2603A') +
    rect(78, 26, 44, 24, '#C2603A', 8) +
    ell(100, 28, 26, 7, '#A44E2F') +
    path('M58 76 Q70 68 82 76 T106 76 T130 76 T150 76', 'none', stroke('#FFC93C', 4)) +
    ell(82, 66, 8, 16, '#fff', 'opacity="0.2"'),
  stones: () =>
    ell(66, 110, 26, 17, '#A0A7B4') +
    ell(140, 110, 22, 14, '#C4C9D4') +
    ell(106, 114, 30, 17, '#8492A6') +
    ell(90, 92, 22, 14, '#B8C2D1') +
    ell(126, 92, 18, 12, '#94A3B8') +
    ell(108, 76, 14, 10, '#A0A7B4'),

  // ---------- vehicles of the reading games ----------
  postvan: () =>
    rect(12, 40, 128, 62, '#FF5A5F', 12) +
    path('M136 56 H164 Q182 58 186 78 V102 H136 Z', '#FF5A5F') +
    win(146, 62, 30, 20) +
    rect(36, 54, 64, 36, '#FFF1A6', 6) +
    path('M38 56 L68 76 L98 56', 'none', stroke('#F2B705', 3)) +
    rect(12, 96, 174, 8, '#475569', 3) +
    wheel(44, 108, 15) +
    wheel(156, 108, 15),
  metro: () =>
    rect(8, 34, 184, 66, '#F3F4F8', 18) +
    rect(8, 74, 184, 10, '#6C63FF') +
    [22, 62, 102].map((x) => win(x, 46, 30, 22)).join('') +
    rect(142, 44, 18, 40, '#CFEFFF', 4) +
    path('M168 46 H184 Q190 46 190 54 V70 H168 Z', '#2B2D42') +
    rect(8, 96, 184, 6, '#94A3B8', 3) +
    wheel(40, 108, 10) +
    wheel(70, 108, 10) +
    wheel(130, 108, 10) +
    wheel(160, 108, 10),
  icecreamvan: () =>
    path('M150 14 L162 40 L138 40 Z', '#E9B872') +
    circ(150, 12, 12, '#FF8FB1') +
    rect(12, 40, 140, 62, '#7DD3FC', 12) +
    path('M148 56 H166 Q184 58 186 78 V102 H148 Z', '#38BDF8') +
    win(154, 62, 24, 18) +
    rect(30, 52, 82, 30, '#fff', 8) +
    [44, 70, 96].map((x, i) => circ(x, 66, 8, ['#FF8FB1', '#FFE45C', '#A7E8B8'][i])).join('') +
    rect(12, 96, 174, 8, '#475569', 3) +
    wheel(44, 108, 15) +
    wheel(156, 108, 15),
  bookbus: () =>
    rect(12, 28, 176, 78, '#A66BFF', 14) +
    [22, 54, 86, 118].map((x) => win(x, 40, 26, 26)).join('') +
    rect(152, 40, 26, 54, '#CFEFFF', 6) +
    rect(12, 76, 140, 8, '#FFC93C') +
    rect(30, 84, 28, 14, '#FF5A5F', 2) +
    rect(62, 84, 22, 14, '#3D7BFF', 2) +
    rect(88, 84, 30, 14, '#2EC27E', 2) +
    wheel(50, 108, 16) +
    wheel(150, 108, 16),
};

// ---------- new places on the town map (200x160) ----------
const ground = (c = '#9BE07A') => rect(0, 128, 200, 32, c, 14, '');
export const PLACE_ART = {
  'place-matra': () =>
    ground('#D9DEE7') +
    rect(24, 44, 152, 86, '#8B85FF', 6) +
    path('M14 50 L100 14 L186 50 Z', '#6C63FF') +
    rect(48, 70, 104, 60, '#EEEDFF', 6) +
    `<text x="100" y="114" text-anchor="middle" font-size="40" font-weight="800" font-family="'Baloo 2', sans-serif" fill="#6C63FF">का</text>` +
    circ(162, 34, 10, '#FFC93C'),
  'place-postoffice': () =>
    ground() +
    rect(20, 50, 110, 78, '#FFD39A', 4) +
    path('M12 54 L75 20 L138 54 Z', '#FF5A5F') +
    rect(60, 92, 30, 36, '#A47864', 4) +
    win(30, 66, 22, 18) +
    win(98, 66, 22, 18) +
    rect(150, 68, 34, 60, '#FF5A5F', 14) +
    rect(156, 84, 22, 5, INK, 2) +
    rect(163, 122, 8, 8, '#D63A3F'),
  'place-metro': () =>
    ground() +
    rect(26, 88, 10, 40, '#B8C2D1', 2) +
    rect(164, 88, 10, 40, '#B8C2D1', 2) +
    rect(6, 80, 188, 12, '#94A3B8', 4) +
    `<g transform="translate(14 24) scale(0.86)">${WORD_ART.metro().replace(/wheel/g, '')}</g>`,
  'place-icecream': () =>
    ground() +
    `<g transform="translate(6 28) scale(0.94)">${WORD_ART.icecreamvan()}</g>`,
  'place-library': () =>
    ground() +
    rect(26, 56, 148, 72, '#FFF1A6', 4) +
    path('M16 60 L100 22 L184 60 Z', '#A66BFF') +
    [40, 70, 116, 146].map((x) => rect(x, 64, 14, 64, '#F3D27A', 2)).join('') +
    path('M100 116 Q86 104 70 108 V86 Q86 82 100 94 Q114 82 130 86 V108 Q114 104 100 116 Z', '#3D7BFF') +
    line(100, 94, 100, 116, '#2F5BD3', 2),
  'place-parking': () =>
    rect(0, 40, 200, 120, '#C4C9D4', 16) +
    [50, 100, 150].map((x) => line(x, 50, x, 150, '#fff', 4)).join('') +
    circ(30, 26, 22, '#3D7BFF') +
    `<text x="30" y="38" text-anchor="middle" font-size="32" font-weight="800" font-family="'Baloo 2', sans-serif" fill="#fff">P</text>`,
};

// Small parked cars for the parking place (drawn by art.js's car()).
export function parkingCars(car) {
  return ['#FF5A5F', '#FFC233', '#2EC27E'].map((c, i) => `<g transform="translate(${8 + i * 50} 76) scale(0.4)">${car(c)}</g>`).join('');
}
