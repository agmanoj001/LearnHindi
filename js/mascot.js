// The guide characters, one per world. Original designs, drawn in SVG with named parts so CSS can
// make them blink, talk while speech plays, bob, jump and do silly things when tapped.
import { el } from './ui.js';

const INK = '#2B2D42';

// shared face parts (viewBox 0 0 120 120)
const eye = (x, y, r = 7.5, lid = '#000') =>
  `<g class="m-eye"><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.12}" fill="#fff"/>` +
  `<circle class="m-pupil" cx="${x + 1}" cy="${y + 1}" r="${r * 0.55}" fill="${INK}"/>` +
  `<circle cx="${x + 2.6}" cy="${y - 1.6}" r="${r * 0.2}" fill="#fff"/>` +
  `<ellipse class="m-lid" cx="${x}" cy="${y}" rx="${r + 1}" ry="${r * 1.15 + 1}" fill="${lid}"/></g>`;
const mouth = (x, y, w = 12, open = '#7A2E3A') =>
  `<path class="m-mouth-closed" d="M${x - w / 2} ${y} Q${x} ${y + w * 0.6} ${x + w / 2} ${y}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>` +
  `<g class="m-mouth-open"><ellipse cx="${x}" cy="${y + 2}" rx="${w * 0.42}" ry="${w * 0.36}" fill="${open}"/><ellipse cx="${x}" cy="${y + 4}" rx="${w * 0.24}" ry="${w * 0.14}" fill="#FF8FA3"/></g>`;
