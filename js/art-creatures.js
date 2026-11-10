// Collectibles for the new worlds: farm and jungle animals, dinosaurs, space, ocean and snow.
// Same flat style and 200x140 grid as the other art modules.
import { INK, rect, circ, ell, path, line, eye, starPoints } from './art-kit.js';

const stroke = (color, w) => `stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;

// A four-legged animal facing right; extras are drawn on top of the body, face on top of the head.
function quad({ body, leg = body, legs = [58, 78, 120, 140], legY = 92, legH = 34, legW = 12, rx = 56, ry = 28, cy = 82, hx = 154, hy = 58, hr = 24, behind = '', extras = '', head = '', face = '' }) {
  return (
    behind +
    legs.map((x) => rect(x, legY, legW, legH, leg, 5)).join('') +
    ell(100, cy, rx, ry, body) +
    extras +
    (head || circ(hx, hy, hr, body)) +
    face
  );
}

// Twin flat ellipse eyes on a creature facing the viewer.
const eyes2 = (x1, x2, y, r = 5) => eye(x1, y, r) + eye(x2, y, r);
const smile = (x, y, w = 10) => path(`M${x - w / 2} ${y} Q${x} ${y + w * 0.6} ${x + w / 2} ${y}`, 'none', stroke(INK, 2.5));

export const FLOATING_CREATURES = new Set(['earth', 'saturn', 'mars', 'comet', 'satellite', 'snowflake', 'pterodactyl', 'owl', 'jellyfish', 'seahorse', 'whale', 'dolphin', 'shark', 'octopus']);

export const CREATURES = {
  // ---------- farm ----------
  chick: () =>
    line(92, 110, 90, 126, '#F28C28', 4) +
    line(108, 110, 110, 126, '#F28C28', 4) +
    circ(100, 84, 32, '#FFD43B') +
    ell(86, 88, 12, 16, '#F5C518') +
    circ(126, 58, 21, '#FFD43B') +
    path('M144 56 L160 60 L144 66 Z', '#FF9F43') +
    eye(130, 52, 4) +
    path('M120 38 Q124 28 130 36', 'none', stroke('#F5C518', 4)),
  buffalo: () =>
    quad({
      body: '#4A4E5A',
      leg: '#3B3F4A',
      extras: '',
      head: circ(154, 60, 24, '#4A4E5A') + ell(162, 74, 14, 10, '#6B7080'),
      face: path('M136 44 Q120 30 112 46 M172 44 Q190 30 196 46', 'none', stroke('#D9DEE7', 6)) + eye(150, 54, 4) + eye(166, 54, 4) + circ(158, 76, 2, INK) + circ(166, 76, 2, INK),
      behind: path('M44 74 Q26 84 30 106', 'none', stroke('#3B3F4A', 4)),
    }),
  donkey: () =>
    quad({
      body: '#A0A7B4',
      leg: '#8E95A3',
      behind: path('M44 74 Q28 82 30 106', 'none', stroke('#5B6478', 5)),
      head: ell(158, 62, 18, 26, '#A0A7B4') + ell(164, 80, 13, 10, '#D9DEE7'),
      face: ell(146, 30, 6, 18, '#A0A7B4') + ell(166, 28, 6, 18, '#A0A7B4') + path('M136 46 Q128 64 124 76', 'none', stroke('#5B6478', 6)) + eye(152, 56, 4) + eye(168, 56, 4),
    }),

  // ---------- jungle ----------
  tiger: () =>
    quad({
      body: '#FF9F43',
      behind: path('M44 76 Q20 70 22 50', 'none', stroke('#FF9F43', 8)) + path('M22 50 l0 6 M24 60 l4 2', 'none', stroke(INK, 3)),
      extras: path('M70 56 l4 16 M88 54 l2 18 M106 54 l0 18 M124 56 l-2 16 M80 104 l2 -12 M110 104 l0 -12', 'none', stroke(INK, 5)),
      head: circ(140, 46, 8, '#FF9F43') + circ(170, 46, 8, '#FF9F43') + circ(155, 62, 25, '#FF9F43') + ell(156, 74, 14, 10, '#FFF1DE'),
      face: path('M146 44 l2 6 M164 44 l-2 6 M136 62 l6 0 M168 62 l6 0', 'none', stroke(INK, 3)) + eye(147, 58, 4) + eye(165, 58, 4) + path('M152 70 H160 L156 75 Z', INK),
    }),
  deer: () =>
    quad({
      body: '#C9905A',
      legW: 8,
      legH: 40,
      legY: 90,
      rx: 50,
      ry: 24,
      extras: [72, 92, 112, 84, 104].map((x, i) => circ(x, 74 + (i % 2) * 10, 3.5, '#FFF1DE')).join(''),
      head: path('M136 70 Q140 52 150 40', 'none', stroke('#C9905A', 14)) + ell(156, 40, 13, 16, '#C9905A') + ell(162, 50, 9, 7, '#E9C9A6'),
      face: path('M150 26 L144 10 M144 14 L136 8 M162 26 L168 10 M168 14 L176 8', 'none', stroke('#8A5A44', 4)) + ell(140, 32, 8, 4, '#C9905A') + eye(158, 38, 4),
    }),
  giraffe: () =>
    [70, 86, 116, 132].map((x) => rect(x, 92, 9, 36, '#F5B82E', 4)).join('') +
    ell(100, 86, 40, 20, '#FFC93C') +
    path('M120 80 L150 28 L164 34 L138 84 Z', '#FFC93C') +
    ell(160, 26, 16, 11, '#FFC93C') +
    [
      [86, 82],
      [104, 92],
      [110, 76],
      [140, 54],
      [150, 40],
      [92, 96],
    ]
      .map(([x, y]) => ell(x, y, 6, 4.5, '#C9832E'))
      .join('') +
    line(154, 16, 152, 8, '#8A5A44', 3) +
    line(162, 16, 164, 8, '#8A5A44', 3) +
    eye(162, 24, 3.5) +
    path('M60 84 Q50 96 54 110', 'none', stroke('#C9832E', 4)),
  zebra: () =>
    quad({
      body: '#F3F4F8',
      leg: '#E3E6ED',
      behind: path('M44 74 Q28 82 30 106', 'none', stroke(INK, 4)),
      extras: path('M66 58 l6 22 M84 54 l2 26 M102 54 l0 26 M120 56 l-2 24 M64 104 l2 -10 M126 104 l0 -10', 'none', stroke(INK, 6)),
      head: ell(158, 60, 18, 26, '#F3F4F8') + ell(164, 80, 13, 10, '#3F3F46'),
      face: path('M140 36 Q134 52 128 68', 'none', stroke(INK, 8)) + path('M146 52 l10 2 M144 62 l12 2', 'none', stroke(INK, 4)) + ell(152, 36, 5, 10, '#F3F4F8') + eye(152, 54, 4) + eye(168, 54, 4),
    }),
  fox: () =>
    path('M50 84 Q14 82 18 56 Q38 64 56 76 Z', '#FF7A3D') +
    path('M18 56 Q20 64 28 66 Q22 58 18 56 Z', '#fff') +
    quad({
      body: '#FF7A3D',
      legW: 9,
      legs: [64, 82, 116, 132],
      rx: 46,
      ry: 22,
      extras: ell(124, 88, 14, 12, '#FFF1DE'),
      head: path('M140 40 L136 20 L150 34 Z M164 34 L178 20 L174 40 Z', '#FF7A3D') + circ(156, 54, 22, '#FF7A3D') + path('M140 58 Q156 82 172 58 Q166 70 156 72 Q146 70 140 58 Z', '#FFF1DE'),
      face: eye(148, 50, 3.5) + eye(164, 50, 3.5) + circ(156, 68, 4, INK),
    }),
  tortoise: () =>
    ell(56, 108, 12, 9, '#A7D98A') +
    ell(140, 110, 12, 9, '#A7D98A') +
    ell(78, 116, 11, 8, '#A7D98A') +
    ell(124, 116, 11, 8, '#A7D98A') +
    circ(166, 92, 15, '#A7D98A') +
    eye(170, 88, 3.5) +
    smile(168, 98, 8) +
    path('M40 104 Q42 50 100 46 Q158 50 160 104 Z', '#5CB85C') +
    path('M76 60 L100 52 L124 60 L124 84 L100 92 L76 84 Z', '#3E9E52') +
    path('M52 92 L76 84 M148 92 L124 84 M100 92 V104 M100 52 V46', 'none', stroke('#3E9E52', 4)) +
    rect(40, 100, 120, 8, '#4FA864', 4),
  squirrel: () =>
    path('M76 112 Q30 116 34 70 Q38 30 70 40 Q50 56 60 80 Q66 96 86 104 Z', '#C9832E') +
    ell(110, 96, 26, 24, '#E09A45') +
    ell(116, 100, 12, 14, '#FFE3C4') +
    circ(126, 62, 18, '#E09A45') +
    path('M116 48 L114 36 L124 46 Z M132 46 L140 36 L138 48 Z', '#C9832E') +
    eye(130, 58, 3.5) +
    circ(142, 66, 2.5, INK) +
    ell(128, 84, 8, 7, '#8A5A44') +
    rect(124, 76, 8, 5, '#6B4A3A', 2) +
    ell(98, 120, 10, 6, '#C9832E') +
    ell(122, 120, 10, 6, '#C9832E'),
  owl: () =>
    line(40, 124, 160, 124, '#8A5A44', 8) +
    ell(100, 82, 38, 42, '#A47864') +
    ell(100, 92, 24, 28, '#E9DCD3') +
    path('M68 44 L72 26 L84 42 Z M132 44 L128 26 L116 42 Z', '#8A5A44') +
    circ(84, 64, 15, '#FFF1A6') +
    circ(116, 64, 15, '#FFF1A6') +
    eye(84, 64, 8) +
    eye(116, 64, 8) +
    path('M96 74 L100 84 L104 74 Z', '#FF9F43') +
    ell(64, 90, 10, 24, '#8A5A44') +
    ell(136, 90, 10, 24, '#8A5A44') +
    path('M88 124 v-6 M96 124 v-6 M104 124 v-6 M112 124 v-6', 'none', stroke('#F5A623', 3)),

  // ---------- dinosaurs ----------
  trex: () =>
    path('M60 92 Q20 96 6 70 Q30 84 62 78 Z', '#5CC46A') +
    rect(70, 96, 16, 30, '#4FB862', 7) +
    rect(104, 96, 16, 30, '#4FB862', 7) +
    ell(94, 84, 36, 28, '#6BD27A') +
    ell(98, 92, 20, 16, '#C9F3B5') +
    path('M112 62 Q118 26 150 24 Q184 24 184 46 Q182 62 158 64 L150 72 Q132 76 120 76 Z', '#6BD27A') +
    path('M156 56 h22 M160 56 l2 4 l2 -4 M168 56 l2 4 l2 -4', 'none', stroke('#fff', 2.5)) +
    path('M126 88 q10 4 12 12 M132 82 q10 2 14 8', 'none', stroke('#4FB862', 5)) +
    eye(152, 38, 5) +
    path('M100 58 l6 -8 l6 8 M86 60 l6 -8 l6 8', '#2E9E52'),
  triceratops: () =>
    quad({
      body: '#E8A15C',
      leg: '#D98C46',
      legW: 16,
      rx: 54,
      ry: 30,
      behind: path('M48 82 Q20 86 12 74 Q30 78 50 74 Z', '#E8A15C'),
      head: path('M128 40 Q150 22 166 40 L176 74 Q160 88 140 80 Z', '#F5C08A') + ell(156, 70, 24, 18, '#E8A15C'),
      face: path('M168 64 L194 56 L172 72 Z M150 52 L156 30 L160 54 Z M164 54 L174 34 L174 58 Z', '#FFF1DE') + eye(156, 64, 4),
    }),
  stegosaurus: () =>
    [62, 80, 98, 116, 134].map((x, i) => path(`M${x - 10} ${62 - (i === 2 ? 4 : 0)} L${x} ${34 - (i % 2) * 6} L${x + 10} ${62} Z`, '#FF8FB1')).join('') +
    path('M50 88 Q24 90 10 78 Q28 82 52 78 Z', '#9B7BF0') +
    path('M14 76 l-8 -8 M18 80 l-8 2', 'none', stroke('#FFC2D6', 4)) +
    quad({ body: '#9B7BF0', leg: '#8566E0', legW: 15, rx: 54, ry: 26, hx: 158, hy: 82, hr: 14, face: eye(160, 78, 3.5) }),
  brachiosaurus: () =>
    path('M54 100 Q28 102 16 92 Q32 94 56 90 Z', '#6AAEFF') +
    [64, 84, 112, 130].map((x) => rect(x, 96, 14, 32, '#5596E8', 6)).join('') +
    ell(98, 94, 42, 24, '#6AAEFF') +
    path('M122 86 Q140 40 150 18 L166 22 Q154 50 140 92 Z', '#6AAEFF') +
    ell(164, 16, 16, 10, '#6AAEFF') +
    eye(166, 12, 3.5) +
    smile(172, 18, 6),
  pterodactyl: () =>
    path('M100 70 L20 40 Q40 70 60 76 Q76 82 100 82 Z', '#FF7A59') +
    path('M100 70 L180 40 Q160 70 140 76 Q124 82 100 82 Z', '#FF7A59') +
    path('M100 72 L36 46 M100 72 L164 46', 'none', stroke('#E05C3D', 2)) +
    ell(100, 78, 12, 18, '#FF9A7A') +
    path('M96 62 Q100 44 120 50 L136 54 L112 60 Z', '#FF9A7A') +
    path('M100 50 Q86 36 80 46', 'none', stroke('#E05C3D', 5)) +
    eye(106, 52, 3) +
    line(94, 94, 92, 104, '#E05C3D', 3) +
    line(106, 94, 108, 104, '#E05C3D', 3),
  ankylosaurus: () =>
    path('M44 92 Q22 96 16 86', 'none', stroke('#B98A62', 8)) +
    circ(14, 86, 9, '#8A5A44') +
    quad({ body: '#C9A27E', leg: '#B98A62', legW: 16, legH: 26, legY: 100, rx: 56, ry: 26, cy: 90, hx: 160, hy: 92, hr: 16, face: eye(164, 88, 3.5) + smile(166, 98, 7) }) +
    [56, 72, 88, 104, 120, 136].map((x) => path(`M${x - 6} 66 L${x} 54 L${x + 6} 66 Z`, '#8A5A44')).join('') +
    path('M60 80 h80 M58 92 h84', 'none', stroke('#B98A62', 3)),
  dinoegg: () =>
    path('M40 116 Q100 140 160 116 Q150 128 100 130 Q50 128 40 116 Z', '#C9A27E') +
    path('M44 112 L56 104 L68 114 L80 104 L94 116 L108 104 L122 114 L136 104 L150 114 L158 112', 'none', stroke('#A47864', 4)) +
    ell(100, 76, 32, 42, '#FFF1DE') +
    [
      [88, 60],
      [112, 72],
      [94, 92],
      [110, 48],
    ]
      .map(([x, y]) => ell(x, y, 5, 4, '#9BE07A'))
      .join('') +
    path('M78 58 L88 66 L96 56 L104 66 L112 58', 'none', stroke('#A47864', 2.5)),
  volcano: () =>
    path('M20 128 L80 40 L120 40 L180 128 Z', '#A9786A') +
    path('M80 40 Q100 30 120 40 L112 54 Q104 46 100 60 Q94 48 88 54 Z', '#FF7A3D') +
    path('M100 60 Q96 80 104 96 Q92 86 92 70 Z', '#FF9F43') +
    circ(92, 22, 10, '#D9D2CC') +
    circ(110, 12, 13, '#D9D2CC') +
    circ(128, 18, 8, '#D9D2CC'),

  // ---------- space ----------
  astronaut: () =>
    rect(70, 70, 60, 50, '#F3F4F8', 18) +
    rect(62, 64, 76, 18, '#E3E6ED', 9) +
    rect(84, 86, 32, 14, '#6C63FF', 4) +
    circ(92, 93, 3, '#FF5A5F') +
    circ(108, 93, 3, '#2EC27E') +
    rect(74, 116, 20, 12, '#C4C9D4', 4) +
    rect(106, 116, 20, 12, '#C4C9D4', 4) +
    path('M70 84 Q50 86 48 70', 'none', stroke('#F3F4F8', 12)) +
    path('M130 84 Q150 86 152 70', 'none', stroke('#F3F4F8', 12)) +
    circ(100, 42, 30, '#F3F4F8') +
    ell(100, 44, 22, 18, '#3D7BFF') +
    ell(92, 38, 7, 5, '#CFEFFF') +
    line(100, 12, 100, 4, '#C4C9D4', 3) +
    circ(100, 4, 4, '#FF5A5F'),
  earth: () =>
    circ(100, 70, 54, '#3D7BFF') +
    path('M64 44 Q80 30 96 40 Q104 52 90 60 Q76 58 70 70 Q58 66 64 44 Z M112 64 Q130 54 142 68 Q148 86 132 96 Q120 92 122 80 Q110 76 112 64 Z M80 96 Q96 92 100 108 Q88 116 78 108 Z', '#2EC27E') +
    ell(80, 50, 14, 8, '#fff', 'opacity="0.25"'),
  saturn: () =>
    ell(100, 74, 86, 20, 'none', 'stroke="#FFD39A" stroke-width="8" transform="rotate(-14 100 74)"') +
    circ(100, 70, 40, '#F5B97A') +
    path('M64 60 Q100 52 136 60 M62 76 Q100 70 138 76', 'none', stroke('#E09A5A', 5)) +
    path('M16 92 Q100 66 184 52', 'none', stroke('#FFD39A', 8)),
  mars: () =>
    circ(100, 70, 50, '#E2583E') +
    circ(80, 54, 9, '#C9452F') +
    circ(118, 86, 12, '#C9452F') +
    circ(112, 50, 5, '#C9452F') +
    circ(84, 92, 6, '#C9452F') +
    ell(82, 44, 14, 6, '#fff', 'opacity="0.2"'),
  comet: () =>
    path('M30 112 L130 56 L140 74 Z', '#CFEFFF', 'opacity="0.7"') +
    path('M50 118 L132 62 L134 70 Z', '#fff', 'opacity="0.8"') +
    circ(140, 60, 20, '#FFE45C') +
    circ(140, 60, 11, '#FFF8C4') +
    `<polygon points="${starPoints(60, 30, 7, 3)}" fill="#FFE45C"/>`,
  satellite: () =>
    rect(78, 52, 44, 36, '#C4C9D4', 6) +
    rect(86, 60, 28, 20, '#FFC93C', 4) +
    rect(14, 58, 56, 24, '#3D7BFF', 3) +
    rect(130, 58, 56, 24, '#3D7BFF', 3) +
    path('M28 58 V82 M42 58 V82 M56 58 V82 M144 58 V82 M158 58 V82 M172 58 V82 M14 70 H70 M130 70 H186', 'none', stroke('#2F5BD3', 2)) +
    line(70, 70, 78, 70, '#94A3B8', 4) +
    line(122, 70, 130, 70, '#94A3B8', 4) +
    line(100, 52, 100, 30, '#94A3B8', 3) +
    circ(100, 28, 6, '#FF5A5F'),
  alien: () =>
    ell(100, 118, 40, 8, '#A7F3D0') +
    rect(80, 76, 40, 40, '#7ED957', 18) +
    circ(100, 56, 32, '#7ED957') +
    line(84, 28, 76, 10, '#5CC46A', 4) +
    line(116, 28, 124, 10, '#5CC46A', 4) +
    circ(76, 10, 6, '#FF8FB1') +
    circ(124, 10, 6, '#FF8FB1') +
    ell(88, 54, 9, 12, '#fff') +
    ell(112, 54, 9, 12, '#fff') +
    circ(90, 56, 5, INK) +
    circ(110, 56, 5, INK) +
    smile(100, 72, 14) +
    path('M80 92 Q66 96 64 84 M120 92 Q134 96 136 84', 'none', stroke('#7ED957', 8)),
  telescope: () =>
    path('M100 80 L76 128 M100 80 L124 128 M100 80 V128', 'none', stroke('#8A5A44', 5)) +
    `<g transform="rotate(-28 100 70)">${rect(40, 58, 120, 24, '#6C63FF', 10)}${rect(144, 54, 24, 32, '#5148E0', 6)}${rect(34, 62, 14, 16, '#FFC93C', 4)}</g>` +
    circ(100, 78, 7, '#2B2D42'),

  // ---------- ocean ----------
  octopus: () =>
    [56, 76, 96, 116, 136].map((x, i) => path(`M${x} 80 Q${x + (i % 2 ? 10 : -10)} 104 ${x} 116 Q${x - 4} 126 ${x + 8} 126`, 'none', stroke('#B47BF7', 11))).join('') +
    ell(98, 62, 44, 38, '#B47BF7') +
    ell(82, 46, 12, 8, '#D4B0FF') +
    eyes2(84, 112, 64, 6) +
    smile(98, 78, 12),
  crab: () =>
    path('M60 60 L40 30 M140 60 L160 30', 'none', stroke('#E2583E', 6)) +
    path('M28 30 Q40 14 52 28 Q42 30 40 40 Z M172 30 Q160 14 148 28 Q158 30 160 40 Z', '#FF5A5F') +
    path('M60 96 L36 110 M64 104 L44 122 M140 96 L164 110 M136 104 L156 122', 'none', stroke('#E2583E', 5)) +
    ell(100, 86, 46, 30, '#FF5A5F') +
    line(88, 58, 86, 44, '#E2583E', 4) +
    line(112, 58, 114, 44, '#E2583E', 4) +
    eye(86, 42, 6) +
    eye(114, 42, 6) +
    smile(100, 92, 16),
  turtle: () =>
    path('M60 92 Q30 100 26 118 Q48 112 66 100 Z M140 92 Q170 100 174 118 Q152 112 134 100 Z', '#7ED3A0') +
    path('M64 66 Q40 56 30 64 Q46 72 66 74 Z M136 66 Q160 56 170 64 Q154 72 134 74 Z', '#7ED3A0') +
    ell(100, 80, 46, 32, '#2EA36B') +
    path('M80 66 L100 58 L120 66 L120 88 L100 96 L80 88 Z', '#1F8A57') +
    circ(100, 44, 15, '#7ED3A0') +
    eye(94, 40, 3.5) +
    eye(106, 40, 3.5),
  whale: () =>
    path('M24 68 L6 48 Q20 56 30 52 Q22 64 34 76 Z', '#3D7BFF') +
    path('M30 70 Q40 30 100 32 Q170 34 176 82 Q172 112 110 112 Q48 112 30 70 Z', '#3D7BFF') +
    path('M60 96 Q110 116 168 92 Q160 110 110 112 Q70 112 60 96 Z', '#BFD8FF') +
    eye(140, 66, 5) +
    smile(150, 82, 12) +
    path('M118 32 Q112 14 104 10 M118 32 Q118 12 126 6 M118 32 Q126 16 136 14', 'none', stroke('#7DD3FC', 4)),
  dolphin: () =>
    path('M30 96 Q50 40 120 40 Q170 42 186 64 L168 66 Q160 76 140 78 Q100 82 70 98 L80 118 L58 104 L40 116 Z', '#7FA7D9') +
    path('M110 40 Q118 22 132 20 Q126 32 128 42 Z', '#6B93C9') +
    path('M84 80 Q120 74 150 74 Q130 84 92 90 Z', '#E4EEFA') +
    eye(150, 56, 4) +
    path('M168 64 Q174 66 180 64', 'none', stroke(INK, 2)),
  starfish: () => `<polygon points="${starPoints(100, 72, 58, 26)}" fill="#FF9F43"/>` + [0, 1, 2, 3, 4].map((k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
    return circ((100 + 30 * Math.cos(a)).toFixed(1), (72 + 30 * Math.sin(a)).toFixed(1), 4, '#FFD39A');
  }).join('') + eyes2(90, 110, 68, 5) + smile(100, 82, 10),
  jellyfish: () =>
    [70, 86, 102, 118, 134].map((x, i) => path(`M${x} 76 Q${x + (i % 2 ? 8 : -8)} 96 ${x} 112 Q${x - 6} 124 ${x + 4} 132`, 'none', stroke('#D4B0FF', 5))).join('') +
    path('M52 78 Q52 22 102 22 Q152 22 152 78 Q140 72 128 80 Q116 72 102 80 Q88 72 76 80 Q64 72 52 78 Z', '#B47BF7', 'opacity="0.9"') +
    ell(84, 44, 12, 8, '#E4D0FF') +
    eyes2(88, 116, 56, 5) +
    smile(102, 66, 10),
  seahorse: () =>
    path('M110 24 Q140 24 136 46 Q132 62 116 70 Q140 86 126 108 Q114 128 92 122 Q104 112 104 98 Q86 92 92 70 Q80 58 86 40 Q92 24 110 24 Z', '#FFC93C') +
    path('M136 40 L160 44 L136 50 Z', '#FFC93C') +
    path('M92 52 l-12 -6 M90 66 l-12 0 M94 80 l-10 6', 'none', stroke('#F5A623', 4)) +
    path('M96 26 L90 12 L104 22 Z', '#F5A623') +
    eye(118, 38, 4) +
    path('M92 122 Q78 126 80 112 Q90 116 94 108', 'none', stroke('#FFC93C', 6)),
  shark: () =>
    path('M24 70 L6 44 L14 70 L4 96 Z', '#8492A6') +
    path('M20 70 Q50 34 120 36 Q172 40 186 68 Q170 96 120 100 Q50 102 20 70 Z', '#8492A6') +
    path('M96 38 Q104 10 116 6 Q112 26 116 38 Z', '#6B7A90') +
    path('M60 84 Q120 106 180 74 Q166 96 120 100 Q72 100 60 84 Z', '#E3E6ED') +
    path('M100 98 L88 120 L112 100 Z', '#6B7A90') +
    eye(146, 58, 4.5) +
    path('M154 78 Q166 84 176 76', 'none', stroke(INK, 2.5)) +
    path('M158 79 l2 4 l2 -4 M166 79 l2 4 l2 -4', '#fff'),
  shell: () =>
    path('M100 116 L40 70 Q40 22 100 20 Q160 22 160 70 Z', '#FF8FB1') +
    path('M100 116 L58 32 M100 116 L80 24 M100 116 V20 M100 116 L120 24 M100 116 L142 32', 'none', stroke('#FF6B9A', 4)) +
    path('M84 116 H116 L108 128 H92 Z', '#FF6B9A'),
  lighthouse: () =>
    path('M60 128 Q100 112 140 128 Z', '#A0A7B4') +
    path('M78 126 L86 52 H114 L122 126 Z', '#F3F4F8') +
    path('M80 108 L82 92 H118 L120 108 Z M84 76 L85 66 H115 L116 76 Z', '#FF5A5F') +
    rect(82, 32, 36, 22, '#FFE45C', 4) +
    path('M78 32 L100 14 L122 32 Z', '#FF5A5F') +
    path('M118 38 L176 26 V52 Z M82 38 L24 26 V52 Z', '#FFF3A6', 'opacity="0.6"') +
    rect(94, 108, 12, 18, '#5B6478', 3),

  // ---------- snow ----------
  penguin: () =>
    path('M84 120 L76 128 H94 Z M116 120 L106 128 H124 Z', '#FF9F43') +
    ell(70, 82, 9, 24, '#2B2D42') +
    ell(130, 82, 9, 24, '#2B2D42') +
    ell(100, 78, 32, 46, '#2B2D42') +
    ell(100, 88, 22, 34, '#fff') +
    ell(100, 52, 22, 17, '#fff') +
    eyes2(92, 108, 50, 5) +
    path('M94 58 L100 66 L106 58 Z', '#FF9F43'),
  seal: () =>
    path('M40 104 L18 92 L22 116 Z', '#8492A6') +
    path('M30 106 Q60 64 120 70 Q150 72 156 96 Q150 122 100 122 Q50 122 30 106 Z', '#A0A7B4') +
    circ(150, 66, 24, '#A0A7B4') +
    ell(160, 76, 12, 9, '#C4C9D4') +
    eye(146, 60, 4) +
    eye(162, 60, 4) +
    circ(162, 72, 3, INK) +
    path('M168 76 l14 -2 M168 80 l14 2 M152 76 l-14 -2', 'none', stroke(INK, 1.5)) +
    path('M110 112 Q120 128 136 120 Q126 118 122 108 Z', '#8492A6'),
  polarbear: () =>
    quad({
      body: '#F3F4F8',
      leg: '#E3E6ED',
      legW: 16,
      head: circ(140, 46, 8, '#F3F4F8') + circ(168, 46, 8, '#F3F4F8') + circ(154, 62, 24, '#F3F4F8') + ell(160, 74, 12, 9, '#E3E6ED'),
      face: eye(148, 58, 3.5) + eye(164, 58, 3.5) + ell(162, 70, 5, 3.5, INK),
    }),
  igloo: () =>
    path('M24 120 Q24 36 100 36 Q176 36 176 120 Z', '#F3F8FF') +
    path('M30 96 H170 M38 72 H162 M54 52 H146 M70 96 V120 M130 96 V120 M60 72 V96 M100 72 V96 M140 72 V96 M84 52 V72 M116 52 V72', 'none', stroke('#C9DEF2', 3)) +
    path('M76 120 Q76 84 100 84 Q124 84 124 120 Z', '#7FB2D6') +
    ell(100, 122, 80, 6, '#DCEEFF'),
  snowman: () =>
    circ(100, 100, 30, '#F3F8FF') +
    circ(100, 56, 22, '#F3F8FF') +
    rect(80, 26, 40, 8, '#2B2D42', 3) +
    rect(86, 6, 28, 24, '#2B2D42', 4) +
    rect(86, 22, 28, 5, '#FF5A5F') +
    path('M100 58 L124 62 L100 64 Z', '#FF9F43') +
    eye(92, 50, 3.5) +
    eye(108, 50, 3.5) +
    path('M80 74 Q100 84 120 74 L118 82 Q100 90 82 82 Z', '#3D7BFF') +
    circ(100, 92, 3, INK) +
    circ(100, 104, 3, INK) +
    path('M72 92 L48 76 M128 92 L152 76', 'none', stroke('#8A5A44', 4)),
  sled: () =>
    path('M20 112 H160 Q180 112 180 96', 'none', stroke('#5B6478', 6)) +
    path('M40 112 V96 M80 112 V96 M120 112 V96 M150 112 V96', 'none', stroke('#5B6478', 5)) +
    rect(30, 76, 130, 22, '#E2583E', 6) +
    path('M40 82 H150 M40 90 H150', 'none', stroke('#C9452F', 2)) +
    path('M30 80 Q16 72 22 60', 'none', stroke('#8A5A44', 4)),
  snowflake: () =>
    [0, 60, 120].map((a) => `<g transform="rotate(${a} 100 70)">${line(100, 20, 100, 120, '#7DD3FC', 7)}${path('M100 36 l-12 -12 M100 36 l12 -12 M100 104 l-12 12 M100 104 l12 12', 'none', stroke('#7DD3FC', 6))}</g>`).join('') + circ(100, 70, 8, '#CFEFFF'),
  // the golden deer from the Ramayana: the plain deer dressed in gold, with a sparkle
  'golden-deer': () =>
    quad({
      body: '#F5B82E',
      legW: 8,
      legH: 40,
      legY: 90,
      rx: 50,
      ry: 24,
      extras: [72, 92, 112, 84, 104].map((x, i) => circ(x, 74 + (i % 2) * 10, 3.5, '#FFF7D6')).join(''),
      head: path('M136 70 Q140 52 150 40', 'none', stroke('#F5B82E', 14)) + ell(156, 40, 13, 16, '#F5B82E') + ell(162, 50, 9, 7, '#FFE9B0'),
      face: path('M150 26 L144 10 M144 14 L136 8 M162 26 L168 10 M168 14 L176 8', 'none', stroke('#C98B3E', 4)) + ell(140, 32, 8, 4, '#F5B82E') + eye(158, 38, 4),
    }) +
    path('M30 30 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z', '#fff') +
    path('M52 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z', '#FFF7D6'),
  donkey: () =>
    quad({
      body: '#A3A9B8',
      legW: 10,
      legH: 38,
      legY: 92,
      rx: 50,
      ry: 26,
      extras: ell(100, 90, 26, 14, '#D8DCE6'),
      head: path('M136 70 Q142 52 150 44', 'none', stroke('#A3A9B8', 16)) + path('M138 46 Q150 36 160 46', 'none', stroke('#5B6478', 6)) + ell(158, 46, 15, 19, '#A3A9B8') + ell(164, 58, 10, 8, '#D8DCE6') + path('M148 30 L142 4 L156 26 Z M168 30 L176 4 L162 26 Z', '#A3A9B8') + path('M149 24 L146 12 L153 23 Z M167 24 L170 12 L163 23 Z', '#F9A8D4'),
      face: eye(160, 42, 4) + circ(166, 60, 1.6, '#2B2D42') + circ(161, 61, 1.6, '#2B2D42'),
    }),
};
