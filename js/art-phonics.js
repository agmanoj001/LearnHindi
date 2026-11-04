// Pictures for the English phonics words (pig, hat, box, bug …). Same flat style and 200x140 grid.
import { INK, rect, circ, ell, path, eye } from './art-kit.js';

const st = (color, w) => `stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;

export const PHONICS_ART = {
  pig: () =>
    [62, 82, 118, 138].map((x) => rect(x, 90, 12, 30, '#F49BB0', 5)).join('') +
    ell(100, 84, 54, 32, '#FFB3C6') +
    path('M44 74 Q30 64 36 54 Q42 62 46 70', 'none', st('#F49BB0', 5)) +
    circ(150, 66, 26, '#FFB3C6') +
    path('M134 46 L138 30 L150 42 Z M160 42 L172 30 L172 48 Z', '#F49BB0') +
    eye(142, 60) +
    eye(162, 60) +
    ell(158, 76, 13, 9, '#F49BB0') +
    circ(154, 76, 2.5, '#C2627A') +
    circ(162, 76, 2.5, '#C2627A'),
  hat: () => ell(100, 104, 78, 16, '#3D7BFF') + path('M54 102 Q56 44 100 40 Q144 44 146 102 Z', '#5B8DEF') + rect(56, 82, 88, 14, '#FF5A5F') + ell(100, 102, 46, 8, '#2F5BD3', 'opacity="0.4"'),
  box: () => path('M44 60 L100 40 L156 60 L100 80 Z', '#E9B872') + path('M44 60 L100 80 V124 L44 104 Z', '#D9A55E') + path('M156 60 L100 80 V124 L156 104 Z', '#C98B3E') + path('M72 50 L128 70 V80', 'none', st('#B07A35', 5)),
  bug: () =>
    [70, 92, 114].map((x) => path(`M${x} 96 l-10 18 M${x + 12} 96 l10 18`, 'none', st(INK, 4))).join('') +
    ell(100, 82, 48, 32, '#FF5A5F') +
    path('M100 50 V114', 'none', st(INK, 3)) +
    [78, 120, 88, 112].map((x, i) => circ(x, i < 2 ? 72 : 96, 7, INK)).join('') +
    circ(146, 76, 18, INK) +
    path('M154 62 Q166 46 176 50 M146 60 Q150 42 160 40', 'none', st(INK, 3)) +
    circ(150, 72, 4, '#fff'),
  frog: () =>
    ell(100, 96, 58, 30, '#2EC27E') +
    ell(100, 104, 34, 18, '#A8EBC6') +
    circ(72, 62, 18, '#2EC27E') +
    circ(128, 62, 18, '#2EC27E') +
    circ(72, 60, 9, '#fff') +
    circ(128, 60, 9, '#fff') +
    circ(74, 61, 5, INK) +
    circ(130, 61, 5, INK) +
    path('M80 92 Q100 104 120 92', 'none', st(INK, 3)) +
    ell(52, 122, 18, 7, '#1F9D63') +
    ell(148, 122, 18, 7, '#1F9D63'),
  cake: () =>
    rect(48, 70, 104, 50, '#FFC2D6', 10) +
    path('M48 82 Q61 96 74 82 Q87 96 100 82 Q113 96 126 82 Q139 96 152 82 V76 Q152 70 146 70 H54 Q48 70 48 76 Z', '#fff') +
    rect(40, 116, 120, 8, '#E2E0F5', 4) +
    [76, 100, 124].map((x) => rect(x - 3, 44, 6, 26, '#3D7BFF', 3) + ell(x, 40, 5, 8, '#FFB020')).join(''),
  bee: () =>
    ell(82, 52, 22, 16, '#DCEFFF', 'opacity="0.95"') +
    ell(116, 50, 22, 16, '#DCEFFF', 'opacity="0.95"') +
    ell(100, 84, 46, 32, '#FFD43B') +
    path('M84 54 Q78 84 84 114 M108 54 Q102 84 108 114', 'none', st(INK, 10)) +
    path('M54 84 L40 84', 'none', st(INK, 4)) +
    circ(144, 80, 18, INK) +
    circ(150, 76, 4, '#fff') +
    path('M146 62 Q150 46 160 44 M140 64 Q138 48 128 44', 'none', st(INK, 3)),
  crown: () => path('M44 104 L36 46 L72 76 L100 36 L128 76 L164 46 L156 104 Z', '#FFB020') + rect(44, 100, 112, 18, '#F59F00', 4) + [36, 100, 164].map((x, i) => circ(x, i === 1 ? 36 : 46, 8, '#FF5A5F')).join('') + circ(100, 88, 8, '#3D7BFF'),
  fork: () => rect(94, 70, 12, 60, '#9AA3B5', 6) + path('M72 20 V56 Q72 74 100 74 Q128 74 128 56 V20', 'none', st('#B7BDCB', 9)) + path('M90 22 V60 M110 22 V60', 'none', st('#B7BDCB', 8)),
  jar: () => rect(62, 34, 76, 16, '#FF5A5F', 6) + path('M58 52 H142 Q150 52 150 62 V114 Q150 126 136 126 H64 Q50 126 50 114 V62 Q50 52 58 52 Z', '#CFEFFF', 'opacity="0.9"') + rect(56, 74, 88, 48, '#FFB020', 12) + rect(66, 60, 10, 50, '#fff', 5, 'opacity="0.6"'),
  coat: () => path('M70 30 L100 44 L130 30 L164 56 L150 76 L140 70 V126 H60 V70 L50 76 L36 56 Z', '#A66BFF') + path('M100 44 V126', 'none', st('#7E4BD6', 4)) + [64, 84, 104].map((y) => circ(108, y, 4, '#FFD43B')).join('') + path('M70 30 L100 60 L130 30', 'none', st('#7E4BD6', 5)),
  log: () => rect(30, 66, 130, 46, '#A0673F', 22) + ell(158, 89, 20, 23, '#E9B872') + ell(158, 89, 12, 14, '#C98B3E') + ell(158, 89, 5, 6, '#A0673F') + path('M50 80 H120 M60 98 H130', 'none', st('#8A5A44', 4)) + path('M90 66 Q96 50 108 50', 'none', st('#2EC27E', 5)) + ell(112, 48, 8, 5, '#4CC36A'),
};