const cheeks = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="5" ry="3.2" fill="#FF8FA3" opacity="0.55"/><ellipse cx="${x2}" cy="${y}" rx="5" ry="3.2" fill="#FF8FA3" opacity="0.55"/>`;
const shadow = '<ellipse class="m-shadow" cx="60" cy="114" rx="30" ry="5" fill="#1E1B4B" opacity="0.13"/>';
const svg = (inner) => `<svg viewBox="0 0 120 120" aria-hidden="true" class="m-svg">${shadow}<g class="m-body">${inner}</g></svg>`;

export const MASCOTS = {
  // Gappu, the chatty baby elephant who drives around Vehicle Town
  gappu: {
    name: { hi: 'गप्पू', en: 'Gappu' },
    pitch: 1.05,
    art: () =>
      svg(
        `<ellipse cx="60" cy="98" rx="24" ry="15" fill="#8EA6C8"/>` +
          `<rect x="44" y="102" width="11" height="12" rx="5" fill="#7C93B8"/><rect x="65" y="102" width="11" height="12" rx="5" fill="#7C93B8"/>` +
          `<g class="m-arm-l"><ellipse cx="22" cy="54" rx="19" ry="23" fill="#7C93B8"/><ellipse cx="24" cy="55" rx="12" ry="16" fill="#F6B8C8"/></g>` +
          `<g class="m-arm-r"><ellipse cx="98" cy="54" rx="19" ry="23" fill="#7C93B8"/><ellipse cx="96" cy="55" rx="12" ry="16" fill="#F6B8C8"/></g>` +
          `<circle cx="60" cy="56" r="33" fill="#9DB4D6"/>` +
          `<path d="M54 70 Q50 92 64 98 Q72 101 74 94 Q66 92 66 72 Z" fill="#9DB4D6"/>` +
          `<path d="M28 44 Q60 14 92 44 Q78 34 60 34 Q42 34 28 44 Z" fill="#FF5A5F"/><rect x="40" y="36" width="40" height="7" rx="3.5" fill="#D63A3F"/>` +
          eye(48, 54, 7.5, '#9DB4D6') +
          eye(72, 54, 7.5, '#9DB4D6') +
          cheeks(38, 82, 66) +
          mouth(60, 70, 10),
      ),
  },
  // Chiku, the cheeky monkey of the Jolly Jungle
  chiku: {
    name: { hi: 'चीकू', en: 'Chiku' },
    pitch: 1.2,
    art: () =>
      svg(
        `<path class="m-tail" d="M78 100 Q108 104 104 78 Q100 64 90 72" fill="none" stroke="#8A5A44" stroke-width="6" stroke-linecap="round"/>` +
          `<ellipse cx="60" cy="96" rx="22" ry="18" fill="#A0673F"/><ellipse cx="60" cy="99" rx="13" ry="12" fill="#F2C9A0"/>` +
          `<g class="m-arm-l"><path d="M40 90 Q24 84 26 70" fill="none" stroke="#A0673F" stroke-width="8" stroke-linecap="round"/></g>` +
          `<g class="m-arm-r"><path d="M80 90 Q96 84 94 70" fill="none" stroke="#A0673F" stroke-width="8" stroke-linecap="round"/><path d="M88 66 Q98 52 108 58 Q100 62 94 72 Z" fill="#FFD43B"/></g>` +
          `<circle cx="27" cy="50" r="12" fill="#A0673F"/><circle cx="27" cy="50" r="7" fill="#F2C9A0"/><circle cx="93" cy="50" r="12" fill="#A0673F"/><circle cx="93" cy="50" r="7" fill="#F2C9A0"/>` +
          `<circle cx="60" cy="50" r="31" fill="#A0673F"/>` +
          `<path d="M60 30 Q50 26 56 18 Q62 24 64 18 Q70 26 60 30 Z" fill="#8A5A44"/>` +
          `<path d="M60 40 Q74 34 82 44 Q88 58 76 70 Q60 80 44 70 Q32 58 38 44 Q46 34 60 40 Z" fill="#F2C9A0"/>` +
          eye(50, 50, 7, '#F2C9A0') +
          eye(70, 50, 7, '#F2C9A0') +
          cheeks(42, 78, 62) +
          mouth(60, 64, 14) +
          `<rect class="m-mouth-closed" x="57" y="65" width="6" height="4" rx="1" fill="#fff"/>`,
      ),
  },
  // Kuku, the little chick who runs the Animal Farm
  kuku: {
    name: { hi: 'कूकू', en: 'Kuku' },
    pitch: 1.35,
    art: () =>
      svg(
        `<path d="M50 106 V114 M44 114 H56 M70 106 V114 M64 114 H76" stroke="#F28C28" stroke-width="4" stroke-linecap="round"/>` +
          `<g class="m-arm-l"><ellipse cx="26" cy="76" rx="10" ry="16" fill="#F5C518" transform="rotate(25 26 76)"/></g>` +
          `<g class="m-arm-r"><ellipse cx="94" cy="76" rx="10" ry="16" fill="#F5C518" transform="rotate(-25 94 76)"/></g>` +
          `<ellipse cx="60" cy="68" rx="36" ry="40" fill="#FFD43B"/><ellipse cx="60" cy="84" rx="22" ry="18" fill="#FFE98A"/>` +
          `<path d="M56 28 Q54 14 62 12 Q60 20 66 16 Q66 26 60 30 Z" fill="#F5C518"/>` +
          eye(47, 56, 7.5, '#FFD43B') +
          eye(73, 56, 7.5, '#FFD43B') +
          cheeks(38, 82, 68) +
          `<path class="m-mouth-closed" d="M52 66 L60 74 L68 66 Z" fill="#FF9F43"/>` +
          `<g class="m-mouth-open"><path d="M52 64 L60 68 L68 64 Z" fill="#FF9F43"/><path d="M53 70 L60 78 L67 70 Z" fill="#F28C28"/></g>`,
      ),
  },
  // Dumdum, the clumsy, kind little dinosaur of Dino Valley
  dumdum: {
    name: { hi: 'डमडम', en: 'Dumdum' },
    pitch: 0.95,
    art: () =>
      svg(
        `<path class="m-tail" d="M40 96 Q12 100 6 84 Q22 92 40 84 Z" fill="#5CC46A"/>` +
          `<path d="M36 62 L42 50 L48 62 Z M48 54 L54 40 L60 54 Z M60 52 L66 38 L72 52 Z" fill="#2E9E52"/>` +
          `<ellipse cx="60" cy="88" rx="28" ry="24" fill="#6BD27A"/><ellipse cx="62" cy="94" rx="16" ry="15" fill="#C9F3B5"/>` +
          `<rect x="44" y="104" width="12" height="11" rx="5" fill="#4FB862"/><rect x="66" y="104" width="12" height="11" rx="5" fill="#4FB862"/>` +
          `<g class="m-arm-l"><path d="M38 84 Q30 82 30 74" fill="none" stroke="#4FB862" stroke-width="6" stroke-linecap="round"/></g>` +
          `<g class="m-arm-r"><path d="M84 84 Q92 82 92 74" fill="none" stroke="#4FB862" stroke-width="6" stroke-linecap="round"/></g>` +
          `<ellipse cx="66" cy="46" rx="34" ry="27" fill="#6BD27A"/>` +
          `<circle cx="84" cy="40" r="2" fill="#2E9E52"/><circle cx="90" cy="44" r="2" fill="#2E9E52"/>` +
          eye(56, 38, 8, '#6BD27A') +
          eye(78, 36, 6.5, '#6BD27A') +
          cheeks(46, 92, 54) +
          mouth(70, 56, 18) +
          `<path class="m-mouth-closed" d="M64 57 l3 4 l3 -4 Z M74 57 l3 4 l3 -4 Z" fill="#fff"/>`,
      ),
  },
  // Zoomi, the friendly robot who flies the Space Trip
  zoomi: {
    name: { hi: 'ज़ूमी', en: 'Zoomi' },
    pitch: 1.1,
    art: () =>
      svg(
        `<rect x="38" y="78" width="44" height="30" rx="12" fill="#9FB4FF"/><circle cx="60" cy="92" r="6" fill="#FFC93C"/>` +
          `<g class="m-arm-l"><path d="M38 86 Q24 86 22 74" fill="none" stroke="#7F95F0" stroke-width="7" stroke-linecap="round"/><circle cx="22" cy="72" r="5" fill="#FF6B9A"/></g>` +
          `<g class="m-arm-r"><path d="M82 86 Q96 86 98 74" fill="none" stroke="#7F95F0" stroke-width="7" stroke-linecap="round"/><circle cx="98" cy="72" r="5" fill="#FF6B9A"/></g>` +
          `<path d="M50 108 L46 116 H56 Z M70 108 L64 116 H74 Z" fill="#FF9F43"/>` +
          `<line x1="60" y1="22" x2="60" y2="10" stroke="#7F95F0" stroke-width="4"/><circle class="m-antenna" cx="60" cy="8" r="5" fill="#FF5A5F"/>` +
          `<rect x="24" y="22" width="72" height="56" rx="22" fill="#B4C6FF"/>` +
          `<rect x="32" y="30" width="56" height="40" rx="16" fill="#2B2D42"/>` +
          eye(48, 48, 7, '#2B2D42').replace('fill="#fff"', 'fill="#7CF7D4"') +
          eye(72, 48, 7, '#2B2D42').replace('fill="#fff"', 'fill="#7CF7D4"') +
          `<path class="m-mouth-closed" d="M52 62 Q60 67 68 62" fill="none" stroke="#7CF7D4" stroke-width="2.6" stroke-linecap="round"/>` +
          `<g class="m-mouth-open"><rect x="52" y="60" width="16" height="6" rx="3" fill="#7CF7D4"/></g>`,
      ),
  },
  // Ollu, the giggly octopus captain of the Ocean Voyage
  ollu: {
    name: { hi: 'ओलू', en: 'Ollu' },
    pitch: 1.15,
    art: () =>
      svg(
        `<g class="m-tentacles">` +
          [30, 44, 58, 72, 86]
            .map((x, i) => `<path d="M${x} 74 Q${x + (i % 2 ? 8 : -8)} 94 ${x} 104 Q${x - 4} 112 ${x + 6} 112" fill="none" stroke="#FF8FB1" stroke-width="9" stroke-linecap="round"/>`)
            .join('') +
          `</g>` +
          `<ellipse cx="58" cy="54" rx="38" ry="34" fill="#FF8FB1"/><ellipse cx="46" cy="40" rx="10" ry="7" fill="#FFC2D6"/>` +
          `<path d="M34 26 Q58 4 84 26 Z" fill="#fff"/><rect x="30" y="24" width="56" height="7" rx="3" fill="#3D7BFF"/>` +
          eye(46, 56, 8, '#FF8FB1') +
          eye(70, 56, 8, '#FF8FB1') +
          cheeks(36, 80, 68) +
          mouth(58, 70, 12),
      ),
  },
  // Pip, the penguin who counts everything in the Number Igloo
  pip: {
    name: { hi: 'पिप', en: 'Pip' },
    pitch: 1.2,
    art: () =>
      svg(
        `<path d="M46 108 L40 116 H56 Z M74 108 L66 116 H82 Z" fill="#FF9F43"/>` +
          `<g class="m-arm-l"><ellipse cx="28" cy="74" rx="8" ry="20" fill="#2B2D42" transform="rotate(20 28 74)"/></g>` +
          `<g class="m-arm-r"><ellipse cx="92" cy="74" rx="8" ry="20" fill="#2B2D42" transform="rotate(-20 92 74)"/></g>` +
          `<ellipse cx="60" cy="66" rx="34" ry="44" fill="#2B2D42"/><ellipse cx="60" cy="76" rx="24" ry="32" fill="#fff"/>` +
          `<ellipse cx="60" cy="44" rx="26" ry="20" fill="#fff"/>` +
          `<path d="M36 64 Q60 76 84 64 L84 72 Q60 84 36 72 Z" fill="#FF5A5F"/><rect x="72" y="70" width="9" height="20" rx="3" fill="#FF5A5F"/>` +
          eye(50, 44, 6.5, '#fff') +
          eye(70, 44, 6.5, '#fff') +
          cheeks(42, 78, 54) +
          `<path class="m-mouth-closed" d="M54 52 L60 58 L66 52 Z" fill="#FF9F43"/>` +
          `<g class="m-mouth-open"><path d="M54 50 L60 53 L66 50 Z" fill="#FF9F43"/><path d="M55 55 L60 61 L65 55 Z" fill="#F28C28"/></g>`,
      ),
  },
};

// Tiko, the clever owl in glasses who runs the Number Carnival
MASCOTS.tiko = {
  name: { hi: 'टीको', en: 'Tiko' },
  pitch: 1.1,
  art: () =>
    svg(
      `<path d="M47 106 l-5 8 h11 Z M73 106 l-5 8 h11 Z" fill="#FF9F43"/>` +
        `<g class="m-arm-l"><path d="M30 58 Q10 80 26 102 Q36 88 38 66 Z" fill="#3F6FD8"/></g>` +
        `<g class="m-arm-r"><path d="M90 58 Q110 80 94 102 Q84 88 82 66 Z" fill="#3F6FD8"/></g>` +
        `<path d="M30 34 L33 10 L50 26 Z M90 34 L87 10 L70 26 Z" fill="#3F6FD8"/>` +
        `<ellipse cx="60" cy="64" rx="35" ry="44" fill="#5B8DEF"/>` +
        `<ellipse cx="60" cy="82" rx="22" ry="24" fill="#DCE7FF"/>` +
        `<path d="M47 78 q4.3 5 8.6 0 q4.3 5 8.6 0 q4.3 5 8.6 0 M51 90 q4.5 5 9 0 q4.5 5 9 0" fill="none" stroke="#AFC6F7" stroke-width="2.4" stroke-linecap="round"/>` +
        `<circle cx="46" cy="46" r="15" fill="#fff" opacity="0.35"/><circle cx="74" cy="46" r="15" fill="#fff" opacity="0.35"/>` +
        eye(46, 46, 8.5, '#5B8DEF') +
        eye(74, 46, 8.5, '#5B8DEF') +
        `<circle cx="46" cy="46" r="14" fill="none" stroke="${INK}" stroke-width="3.5"/><circle cx="74" cy="46" r="14" fill="none" stroke="${INK}" stroke-width="3.5"/><path d="M58 44 Q60 40.5 62 44" stroke="${INK}" stroke-width="3" fill="none"/>` +
        cheeks(34, 86, 62) +
        `<path class="m-mouth-closed" d="M55 59 L60 67 L65 59 Z" fill="#FF9F43"/>` +
        `<g class="m-mouth-open"><path d="M55 57 L60 60 L65 57 Z" fill="#FF9F43"/><path d="M56 62 L60 69 L64 62 Z" fill="#F28C28"/></g>`,
    ),
};

// ---- guides for the newer worlds ----
const add = (id, hi, en, pitch, inner) => (MASCOTS[id] = { name: { hi, en }, pitch, art: () => svg(inner) });

// Buzz, the busy bee of the Letter Garden
add(
  'buzz',
  'बज़',
  'Buzz',
  1.25,
  `<g class="m-arm-l"><ellipse cx="26" cy="40" rx="20" ry="13" fill="#DCEFFF" opacity="0.95" transform="rotate(-30 26 40)"/></g>` +
    `<g class="m-arm-r"><ellipse cx="94" cy="40" rx="20" ry="13" fill="#DCEFFF" opacity="0.95" transform="rotate(30 94 40)"/></g>` +
    `<ellipse cx="60" cy="74" rx="36" ry="38" fill="#FFD43B"/>` +
    `<path d="M26 82 Q60 92 94 82 M28 100 Q60 110 92 100" stroke="${INK}" stroke-width="8" fill="none"/>` +
    `<path d="M48 38 Q40 16 30 14 M72 38 Q80 16 90 14" stroke="${INK}" stroke-width="3" fill="none"/><circle cx="30" cy="14" r="4" fill="${INK}"/><circle cx="90" cy="14" r="4" fill="${INK}"/>` +
    eye(48, 60, 8, '#FFD43B') +
    eye(72, 60, 8, '#FFD43B') +
    cheeks(38, 82, 72) +
    mouth(60, 72, 12),
);
// Kiki, the little dragon who looks after the Phonics Castle
add(
  'kiki',
  'कीकी',
  'Kiki',
  1.15,
  `<path class="m-tail" d="M84 100 Q112 104 108 80 L116 74 L104 72" fill="none" stroke="#2EC27E" stroke-width="8" stroke-linecap="round"/>` +
    `<g class="m-arm-l"><path d="M30 64 L6 44 L12 70 L2 74 L30 84 Z" fill="#7BE0A8"/></g>` +
    `<g class="m-arm-r"><path d="M90 64 L114 44 L108 70 L118 74 L90 84 Z" fill="#7BE0A8"/></g>` +
    `<ellipse cx="60" cy="88" rx="30" ry="24" fill="#2EC27E"/><ellipse cx="60" cy="94" rx="18" ry="16" fill="#C8F5DC"/>` +
    `<path d="M40 22 L46 6 L54 22 M66 22 L74 6 L80 22" fill="#FFB020"/>` +
    `<circle cx="60" cy="50" r="30" fill="#2EC27E"/><ellipse cx="60" cy="64" rx="18" ry="11" fill="#7BE0A8"/><circle cx="54" cy="62" r="2" fill="${INK}"/><circle cx="66" cy="62" r="2" fill="${INK}"/>` +
    eye(48, 44, 7.5, '#2EC27E') +
    eye(72, 44, 7.5, '#2EC27E') +
    cheeks(36, 84, 56) +
    mouth(60, 70, 12),
);
// Ooty, the camel who runs the Desert Fair
add(
  'ooty',
  'ऊटी',
  'Ooty',
  0.95,
  `<ellipse cx="62" cy="92" rx="34" ry="18" fill="#D9A55E"/><path d="M42 78 Q52 56 64 78 Q74 58 86 80" fill="#D9A55E"/>` +
    `<g class="m-arm-l"><rect x="38" y="100" width="9" height="16" rx="4" fill="#C98B3E"/></g><g class="m-arm-r"><rect x="76" y="100" width="9" height="16" rx="4" fill="#C98B3E"/></g>` +
    `<path d="M34 86 Q24 60 34 40" fill="none" stroke="#D9A55E" stroke-width="16" stroke-linecap="round"/>` +
    `<ellipse cx="38" cy="36" rx="22" ry="18" fill="#E2B373"/><ellipse cx="26" cy="44" rx="10" ry="8" fill="#F0CFA0"/>` +
    `<path d="M30 20 Q40 6 52 20" fill="#FF5A5F"/><circle cx="41" cy="10" r="4" fill="#FFD43B"/>` +
    eye(34, 32, 6, '#E2B373') +
    eye(48, 32, 6, '#E2B373') +
    mouth(26, 48, 9),
);
// Bholu, the bear who reads stories in the forest
add(
  'bholu',
  'भोलू',
  'Bholu',
  0.9,
  `<g class="m-arm-l"><ellipse cx="28" cy="88" rx="11" ry="16" fill="#8A5A44"/></g>` +
    `<g class="m-arm-r"><ellipse cx="92" cy="86" rx="11" ry="16" fill="#8A5A44"/><rect x="84" y="62" width="24" height="18" rx="3" fill="#3D7BFF" transform="rotate(-12 96 70)"/></g>` +
    `<ellipse cx="60" cy="92" rx="30" ry="22" fill="#A0673F"/><ellipse cx="60" cy="96" rx="18" ry="14" fill="#E9C9A0"/>` +
    `<circle cx="36" cy="24" r="11" fill="#A0673F"/><circle cx="84" cy="24" r="11" fill="#A0673F"/><circle cx="36" cy="24" r="5" fill="#E9C9A0"/><circle cx="84" cy="24" r="5" fill="#E9C9A0"/>` +
    `<circle cx="60" cy="48" r="30" fill="#A0673F"/><ellipse cx="60" cy="60" rx="14" ry="10" fill="#E9C9A0"/><ellipse cx="60" cy="55" rx="5" ry="3.5" fill="${INK}"/>` +
    eye(48, 44, 6.5, '#A0673F') +
    eye(72, 44, 6.5, '#A0673F') +
    cheeks(36, 84, 58) +
    mouth(60, 64, 10),
);
// Mitthu, the parrot who tells folktales at the palace
add(
  'mitthu',
  'मिट्ठू',
  'Mitthu',
  1.25,
  `<path d="M52 104 L46 118 M68 104 L74 118" stroke="#FF9F43" stroke-width="4" stroke-linecap="round"/>` +
    `<g class="m-arm-l"><path d="M34 60 Q18 86 36 104 Q42 84 44 66 Z" fill="#1F9D63"/></g>` +
    `<g class="m-arm-r"><path d="M86 60 Q102 86 84 104 Q78 84 76 66 Z" fill="#1F9D63"/></g>` +
    `<ellipse cx="60" cy="74" rx="28" ry="34" fill="#2EC27E"/><ellipse cx="60" cy="84" rx="16" ry="20" fill="#A8EBC6"/>` +
    `<path d="M50 16 Q60 2 70 16" fill="#FF5A5F"/>` +
    `<circle cx="60" cy="40" r="24" fill="#2EC27E"/><path d="M36 44 Q60 30 84 44" fill="none" stroke="#FF5A5F" stroke-width="3"/>` +
    eye(50, 36, 6.5, '#2EC27E') +
    eye(70, 36, 6.5, '#2EC27E') +
    `<path class="m-mouth-closed" d="M54 46 Q60 44 66 46 Q64 58 58 60 Q56 52 54 46 Z" fill="#FF5A5F"/>` +
    `<g class="m-mouth-open"><path d="M54 44 Q60 42 66 44 Q64 52 58 54 Z" fill="#FF5A5F"/><path d="M56 56 Q60 58 64 56 L60 62 Z" fill="#C2364A"/></g>`,
);
// Gauri, the calf who shows you round the village
add(
  'gauri',
  'गौरी',
  'Gauri',
  1.1,
  `<ellipse cx="60" cy="94" rx="30" ry="20" fill="#fff"/><ellipse cx="72" cy="90" rx="10" ry="8" fill="#8A5A44"/>` +
    `<g class="m-arm-l"><rect x="38" y="104" width="9" height="12" rx="4" fill="#F0E6DA"/></g><g class="m-arm-r"><rect x="74" y="104" width="9" height="12" rx="4" fill="#F0E6DA"/></g>` +
    `<path d="M34 26 Q24 12 30 6 M86 26 Q96 12 90 6" stroke="#E9B872" stroke-width="6" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="22" cy="40" rx="14" ry="7" fill="#fff" transform="rotate(-20 22 40)"/><ellipse cx="98" cy="40" rx="14" ry="7" fill="#fff" transform="rotate(20 98 40)"/>` +
    `<ellipse cx="60" cy="46" rx="28" ry="26" fill="#fff"/><ellipse cx="48" cy="34" rx="9" ry="7" fill="#8A5A44"/>` +
    `<ellipse cx="60" cy="64" rx="18" ry="11" fill="#FFC2D6"/><circle cx="54" cy="64" r="2.5" fill="#C2627A"/><circle cx="66" cy="64" r="2.5" fill="#C2627A"/>` +
    `<circle cx="60" cy="74" r="5" fill="#FFD43B"/>` +
    eye(48, 44, 6.5, '#fff') +
    eye(72, 44, 6.5, '#fff') +
    mouth(60, 70, 8),
);
// Himu, the snow leopard on Story Mountain
add(
  'himu',
  'हिमू',
  'Himu',
  1.0,
  `<path class="m-tail" d="M82 100 Q112 100 108 72 Q106 60 96 66" fill="none" stroke="#E6E9F2" stroke-width="10" stroke-linecap="round"/>` +
    `<g class="m-arm-l"><ellipse cx="38" cy="104" rx="10" ry="8" fill="#E6E9F2"/></g><g class="m-arm-r"><ellipse cx="82" cy="104" rx="10" ry="8" fill="#E6E9F2"/></g>` +
    `<ellipse cx="60" cy="90" rx="28" ry="20" fill="#F4F6FB"/>` +
    `<circle cx="34" cy="24" r="10" fill="#E6E9F2"/><circle cx="86" cy="24" r="10" fill="#E6E9F2"/>` +
    `<circle cx="60" cy="48" r="30" fill="#F4F6FB"/>` +
    [[42, 28], [78, 28], [36, 52], [84, 52], [60, 22], [52, 74], [70, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="none" stroke="#9AA3B5" stroke-width="2"/>`).join('') +
    `<path d="M55 58 H65 L60 64 Z" fill="#FF8FB1"/>` +
    eye(48, 46, 7, '#F4F6FB') +
    eye(72, 46, 7, '#F4F6FB') +
    cheeks(38, 82, 60) +
    mouth(60, 68, 10),
);
// Chintu, the squirrel who knows every word in Word City
add(
  'chintu',
  'चिंटू',
  'Chintu',
  1.3,
  `<path class="m-tail" d="M80 104 Q120 96 108 56 Q100 34 84 46 Q96 62 84 84 Z" fill="#C98B3E"/>` +
    `<g class="m-arm-l"><ellipse cx="44" cy="86" rx="7" ry="10" fill="#A0673F"/></g>` +
    `<g class="m-arm-r"><ellipse cx="76" cy="86" rx="7" ry="10" fill="#A0673F"/><ellipse cx="78" cy="78" rx="8" ry="6" fill="#8A5A44"/></g>` +
    `<ellipse cx="60" cy="92" rx="24" ry="20" fill="#B9773E"/><ellipse cx="60" cy="96" rx="14" ry="13" fill="#F0CFA0"/>` +
    `<path d="M38 26 L42 8 L52 22 M82 26 L78 8 L68 22" fill="#B9773E"/>` +
    `<circle cx="60" cy="46" r="26" fill="#B9773E"/><ellipse cx="60" cy="56" rx="14" ry="10" fill="#F0CFA0"/>` +
    `<path d="M40 40 H52 M68 40 H80" stroke="#fff" stroke-width="3" opacity="0.6"/>` +
    eye(50, 44, 6.5, '#B9773E') +
    eye(70, 44, 6.5, '#B9773E') +
    cheeks(40, 80, 56) +
    mouth(60, 60, 9) +
    `<rect class="m-mouth-closed" x="57" y="61" width="6" height="5" rx="1" fill="#fff"/>`,
);

