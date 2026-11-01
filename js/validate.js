// Validates content.json. Pure function: used by the app at startup and by tests.
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
];
export const OPPOSITE_KINDS = ['size', 'height', 'speed'];
export const PAIR_KINDS = ['opposite', 'plural', 'female'];
export const READ_MODES = ['find', 'match'];
export const ACTIVITIES = ['dig', 'deliver', 'build'];

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
export function validateContent(c, { knownPictures = null, pictureExists = null } = {}) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);
  const drawable = pictureExists || (knownPictures ? (id) => knownPictures.includes(id) : null);

  if (!isObj(c)) return { errors: ['content must be a JSON object'], warnings };
  if (c.version !== 1) err('version must be 1');

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

  // vehicles
  if (!Array.isArray(c.vehicles) || !c.vehicles.length) err('vehicles must be a non-empty list');
  else {
    const seen = new Set();
    for (const [i, v] of c.vehicles.entries()) {
      if (!isObj(v) || !isStr(v.id)) {
        err(`vehicles[${i}] needs an id`);
        continue;
      }
      if (seen.has(v.id)) err(`vehicles: duplicate id "${v.id}"`);
      seen.add(v.id);
      if (!hasWord(v.id)) err(`vehicles: "${v.id}" has no matching entry in words`);
    }
    if (!c.vehicles.some((v) => v && v.unlockedByDefault)) warn('no vehicle is unlockedByDefault; the garage starts empty');
  }

  // places
  const placeIds = new Set();
  if (!Array.isArray(c.places) || !c.places.length) err('places must be a non-empty list');
  else {
    for (const [i, p] of c.places.entries()) {
      const at = `places[${i}]`;
      if (!isObj(p) || !isStr(p.id)) {
        err(`${at} needs an id`);
        continue;
      }
      if (placeIds.has(p.id)) err(`places: duplicate id "${p.id}"`);
      placeIds.add(p.id);
      if (!hasWord(p.word)) err(`${at} (${p.id}): word "${p.word}" not found in words`);
      if (!GAME_TYPES.includes(p.game)) err(`${at} (${p.id}): unknown game "${p.game}"`);
      if (p.color !== undefined && !HEX.test(p.color)) err(`${at} (${p.id}): color must look like #ff0000`);
      if (p.game === 'rescue' && !hasWord(p.options?.vehicle)) err(`${at} (${p.id}): rescue places need options.vehicle (a word id)`);
    }
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
          if (!Array.isArray(q?.options) || q.options.length < 2) err(`${qat}.options needs at least 2 word ids`);
          else {
            for (const o of q.options) if (!hasWord(o)) err(`${qat}: option "${o}" not found in words`);
            if (!q.options.includes(q.answer)) err(`${qat}.answer must be one of its options`);
          }
        });
      });
    }
  }

  // per-game settings, checked as written and as each level sees them
  const g = isObj(c.games) ? c.games : {};
  if (!isObj(c.games)) err('games must be an object');
  const usedGames = new Set((Array.isArray(c.places) ? c.places : []).map((p) => p?.game));
  for (const type of usedGames) if (GAME_TYPES.includes(type) && !isObj(g[type])) err(`games.${type} settings are missing`);

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
        break;
      case 'rescue':
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
        count('carriages');
        break;
      case 'recycling':
        count('rounds');
        if (!isPosInt(x.bins) || x.bins < 2) err(`${at}.bins must be 2 or more`);
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
        count('letters');
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
  for (const type of GAME_TYPES) if (isObj(g[type])) checkGame(type, g[type], `games.${type}`);

  // levels
  if (!Array.isArray(c.levels) || !c.levels.length) err('levels must be a non-empty list');
  else {
    const seen = new Set();
    const byPlace = new Map((Array.isArray(c.places) ? c.places : []).filter(isObj).map((p) => [p.id, p]));
    c.levels.forEach((l, i) => {
      const at = `levels[${i}]`;
      if (!isObj(l) || !isStr(l.id)) return err(`${at} needs an id`);
      if (!ID.test(l.id)) err(`${at}: id must be lowercase letters, digits and dashes`);
      if (seen.has(l.id)) err(`levels: duplicate id "${l.id}"`);
      seen.add(l.id);
      if (!hasText(l.name)) err(`${at} (${l.id}).name needs "hi" and "en"`);
      if (l.picture !== undefined && drawable && !drawable(l.picture)) warn(`${at} (${l.id}).picture "${l.picture}" has no built-in drawing`);
      if (!Array.isArray(l.places) || !l.places.length) err(`${at} (${l.id}).places needs at least one place id`);
      else for (const p of l.places) if (!placeIds.has(p)) err(`${at} (${l.id}).places: "${p}" is not a place`);
      if (!Array.isArray(l.letterSets) || !l.letterSets.every((s) => setIds.has(s))) err(`${at} (${l.id}).letterSets must list letter set ids (or be empty)`);
      if (l.games !== undefined && !isObj(l.games)) err(`${at} (${l.id}).games must be an object`);
      for (const [type, over] of Object.entries(l.games || {})) {
        if (!GAME_TYPES.includes(type)) err(`${at} (${l.id}).games: unknown game "${type}"`);
        else if (!isObj(over)) err(`${at} (${l.id}).games.${type} must be an object`);
        else checkGame(type, { ...(g[type] || {}), ...over }, `${at} (${l.id}).games.${type}`);
      }
      // every reading game in this level needs something to show
      for (const pid of Array.isArray(l.places) ? l.places : []) {
        const game = byPlace.get(pid)?.game;
        const cfg = { ...(g[game] || {}), ...(l.games?.[game] || {}) };
        const lv = cfg.levels || [l.id];
        if (game === 'sentence' && !(c.sentences || []).some((s) => lv.includes(s.level))) err(`${at} (${l.id}): the ${pid} place has no sentences for levels ${lv.join(', ')}`);
        if (game === 'story' && !lv.some((x) => storyLevels.has(x))) err(`${at} (${l.id}): the ${pid} place has no stories for levels ${lv.join(', ')}`);
        if (['railway', 'trace'].includes(game) && !l.letterSets?.length) err(`${at} (${l.id}): the ${pid} place needs letterSets`);
      }
    });
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
