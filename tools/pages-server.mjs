// Serves the app the way GitHub Pages does: HTTP/2 over TLS (many files at once on one connection), with
// text compressed. The certificate is a throwaway one made here; the browser is told to accept it
// (--ignore-certificate-errors, ignoreHTTPSErrors). Used by tools/perf-budget.mjs and tools/device-check.mjs.
import { createSecureServer } from 'node:http2';
import { readFile } from 'node:fs/promises';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.bin': 'application/octet-stream', '.mp3': 'audio/mpeg' };

export async function startPagesServer(root) {
  const dir = mkdtempSync(join(tmpdir(), 'pages-'));
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=127.0.0.1', '-keyout', join(dir, 'key.pem'), '-out', join(dir, 'cert.pem')], { stdio: 'ignore' });
  const server = createSecureServer({ key: readFileSync(join(dir, 'key.pem')), cert: readFileSync(join(dir, 'cert.pem')), allowHTTP1: true }, async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'https://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const file = join(root, path.endsWith('/') ? `${path}index.html` : path);
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
  return {
    url: `https://127.0.0.1:${server.address().port}/`,
    close() {
      server.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

// Chrome DevTools' network presets: "4G" 9 Mbit/s with 60 ms round trips, "slow 4G" 1.6 Mbit/s with 150 ms
export const SLOW_4G = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };
export const FAST_4G = { offline: false, latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 };
export const NO_LIMIT = { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 };