// Bijli, Mishti's goat from the Grade 7 comics: eats everything, especially homework
add(
  'bijli',
  'बिजली',
  'Bijli',
  1.5,
  `<path class="m-tail" d="M84 92 q12 -6 8 -16" fill="none" stroke="#2B2D42" stroke-width="4" stroke-linecap="round"/>` +
    `<ellipse cx="60" cy="96" rx="26" ry="17" fill="#F4F1EA"/><path d="M66 84 q12 -2 14 8 q-8 6 -16 2 z" fill="#3B4252"/>` +
    `<rect x="44" y="104" width="8" height="12" rx="3" fill="#E7E2D6"/><rect x="68" y="104" width="8" height="12" rx="3" fill="#E7E2D6"/>` +
    `<path d="M42 30 Q34 12 46 8 Q42 20 48 30 Z" fill="#C9B79C"/><path d="M78 30 Q86 12 74 8 Q78 20 72 30 Z" fill="#C9B79C"/>` +
    `<g class="m-arm-l"><ellipse cx="28" cy="46" rx="14" ry="7" fill="#F4F1EA" transform="rotate(20 28 46)"/></g>` +
    `<g class="m-arm-r"><ellipse cx="92" cy="46" rx="14" ry="7" fill="#F4F1EA" transform="rotate(-20 92 46)"/></g>` +
    `<path d="M40 40 Q60 22 80 40 Q86 60 74 74 Q60 84 46 74 Q34 60 40 40 Z" fill="#F4F1EA"/>` +
    `<path d="M54 76 L58 92 L62 76 Z" fill="#C9B79C"/>` +
    eye(51, 50, 6.5, '#F4F1EA') +
    eye(69, 50, 6.5, '#F4F1EA') +
    `<ellipse cx="60" cy="66" rx="9" ry="6" fill="#FFB4C2"/>` +
    mouth(60, 70, 10) +
    `<rect x="54" y="84" width="12" height="8" rx="2" fill="#FF5A5F"/><circle cx="60" cy="96" r="4" fill="#FFD43B"/>`,
);
// Mausi, Detective Dadi's sharp-eyed cat from the Grade 8 comics
add(
  'mausi',
  'मौसी',
  'Mausi',
  1.4,
  `<path class="m-tail" d="M80 104 Q104 100 98 74" fill="none" stroke="#7B8494" stroke-width="7" stroke-linecap="round"/>` +
    `<path d="M40 112 Q34 84 48 72 H72 Q86 84 80 112 Z" fill="#9AA3B5"/><path d="M52 112 Q50 92 60 86 Q70 92 68 112 Z" fill="#E5E7EB"/>` +
    `<g class="m-arm-l"><path d="M34 34 L38 6 L54 24 Z" fill="#9AA3B5"/></g>` +
    `<g class="m-arm-r"><path d="M86 34 L82 6 L66 24 Z" fill="#9AA3B5"/></g>` +
    `<circle cx="60" cy="44" r="27" fill="#9AA3B5"/>` +
    `<path d="M50 20 v8 M60 18 v9 M70 20 v8" stroke="#6B7280" stroke-width="3" stroke-linecap="round"/>` +
    eye(49, 44, 7, '#9AA3B5') +
    eye(71, 44, 7, '#9AA3B5') +
    `<path d="M56 54 h8 l-4 4 z" fill="#FF8FA3"/>` +
    mouth(60, 60, 9) +
    `<path d="M44 56 l-16 -3 M44 60 l-16 3 M76 56 l16 -3 M76 60 l16 3" stroke="#2B2D42" stroke-width="1.6"/>` +
    `<circle cx="60" cy="74" r="3.5" fill="#FFD43B"/>`,
);

