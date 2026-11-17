// The roadmap (docs/ROADMAP.md) must match the app, both ways:
//   - every ✅ row has a check here that finds its feature in the code or the content, and the check passes
//     (a row can't be ticked for work that never landed);
//   - a feature from an open (➡️) row that shows up in the code makes this fail until its row is ✅
//     (work can't land without its tick).
// When you finish a roadmap item: tick its row and add its check to DONE, in the same commit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const exists = (p) => existsSync(new URL(p, root));
const content = JSON.parse(read('content.json'));
const js = readdirSync(new URL('js/', root))
  .filter((f) => f.endsWith('.js'))
  .map((f) => read(`js/${f}`))
  .concat(readdirSync(new URL('js/games/', root)).map((f) => read(`js/games/${f}`)))
  .join('\n');
const css = read('styles.css');
const roadmap = read('docs/ROADMAP.md');
const lessons = content.worlds.flatMap((w) => w.units.flatMap((u) => u.lessons.map((l) => ({ ...l, level: w.level }))));

// the rows of the roadmap tables: { done, title } (title = the bold text, or the start of the row)
const rows = roadmap
  .split('\n')
  .filter((l) => /^\| (✅|➡️)/.test(l))
  .map((l) => {
    const cell = l.split(' | ')[1] || '';
    return { done: l.startsWith('| ✅'), title: (cell.match(/\*\*(.+?)\*\*/)?.[1] || cell).replace(/\.$/, '').trim() };
  });
const rowFor = (key) => rows.filter((r) => r.title.startsWith(key));

