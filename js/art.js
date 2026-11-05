// Simple, bright vector art drawn in code. Every picture is an SVG string.
// Pure module (no DOM access) so tests can check that every content picture exists.

import { INK, OUT, GLASS, svg, rect, circ, ell, path, line, win, wheel, eye, tracks, starPoints } from './art-kit.js';
import { WORD_ART, PLACE_ART, FLOATING, parkingCars } from './art-words.js';
import { CREATURES, FLOATING_CREATURES } from './art-creatures.js';
import { PEOPLE, THINGS } from './art-people.js';
import { ACTIVITY_ICONS } from './art-icons.js';
import { PHONICS_ART } from './art-phonics.js';
import { COMIC_ART } from './art-comic.js';

function car(color) {
  return (
    path('M20 100 V76 Q20 65 34 63 L58 58 L78 34 Q82 30 90 30 H128 Q136 30 140 36 L158 60 L172 64 Q182 68 182 80 V100 Z', color) +
    path('M86 38 H108 V58 H68 Z', GLASS, '') +
    path('M114 38 H128 Q132 38 134 42 L148 58 H114 Z', GLASS, '') +
    circ(176, 76, 5, '#FFF1A6') +
    rect(20, 86, 10, 6, '#FF7A59', 2, '') +
    wheel(56, 102, 17) +
    wheel(148, 102, 17)
  );
}

