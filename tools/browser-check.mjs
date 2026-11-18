#!/usr/bin/env node
// Browser checks for every pull request (docs/ROADMAP.md 8.1, and 2.4's airplane-mode check), in a real
// browser (Playwright's Chromium):
//
//   1. Offline: install the app, let the service worker save it, and check that every file the app loaded
//      is in the offline cache. Then go offline, play one lesson from each grade to the end, "restart"
//      (close and reopen, still offline) and check the stars were kept. Any page error fails.
//   2. Screens: draw the main screens at fixed sizes, with a fixed date, fixed "random" numbers and no
//      animation, and save them as PNGs. With --compare, compare them with another set (in CI: the same
//      screens drawn from the pull request's base, on the same machine, so fonts and emoji match) and
//      write the differences: an image per changed screen and a summary.
//
// Usage:
//   node tools/browser-check.mjs [--root DIR] [--out DIR] [--screens-only] [--no-screens]
//   node tools/browser-check.mjs --compare BEFORE_DIR --with AFTER_DIR [--summary FILE]
// Needs Playwright (npm install --no-save playwright; npx playwright install chromium).
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, readdir, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve, normalize } from 'node:path';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const opt = (name, dflt = null) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : dflt;
};
const flag = (name) => args.includes(name);
const ROOT = resolve(opt('--root', '.'));
const OUT = resolve(opt('--out', 'browser-check'));

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright is needed: npm install --no-save playwright && npx playwright install chromium');
  process.exit(2);
}
const launch = () => chromium.launch();

