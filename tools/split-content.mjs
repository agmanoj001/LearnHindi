#!/usr/bin/env node
// Splits content.json into content/core.json and a pack per grade (docs/ROADMAP.md 2.1; js/packs.js says
// how). Run it after every change to content.json: `npm test` fails while content/ is out of step with it.
//   node tools/split-content.mjs [path/to/repo]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { splitContent } from '../js/packs.js';

const root = resolve(process.argv[2] || '.');
const content = JSON.parse(readFileSync(join(root, 'content.json'), 'utf8'));
const files = splitContent(content);
const dir = join(root, 'content');
mkdirSync(dir, { recursive: true });
// packs whose content changed get a new name; the old ones go
for (const f of readdirSync(dir)) if (f.endsWith('.json') && !(f in files)) rmSync(join(dir, f));
for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
const kb = (t) => `${(t.length / 1024).toFixed(0)} KB (${(gzipSync(t).length / 1024).toFixed(0)} KB compressed)`;
console.log(`core.json ${kb(files['core.json'])}`);
for (const [f, t] of Object.entries(files)) if (f !== 'core.json') console.log(`${f.padEnd(28)} ${kb(t)}`);