const VEHICLES = {
  bus: () =>
    rect(12, 28, 176, 78, '#FFC233', 14) +
    [22, 54, 86, 118].map((x) => win(x, 40, 26, 26)).join('') +
    rect(152, 40, 26, 54, '#A7CCFF', 6, '') + rect(152, 76, 26, 4, '#7FB2F5', 0, '') +
    rect(12, 76, 140, 8, '#FF7A59', 0, '') +
    circ(182, 96, 5, '#FFF1A6') +
    wheel(50, 108, 16) +
    wheel(150, 108, 16),
  car: () => car('#FF5A5F'),
  policecar: () =>
    car('#F3F4F8') +
    rect(22, 78, 158, 8, '#3D7BFF', 0, '') +
    rect(92, 20, 17, 10, '#FF5A5F', 3, '') +
    rect(109, 20, 17, 10, '#3D7BFF', 3, ''),
  ambulance: () =>
    rect(14, 34, 172, 68, '#F3F4F8', 12) +
    win(146, 44, 32, 24) +
    rect(14, 76, 172, 8, '#FF5A5F', 0, '') +
    path('M80 66 C64 52 66 40 76 40 C82 40 86 46 86 46 C86 46 90 40 96 40 C106 40 108 52 92 66 L86 72 Z', '#FF5A5F', '') +
    rect(64, 24, 30, 10, '#3D7BFF', 3, '') +
    wheel(50, 106, 16) +
    wheel(150, 106, 16),
  firetruck: () =>
    rect(10, 46, 140, 56, '#FF5A5F', 8) +
    rect(146, 34, 42, 68, '#FF5A5F', 8) +
    win(154, 42, 26, 24) +
    rect(18, 32, 120, 10, '#D9DEE7', 3, '') +
    [30, 50, 70, 90, 110].map((x) => line(x, 32, x, 42, INK, 2)).join('') +
    circ(60, 72, 13, '#FFE45C', OUT) +
    circ(60, 72, 5, '#FF9F43') +
    rect(158, 26, 18, 8, '#3D7BFF', 3, '') +
    wheel(40, 106, 15) +
    wheel(100, 106, 15) +
    wheel(166, 106, 15),
  digger: () =>
    tracks(26, 96, 110) +
    rect(36, 62, 84, 34, '#FFC233', 6) +
    rect(78, 28, 42, 38, '#FFC233', 6) +
    win(84, 34, 30, 24) +
    `<polyline points="118,72 156,36 180,80" fill="none" stroke="#F5A623" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>` +
    path('M168 80 H194 L188 104 Q178 110 168 98 Z', '#7C8594'),
  dumptruck: () =>
    path('M14 38 H136 L130 90 H20 Z', '#FFB25B') +
    path('M26 38 Q50 14 78 38 Q102 20 128 38 Z', '#A47864', '') +
    rect(140, 44, 46, 56, '#FF9F43', 8) +
    win(150, 52, 28, 22) +
    rect(14, 90, 172, 10, '#475569', 2, '') +
    wheel(44, 108, 16) +
    wheel(160, 108, 16),
  crane: () =>
    rect(62, 22, 14, 62, '#FFC233', 2) +
    rect(28, 14, 154, 10, '#FFC233', 2) +
    line(162, 24, 162, 56, '#475569', 3) +
    rect(150, 56, 24, 16, '#FF5A5F', 3) +
    rect(20, 82, 132, 22, '#FFC233', 6) +
    rect(146, 62, 42, 42, '#FFC233', 6) +
    win(154, 68, 26, 20) +
    wheel(46, 108, 14) +
    wheel(96, 108, 14) +
    wheel(166, 108, 14),
  mixer: () =>
    `<g transform="rotate(-12 82 64)">` +
    ell(82, 64, 62, 34, '#E8ECF4') +
    path('M40 40 Q60 64 40 90 M74 32 Q94 64 74 96 M108 32 Q128 64 108 96', 'none', 'stroke="#FF9F43" stroke-width="7" stroke-linecap="round"') +
    `</g>` +
    rect(146, 46, 42, 56, '#3D7BFF', 8) +
    win(154, 54, 26, 22) +
    rect(14, 96, 174, 8, '#475569', 2, '') +
    wheel(44, 110, 14) +
    wheel(92, 110, 14) +
    wheel(164, 110, 14),
  bulldozer: () =>
    tracks(18, 94, 128, 28) +
    rect(32, 60, 100, 36, '#FFC233', 6) +
    rect(52, 26, 50, 38, '#FFC233', 6) +
    win(58, 32, 38, 26) +
    line(130, 80, 152, 84, '#475569', 8) +
    path('M150 54 L180 48 Q190 86 180 124 L150 118 Z', '#A0A7B4'),
  tractor: () =>
    rect(56, 58, 80, 38, '#2EC27E', 8) +
    rect(128, 64, 52, 32, '#2EC27E', 6) +
    rect(50, 18, 62, 8, '#1F9D63', 3) +
    line(56, 26, 56, 60, INK, 4) +
    line(106, 26, 106, 60, INK, 4) +
    win(62, 30, 40, 26) +
    rect(150, 40, 7, 26, '#475569', 2, '') +
    wheel(76, 100, 30) +
    wheel(162, 108, 18),
  train: () =>
    rect(14, 94, 172, 10, '#3B4252', 2, '') +
    rect(64, 50, 96, 46, '#3D7BFF', 8) +
    rect(16, 28, 56, 68, '#FF5A5F', 6) +
    win(28, 38, 32, 24) +
    rect(130, 24, 18, 28, '#475569', 3) +
    circ(146, 14, 8, '#D9DEE7') +
    circ(160, 8, 6, '#E8ECF4') +
    path('M160 80 L188 104 H160 Z', '#FFC233') +
    circ(160, 64, 6, '#FFF1A6', OUT) +
    wheel(40, 110, 14) +
    wheel(92, 110, 16) +
    wheel(138, 110, 16),
  carriage: () =>
    rect(10, 6, 180, 94, '#FF9F43', 12) +
    rect(10, 96, 180, 8, '#3B4252', 2, '') +
    wheel(46, 110, 14) +
    wheel(154, 110, 14),
  garbagetruck: () =>
    rect(10, 32, 130, 68, '#2EC27E', 10) +
    path('M50 50 L62 72 H38 Z M86 50 L98 72 H74 Z', '#D1F5DC', '') +
    rect(140, 46, 46, 54, '#4ADE80', 8) +
    win(150, 54, 28, 22) +
    rect(10, 96, 176, 8, '#475569', 2, '') +
    wheel(42, 108, 15) +
    wheel(98, 108, 15) +
    wheel(162, 108, 15),
  plane: () =>
    path('M24 66 L12 26 H34 L62 60 Z', '#FF5A5F') +
    path('M20 76 Q20 56 52 56 H158 Q190 60 192 76 Q188 94 158 94 H52 Q20 94 20 76 Z', '#E8ECF4') +
    [68, 86, 104, 122, 140].map((x) => circ(x, 70, 5, '#6AAEFF')).join('') +
    path('M164 62 Q180 64 186 72 H164 Z', '#6AAEFF', '') +
    path('M84 82 H124 L98 124 H80 Z', '#94A3B8'),
  helicopter: () =>
    line(46, 30, 176, 30, INK, 6) +
    rect(106, 30, 8, 18, '#475569', 2, '') +
    rect(16, 64, 70, 12, '#FF9F43', 5) +
    circ(18, 70, 12, 'none', `stroke="${INK}" stroke-width="3"`) +
    ell(118, 76, 50, 30, '#FF9F43') +
    path('M130 54 Q164 56 166 80 H130 Z', GLASS, '') +
    line(92, 106, 98, 116) +
    line(140, 106, 136, 116) +
    line(80, 116, 158, 116, INK, 5),
  boat: () =>
    line(100, 22, 100, 90) +
    path('M104 24 L104 86 L152 86 Z', '#F3F4F8') +
    path('M96 34 L96 86 L60 86 Z', '#FFE45C') +
    path('M28 90 H172 L152 118 H48 Z', '#A47864') +
    path('M0 124 Q25 116 50 124 T100 124 T150 124 T200 124 V140 H0 Z', '#7DD3FC', ''),
  ship: () =>
    rect(70, 30, 18, 32, '#FF5A5F', 2) +
    rect(104, 30, 18, 32, '#FF5A5F', 2) +
    rect(40, 58, 112, 28, '#F3F4F8', 4) +
    [56, 80, 104, 128].map((x) => circ(x, 72, 5, '#6AAEFF', '')).join('') +
    path('M8 84 H192 L170 118 H30 Z', '#3D7BFF') +
    path('M0 124 Q25 116 50 124 T100 124 T150 124 T200 124 V140 H0 Z', '#7DD3FC', ''),
  auto: () =>
    path('M34 104 V70 H160 L184 92 V104 Z', '#2EC27E') +
    path('M40 70 Q44 30 86 28 H150 Q162 30 162 70 Z', '#FFD43B') +
    path('M120 36 H148 Q156 38 156 64 H120 Z', GLASS, '') +
    path('M54 64 Q58 38 86 36 H108 V64 Z', '#2B2D42', '') +
    wheel(64, 108, 15) +
    wheel(168, 108, 15),
  scooter: () =>
    line(146, 92, 158, 38, '#FF4D8D', 10) +
    line(146, 34, 172, 34, INK, 6) +
    circ(162, 48, 6, '#FFF1A6', OUT) +
    path('M28 94 Q34 62 78 64 H102 V96 H32 Z', '#FF4D8D') +
    rect(96, 86, 56, 10, '#FF4D8D', 4) +
    rect(46, 52, 50, 12, INK, 6, '') +
    wheel(46, 106, 16) +
    wheel(160, 106, 16),
  bicycle: () =>
    circ(50, 96, 26, 'none', `stroke="${INK}" stroke-width="6"`) +
    circ(150, 96, 26, 'none', `stroke="${INK}" stroke-width="6"`) +
    `<polyline points="50,96 90,96 128,56 76,56 50,96" fill="none" stroke="#3D7BFF" stroke-width="7" stroke-linejoin="round"/>` +
    line(90, 96, 72, 46, '#3D7BFF', 7) +
    line(128, 56, 150, 96, '#3D7BFF', 7) +
    line(128, 56, 122, 36, '#3D7BFF', 6) +
    line(114, 36, 138, 36, INK, 6) +
    rect(58, 40, 30, 9, INK, 4, ''),
  motorbike: () =>
    line(140, 66, 156, 100, '#475569', 8) +
    line(132, 50, 152, 44, INK, 6) +
    path('M64 72 Q100 48 136 66 L142 84 H76 Z', '#FF5A5F') +
    rect(84, 80, 42, 20, '#64748B', 4) +
    path('M40 70 H86 L80 62 H48 Z', INK, '') +
    circ(150, 66, 6, '#FFF1A6', OUT) +
    wheel(48, 100, 22) +
    wheel(156, 100, 22),
  truck: () =>
    rect(10, 28, 124, 72, '#38BDF8', 6) +
    path('M136 48 H168 Q186 50 188 72 V100 H136 Z', '#FF5A5F') +
    win(146, 56, 26, 20) +
    rect(10, 96, 178, 8, '#475569', 2, '') +
    wheel(40, 108, 15) +
    wheel(96, 108, 15) +
    wheel(162, 108, 15),
  rocket: () =>
    path('M84 112 Q100 140 116 112 Z', '#FF9F43', '') +
    path('M74 86 L54 120 H76 Z', '#FF5A5F') +
    path('M126 86 L146 120 H124 Z', '#FF5A5F') +
    path('M100 6 Q128 30 128 80 V114 H72 V80 Q72 30 100 6 Z', '#E8ECF4') +
    circ(100, 54, 13, '#6AAEFF', OUT) +
    rect(72, 96, 56, 8, '#FF5A5F', 0, ''),
  submarine: () =>
    path('M86 34 H114 Q120 34 120 40 V56 H80 V40 Q80 34 86 34 Z', '#FFD43B') +
    `<polyline points="108,34 108,16 124,16" fill="none" stroke="${INK}" stroke-width="5"/>` +
    ell(104, 80, 82, 32, '#FFD43B') +
    [72, 104, 136].map((x) => circ(x, 78, 9, '#6AAEFF', OUT)).join('') +
    path('M22 80 L8 64 V96 Z', '#FF9F43') +
    circ(178, 52, 5, 'none', 'stroke="#7DD3FC" stroke-width="2"') +
    circ(188, 36, 7, 'none', 'stroke="#7DD3FC" stroke-width="2"'),
};

