// The motion budget (docs/ROADMAP.md 5.5). Measured with the CPU slowed four and six times (an entry-level
// Android phone is roughly four to six times slower than a laptop), the steady screens hold 60 frames a
// second, but three things stutter: a card growing into its screen (the browser snapshots both screens),
// the drifting backgrounds and ambient birds and leaves while a screen scrolls, and bursts of sparkles.
// On a device that turns out to be slow, "lighter animations" drops those and keeps everything that
// teaches (story scenes, the guide's reactions, a right answer's cheer).
//
// settings.motion: 'auto' (the default: lighter if this device measured slow), 'full' or 'lite'.

export const MOTION_MODES = ['auto', 'full', 'lite'];
export const SLOW_DEVICE_KEY = 'vt.slowDevice';
const FRAME_BUDGET = 34; // ms: two frames at 60 a second
const PAUSED = 250; // a gap this long is the tab in the background, not a slow frame

// Is this run of frame times (ms) too slow? A median over 25 ms (under 40 frames a second), or more
// than a fifth of the frames over budget. Gaps from a hidden tab don't count.
export function tooSlow(frames) {
  const f = frames.filter((x) => x > 0 && x < PAUSED);
  if (f.length < 60) return false;
  const s = [...f].sort((a, b) => a - b);
  const median = s[Math.floor(s.length / 2)];
  return median > 25 || f.filter((x) => x > FRAME_BUDGET).length / f.length > 0.2;
}

// lighter animations now?
export const liteMotion = (mode, slowDevice) => mode === 'lite' || (mode !== 'full' && !!slowDevice);

export const isLite = () => typeof document !== 'undefined' && document.documentElement.classList.contains('lite');

export function applyMotion(on) {
  document.documentElement.classList.toggle('lite', !!on);
}

// Frame times (ms) over the next `ms` milliseconds.
export function sampleFrames(ms = 3000) {
  return new Promise((resolve) => {
    const out = [];
    let last = performance.now();
    const end = last + ms;
    const tick = (now) => {
      out.push(now - last);
      last = now;
      if (now < end) requestAnimationFrame(tick);
      else resolve(out.slice(1));
    };
    requestAnimationFrame(tick);
  });
}

// In 'auto', watch the first few screens of each start; two slow samples make this a slow device, which
// is remembered (on this device only) and switches to lighter animations straight away.
export function watchMotion(getMode, { samples = 4, need = 2 } = {}) {
  let left = samples;
  let slow = 0;
  let busy = false;
  return async function screenShown() {
    if (busy || left <= 0 || getMode() !== 'auto' || isLite()) return;
    busy = true;
    left--;
    const frames = await sampleFrames(3000);
    busy = false;
    if (!tooSlow(frames) || ++slow < need) return;
    try {
      localStorage.setItem(SLOW_DEVICE_KEY, '1');
    } catch {}
    applyMotion(true);
  };
}

// A phone with 2 GB of memory or less (an Android Go phone reports it; Safari doesn't say) starts with the
// lighter animations: its frames can look fine while it is idle, and it still struggles when a screen
// opens (roadmap 3.2, docs/DEVICES.md).
export function lowMemoryDevice(nav = typeof navigator !== 'undefined' ? navigator : null) {
  const gb = Number(nav?.deviceMemory);
  return gb > 0 && gb <= 2;
}

export function slowDevice() {
  if (lowMemoryDevice()) return true;
  try {
    return localStorage.getItem(SLOW_DEVICE_KEY) === '1';
  } catch {
    return false;
  }
}
