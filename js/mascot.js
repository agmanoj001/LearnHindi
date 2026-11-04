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