// ---- animals ----

function legs(xs, color, y = 92, h = 34, w = 12) {
  return xs.map((x) => rect(x, y, w, h, color, 4)).join('');
}

const ANIMALS = {
  cow: () =>
    path('M44 74 Q24 76 26 100', 'none', `stroke="${INK}" stroke-width="4" fill="none"`) +
    legs([58, 80, 120, 140], '#F3F4F8') +
    ell(100, 80, 58, 32, '#F3F4F8') +
    ell(80, 72, 14, 10, INK, '') +
    ell(118, 90, 12, 8, INK, '') +
    path('M140 34 L134 22 M172 34 L178 22', 'none', `stroke="#A47864" stroke-width="5" stroke-linecap="round"`) +
    ell(134, 44, 10, 6, '#F3F4F8') +
    ell(178, 44, 10, 6, '#F3F4F8') +
    circ(156, 54, 24, '#F3F4F8', OUT) +
    ell(158, 72, 18, 12, '#FFC2D6') +
    circ(152, 72, 2.5, INK) +
    circ(164, 72, 2.5, INK) +
    eye(148, 50) +
    eye(166, 50),
  dog: () =>
    path('M44 74 Q30 50 38 40', 'none', `stroke="${INK}" stroke-width="3" fill="none"`) +
    path('M44 74 Q30 50 38 40', 'none', 'stroke="#B9927F" stroke-width="8" stroke-linecap="round" fill="none"') +
    legs([60, 80, 118, 138], '#B9927F') +
    ell(100, 82, 54, 28, '#B9927F') +
    circ(152, 56, 26, '#B9927F', OUT) +
    ell(132, 60, 10, 20, '#7A5444') +
    ell(170, 66, 14, 10, '#E9DCD3') +
    circ(178, 62, 5, INK) +
    eye(148, 50) +
    eye(164, 50),
  cat: () =>
    path('M46 80 Q20 70 28 40', 'none', 'stroke="#FFB55C" stroke-width="9" stroke-linecap="round" fill="none"') +
    legs([62, 80, 118, 136], '#FFB55C', 94, 32, 10) +
    ell(100, 84, 50, 26, '#FFB55C') +
    path('M132 44 L136 18 L152 36 Z M164 36 L180 18 L182 44 Z', '#FFB55C') +
    circ(156, 54, 26, '#FFB55C', OUT) +
    eye(146, 50) +
    eye(166, 50) +
    path('M152 62 L160 62 L156 67 Z', '#FF6B9A', '') +
    line(140, 66, 120, 62, INK, 2) +
    line(140, 70, 120, 72, INK, 2) +
    line(172, 66, 192, 62, INK, 2) +
    line(172, 70, 192, 72, INK, 2),
  horse: () =>
    path('M46 70 Q28 84 34 112', 'none', 'stroke="#5B3A2E" stroke-width="10" stroke-linecap="round" fill="none"') +
    legs([58, 78, 120, 140], '#A47864', 88, 40) +
    ell(100, 78, 56, 28, '#A47864') +
    path('M136 66 L150 22 Q160 12 172 20 L190 52 Q192 62 182 64 L160 50 L152 74 Z', '#A47864') +
    path('M146 30 Q140 50 134 66', 'none', 'stroke="#5B3A2E" stroke-width="8" stroke-linecap="round" fill="none"') +
    eye(166, 32),
  goat: () =>
    legs([60, 80, 118, 136], '#E2D8CC') +
    ell(100, 80, 50, 28, '#EDE5DA') +
    path('M146 34 Q140 12 124 16 M164 32 Q170 10 186 16', 'none', `stroke="#A47864" stroke-width="5" stroke-linecap="round" fill="none"`) +
    ell(156, 54, 20, 24, '#EDE5DA') +
    path('M150 76 L156 96 L162 76 Z', '#C4C9D4') +
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
      .map(([x, y]) => circ(x, y, 22, '#F3F4F8', OUT))
      .join('') +
    ell(100, 80, 40, 20, '#F3F4F8', '') +
    ell(158, 62, 16, 22, '#3F3F46') +
    eye(152, 56, 3.5) +
    eye(164, 56, 3.5),
  elephant: () =>
    legs([50, 76, 116, 140], '#94A3B8', 90, 40, 18) +
    ell(98, 78, 64, 40, '#94A3B8') +
    ell(140, 62, 26, 30, '#8492A6') +
    circ(160, 58, 28, '#94A3B8', OUT) +
    path('M178 66 Q194 96 180 120 Q176 124 172 118 Q182 96 168 76 Z', '#94A3B8') +
    eye(166, 50),
  lion: () =>
    path('M44 80 Q20 82 22 110', 'none', `stroke="${INK}" stroke-width="3" fill="none"`) +
    circ(22, 112, 7, '#F28C28') +
    legs([60, 80, 118, 136], '#FFC93C') +
    ell(98, 82, 52, 28, '#FFC93C') +
    circ(152, 56, 38, '#F28C28', OUT) +
    circ(152, 58, 25, '#FFC93C', OUT) +
    eye(144, 52) +
    eye(160, 52) +
    path('M148 64 H156 L152 70 Z', INK, ''),
  rabbit: () =>
    ell(84, 26, 9, 28, '#D8CCC2') +
    ell(116, 26, 9, 28, '#D8CCC2') +
    ell(84, 28, 4, 20, '#FFC2D6', '') +
    ell(116, 28, 4, 20, '#FFC2D6', '') +
    circ(62, 108, 10, '#F3F4F8', OUT) +
    ell(100, 100, 40, 30, '#D8CCC2') +
    circ(100, 62, 26, '#D8CCC2', OUT) +
    eye(90, 58) +
    eye(110, 58) +
    path('M96 68 H104 L100 73 Z', '#FF6B9A', '') +
    ell(80, 128, 14, 7, '#D8CCC2') +
    ell(120, 128, 14, 7, '#D8CCC2'),
  monkey: () =>
    path('M64 112 Q24 110 34 76 Q40 62 52 70', 'none', 'stroke="#8A5A44" stroke-width="8" stroke-linecap="round" fill="none"') +
    ell(100, 100, 36, 32, '#8A5A44') +
    ell(100, 104, 20, 20, '#E9DCD3', '') +
    circ(68, 54, 12, '#E9DCD3', OUT) +
    circ(132, 54, 12, '#E9DCD3', OUT) +
    circ(100, 54, 30, '#8A5A44', OUT) +
    ell(100, 62, 20, 16, '#E9DCD3', '') +
    eye(90, 50) +
    eye(110, 50) +
    path('M92 66 Q100 72 108 66', 'none', `stroke="${INK}" stroke-width="2.5" fill="none"`),
  parrot: () =>
    line(40, 118, 170, 118, '#7A5444', 8) +
    path('M86 104 L64 136 L82 136 L98 108 Z', '#3D7BFF') +
    ell(104, 80, 28, 40, '#2EC27E') +
    ell(94, 86, 14, 26, '#1F9D63', '') +
    circ(110, 40, 22, '#2EC27E', OUT) +
    path('M128 36 Q146 40 136 58 Q130 52 124 50 Z', '#FF5A5F') +
    eye(112, 34) +
    line(96, 118, 98, 112, INK, 3) +
    line(112, 118, 110, 112, INK, 3),
  fish: () =>
    path('M44 70 L14 44 V96 Z', '#FF9F43') +
    ell(100, 70, 60, 34, '#FFB25B') +
    path('M96 38 Q104 22 120 40', '#FF9F43') +
    path('M80 74 Q96 82 108 74', 'none', `stroke="${INK}" stroke-width="2.5" fill="none"`) +
    eye(136, 62, 6) +
    circ(176, 40, 4, 'none', 'stroke="#7DD3FC" stroke-width="2"') +
    circ(186, 26, 6, 'none', 'stroke="#7DD3FC" stroke-width="2"'),
  duck: () =>
    path('M0 118 Q25 110 50 118 T100 118 T150 118 T200 118 V140 H0 Z', '#7DD3FC', '') +
    path('M44 84 L30 66 L52 74 Z', '#FFD43B') +
    ell(92, 92, 52, 26, '#FFD43B') +
    path('M70 86 Q92 72 112 90', '#FFC233') +
    circ(140, 56, 22, '#FFD43B', OUT) +
    path('M158 56 Q182 56 182 64 Q176 70 158 66 Z', '#FF9F43') +
    eye(144, 50),
  rooster: () =>
    path('M60 76 Q30 40 50 20 Q60 50 72 64 Z', '#1F9D63') +
    path('M60 80 Q24 64 30 36 Q50 60 74 70 Z', '#3D7BFF') +
    line(92, 106, 92, 128, '#FF9F43', 5) +
    line(112, 106, 112, 128, '#FF9F43', 5) +
    ell(100, 84, 40, 28, '#B9927F') +
    path('M120 70 Q118 40 132 34 L150 40 Q154 60 140 80 Z', '#B9927F') +
    path('M128 34 Q130 20 136 26 Q140 16 146 26 Q152 20 152 34 Z', '#FF5A5F') +
    path('M150 44 L164 48 L150 54 Z', '#FFD43B') +
    ell(148, 60, 4, 8, '#FF5A5F', '') +
    eye(140, 44),
};

