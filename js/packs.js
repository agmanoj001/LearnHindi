// Content split by grade (docs/ROADMAP.md 2.1). content.json (the whole of it, which the tests and tools
// read) is split by tools/split-content.mjs into content/core.json (worlds, words, phrases, shows, quizzes …)
// and a pack per grade (that grade's stories, comics, grammar, riddles and idioms), with a short hash in each
// pack's name. A first open loads the core and the child's own grade, and the rest after the home screen is
// up; afterwards every pack comes from the offline cache. Pure functions, shared by the app, the tool and
// the tests.

// the parts kept in the grade packs, by the "level" of each item
export const PACKED = ['stories', 'comics', 'grammar', 'riddles', 'idioms'];

const hash = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(36);
};

// content -> { 'core.json': text, '<level>.<hash>.json': text, … }
export function splitContent(content) {
  const core = { ...content };
  const packs = {};
  const kinds = {};
  const pack = (level) => (packs[level] ||= { level, order: {} });
  for (const k of PACKED) {
    const v = content[k];
    delete core[k];
    if (v === undefined) continue;
    kinds[k] = Array.isArray(v) ? 'list' : 'map';
    // each item keeps its place in the whole, so merging the packs gives back the same order
    const entries = Array.isArray(v) ? v.map((item) => [null, item]) : Object.entries(v);
    entries.forEach(([id, item], i) => {
      const p = pack(item.level);
      if (Array.isArray(v)) (p[k] ||= []).push(item);
      else (p[k] ||= {})[id] = item;
      (p.order[k] ||= []).push(i);
    });
  }
  const levelOrder = (content.levels || []).map((l) => l.id);
  const files = {};
  core.packedKinds = kinds;
  // every story's id, so a favourite from a pack not loaded yet is still known (js/logic.js normalizeProgress)
  core.storyIds = (content.stories || []).map((s) => s.id);
  core.packs = Object.keys(packs)
    .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b))
    .map((level) => {
      const text = JSON.stringify(packs[level]);
      const file = `${level}.${hash(text)}.json`;
      files[file] = text;
      return { level, file, bytes: text.length };
    });
  files['core.json'] = JSON.stringify(core);
  return files;
}

// the core and the packs loaded so far -> content (the packs not loaded yet are simply missing)
export function mergeContent(core, packs) {
  const out = { ...core };
  for (const k of PACKED) {
    const kind = core.packedKinds?.[k];
    if (!kind) continue;
    const parts = [];
    for (const p of packs) {
      const v = p?.[k];
      if (!v) continue;
      const order = p.order?.[k] || [];
      if (kind === 'list') v.forEach((item, j) => parts.push([order[j], null, item]));
      else Object.entries(v).forEach(([id, item], j) => parts.push([order[j], id, item]));
    }
    parts.sort((a, b) => a[0] - b[0]);
    out[k] = kind === 'list' ? parts.map((x) => x[2]) : Object.fromEntries(parts.map((x) => [x[1], x[2]]));
  }
  return out;
}

// which packs to load before the first screen: the child's grade, and Kindergarten's stories for the
// Grade 7–8 "read to your brother or sister" mission
export function firstPacks(core, level) {
  const want = new Set([level, ...(level === 'grade7' || level === 'grade8' ? ['kg'] : [])]);
  return (core.packs || []).filter((p) => want.has(p.level));
}