// title of a ✅ row -> where the feature is
const DONE = {
  'Moving scenes on every page from Toddler to Grade 2': () => content.stories.filter((s) => ['toddler', 'kg', 'grade1', 'grade2'].includes(s.level)).every((s) => s.pages.every((p) => p.act)),
  '"I\'ll read it myself"': () => /self-read/.test(read('js/games/story.js')),
  'The key word is linked to the picture': () => /isKeyToken/.test(read('js/games/story.js')),
  'Swipe to turn the page': () => /swipeToTurn/.test(read('js/games/story.js')),
  'Record a whole story': () => /Record a story/.test(read('js/parent.js')) && /VOICES_FILE_KIND/.test(read('js/storage.js')),
  'A recorded voice pack for the stories': () => exists('tools/make-voices.mjs') && Object.keys(JSON.parse(read('voices/index.json')).files).length > 10000,
  'Word-timed read-along from those recordings': () => exists('tools/align-words.mjs') && Object.keys(JSON.parse(read('voices/words.json')).words).length > 1500 && /timesFor/.test(read('js/games/story.js')),
  'Decodable stories for Grade 1': () => content.stories.filter((s) => s.decodable != null).length >= 10 && /nextDecodable/.test(read('js/screens.js')),
  'Backup and restore': () => /export function makeBackup/.test(read('js/storage.js')) && /export function readBackup/.test(read('js/storage.js')),
  "Shows whether the browser will keep the app's saves": () => /storage\?\.persisted/.test(js),
  'Installed apps ask to keep their storage at start; recordings ask when saved': () => /keepStorage/.test(read('js/storage.js')),
  'A long-standing bug: the "heart" picture': () => /^#/.test(content.words.heart?.color || ''),
  'Fill the screen in lessons': () => /--tap: clamp\(108px, min\(27vw, 25vh\)/.test(css),
  'A simpler home screen for pre-readers': () => /export const simpleHome/.test(read('js/screens.js')),
  'Give story characters life': () => /\.scene\.mood-happy/.test(css) && /class="eye"/.test(read('js/art-kit.js')),
  'Depth in the backgrounds': () => /export const ambientLife/.test(read('js/art-scenes.js')) && /class="layer far"/.test(read('js/art-scenes.js')),
  'One language rule, everywhere': () => /export function sayText/.test(read('js/screens.js')),
  'Fix the wrong or awkward captions': () => content.phrases.readFind?.en === 'Find the {w} house',
  'Make collections playable': () => /function stickerScene/.test(read('js/screens.js')) && /scenes:/.test(read('js/logic.js')),
  'A guide with far more to say': () => content.mascotLines.length >= 40 && !!content.guide && exists('js/guide.js'),
  "Toddler: 12 more tiny stories about the child's own day": () => content.stories.filter((s) => s.level === 'toddler').length >= 18,
  'Rhymes and counting-out games': () => content.stories.filter((s) => s.kind === 'poem' && s.source).length >= 12,
  'Counting stories': () => content.stories.filter((s) => s.pages.some((p) => Number.isInteger(p.act?.count))).length >= 8,
  'गिनती: Hindi numbers as their own strand': () => content.numbers.length === 100 && exists('js/games/ginti.js') && lessons.filter((l) => l.game === 'ginti').length >= 10,
  '"Ask me" prompts for the grown-up': () => content.stories.every((s) => ['complete', 'recall', 'open', 'why', 'you'].every((t) => s.talk?.some((p) => p.type === t && p.hi && p.en))) && /export function showTalk/.test(read('js/screens.js')),
  'Shared play for a grown-up and child': () => exists('js/games/together.js') && /export function togetherQuestion/.test(read('js/together.js')) && /together-btn/.test(read('js/screens.js')) && content.stories.every((s) => s.talk?.length === 5),
  'The counting game': () => /export const busSeats/.test(read('js/games/busdepot.js')) && /\.count-tag/.test(css),
  'The hint button in every game': () => /export function stepHint/.test(read('js/games/kit.js')) && ['construction', 'sentence', 'sequence', 'matra', 'railway', 'trace'].every((g) => read(`js/games/${g}.js`).includes('stepHint(')),
  'A 30-second "tap here" guide': () => exists('js/coach.js') && /coach\(how\.kind/.test(read('js/app.js')) && Object.keys(content.phrases).filter((k) => k.startsWith('coach')).length >= 6,
  'Move grown-up text off child screens': () => /export function infoButton/.test(read('js/ui.js')) && /forGrownups\(el\('p', \{ class: 'mode-note'/.test(read('js/shows.js')) && /forGrownups\(el\('p', \{ class: 'comic-howto'/.test(read('js/games/comic.js')),
  'Tablet layouts for the maps and the hub': () => /class: 'hub-top'/.test(read('js/screens.js')) && /@media \(min-width: 760px\) and \(min-height: 600px\) \{\s*\.hub-top/.test(css),
  'A guide that reacts to every answer': () => /REACTION_BUBBLES/.test(read('js/mascot.js')) && /mascot\.react\(firstTry \? 'clap' : 'cheer'\)/.test(read('js/app.js')) && /\.mascot\.m-think/.test(css),
  'Shared-element transitions': () => /function grow\(change, from, to\)/.test(read('js/app.js')) && /::view-transition-group\(grow\)/.test(css) && /\{ from: c \}/.test(read('js/screens.js')),
  'A motion budget and a slow-phone test': () => exists('tools/motion-budget.mjs') && exists('docs/MOTION-BUDGET.md') && /export function tooSlow/.test(read('js/motion.js')) && /\.lite \.backdrop \*/.test(css),
  'Hindi text animation': () => /export function strokeOrder/.test(read('js/logic.js')) && /writeItself/.test(read('js/games/trace.js')) && /export async function sayPieces/.test(read('js/games/kit.js')),
  'Haptics and sound polish': () => /export const FEEDBACK/.test(read('js/sfx.js')) && /export const sfxLevel/.test(read('js/sfx.js')) && /sfx\.feel\('wrong'\)/.test(read('js/app.js')),
  'Favourites and "read again"': () => exists('js/favourites.js') && /function readAgain\(api\)/.test(read('js/screens.js')) && /heartButton\(api, s, \{ cls: 'on-book' \}\)/.test(read('js/screens.js')),
  'Story radio': () => /export const SLEEP_STEPS/.test(read('js/shows.js')) && /class: 'radio-chip pick'/.test(read('js/shows.js')) && /'Play this one again'/.test(read('js/shows.js')),
  'A gentle daily rhythm': () => /export function stickyPlan/.test(read('js/curriculum.js')) && /export function weekTrail/.test(read('js/screens.js')) && /export async function celebrateDay/.test(read('js/screens.js')),
  "Little rewards that aren't stars": () => exists('js/rewards.js') && /export const OUTFITS/.test(read('js/mascot.js')) && /export function rewards\(api/.test(read('js/screens.js')),
  'Sing-along rhymes': () => /class: 'sing-ball'/.test(read('js/games/story.js')) && /m === 'sing'/.test(read('js/sfx.js')) && /\.sing-ball\.hop/.test(css),
  'Make-your-own story': () => exists('js/mybooks.js') && /recordBook\(api, w, placed, artOf\)/.test(read('js/screens.js')) && /function myShelf/.test(read('js/screens.js')),
  'An older child reads to a younger one': () => exists('js/readfor.js') && /readByRibbon\(story\.id\)/.test(read('js/games/story.js')) && /function missionCard/.test(read('js/screens.js')),
  'Free play between lessons': () => exists('js/freeplay.js') && /freeplayDue\(/.test(read('js/screens.js')) && ['drive', 'feed', 'colour'].every((m) => read('js/freeplay.js').includes(`'${m}'`)),
};

// title of an open row -> a sign in the code that it has been built (then its row must be ✅)
const WATCH = {
  'Share the backup': () => /navigator\.share\(/.test(js),
  'A "what\'s new" note': () => /whatsNew|changelog/i.test(js),
  'A surprise each day': () => /dailySurprise|gift-box/.test(js + css),
  '"Words I know" book': () => /wordsKnown|words-i-know/.test(js + css),
  'Festivals and seasons that arrive on their day': () => /FESTIVAL_DATES|festivalToday/.test(js),
  'More decodable books for Grade 1': () => content.stories.filter((s) => s.decodable != null).length >= 25,
  'A Grade 2 maths world': () => content.worlds.some((w) => w.subject === 'math' && w.level === 'grade2'),
  'पहाड़े: times tables sung the Hindi way': () => /पहाड़े/.test(JSON.stringify(content.worlds)),
  // (a Grade 4 quiz on days and months is already there; the row stays open for time and money)
  'Days, months, time and money in Hindi': () => /बजे|पैसे/.test(JSON.stringify(content.worlds.filter((w) => w.subject === 'hindi')) + JSON.stringify(content.quizzes || {})),
  'A reading-comfort option': () => /readingComfort|reading-comfort/.test(js + css),
};

test('every ticked roadmap item has a check, and the check finds it in the app', () => {
  for (const r of rows.filter((x) => x.done)) {
    const key = Object.keys(DONE).find((k) => r.title.startsWith(k));
    assert.ok(key, `"${r.title}" is ✅ but has no check in tests/roadmap.test.js: add one`);
    assert.ok(DONE[key](), `"${r.title}" is ✅ but its feature isn't in the app`);
  }
});

test('every feature checked as done is ticked in the roadmap', () => {
  for (const key of Object.keys(DONE)) {
    const found = rowFor(key);
    assert.equal(found.length, 1, `exactly one roadmap row starts "${key}"`);
    assert.ok(found[0].done, `"${key}" is built but its roadmap row is not ✅`);
  }
});

test('a feature from an open roadmap row that has been built is ticked', () => {
  for (const [key, built] of Object.entries(WATCH)) {
    const found = rowFor(key);
    assert.equal(found.length, 1, `exactly one roadmap row starts "${key}"`);
    if (built()) assert.ok(found[0].done, `"${key}" looks built (found in the code) but its roadmap row is not ✅`);
  }
});