// ---- shapes, colours and concepts ----

export const SHAPES = {
  circle: (c) => circ(100, 70, 52, c, OUT),
  square: (c) => rect(52, 22, 96, 96, c, 6),
  triangle: (c) => path('M100 16 L156 120 H44 Z', c),
  star: (c) => `<polygon points="${starPoints(100, 72, 60, 26)}" fill="${c}" ${OUT}/>`,
  heart: (c) => path('M100 124 C40 84 38 44 66 30 C84 22 98 36 100 46 C102 36 116 22 134 30 C162 44 160 84 100 124 Z', c),
};

const CONCEPTS = {
  color: (c = '#FF5A5F') =>
    path('M100 18 C140 18 172 40 166 74 C176 100 146 124 108 120 C70 128 30 110 34 78 C22 48 56 18 100 18 Z', c) +
    circ(80, 54, 9, '#fff', 'opacity="0.5"'),
  'size-big': () => rect(30, 10, 140, 120, '#A66BFF', 12),
  'size-small': () => rect(82, 82, 36, 36, '#A66BFF', 6),
  'dir-up': () => path('M100 12 L160 72 H122 V128 H78 V72 H40 Z', '#14B8A6'),
  'dir-down': () => path('M100 128 L160 68 H122 V12 H78 V68 H40 Z', '#14B8A6'),
  'speed-fast': () =>
    line(16, 50, 70, 50, '#94A3B8', 7) +
    line(6, 72, 70, 72, '#94A3B8', 7) +
    line(16, 94, 70, 94, '#94A3B8', 7) +
    path('M90 30 L170 72 L90 114 Z', '#FF5A5F'),
  'speed-slow': () =>
    // a snail
    path('M30 110 H170 Q176 110 172 104 L150 96 H40 Q26 100 30 110 Z', '#A7E8B8') +
    circ(90, 78, 34, '#FFB55C', OUT) +
    path('M90 78 m-6 0 a6 6 0 1 1 12 0 a14 14 0 1 1 -28 0 a22 22 0 1 1 44 0', 'none', `stroke="${INK}" stroke-width="3" fill="none"`) +
    line(150, 98, 160, 66, INK, 3) +
    line(160, 98, 176, 70, INK, 3) +
    eye(160, 64, 4) +
    eye(176, 68, 4),
};

