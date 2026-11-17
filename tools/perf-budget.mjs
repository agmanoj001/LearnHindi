#!/usr/bin/env node
// The performance budget (docs/ROADMAP.md 8.5, docs/PERFORMANCE.md): how long the first screen takes on a
// mid-range phone, on a first open (nothing saved yet) over 4G and over slow 4G, and on every open after that
// (from the offline cache). The phone's CPU is 4x slower than a laptop, as Lighthouse emulates it; "4G" is
// Chrome's 9 Mbit/s with 60 ms round trips, "slow 4G" 1.6 Mbit/s with 150 ms. The app is served as GitHub
// Pages serves it (HTTP/2, compressed). Each number is the median of a few runs, in milliseconds.
//
//   node tools/perf-budget.mjs [--runs 3] [--root DIR] [--summary FILE]
//
// The budget: the first screen (the splash with its play button) in under 2000 ms on every open from the
// device and on a first open over 4G, 3500 ms on a first open over slow 4G (there the download itself takes
// most of it), and the home screen 1000 ms after the play button. Over budget prints a warning (CI shows
// it); it does not fail, because a shared CI machine's timings vary.
import { createSecureServer } from 'node:http2';
import { readFile, appendFile } from 'node:fs/promises';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { extname, join, resolve, normalize } from 'node:path';
import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';

const args = process.argv.slice(2);
const opt = (name, dflt = null) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const RUNS = Number(opt('--runs', 3));
const ROOT = resolve(opt('--root', '.'));
export const BUDGET = { firstScreen: 2000, firstSlow: 3500, home: 1000 };
const CPU = 4;
const SLOW_4G = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };
const FAST_4G = { offline: false, latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 };

const { chromium } = createRequire(import.meta.url)('playwright');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
// served the way GitHub Pages serves the app: HTTP/2 over TLS (many files at once on one connection), with
// text compressed. The certificate is a throwaway one made here; the browser is told to accept it.
const dir = mkdtempSync(join(tmpdir(), 'perf-'));
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=127.0.0.1', '-keyout', join(dir, 'key.pem'), '-out', join(dir, 'cert.pem')], { stdio: 'ignore' });
const server = createSecureServer({ key: readFileSync(join(dir, 'key.pem')), cert: readFileSync(join(dir, 'cert.pem')), allowHTTP1: true }, async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'https://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, path.endsWith('/') ? `${path}index.html` : path);
  try {
    const body = await readFile(file);
    const type = TYPES[extname(file)] || 'application/octet-stream';
    const gz = /^(text|application\/(json|manifest)|image\/svg)/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '');
    res.writeHead(200, { 'content-type': type, ...(gz ? { 'content-encoding': 'gzip' } : {}) });
    res.end(gz ? gzipSync(body) : body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const URL_ = `https://127.0.0.1:${server.address().port}/`;

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

// one open: ms to the splash's play button, then ms from the tap to the home screen
async function open(page) {
  const t0 = Date.now();
  await page.goto(URL_, { waitUntil: 'commit' });
  await page.waitForSelector('.splash-play', { state: 'visible', timeout: 60000 });
  const first = Date.now() - t0;
  const t1 = Date.now();
  await page.click('.splash-play', { force: true });
  await page.waitForSelector('.hub', { timeout: 60000 });
  return { first, home: Date.now() - t1 };
}

async function run(level, NET, { thenAgain = true } = {}) {
  const browser = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 860 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.addInitScript((level) => {
    speechSynthesis.speak = (u) => setTimeout(() => u.onend && u.onend(), 5);
    if (!localStorage.getItem('vt.settings')) localStorage.setItem('vt.settings', JSON.stringify({ level, lang: 'both', onboarded: true, music: false }));
  }, level);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', NET);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const firstOpen = await open(page);
  if (!thenAgain) {
    await browser.close();
    return { firstOpen };
  }
  // let the service worker save everything (at full speed: this part is not what is measured)
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(async () => (await caches.keys()).some((k) => k.startsWith('kkm-v')) && !!navigator.serviceWorker.controller, null, { timeout: 30000 }).catch(() => page.reload());
  await page.waitForTimeout(2000);
  await cdp.send('Network.emulateNetworkConditions', NET);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const again = await open(page);
  await browser.close();
  return { firstOpen, again };
}

const rows = [];
for (const level of ['toddler', 'kg', 'grade7']) {
  const runs = [];
  const fast = [];
  for (let i = 0; i < RUNS; i++) {
    runs.push(await run(level, SLOW_4G));
    fast.push(await run(level, FAST_4G, { thenAgain: false }));
  }
  rows.push({
    level,
    firstFast: median(fast.map((r) => r.firstOpen.first)),
    firstOpen: median(runs.map((r) => r.firstOpen.first)),
    firstHome: median(runs.map((r) => r.firstOpen.home)),
    again: median(runs.map((r) => r.again.first)),
    againHome: median(runs.map((r) => r.again.home)),
  });
}
server.close();
rmSync(dir, { recursive: true, force: true });
const over = (ms, b) => (ms > b ? `**${ms}** ⚠️` : String(ms));
const lines = [
  '### Performance budget (a mid-range phone: CPU 4x slower)',
  '',
  `Budget: the first screen in ${BUDGET.firstScreen} ms (a first open over slow 4G: ${BUDGET.firstSlow} ms), the home screen ${BUDGET.home} ms after the play button. Medians of ${RUNS} runs, in ms.`,
  '',
  '| Grade | First open, 4G | First open, slow 4G | then home | Next opens | then home |',
  '| --- | --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| ${r.level} | ${over(r.firstFast, BUDGET.firstScreen)} | ${over(r.firstOpen, BUDGET.firstSlow)} | ${over(r.firstHome, BUDGET.home)} | ${over(r.again, BUDGET.firstScreen)} | ${over(r.againHome, BUDGET.home)} |`),
];
console.log(lines.join('\n'));
if (opt('--summary')) await appendFile(opt('--summary'), `${lines.join('\n')}\n`);
for (const r of rows)
  for (const [k, b] of [
    ['firstFast', BUDGET.firstScreen],
    ['firstOpen', BUDGET.firstSlow],
    ['again', BUDGET.firstScreen],
    ['firstHome', BUDGET.home],
    ['againHome', BUDGET.home],
  ])
    if (r[k] > b) console.log(`::warning title=Over the performance budget::${r.level} ${k}: ${r[k]} ms (budget ${b} ms)`);
