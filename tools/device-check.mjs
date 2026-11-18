// The low-end device check (docs/ROADMAP.md 3.2, docs/DEVICES.md): the app on an emulated Android Go phone
// and an emulated older iPad, from a first open to a short play session, measuring what makes a cheap device
// struggle: how long it takes to open, how much memory the page holds, long freezes, and whether the app
// chose its lighter animations on its own.
//
//   node tools/device-check.mjs [--runs 2]
//
// It is an emulation in Chromium (the CPU slowed, the screen, the memory the page reports and the network
// set like the device), not the device itself: Safari on a real iPad and the memory limits of a real 2 GB
// phone can still differ. Needs Playwright with Chromium (not a dependency of the app).
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { startPagesServer, SLOW_4G, FAST_4G, NO_LIMIT } from './pages-server.mjs';

const args = process.argv.slice(2);
const RUNS = Number(args[args.indexOf('--runs') + 1]) || 2;
const { chromium } = createRequire(import.meta.url)('playwright');

// An Android Go phone (2 GB, a small screen, an entry-level chip about six times slower than a laptop) on
// slow 4G; an older iPad (2 GB, the A10 chip of a 6th-generation iPad, about three times slower) on 4G,
// whose Safari doesn't report its memory.
export const DEVICES = [
  { id: 'android-go', name: 'Android Go phone (2 GB)', viewport: { width: 360, height: 640 }, scale: 2, cpu: 6, net: SLOW_4G, memory: 2, cores: 4, level: 'kg', lessons: ['km-count-1', 'k-numbers-2'], story: 'k-ginti-kahani-1' },
  { id: 'old-ipad', name: 'Older iPad (2 GB)', viewport: { width: 768, height: 1024 }, scale: 2, cpu: 3, net: FAST_4G, memory: null, cores: 2, level: 'grade2', lessons: ['g2m-add-1', 'g2-fables-2'], story: 'g2-fables-1' },
];
// what "fine on a cheap device" means: the first screen in 2 s from the device (3.5 s on a first open over
// slow 4G), the page under 80 MB of JavaScript memory, and no freeze over 1 s while playing
export const BUDGET = { again: 2000, firstSlow: 3500, firstFast: 2000, heapMB: 80, freeze: 1000 };

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const root = resolve('.');
const { url, close } = await startPagesServer(root);

async function go(page, name, params) {
  await page.evaluate(([n, p]) => {
    history.pushState({ name: n, params: p, depth: 1 }, '');
    dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
  }, [name, params]);
}