// ---- places on the town map (viewBox 0 0 200 160) ----

const ground = (c = '#9BE07A') => rect(0, 128, 200, 32, c, 14, '');
const PLACES = {
  'place-construction': () =>
    ground('#E9DCD3') +
    rect(120, 20, 10, 110, '#FFC233', 1) +
    rect(70, 16, 120, 10, '#FFC233', 1) +
    line(176, 26, 176, 58, INK, 3) +
    rect(166, 58, 20, 14, '#FF5A5F', 2) +
    path('M10 132 Q50 70 96 132 Z', '#A47864') +
    path('M40 132 L50 104 L60 132 Z', '#FF7A59') +
    path('M140 132 L150 104 L160 132 Z', '#FF7A59') +
    line(10, 140, 190, 140, '#FFC233', 6),
  'place-busdepot': () =>
    ground() +
    rect(20, 40, 120, 12, '#3D7BFF', 4) +
    line(30, 52, 30, 128) +
    line(130, 52, 130, 128) +
    rect(46, 104, 68, 10, '#A47864', 3) +
    line(166, 40, 166, 128, INK, 5) +
    circ(166, 36, 18, '#FFD43B', OUT) +
    rect(156, 30, 20, 12, '#3D7BFF', 3, ''),
  'place-fire': () =>
    ground() +
    path('M20 50 L100 14 L180 50 Z', '#D63A3F') +
    rect(26, 50, 148, 80, '#FF5A5F', 0) +
    path('M60 130 V92 Q100 60 140 92 V130 Z', '#FFD6D8') +
    [74, 92, 110, 128].map((x) => line(x, 82, x, 130, '#FF8A8E', 3)).join('') +
    circ(100, 36, 8, '#FFD43B', OUT),
  'place-police': () =>
    ground() +
    rect(20, 40, 160, 90, '#3D7BFF', 0) +
    rect(20, 32, 160, 12, '#2F5BD3', 2) +
    rect(88, 12, 24, 20, '#FF5A5F', 4) +
    `<polygon points="${starPoints(100, 70, 20, 9)}" fill="#FFD43B" ${OUT}/>` +
    rect(84, 96, 32, 34, '#CFE3FF', 3) +
    win(36, 60, 30, 26) +
    win(134, 60, 30, 26),
  'place-hospital': () =>
    ground() +
    rect(24, 30, 152, 100, '#F3F4F8', 0) +
    circ(100, 50, 16, '#3D7BFF', OUT) +
    `<text x="100" y="58" text-anchor="middle" font-size="24" font-weight="bold" font-family="sans-serif" fill="#fff">H</text>` +
    path('M100 96 C80 82 82 70 92 70 C97 70 100 75 100 75 C100 75 103 70 108 70 C118 70 120 82 100 96 Z', '#FF5A5F', '') +
    win(36, 76, 28, 24) +
    win(136, 76, 28, 24) +
    rect(84, 104, 32, 26, '#8EE3D3', 3),
  'place-farm': () =>
    ground() +
    rect(146, 40, 36, 90, '#B8C2D1', 16) +
    path('M24 60 L70 22 L116 60 V130 H24 Z', '#E0474C') +
    rect(52, 80, 36, 50, '#F3F4F8', 2) +
    line(52, 80, 88, 130, '#E0474C', 4) +
    line(88, 80, 52, 130, '#E0474C', 4) +
    line(120, 112, 200, 112, '#A47864', 4) +
    line(130, 104, 130, 130, '#A47864', 4),
  'place-railway': () =>
    ground('#D5C2B8') +
    rect(30, 40, 140, 70, '#FFD39A', 0) +
    path('M20 44 L100 14 L180 44 Z', '#7A5444') +
    circ(100, 64, 14, '#fff', OUT) +
    line(100, 64, 100, 55, INK, 3) +
    line(100, 64, 107, 67, INK, 3) +
    rect(88, 86, 24, 24, '#A47864', 2) +
    line(0, 128, 200, 128, '#6B4A3A', 4) +
    line(0, 146, 200, 146, '#6B4A3A', 4) +
    [10, 40, 70, 100, 130, 160, 190].map((x) => line(x - 6, 137, x + 6, 137, '#A47864', 6)).join(''),
  'place-recycling': () =>
    ground() +
    rect(14, 70, 50, 60, '#FF5A5F', 6) +
    rect(76, 70, 50, 60, '#3D7BFF', 6) +
    rect(138, 70, 50, 60, '#FFD43B', 6) +
    path('M39 84 L49 102 H29 Z M101 84 L111 102 H91 Z M163 84 L173 102 H153 Z', '#fff', '') +
    rect(10, 60, 58, 10, '#D63A3F', 3) +
    rect(72, 60, 58, 10, '#2F5BD3', 3) +
    rect(134, 60, 58, 10, '#F5A623', 3),
  'place-airport': () =>
    rect(0, 112, 200, 48, '#7DD3FC', 0, '') +
    rect(20, 40, 24, 74, '#E8ECF4', 2) +
    rect(12, 24, 40, 18, '#6AAEFF', 4) +
    `<g transform="translate(70 4) scale(0.6)">${VEHICLES.plane()}</g>` +
    `<g transform="translate(90 84) scale(0.5)">${VEHICLES.boat()}</g>`,
  'place-trace': () =>
    ground() +
    path('M10 150 C10 60 80 120 100 70 S170 20 190 30', 'none', 'stroke="#546e7a" stroke-width="30" fill="none" stroke-linecap="round"') +
    path('M10 150 C10 60 80 120 100 70 S170 20 190 30', 'none', 'stroke="#fff" stroke-width="4" stroke-dasharray="10 10" fill="none"') +
    circ(190, 30, 12, '#FF5A5F', OUT),
  'place-garage': () =>
    ground() +
    path('M14 56 L100 16 L186 56 Z', '#6C63FF') +
    rect(24, 56, 152, 74, '#B4B0FF', 0) +
    rect(46, 72, 108, 58, '#EEEDFF', 3) +
    [84, 96, 108, 120].map((y) => line(46, y, 154, y, '#B4B0FF', 3)).join(''),
};

