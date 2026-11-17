// The motion budget check (docs/ROADMAP.md 5.5): frames per second in the moments most likely to stutter,
// with the CPU slowed down the way an entry-level phone is (4x and 6x slower than a laptop), with full and
// with lighter animations (js/motion.js). Each number is the median of several runs.
//
//   npm run serve          (in another terminal: the app on http://localhost:8080)
//   node tools/motion-budget.mjs [runs=3]
//
// Needs Playwright with Chromium (not a dependency of the app). The budget: 50 frames a second or more
// while scrolling and answering, and no single frame over 150 ms when a screen opens.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const URL_ = process.env.APP_URL || 'http://localhost:8080/';
const RUNS = Number(process.argv[2]) || 3;

async function measure(rate, motion) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 412, height: 860 } });
  const cdp = await page.context().newCDPSession(page);
  await page.addInitScript((motion) => {
    speechSynthesis.speak = (u) => setTimeout(() => u.onend && u.onend(), 30);
    localStorage.setItem('vt.settings', JSON.stringify({ level: 'grade1', lang: 'both', onboarded: true, music: false, unlockAll: true, motion }));
    localStorage.setItem('vt.progress', JSON.stringify({ coached: ['matra:each', 'matra:tap', 'story:page'] }));
    window.__frames = (ms) =>
      new Promise((res) => {
        const t = [];
        let last = performance.now();
        const end = last + ms;
        const tick = (now) => {
          t.push(now - last);
          last = now;
          if (now < end) requestAnimationFrame(tick);
          else res(t.slice(1));
        };
        requestAnimationFrame(tick);
      });
  }, motion);
  await page.goto(URL_);
  await page.click('.splash-play', { force: true });
  await page.waitForSelector('.hub');
  await page.waitForTimeout(1200);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  const out = {};
  const stat = (name, f) => (out[name] = { fps: f.length / (f.reduce((a, x) => a + x, 0) / 1000), worst: Math.max(...f) });
  let fr = page.evaluate(() => window.__frames(2500));
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 260);
    await page.waitForTimeout(120);
  }
  stat('scroll the home screen', await fr);
  await page.evaluate(() => document.querySelector('.hub-scroll').scrollTo(0, 0));
  fr = page.evaluate(() => window.__frames(1500));
  await page.locator('.world-card').first().click();
  stat('open a world map', await fr);
  await page.waitForTimeout(800);
  fr = page.evaluate(() => window.__frames(1800));
  await page.locator('.node-row.current .node').click();
  stat('open a lesson', await fr);
  await page.waitForTimeout(1500);
  fr = page.evaluate(() => window.__frames(2500));
  const tiles = page.locator('.stage button.card');
  for (let k = 0; k < Math.min(6, await tiles.count()); k++) {
    await tiles.nth(k).click({ force: true, timeout: 500 }).catch(() => {});
    await page.waitForTimeout(150);
  }
  stat('answering (sparkles, cheer)', await fr);
  await browser.close();
  return out;
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
for (const rate of [4, 6]) {
  for (const motion of ['full', 'lite']) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) runs.push(await measure(rate, motion));
    console.log(`\nCPU ${rate}x slower, ${motion === 'lite' ? 'lighter' : 'full'} animations (median of ${RUNS})`);
    for (const name of Object.keys(runs[0])) {
      const fps = Math.round(median(runs.map((r) => r[name].fps)));
      const worst = Math.round(median(runs.map((r) => r[name].worst)));
      console.log(`  ${name.padEnd(30)} ${String(fps).padStart(3)} fps   worst frame ${String(worst).padStart(4)} ms`);
    }
  }
}
