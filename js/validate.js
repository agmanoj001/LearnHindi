// Validates content.json. Pure function: used by the app at startup and by tests.
import { SKILLS } from './mathgen.js';
import { PHONICS } from './phonicsgen.js';
import { BEAT_KINDS, beatKind, tapTokens } from './logic.js';
import { CAST, CAST_IDS, FACES, ARMS, PROPS, BACKGROUND_IDS } from './art-comic.js';

export const COMIC_SERIES = ['mishti', 'dadi', 'birbal', 'chippu', 'betal', 'murari'];
// Errors stop the app from using the content; warnings are shown in parent settings.

export const GAME_TYPES = [
  'construction',
  'busdepot',
  'rescue',
  'farm',
  'railway',
  'recycling',
  'opposites',
  'trace',
  'matra',
  'read',
  'sentence',
  'rhyme',
  'story',
  'pairs',
  'firstsound',
  'quiz',
  'sort',
  'math',
  'phonics',
  'sequence',
  'comic',
  'grammar',
];
export const GRAMMAR_KINDS = ['mcq', 'tap', 'sort'];
export const OPPOSITE_KINDS = ['size', 'height', 'speed'];
export const PAIR_KINDS = ['opposite', 'plural', 'female'];
export const READ_MODES = ['find', 'match'];
export const ACTIVITIES = ['dig', 'deliver', 'build'];
export const SUBJECTS = ['hindi', 'math', 'english'];
// who helps inside the games; a world may name its own (see README)
export const HELPER_ROLES = ['courier', 'vendor', 'lifter', 'rescuer', 'holder', 'engine', 'digger'];

export const REQUIRED_PHRASES = {
  title: false,
  welcome: false,
  find: true,
  thisIs: true,
  great: false,
  yay: false,
  dig: false,
  deliver: true,
  build: true,
  pickUp: true,
  getOn: false,
  getOff: false,
  howMany: false,
  rescue: true,
  whereIs: true,
  whoSays: true,
  nextLetter: false,
  whichBin: false,
  whichIs: true,
  trace: false,
  pickVehicle: false,
  newVehicle: true,
  special: false,
  readFind: true,
  readWord: false,
  fixMatra: false,
  makeSentence: false,
  rhymesWith: true,
  oppositeOf: true,
  pluralOf: true,
  femaleOf: true,
  listenStory: false,
  newItem: true,
  unitDone: false,
  startsWith: true,
}; // value: whether the phrase must contain the {w} placeholder

const DEVANAGARI = /[ऀ-ॿ]/;
const ID = /^[a-z0-9][a-z0-9-]*$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const AUDIO_FILE = /^[A-Za-z0-9_\-/]+\.(mp3|m4a|ogg|oga|wav|webm|aac)$/;

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isPosInt = (v) => Number.isInteger(v) && v > 0;
const hasText = (v) => isObj(v) && isStr(v.hi) && isStr(v.en);

