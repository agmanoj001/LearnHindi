// People, food, home, festival and story pictures. People are built from one friendly template
// (skin, hair, clothes, and a hat or tool) so families and story characters share a look.
import { INK, rect, circ, ell, path, line, eye, starPoints } from './art-kit.js';

const stroke = (color, w) => `stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
const SKIN = ['#F2C29A', '#D9A066', '#B9774A'];

function person({ skin = SKIN[1], hair = '#2B2D42', style = 'short', top = '#3D7BFF', bottom = '#2B2D42', dress = false, kid = false, beard = null, mustache = false, glasses = false, hat = null, prop = '', bindi = false }) {
  const hr = kid ? 25 : 21;
  const hy = kid ? 44 : 34;
  const bodyTop = hy + hr - 2;
  const bodyBottom = kid ? 106 : 104;
  let s = '';
  // hair behind the head
  if (style === 'long') s += path(`M${100 - hr - 2} ${hy} Q${100 - hr - 6} ${hy + 40} ${100 - hr + 4} ${hy + 44} H${100 + hr - 4} Q${100 + hr + 6} ${hy + 40} ${100 + hr + 2} ${hy} Z`, hair);
  if (style === 'bun') s += circ(100, hy - hr - 2, 9, hair);
  // legs and body
  if (dress) s += path(`M${100 - 22} ${bodyTop + 6} L${100 - 32} ${bodyBottom + 8} H${100 + 32} L${100 + 22} ${bodyTop + 6} Z`, top);
  else s += rect(100 - 18, bodyBottom - 4, 15, 128 - bodyBottom + 2, bottom, 6) + rect(100 + 3, bodyBottom - 4, 15, 128 - bodyBottom + 2, bottom, 6);
  if (dress) s += rect(100 - 14, bodyBottom + 6, 10, 128 - bodyBottom - 8, skin, 4) + rect(100 + 4, bodyBottom + 6, 10, 128 - bodyBottom - 8, skin, 4);
  s += rect(100 - 24, bodyTop, 48, bodyBottom - bodyTop + (dress ? -8 : 0), top, 14);
  // arms
  s += path(`M${100 - 22} ${bodyTop + 10} Q${100 - 38} ${bodyTop + 26} ${100 - 34} ${bodyTop + 40}`, 'none', stroke(top, 10));
  s += path(`M${100 + 22} ${bodyTop + 10} Q${100 + 38} ${bodyTop + 26} ${100 + 34} ${bodyTop + 40}`, 'none', stroke(top, 10));
  s += circ(100 - 34, bodyTop + 42, 6, skin) + circ(100 + 34, bodyTop + 42, 6, skin);
  s += prop;
  // head
  s += rect(100 - 6, hy + hr - 6, 12, 10, skin, 3);
  s += circ(100, hy, hr, skin);
  if (style === 'short' || style === 'long' || style === 'bun') s += path(`M${100 - hr} ${hy - 2} Q${100 - hr + 2} ${hy - hr - 6} ${100} ${hy - hr - 4} Q${100 + hr - 2} ${hy - hr - 6} ${100 + hr} ${hy - 2} Q${100 + 6} ${hy - hr + 6} ${100 - hr} ${hy - 2} Z`, hair);
  if (style === 'grey') s += path(`M${100 - hr} ${hy} Q${100 - hr - 2} ${hy - hr + 4} ${100 - hr + 10} ${hy - hr + 6} M${100 + hr} ${hy} Q${100 + hr + 2} ${hy - hr + 4} ${100 + hr - 10} ${hy - hr + 6}`, 'none', stroke('#D9DEE7', 6));
  s += eye(100 - 8, hy - 1, 3.4) + eye(100 + 8, hy - 1, 3.4);
  s += path(`M${100 - 6} ${hy + 9} Q100 ${hy + 14} ${100 + 6} ${hy + 9}`, 'none', stroke('#8A3B2E', 2.4));
  s += ell(100 - 13, hy + 6, 4, 2.5, '#FF8FA3', 'opacity="0.5"') + ell(100 + 13, hy + 6, 4, 2.5, '#FF8FA3', 'opacity="0.5"');
  if (bindi) s += circ(100, hy - 9, 2, '#E2583E');
  if (mustache) s += path(`M${100 - 10} ${hy + 7} Q100 ${hy + 3} ${100 + 10} ${hy + 7} Q100 ${hy + 9} ${100 - 10} ${hy + 7} Z`, mustache === true ? INK : mustache);
  if (beard) s += path(`M${100 - hr + 4} ${hy + 4} Q${100 - hr + 4} ${hy + hr + 12} 100 ${hy + hr + 14} Q${100 + hr - 4} ${hy + hr + 12} ${100 + hr - 4} ${hy + 4} Q100 ${hy + 16} ${100 - hr + 4} ${hy + 4} Z`, beard);
  if (glasses) s += circ(100 - 8, hy - 1, 6, 'none', `stroke="${INK}" stroke-width="2"`) + circ(100 + 8, hy - 1, 6, 'none', `stroke="${INK}" stroke-width="2"`) + line(100 - 2, hy - 1, 100 + 2, hy - 1, INK, 2);
  if (hat === 'crown') s += path(`M${100 - 18} ${hy - hr + 2} L${100 - 20} ${hy - hr - 18} L${100 - 9} ${hy - hr - 6} L100 ${hy - hr - 22} L${100 + 9} ${hy - hr - 6} L${100 + 20} ${hy - hr - 18} L${100 + 18} ${hy - hr + 2} Z`, '#FFC93C') + circ(100, hy - hr - 4, 3, '#FF5A5F');
  if (hat === 'turban') s += path(`M${100 - hr - 2} ${hy - 4} Q${100 - hr} ${hy - hr - 14} 100 ${hy - hr - 12} Q${100 + hr} ${hy - hr - 14} ${100 + hr + 2} ${hy - 4} Q100 ${hy - hr + 2} ${100 - hr - 2} ${hy - 4} Z`, '#FF9F43') + circ(100, hy - hr - 2, 4, '#FF5A5F');
  if (hat === 'pagdi') s += path(`M${100 - hr - 2} ${hy - 2} Q${100 - hr} ${hy - hr - 12} 100 ${hy - hr - 10} Q${100 + hr} ${hy - hr - 12} ${100 + hr + 2} ${hy - 2} Q100 ${hy - hr + 4} ${100 - hr - 2} ${hy - 2} Z`, '#FFFFFF') + path(`M${100 + hr - 4} ${hy - hr} q10 -4 14 6`, 'none', stroke('#E3E6ED', 4));
  if (hat === 'scarf') s += path(`M${100 - hr - 3} ${hy + 6} Q${100 - hr - 4} ${hy - hr - 8} 100 ${hy - hr - 8} Q${100 + hr + 4} ${hy - hr - 8} ${100 + hr + 3} ${hy + 6} L${100 + hr + 8} ${hy + 30} L${100 + hr - 2} ${hy + 26} Q${100 + hr - 2} ${hy - hr + 4} 100 ${hy - hr + 2} Q${100 - hr + 2} ${hy - hr + 4} ${100 - hr + 2} ${hy + 26} L${100 - hr - 8} ${hy + 30} Z`, '#FF6B9A');
  if (hat === 'mask') s += rect(100 - hr + 2, hy - 7, (hr - 2) * 2, 9, INK, 4) + eye(100 - 8, hy - 3, 3) + eye(100 + 8, hy - 3, 3);
  if (hat === 'cap') s += path(`M${100 - hr} ${hy - 6} Q${100 - hr} ${hy - hr - 8} 100 ${hy - hr - 8} Q${100 + hr} ${hy - hr - 8} ${100 + hr} ${hy - 6} Z`, '#2EC27E') + rect(100, hy - 10, hr + 12, 6, '#1F9D63', 3);
  return s;
}

const axe = (x, y, blade = '#A0A7B4') => line(x, y, x + 6, y - 46, '#8A5A44', 6) + path(`M${x + 2} ${y - 40} Q${x + 22} ${y - 52} ${x + 26} ${y - 34} Q${x + 14} ${y - 30} ${x + 4} ${y - 30} Z`, blade);

const bigAxe = (blade) => line(64, 128, 120, 22, '#8A5A44', 10) + path('M110 30 Q150 10 168 46 Q150 60 120 54 Z', blade) + path('M116 40 Q140 30 152 46', 'none', stroke('#fff', 3));

// bits the story characters share: a bow in the left hand, a tilak, a flower garland
const bow = (x) => path(`M${x} 48 Q${x - 30} 86 ${x} 124`, 'none', stroke('#8A5A44', 5)) + line(x, 48, x, 124, '#F3F4F8', 2);
const tilak = () => path('M100 20 L97 31 L103 31 Z', '#E2583E');
const garland = (color) => [-14, -8, 0, 8, 14].map((dx) => circ(100 + dx, 60 + (dx === 0 ? 10 : Math.abs(dx) < 10 ? 7 : 2), 3, color)).join('');


export const PEOPLE = {
  boy: () => person({ kid: true, top: '#FF7A59', bottom: '#3D7BFF', skin: SKIN[1] }),
  girl: () => person({ kid: true, style: 'long', top: '#A66BFF', dress: true, skin: SKIN[1] }),
  mother: () => person({ style: 'bun', top: '#FF5A8A', dress: true, bindi: true, skin: SKIN[1] }),
  father: () => person({ top: '#2EC27E', bottom: '#5B6478', mustache: true, skin: SKIN[2] }),
  grandfather: () => person({ style: 'grey', top: '#F3F4F8', bottom: '#C4C9D4', mustache: '#E3E6ED', glasses: true, skin: SKIN[1], prop: line(140, 126, 136, 70, '#8A5A44', 5) }),
  grandmother: () => person({ style: 'grey', hair: '#D9DEE7', top: '#FFC93C', dress: true, glasses: true, hat: 'scarf', skin: SKIN[0] }),
  king: () => person({ top: '#9B5DE5', bottom: '#FFC93C', mustache: true, hat: 'crown', skin: SKIN[0], prop: path('M74 58 Q100 50 126 58 L130 104 H70 Z', '#E2583E', 'opacity="0.0"') }),
  farmer: () => person({ top: '#F3F4F8', bottom: '#F3F4F8', mustache: true, hat: 'pagdi', skin: SKIN[2], prop: line(140, 128, 150, 64, '#8A5A44', 4) + path('M150 64 Q164 56 160 72', 'none', stroke('#94A3B8', 4)) }),
  woodcutter: () => person({ top: '#E2583E', bottom: '#8A5A44', beard: '#5B3A2E', skin: SKIN[1], prop: axe(136, 104) }),
  capseller: () =>
    person({ top: '#3D7BFF', bottom: '#F3F4F8', mustache: true, skin: SKIN[1] }) +
    ['#FF5A5F', '#FFC93C', '#2EC27E', '#3D7BFF'].map((c, i) => path(`M82 ${12 - i * 7} Q100 ${-2 - i * 7} 118 ${12 - i * 7} Z`, c)).join(''),
  minister: () => person({ top: '#FFF1A6', bottom: '#F3F4F8', mustache: true, hat: 'turban', skin: SKIN[1] }),
  thief: () => person({ top: '#5B6478', bottom: '#2B2D42', hat: 'mask', skin: SKIN[1], prop: path('M128 96 Q150 84 156 104 Q146 118 130 110 Z', '#A47864') }),
  // ---------- story characters: the Ramayana, Krishna and Ganesh (gentle, picture-book style) ----------
  ram: () => person({ skin: '#8EC5E8', top: '#F7C948', bottom: '#F7C948', hat: 'crown', skin2: null, prop: bow(66) }) + tilak() + garland('#FFB4C2'),
  sita: () => person({ skin: SKIN[0], style: 'long', dress: true, top: '#E2583E', bottom: '#E2583E', bindi: true, hat: 'crown' }) + path('M80 60 Q100 108 120 60', 'none', stroke('#FFC93C', 3)) + circ(134, 94, 7, '#FF8FB1') + circ(134, 94, 3, '#FFC93C') + garland('#FFF1A6'),
  lakshman: () => person({ skin: SKIN[0], top: '#2EC27E', bottom: '#2EC27E', hat: 'crown', prop: bow(66) }) + tilak(),
  hanuman: () =>
    path('M120 112 Q160 118 158 84 Q156 66 170 62', 'none', stroke('#E9A05A', 8)) +
    rect(82, 100, 15, 30, '#E2583E', 6) + rect(103, 100, 15, 30, '#E2583E', 6) +
    rect(76, 56, 48, 50, '#E9A05A', 14) + path('M76 86 H124 V106 H76 Z', '#E2583E') +
    path('M78 66 Q60 70 56 50', 'none', stroke('#E9A05A', 10)) + path('M122 66 Q138 80 134 96', 'none', stroke('#E9A05A', 10)) + circ(134, 98, 6, '#E9A05A') +
    line(56, 48, 44, 16, '#8A5A44', 5) + circ(42, 12, 12, '#FFC93C') + circ(42, 12, 5, '#E8A51C') + circ(56, 48, 6, '#E9A05A') +
    circ(78, 36, 7, '#E9A05A') + circ(122, 36, 7, '#E9A05A') + circ(100, 36, 22, '#E9A05A') + ell(100, 44, 14, 11, '#F6D7B0') + eye(92, 32, 3.4) + eye(108, 32, 3.4) + path('M94 46 Q100 51 106 46', 'none', stroke('#8A3B2E', 2.4)) +
    path('M82 18 L80 6 L90 12 L100 2 L110 12 L120 6 L118 18 Z', '#FFC93C') + garland('#FF8FB1'),
  ravan: () =>
    [[-52, 40], [-32, 28], [32, 28], [52, 40]].map(([dx, y]) => circ(100 + dx, y, 11, SKIN[1]) + path(`M${100 + dx - 8} ${y - 8} L${100 + dx - 9} ${y - 18} L${100 + dx} ${y - 12} L${100 + dx + 9} ${y - 18} L${100 + dx + 8} ${y - 8} Z`, '#FFC93C') + eye(100 + dx - 4, y, 2) + eye(100 + dx + 4, y, 2)).join('') +
    person({ skin: SKIN[1], top: '#5B2A86', bottom: '#2B2D42', mustache: '#1F1F2E', hat: 'crown' }) +
    path('M86 24 L96 28 M114 24 L104 28', 'none', stroke(INK, 2.4)),
  krishna: () =>
    person({ skin: '#5B8DEF', top: '#FFC93C', bottom: '#FFC93C' }) +
    path('M108 14 Q116 -2 126 4', 'none', stroke('#2EC27E', 4)) + ell(126, 4, 7, 9, '#1F9D63') + circ(126, 4, 3.5, '#3D7BFF') + circ(126, 4, 1.5, '#FFC93C') +
    line(60, 96, 140, 74, '#8A5A44', 5) + [78, 94, 110, 124].map((x, i) => circ(x, 91 - i * 4.4, 1.6, '#2B2D42')).join('') + garland('#FF8FB1') + tilak(),
  ganesh: () =>
    ell(160, 122, 14, 8, '#9AA3B5') + circ(172, 116, 7, '#9AA3B5') + circ(176, 110, 3, '#F9A8D4') + eye(174, 115, 1.5) + path('M146 122 Q136 128 134 118', 'none', stroke('#9AA3B5', 2)) +
    rect(80, 104, 16, 26, '#E2583E', 6) + rect(104, 104, 16, 26, '#E2583E', 6) +
    ell(100, 84, 34, 30, '#F0B7A4') + path('M66 92 Q100 118 134 92 L134 108 H66 Z', '#E2583E') + path('M74 70 Q100 56 126 70', 'none', stroke('#FFC93C', 4)) +
    path('M70 70 Q50 80 54 96', 'none', stroke('#F0B7A4', 10)) + circ(54, 98, 7, '#FFB52E') + path('M130 70 Q150 80 146 96', 'none', stroke('#F0B7A4', 10)) + circ(146, 98, 6, '#F0B7A4') +
    ell(70, 40, 16, 20, '#F0B7A4') + ell(130, 40, 16, 20, '#F0B7A4') + ell(70, 40, 9, 13, '#F7D1C4') + ell(130, 40, 9, 13, '#F7D1C4') +
    circ(100, 40, 24, '#F0B7A4') + path('M90 50 L84 60 L94 55 Z M110 50 L116 60 L106 55 Z', '#FFFFFF') + path('M100 48 Q100 76 116 84 Q128 88 128 76', 'none', stroke('#DE9A84', 12)) + path('M100 48 Q100 76 116 84 Q128 88 128 76', 'none', stroke('#E9AC98', 7)) + eye(91, 36, 3.4) + eye(109, 36, 3.4) +
    path('M86 20 L84 8 L94 14 L100 4 L106 14 L116 8 L114 20 Z', '#FFC93C') + tilak(),
  tailor: () => person({ top: '#2EC27E', bottom: '#2B2D42', glasses: true, skin: SKIN[1], prop: path('M82 56 Q82 90 78 100 M118 56 Q118 90 122 100', 'none', stroke('#FFC93C', 4)) }) + line(134, 96, 150, 76, '#94A3B8', 4) + line(134, 96, 152, 88, '#94A3B8', 4) + circ(130, 100, 5, 'none', stroke('#94A3B8', 3)) + circ(136, 104, 5, 'none', stroke('#94A3B8', 3)),
};

export const THINGS = {
  // ---------- food ----------
  // a phulka on a steel thali: round, pale wheat, with the light brown spots it gets on the flame
  roti: () =>
    ell(100, 84, 82, 46, '#C9CED6') +
    ell(100, 80, 76, 40, '#E3E7ED') +
    ell(100, 80, 64, 32, '#D3D8E0') +
    ell(100, 72, 56, 34, '#EBD3A4') +
    ell(100, 70, 53, 31, '#F7E9CC') +
    ell(92, 62, 30, 13, '#FBF3E1', 'opacity="0.8"') +
    [[72, 66, 7, 4], [86, 80, 5, 3], [108, 58, 6, 3.5], [124, 74, 8, 4.5], [98, 90, 6, 3], [116, 88, 4, 2.5], [80, 54, 4, 2.5], [134, 62, 4, 2.5], [64, 80, 4, 2.5]]
      .map(([x, y, rx, ry], k) => ell(x, y, rx, ry, k % 3 ? '#C98B4A' : '#A9652F', 'opacity="0.75"'))
      .join(''),
  rice: () => path('M40 70 H160 Q156 120 100 122 Q44 120 40 70 Z', '#3D7BFF') + ell(100, 70, 60, 10, '#2F5BD3') + path('M48 70 Q60 40 100 38 Q140 40 152 70 Z', '#F3F4F8') + [70, 86, 100, 116, 130, 92, 108].map((x, i) => ell(x, 52 + (i % 3) * 6, 4, 2, '#E3E6ED')).join(''),
  milk: () => path('M66 24 H134 L126 124 H74 Z', '#E4F2FF') + path('M70 44 H130 L126 124 H74 Z', '#F8FAFF') + rect(80, 52, 6, 60, '#fff', 3, 'opacity="0.8"') + path('M76 44 Q100 38 124 44', 'none', stroke('#E3E6ED', 3)),
  kheer: () => path('M40 72 H160 Q156 120 100 122 Q44 120 40 72 Z', '#E9B872') + ell(100, 72, 60, 12, '#FFF1DE') + [76, 98, 122].map((x) => ell(x, 70, 5, 3, '#A47864')).join('') + circ(110, 74, 3, '#2EC27E') + path('M110 50 Q118 34 112 20 M90 50 Q98 34 92 20', 'none', stroke('#E3E6ED', 4)),
  corn: () => path('M100 120 Q70 100 76 60 Q82 26 100 16 Q118 26 124 60 Q130 100 100 120 Z', '#FFD43B') + [40, 54, 68, 82, 96].map((y) => path(`M82 ${y} H118`, 'none', stroke('#F5B82E', 3))).join('') + path('M100 120 Q60 112 52 70 Q74 92 96 100 Z M100 120 Q140 112 148 70 Q126 92 104 100 Z', '#2EC27E'),
  laddoo: () => [
      [74, 92],
      [126, 92],
      [100, 58],
    ].map(([x, y]) => circ(x, y, 28, '#FFB52E') + circ(x - 8, y - 8, 6, '#FFD27A') + [0, 1, 2, 3].map((k) => circ(x - 12 + k * 8, y + 4 + (k % 2) * 6, 2, '#E8902E')).join('')).join('') + ell(100, 124, 70, 6, '#E3E6ED'),

  // ---------- home ----------
  door: () => rect(56, 10, 88, 120, '#A47864', 6) + rect(64, 20, 32, 46, '#8A5A44', 4) + rect(104, 20, 32, 46, '#8A5A44', 4) + rect(64, 74, 32, 46, '#8A5A44', 4) + rect(104, 74, 32, 46, '#8A5A44', 4) + circ(132, 70, 5, '#FFC93C'),
  window: () => rect(36, 16, 128, 110, '#A47864', 8) + rect(46, 26, 50, 90, '#CFEFFF', 4) + rect(104, 26, 50, 90, '#CFEFFF', 4) + path('M50 30 L66 30 L50 60 Z', '#fff', 'opacity="0.6"') + path('M30 16 H170 V30 Q100 50 30 30 Z', '#FF8FB1'),
  bed: () => rect(20, 44, 16, 80, '#A47864', 5) + rect(164, 64, 16, 60, '#A47864', 5) + rect(28, 80, 144, 26, '#FFC2D6', 8) + rect(28, 98, 144, 12, '#A47864', 4) + rect(40, 64, 42, 22, '#fff', 10) + path('M90 80 H168 V100 H90 Z', '#6AAEFF'),
  chair: () => rect(60, 16, 12, 112, '#A47864', 4) + rect(128, 16, 12, 112, '#A47864', 4) + rect(66, 20, 68, 12, '#8A5A44', 4) + rect(66, 42, 68, 8, '#8A5A44', 3) + rect(54, 72, 92, 14, '#C98B5E', 5) + rect(60, 86, 12, 42, '#A47864', 4),
  clock: () => circ(100, 70, 54, '#FF7A59') + circ(100, 70, 44, '#fff') + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => {
      const a = (k * Math.PI) / 6;
      return circ((100 + 36 * Math.sin(a)).toFixed(1), (70 - 36 * Math.cos(a)).toFixed(1), k % 3 ? 2 : 3.5, INK);
    }).join('') + line(100, 70, 100, 42, INK, 5) + line(100, 70, 122, 70, INK, 4) + circ(100, 70, 4, '#FF5A5F'),
  tumbler: () => path('M66 24 H134 L124 124 H76 Z', '#B8C2D1') + path('M70 52 H130 L124 124 H76 Z', '#6AAEFF') + rect(80, 60, 6, 56, '#fff', 3, 'opacity="0.5"'),

  // ---------- festivals, weather ----------
  ferris: () => circ(100, 62, 50, 'none', stroke('#FF5A5F', 6)) + [0, 1, 2, 3, 4, 5].map((k) => {
      const a = (k * Math.PI) / 3;
      const x = 100 + 50 * Math.cos(a);
      const y = 62 + 50 * Math.sin(a);
      return line(100, 62, x.toFixed(1), y.toFixed(1), '#FFC2D6', 3) + rect((x - 9).toFixed(1), (y - 4).toFixed(1), 18, 14, ['#3D7BFF', '#FFC93C', '#2EC27E'][k % 3], 4);
    }).join('') + path('M100 62 L70 128 M100 62 L130 128', 'none', stroke('#A47864', 6)) + circ(100, 62, 7, '#FFC93C'),
  cloud: () => ell(100, 82, 66, 30, '#E4EEFA') + circ(74, 66, 28, '#E4EEFA') + circ(112, 56, 36, '#E4EEFA') + circ(140, 74, 22, '#E4EEFA') + ell(96, 90, 56, 14, '#CFDDF0'),
  raincloud: () => ell(100, 62, 66, 28, '#A0A7B4') + circ(76, 48, 26, '#A0A7B4') + circ(112, 40, 32, '#A0A7B4') + [56, 80, 104, 128, 150].map((x, i) => path(`M${x} ${96 + (i % 2) * 8} q-4 10 0 16 q4 -6 0 -16`, '#6AAEFF')).join(''),
  flag: () => line(50, 128, 50, 14, '#8A5A44', 6) + rect(54, 18, 100, 24, '#FF9F43') + rect(54, 42, 100, 24, '#FFFFFF') + rect(54, 66, 100, 24, '#2EC27E') + circ(104, 54, 9, 'none', 'stroke="#3D7BFF" stroke-width="2.5"'),
  rangoli: () => `<polygon points="${starPoints(100, 70, 58, 30, 8)}" fill="#FF6B9A"/>` + `<polygon points="${starPoints(100, 70, 40, 20, 8)}" fill="#FFC93C"/>` + circ(100, 70, 16, '#3D7BFF') + circ(100, 70, 7, '#fff') + [0, 1, 2, 3, 4, 5, 6, 7].map((k) => circ((100 + 52 * Math.cos((k * Math.PI) / 4 + 0.39)).toFixed(1), (70 + 52 * Math.sin((k * Math.PI) / 4 + 0.39)).toFixed(1), 5, '#2EC27E')).join(''),

  // ---------- story animals and things ----------
  swan: () =>
    path('M0 118 Q50 110 100 118 T200 118 V140 H0 Z', '#7DD3FC') +
    path('M44 100 Q50 70 100 74 Q150 76 156 100 Q130 116 90 114 Q56 114 44 100 Z', '#F3F4F8') +
    path('M60 92 Q80 72 112 86 Q90 100 60 92 Z', '#E3E6ED') +
    path('M140 92 Q150 60 136 40 Q130 28 142 22', 'none', stroke('#F3F4F8', 12)) +
    circ(144, 24, 11, '#F3F4F8') +
    path('M154 24 L170 28 L154 32 Z', '#FF9F43') +
    eye(146, 21, 2.8),
  dove: () => path('M40 80 L14 64 L22 92 Z', '#E3E6ED') + ell(90, 82, 46, 24, '#F3F4F8') + path('M70 74 Q90 30 128 40 Q110 60 98 80 Z', '#E3E6ED') + circ(134, 64, 16, '#F3F4F8') + path('M148 62 L162 66 L148 70 Z', '#FF9F43') + eye(138, 60, 3) + line(84, 104, 82, 118, '#FF7A59', 3) + line(98, 104, 100, 118, '#FF7A59', 3),
  ant: () => ell(62, 82, 24, 18, '#3B4252') + circ(102, 80, 14, '#3B4252') + circ(136, 70, 17, '#3B4252') + path('M140 56 Q144 36 156 32 M132 56 Q126 36 136 28', 'none', stroke(INK, 3)) + eye(142, 66, 4) + path('M70 96 L56 116 M98 92 L92 118 M108 92 L120 116 M60 96 L40 110 M106 90 L130 110', 'none', stroke(INK, 3)),
  bone: () => rect(56, 60, 88, 20, '#F3F4F8', 10) + circ(54, 58, 14, '#F3F4F8') + circ(54, 82, 14, '#F3F4F8') + circ(146, 58, 14, '#F3F4F8') + circ(146, 82, 14, '#F3F4F8'),
  well: () => rect(60, 16, 8, 60, '#8A5A44', 3) + rect(132, 16, 8, 60, '#8A5A44', 3) + path('M50 20 L100 2 L150 20 Z', '#E2583E') + line(68, 34, 132, 34, '#A47864', 5) + line(100, 34, 100, 70, '#5B6478', 2) + rect(92, 66, 16, 14, '#94A3B8', 3) + rect(44, 76, 112, 52, '#C9A27E', 6) + path('M44 92 H156 M44 110 H156 M72 76 V92 M100 92 V110 M128 76 V92 M72 110 V128 M128 110 V128', 'none', stroke('#A47864', 3)),
  net: () => path('M20 30 Q100 10 180 30 L160 120 Q100 136 40 120 Z', '#C9A27E', 'opacity="0.25"') + [40, 60, 80, 100, 120, 140, 160].map((x) => path(`M${x} ${20 + Math.abs(100 - x) / 8} L${x - 10 + (x - 100) / 10} 124`, 'none', stroke('#A47864', 2.5))).join('') + [40, 60, 80, 100].map((y) => path(`M${26 + (y - 30) / 5} ${y} Q100 ${y - 14} ${174 - (y - 30) / 5} ${y}`, 'none', stroke('#A47864', 2.5))).join(''),
  bell: () => path('M100 18 Q134 20 136 70 L146 96 H54 L64 70 Q66 20 100 18 Z', '#FFC93C') + rect(48, 94, 104, 10, '#F5A623', 5) + circ(100, 112, 10, '#E8902E') + circ(100, 14, 7, 'none', stroke('#F5A623', 4)) + ell(84, 52, 6, 14, '#fff', 'opacity="0.4"'),
  sticks: () => [-8, -3, 2, 7, 12].map((r, i) => `<g transform="rotate(${r} 100 70)">${rect(30, 54 + i * 7, 140, 8, ['#A47864', '#8A5A44'][i % 2], 4)}</g>`).join('') + rect(84, 46, 10, 52, '#FF5A5F', 3) + rect(116, 46, 10, 52, '#FF5A5F', 3),
  axe: () => bigAxe('#A0A7B4'),
  goldenaxe: () => bigAxe('#FFC93C') + `<polygon points="${starPoints(150, 30, 10, 4)}" fill="#FFE45C"/>` + `<polygon points="${starPoints(52, 46, 7, 3)}" fill="#FFE45C"/>`,
  coins: () => [
      [70, 100],
      [110, 104],
      [90, 80],
      [130, 84],
      [110, 62],
    ].map(([x, y]) => ell(x, y + 4, 22, 8, '#E8902E') + ell(x, y, 22, 8, '#FFC93C')).join(''),
  goldenegg: () => ell(100, 118, 54, 8, '#E3E6ED') + ell(100, 72, 34, 44, '#FFC93C') + ell(88, 56, 8, 14, '#FFF3A6') + `<polygon points="${starPoints(140, 30, 9, 4)}" fill="#FFE45C"/>` + `<polygon points="${starPoints(58, 40, 7, 3)}" fill="#FFE45C"/>`,
  cave: () => path('M10 128 Q20 30 100 24 Q180 30 190 128 Z', '#94A3B8') + path('M60 128 Q62 66 100 62 Q138 66 140 128 Z', '#2B2D42') + circ(50, 60, 8, '#A0A7B4') + circ(160, 84, 10, '#A0A7B4') + eye(92, 96, 4) + eye(108, 96, 4),
  snail: () => path('M28 120 Q30 104 52 104 H150 Q172 104 176 92 Q178 120 150 122 Z', '#A7E8B8') + circ(96, 76, 34, '#FFB55C') + path('M96 76 m-6 0 a6 6 0 1 1 12 0 a14 14 0 1 1 -28 0 a22 22 0 1 1 44 0', 'none', stroke('#E8902E', 4)) + path('M156 102 L160 70 M168 104 L178 74', 'none', stroke('#7ED3A0', 4)) + eye(160, 68, 4) + eye(178, 72, 4),
  bird: () => line(30, 120, 170, 120, '#8A5A44', 6) + path('M66 92 L44 84 L50 102 Z', '#2F5BD3') + ell(96, 92, 32, 22, '#3D7BFF') + ell(100, 98, 18, 14, '#FFC93C') + circ(122, 72, 16, '#3D7BFF') + path('M136 70 L150 74 L136 78 Z', '#FF9F43') + eye(126, 68, 3.2) + path('M84 80 Q100 66 112 86', '#2F5BD3') + path('M118 50 l2 -10 M126 52 l6 -8', 'none', stroke('#2F5BD3', 3)),
  jackal: () =>
    path('M50 86 Q22 90 22 66 Q36 74 54 78 Z', '#B9927F') +
    [64, 82, 114, 130].map((x) => rect(x, 92, 9, 34, '#A47864', 4)).join('') +
    ell(98, 84, 44, 22, '#B9927F') +
    path('M138 40 L134 18 L148 32 Z M162 32 L176 18 L172 40 Z', '#B9927F') +
    circ(155, 54, 21, '#B9927F') +
    path('M140 58 Q156 80 172 58 Q166 70 156 72 Q146 70 140 58 Z', '#E9DCD3') +
    eye(147, 50, 3.5) +
    eye(163, 50, 3.5) +
    circ(156, 68, 4, INK),
  bluejackal: () => THINGS.jackal().replace(/#B9927F/g, '#3D7BFF').replace(/#A47864/g, '#2F5BD3').replace(/#E9DCD3/g, '#9CC2FF'),
  cookingpot: () => path('M80 112 L70 128 M120 112 L130 128 M100 112 V128', 'none', stroke('#8A5A44', 6)) + path('M84 114 Q100 96 116 114 Z', '#FF7A3D') + path('M90 112 Q100 102 110 112 Z', '#FFC93C') + path('M46 50 H154 Q150 98 100 100 Q50 98 46 50 Z', '#94A3B8') + ell(100, 50, 54, 10, '#64748B') + path('M84 40 Q78 24 86 10 M110 40 Q104 24 112 10', 'none', stroke('#E3E6ED', 4)),
  field: () => rect(0, 30, 200, 110, '#A6E07A', 12) + [44, 70, 96, 122].map((y) => path(`M0 ${y} Q100 ${y - 10} 200 ${y}`, 'none', stroke('#7DC85B', 6))).join('') + [30, 70, 110, 150].map((x) => path(`M${x} 40 v-14 M${x - 6} 30 l6 -6 l6 6`, 'none', stroke('#F5B82E', 3))).join(''),
  // ---------- things from the story shelf: Ramayana, Krishna, folk tales ----------
  bow: () => path('M60 14 Q10 70 60 126', 'none', stroke('#8A5A44', 7)) + line(60, 14, 60, 126, '#F3F4F8', 2.5) + line(60, 70, 178, 70, '#C98B3E', 4) + path('M192 70 L172 60 L177 70 L172 80 Z', '#94A3B8') + path('M62 70 L78 60 L72 70 L78 80 Z', '#E2583E'),
  butter: () => path('M44 60 Q36 120 100 124 Q164 120 156 60 Z', '#C97B4A') + ell(100, 60, 56, 12, '#A85E33') + path('M52 58 Q70 36 100 40 Q130 36 148 58 Q130 66 100 64 Q70 66 52 58 Z', '#FFFBEA') + ell(84, 46, 10, 6, '#fff') + path('M148 58 Q160 72 150 86 Q140 72 148 58 Z', '#FFFBEA'),
  salt: () => path('M56 50 Q50 120 100 124 Q150 120 144 50 Q130 40 100 42 Q70 40 56 50 Z', '#E8DCC4') + ell(100, 48, 36, 10, '#D6C7AA') + path('M100 42 L100 24', 'none', stroke('#8A5A44', 4)) + path('M70 80 Q100 70 130 80 L130 100 Q100 110 70 100 Z', '#fff') + [82, 100, 118].map((x) => circ(x, 90, 3, '#3D7BFF')).join('') + [34, 48, 152, 166].map((x, i) => circ(x, 124 - (i % 2) * 6, 3.5, '#fff')).join(''),
  needle: () => line(40, 118, 152, 24, '#C4C9D4', 7) + line(152, 24, 166, 12, '#C4C9D4', 4) + ell(58, 103, 8, 4.5, '#2B2D42', 'transform="rotate(-40 58 103)"') + path('M60 106 Q30 130 18 104 Q20 78 58 96', 'none', stroke('#E2583E', 3)),
  wind: () => circ(60, 60, 30, '#DCEFFF') + circ(44, 72, 22, '#DCEFFF') + circ(80, 76, 24, '#DCEFFF') + eye(50, 56, 3.6) + eye(70, 56, 3.6) + ell(62, 74, 6, 7, '#8FB8DE') + path('M104 54 Q140 40 150 64 Q156 80 140 78 M104 76 Q160 66 176 92 Q184 110 164 108 M98 98 Q136 92 146 112', 'none', stroke('#8FB8DE', 5)),
  mountain: () => path('M0 128 L60 40 L92 82 L120 28 L200 128 Z', '#6B7FB5') + path('M60 40 L48 58 L58 56 L68 62 L76 56 Z', '#fff') + path('M120 28 L104 52 L116 48 L124 56 L134 50 Z', '#fff') + path('M0 128 Q60 108 120 118 Q170 124 200 128 Z', '#5BB45E') + circ(170, 26, 12, '#FFE27A'),
  sea: () => rect(4, 56, 192, 80, '#5DADE2', 16) + [66, 84, 102, 120].map((y, i) => path(`M${-20 + i * 10} ${y} Q${20 + i * 10} ${y - 12} ${60 + i * 10} ${y} T${140 + i * 10} ${y} T${220 + i * 10} ${y}`, 'none', stroke(i % 2 ? '#8FD0F5' : '#3D8FD1', 5))).join('') + circ(160, 28, 16, '#FFE27A') + path('M20 36 Q34 28 48 36 M60 20 Q72 12 84 20', 'none', stroke('#fff', 3)),
  stone: () => ell(100, 124, 70, 6, '#E3E6ED') + ell(64, 104, 26, 18, '#9AA3B5') + ell(124, 100, 34, 22, '#B3BAC9') + ell(96, 78, 18, 13, '#8893A8') + ell(56, 98, 8, 5, '#C4CAD6') + ell(114, 92, 10, 6, '#D0D5E0'),
  ring: () => circ(100, 82, 38, 'none', stroke('#FFC93C', 12)) + circ(100, 82, 38, 'none', stroke('#E8A51C', 3)) + path('M100 24 L116 40 L100 56 L84 40 Z', '#FF5A5F') + path('M100 24 L108 40 L100 56 Z', '#FF8A8E') + path('M84 40 L100 44 L116 40', 'none', stroke('#fff', 2)),
  cotton: () => path('M40 70 Q30 110 70 118 Q100 128 130 118 Q170 110 160 70 Q150 50 120 52 Q100 36 80 52 Q50 50 40 70 Z', '#E9DCC4') + [[70, 72], [100, 60], [130, 72], [84, 92], [116, 92]].map(([x, y]) => circ(x, y, 18, '#fff')).join('') + [[70, 72], [100, 60], [130, 72]].map(([x, y]) => circ(x - 5, y - 5, 6, '#F6F7FB')).join(''),
};
