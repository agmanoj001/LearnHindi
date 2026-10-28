// Trace the road: pick a vehicle, then drive it along a big letter with a finger.
// Works for any script because the "road" is the letter itself drawn on a canvas;
// tracing is complete once enough of the letter has been driven over.
import { sample, traceCoverage, thinPoints } from '../logic.js';
import { el, sleep, runRounds, cheer, bounce, animate } from './kit.js';

export default {
  start(ctx) {
    const ids = [...(ctx.special ? ['special'] : []), ...ctx.unlockedVehicles()];
    let started = false;
    const btns = ids.map((id) => {
      const b = el('button', { class: 'card pick-vehicle', 'aria-label': id, html: ctx.vehicleArt(id) });
      b.addEventListener('click', () => {
        if (started) return;
        started = true;
        ctx.sfx.vroom();
        bounce(b);
        if (id === 'special') ctx.say('special');
        else ctx.sayItem(ctx.word(id));
        setTimeout(() => ctx.alive() && drive(ctx, id), 1000);
      });
      return b;
    });
    ctx.stage.replaceChildren(el('div', { class: 'choices pick-grid' }, btns));
    ctx.setRepeat(() => ctx.say('pickVehicle'));
    ctx.say('pickVehicle');
  },
};

async function drive(ctx, vehicleId) {
  const letters = sample(ctx.letters(), ctx.config.letters, ctx.rng);
  const canvas = el('canvas', { class: 'road', 'aria-label': 'trace the letter' });
  const car = el('div', { class: 'tracer', html: ctx.vehicleArt(vehicleId) });
  const wrap = el('div', { class: 'trace-wrap' }, [canvas, car]);
  ctx.stage.replaceChildren(wrap);

  const ok = await runRounds(ctx, letters.length, async (i) => {
    const letter = letters[i];
    await traceLetter(ctx, letter, canvas, car);
    await cheer(ctx, wrap);
    await ctx.sayLetterWithWord(letter);
    await sleep(300);
  });
  if (ok) ctx.complete();
}

function traceLetter(ctx, letter, canvas, car) {
  return new Promise((resolve) => {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const g = canvas.getContext('2d');
    g.scale(dpr, dpr);

    // Fit the letter into the canvas.
    const family = getComputedStyle(document.body).fontFamily;
    let size = h * 0.8;
    g.font = `900 ${size}px ${family}`;
    const mw = g.measureText(letter.char).width;
    if (mw > w * 0.9) size *= (w * 0.9) / mw;
    const font = `900 ${size}px ${family}`;
    const brush = Math.max(16, size * 0.1);

    // Sample points inside the letter: these are the "road" the child has to cover.
    const off = document.createElement('canvas');
    off.width = Math.ceil(w);
    off.height = Math.ceil(h);
    const og = off.getContext('2d');
    og.font = font;
    og.textAlign = 'center';
    og.textBaseline = 'middle';
    og.fillText(letter.char, w / 2, h / 2);
    const data = og.getImageData(0, 0, off.width, off.height).data;
    const step = Math.max(6, Math.round(size / 30));
    let targets = [];
    for (let y = 0; y < off.height; y += step)
      for (let x = 0; x < off.width; x += step) if (data[(y * off.width + x) * 4 + 3] > 128) targets.push({ x, y });
    targets = thinPoints(targets, 600);

    const drawRoad = () => {
      g.clearRect(0, 0, w, h);
      g.font = font;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = Math.max(10, size * 0.05);
      g.strokeStyle = '#546e7a';
      g.strokeText(letter.char, w / 2, h / 2);
      g.fillStyle = '#78909c';
      g.fillText(letter.char, w / 2, h / 2);
      g.setLineDash([10, 12]);
      g.lineWidth = 3;
      g.strokeStyle = '#fff';
      g.strokeText(letter.char, w / 2, h / 2);
      g.setLineDash([]);
    };
    drawRoad();

    const trail = [];
    let last = null;
    let done = false;
    const place = (p, flip) => {
      car.style.transform = `translate(${p.x - car.offsetWidth / 2}px, ${p.y - car.offsetHeight / 2}px) scaleX(${flip ? -1 : 1})`;
    };
    place({ x: w * 0.12, y: h * 0.85 });

    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const paint = (a, b) => {
      g.strokeStyle = 'rgba(255, 179, 0, 0.75)';
      g.lineWidth = brush * 1.6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
    };
    const move = (e) => {
      if (done || !last) return;
      const p = point(e);
      paint(last, p);
      place(p, p.x < last.x);
      trail.push(p);
      last = p;
      if (trail.length % 8 === 0 && traceCoverage(targets, trail, brush * 1.2) >= ctx.config.threshold) finish();
    };
    const down = (e) => {
      if (done) return;
      canvas.setPointerCapture?.(e.pointerId);
      last = point(e);
      trail.push(last);
      place(last, false);
      ctx.sfx.vroom();
    };
    const up = () => {
      last = null;
      if (!done && traceCoverage(targets, trail, brush * 1.2) >= ctx.config.threshold) finish();
    };
    const finish = async () => {
      done = true;
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      // Replay: the vehicle drives the road the child made.
      drawRoad();
      const path = thinPoints(trail, 80);
      g.fillStyle = '#ffb300';
      g.fillText(letter.char, w / 2, h / 2);
      ctx.sfx.vroom();
      await animate(
        car,
        path.map((p, k) => ({
          transform: `translate(${p.x - car.offsetWidth / 2}px, ${p.y - car.offsetHeight / 2}px) scaleX(${k && p.x < path[k - 1].x ? -1 : 1})`,
        })),
        { duration: 1600, easing: 'linear' },
      );
      resolve();
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    const prompt = () => ctx.say('trace', null, [letter.lang]).then(() => ctx.alive() && !done && ctx.sayItem(letter));
    ctx.setRepeat(prompt);
    prompt();
  });
}