async function run(d) {
  const browser = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const ctx = await browser.newContext({ viewport: d.viewport, deviceScaleFactor: d.scale, isMobile: true, hasTouch: true, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const cdp = await ctx.newCDPSession(page);
  await page.addInitScript(([level, memory, cores]) => {
    // Chrome on Android reports the memory (rounded down); Safari doesn't report it at all
    if (memory) Object.defineProperty(navigator, 'deviceMemory', { get: () => memory });
    else Object.defineProperty(navigator, 'deviceMemory', { get: () => undefined });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => cores });
    speechSynthesis.speak = (u) => setTimeout(() => u.onend && u.onend(), 5);
    if (!localStorage.getItem('vt.settings')) localStorage.setItem('vt.settings', JSON.stringify({ level, lang: 'both', onboarded: true, music: false, unlockAll: true }));
    if (!localStorage.getItem('vt.progress')) localStorage.setItem('vt.progress', JSON.stringify({ coached: ['*'] }));
    // freezes: the longest stretch the page could not respond
    window.__longest = 0;
    try {
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__longest = Math.max(window.__longest, e.duration)))).observe({ type: 'longtask', buffered: true });
    } catch {}
  }, [d.level, d.memory, d.cores]);
  await cdp.send('Network.enable');
  await cdp.send('Performance.enable');
  const slow = async (net = d.net) => {
    await cdp.send('Network.emulateNetworkConditions', net);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: d.cpu });
  };
  const timeOpen = async () => {
    const t0 = Date.now();
    await page.goto(url, { waitUntil: 'commit' });
    await page.waitForSelector('.splash-play', { state: 'visible', timeout: 60000 });
    const first = Date.now() - t0;
    const t1 = Date.now();
    await page.click('.splash-play', { force: true });
    await page.waitForSelector('.hub', { timeout: 60000 });
    return { first, home: Date.now() - t1 };
  };
  await slow();
  const firstOpen = await timeOpen();
  // let the service worker save everything, at full speed (not what is measured)
  await cdp.send('Network.emulateNetworkConditions', NO_LIMIT);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await page.waitForFunction(async () => (await caches.keys()).some((k) => k.startsWith('kkm-v')) && !!navigator.serviceWorker.controller, null, { timeout: 30000 }).catch(() => page.reload());
  await page.waitForTimeout(2000);
  await slow();
  const again = await timeOpen();
  // a short play session: a story's first pages, two lessons, Show time, the library, home
  let heap = 0;
  let nodes = 0;
  const sample = async () => {
    const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
    heap = Math.max(heap, m.JSHeapUsedSize / 1024 / 1024);
    nodes = Math.max(nodes, m.Nodes);
  };
  await page.evaluate(() => (window.__longest = 0));
  await go(page, 'lesson', { lessonId: d.story });
  await page.waitForTimeout(2500);
  await page.click('.round-btn.big.go', { force: true }).catch(() => {});
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(1500);
    await page.click('.round-btn.big.go.ready', { force: true, timeout: 4000 }).catch(() => {});
  }
  await sample();
  for (const id of d.lessons) {
    await go(page, 'lesson', { lessonId: id });
    await page.waitForTimeout(2500);
    for (let i = 0; i < 4; i++) {
      await page.locator('.choices .card:visible, .math-opt:visible').first().click({ force: true, timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(700);
    }
    await sample();
  }
  for (const [n, p] of [['shows', {}], ['library', {}], ['hub', {}]]) {
    await go(page, n, p);
    await page.waitForTimeout(2500);
    await sample();
  }
  const longest = await page.evaluate(() => Math.round(window.__longest));
  const lite = await page.evaluate(() => document.documentElement.classList.contains('lite'));
  // and a first open over the other network, for the record
  await browser.close();
  return { firstOpen, again, heap: Math.round(heap), nodes, longest, lite, errors };
}

const results = [];
for (const d of DEVICES) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await run(d));
  results.push({
    d,
    first: median(runs.map((r) => r.firstOpen.first)),
    firstHome: median(runs.map((r) => r.firstOpen.home)),
    again: median(runs.map((r) => r.again.first)),
    againHome: median(runs.map((r) => r.again.home)),
    heap: Math.max(...runs.map((r) => r.heap)),
    nodes: Math.max(...runs.map((r) => r.nodes)),
    longest: Math.max(...runs.map((r) => r.longest)),
    lite: runs.every((r) => r.lite),
    errors: [...new Set(runs.flatMap((r) => r.errors))],
  });
}
close();

const flag = (v, b) => (v > b ? `**${v}** ⚠️` : String(v));
const lines = [
  `### Low-end devices (emulated; medians of ${RUNS} runs)`,
  '',
  '| Device | First open | then home | Next opens | then home | Memory (JS) | Most elements | Longest freeze | Lighter animations |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...results.map((r) => `| ${r.d.name}, CPU ${r.d.cpu}x, ${r.d.net === SLOW_4G ? 'slow 4G' : '4G'} | ${flag(r.first, r.d.net === SLOW_4G ? BUDGET.firstSlow : BUDGET.firstFast)} ms | ${r.firstHome} ms | ${flag(r.again, BUDGET.again)} ms | ${r.againHome} ms | ${flag(r.heap, BUDGET.heapMB)} MB | ${r.nodes} | ${flag(r.longest, BUDGET.freeze)} ms | ${r.lite ? 'yes, on its own' : 'no'} |`),
];
for (const r of results) if (r.errors.length) lines.push(`\n${r.d.name}: page errors: ${r.errors.join('; ')}`);
console.log(lines.join('\n'));