// ---------- a small static server for the app ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.bin': 'application/octet-stream', '.mp3': 'audio/mpeg', '.txt': 'text/plain' };
function serve(root) {
  return new Promise((ok) => {
    const server = createServer(async (req, res) => {
      const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
      const file = join(root, path.endsWith('/') ? `${path}index.html` : path);
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => ok({ server, url: `http://127.0.0.1:${server.address().port}/` }));
  });
}

// the same start for every page: a fixed "random", and the settings and progress given
const seeded = (settings, progress) => `
  (() => {
    let s = 20261117;
    Math.random = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
    if (!sessionStorage.getItem('bc-seeded')) {
      sessionStorage.setItem('bc-seeded', '1');
      localStorage.setItem('vt.settings', ${JSON.stringify(JSON.stringify(settings))});
      ${progress ? `localStorage.setItem('vt.progress', ${JSON.stringify(JSON.stringify(progress))});` : ''}
    }
    // speech: say nothing, finish at once
    if (window.speechSynthesis) speechSynthesis.speak = (u) => setTimeout(() => u.onend && u.onend(), 5);
  })();`;
const go = (page, name, params = {}) =>
  page.evaluate(([name, params]) => {
    history.pushState({ name, params, depth: 1 }, '');
    dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
  }, [name, params]);
const start = async (page) => {
  await page.waitForSelector('.splash-play, .hub', { timeout: 15000 });
  if (await page.locator('.splash-play').count()) await page.click('.splash-play', { force: true });
  await page.waitForSelector('.hub', { timeout: 15000 });
};

// ---------- 1. offline ----------
// one lesson from each grade that taps alone can finish
export const OFFLINE_LESSONS = { toddler: 't-animals-3', kg: 'k-numbers-2', grade1: 'g1-family-1', grade2: 'g2-actions-1', grade3: 'g3-gender-2', grade4: 'g4-pron-1', grade7: 'g7-idioms-1', grade8: 'g8-idioms-1' };
const OPTIONAL = /\/voices\//; // the voice pack is a separate download, saved on request

async function playLesson(page, lessonId) {
  await go(page, 'lesson', { lessonId });
  for (let i = 0; i < 400 && !(await page.locator('.results').count()); i++) {
    const bs = page.locator('.stage button:visible, .stage [role="button"]:visible');
    const n = await bs.count();
    for (let k = 0; k < n; k++) await bs.nth(k).click({ force: true, timeout: 400 }).catch(() => {});
    await page.waitForTimeout(100);
  }
  return (await page.locator('.results').count()) > 0;
}

async function offlineCheck(url) {
  const problems = [];
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 860 }, serviceWorkers: 'allow' });
  const errors = [];
  let phase = 'online';
  const loaded = new Set();
  ctx.on('request', (r) => {
    if (r.serviceWorker()) return;
    const u = new URL(r.url());
    if (u.origin === new URL(url).origin && !OPTIONAL.test(u.pathname)) loaded.add(u.pathname);
  });
  let page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${phase}: ${e.message}`));
  // anything the security policy in index.html refuses to load is a bug (docs/ROADMAP.md 8.4)
  page.on('console', (m) => /Content Security Policy/.test(m.text()) && errors.push(`${phase}: ${m.text()}`));
  await page.addInitScript(seeded({ level: 'kg', lang: 'both', onboarded: true, music: false, unlockAll: true }, { coached: ['*'] }));
  await page.goto(url);
  await start(page);
  // wait for the service worker to take over and save the app
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await start(page);
  await page.waitForFunction(async () => (await caches.keys()).some((k) => k.startsWith('kkm-v')), null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  // open a screen of each kind while online, so their files are requested too
  for (const lv of Object.keys(OFFLINE_LESSONS)) {
    await page.evaluate((lv) => {
      const s = JSON.parse(localStorage.getItem('vt.settings'));
      localStorage.setItem('vt.settings', JSON.stringify({ ...s, level: lv }));
    }, lv);
  }
  // every file loaded must be in the offline cache
  const missing = await page.evaluate(async (paths) => {
    const out = [];
    for (const p of paths) if (p !== '/sw.js' && !(await caches.match(p, { ignoreSearch: true })) && !(p === '/' && (await caches.match('./')))) out.push(p);
    return out;
  }, [...loaded]);
  for (const m of missing) problems.push(`not in the offline cache: ${m}`);

  // offline: a lesson from each grade, then a restart
  await ctx.setOffline(true);
  phase = 'offline';
  const failed = [];
  ctx.on('requestfailed', (r) => {
    // the service worker's own refresh in the background fails offline, as it should; the page's requests count
    if (r.serviceWorker()) return;
    const u = new URL(r.url());
    if (u.origin === new URL(url).origin && !OPTIONAL.test(u.pathname)) failed.push(u.pathname);
  });
  const played = {};
  for (const [lv, lessonId] of Object.entries(OFFLINE_LESSONS)) {
    await page.evaluate((lv) => {
      const s = JSON.parse(localStorage.getItem('vt.settings'));
      localStorage.setItem('vt.settings', JSON.stringify({ ...s, level: lv }));
    }, lv);
    await page.reload();
    await start(page);
    const ok = await playLesson(page, lessonId);
    played[lv] = ok;
    if (!ok) problems.push(`offline: could not finish ${lessonId} (${lv})`);
  }
  const stars = async () => page.evaluate((ids) => {
    const p = JSON.parse(localStorage.getItem('vt.progress') || '{}');
    return Object.fromEntries(ids.map((id) => [id, p.lessons?.[id]?.stars ?? p.lessons?.[id]?.best ?? 0]));
  }, Object.values(OFFLINE_LESSONS));
  const before = await stars();
  // restart: close the page, open the app again, still offline
  await page.close();
  page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`after restart: ${e.message}`));
  page.on('console', (m) => /Content Security Policy/.test(m.text()) && errors.push(`after restart: ${m.text()}`));
  await page.goto(url);
  await start(page);
  const after = await stars();
  for (const [id, n] of Object.entries(before)) {
    if (!(n > 0)) problems.push(`offline: no stars recorded for ${id}`);
    if (after[id] !== n) problems.push(`offline: ${id} had ${n} stars, ${after[id]} after a restart`);
  }
  for (const f of new Set(failed)) problems.push(`offline: could not load ${f}`);
  for (const e of new Set(errors)) problems.push(`page error ${e}`);
  await browser.close();
  return { problems, played, stars: after, cached: loaded.size };
}

// ---------- 2. screens ----------
const PHONE = { width: 412, height: 860 };
const TABLET = { width: 1180, height: 820 };
const base = (level, extra = {}) => ({ level, lang: 'both', onboarded: true, music: false, unlockAll: true, ...extra });
const someProgress = { coached: ['*'], lessons: { 'k-numbers-1': { stars: 3, best: 3 }, 'k-vowels-1': { stars: 2, best: 2 } }, shows: { 'gappu-bus': { views: 1, last: '2026-11-15' } } };
// name, size, settings, then what to open and what must be on it
export const SCREENS = [
  ['hub-kg', PHONE, base('kg'), null, '.hub'],
  ['hub-kg-tablet', TABLET, base('kg'), null, '.hub'],
  ['hub-grade7', PHONE, base('grade7'), null, '.hub'],
  ['map-town', PHONE, base('kg'), ['world', { worldId: 'town' }], '.screen:not(.hub)'],
  ['lesson-busdepot', PHONE, base('kg'), ['lesson', { lessonId: 'k-numbers-2' }], '.stage'],
  ['lesson-quiz-g3', PHONE, base('grade3'), ['lesson', { lessonId: 'g3-gender-2' }], '.stage'],
  ['showtime', PHONE, base('kg'), ['shows', {}], '.show-series'],
  ['corner', PHONE, base('grade7'), ['corner', {}], '.riddle-card'],
  ['words', PHONE, base('kg'), ['words', {}], '.word-book'],
];
const STILL = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.toast,.caption,.speech-caption{display:none!important}';

async function screens(url, outDir, { tolerant = false } = {}) {
  await mkdir(outDir, { recursive: true });
  const problems = [];
  const browser = await launch();
  for (const [name, size, settings, open, ready] of SCREENS) {
    const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => /Content Security Policy/.test(m.text()) && errors.push(m.text()));
    await page.clock.setFixedTime(new Date('2026-11-17T10:30:00'));
    await page.addInitScript(seeded(settings, someProgress));
    try {
      await page.goto(url);
      await start(page);
      if (open) await go(page, ...open);
      await page.waitForSelector(ready, { timeout: 8000 });
      // accessibility (docs/ROADMAP.md 8.3), checked before animations are stilled for the picture
      if (!tolerant) for (const p of await a11yProblems(page)) problems.push(`${name}: ${p}`);
      await page.addStyleTag({ content: STILL });
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(outDir, `${name}.png`) });
      if (errors.length) problems.push(`${name}: page error: ${errors[0]}`);
    } catch (e) {
      // drawing an older version, a screen it doesn't have yet is no problem
      if (!tolerant) problems.push(`${name}: did not draw (${String(e.message).split('\n')[0]})`);
    }
    await ctx.close();
  }
  await browser.close();
  return problems;
}

// Accessibility checks on what is on screen (docs/ROADMAP.md 8.3; the screens run with reduced motion on):
//   - every control a finger taps is at least 44 px each way (words inside a sentence and a checkbox
//     inside its label are exempt, as in WCAG 2.2's target-size rule);
//   - every control has a name a screen reader can say;
//   - nothing animates forever when the device asks for less motion.
export async function a11yProblems(page) {
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    const seen = (e) => {
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight;
    };
    const tag = (e) => `${e.tagName.toLowerCase()}${[...e.classList].slice(0, 2).map((c) => '.' + c).join('')}`;
    const controls = [...document.querySelectorAll('button, a[href], [role=button], input:not([type=hidden]), select')].filter(seen);
    const out = [];
    for (const e of controls) {
      const r = e.getBoundingClientRect();
      const inline = getComputedStyle(e).display === 'inline' || (e.matches('input[type=checkbox], input[type=radio]') && e.closest('label'));
      if (!inline && (r.width < 44 || r.height < 44)) out.push(`tap target too small: ${tag(e)} ${Math.round(r.width)}×${Math.round(r.height)}`);
      const name = e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.textContent.trim() || e.getAttribute('title') || e.labels?.[0]?.textContent.trim() || e.getAttribute('placeholder');
      if (!name) out.push(`no name for a screen reader: ${tag(e)}`);
    }
    for (const a of document.getAnimations()) {
      if (a.playState === 'running' && a.effect?.getComputedTiming?.().iterations === Infinity) out.push(`animates forever with reduced motion on: ${a.animationName || 'an animation'} on ${a.effect.target ? tag(a.effect.target) : '?'}`);
    }
    return [...new Set(out)];
  });
}

// compare two folders of screenshots, pixel by pixel, in the browser (no image library needed)
async function compare(beforeDir, afterDir, diffDir) {
  await mkdir(diffDir, { recursive: true });
  const browser = await launch();
  const page = await browser.newPage();
  const rows = [];
  const names = (await readdir(afterDir)).filter((f) => f.endsWith('.png')).sort();
  for (const f of names) {
    if (!existsSync(join(beforeDir, f))) {
      rows.push({ name: f, change: 'new' });
      continue;
    }
    const [a, b] = await Promise.all([readFile(join(beforeDir, f)), readFile(join(afterDir, f))]);
    const r = await page.evaluate(
      async ([a, b]) => {
        const img = (src) => new Promise((ok) => Object.assign(new Image(), { onload() { ok(this); }, src }));
        const [ia, ib] = await Promise.all([img(a), img(b)]);
        if (ia.width !== ib.width || ia.height !== ib.height) return { ratio: 1, size: true };
        const cv = (im) => {
          const c = document.createElement('canvas');
          c.width = im.width;
          c.height = im.height;
          const x = c.getContext('2d');
          x.drawImage(im, 0, 0);
          return x.getImageData(0, 0, im.width, im.height);
        };
        const da = cv(ia);
        const db = cv(ib);
        const out = new ImageData(ia.width, ia.height);
        let n = 0;
        for (let i = 0; i < da.data.length; i += 4) {
          const d = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]);
          const changed = d > 48;
          if (changed) n++;
          // the after picture, faded, with the changed pixels in magenta
          out.data[i] = changed ? 255 : 160 + db.data[i] * 0.37;
          out.data[i + 1] = changed ? 0 : 160 + db.data[i + 1] * 0.37;
          out.data[i + 2] = changed ? 200 : 160 + db.data[i + 2] * 0.37;
          out.data[i + 3] = 255;
        }
        const c = document.createElement('canvas');
        c.width = ia.width;
        c.height = ia.height;
        c.getContext('2d').putImageData(out, 0, 0);
        return { ratio: n / (da.data.length / 4), diff: c.toDataURL('image/png') };
      },
      [`data:image/png;base64,${a.toString('base64')}`, `data:image/png;base64,${b.toString('base64')}`],
    );
    if (r.diff && r.ratio > 0) await writeFile(join(diffDir, f), Buffer.from(r.diff.split(',')[1], 'base64'));
    rows.push({ name: f, change: r.size ? 'size' : r.ratio, });
  }
  await browser.close();
  return rows;
}

// ---------- run ----------
const NOTICE = 0.005; // more than half a percent of the pixels changed: worth a look
if (flag('--compare')) {
  const rows = await compare(resolve(opt('--compare')), resolve(opt('--with')), join(OUT, 'diff'));
  const changed = rows.filter((r) => r.change === 'new' || r.change === 'size' || r.change > NOTICE);
  const lines = [
    '### Screens before and after this change',
    '',
    changed.length ? `${changed.length} of ${rows.length} screens changed. The before, after and difference images are in the "screens" artifact; check that each change was meant.` : `None of the ${rows.length} screens changed.`,
    '',
    '| Screen | Changed |',
    '| --- | --- |',
    ...rows.map((r) => `| ${r.name.replace('.png', '')} | ${r.change === 'new' ? 'new screen' : r.change === 'size' ? 'size changed' : r.change > NOTICE ? `**${(r.change * 100).toFixed(1)}%**` : r.change > 0 ? `${(r.change * 100).toFixed(2)}% (noise)` : 'no'} |`),
  ];
  console.log(lines.join('\n'));
  if (opt('--summary')) await appendFile(opt('--summary'), `${lines.join('\n')}\n`);
  // a changed screen is a warning for a person to look at, not a failure: designs change on purpose
  for (const r of changed) console.log(`::warning title=Screen changed::${r.name} changed (${r.change === 'new' ? 'new' : r.change === 'size' ? 'size' : `${(r.change * 100).toFixed(1)}%`}); see the screens artifact`);
  process.exit(0);
}

const { server, url } = await serve(ROOT);
let problems = [];
try {
  if (!flag('--screens-only')) {
    const r = await offlineCheck(url);
    console.log(`offline: ${r.cached} files checked in the cache; lessons finished offline: ${Object.entries(r.played).map(([lv, ok]) => `${lv} ${ok ? '✓' : '✗'}`).join(', ')}`);
    problems.push(...r.problems);
  }
  if (!flag('--no-screens')) {
    const p = await screens(url, join(OUT, 'screens'), { tolerant: flag('--screens-only') });
    console.log(`screens: ${SCREENS.length} drawn to ${join(OUT, 'screens')}`);
    problems.push(...p);
  }
} finally {
  server.close();
}
if (problems.length) {
  for (const p of problems) console.log(`::error title=Browser check::${p}`);
  console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('browser check: all good');
