// Festival stickers and story pictures (docs/ROADMAP.md 7.11), in the same flat style and 200x140 grid
// as the other word pictures: Holi's colour plate, a rakhi, Eid's moon and star, a Christmas tree, Lohri's
// fire, a Pongal pot boiling over, and an Onam flower carpet.
import { circ, ell, path, rect, starPoints } from './art-kit.js';

const OUT = 'stroke="#2B2D42" stroke-width="2.5" stroke-linejoin="round"';

export const FESTIVAL_ART = {
  // a plate of gulal: heaps of colour
  gulal: () =>
    ell(100, 104, 74, 16, '#E6E8EF', OUT) +
    ell(100, 100, 64, 11, '#F4F5F9') +
    path('M44 100 Q56 72 70 100 Z', '#FF4F79', OUT) +
    path('M70 100 Q84 64 100 100 Z', '#FFD43B', OUT) +
    path('M100 100 Q116 66 132 100 Z', '#2EC27E', OUT) +
    path('M126 100 Q142 74 156 100 Z', '#3D7BFF', OUT) +
    circ(60, 52, 5, '#FF4F79') +
    circ(96, 40, 4, '#FFD43B') +
    circ(132, 50, 5, '#2EC27E') +
    circ(150, 34, 3.5, '#A66BFF'),
  // a rakhi: a thread with a big flower in the middle
  rakhi: () =>
    path('M14 70 Q60 82 100 70 Q140 58 186 70', 'none', 'stroke="#FF5A5F" stroke-width="7" stroke-linecap="round"') +
    path('M14 70 Q60 82 100 70 Q140 58 186 70', 'none', 'stroke="#FFD43B" stroke-width="2.5" stroke-dasharray="6 6" stroke-linecap="round"') +
    [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx="100" cy="46" rx="11" ry="24" fill="#FF9F1C" ${OUT} transform="rotate(${a} 100 70)"/>`).join('') +
    circ(100, 70, 20, '#FFD43B', OUT) +
    circ(100, 70, 10, '#FF4F79') +
    circ(100, 70, 4, '#fff'),
  // Eid: the new moon and a star, with a lantern
  eidmoon: () =>
    path('M92 18 A52 52 0 1 0 140 104 A42 42 0 1 1 92 18 Z', '#FFD43B', OUT) +
    `<polygon points="${starPoints(150, 40, 16, 7)}" fill="#FFE45C" ${OUT}/>` +
    path('M150 70 V82', 'none', 'stroke="#2B2D42" stroke-width="2.5"') +
    path('M138 84 H162 L158 120 H142 Z', '#2EC27E', OUT) +
    rect(145, 90, 10, 20, '#FFE45C', 3, '') +
    ell(150, 122, 16, 4, '#1F8A57'),
  // a Christmas tree with a star, baubles and a present
  xmastree: () =>
    rect(92, 108, 16, 18, '#8A5A44', 2, OUT) +
    path('M100 22 L132 66 H118 L146 106 H54 L82 66 H68 Z', '#2EC27E', OUT) +
    `<polygon points="${starPoints(100, 22, 13, 5.5)}" fill="#FFD43B" ${OUT}/>` +
    circ(88, 60, 5, '#FF5A5F') +
    circ(112, 78, 5, '#3D7BFF') +
    circ(82, 94, 5, '#FFD43B') +
    circ(122, 96, 5, '#FF5A5F') +
    rect(138, 106, 24, 20, '#A66BFF', 3, OUT) +
    rect(147, 106, 6, 20, '#FFD43B', 0, '') +
    path('M150 106 Q142 96 146 100 M150 106 Q158 96 154 100', 'none', 'stroke="#FFD43B" stroke-width="3" stroke-linecap="round"'),
  // Lohri: a fire of logs, with sparks
  bonfire: () =>
    path('M56 120 L144 96', 'none', 'stroke="#8A5A44" stroke-width="14" stroke-linecap="round"') +
    path('M56 96 L144 120', 'none', 'stroke="#6E4532" stroke-width="14" stroke-linecap="round"') +
    path('M100 18 Q136 56 124 94 Q116 112 100 112 Q84 112 76 94 Q64 56 100 18 Z', '#FF7A1A', OUT) +
    path('M100 46 Q120 70 112 96 Q106 106 100 106 Q94 106 88 96 Q80 70 100 46 Z', '#FFC93C') +
    path('M100 72 Q108 86 104 100 H96 Q92 86 100 72 Z', '#FFF3B0') +
    circ(64, 40, 3.5, '#FFC93C') +
    circ(140, 32, 3, '#FF9F1C') +
    circ(150, 58, 2.5, '#FFC93C') +
    circ(52, 68, 2.5, '#FF9F1C'),
  // Pongal: a clay pot of sweet rice boiling over, with sugarcane
  pongalpot: () =>
    path('M150 128 L176 20', 'none', 'stroke="#7FB069" stroke-width="7" stroke-linecap="round"') +
    path('M160 128 L186 26', 'none', 'stroke="#5E8C4A" stroke-width="6" stroke-linecap="round"') +
    path('M58 62 Q48 120 100 126 Q152 120 142 62 Z', '#D9773A', OUT) +
    path('M62 82 H138', 'none', 'stroke="#FFD43B" stroke-width="5"') +
    path('M62 92 H138', 'none', 'stroke="#FF5A5F" stroke-width="3"') +
    ell(100, 62, 44, 10, '#B85E2B', OUT) +
    path('M62 60 Q70 30 86 42 Q96 22 110 40 Q126 28 138 60 Z', '#FFF8E7', OUT) +
    circ(80, 48, 3, '#E9D8A6') +
    circ(112, 44, 3, '#E9D8A6') +
    path('M64 66 Q60 80 66 86', 'none', 'stroke="#FFF8E7" stroke-width="6" stroke-linecap="round"'),
  // Onam: a pookalam, a round carpet of flower petals
  pookalam: () => {
    const rings = [
      [56, '#FF9F1C'],
      [46, '#FFD43B'],
      [36, '#FF4F79'],
      [26, '#FFF3E6'],
      [16, '#A66BFF'],
      [7, '#FFD43B'],
    ];
    let s = ell(100, 74, 62, 62, '#2EC27E', OUT);
    for (const [r, c] of rings) s += circ(100, 74, r, c);
    for (let i = 0; i < 12; i++) s += `<ellipse cx="100" cy="${74 - 41}" rx="5" ry="9" fill="#FF5A5F" transform="rotate(${i * 30} 100 74)"/>`;
    return s;
  },
};

// words for these pictures: Hindi and English (the stories and the festival stickers use them)
export const FESTIVAL_WORDS = {
  gulal: { hi: 'गुलाल', en: 'colour powder' },
  rakhi: { hi: 'राखी', en: 'rakhi' },
  eidmoon: { hi: 'ईद का चाँद', en: 'the Eid moon' },
  xmastree: { hi: 'क्रिसमस का पेड़', en: 'Christmas tree' },
  bonfire: { hi: 'लोहड़ी की आग', en: 'Lohri fire' },
  pongalpot: { hi: 'पोंगल की हांडी', en: 'Pongal pot' },
  pookalam: { hi: 'पूकलम', en: 'flower carpet' },
};
