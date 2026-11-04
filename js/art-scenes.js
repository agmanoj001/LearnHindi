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
  town: (id) =>
    sky(id, '#B9D7FF', '#F0F6FF') +
    cloud(70, 90, 0.9) +
    cloud(290, 150, 0.6) +
    `<g fill="#C9C3FF" opacity="0.7">${[
      [10, 380, 50, 160],
      [70, 330, 40, 210],
      [120, 400, 60, 140],
      [190, 350, 46, 190],
      [250, 300, 54, 240],
      [315, 380, 70, 160],
    ]
      .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>`)
      .join('')}</g>` +
    hills([
      [560, '#A6E07A', 30],
      [640, '#8BD164', 24],
    ]) +
    `<rect x="0" y="690" width="400" height="60" fill="#5B6478"/><path d="M0 720 H400" stroke="#fff" stroke-width="5" stroke-dasharray="26 22"/>` +
    `<g class="swim" style="--d:9s"><g transform="translate(-60 690) scale(0.35)"><path d="M20 100 V76 Q20 65 34 63 L58 58 L78 34 Q82 30 90 30 H128 Q136 30 140 36 L158 60 L172 64 Q182 68 182 80 V100 Z" fill="#FF5A5F"/><circle cx="56" cy="102" r="17" fill="#2B2D42"/><circle cx="148" cy="102" r="17" fill="#2B2D42"/></g></g>`,
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
};

export const THEMES = Object.keys(SCENES);

// `crop: 'bottom'` keeps the ground in view (used by the short world cards on the hub).
export function sceneSvg(theme, { crop = 'middle' } = {}) {
  const id = `sky${++uid}`;
  const align = crop === 'bottom' ? 'xMidYMax' : 'xMidYMid';
  return `<svg viewBox="0 0 400 800" preserveAspectRatio="${align} slice" aria-hidden="true">${(SCENES[theme] || SCENES.hub)(id)}</svg>`;
}