const ALL = { ...VEHICLES, ...ANIMALS, ...CONCEPTS, ...PLACES, ...WORD_ART, ...PLACE_ART, ...CREATURES, ...PEOPLE, ...THINGS, ...PHONICS_ART, ...COMIC_ART };
for (const [name, fn] of Object.entries(SHAPES)) ALL[`shape-${name}`] = fn;
ALL['place-parking'] = () => PLACE_ART['place-parking']() + parkingCars(car);

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

const SHADOWED = new Set([
  ...Object.keys(VEHICLES),
  ...Object.keys(ANIMALS),
  ...Object.keys(WORD_ART).filter((k) => !FLOATING.has(k)),
  ...Object.keys(CREATURES).filter((k) => !FLOATING_CREATURES.has(k)),
  ...Object.keys(PEOPLE),
  ...Object.keys(THINGS).filter((k) => !['cloud', 'raincloud', 'rangoli', 'net', 'field', 'roti'].includes(k)),
  ...Object.keys(PHONICS_ART).filter((k) => k !== 'bee'),
]);
const groundShadow = '<ellipse cx="100" cy="128" rx="78" ry="7" fill="#1E1B4B" opacity="0.08"/>';

// "many:banana" draws three bananas: used for plurals (केला / केले).
// "book:monkey", "talk:trex" and the other ACTIVITY_ICONS put a creature into an activity icon.
const MANY = 'many:';
const composite = (id) => {
  const i = id.indexOf(':');
  return i > 0 && ACTIVITY_ICONS[id.slice(0, i)] && id.slice(i + 1) in ALL ? [ACTIVITY_ICONS[id.slice(0, i)], id.slice(i + 1)] : null;
};
export function pictureExists(id) {
  return typeof id === 'string' && (id in ALL || (id.startsWith(MANY) && id.slice(MANY.length) in ALL) || !!composite(id));
}

function body(id, color) {
  const comp = composite(id);
  if (comp) return comp[0](ALL[comp[1]](color));
  if (id.startsWith(MANY)) {
    const one = ALL[id.slice(MANY.length)](color);
    return [
      [0, 46],
      [90, 46],
      [45, 6],
    ]
      .map(([x, y]) => `<g transform="translate(${x} ${y}) scale(0.55)">${one}</g>`)
      .join('');
  }
  return (SHADOWED.has(id) ? groundShadow : '') + ALL[id](color);
}

export function picture(id, opts = {}) {
  if (!pictureExists(id)) return badge(opts.label, opts.color);
  const vb = id.startsWith('place-') ? '0 0 200 160' : '0 0 200 140';
  return svg(body(id, opts.color), vb);
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
      rect(14, 58, 172, 46, '#A66BFF', 18) +
      circ(100, 58, 46, '#A66BFF', OUT) +
      `<image href="${safe}" x="58" y="16" width="84" height="84" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>` +
      wheel(50, 108, 18) +
      wheel(150, 108, 18),
  );
}
