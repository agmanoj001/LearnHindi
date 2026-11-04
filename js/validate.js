// Validates content.json. Pure function: used by the app at startup and by tests.
import { SKILLS } from './mathgen.js';
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
];
export const OPPOSITE_KINDS = ['size', 'height', 'speed'];
export const PAIR_KINDS = ['opposite', 'plural', 'female'];
export const READ_MODES = ['find', 'match'];
export const ACTIVITIES = ['dig', 'deliver', 'build'];
export const SUBJECTS = ['hindi', 'math'];
// who helps inside the games; a world may name its own (see README)
export const HELPER_ROLES = ['courier', 'vendor', 'lifter', 'rescuer', 'holder', 'engine'];

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
            if (!isStr(p?.hi) || !DEVANAGARI.test(p.hi)) err(`${at}.pages[${j}].hi must be Devanagari text`);
            if (!isStr(p?.en)) err(`${at}.pages[${j}].en is required`);
          });
        (Array.isArray(s.questions) ? s.questions : []).forEach((q, j) => {
          const qat = `${at}.questions[${j}]`;
          if (!hasText(q)) err(`${qat} needs "hi" and "en"`);
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
      if (w.subject === 'math' && w.lang !== 'en') err(`${wat}: math worlds are in English (lang "en")`);
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
          if (lesson.game === 'story' && !cfg.story && !(c.stories || []).some((st) => lv.includes(st.level))) err(`${lat} (${lesson.id}): no stories for levels ${lv.join(', ')}`);
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
