// Full-screen backgrounds for each world. Elements with classes drift, twinkle, rise, sway,
// puff, fall or swim are animated by styles.css (and stand still with reduced motion).

let uid = 0;
const R = (n) => Math.round(n * 10) / 10;

function rnd(seed) {
  let a = seed;
  return () => {
    a = (a * 9301 + 49297) % 233280;
    return a / 233280;
  };
}

const sky = (id, top, bottom) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="400" height="800" fill="url(#${id})"/>`;

const cloud = (x, y, s, cls = 'drift') =>
  `<g class="${cls}" style="--d:${R(30 + s * 20)}s"><g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="10" rx="34" ry="14" fill="#fff" opacity="0.92"/><circle cx="-12" cy="2" r="16" fill="#fff" opacity="0.92"/><circle cx="10" cy="-2" r="20" fill="#fff" opacity="0.92"/></g></g>`;

const hills = (layers) => layers.map(([y, c, amp]) => `<path d="M0 ${y} Q100 ${y - amp} 200 ${y} T400 ${y} V800 H0 Z" fill="${c}"/>`).join('');

const SCENES = {
  hub: (id) => sky(id, '#F1EEFF', '#E8F7FF'),
  farm: (id) =>
    sky(id, '#9ED8FF', '#E6F7FF') +
    `<circle cx="330" cy="90" r="40" fill="#FFE27A"/><circle cx="330" cy="90" r="60" fill="#FFE27A" opacity="0.25"/>` +
    cloud(80, 110, 1) +
    cloud(250, 190, 0.7) +
    hills([
      [520, '#A6E07A', 60],
      [600, '#8BD164', 50],
      [700, '#76C255', 40],
    ]) +
    `<g transform="translate(270 440)"><path d="M0 40 L40 8 L80 40 V90 H0 Z" fill="#E24B4F"/><rect x="28" y="56" width="24" height="34" fill="#fff"/><path d="M28 56 L52 90 M52 56 L28 90" stroke="#E24B4F" stroke-width="3"/></g>` +
    `<g stroke="#C9A27E" stroke-width="5">${[20, 60, 100, 140, 180].map((x) => `<line x1="${x}" y1="560" x2="${x}" y2="600"/>`).join('')}<line x1="10" y1="572" x2="190" y2="572"/></g>` +
    `<g class="sway">${[40, 120, 330, 360].map((x, i) => `<circle cx="${x}" cy="${660 + (i % 2) * 30}" r="6" fill="${['#FF6B9A', '#FFD43B'][i % 2]}"/>`).join('')}</g>`,
  // Vehicle Town (Kindergarten): a pale skyline far away, houses with roofs and windows nearer, trees,
  // and traffic on the road. Each depth is its own layer, so the layers can drift at different speeds.
  town: (id) => {
    const far = [
      [0, 360, 54, 200],
      [60, 320, 40, 240],
      [108, 380, 58, 180],
      [176, 300, 46, 260],
      [232, 340, 60, 220],
      [300, 310, 44, 250],
      [350, 370, 60, 190],
    ];
    const houses = [
      [8, 470, 78, 120, '#FFD6A5', '#E2725B'],
      [96, 440, 64, 150, '#BDE0FE', '#5C7CFA'],
      [170, 486, 86, 104, '#FFC8DD', '#C2185B'],
      [266, 450, 60, 140, '#CDEAC0', '#3D9970'],
      [334, 476, 64, 114, '#FFF1A8', '#E0A100'],
    ];
    const house = ([x, y, w, h, wall, roof]) =>
      `<path d="M${x - 4} ${y + 2} L${x + w / 2} ${y - 30} L${x + w + 4} ${y + 2} Z" fill="${roof}"/>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wall}"/>` +
      Array.from({ length: Math.floor((h - 40) / 34) }, (_, row) =>
        [0, 1].map((c) => `<rect x="${x + 10 + c * (w - 32)}" y="${y + 14 + row * 34}" width="12" height="16" rx="2" fill="#7FB8FF"/>`).join(''),
      ).join('') +
      `<rect x="${x + w / 2 - 8}" y="${y + h - 26}" width="16" height="26" rx="3" fill="#8A5A44"/>`;
    const tree = (x, y, s) => `<g class="sway" style="--d:${R(5 + s)}s"><rect x="${x - 3}" y="${y}" width="6" height="${R(26 * s)}" fill="#8A5A44"/><circle cx="${x}" cy="${y - 4}" r="${R(16 * s)}" fill="#4CB963"/><circle cx="${x - 9 * s}" cy="${y + 4}" r="${R(11 * s)}" fill="#3FA956"/></g>`;
    const car = (cls, d, y, c, flip = false) =>
      `<g class="${cls}" style="--d:${d}s"><g transform="translate(${flip ? 460 : -60} ${y}) scale(${flip ? -0.32 : 0.32} 0.32)"><path d="M20 100 V76 Q20 65 34 63 L58 58 L78 34 Q82 30 90 30 H128 Q136 30 140 36 L158 60 L172 64 Q182 68 182 80 V100 Z" fill="${c}"/><path d="M84 40 H126 L146 62 H72 Z" fill="#CFEFFF"/><circle cx="56" cy="102" r="17" fill="#2B2D42"/><circle cx="148" cy="102" r="17" fill="#2B2D42"/></g></g>`;
    return (
      sky(id, '#B9D7FF', '#F0F6FF') +
      `<g class="layer far">${cloud(70, 90, 0.9)}${cloud(290, 150, 0.6)}<g fill="#D9D3FF" opacity="0.75">${far.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>`).join('')}</g></g>` +
      `<g class="layer mid">${houses.map(house).join('')}</g>` +
      hills([
        [600, '#A6E07A', 26],
        [660, '#8BD164', 20],
      ]) +
      `<g class="layer near">${tree(40, 600, 1.2)}${tree(150, 612, 0.9)}${tree(300, 604, 1.1)}${tree(372, 616, 0.8)}</g>` +
      `<rect x="0" y="690" width="400" height="60" fill="#5B6478"/><path d="M0 720 H400" stroke="#fff" stroke-width="5" stroke-dasharray="26 22"/>` +
      car('swim', 9, 690, '#FF5A5F') +
      car('swim back', 13, 712, '#FFB020', true)
    );
  },
  jungle: (id) =>
    sky(id, '#BFF0C8', '#EAFBE9') +
    `<circle cx="70" cy="80" r="34" fill="#FFF3A6" opacity="0.8"/>` +
    hills([
      [480, '#7DD08A', 50],
      [580, '#58BE6E', 60],
      [690, '#3FA95A', 40],
    ]) +
    `<g class="sway" style="--o:0% 0%">${[30, 120, 210, 300, 370]
      .map((x, i) => `<path d="M${x} -10 Q${x + 14} ${80 + i * 20} ${x - 6} ${150 + i * 30}" fill="none" stroke="#2E9E52" stroke-width="5"/><ellipse cx="${x - 6}" cy="${150 + i * 30}" rx="10" ry="6" fill="#4CC36A"/>`)
      .join('')}</g>` +
    `<g fill="#2E9E52">${[
      [-20, 600, 0],
      [400, 560, 180],
    ]
      .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0 Q80 -60 140 -10 Q80 10 0 0 Z"/><path d="M0 0 Q70 -120 130 -110 Q80 -40 0 0 Z" fill="#3FB868"/></g>`)
      .join('')}</g>` +
    `<g class="twinkle">${[60, 180, 260, 340].map((x, i) => `<circle cx="${x}" cy="${380 + i * 40}" r="4" fill="#FFF59D"/>`).join('')}</g>`,
  dino: (id) =>
    sky(id, '#FFD8A8', '#FFF1DE') +
    `<circle cx="300" cy="110" r="44" fill="#FFB86B" opacity="0.7"/>` +
    `<path d="M150 470 L230 250 L270 250 L350 470 Z" fill="#A9786A"/><path d="M230 250 L250 270 L270 250 Z" fill="#FF7A3D"/>` +
    `<g class="puff">${[0, 1, 2].map((i) => `<circle cx="${250 + i * 10}" cy="${220 - i * 34}" r="${18 + i * 6}" fill="#D9D2CC" opacity="0.8" style="animation-delay:${i * 0.8}s"/>`).join('')}</g>` +
    hills([
      [520, '#C7D97A', 50],
      [610, '#A9C95C', 40],
      [700, '#8DB84A', 30],
    ]) +
    `<g class="sway">${[
      [40, 600],
      [360, 640],
    ]
      .map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M0 0 V-90" stroke="#8A5A44" stroke-width="8"/>${[-60, -20, 20, 60].map((a) => `<path d="M0 -90 Q${a} -120 ${a * 1.4} -80" fill="none" stroke="#5CB85C" stroke-width="8" stroke-linecap="round"/>`).join('')}</g>`)
      .join('')}</g>`,
  space: (id) => {
    const r = rnd(7);
    let stars = '';
    for (let i = 0; i < 70; i++) stars += `<circle cx="${R(r() * 400)}" cy="${R(r() * 800)}" r="${R(0.8 + r() * 1.8)}" fill="#fff" class="${i % 3 ? '' : 'twinkle'}" style="animation-delay:${R(r() * 3)}s"/>`;
    return (
      sky(id, '#1B1449', '#4B2A8C') +
      stars +
      `<circle cx="320" cy="140" r="46" fill="#FF9F6B"/><ellipse cx="320" cy="140" rx="78" ry="14" fill="none" stroke="#FFD39A" stroke-width="6" transform="rotate(-18 320 140)"/>` +
      `<circle cx="70" cy="520" r="30" fill="#7DD3FC"/><circle cx="62" cy="512" r="8" fill="#5BB8E8"/>` +
      `<g class="swim" style="--d:12s"><path d="M-40 260 L0 250" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="2" cy="250" r="4" fill="#fff"/></g>` +
      `<path d="M0 760 Q200 690 400 760 V800 H0 Z" fill="#8A84C8"/><circle cx="90" cy="770" r="10" fill="#6E68B0"/><circle cx="300" cy="750" r="14" fill="#6E68B0"/>`
    );
  },
  ocean: (id) => {
    const r = rnd(11);
    let bubbles = '';
    for (let i = 0; i < 16; i++) bubbles += `<circle class="rise" cx="${R(20 + r() * 360)}" cy="${R(300 + r() * 480)}" r="${R(3 + r() * 6)}" fill="none" stroke="#fff" stroke-width="2" opacity="0.7" style="animation-delay:${R(r() * 6)}s;--d:${R(6 + r() * 6)}s"/>`;
    return (
      sky(id, '#7FD6FF', '#0B6FB8') +
      `<path d="M0 150 Q50 140 100 150 T200 150 T300 150 T400 150 V0 H0 Z" fill="#CFF1FF"/>` +
      `<g class="swim" style="--d:16s"><g transform="translate(-50 300)"><ellipse cx="0" cy="0" rx="18" ry="10" fill="#FFB52E"/><path d="M-16 0 L-30 -9 V9 Z" fill="#FFB52E"/></g></g>` +
      `<g class="swim" style="--d:22s;animation-delay:-8s"><g transform="translate(-50 470)"><ellipse cx="0" cy="0" rx="14" ry="8" fill="#FF8FB1"/><path d="M-12 0 L-24 -7 V7 Z" fill="#FF8FB1"/></g></g>` +
      bubbles +
      `<g class="sway">${[30, 90, 310, 370].map((x, i) => `<path d="M${x} 800 Q${x - 20} ${720 - i * 10} ${x} ${660 - i * 20} Q${x + 18} ${620 - i * 20} ${x} ${590 - i * 20}" fill="none" stroke="${i % 2 ? '#2EC27E' : '#1F9D63'}" stroke-width="9" stroke-linecap="round"/>`).join('')}</g>` +
      `<path d="M0 740 Q200 710 400 740 V800 H0 Z" fill="#F5D99A"/><circle cx="250" cy="760" r="6" fill="#FF8FB1"/>`
    );
  },
  igloo: (id) => {
    const r = rnd(5);
    let flakes = '';
    for (let i = 0; i < 26; i++) flakes += `<circle class="fall" cx="${R(r() * 400)}" cy="${R(-20 - r() * 300)}" r="${R(2 + r() * 3)}" fill="#fff" style="animation-delay:${R(r() * 8)}s;--d:${R(8 + r() * 6)}s"/>`;
    return (
      sky(id, '#BFE6FF', '#F2FBFF') +
      `<path d="M0 200 Q100 150 200 190 T400 170" fill="none" stroke="#A7F3D0" stroke-width="22" opacity="0.5"/><path d="M0 230 Q120 180 220 220 T400 200" fill="none" stroke="#C4B5FD" stroke-width="16" opacity="0.4"/>` +
      hills([
        [520, '#F7FBFF', 50],
        [620, '#E8F4FF', 40],
        [720, '#DCEEFF', 30],
      ]) +
      `<g transform="translate(250 470)"><path d="M0 70 Q0 0 60 0 Q120 0 120 70 Z" fill="#fff"/><path d="M10 40 H110 M20 20 H100 M30 55 V70 M60 0 V20 M90 55 V70 M45 20 V40 M75 20 V40" stroke="#CFE6F7" stroke-width="3"/><path d="M45 70 Q45 44 60 44 Q75 44 75 70 Z" fill="#7FB2D6"/></g>` +
      flakes
    );
  },
  // the Number Carnival: bunting, a turning big wheel, a striped tent and balloons floating up
  carnival: (id) => {
    const r = rnd(9);
    const colors = ['#FF5A5F', '#FFB020', '#3D7BFF', '#2EC27E', '#A66BFF', '#FF7AB6'];
    let bunting = '';
    for (const [y0, sag] of [
      [40, 40],
      [120, 30],
    ]) {
      bunting += `<path d="M-10 ${y0} Q200 ${y0 + sag * 2} 410 ${y0}" fill="none" stroke="#B9A5E8" stroke-width="2"/>`;
      for (let i = 0; i < 14; i++) {
        const x = -10 + i * 32 + 8;
        const t = (x + 10) / 420;
        const y = y0 + 4 * sag * t * (1 - t);
        bunting += `<path d="M${R(x)} ${R(y)} l16 0 l-8 18 z" fill="${colors[i % colors.length]}"/>`;
      }
    }
    let cabins = '';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      cabins += `<line x1="0" y1="0" x2="${R(84 * Math.cos(a))}" y2="${R(84 * Math.sin(a))}" stroke="#fff" stroke-width="3"/><circle cx="${R(84 * Math.cos(a))}" cy="${R(84 * Math.sin(a))}" r="13" fill="${colors[i % colors.length]}"/>`;
    }
    let balloons = '';
    for (let i = 0; i < 7; i++) {
      const x = R(20 + r() * 360);
      const y = R(600 + r() * 160);
      balloons += `<g class="rise" style="animation-delay:${R(r() * 9)}s;--d:${R(10 + r() * 6)}s"><ellipse cx="${x}" cy="${y}" rx="15" ry="18" fill="${colors[i % colors.length]}" opacity="0.9"/><path d="M${x} ${R(y + 18)} q-4 14 2 30" fill="none" stroke="#9AA3B5" stroke-width="1.5"/></g>`;
    }
    return (
      sky(id, '#FFE0F0', '#FFF6DA') +
      `<circle cx="330" cy="200" r="34" fill="#FFE27A"/>` +
      bunting +
      cloud(300, 260, 0.6) +
      `<g transform="translate(120 360)"><path d="M0 0 L-55 170 M0 0 L55 170" stroke="#8B93A7" stroke-width="8" stroke-linecap="round"/><circle r="92" fill="none" stroke="#FF8FB1" stroke-width="6"/><g class="turn">${cabins}</g><circle r="12" fill="#FFB020"/></g>` +
      `<g transform="translate(250 430)"><path d="M0 110 L60 10 L120 110 Z" fill="#fff"/>${[0, 1, 2, 3].map((i) => `<path d="M60 10 L${R(i * 30 + 3)} 110 L${R(i * 30 + 18)} 110 Z" fill="#FF5A5F"/>`).join('')}<path d="M60 10 V-14" stroke="#8B93A7" stroke-width="3"/><path d="M60 -14 l18 6 l-18 6 z" fill="#FFB020"/><path d="M45 110 Q60 76 75 110 Z" fill="#7A2E3A"/></g>` +
      hills([
        [560, '#A6E07A', 26],
        [650, '#8BD164', 22],
      ]) +
      balloons
    );
  },
  // Buzz's Letter Garden: flowers, a beehive and bees drifting about
  garden: (id) => {
    const colors = ['#FF5A5F', '#FFB020', '#A66BFF', '#FF7AB6', '#3D7BFF'];
    const flower = (x, y, c, s = 1) =>
      `<g class="sway" style="--d:${R(4 + (x % 3))}s"><path d="M${x} ${y} V${y + 60 * s}" stroke="#2E9E52" stroke-width="${5 * s}"/><g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-12" rx="8" ry="13" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="8" fill="#FFD43B"/></g></g>`;
    let flowers = '';
    for (let i = 0; i < 9; i++) flowers += flower(20 + i * 45, 600 + (i % 3) * 30, colors[i % colors.length], 0.9 + (i % 2) * 0.3);
    const bee = (x, y, d) => `<g class="swim" style="--d:${d}s"><g transform="translate(${x} ${y})"><ellipse cx="-4" cy="-8" rx="6" ry="4" fill="#fff" opacity="0.9"/><ellipse cx="4" cy="-8" rx="6" ry="4" fill="#fff" opacity="0.9"/><ellipse rx="10" ry="7" fill="#FFD43B"/><path d="M-3 -6 V6 M3 -6 V6" stroke="#2B2D42" stroke-width="2.5"/></g></g>`;
    return (
      sky(id, '#C9F0FF', '#F4FFF0') +
      `<circle cx="70" cy="90" r="38" fill="#FFE27A"/>` +
      cloud(260, 120, 0.8) +
      hills([
        [560, '#B5E88E', 40],
        [650, '#9ADB74', 30],
      ]) +
      `<g transform="translate(300 380)"><path d="M0 0 V40" stroke="#8A5A44" stroke-width="6"/><ellipse cx="0" cy="70" rx="38" ry="44" fill="#FFB020"/>${[50, 70, 90].map((y) => `<path d="M-36 ${y} Q0 ${y + 8} 36 ${y}" fill="none" stroke="#E08E0B" stroke-width="4"/>`).join('')}<ellipse cx="0" cy="92" rx="9" ry="7" fill="#7A4D16"/></g>` +
      flowers +
      bee(-40, 300, 13) +
      bee(-40, 470, 17)
    );
  },
  // Kiki's Phonics Castle: towers, flags and a rainbow
  castle: (id) =>
    sky(id, '#D7C9FF', '#FFF0F6') +
    `<path d="M-20 360 Q200 120 420 360" fill="none" stroke="#FF8FB1" stroke-width="16" opacity="0.5"/><path d="M0 360 Q200 145 400 360" fill="none" stroke="#FFD666" stroke-width="16" opacity="0.5"/><path d="M20 360 Q200 170 380 360" fill="none" stroke="#7DD3FC" stroke-width="16" opacity="0.5"/>` +
    cloud(60, 110, 0.9) +
    hills([
      [600, '#A6E07A', 30],
      [680, '#8BD164', 24],
    ]) +
    `<g transform="translate(110 360)">` +
    [
      [0, 80, 60, 180],
      [180, 80, 60, 180],
      [50, 120, 130, 140],
    ]
      .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#C7C2F2"/>` + Array.from({ length: Math.floor(w / 20) }, (_, i) => `<rect x="${x + i * 20}" y="${y - 12}" width="12" height="14" fill="#C7C2F2"/>`).join(''))
      .join('') +
    `<path d="M-6 80 L30 20 L66 80 Z M174 80 L210 20 L246 80 Z" fill="#A66BFF"/><path d="M30 20 V-6 M210 20 V-6" stroke="#6E768A" stroke-width="3"/><g class="sway"><path d="M30 -6 l22 7 l-22 7 z" fill="#FF5A5F"/><path d="M210 -6 l22 7 l-22 7 z" fill="#FFB020"/></g><path d="M95 260 V200 Q115 175 135 200 V260 Z" fill="#7A5AC8"/><rect x="18" y="120" width="22" height="30" rx="11" fill="#7DD3FC"/><rect x="198" y="120" width="22" height="30" rx="11" fill="#7DD3FC"/></g>`,
  // Desert Fair (Grade 2): dunes, a fort, camels and a hot-air balloon
  desert: (id) =>
    sky(id, '#FFD9A8', '#FFF4E0') +
    `<circle cx="310" cy="110" r="46" fill="#FFB86B" opacity="0.85"/>` +
    `<g class="drift" style="--d:50s"><g transform="translate(70 170)"><ellipse cx="0" cy="0" rx="30" ry="36" fill="#FF5A5F"/><path d="M-30 0 Q0 12 30 0 M-26 -18 Q0 -10 26 -18" stroke="#FFD666" stroke-width="5" fill="none"/><path d="M-14 32 L-8 52 M14 32 L8 52" stroke="#8A5A44" stroke-width="2"/><rect x="-10" y="50" width="20" height="14" rx="3" fill="#A0673F"/></g></g>` +
    `<g transform="translate(220 400)"><rect x="0" y="40" width="150" height="90" fill="#E0A86B"/><rect x="-10" y="20" width="40" height="110" fill="#D9985A"/><rect x="120" y="20" width="40" height="110" fill="#D9985A"/>${[0, 20, 40, 60, 80, 100, 120, 140].map((x) => `<rect x="${x}" y="30" width="12" height="12" fill="#E0A86B"/>`).join('')}<path d="M60 130 V90 Q75 72 90 90 V130 Z" fill="#7A4D36"/><path d="M-10 20 Q10 -6 30 20 M120 20 Q140 -6 160 20" fill="#D9985A"/></g>` +
    `<path d="M0 560 Q100 500 200 560 T400 540 V800 H0 Z" fill="#F2C27E"/><path d="M0 640 Q120 590 240 640 T400 630 V800 H0 Z" fill="#E8AE62"/><path d="M0 720 Q140 680 280 720 T400 710 V800 H0 Z" fill="#DB9B4E"/>` +
    `<g class="swim" style="--d:30s"><g transform="translate(-80 600)"><ellipse cx="0" cy="0" rx="30" ry="16" fill="#C98B3E"/><ellipse cx="0" cy="-16" rx="14" ry="10" fill="#C98B3E"/><path d="M26 -6 Q40 -40 52 -36 Q60 -34 56 -26" stroke="#C98B3E" stroke-width="10" fill="none" stroke-linecap="round"/>${[-20, -8, 8, 20].map((x) => `<path d="M${x} 10 V38" stroke="#B07A35" stroke-width="5"/>`).join('')}</g></g>`,
  // Bholu's Story Forest (Grade 2): tall pines, a stream and fireflies
  forest: (id) => {
    const r = rnd(13);
    let flies = '';
    for (let i = 0; i < 14; i++) flies += `<circle class="twinkle" cx="${R(r() * 400)}" cy="${R(300 + r() * 380)}" r="3" fill="#FFF59D" style="animation-delay:${R(r() * 3)}s"/>`;
    const pine = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-6" y="0" width="12" height="40" fill="#7A4D36"/><path d="M0 -110 L-40 -40 H-20 L-50 10 H50 L20 -40 H40 Z" fill="${c}"/></g>`;
    return (
      sky(id, '#B6E3D4', '#EAF8F1') +
      `<circle cx="300" cy="100" r="34" fill="#FFF3A6" opacity="0.9"/>` +
      [40, 120, 210, 300, 380].map((x, i) => pine(x, 470 + (i % 2) * 20, 1.1, '#3F8F6A')).join('') +
      hills([
        [560, '#7DCB8A', 30],
        [640, '#5DB873', 26],
      ]) +
      `<path d="M-10 720 Q120 680 200 710 T410 690" fill="none" stroke="#7FD6FF" stroke-width="26" opacity="0.8"/>` +
      [70, 340].map((x) => pine(x, 640, 1.4, '#2E7D55')).join('') +
      flies
    );
  },
  // Mitthu's Folktale Palace (Grade 3): domes, arches and lanterns
  palace: (id) =>
    sky(id, '#FFD3E1', '#FFF6EA') +
    cloud(80, 120, 0.8) +
    `<g transform="translate(40 330)"><rect x="40" y="110" width="240" height="200" fill="#FFF0D9"/><path d="M90 110 Q160 10 230 110 Z" fill="#FFB86B"/><circle cx="160" cy="38" r="6" fill="#FFD666"/><path d="M160 38 V20" stroke="#E08E0B" stroke-width="3"/>` +
    [0, 280].map((x) => `<rect x="${x}" y="70" width="40" height="240" fill="#FFE2BC"/><path d="M${x} 70 Q${x + 20} 30 ${x + 40} 70 Z" fill="#FF8FB1"/>`).join('') +
    [70, 130, 190].map((x) => `<path d="M${x} 300 V220 Q${x + 30} 180 ${x + 60} 220 V300 Z" fill="#E9B872"/>`).join('') +
    `</g>` +
    hills([[660, '#A6E07A', 18]]) +
    `<g class="sway">${[50, 350].map((x) => `<path d="M${x} 380 V420" stroke="#8A5A44" stroke-width="2"/><rect x="${x - 10}" y="420" width="20" height="28" rx="6" fill="#FF5A5F"/><rect x="${x - 6}" y="426" width="12" height="16" rx="4" fill="#FFD666" class="twinkle"/>`).join('')}</g>`,
  // Village walk (Grade 3): huts, fields, a well and a bullock cart
  village: (id) =>
    sky(id, '#BFE6FF', '#F3FBE8') +
    `<circle cx="320" cy="90" r="36" fill="#FFE27A"/>` +
    cloud(90, 120, 0.9) +
    cloud(240, 190, 0.6) +
    hills([
      [520, '#C5E88A', 40],
      [600, '#A9D96A', 30],
    ]) +
    `<g fill="#9BD15C">${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${640 + i * 18} H400" stroke="#86C24A" stroke-width="3"/>`).join('')}</g>` +
    [
      [60, 470],
      [240, 450],
    ]
      .map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="0" y="40" width="90" height="60" fill="#E9C9A0"/><path d="M-12 44 L45 0 L102 44 Z" fill="#B07A35"/><rect x="34" y="62" width="22" height="38" fill="#8A5A44"/></g>`)
      .join('') +
    `<g transform="translate(180 580)"><ellipse cx="0" cy="30" rx="30" ry="10" fill="#9AA3B5"/><rect x="-30" y="0" width="60" height="30" fill="#B7BDCB"/><path d="M-26 0 V-40 M26 0 V-40 M-30 -40 H30" stroke="#8A5A44" stroke-width="5"/></g>` +
    `<g class="sway">${[20, 380].map((x) => `<g transform="translate(${x} 560)"><path d="M0 0 V-80" stroke="#8A5A44" stroke-width="8"/>${[-50, -20, 20, 50].map((a) => `<path d="M0 -80 Q${a} -110 ${a * 1.3} -70" fill="none" stroke="#4CC36A" stroke-width="8" stroke-linecap="round"/>`).join('')}</g>`).join('')}</g>`,
  // Story Mountain (Grade 4): snowy peaks, prayer flags and an eagle gliding
  mountain: (id) =>
    sky(id, '#B9D7FF', '#EEF6FF') +
    `<path d="M-40 520 L90 260 L170 400 L250 230 L440 520 Z" fill="#8FA3C8"/><path d="M90 260 L60 320 L90 310 L115 330 Z M250 230 L215 300 L250 290 L290 310 Z" fill="#fff"/>` +
    `<path d="M40 330 Q200 300 360 330" fill="none" stroke="#9AA3B5" stroke-width="2"/>` +
    `<g class="sway">${['#3D7BFF', '#fff', '#FF5A5F', '#2EC27E', '#FFD43B', '#3D7BFF', '#fff', '#FF5A5F'].map((c, i) => `<rect x="${52 + i * 38}" y="${322 + Math.sin(i / 2) * 6}" width="22" height="18" fill="${c}"/>`).join('')}</g>` +
    `<g class="swim" style="--d:24s"><path d="M-60 200 q20 -14 40 0 q20 -14 40 0" fill="none" stroke="#5B4636" stroke-width="5" stroke-linecap="round"/></g>` +
    hills([
      [560, '#A3D9A0', 40],
      [650, '#86C988', 30],
    ]) +
    cloud(300, 140, 0.7),
  // Word City (Grade 4): towers, a flyover, lit windows and a kite
  city: (id) => {
    const r = rnd(17);
    const towers = [
      [0, 360, 70, 260, '#9C8FE6'],
      [70, 300, 60, 320, '#7DA2F5'],
      [130, 380, 80, 240, '#B38FE6'],
      [210, 260, 70, 360, '#6F8DE8'],
      [280, 340, 60, 280, '#9C8FE6'],
      [340, 300, 70, 320, '#7DA2F5'],
    ];
    let win = '';
    for (const [x, y, w, h] of towers) for (let yy = y + 16; yy < y + h - 20; yy += 26) for (let xx = x + 10; xx < x + w - 14; xx += 18) if (r() < 0.55) win += `<rect x="${xx}" y="${yy}" width="10" height="14" rx="2" fill="#FFE58A" class="${r() < 0.2 ? 'twinkle' : ''}"/>`;
    return (
      sky(id, '#FFC7A8', '#FFE9D6') +
      `<circle cx="80" cy="140" r="40" fill="#FFB86B" opacity="0.8"/>` +
      towers.map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`).join('') +
      win +
      `<rect x="0" y="600" width="400" height="16" fill="#6E768A"/>${[40, 140, 240, 340].map((x) => `<rect x="${x}" y="616" width="14" height="60" fill="#8B93A7"/>`).join('')}` +
      `<g class="swim" style="--d:10s"><g transform="translate(-80 588)"><rect x="0" y="0" width="70" height="14" rx="6" fill="#FF5A5F"/><rect x="72" y="0" width="70" height="14" rx="6" fill="#FF5A5F"/></g></g>` +
      `<rect x="0" y="700" width="400" height="100" fill="#5B6478"/>` +
      `<g class="sway"><path d="M300 200 l20 -26 l20 26 l-20 26 z" fill="#2EC27E"/><path d="M320 226 Q300 300 330 360" fill="none" stroke="#fff" stroke-width="1.5"/></g>`
    );
  },
};

// Comic worlds (Grades 7 and 8)
// Katahalpur, Mishti's small town: painted houses with balconies, a jackfruit tree and wires overhead
SCENES.kasba = (id) => {
  const houses = [
    [0, 360, 96, '#F9C74F', '#E76F51'],
    [96, 300, 104, '#90BE6D', '#577590'],
    [200, 340, 96, '#F8961E', '#9D4EDD'],
    [296, 280, 104, '#4CC9F0', '#F72585'],
  ];
  return (
    sky(id, '#FFD9A8', '#FFF4E0') +
    `<circle cx="300" cy="120" r="40" fill="#FFB703" opacity="0.85"/>` +
    cloud(80, 140, 0.8) +
    houses
      .map(
        ([x, y, w, c, door]) =>
          `<rect x="${x}" y="${y}" width="${w}" height="${640 - y}" fill="${c}"/><rect x="${x - 4}" y="${y - 10}" width="${w + 8}" height="12" fill="#7F5539"/>` +
          [0, 1].map((k) => `<rect x="${x + 14 + k * 44}" y="${y + 30}" width="26" height="34" rx="13" fill="#FFF3B0"/>`).join('') +
          `<rect x="${x + 8}" y="${y + 92}" width="${w - 16}" height="8" fill="#7F5539"/>` +
          [0, 1, 2, 3, 4].map((k) => `<rect x="${x + 12 + k * ((w - 24) / 4)}" y="${y + 100}" width="3" height="22" fill="#7F5539"/>`).join('') +
          `<rect x="${x + w / 2 - 14}" y="${590}" width="28" height="50" rx="12" fill="${door}"/>`,
      )
      .join('') +
    `<path d="M0 250 Q200 300 400 240" fill="none" stroke="#2B2D42" stroke-width="2"/><path d="M0 270 Q200 320 400 262" fill="none" stroke="#2B2D42" stroke-width="2"/>` +
    `<rect x="190" y="230" width="8" height="410" fill="#6B7280"/>` +
    `<g class="sway"><path d="M60 300 L60 250 L92 262 L60 274" fill="#FF9F1C"/></g>` +
    `<g transform="translate(340 560)"><rect x="-8" y="0" width="16" height="80" fill="#7F5539"/><circle cx="0" cy="-16" r="46" fill="#3A9D4A"/><circle cx="-30" cy="6" r="28" fill="#2F855A"/><ellipse cx="-14" cy="14" rx="9" ry="13" fill="#B5C33F"/><ellipse cx="16" cy="6" rx="9" ry="13" fill="#B5C33F"/></g>` +
    `<rect x="0" y="640" width="400" height="160" fill="#C9A27E"/><rect x="0" y="640" width="400" height="10" fill="#A47148"/>`
  );
};
// Detective Dadi's city at night: a moon, lit windows and a street lamp
SCENES.noir = (id) => {
  const r = rnd(29);
  const towers = [
    [0, 330, 80, '#24325E'],
    [80, 260, 70, '#2C3E73'],
    [150, 360, 90, '#233057'],
    [240, 240, 80, '#30437C'],
    [320, 310, 80, '#26365F'],
  ];
  let w = '';
  for (const [x, y, wd] of towers) for (let yy = y + 18; yy < 620; yy += 30) for (let xx = x + 10; xx < x + wd - 14; xx += 20) if (r() < 0.4) w += `<rect x="${xx}" y="${yy}" width="11" height="16" rx="2" fill="#FFE58A" class="${r() < 0.25 ? 'twinkle' : ''}"/>`;
  return (
    sky(id, '#0F1A3A', '#2A3B6E') +
    Array.from({ length: 30 }, () => `<circle cx="${R(r() * 400)}" cy="${R(r() * 260)}" r="${R(0.8 + r() * 1.6)}" fill="#fff" class="twinkle" style="animation-delay:${R(r() * 3)}s"/>`).join('') +
    `<circle cx="300" cy="130" r="44" fill="#FFF3B0"/><circle cx="282" cy="118" r="42" fill="#0F1A3A" opacity="0.92"/>` +
    towers.map(([x, y, wd, c]) => `<rect x="${x}" y="${y}" width="${wd}" height="${640 - y}" fill="${c}"/>`).join('') +
    w +
    `<path d="M70 640 L40 800 H180 L120 640 Z" fill="#FFE58A" opacity="0.14"/><rect x="88" y="480" width="8" height="160" fill="#6B7280"/><path d="M76 480 h32 l-6 14 h-20 z" fill="#FFE58A"/>` +
    `<rect x="0" y="640" width="400" height="160" fill="#1F2440"/><path d="M0 700 H400" stroke="#FFD43B" stroke-width="4" stroke-dasharray="26 22"/>`
  );
};

// Grammar worlds (Grades 7 and 8)
// Gyanu's library: tall shelves of books, a round window and letters drifting up like dust in the light
SCENES.library = (id) => {
  const r = rnd(41);
  const SPINES = ['#E76F51', '#F4A261', '#2A9D8F', '#577590', '#9D4EDD', '#F9C74F', '#43AA8B', '#F94144'];
  let books = '';
  for (const [x0, x1] of [[0, 128], [272, 400]])
    for (const y of [210, 330, 450, 570]) {
      for (let x = x0 + 6; x < x1 - 14; ) {
        const w = 10 + Math.floor(r() * 9);
        const h = 70 + Math.floor(r() * 30);
        books += `<rect x="${x}" y="${y + 100 - h}" width="${w}" height="${h}" rx="2" fill="${SPINES[Math.floor(r() * SPINES.length)]}"/><rect x="${x + 2}" y="${y + 112 - h}" width="${w - 4}" height="3" fill="#fff" opacity="0.5"/>`;
        x += w + 2;
      }
      books += `<rect x="${x0}" y="${y + 100}" width="${x1 - x0}" height="12" fill="#8B5E3C"/>`;
    }
  const letters = ['क', 'ख', 'ग', 'अ', 'आ', 'ज्ञ', 'श', 'म'];
  return (
    sky(id, '#FFF1D6', '#F7E1C1') +
    `<rect x="0" y="180" width="128" height="512" fill="#A47148"/><rect x="272" y="180" width="128" height="512" fill="#A47148"/>` +
    books +
    `<circle cx="200" cy="250" r="62" fill="#BDE8FF"/><circle cx="200" cy="250" r="62" fill="none" stroke="#8B5E3C" stroke-width="10"/><path d="M200 188 V312 M138 250 H262" stroke="#8B5E3C" stroke-width="6"/>` +
    `<path d="M160 312 L120 690 H280 L240 312 Z" fill="#FFE8A3" opacity="0.35"/>` +
    letters.map((ch, k) => `<text x="${150 + ((k * 37) % 100)}" y="${560 - k * 40}" font-size="${22 + (k % 3) * 6}" fill="#C08A4C" opacity="0.55" class="rise" style="--d:${9 + k}s;animation-delay:${-k * 1.3}s" text-anchor="middle">${ch}</text>`).join('') +
    `<rect x="0" y="690" width="400" height="110" fill="#C08A4C"/><rect x="0" y="690" width="400" height="8" fill="#8B5E3C"/>` +
    `<ellipse cx="200" cy="740" rx="120" ry="22" fill="#E76F51" opacity="0.8"/><ellipse cx="200" cy="740" rx="96" ry="15" fill="#F4A261" opacity="0.8"/>`
  );
};
// Chatur's word lab: a blackboard of word sums, jars of letters and bubbles rising from flasks
SCENES.lab = (id) => {
  const jars = [
    [26, 'उप', '#72EFDD'],
    [86, 'प्र', '#FFD166'],
    [300, 'ता', '#FF8FAB'],
    [356, 'ई', '#BDB2FF'],
  ];
  return (
    sky(id, '#E3F2FD', '#F1F7FF') +
    `<rect x="0" y="560" width="400" height="20" fill="#B0BEC5"/>` +
    `<rect x="110" y="170" width="180" height="120" rx="8" fill="#2F4F4F" stroke="#8B5E3C" stroke-width="8"/>` +
    `<text x="200" y="218" font-size="24" fill="#fff" opacity="0.85" text-anchor="middle">उप + कार</text><text x="200" y="258" font-size="24" fill="#FFE58A" opacity="0.9" text-anchor="middle">= उपकार</text>` +
    `<rect x="0" y="380" width="160" height="10" fill="#90A4AE"/><rect x="240" y="380" width="160" height="10" fill="#90A4AE"/>` +
    jars.map(([x, t, c]) => `<rect x="${x - 20}" y="318" width="40" height="62" rx="8" fill="${c}" opacity="0.75"/><rect x="${x - 22}" y="310" width="44" height="10" rx="3" fill="#78909C"/><text x="${x}" y="358" font-size="18" fill="#2B2D42" text-anchor="middle">${t}</text>`).join('') +
    [120, 200, 280]
      .map(
        (x, k) =>
          `<path d="M${x - 10} 470 v40 l-26 50 h72 l-26 -50 v-40 z" fill="#E1F5FE" stroke="#546E7A" stroke-width="3"/><path d="M${x - 30} 548 l-6 12 h72 l-6 -12 z" fill="${['#72EFDD', '#FFD166', '#FF8FAB'][k]}"/>` +
          [0, 1, 2].map((j) => `<circle cx="${x - 6 + j * 6}" cy="${460 - j * 12}" r="${4 + j}" fill="#fff" stroke="#90A4AE" class="rise" style="--d:${6 + j + k}s;animation-delay:${-(j + k)}s"/>`).join(''),
      )
      .join('') +
    `<rect x="0" y="580" width="400" height="220" fill="#CFD8DC"/>${[0, 80, 160, 240, 320].map((x) => `<rect x="${x}" y="580" width="40" height="220" fill="#B0BEC5" opacity="0.4"/>`).join('')}`
  );
};

// Comic worlds, second set (Grades 7 and 8)
// Birbal's court: tall cusped arches, hanging lamps, a throne under a canopy and a red carpet
SCENES.darbar = (id) => {
  const arch = (x, w, y, h) => `<path d="M${x} ${y + h} V${y + 60} Q${x} ${y + 10} ${x + w * 0.3} ${y + 4} Q${x + w / 2} ${y - 26} ${x + w * 0.7} ${y + 4} Q${x + w} ${y + 10} ${x + w} ${y + 60} V${y + h} Z" fill="#F5C26B" stroke="#B45309" stroke-width="6"/>`;
  return (
    sky(id, '#FFF3D6', '#FCE7B2') +
    [0, 134, 268].map((x) => arch(x + 12, 110, 170, 470) + `<rect x="${x - 6}" y="140" width="18" height="500" fill="#E9A84B"/>`).join('') +
    [67, 200, 333].map((x, i) => `<g class="sway" style="--d:${5 + i}s"><line x1="${x}" y1="0" x2="${x}" y2="120" stroke="#B45309" stroke-width="3"/><path d="M${x - 16} 120 h32 l-6 22 h-20 z" fill="#FBBF24" stroke="#B45309" stroke-width="3"/><circle cx="${x}" cy="150" r="6" fill="#FFE58A" class="twinkle"/></g>`).join('') +
    `<path d="M120 440 Q200 380 280 440 Z" fill="#DC2626" stroke="#7F1D1D" stroke-width="4"/><rect x="128" y="440" width="9" height="130" fill="#B45309"/><rect x="263" y="440" width="9" height="130" fill="#B45309"/><rect x="140" y="510" width="120" height="70" rx="14" fill="#B91C1C"/><rect x="128" y="566" width="144" height="34" rx="8" fill="#FBBF24"/><circle cx="200" cy="534" r="12" fill="#FBBF24"/>` +
    `<rect x="0" y="640" width="400" height="160" fill="#7F1D1D"/><rect x="0" y="640" width="400" height="12" fill="#FBBF24"/><path d="M140 800 L170 652 H230 L260 800 Z" fill="#B91C1C"/>`
  );
};
// Kavya's workshop: a robot blueprint, turning gears, shelves of parts and a workbench
SCENES.gadget = (id) =>
  sky(id, '#E0F2FE', '#F8FAFC') +
  `<rect x="40" y="110" width="200" height="150" rx="6" fill="#1D4ED8"/><g fill="none" stroke="#BFDBFE" stroke-width="3"><rect x="105" y="130" width="70" height="52" rx="10"/><rect x="100" y="190" width="80" height="54" rx="10"/><line x1="140" y1="130" x2="140" y2="116"/><path d="M100 200 l-30 30 M180 200 l30 30"/></g>` +
  [[310, 170, 34], [350, 230, 22], [300, 280, 18]].map(([x, y, r], i) => `<g class="sway" style="--d:${4 + i}s"><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#94A3B8" stroke-width="${r / 2.6}" stroke-dasharray="${r / 3} ${r / 4}"/><circle cx="${x}" cy="${y}" r="${r / 3}" fill="#94A3B8"/></g>`).join('') +
  [380, 470].map((y) => `<rect x="20" y="${y}" width="360" height="12" fill="#8A5A44"/>` + [40, 100, 160, 220, 280, 330].map((x, k) => `<rect x="${x}" y="${y - 30 - (k % 3) * 8}" width="34" height="${30 + (k % 3) * 8}" rx="5" fill="${['#FDE68A', '#93C5FD', '#F9A8D4', '#86EFAC'][k % 4]}"/>`).join('')).join('') +
  `<g class="twinkle"><circle cx="70" cy="560" r="10" fill="#FDE047"/></g><path d="M70 570 v20" stroke="#64748B" stroke-width="4"/>` +
  `<rect x="0" y="620" width="400" height="24" rx="4" fill="#8A5A44"/><rect x="0" y="644" width="400" height="156" fill="#A8A29E"/><rect x="20" y="644" width="18" height="100" fill="#6D4C41"/><rect x="362" y="644" width="18" height="100" fill="#6D4C41"/>`;
// the old peepal tree on a moonlit night, fireflies and a wisp of Betal's glow
SCENES.peepal = (id) => {
  const r = rnd(53);
  return (
    sky(id, '#0E1530', '#24305A') +
    Array.from({ length: 34 }, () => `<circle cx="${R(r() * 400)}" cy="${R(r() * 300)}" r="${R(0.8 + r() * 1.5)}" fill="#fff" class="twinkle" style="animation-delay:${R(r() * 3)}s"/>`).join('') +
    `<circle cx="300" cy="140" r="48" fill="#FFF7D6"/><circle cx="300" cy="140" r="80" fill="#FFF7D6" opacity="0.1"/>` +
    `<path d="M0 640 Q120 610 260 630 T400 626 V800 H0 Z" fill="#1B2240"/>` +
    `<path d="M110 800 Q130 620 110 480 Q96 400 40 340 M124 470 Q190 380 290 360 M114 560 Q50 520 0 530" fill="none" stroke="#3B2F2F" stroke-width="34" stroke-linecap="round"/>` +
    `<path d="M110 800 Q130 620 110 480" fill="none" stroke="#4A3B32" stroke-width="18" stroke-linecap="round"/>` +
    `<g fill="#1C3527">${[[30, 280, 90], [150, 250, 100], [270, 320, 80], [0, 420, 60]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}"/>`).join('')}</g>` +
    [180, 220, 250].map((x, i) => `<path d="M${x} ${372 + i * 2} V${470 + i * 20}" stroke="#2F2A28" stroke-width="3" class="sway" style="--d:${6 + i}s"/>`).join('') +
    `<g class="puff" style="--d:7s"><ellipse cx="230" cy="520" rx="26" ry="34" fill="#E2E8F0" opacity="0.35"/></g>` +
    Array.from({ length: 12 }, () => `<circle cx="${R(160 + r() * 230)}" cy="${R(480 + r() * 260)}" r="3" fill="#FDE68A" class="twinkle" style="animation-delay:${R(r() * 3)}s"/>`).join('')
  );
};
// a village square: the big banyan with its platform, the panchayat board, a hand pump, bicycles
SCENES.chaupal = (id) =>
  sky(id, '#BFE6FF', '#FFF7E6') +
  cloud(80, 120, 0.9) +
  cloud(300, 200, 0.7) +
  `<path d="M0 560 Q200 530 400 560 V800 H0 Z" fill="#D9B97E"/>` +
  `<g transform="translate(150 320)"><rect x="-18" y="100" width="36" height="200" fill="#7C4A2A"/>${[-60, -30, 40, 70].map((x) => `<path d="M${x} 150 V300" stroke="#6B3F22" stroke-width="4"/>`).join('')}<circle cx="0" cy="60" r="110" fill="#3F7D3A"/><circle cx="-100" cy="110" r="70" fill="#4A8C42"/><circle cx="100" cy="100" r="74" fill="#4A8C42"/></g>` +
  `<rect x="40" y="600" width="230" height="40" rx="4" fill="#C9A27E"/><rect x="34" y="594" width="242" height="12" rx="3" fill="#A47148"/>` +
  `<g transform="translate(300 470)"><rect x="-6" y="0" width="8" height="150" fill="#8A5A44"/><rect x="74" y="0" width="8" height="150" fill="#8A5A44"/><rect x="-14" y="-40" width="104" height="44" rx="6" fill="#fff"/><text x="38" y="-12" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-size="18" font-weight="800" fill="#B45309">पंचायत</text></g>` +
  `<g transform="translate(330 700)"><rect x="-6" y="-70" width="14" height="70" fill="#475569"/><path d="M8 -64 l30 -14" stroke="#475569" stroke-width="7" stroke-linecap="round"/></g>`;

// a city housing colony: apartment blocks with balconies, washing lines and kites, a water tank,
// bougainvillea at the gate, and a chalk-drawn cricket wicket in the courtyard
SCENES.colony = (id) =>
  sky(id, '#BDE3FF', '#FFF6E5') +
  cloud(90, 110, 0.8) +
  cloud(300, 170, 0.6) +
  [[10, 300, '#FDE68A', 150], [150, 240, '#FBCFE8', 110], [270, 320, '#BAE6FD', 130]].map(([x, y, col, w]) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${640 - y}" fill="${col}"/>` +
    [0, 1, 2, 3, 4].filter((k) => y + 30 + k * 70 < 600).map((k) => `<rect x="${x + 14}" y="${y + 30 + k * 70}" width="${w * 0.3}" height="36" rx="3" fill="#93C5FD"/><rect x="${x + w * 0.55}" y="${y + 30 + k * 70}" width="${w * 0.3}" height="36" rx="3" fill="#93C5FD"/><rect x="${x + 8}" y="${y + 66 + k * 70}" width="${w - 16}" height="7" fill="#94A3B8"/>`).join('')
  ).join('') +
  `<rect x="300" y="270" width="64" height="40" rx="6" fill="#334155"/><rect x="306" y="262" width="52" height="10" rx="3" fill="#475569"/>` +
  `<path d="M160 300 Q205 318 250 300" fill="none" stroke="#475569" stroke-width="2"/>${[170, 192, 214, 234].map((x, i) => `<rect x="${x}" y="306" width="14" height="20" rx="2" fill="${['#F43F5E', '#FACC15', '#22C55E', '#38BDF8'][i]}" class="sway" style="--d:${4 + i}s"/>`).join('')}` +
  `<g class="drift" style="--d:40s"><path d="M60 170 l18 -22 l18 22 l-18 22 z" fill="#F43F5E"/><path d="M78 192 q-8 30 6 60" fill="none" stroke="#475569" stroke-width="1.4"/></g>` +
  `<path d="M0 640 H400 V800 H0 Z" fill="#D6D3D1"/><rect x="0" y="632" width="400" height="10" fill="#A8A29E"/>` +
  `<g>${[[30, 600], [56, 580], [80, 606], [44, 624]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="#E879F9"/>`).join('')}<rect x="50" y="620" width="10" height="30" fill="#8A5A44"/></g>` +
  `<g fill="#FFFFFF">${[300, 318, 336].map((x) => `<rect x="${x}" y="680" width="6" height="60"/>`).join('')}<rect x="296" y="676" width="46" height="5"/></g>`;

export const THEMES = Object.keys(SCENES);

// Small ambient life on top of the outdoor worlds (docs/ROADMAP.md 5.2): birds crossing the sky, a
// butterfly over the grass, leaves falling in the woods. It sits in the "near" layer, in front of the scene.
const bird = (y, d, delay, s = 1) =>
  `<g class="swim" style="--d:${d}s;animation-delay:-${delay}s"><g transform="translate(-40 ${y}) scale(${s})"><g class="flap"><path d="M0 0 Q6 -7 12 0 Q18 -7 24 0" fill="none" stroke="#3B4252" stroke-width="2.4" stroke-linecap="round"/></g></g></g>`;
const butterfly = (x, y, c, delay) =>
  `<g class="flutter" style="animation-delay:-${delay}s"><g transform="translate(${x} ${y})"><g class="flap-x"><ellipse cx="-6" cy="-3" rx="7" ry="9" fill="${c}"/><ellipse cx="6" cy="-3" rx="7" ry="9" fill="${c}"/><ellipse cx="-4" cy="7" rx="4" ry="5" fill="${c}"/><ellipse cx="4" cy="7" rx="4" ry="5" fill="${c}"/></g><rect x="-1.2" y="-8" width="2.4" height="18" rx="1.2" fill="#3B4252"/></g></g>`;
const leaf = (x, d, delay, c) =>
  `<g class="fall leaf" style="--d:${d}s;animation-delay:-${delay}s"><path transform="translate(${x} -20)" d="M0 0 C6 -8 16 -6 16 0 C16 6 6 8 0 0 Z" fill="${c}"/></g>`;
const AMBIENT = {
  birds: bird(150, 26, 4) + bird(176, 26, 6, 0.8) + bird(250, 34, 20, 0.7),
  butterflies: butterfly(90, 640, '#FF8FB1', 0) + butterfly(310, 600, '#FFD43B', 3),
  leaves: [40, 130, 220, 330].map((x, i) => leaf(x, 12 + i * 2, i * 3.3, ['#E0A100', '#4CB963', '#D9622B', '#7CC27F'][i])).join(''),
};
const LIFE = {
  farm: ['birds', 'butterflies'],
  town: ['birds', 'butterflies'],
  garden: ['birds', 'butterflies'],
  jungle: ['birds', 'leaves'],
  forest: ['birds', 'leaves'],
  village: ['birds', 'butterflies'],
  carnival: ['birds'],
  castle: ['birds'],
  mountain: ['birds'],
  desert: ['birds'],
  dino: ['birds', 'leaves'],
  palace: ['birds', 'butterflies'],
  peepal: ['leaves'],
  chaupal: ['birds'],
  colony: ['birds'],
};
export const ambientLife = (theme) => (LIFE[theme] || []).map((k) => AMBIENT[k]).join('');

// `crop: 'bottom'` keeps the ground in view (used by the short world cards on the hub).
export function sceneSvg(theme, { crop = 'middle' } = {}) {
  const id = `sky${++uid}`;
  const align = crop === 'bottom' ? 'xMidYMax' : 'xMidYMid';
  const life = crop === 'bottom' ? '' : ambientLife(theme);
  return `<svg viewBox="0 0 400 800" preserveAspectRatio="${align} slice" aria-hidden="true">${(SCENES[theme] || SCENES.hub)(id)}${life ? `<g class="layer near life">${life}</g>` : ''}</svg>`;
}