// Gyanu, the patient tortoise in round glasses who looks after the Grade 7 grammar library
add(
  'gyanu',
  'ज्ञानू',
  'Gyanu',
  0.85,
  `<g class="m-arm-l"><ellipse cx="30" cy="102" rx="11" ry="8" fill="#7DBE6A"/></g><g class="m-arm-r"><ellipse cx="90" cy="102" rx="11" ry="8" fill="#7DBE6A"/></g>` +
    `<path d="M22 100 Q22 62 60 60 Q98 62 98 100 Z" fill="#3F8F5A"/><path d="M22 100 H98" stroke="#2F6E45" stroke-width="5" stroke-linecap="round"/>` +
    [[42, 82], [60, 74], [78, 82], [51, 94], [69, 94]].map(([x, y]) => `<path d="M${x - 8} ${y} l4 -7 h8 l4 7 l-4 7 h-8 z" fill="#5FAF6E" stroke="#2F6E45" stroke-width="1.5"/>`).join('') +
    `<circle cx="60" cy="40" r="25" fill="#8ACB74"/>` +
    eye(50, 40, 6.5, '#8ACB74') +
    eye(70, 40, 6.5, '#8ACB74') +
    `<circle cx="50" cy="40" r="10" fill="none" stroke="#7F5539" stroke-width="2.6"/><circle cx="70" cy="40" r="10" fill="none" stroke="#7F5539" stroke-width="2.6"/>` +
    cheeks(40, 80, 52) +
    mouth(60, 54, 9) +
    `<g transform="translate(60 106)"><path d="M-16 -9 Q-8 -12 0 -8 Q8 -12 16 -9 V5 Q8 2 0 6 Q-8 2 -16 5 Z" fill="#FFF3B0" stroke="#E76F51" stroke-width="2"/><path d="M0 -8 V6" stroke="#E76F51" stroke-width="1.6"/></g>`,
);
// Chatur, the quick fox in goggles who runs the Grade 8 word lab
add(
  'chatur',
  'चतुर',
  'Chatur',
  1.2,
  `<path class="m-tail" d="M78 106 Q114 104 108 70 Q104 56 94 62 Q100 84 76 94 Z" fill="#F08A3C"/><path d="M104 66 Q104 56 94 62 Q98 68 100 74 Z" fill="#FFF7EC"/>` +
    `<g class="m-arm-l"><ellipse cx="42" cy="92" rx="7" ry="11" fill="#E0762B"/></g>` +
    `<g class="m-arm-r"><ellipse cx="78" cy="92" rx="7" ry="11" fill="#E0762B"/><path d="M80 74 h10 v6 l5 14 h-20 l5 -14 z" fill="#BDE8FF" stroke="#2B2D42" stroke-width="1.6"/><rect x="77" y="86" width="16" height="7" fill="#72EFDD" opacity="0.9"/></g>` +
    `<ellipse cx="60" cy="96" rx="22" ry="18" fill="#F08A3C"/><ellipse cx="60" cy="100" rx="12" ry="12" fill="#FFF7EC"/>` +
    `<path d="M36 34 L32 6 L54 22 Z" fill="#F08A3C"/><path d="M84 34 L88 6 L66 22 Z" fill="#F08A3C"/><path d="M38 28 L36 14 L48 22 Z" fill="#2B2D42"/><path d="M82 28 L84 14 L72 22 Z" fill="#2B2D42"/>` +
    `<path d="M32 40 Q34 18 60 18 Q86 18 88 40 Q86 62 60 74 Q34 62 32 40 Z" fill="#F08A3C"/>` +
    `<path d="M40 50 Q60 46 80 50 Q74 66 60 72 Q46 66 40 50 Z" fill="#FFF7EC"/>` +
    `<rect x="36" y="22" width="48" height="9" rx="4.5" fill="#577590"/><circle cx="48" cy="26" r="6" fill="#BDE8FF" stroke="#577590" stroke-width="2"/><circle cx="72" cy="26" r="6" fill="#BDE8FF" stroke="#577590" stroke-width="2"/>` +
    eye(50, 42, 6.5, '#F08A3C') +
    eye(70, 42, 6.5, '#F08A3C') +
    `<ellipse cx="60" cy="56" rx="4.5" ry="3.4" fill="#2B2D42"/>` +
    mouth(60, 62, 9),
);

