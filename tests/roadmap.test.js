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
  'Festivals and seasons that arrive on their day': () => exists('js/festivals.js') && /export function festivalNow/.test(read('js/festivals.js')) && content.stories.some((x) => x.id === 'k3-eid'),
  'A surprise each day': () => exists('js/surprise.js') && /function giftBox/.test(read('js/screens.js')) && /\.gift-box/.test(css),
  'For Grades 7–8': () =>
    ['riddleOfDay', 'idiomOfDay', 'comicMaker', 'duelScreen'].every((f) => js.includes(f)) &&
    (content.riddles || []).length >= 60 &&
    (content.idioms || []).length >= 30 &&
    /cornerButton\(api\)/.test(read('js/screens.js')) &&
    ['corner', 'idiom', 'comicmaker', 'duel'].every((r) => read('js/app.js').includes(`case '${r}':`)),
  'Share the backup': () => /nav\.share\(\{ files/.test(read('js/storage.js')) && /backupReminder\(api\)/.test(read('js/parent.js')) && /backupReminderDue\(\)/.test(read('js/screens.js')),
  'Maths games you do with your hands': () => exists('js/games/handson.js') && ['tenframe', 'numberline', 'pattern', 'shapes', 'measure', 'balance', 'shop', 'clock'].every((a) => content.worlds.some((w) => w.subject === 'math' && w.units.some((u) => u.lessons.some((l) => l.game === 'handson' && l.config.activity === a)))),
  'Performance budget': () => exists('tools/perf-budget.mjs') && exists('docs/PERFORMANCE.md') && /modulepreload/.test(read('index.html')) && /drawWhenSeen/.test(read('js/screens.js')) && /perf-budget\.mjs/.test(read('.github/workflows/test.yml')),
  'Split the content by grade': () => exists('content/core.json') && exists('js/packs.js') && /content\/core\.json/.test(read('sw.js')) && !/fetch\('content\.json'/.test(read('js/app.js')),
  'Automated checks on every pull request': () => exists('tools/browser-check.mjs') && /browser-check\.mjs --compare/.test(read('.github/workflows/test.yml')) && /pull_request/.test(read('.github/workflows/test.yml')),
  'An airplane-mode check in every release': () => /setOffline\(true\)/.test(read('tools/browser-check.mjs')) && /OFFLINE_LESSONS/.test(read('tools/browser-check.mjs')) && /browser-check\.mjs --out/.test(read('.github/workflows/test.yml')),
  'More Show time': () =>
    (content.showSeries || []).length >= 3 &&
    content.showSeries.every((sr) => {
      const eps = content.shows.filter((s) => s.series === sr.id);
      return eps.length >= 8 && eps.length <= 10 && eps.filter((s) => s.next).length === eps.length - 1 && eps.filter((s) => s.answer).length === eps.length - 1;
    }) &&
    /guideSays\(show\.next/.test(read('js/shows.js')),
  '"Words I know" book': () => exists('js/wordbook.js') && /wordsChip\(api\)/.test(read('js/screens.js')) && /case 'words'/.test(read('js/app.js')) && /\.words-page/.test(css),
  'Free play between lessons': () => exists('js/freeplay.js') && /freeplayDue\(/.test(read('js/screens.js')) && ['drive', 'feed', 'colour'].every((m) => read('js/freeplay.js').includes(`'${m}'`)),
  'Fill the gaps in Kindergarten and Grade 1': () => ['k-countback', 'k-ordinal', 'k-bond10', 'g1-countback', 'g1-skip', 'g1-doubles', 'g1-bond20', 'g1-fluency'].every((s) => JSON.stringify(content.worlds).includes(`"${s}"`)) && /"target":20/.test(JSON.stringify(content.worlds)) && /retry/.test(read('js/games/math.js')),
  'A Grade 2 maths world': () => (content.worlds.find((w) => w.subject === 'math' && w.level === 'grade2')?.units || []).reduce((n, u) => n + u.lessons.length, 0) >= 24,
  'Days, months, time and money in Hindi': () => exists('js/games/samay.js') && ['days', 'months', 'seasons', 'clock', 'pay'].every((m) => JSON.stringify(content.worlds.filter((w) => w.subject === 'hindi')).includes(`"${m}"`)) && /ढाई|डेढ़/.test(read('js/samay.js')) && /पैसे/.test(read('js/samay.js')),
  'पहाड़े: times tables sung the Hindi way': () => exists('js/games/pahade.js') && [2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) => content.worlds.some((w) => w.units.some((u) => u.lessons.some((l) => l.game === 'pahade' && (l.config.table === n || l.config.tables?.includes(n)))))) && /dhol/.test(read('js/sfx.js')),
  'Grade 3 and Grade 4 maths worlds': () => ['grade3', 'grade4'].every((lv) => (content.worlds.find((w) => w.subject === 'math' && w.level === lv)?.units || []).reduce((n, u) => n + u.lessons.length, 0) >= 20) && /g4-lakh/.test(read('js/mathgen.js')),
  'Maths stories and puzzles for older children': () => ['chess-rice', 'seventeen-camels', 'aryabhata-zero', 'birbal-biggest', 'tenali-jars'].every((id) => content.stories.some((s) => s.id === id)) && ['mu-1729', 'r-shakuntala', 'b-crows', 'd-lock', 'd-coins'].every((id) => content.comics.some((c) => c.id === id && c.guess)),
  'A reading-comfort option': () => /export function applyReadingComfort/.test(read('js/ui.js')) && /readingComfort: false/.test(read('js/logic.js')) && /\.reading-comfort \.story-page/.test(css) && /'Easier reading'/.test(read('js/parent.js')),
  'A "what\'s new" note': () => exists('changes.json') && /export function changesSince/.test(read('js/changes.js')) && /update-more/.test(read('js/app.js')) && /whatsNewSection/.test(read('js/parent.js')),
  "Children's-app store rules": () => /export function grownUpCheck/.test(read('js/screens.js')) && /Content-Security-Policy[\s\S]*connect-src 'self'/.test(read('index.html')) && exists('docs/PRIVACY.md') && /function privacySection/.test(read('js/parent.js')),
  'comprehension by question type': () => /export function questionType/.test(read('js/logic.js')) && /function storiesView/.test(read('js/parent.js')) && /ctx\.comprehend\?\./.test(read('js/games/story.js')) && /ctx\.readAlone\?\./.test(read('js/games/story.js')),
  'Local, private usage insight for grown-ups': () => /export function usageInsight/.test(read('js/curriculum.js')) && /function insightView/.test(read('js/parent.js')),
  'Read it aloud and hear yourself': () => /function readBack\(ctx, story, n, narration\)/.test(read('js/games/story.js')) && /readAloud: false/.test(read('js/logic.js')) && /function readAloudView/.test(read('js/parent.js')),
  'Content tooling': () => exists('tools/content-check.mjs') && exists('tools/style-rules.mjs') && /"check-content"/.test(read('package.json')),
  'Vehicle stories for Kindergarten': () => ['k4-firestation', 'k4-kooda', 'k4-raat-rail', 'k4-metro', 'k4-hawai-adda', 'k4-school-bus', 'k4-ambulance', 'k4-sadak'].every((id) => content.stories.some((s) => s.id === id && s.level === 'kg' && s.talk?.length === 5)) && lessons.filter((l) => l.config?.story?.startsWith('k4-')).length === 8,
  'Cumulative and call-back folk tales for Kindergarten and Grade 1': () => ['k5-matka', 'k5-chidiya-dana', 'k5-chidiya-kauwa', 'k5-gadha-gaana', 'g1b-chinti-tidda', 'g1b-teen-machhli', 'g1b-bagula', 'g1b-chuha-sher'].every((id) => content.stories.some((s) => s.id === id && s.talk?.length === 5)) && ['heron', 'grasshopper', 'sage'].every((w) => content.words[w]),
  'More decodable books for Grade 1': () => content.stories.filter((s) => s.decodable != null).length >= 28 && content.stories.some((s) => s.decodable === 5),
  'Ramayana and Krishna, continued': () => ['ram-shabari', 'ram-setu', 'ram-bharat', 'ram-ghar-aaye', 'k-sudama', 'k-kaliya', 'dhruv-tara', 'ganesh-chanda', 'arjun-aankh', 'eklavya'].every((id) => content.stories.some((s) => s.id === id && s.talk?.length === 5)) && ['ber', 'khadau', 'bharat', 'sudama', 'arjun', 'eklavya'].every((w) => content.words[w]),
  "Festival stories for everyone's calendar": () => ['fest-idgah', 'fest-sacha-sauda', 'fest-pahad-christmas', 'fest-lohri', 'fest-pongal', 'fest-mahabali', 'k3-gurpurab'].every((id) => content.stories.some((s) => s.id === id && s.talk?.length === 5)) && /export function festStory/.test(read('js/festivals.js')) && /id: 'gurpurab'/.test(read('js/festivals.js')),
  'Tales from across India': () => ['punyakoti', 'sheikh-chilli', 'jataka-bater', 'gonu-jha', 'birbal-hara-ghoda', 'birbal-oont', 'tenali-laal-mor', 'tenali-baingan', 'jataka-hiran', 'tejimola', 'lalkamal-neelkamal'].every((id) => content.stories.some((s) => s.id === id && s.talk?.length === 5)) && ['tenali', 'redpeacock', 'brinjal'].every((w) => content.words[w]),
  'More maths in Show time': () => ['km-count', 'km-compare', 'km-ten', 'km-shapes', 'km-measure'].every((u) => content.shows.some((s) => s.level === 'kg' && s.lang === 'en' && String(s.lesson).startsWith(u))),
};

// title of an open row -> a sign in the code that it has been built (then its row must be ✅)
const WATCH = {
  // the maths lines go into the voice pack (today only the fixed lessons' lines do)
  'Google voice for every word the app says': () => /mathgen/.test(read('js/logic.js') + read('tools/make-voices.mjs')),
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
