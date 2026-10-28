// Small DOM helpers shared by the app shell and the games.

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'style') Object.assign(node.style, v);
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(children)) if (c != null && c !== false) node.append(c);
  return node;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function animate(node, keyframes, options) {
  if (!node.animate) return Promise.resolve();
  const a = node.animate(keyframes, { duration: 400, easing: 'ease-in-out', ...options });
  return a.finished.catch(() => {});
}

export const wobble = (node) =>
  animate(node, [{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0)' }], { duration: 450 });

export const bounce = (node) =>
  animate(node, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 450 });

// Move `node` visually on top of `target` (both stay in place in the DOM).
export function flyTo(node, target, { duration = 700, scale = 1, keep = true } = {}) {
  const a = node.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  return animate(node, [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }], {
    duration,
    fill: keep ? 'forwards' : 'none',
  });
}

export const ICONS = {
  home: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 24 L24 8 L42 24 V42 H30 V30 H18 V42 H6 Z" fill="#fff" stroke="#263238" stroke-width="3" stroke-linejoin="round"/></svg>',
  speaker:
    '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 18 H16 L28 8 V40 L16 30 H8 Z" fill="#fff" stroke="#263238" stroke-width="3" stroke-linejoin="round"/><path d="M33 16 Q39 24 33 32 M37 11 Q47 24 37 37" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>',
  gear: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="7" fill="none" stroke="currentColor" stroke-width="4"/><path d="M24 4 V11 M24 37 V44 M4 24 H11 M37 24 H44 M10 10 L15 15 M33 33 L38 38 M10 38 L15 33 M33 15 L38 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 10 L38 24 L16 38 Z" fill="#fff" stroke="#263238" stroke-width="3" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 25 L20 35 L38 13" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 48 48" aria-hidden="true"><polygon points="24,4 30,18 45,18 33,28 37,43 24,34 11,43 15,28 3,18 18,18" fill="currentColor" stroke="#263238" stroke-width="2.5" stroke-linejoin="round"/></svg>',
};