// Moru, the proud peacock who struts about Birbal's court
add(
  'moru',
  'मोरू',
  'Moru',
  1.25,
  `<g class="m-tail">${[-60, -40, -20, 0, 20, 40, 60].map((a) => `<g transform="rotate(${a} 60 96)"><path d="M60 96 Q50 50 60 14 Q70 50 60 96 Z" fill="#0F9D8A"/><circle cx="60" cy="24" r="8" fill="#14B8A6"/><circle cx="60" cy="24" r="4.5" fill="#1D4ED8"/><circle cx="60" cy="24" r="2" fill="#FBBF24"/></g>`).join('')}</g>` +
    `<g class="m-arm-l"><ellipse cx="44" cy="92" rx="8" ry="14" fill="#1E40AF"/></g><g class="m-arm-r"><ellipse cx="76" cy="92" rx="8" ry="14" fill="#1E40AF"/></g>` +
    `<ellipse cx="60" cy="96" rx="18" ry="20" fill="#2563EB"/><path d="M54 116 v-6 M66 116 v-6" stroke="#B45309" stroke-width="3"/>` +
    `<path d="M52 82 Q50 60 60 46 Q70 60 68 82 Z" fill="#2563EB"/>` +
    `<circle cx="60" cy="44" r="16" fill="#2563EB"/>${[-8, 0, 8].map((dx) => `<path d="M${60 + dx} 30 l${dx / 3} -12" stroke="#1E3A8A" stroke-width="1.6"/><circle cx="${60 + dx * 1.33}" cy="17" r="3" fill="#14B8A6"/>`).join('')}` +
    eye(54, 43, 5, '#2563EB') +
    eye(66, 43, 5, '#2563EB') +
    `<path d="M57 50 L60 58 L63 50 Z" fill="#FBBF24" stroke="#B45309" stroke-width="1"/>` +
    mouth(60, 52, 6),
);
// Chippu, Kavya's literal-minded robot (in the comics he turns every idiom into a job)
add(
  'chippu',
  'चिप्पू',
  'Chippu',
  1.6,
  `<g class="m-arm-l"><path d="M34 86 Q20 92 18 104" fill="none" stroke="#94A3B8" stroke-width="7" stroke-linecap="round"/><circle cx="18" cy="106" r="6" fill="#64748B"/></g>` +
    `<g class="m-arm-r"><path d="M86 86 Q100 92 102 104" fill="none" stroke="#94A3B8" stroke-width="7" stroke-linecap="round"/><circle cx="102" cy="106" r="6" fill="#64748B"/></g>` +
    `<rect x="34" y="76" width="52" height="38" rx="12" fill="#38BDF8"/><rect x="44" y="84" width="32" height="18" rx="5" fill="#E0F2FE"/><path d="M48 94 l5 -5 l5 8 l5 -10 l5 7" fill="none" stroke="#E63946" stroke-width="2" stroke-linejoin="round"/>` +
    `<line x1="60" y1="18" x2="60" y2="8" stroke="#2B2D42" stroke-width="3"/><circle class="m-pupil" cx="60" cy="6" r="4.5" fill="#E63946"/>` +
    `<circle cx="22" cy="44" r="6" fill="#94A3B8"/><circle cx="98" cy="44" r="6" fill="#94A3B8"/>` +
    `<rect x="24" y="18" width="72" height="54" rx="15" fill="#E2E8F0"/><rect x="32" y="26" width="56" height="38" rx="10" fill="#1E293B"/>` +
    `<g class="m-eye"><rect x="44" y="36" width="7" height="11" rx="3.5" fill="#5EEAD4"/><rect class="m-lid" x="43" y="34" width="9" height="15" rx="4" fill="#1E293B"/></g>` +
    `<g class="m-eye"><rect x="69" y="36" width="7" height="11" rx="3.5" fill="#5EEAD4"/><rect class="m-lid" x="68" y="34" width="9" height="15" rx="4" fill="#1E293B"/></g>` +
    `<path class="m-mouth-closed" d="M52 54 q8 6 16 0" fill="none" stroke="#5EEAD4" stroke-width="3" stroke-linecap="round"/>` +
    `<g class="m-mouth-open"><path d="M50 52 q10 10 20 0 z" fill="#5EEAD4"/></g>`,
);
// Betal, the riddling spirit of the old peepal tree: a little spooky, mostly cheeky
add(
  'betal',
  'बेताल',
  'Betal',
  0.75,
  `<path class="m-tail" d="M40 78 Q34 100 44 110 Q54 118 62 110 Q70 116 78 108 Q90 96 80 78 Z" fill="#E2E8F0"/>` +
    `<g class="m-arm-l"><path d="M40 80 Q24 82 18 70" fill="none" stroke="#CBD5E1" stroke-width="6" stroke-linecap="round"/></g>` +
    `<g class="m-arm-r"><path d="M80 80 Q96 82 102 70" fill="none" stroke="#CBD5E1" stroke-width="6" stroke-linecap="round"/></g>` +
    `<path d="M26 50 Q12 22 34 20 Q30 4 50 10 Q58 -2 70 10 Q88 2 86 22 Q106 26 94 52 Q96 36 82 32 Q60 24 40 32 Q28 36 26 50 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>` +
    `<path d="M32 46 L20 36 L34 58 Z M88 46 L100 36 L86 58 Z" fill="#CBD5E1"/>` +
    `<circle cx="60" cy="52" r="26" fill="#CBD5E1"/>` +
    `<circle cx="50" cy="50" r="9" fill="#FDE68A"/><circle cx="70" cy="50" r="9" fill="#FDE68A"/>` +
    eye(50, 50, 6, '#CBD5E1') +
    eye(70, 50, 6, '#CBD5E1') +
    mouth(60, 64, 12) +
    `<path class="m-mouth-closed" d="M55 66 l2 4 l2 -4 M61 66 l2 4 l2 -4" fill="#fff" stroke="#2B2D42" stroke-width="1"/>`,
);
// Minku, the lab mouse in Master Murari's science room
add(
  'minku',
  'मिंकू',
  'Minku',
  1.45,
  `<path class="m-tail" d="M78 104 Q108 108 104 86 Q100 74 110 70" fill="none" stroke="#F9A8D4" stroke-width="4" stroke-linecap="round"/>` +
    `<g class="m-arm-l"><ellipse cx="44" cy="90" rx="6" ry="9" fill="#C7CED9"/></g><g class="m-arm-r"><ellipse cx="76" cy="90" rx="6" ry="9" fill="#C7CED9"/><path d="M80 74 h8 v5 l5 12 h-18 l5 -12 z" fill="#E0F2FE" stroke="#2B2D42" stroke-width="1.4"/><rect x="76" y="84" width="14" height="6" fill="#F472B6"/></g>` +
    `<ellipse cx="60" cy="96" rx="22" ry="18" fill="#D7DEE8"/><path d="M42 86 Q60 120 78 86 L74 112 H46 Z" fill="#FFFFFF" opacity="0.95"/>` +
    `<circle cx="34" cy="30" r="17" fill="#C7CED9"/><circle cx="34" cy="30" r="10" fill="#F9A8D4"/><circle cx="86" cy="30" r="17" fill="#C7CED9"/><circle cx="86" cy="30" r="10" fill="#F9A8D4"/>` +
    `<ellipse cx="60" cy="50" rx="26" ry="24" fill="#D7DEE8"/>` +
    eye(50, 47, 6, '#D7DEE8') +
    eye(70, 47, 6, '#D7DEE8') +
    `<circle cx="60" cy="60" r="4" fill="#F472B6"/><path d="M48 60 l-16 -3 M48 63 l-16 3 M72 60 l16 -3 M72 63 l16 3" stroke="#2B2D42" stroke-width="1.2"/>` +
    mouth(60, 66, 8),
);

