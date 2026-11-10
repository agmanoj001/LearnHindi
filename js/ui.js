// Small DOM helpers shared by the app shell and the games.

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'style') for (const [prop, val] of Object.entries(v)) node.style.setProperty(prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()), val);
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

// A little burst of sparkles over a node (a right answer, a lit star). Nothing with reduced motion.
export function sparkleAt(node, { count = 10, colors = ['#FFC93C', '#2EC27E', '#6C63FF', '#FF5A5F', '#3D7BFF', '#FF8FB1'] } = {}) {
  if (!node?.getBoundingClientRect || typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const b = node.getBoundingClientRect();
  if (!b.width) return;
  const cx = b.left + b.width / 2;
  const cy = b.top + b.height / 2;
  const reach = Math.max(b.width, b.height) * 0.45 + 26;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('i');
    const size = 6 + Math.random() * 8;
    s.className = `spark${i % 3 ? '' : ' square'}`;
    s.style.cssText = `left:${cx - size / 2}px;top:${cy - size / 2}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]}`;
    document.body.append(s);
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    const d = reach + Math.random() * 40;
    const run = s.animate?.(
      [
        { transform: 'translate(0, 0) scale(0.5) rotate(0deg)', opacity: 1 },
        { transform: `translate(${(Math.cos(a) * d).toFixed(1)}px, ${(Math.sin(a) * d - 24).toFixed(1)}px) scale(1) rotate(${200 + Math.random() * 160}deg)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
    );
    if (run) run.onfinish = () => s.remove();
    setTimeout(() => s.remove(), 1200);
  }
}

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

// Rounded line icons (24px grid, drawn with currentColor so CSS sets the colour).
const icon = (body, fill = false) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  home: icon('<path d="M3.5 10.6 12 3.5l8.5 7.1"/><path d="M5.5 9.2V19a1.5 1.5 0 0 0 1.5 1.5h3V15h4v5.5h3a1.5 1.5 0 0 0 1.5-1.5V9.2"/>'),
  speaker: icon('<path d="M11 5.5 6.5 9H4v6h2.5l4.5 3.5z" fill="currentColor"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12"/>'),
  music: icon('<path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  musicOff: icon('<path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/><path d="M3 3l18 18"/>'),
  gear: icon('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>'),
  play: icon('<path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" fill="currentColor"/>'),
  check: icon('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  star: icon('<path d="M12 3.2l2.6 5.3 5.8.85-4.2 4.1 1 5.8L12 16.5l-5.2 2.75 1-5.8-4.2-4.1 5.8-.85z" fill="currentColor"/>', true),
  back: icon('<path d="M15 5l-7 7 7 7"/>'),
  next: icon('<path d="M9 5l7 7-7 7"/>'),
  lock: icon('<rect x="5" y="11" width="14" height="9.5" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  book: icon('<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>'),
  flag: icon('<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5" fill="currentColor"/>'),
  sun: icon('<circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>'),
  trophy: icon('<path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8M9.5 18h5"/>'),
  album: icon('<rect x="3.5" y="4" width="17" height="16" rx="3"/><path d="M8 9.5l2 2 3.5-4"/><circle cx="16.5" cy="15" r="1.6" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.6" fill="currentColor"/>'),
  map: icon('<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>'),
  replay: icon('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5v4.5h4.5"/>'),
  sparkle: icon('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor"/><path d="M19 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill="currentColor"/>'),
};
