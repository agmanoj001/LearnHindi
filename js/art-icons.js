// Lesson icons that say what you'll do AND which world you're in: "book:monkey" is a storybook
// with a monkey popping out of it, "talk:trex" a dinosaur with a speech bubble of word blocks.
// The activity keeps the same shape in every grade (book = story, bubble = sentences, two cards =
// word pairs...), and the creature and colours change with the world, so no two grades look alike.
// All drawn on the same 200x140 grid as the other pictures.

const INK = '#2B2D42';
const at = (creature, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${creature}</g>`;
const glyph = (x, y, size, text, fill = INK) => `<text x="${x}" y="${y}" font-family="'Baloo 2', 'Noto Sans Devanagari', sans-serif" font-size="${size}" font-weight="800" fill="${fill}" text-anchor="middle">${text}</text>`;

export const ACTIVITY_ICONS = {
  // story: an open book, the creature popping out of the pages
  book: (c) =>
    `<ellipse cx="100" cy="130" rx="80" ry="6" fill="#1E1B4B" opacity="0.08"/>` +
    `<path d="M100 128 Q56 112 10 120 V64 Q56 56 100 70 Q144 56 190 64 V120 Q144 112 100 128 Z" fill="#FF8A3D"/>` +
    at(c, 52, -4, 0.48) +
    `<path d="M100 122 Q60 106 18 113 V62 Q60 54 100 68 Z" fill="#fff"/><path d="M100 122 Q140 106 182 113 V62 Q140 54 100 68 Z" fill="#F7F5FF"/>` +
    `<path d="M100 68 V122" stroke="#E0DCF5" stroke-width="3"/>` +
    [80, 90, 100].map((y) => `<path d="M30 ${y} Q58 ${y - 6} 88 ${y + 2}" stroke="#C9C3EE" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M112 ${y + 2} Q142 ${y - 6} 170 ${y}" stroke="#C9C3EE" stroke-width="4" fill="none" stroke-linecap="round"/>`).join(''),

  // sentences: a speech bubble full of word blocks
  talk: (c) =>
    `<path d="M78 10 H184 Q194 10 194 20 V74 Q194 84 184 84 H104 L86 102 L90 84 H78 Q68 84 68 74 V20 Q68 10 78 10 Z" fill="#fff" stroke="#E0DCF5" stroke-width="3"/>` +
    [
      [80, 24, 34, '#FF5A5F'],
      [118, 24, 26, '#3D7BFF'],
      [148, 24, 34, '#2EC27E'],
      [80, 52, 44, '#FFB020'],
      [128, 52, 30, '#A66BFF'],
    ]
      .map(([x, y, w, f]) => `<rect x="${x}" y="${y}" width="${w}" height="18" rx="7" fill="${f}"/>`)
      .join('') +
    at(c, -6, 54, 0.56),

  // word pairs: two cards joined by a link
  pair: (c) =>
    at(c, 58, -6, 0.42) +
    `<g transform="rotate(-8 50 84)"><rect x="14" y="44" width="72" height="84" rx="12" fill="#fff" stroke="#E0DCF5" stroke-width="3"/><rect x="28" y="64" width="44" height="12" rx="6" fill="#3D7BFF"/><rect x="28" y="86" width="32" height="10" rx="5" fill="#C9C3EE"/></g>` +
    `<g transform="rotate(8 150 84)"><rect x="114" y="44" width="72" height="84" rx="12" fill="#fff" stroke="#E0DCF5" stroke-width="3"/><rect x="128" y="64" width="44" height="12" rx="6" fill="#FF5A5F"/><rect x="128" y="86" width="32" height="10" rx="5" fill="#C9C3EE"/></g>` +
    `<path d="M84 90 Q100 76 116 90" stroke="#FFB020" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="100" cy="82" r="7" fill="#FFB020"/>`,

  // reading words: a word card with letters on it
  card: (c) =>
    `<rect x="76" y="22" width="114" height="92" rx="14" fill="#fff" stroke="#E0DCF5" stroke-width="3"/>` +
    glyph(133, 76, 44, 'शब्द', '#3D7BFF') +
    `<rect x="96" y="90" width="74" height="8" rx="4" fill="#C9C3EE"/>` +
    at(c, -8, 36, 0.52),

  // building words: letter blocks
  blocks: (c) =>
    at(c, -8, 30, 0.5) +
    [
      [86, 72, '#FF5A5F', 'क'],
      [124, 72, '#2EC27E', 'म'],
      [162, 72, '#3D7BFF', 'ल'],
      [105, 34, '#FFB020', 'अ'],
    ]
      .map(([x, y, f, t]) => `<rect x="${x - 18}" y="${y}" width="36" height="36" rx="6" fill="${f}"/>${glyph(x, y + 28, 26, t, '#fff')}`)
      .join(''),

  // matras: a big syllable on a card (one text run, so the matra joins its letter)
  matra: (c) =>
    `<rect x="92" y="14" width="100" height="100" rx="18" fill="#fff" stroke="#E0DCF5" stroke-width="3"/>` +
    `<rect x="108" y="96" width="68" height="8" rx="4" fill="#FF5A5F"/>` +
    glyph(142, 84, 56, 'का') +
    at(c, 0, 62, 0.42),

  // rhymes: music notes bouncing between two words
  rhyme: (c) =>
    at(c, 52, 46, 0.5) +
    `<path d="M40 30 V70" stroke="#A66BFF" stroke-width="6" stroke-linecap="round"/><ellipse cx="32" cy="72" rx="11" ry="8" fill="#A66BFF"/><path d="M40 30 Q54 34 58 46" stroke="#A66BFF" stroke-width="6" fill="none" stroke-linecap="round"/>` +
    `<path d="M160 18 V58 M184 12 V52 M160 18 L184 12" stroke="#FF5A5F" stroke-width="6" stroke-linecap="round"/><ellipse cx="152" cy="60" rx="10" ry="7" fill="#FF5A5F"/><ellipse cx="176" cy="54" rx="10" ry="7" fill="#FF5A5F"/>`,

  // finding: a magnifying glass over the creature
  find: (c) => at(c, 10, 14, 0.62) + `<circle cx="128" cy="62" r="34" fill="#fff" opacity="0.35" stroke="${INK}" stroke-width="9"/><path d="M152 88 L184 122" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M110 46 Q118 38 128 38" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`,
};