export const MASCOT_IDS = Object.keys(MASCOTS);

export function mascotSvg(id) {
  return (MASCOTS[id] || MASCOTS.gappu).art();
}

// While any speech plays, every mascot on screen moves its mouth.
if (typeof window !== 'undefined') {
  window.addEventListener('vt-speaking', (e) => document.body.classList.toggle('speaking', !!e.detail));
}

const REACTIONS = { happy: 900, cheer: 900, oops: 800, silly: 1400, wave: 1200, dance: 2400, spin: 1000, sneeze: 1100 };

export function createMascot(id, { size = 'medium', onTap } = {}) {
  const node = el('button', { class: `mascot mascot-${id} ${size}`, 'aria-label': MASCOTS[id]?.name.en || 'friend', html: mascotSvg(id) });
  let timer = 0;
  const react = (kind) => {
    for (const k of Object.keys(REACTIONS)) node.classList.remove(`m-${k}`);
    void node.offsetWidth; // restart the animation
    node.classList.add(`m-${kind}`);
    clearTimeout(timer);
    timer = setTimeout(() => node.classList.remove(`m-${kind}`), REACTIONS[kind] || 900);
  };
  if (onTap) node.addEventListener('click', () => onTap());
  return { id, node, react, name: MASCOTS[id]?.name };
}