// `pictureExists(id)` (or a `knownPictures` list) lets the validator warn about pictures with no drawing.
export function validateContent(c, { knownPictures = null, pictureExists = null, mascots = null, themes = null } = {}) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);
  const drawable = pictureExists || (knownPictures ? (id) => knownPictures.includes(id) : null);
  // icons: a word id or picture id, "letter:क" or "num"
  const checkIcon = (icon, at) => {
    if (!isStr(icon)) return err(`${at} is required`);
    if (icon.startsWith('letter:') || icon === 'num') return;
    const pic = c.words?.[icon]?.picture || icon;
    if (drawable && !drawable(pic)) warn(`${at} "${icon}" has no built-in drawing`);
  };

  if (!isObj(c)) return { errors: ['content must be a JSON object'], warnings };
  if (c.version !== 2) err('version must be 2');

  // tags: what worlds teach ("phonics": { "hi": "ध्वनि", "en": "Phonics", "color": "#…" })
  if (c.tags !== undefined && !isObj(c.tags)) err('tags must be an object');
  for (const [id, t] of Object.entries(isObj(c.tags) ? c.tags : {})) {
    if (!hasText(t)) err(`tags.${id} needs "hi" and "en"`);
    if (t?.color !== undefined && !HEX.test(t.color)) err(`tags.${id}.color must look like #ff0000`);
  }

  // phrases
  if (!isObj(c.phrases)) err('phrases must be an object');
  else {
    for (const [key, needsW] of Object.entries(REQUIRED_PHRASES)) {
      const p = c.phrases[key];
      if (!hasText(p)) {
        err(`phrases.${key} needs "hi" and "en" text`);
        continue;
      }
      if (!DEVANAGARI.test(p.hi)) err(`phrases.${key}.hi should be written in Devanagari`);
      if (needsW && (!p.hi.includes('{w}') || !p.en.includes('{w}'))) err(`phrases.${key} must contain {w} in both languages`);
    }
  }

  // levels first: words refer to them
  const levelIds = new Set(Array.isArray(c.levels) ? c.levels.filter(isObj).map((l) => l.id) : []);

  // words
  const words = isObj(c.words) ? c.words : {};
  if (!isObj(c.words)) err('words must be an object of id -> word');
  for (const [id, w] of Object.entries(words)) {
    const at = `words.${id}`;
    if (!ID.test(id)) err(`${at}: id must be lowercase letters, digits and dashes`);
    if (!isObj(w)) {
      err(`${at} must be an object`);
      continue;
    }
    if (!isStr(w.hi)) err(`${at}.hi is required`);
    else if (!DEVANAGARI.test(w.hi)) err(`${at}.hi should be written in Devanagari`);
    if (!isStr(w.translit)) err(`${at}.translit is required`);
    if (!isStr(w.en)) err(`${at}.en is required`);
    if (!isStr(w.picture)) err(`${at}.picture is required`);
    else if (drawable && !drawable(w.picture)) warn(`${at}.picture "${w.picture}" has no built-in drawing; a letter badge will be shown`);
    if (w.level !== undefined && !levelIds.has(w.level)) err(`${at}.level "${w.level}" is not one of the levels`);
    checkAudio(w.audio, at, err);
    if (w.syllables !== undefined) {
      if (!Array.isArray(w.syllables) || !w.syllables.every(isStr)) err(`${at}.syllables must be a list of text pieces`);
      else if (w.syllables.join('') !== w.hi) err(`${at}.syllables must join up to exactly "${w.hi}"`);
    }
    if (w.sound !== undefined && !hasText(w.sound)) err(`${at}.sound needs "hi" and "en"`);
    if (w.color !== undefined && !HEX.test(w.color)) err(`${at}.color must look like #ff0000`);
  }
  const hasWord = (id) => typeof id === 'string' && Object.prototype.hasOwnProperty.call(words, id);
  // a word list may use "@grade1" to mean every word of that level
  const wordRef = (id) => (typeof id === 'string' && id.startsWith('@') ? levelIds.has(id.slice(1)) : hasWord(id));
  const refCount = (list) =>
    list.reduce((n, id) => n + (id.startsWith('@') ? Object.values(words).filter((w) => w.level === id.slice(1)).length : 1), 0);

  // collections: stickers a world gives as lessons are finished
  const collectionIds = new Set();
  if (!isObj(c.collections)) err('collections must be an object');
  else
    for (const [id, col] of Object.entries(c.collections)) {
      collectionIds.add(id);
      if (!hasText(col?.name)) err(`collections.${id}.name needs "hi" and "en"`);
      if (!Array.isArray(col?.items) || col.items.length < 3) err(`collections.${id} needs at least 3 items`);
      else for (const w of col.items) if (!hasWord(w)) err(`collections.${id}: "${w}" not found in words`);
      if (col?.start !== undefined && (!Number.isInteger(col.start) || col.start < 0 || col.start > (col.items?.length || 0))) err(`collections.${id}.start must be 0 to the number of items`);
    }

  // sentences
  if (c.sentences !== undefined) {
    if (!Array.isArray(c.sentences)) err('sentences must be a list');
    else {
      const seen = new Set();
      for (const [i, s] of c.sentences.entries()) {
        const at = `sentences[${i}]`;
        if (!isObj(s) || !isStr(s.id)) {
          err(`${at} needs an id`);
          continue;
        }
        if (seen.has(s.id)) err(`sentences: duplicate id "${s.id}"`);
        seen.add(s.id);
        if (s.about !== undefined && !hasWord(s.about)) err(`${at}: about "${s.about}" not found in words`);
        if (s.level !== undefined && !levelIds.has(s.level)) err(`${at}: level "${s.level}" is not one of the levels`);
        if (!isStr(s.hi) || !DEVANAGARI.test(s.hi)) err(`${at}.hi must be Devanagari text`);
        if (!isStr(s.en)) err(`${at}.en is required`);
        checkAudio(s.audio, at, err);
      }
    }
  }

  // numbers
  if (!Array.isArray(c.numbers) || c.numbers.length !== 10) err('numbers must list 1 to 10');
  else {
    c.numbers.forEach((n, i) => {
      const at = `numbers[${i}]`;
      if (!isObj(n) || n.value !== i + 1) err(`${at}.value must be ${i + 1}`);
      if (!isStr(n?.hi) || !DEVANAGARI.test(n.hi)) err(`${at}.hi must be Devanagari text`);
      if (!isStr(n?.en)) err(`${at}.en is required`);
      if (!isStr(n?.digitHi)) err(`${at}.digitHi is required`);
      checkAudio(n?.audio, at, err);
    });
  }

  // letters
  const setIds = new Set();
  if (!Array.isArray(c.letterSets) || !c.letterSets.length) err('letterSets must be a non-empty list');
  else {
    const letterIds = new Set();
    for (const [i, s] of c.letterSets.entries()) {
      const at = `letterSets[${i}]`;
      if (!isObj(s) || !isStr(s.id)) {
        err(`${at} needs an id`);
        continue;
      }
      if (setIds.has(s.id)) err(`letterSets: duplicate id "${s.id}"`);
      setIds.add(s.id);
      if (s.lang !== 'hi' && s.lang !== 'en') err(`${at} (${s.id}).lang must be "hi" or "en"`);
      if (!hasText(s.name)) err(`${at} (${s.id}).name needs "hi" and "en"`);
      if (!Array.isArray(s.letters) || s.letters.length < 3) {
        err(`${at} (${s.id}) needs at least 3 letters`);
        continue;
      }
      const chars = new Set();
      for (const [j, l] of s.letters.entries()) {
        const lat = `${at}.letters[${j}]`;
        if (!isObj(l) || !isStr(l.id) || !isStr(l.char)) {
          err(`${lat} needs "id" and "char"`);
          continue;
        }
        const lid = l.id.toLowerCase();
        if (letterIds.has(lid)) err(`${lat}: duplicate letter id "${l.id}" (ids are compared ignoring case)`);
        letterIds.add(lid);
        if (chars.has(l.char)) err(`${lat}: "${l.char}" appears twice in ${s.id}`);
        chars.add(l.char);
        if (s.lang === 'hi' && !DEVANAGARI.test(l.char)) err(`${lat}: "${l.char}" is not Devanagari`);
        if (s.lang === 'en' && !/^[A-Za-z]$/.test(l.char)) err(`${lat}: "${l.char}" is not a single English letter`);
        if (!isStr(l.translit)) err(`${lat}.translit is required`);
        if (l.word !== undefined && !hasWord(l.word)) err(`${lat}: word "${l.word}" not found in words`);
        checkAudio(l.audio, lat, err);
      }
    }
  }

  // matras
  const matraIds = new Set();
  if (c.matras !== undefined) {
    if (!Array.isArray(c.matras)) err('matras must be a list');
    else
      c.matras.forEach((m, i) => {
        const at = `matras[${i}]`;
        if (!isObj(m) || !isStr(m.id)) return err(`${at} needs an id`);
        if (matraIds.has(m.id)) err(`matras: duplicate id "${m.id}"`);
        matraIds.add(m.id);
        if (!isStr(m.sign) || !/^[ऀ-ॿ]+$/.test(m.sign)) err(`${at}.sign must be a Devanagari vowel sign like "ा"`);
        if (!isStr(m.vowel) || !DEVANAGARI.test(m.vowel)) err(`${at}.vowel must be the Devanagari vowel, like "आ"`);
        if (!isStr(m.translit)) err(`${at}.translit is required`);
      });
  }

  // stories
  const storyLevels = new Set();
  if (c.stories !== undefined) {
    if (!Array.isArray(c.stories)) err('stories must be a list');
    else {
      const seen = new Set();
      c.stories.forEach((s, i) => {
        const at = `stories[${i}]`;
        if (!isObj(s) || !isStr(s.id)) return err(`${at} needs an id`);
        if (seen.has(s.id)) err(`stories: duplicate id "${s.id}"`);
        seen.add(s.id);
        if (!levelIds.has(s.level)) err(`${at} (${s.id}): level "${s.level}" is not one of the levels`);
        else storyLevels.add(s.level);
        if (!hasText(s.title)) err(`${at} (${s.id}).title needs "hi" and "en"`);
        if (!hasWord(s.cover)) err(`${at} (${s.id}).cover must be a word id`);
        if (!Array.isArray(s.pages) || !s.pages.length) err(`${at} (${s.id}) needs at least one page`);
        else
          s.pages.forEach((p, j) => {
            if (!hasWord(p?.word)) err(`${at}.pages[${j}].word must be a word id (its picture is shown)`);
            // English-only stories ("lang": "en", e.g. nursery rhymes) have no Hindi text
            if (s.lang !== 'en' && (!isStr(p?.hi) || !DEVANAGARI.test(p.hi))) err(`${at}.pages[${j}].hi must be Devanagari text`);
            if (!isStr(p?.en)) err(`${at}.pages[${j}].en is required`);
          });
        (Array.isArray(s.questions) ? s.questions : []).forEach((q, j) => {
          const qat = `${at}.questions[${j}]`;
          if (s.lang === 'en' ? !isStr(q?.en) : !hasText(q)) err(`${qat} needs ${s.lang === 'en' ? '"en"' : '"hi" and "en"'}`);
          // picture options are word ids; "text": true questions have short Hindi answers instead
          if (!Array.isArray(q?.options) || q.options.length < 2) err(`${qat}.options needs at least 2 ${q?.text ? 'answers' : 'word ids'}`);
          else {
            if (q.text) {
              for (const o of q.options) if (!isStr(o) || !o.trim()) err(`${qat}: options must be text`);
            } else for (const o of q.options) if (!hasWord(o)) err(`${qat}: option "${o}" not found in words`);
            if (!q.options.includes(q.answer)) err(`${qat}.answer must be one of its options`);
          }
        });
        if (s.moral !== undefined && !hasText(s.moral)) err(`${at} (${s.id}).moral needs "hi" and "en"`);
        if (s.kind !== undefined && !['story', 'poem'].includes(s.kind)) err(`${at} (${s.id}).kind must be "story" or "poem"`);
        if (s.lang !== undefined && !['hi', 'en'].includes(s.lang)) err(`${at} (${s.id}).lang must be "hi" or "en"`);
      });
    }
  }

  // quiz banks: a question, options and the answer (options are word ids when "pictures" is true)
  for (const [id, bank] of Object.entries(isObj(c.quizzes) ? c.quizzes : {})) {
    const at = `quizzes.${id}`;
    if (!hasText(bank?.title)) err(`${at}.title needs "hi" and "en"`);
    if (!Array.isArray(bank?.questions) || !bank.questions.length) {
      err(`${at} needs questions`);
      continue;
    }
    bank.questions.forEach((q, i) => {
      const qat = `${at}.questions[${i}]`;
      if (!isStr(q?.hi) || !DEVANAGARI.test(q.hi)) err(`${qat}.hi must be Devanagari text`);
      if (!Array.isArray(q?.options) || q.options.length < 2 || !q.options.every(isStr)) return err(`${qat}.options needs at least 2 answers`);
      if (new Set(q.options).size !== q.options.length) err(`${qat}.options has duplicates`);
      if (!q.options.includes(q.answer)) err(`${qat}.answer must be one of its options`);
      if (q.pictures) for (const o of q.options) if (!hasWord(o)) err(`${qat}: picture option "${o}" not found in words`);
      if (q.word !== undefined && !hasWord(q.word)) err(`${qat}.word "${q.word}" not found in words`);
      if (q.show !== undefined && (!isStr(q.show) || !q.show.includes('___'))) err(`${qat}.show must contain ___ where the answer goes`);
    });
  }
  // sorts: put each item in its bin
  for (const [id, def] of Object.entries(isObj(c.sorts) ? c.sorts : {})) {
    const at = `sorts.${id}`;
    if (!hasText(def?.prompt)) err(`${at}.prompt needs "hi" and "en"`);
    const bins = Array.isArray(def?.bins) ? def.bins : [];
    if (bins.length < 2 || !bins.every((b) => isStr(b?.id) && hasText(b))) err(`${at}.bins needs at least 2 bins with id, hi and en`);
    const binIds = new Set(bins.map((b) => b?.id));
    if (!Array.isArray(def?.items) || def.items.length < 4) err(`${at} needs at least 4 items`);
    else
      def.items.forEach((it, i) => {
        if (!isStr(it?.text)) err(`${at}.items[${i}].text is required`);
        if (!binIds.has(it?.bin)) err(`${at}.items[${i}].bin "${it?.bin}" is not one of the bins`);
        if (it?.word !== undefined && !hasWord(it.word)) err(`${at}.items[${i}].word "${it.word}" not found in words`);
      });
  }

  // per-game settings: each lesson's settings on top of the shared ones in "games"
  const g = isObj(c.games) ? c.games : {};
  if (!isObj(c.games)) err('games must be an object');
  const lettersSpec = (spec, at) => {
    if (spec === undefined || spec === false) return;
    if (!isObj(spec) || !Array.isArray(spec.sets) || !spec.sets.length || !spec.sets.every((x) => setIds.has(x))) return err(`${at} must be false or { "sets": [letter set ids], "from": 0, "to": 10 }`);
    for (const k of ['from', 'to']) if (spec[k] !== undefined && !(Number.isInteger(spec[k]) && spec[k] >= 0)) err(`${at}.${k} must be a whole number`);
    if (spec.from !== undefined && spec.to !== undefined && spec.to - spec.from < 3) err(`${at} needs at least 3 letters`);
  };
  const checkGame = (type, x, at) => {
    const wordList = (key, min, check) => {
      const list = x[key];
      if (!Array.isArray(list) || !list.length) return err(`${at}.${key} needs a list of word ids`);
      for (const id of list) {
        if (!wordRef(id)) err(`${at}.${key}: "${id}" not found in words (or not a level like "@grade1")`);
        else if (check && !id.startsWith('@')) check(id, words[id]);
      }
      if (refCount(list) < min) err(`${at}.${key} needs at least ${min} words`);
    };
    const count = (key) => {
      if (!isPosInt(x[key])) err(`${at}.${key} must be a whole number above 0`);
    };
    const levelsList = (key) => {
      if (x[key] === undefined) return;
      if (!Array.isArray(x[key]) || !x[key].every((l) => levelIds.has(l))) err(`${at}.${key} must list level ids`);
    };
    switch (type) {
      case 'construction':
        lettersSpec(x.letters, `${at}.letters`);
        count('digLetters');
        count('deliverRounds');
        count('buildRounds');
        wordList('buildWords', 1);
        if (x.digWords !== undefined) wordList('digWords', 3);
        if (x.activities !== undefined && (!Array.isArray(x.activities) || !x.activities.length || !x.activities.every((a) => ACTIVITIES.includes(a))))
          err(`${at}.activities must list some of ${ACTIVITIES.join(', ')}`);
        break;
      case 'busdepot':
        count('pickupRounds');
        count('countRounds');
        if (!isPosInt(x.maxPassengers) || x.maxPassengers < 3 || x.maxPassengers > 10) err(`${at}.maxPassengers must be 3 to 10`);
        wordList('passengers', 3);
        if (x.parts !== undefined && (!Array.isArray(x.parts) || !x.parts.length || !x.parts.every((p) => ['pickup', 'count'].includes(p)))) err(`${at}.parts must list "pickup" and/or "count"`);
        break;
      case 'rescue':
        lettersSpec(x.letters, `${at}.letters`);
        if (!hasWord(x.vehicle)) err(`${at}.vehicle must be a word id (the vehicle that comes to the rescue)`);
        count('rounds');
        wordList('words', 3);
        if (x.cards !== undefined && !['picture', 'text'].includes(x.cards)) err(`${at}.cards must be "picture" or "text"`);
        break;
      case 'farm':
        count('rounds');
        wordList('animals', 3, (id, w) => {
          if (!w.sound) err(`${at}.animals: "${id}" needs a "sound"`);
        });
        break;
      case 'railway':
        lettersSpec(x.letters, `${at}.letters`);
        count('carriages');
        break;
      case 'recycling':
        count('rounds');
        if (!isPosInt(x.bins) || x.bins < 2) err(`${at}.bins must be 2 or more`);
        if (x.modes !== undefined && (!Array.isArray(x.modes) || !x.modes.length || !x.modes.every((m) => ['color', 'shape'].includes(m)))) err(`${at}.modes must list "color" and/or "shape"`);
        wordList('colors', 2, (id, w) => {
          if (!w.color) err(`${at}.colors: "${id}" needs a "color"`);
        });
        wordList('shapes', 2, (id, w) => {
          if (!String(w.picture).startsWith('shape-')) err(`${at}.shapes: "${id}" needs a shape-* picture`);
        });
        break;
      case 'opposites':
        count('rounds');
        if (!Array.isArray(x.pairs) || !x.pairs.length) err(`${at}.pairs needs at least one pair`);
        else
          x.pairs.forEach((p, i) => {
            if (!hasWord(p?.a) || !hasWord(p?.b)) err(`${at}.pairs[${i}]: "a" and "b" must be word ids`);
            if (!OPPOSITE_KINDS.includes(p?.kind)) err(`${at}.pairs[${i}].kind must be one of ${OPPOSITE_KINDS.join(', ')}`);
            if (!hasWord(p?.vehicle)) err(`${at}.pairs[${i}].vehicle must be a word id`);
          });
        break;
      case 'trace': {
        lettersSpec(x.letters, `${at}.letters`);
        count('count');
        const t = x.threshold;
        if (typeof t !== 'number' || t <= 0 || t > 1) err(`${at}.threshold must be between 0 and 1`);
        break;
      }
      case 'matra':
        count('rounds');
        if (!Array.isArray(x.consonants) || !x.consonants.length || !x.consonants.every((k) => isStr(k) && DEVANAGARI.test(k)))
          err(`${at}.consonants must list Devanagari consonants`);
        if (!Array.isArray(x.matras) || x.matras.length < 3 || !x.matras.every((m) => matraIds.has(m))) err(`${at}.matras must list at least 3 ids from "matras"`);
        wordList('words', 3);
        break;
      case 'read':
        count('rounds');
        wordList('words', 3);
        if (x.modes !== undefined && (!Array.isArray(x.modes) || !x.modes.length || !x.modes.every((m) => READ_MODES.includes(m))))
          err(`${at}.modes must list some of ${READ_MODES.join(', ')}`);
        break;
      case 'sentence':
        count('rounds');
        levelsList('levels');
        break;
      case 'rhyme':
        count('rounds');
        if (!Array.isArray(x.groups) || !x.groups.length) err(`${at}.groups needs rhyming word groups`);
        else {
          x.groups.forEach((grp, i) => {
            if (grp?.lang !== 'hi' && grp?.lang !== 'en') err(`${at}.groups[${i}].lang must be "hi" or "en"`);
            if (!Array.isArray(grp?.words) || grp.words.length < 2) err(`${at}.groups[${i}] needs at least 2 rhyming words`);
            else for (const id of grp.words) if (!hasWord(id)) err(`${at}.groups[${i}]: "${id}" not found in words`);
          });
          for (const lang of ['hi', 'en']) {
            const n = x.groups.filter((grp) => grp?.lang === lang).length;
            if (n === 1) err(`${at}.groups: ${lang} needs at least 2 groups (one gives the answer, the others the wrong choices)`);
          }
        }
        break;
      case 'story':
        levelsList('levels');
        if (x.story !== undefined && !(c.stories || []).some((st) => st.id === x.story)) err(`${at}.story "${x.story}" is not a story id`);
        break;
      case 'firstsound':
        count('rounds');
        lettersSpec(x.letters, `${at}.letters`);
        wordList('words', 6);
        break;
      case 'quiz':
        if (!isObj(c.quizzes?.[x.bank])) err(`${at}.bank "${x.bank}" is not in quizzes`);
        if (x.rounds !== undefined) count('rounds');
        break;
      case 'sort':
        if (!isObj(c.sorts?.[x.sort])) err(`${at}.sort "${x.sort}" is not in sorts`);
        if (x.rounds !== undefined) count('rounds');
        break;
      case 'math':
        if (!Array.isArray(x.skills) || !x.skills.length) err(`${at}.skills must list math skills`);
        else for (const s of x.skills) if (!SKILLS[s]) err(`${at}: "${s}" is not a math skill (see js/mathgen.js)`);
        if (x.rounds !== undefined) count('rounds');
        break;
      case 'sequence':
        if (x.story !== undefined && !(c.stories || []).some((st) => st.id === x.story)) err(`${at}.story "${x.story}" is not a story id`);
        if (x.rounds !== undefined) count('rounds');
        break;
      case 'phonics':
        if (!Array.isArray(x.skills) || !x.skills.length) err(`${at}.skills must list phonics skills`);
        else for (const s of x.skills) if (!PHONICS[s]) err(`${at}: "${s}" is not a phonics skill (see js/phonicsgen.js)`);
        if (x.rounds !== undefined) count('rounds');
        break;
      case 'pairs':
        count('rounds');
        if (!isObj(x.sets)) err(`${at}.sets must be an object`);
        else
          for (const [kind, pairs] of Object.entries(x.sets)) {
            if (!PAIR_KINDS.includes(kind)) err(`${at}.sets.${kind}: kind must be one of ${PAIR_KINDS.join(', ')}`);
            if (!Array.isArray(pairs) || pairs.length < 2) err(`${at}.sets.${kind} needs at least 2 pairs`);
            else
              pairs.forEach((p, i) => {
                if (!Array.isArray(p) || p.length !== 2 || !p.every(hasWord)) err(`${at}.sets.${kind}[${i}] must be two word ids`);
              });
          }
        if (!Array.isArray(x.kinds) || !x.kinds.length || !x.kinds.every((k) => isObj(x.sets) && k in x.sets)) err(`${at}.kinds must list kinds from sets`);
        break;
    }
  };

  // levels (grades)
  if (!Array.isArray(c.levels) || !c.levels.length) err('levels must be a non-empty list');
  else
    c.levels.forEach((l, i) => {
      const at = `levels[${i}]`;
      if (!isObj(l) || !isStr(l.id) || !ID.test(l.id)) return err(`${at} needs an id of lowercase letters, digits and dashes`);
      if (!hasText(l.name)) err(`${at} (${l.id}).name needs "hi" and "en"`);
      if (!isStr(l.age)) err(`${at} (${l.id}).age is required`);
      if (!isStr(l.about)) err(`${at} (${l.id}).about is required`);
      if (l.picture !== undefined && drawable && !drawable(c.words?.[l.picture]?.picture || l.picture)) warn(`${at} (${l.id}).picture "${l.picture}" has no built-in drawing`);
    });

  // worlds -> units -> lessons
  const lessonIds = new Set();
  if (!Array.isArray(c.worlds) || !c.worlds.length) err('worlds must be a non-empty list');
  else {
    const worldIds = new Set();
    c.worlds.forEach((w, wi) => {
      const at = `worlds[${wi}]`;
      if (!isObj(w) || !isStr(w.id) || !ID.test(w.id)) return err(`${at} needs an id of lowercase letters, digits and dashes`);
      if (worldIds.has(w.id)) err(`worlds: duplicate id "${w.id}"`);
      worldIds.add(w.id);
      const wat = `${at} (${w.id})`;
      if (!levelIds.has(w.level)) err(`${wat}.level "${w.level}" is not one of the levels`);
      if (!SUBJECTS.includes(w.subject)) err(`${wat}.subject must be ${SUBJECTS.join(' or ')}`);
      if (w.lang !== undefined && !['hi', 'en', 'both'].includes(w.lang)) err(`${wat}.lang must be hi, en or both`);
      if ((w.subject === 'math' || w.subject === 'english') && w.lang !== 'en') err(`${wat}: ${w.subject} worlds are in English (lang "en")`);
      // what the world teaches, from "tags"
      if (!Array.isArray(w.tags) || !w.tags.length) err(`${wat}.tags must list what the world teaches`);
      else for (const t of w.tags) if (!isObj(c.tags?.[t])) err(`${wat}.tags: "${t}" is not in tags`);
      if (w.helpers !== undefined) {
        if (!isObj(w.helpers)) err(`${wat}.helpers must be an object`);
        else
          for (const [role, id] of Object.entries(w.helpers)) {
            if (!HELPER_ROLES.includes(role)) err(`${wat}.helpers: "${role}" is not one of ${HELPER_ROLES.join(', ')}`);
            if (!hasWord(id)) err(`${wat}.helpers.${role} "${id}" is not a word id`);
          }
      }
      if (!hasText(w.name)) err(`${wat}.name needs "hi" and "en"`);
      if (!HEX.test(w.color || '')) err(`${wat}.color must look like #ff0000`);
      if (!collectionIds.has(w.collection)) err(`${wat}.collection "${w.collection}" is not in collections`);
      if (mascots && !mascots.includes(w.mascot)) err(`${wat}.mascot "${w.mascot}" is not one of ${mascots.join(', ')}`);
      if (themes && !themes.includes(w.theme)) err(`${wat}.theme "${w.theme}" is not one of ${themes.join(', ')}`);
      if (!Array.isArray(w.letterSets) || !w.letterSets.every((x) => setIds.has(x))) err(`${wat}.letterSets must list letter set ids (or be empty)`);
      if (!Array.isArray(w.units) || !w.units.length) return err(`${wat} needs at least one unit`);
      const unitIds = new Set();
      w.units.forEach((u, ui) => {
        const uat = `${wat}.units[${ui}]`;
        if (!isObj(u) || !isStr(u.id)) return err(`${uat} needs an id`);
        if (unitIds.has(u.id)) err(`${wat}: duplicate unit id "${u.id}"`);
        unitIds.add(u.id);
        if (!hasText(u.title)) err(`${uat} (${u.id}).title needs "hi" and "en"`);
        if (!isStr(u.skill)) err(`${uat} (${u.id}).skill is required (e.g. "Phonics")`);
        checkIcon(u.icon, `${uat} (${u.id}).icon`);
        if (!Array.isArray(u.lessons) || !u.lessons.length) return err(`${uat} (${u.id}) needs at least one lesson`);
        u.lessons.forEach((lesson, li) => {
          const lat = `${uat}.lessons[${li}]`;
          if (!isObj(lesson) || !isStr(lesson.id)) return err(`${lat} needs an id`);
          if (lessonIds.has(lesson.id)) err(`lessons: duplicate id "${lesson.id}"`);
          lessonIds.add(lesson.id);
          if (!GAME_TYPES.includes(lesson.game)) return err(`${lat} (${lesson.id}): unknown game "${lesson.game}"`);
          if (!hasText(lesson.title)) err(`${lat} (${lesson.id}).title needs "hi" and "en"`);
          checkIcon(lesson.icon, `${lat} (${lesson.id}).icon`);
          if (lesson.config !== undefined && !isObj(lesson.config)) return err(`${lat} (${lesson.id}).config must be an object`);
          const cfg = { ...(g[lesson.game] || {}), ...(lesson.config || {}) };
          checkGame(lesson.game, cfg, `${lat} (${lesson.id})`);
          // reading games need something to read at this level
          const lv = cfg.levels || [w.level];
          if (lesson.game === 'sentence' && !(c.sentences || []).some((st) => lv.includes(st.level))) err(`${lat} (${lesson.id}): no sentences for levels ${lv.join(', ')}`);
          if (lesson.game === 'comic' && !(c.comics || []).some((cm) => cm.id === cfg.comic)) err(`${lat} (${lesson.id}).config.comic "${cfg.comic}" is not a comic id`);
          if (lesson.game === 'grammar') {
            const ids = cfg.topics ?? [cfg.topic];
            if (!Array.isArray(ids) || !ids.length) err(`${lat} (${lesson.id}).config.topics must list grammar topic ids`);
            else
              for (const t of ids) {
                if (!isObj(c.grammar?.[t])) err(`${lat} (${lesson.id}): "${t}" is not a grammar topic`);
                else if (c.grammar[t].level !== w.level) warn(`${lat} (${lesson.id}): topic "${t}" is for ${c.grammar[t].level}, the world is ${w.level}`);
              }
            if (cfg.rounds !== undefined && !isPosInt(cfg.rounds)) err(`${lat} (${lesson.id}).config.rounds must be a whole number above 0`);
          }
          if ((lesson.game === 'story' || lesson.game === 'sequence') && !cfg.story && !(c.stories || []).some((st) => lv.includes(st.level))) err(`${lat} (${lesson.id}): no stories for levels ${lv.join(', ')}`);
          if (['railway', 'trace'].includes(lesson.game) && !cfg.letters && !w.letterSets.length) err(`${lat} (${lesson.id}) needs letters`);
          if (['matra', 'read', 'construction'].includes(lesson.game) && cfg.focus) {
            if (!Array.isArray(cfg.focus) || !cfg.focus.every((m) => matraIds.has(m) || m === 'an')) err(`${lat} (${lesson.id}).focus must list matra ids`);
            if (cfg.allow !== undefined && (!Array.isArray(cfg.allow) || !cfg.allow.every((m) => matraIds.has(m) || m === 'an'))) err(`${lat} (${lesson.id}).allow must list matra ids`);
          }
        });
      });
    });
  }

  // what a mascot says when tapped
  if (c.mascotLines !== undefined) {
    if (!Array.isArray(c.mascotLines)) err('mascotLines must be a list');
    else c.mascotLines.forEach((m, i) => !hasText(m) && err(`mascotLines[${i}] needs "hi" and "en"`));
  }

  // Show time: animated comic episodes (see README › Show time)
  if (c.shows !== undefined) {
    if (!Array.isArray(c.shows)) err('shows must be a list');
    else {
      const seen = new Set();
      const lessonIds = new Set((c.worlds || []).flatMap((w) => (w?.units || []).flatMap((u) => (u?.lessons || []).map((l) => l?.id))));
      const REACTS = ['happy', 'cheer', 'oops', 'silly', 'wave', 'dance', 'spin', 'sneeze'];
      const SOUNDS = ['pop', 'chime', 'sparkle', 'cheer', 'jingle', 'boing', 'whoosh', 'vroom', 'toot', 'thud', 'siren', 'page', 'sneeze'];
      const pct = (v) => typeof v === 'number' && v >= -40 && v <= 140;
      c.shows.forEach((show, i) => {
        const at = `shows[${i}]`;
        if (!isObj(show) || !isStr(show.id) || !ID.test(show.id)) return err(`${at} needs an id (lowercase letters, numbers and -)`);
        if (seen.has(show.id)) err(`shows: duplicate id "${show.id}"`);
        seen.add(show.id);
        const sat = `${at} (${show.id})`;
        const en = show.lang === 'en';
        if (!['hi', 'en'].includes(show.lang)) err(`${sat}.lang must be "hi" or "en"`);
        if (!levelIds.has(show.level)) err(`${sat}: level "${show.level}" is not one of the levels`);
        if (!(c.worlds || []).some((w) => w?.id === show.world)) err(`${sat}: world "${show.world}" not found`);
        if (!isObj(show.title) || !isStr(show.title.en) || (!en && !isStr(show.title.hi))) err(`${sat}.title needs ${en ? '"en"' : '"hi" and "en"'}`);
        if (!isObj(show.teaches) || !isStr(show.teaches.en)) err(`${sat}.teaches.en should say what the episode teaches (shown to grown-ups)`);
        if (show.lesson !== undefined && !lessonIds.has(show.lesson)) err(`${sat}.lesson "${show.lesson}" is not a lesson id`);
        if (show.recap !== undefined) {
          const r = show.recap;
          if (!isObj(r) || (!Array.isArray(r.words) && !Array.isArray(r.lines))) err(`${sat}.recap needs "words" (word ids) or "lines" (text)`);
          else (r.words || []).forEach((w) => !hasWord(w) && err(`${sat}.recap: word "${w}" not found`));
        }
        const text = (t, where) => {
          if (!isObj(t) || !isStr(t.en)) return err(`${where} needs "en"${en ? '' : ' and "hi"'}`);
          if (!en && (!isStr(t.hi) || !DEVANAGARI.test(t.hi))) err(`${where}.hi must be Devanagari text`);
        };
        if (!Array.isArray(show.scenes) || !show.scenes.length) return err(`${sat} needs at least one scene`);
        show.scenes.forEach((scene, j) => {
          const cat = `${sat}.scenes[${j}]`;
          if (!isObj(scene) || !isStr(scene.bg)) return err(`${cat}.bg must name a scene, like "jungle"`);
          if (themes && !themes.includes(scene.bg)) err(`${cat}.bg "${scene.bg}" is not one of ${themes.join(', ')}`);
          if (scene.actors !== undefined && !isObj(scene.actors)) err(`${cat}.actors must map a guide to where it stands, like {"chiku": 30}`);
          for (const [id, x] of Object.entries(isObj(scene.actors) ? scene.actors : {})) {
            if (mascots && !mascots.includes(id)) err(`${cat}.actors: "${id}" is not a guide`);
            if (!pct(x)) err(`${cat}.actors.${id} must be a position from 0 to 100`);
          }
          if (!Array.isArray(scene.beats) || !scene.beats.length) return err(`${cat} needs beats`);
          scene.beats.forEach((b, k) => {
            const bat = `${cat}.beats[${k}]`;
            const kind = beatKind(b);
            if (!kind) return err(`${bat} must be one of: ${BEAT_KINDS.join(', ')}`);
            const guide = (id, what) => mascots && !mascots.includes(id) && err(`${bat}.${what} "${id}" is not a guide`);
            if (kind === 'say') (guide(b.say, 'say'), text(b, bat));
            if (kind === 'narrate') text(b, bat);
            if (kind === 'enter' || kind === 'move' || kind === 'exit') guide(b[kind], kind);
            if (kind === 'enter' && !pct(b.at)) err(`${bat}.at must be a position from 0 to 100`);
            if (kind === 'move' && !pct(b.to)) err(`${bat}.to must be a position from 0 to 100`);
            if ((kind === 'say' && b.do !== undefined) || kind === 'do') {
              if (!REACTS.includes(b.do)) err(`${bat}.do must be one of ${REACTS.join(', ')}`);
              if (kind === 'do') guide(b.who, 'who');
            }
            if ((kind === 'show' || kind === 'word') && !hasWord(b[kind])) err(`${bat}: word "${b[kind]}" not found`);
            if (kind === 'letter' && (!isStr(b.letter) || !DEVANAGARI.test(b.letter))) err(`${bat}.letter must be a Devanagari letter`);
            if (kind === 'letter' && b.word !== undefined && !hasWord(b.word)) err(`${bat}: word "${b.word}" not found`);
            if (kind === 'glyph' && !isStr(b.glyph)) err(`${bat}.glyph must be text`);
            if (kind === 'build') {
              if (!Array.isArray(b.build) || b.build.length !== 2 || !b.build.every(isStr)) err(`${bat}.build must be two pieces, like ["न", "ा"]`);
              text(b, bat);
            }
            if (kind === 'tenframe' && (!Array.isArray(b.tenframe) || !b.tenframe.every((f) => isObj(f) && Number.isInteger(f.a) && f.a >= 0 && f.a + (f.b || 0) <= 10))) err(`${bat}.tenframe must be frames like [{"a": 6, "b": 4}] with at most 10 in each`);
            if (kind === 'ask') {
              text(b.ask, `${bat}.ask`);
              if (b.then !== undefined) text(b.then, `${bat}.then`);
              if (b.who !== undefined) guide(b.who, 'who');
              if (!Array.isArray(b.options) || b.options.length < 2) err(`${bat}.options needs at least 2`);
              else {
                if (b.kind === 'number') b.options.forEach((o) => typeof o !== 'number' && err(`${bat}: number options must be numbers`));
                else b.options.forEach((o) => !hasWord(o) && err(`${bat}: option "${o}" not found in words`));
                if (!b.options.includes(b.answer)) err(`${bat}.answer must be one of its options`);
              }
            }
            if (kind === 'echo') text(b.echo, `${bat}.echo`);
            if (kind === 'sfx' && !SOUNDS.includes(b.sfx)) err(`${bat}.sfx must be one of ${SOUNDS.join(', ')}`);
            if (kind === 'wait' && !(typeof b.wait === 'number' && b.wait > 0 && b.wait <= 10000)) err(`${bat}.wait must be milliseconds (up to 10000)`);
          });
        });
      });
    }
  }

  // Comics (Grades 7 and 8; see README › Writing a comic)
  if (c.comics !== undefined) {
    if (!Array.isArray(c.comics)) err('comics must be a list');
    else {
      const seen = new Set();
      c.comics.forEach((cm, i) => {
        const at = `comics[${i}]`;
        if (!isObj(cm) || !isStr(cm.id) || !ID.test(cm.id)) return err(`${at} needs an id (lowercase letters, numbers and -)`);
        if (seen.has(cm.id)) err(`comics: duplicate id "${cm.id}"`);
        seen.add(cm.id);
        const cat = `${at} (${cm.id})`;
        if (!COMIC_SERIES.includes(cm.series)) err(`${cat}.series must be one of ${COMIC_SERIES.join(', ')}`);
        if (!levelIds.has(cm.level)) err(`${cat}: level "${cm.level}" is not one of the levels`);
        if (!hasText(cm.title)) err(`${cat}.title needs "hi" and "en"`);
        const parts = isObj(cm.parts) ? cm.parts : {};
        for (const [id, part] of Object.entries(parts)) {
          if (!isObj(part) || !CAST[part.look]) err(`${cat}.parts.${id}.look must be one of the comic looks (${CAST_IDS.join(', ')})`);
          if (!isStr(part?.name)) err(`${cat}.parts.${id} needs a "name"`);
        }
        const known = (who) => !!CAST[who] || who in parts;
        if (!Array.isArray(cm.panels) || cm.panels.length < 4) return err(`${cat} needs at least 4 panels`);
        cm.panels.forEach((p, j) => {
          const pat = `${cat}.panels[${j}]`;
          if (!isObj(p)) return err(`${pat} must be an object`);
          if (!BACKGROUND_IDS.includes(p.bg) && !(themes || []).includes(p.bg)) err(`${pat}.bg "${p.bg}" is not a comic background (${BACKGROUND_IDS.join(', ')})`);
          if (!Array.isArray(p.cast)) err(`${pat}.cast must be a list`);
          for (const ch of p.cast || []) {
            if (!known(ch?.who)) err(`${pat}: "${ch?.who}" is not in the cast or this comic's parts`);
            if (!(typeof ch?.at === 'number' && ch.at >= 0 && ch.at <= 100)) err(`${pat}: ${ch?.who} needs a position "at" from 0 to 100`);
            if (ch?.face !== undefined && !FACES.includes(ch.face)) err(`${pat}: face "${ch.face}" must be one of ${FACES.join(', ')}`);
            if (ch?.arms !== undefined && !ARMS.includes(ch.arms)) err(`${pat}: arms "${ch.arms}" must be one of ${ARMS.join(', ')}`);
            if (ch?.hold !== undefined && !PROPS.includes(ch.hold)) err(`${pat}: hold "${ch.hold}" must be one of ${PROPS.join(', ')}`);
          }
          if (p.cap !== undefined && (!isStr(p.cap) || !DEVANAGARI.test(p.cap))) err(`${pat}.cap must be Hindi text`);
          for (const b of p.say || []) {
            if (!known(b?.who)) err(`${pat}: speaker "${b?.who}" is not in the cast or this comic's parts`);
            if (!isStr(b?.text) || !DEVANAGARI.test(b.text)) err(`${pat}: what ${b?.who} says must be Hindi text`);
            if (b?.kind !== undefined && !['shout', 'whisper', 'think'].includes(b.kind)) err(`${pat}: bubble kind must be shout, whisper or think`);
          }
          if (!p.cap && !(p.say || []).length) err(`${pat} needs a caption or a speech bubble`);
          if (p.prop !== undefined && !hasWord(p.prop?.word)) err(`${pat}.prop: word "${p.prop?.word}" not found`);
        });
        if (cm.guess !== undefined) {
          const g = cm.guess;
          if (!isObj(g) || !Number.isInteger(g.at) || g.at < 1 || g.at >= cm.panels.length) err(`${cat}.guess.at must be the panel the reveal starts at`);
          if (!isStr(g?.q)) err(`${cat}.guess needs a question "q"`);
          if (!Array.isArray(g?.options) || g.options.length < 2 || !g.options.includes(g.answer)) err(`${cat}.guess.answer must be one of its options`);
        }
        if (!Array.isArray(cm.words) || !cm.words.length) err(`${cat} needs a word list ("words")`);
        else cm.words.forEach((w, j) => (!isStr(w?.hi) || !isStr(w?.mean)) && err(`${cat}.words[${j}] needs "hi" and "mean"`));
        if (!Array.isArray(cm.questions) || !cm.questions.length) err(`${cat} needs questions`);
        else
          cm.questions.forEach((q, j) => {
            if (!isStr(q?.q)) err(`${cat}.questions[${j}] needs "q"`);
            if (!Array.isArray(q?.options) || q.options.length < 2 || !q.options.includes(q.answer)) err(`${cat}.questions[${j}].answer must be one of its options`);
          });
      });
    }
  }

  // Grammar (Grades 7 and 8; see README › Writing a grammar topic). [square brackets] mark what to highlight.
  if (c.grammar !== undefined) {
    if (!isObj(c.grammar)) err('grammar must be an object of topics');
    else
      for (const [id, t] of Object.entries(c.grammar)) {
        const at = `grammar.${id}`;
        if (!ID.test(id)) err(`${at}: id must be lowercase letters, numbers and -`);
        if (!isObj(t)) {
          err(`${at} must be an object`);
          continue;
        }
        if (!levelIds.has(t.level)) err(`${at}: level "${t.level}" is not one of the levels`);
        if (!hasText(t.title) || !DEVANAGARI.test(t.title.hi)) err(`${at}.title needs "hi" (Devanagari) and "en"`);
        // text that is shown: a string with balanced [marks]
        const text = (v, where, { hindi = true } = {}) => {
          if (!isStr(v)) return err(`${where} must be text`);
          if (hindi && !DEVANAGARI.test(v)) err(`${where} should be Hindi: "${v.slice(0, 30)}"`);
          if (!/^[^[\]]*(\[[^[\]]+\][^[\]]*)*$/.test(v)) err(`${where}: unbalanced [ ] in "${v.slice(0, 40)}"`);
        };
        if (!Array.isArray(t.learn)) err(`${at}.learn must be a list of cards`);
        else
          t.learn.forEach((card, k) => {
            const cat = `${at}.learn[${k}]`;
            if (!isObj(card)) return err(`${cat} must be an object`);
            text(card.title, `${cat}.title`);
            if (card.text !== undefined) text(card.text, `${cat}.text`);
            if (card.en !== undefined && !isStr(card.en)) err(`${cat}.en must be text`);
            if (card.text === undefined && card.table === undefined && card.examples === undefined) err(`${cat} needs text, a table or examples`);
            if (card.examples !== undefined) {
              if (!Array.isArray(card.examples) || !card.examples.length) err(`${cat}.examples must be a list`);
              else card.examples.forEach((x, j) => text(x, `${cat}.examples[${j}]`));
            }
            if (card.table !== undefined) {
              const tb = card.table;
              if (!isObj(tb) || !Array.isArray(tb.rows) || !tb.rows.length) return err(`${cat}.table needs rows`);
              const width = tb.head ? tb.head.length : tb.rows[0]?.length;
              if (tb.head !== undefined && (!Array.isArray(tb.head) || !tb.head.every((h) => typeof h === 'string'))) err(`${cat}.table.head must be a list of text (a corner cell may be empty)`);
              tb.rows.forEach((row, j) => {
                if (!Array.isArray(row) || !row.every(isStr)) return err(`${cat}.table.rows[${j}] must be a list of text`);
                if (row.length !== width) err(`${cat}.table.rows[${j}] has ${row.length} cells, the table has ${width} columns`);
                row.forEach((cell, n) => text(cell, `${cat}.table.rows[${j}][${n}]`, { hindi: false }));
              });
            }
          });
        if (!Array.isArray(t.practice) || t.practice.length < 6) {
          err(`${at}.practice needs at least 6 questions`);
          continue;
        }
        t.practice.forEach((q, k) => {
          const qat = `${at}.practice[${k}]`;
          if (!isObj(q)) return err(`${qat} must be an object`);
          if (!GRAMMAR_KINDS.includes(q.kind)) return err(`${qat}.kind must be one of ${GRAMMAR_KINDS.join(', ')}`);
          text(q.q, `${qat}.q`);
          text(q.why, `${qat}.why (the "क्यों?" explanation)`);
          if (q.kind === 'mcq') {
            if (q.s !== undefined) text(q.s, `${qat}.s`);
            if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) return err(`${qat}.options needs 2 to 4 choices`);
            q.options.forEach((o, j) => text(o, `${qat}.options[${j}]`, { hindi: false }));
            if (new Set(q.options).size !== q.options.length) err(`${qat}: repeated option`);
            if (!q.options.includes(q.answer)) err(`${qat}.answer must be one of its options`);
          }
          if (q.kind === 'tap') {
            if (!isStr(q.s)) return err(`${qat}.s must be the sentence to tap in`);
            if (/[[\]]/.test(q.s)) err(`${qat}.s: no [ ] marks in a tap sentence (it would give the answer away)`);
            if (!tapTokens(q.s).some((w) => w.core === q.answer)) err(`${qat}.answer "${q.answer}" is not a word in "${q.s}"`);
          }
          if (q.kind === 'sort') {
            if (!Array.isArray(q.bins) || q.bins.length < 2 || q.bins.length > 4 || !q.bins.every(isStr)) return err(`${qat}.bins needs 2 to 4 group names`);
            if (new Set(q.bins).size !== q.bins.length) err(`${qat}: repeated group`);
            if (!Array.isArray(q.items) || q.items.length < 3) return err(`${qat}.items needs at least 3 things to sort`);
            q.items.forEach((x, j) => (!isStr(x?.text) || !q.bins.includes(x?.bin)) && err(`${qat}.items[${j}] needs "text" and a "bin" that is one of its groups`));
            for (const b of q.bins) if (!q.items.some((x) => x?.bin === b)) warn(`${qat}: nothing goes in "${b}"`);
          }
        });
      }
  }

  return { errors, warnings };
}

function checkAudio(audio, at, err) {
  if (audio === undefined) return;
  if (!isObj(audio)) {
    err(`${at}.audio must be an object like {"hi": "file.mp3"}`);
    return;
  }
  for (const [lang, file] of Object.entries(audio)) {
    if (lang !== 'hi' && lang !== 'en') err(`${at}.audio: unknown language "${lang}"`);
    if (typeof file !== 'string' || !AUDIO_FILE.test(file) || file.includes('..') || file.startsWith('/')) {
      err(`${at}.audio.${lang}: "${file}" must be a file name inside audio/ (mp3, m4a, ogg, wav, webm or aac)`);
    }
  }
}
