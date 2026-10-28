// Validates content.json. Pure function: used by the app at startup and by tests.
// Errors stop the app from using the content; warnings are shown in parent settings.

export const GAME_TYPES = ['construction', 'busdepot', 'rescue', 'farm', 'railway', 'recycling', 'opposites', 'trace'];
export const OPPOSITE_KINDS = ['size', 'height', 'speed'];

export const REQUIRED_PHRASES = {
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
}; // value: whether the phrase must contain the {w} placeholder

const DEVANAGARI = /[ऀ-ॿ]/;
const ID = /^[a-z0-9][a-z0-9-]*$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const AUDIO_FILE = /^[A-Za-z0-9_\-/]+\.(mp3|m4a|ogg|oga|wav|webm|aac)$/;

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isPosInt = (v) => Number.isInteger(v) && v > 0;

export function validateContent(c, { knownPictures = null } = {}) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  if (!isObj(c)) return { errors: ['content must be a JSON object'], warnings };
  if (c.version !== 1) err('version must be 1');

  // phrases
  if (!isObj(c.phrases)) err('phrases must be an object');
  else {
    for (const [key, needsW] of Object.entries(REQUIRED_PHRASES)) {
      const p = c.phrases[key];
      if (!isObj(p) || !isStr(p.hi) || !isStr(p.en)) {
        err(`phrases.${key} needs "hi" and "en" text`);
        continue;
      }
      if (!DEVANAGARI.test(p.hi)) err(`phrases.${key}.hi should be written in Devanagari`);
      if (needsW && (!p.hi.includes('{w}') || !p.en.includes('{w}'))) err(`phrases.${key} must contain {w} in both languages`);
    }
  }

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
    else if (knownPictures && !knownPictures.includes(w.picture)) warn(`${at}.picture "${w.picture}" has no built-in drawing; a letter badge will be shown`);
    checkAudio(w.audio, at, err);
    if (w.syllables !== undefined) {
      if (!Array.isArray(w.syllables) || !w.syllables.every(isStr)) err(`${at}.syllables must be a list of text pieces`);
      else if (w.syllables.join('') !== w.hi) err(`${at}.syllables must join up to exactly "${w.hi}"`);
    }
    if (w.sound !== undefined && (!isObj(w.sound) || !isStr(w.sound.hi) || !isStr(w.sound.en))) err(`${at}.sound needs "hi" and "en"`);
    if (w.color !== undefined && !HEX.test(w.color)) err(`${at}.color must look like #ff0000`);
  }
  const hasWord = (id) => Object.prototype.hasOwnProperty.call(words, id);

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
  if (!Array.isArray(c.places) || !c.places.length) err('places must be a non-empty list');
  else {
    const seen = new Set();
    for (const [i, p] of c.places.entries()) {
      const at = `places[${i}]`;
      if (!isObj(p) || !isStr(p.id)) {
        err(`${at} needs an id`);
        continue;
      }
      if (seen.has(p.id)) err(`places: duplicate id "${p.id}"`);
      seen.add(p.id);
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
  if (!Array.isArray(c.letterSets) || !c.letterSets.length) err('letterSets must be a non-empty list');
  else {
    const setIds = new Set();
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
      if (!isObj(s.name) || !isStr(s.name.hi) || !isStr(s.name.en)) err(`${at} (${s.id}).name needs "hi" and "en"`);
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

  // per-game settings
  const g = isObj(c.games) ? c.games : {};
  if (!isObj(c.games)) err('games must be an object');
  const usedGames = new Set((Array.isArray(c.places) ? c.places : []).map((p) => p?.game));
  for (const type of usedGames) if (GAME_TYPES.includes(type) && !isObj(g[type])) err(`games.${type} settings are missing`);

  const wordList = (at, list, min, check) => {
    if (!Array.isArray(list) || list.length < min) {
      err(`${at} needs at least ${min} word ids`);
      return;
    }
    for (const id of list) {
      if (!hasWord(id)) err(`${at}: "${id}" not found in words`);
      else if (check) check(id, words[id]);
    }
  };
  const count = (at, v) => {
    if (!isPosInt(v)) err(`${at} must be a whole number above 0`);
  };

  if (isObj(g.construction)) {
    const x = g.construction;
    count('games.construction.digLetters', x.digLetters);
    count('games.construction.deliverRounds', x.deliverRounds);
    count('games.construction.buildRounds', x.buildRounds);
    wordList('games.construction.buildWords', x.buildWords, 1, (id, w) => {
      if (!w.syllables) warn(`games.construction.buildWords: "${id}" has no syllables; Hindi tiles will be split automatically`);
    });
  }
  if (isObj(g.busdepot)) {
    const x = g.busdepot;
    count('games.busdepot.pickupRounds', x.pickupRounds);
    count('games.busdepot.countRounds', x.countRounds);
    if (!isPosInt(x.maxPassengers) || x.maxPassengers < 3 || x.maxPassengers > 10) err('games.busdepot.maxPassengers must be 3 to 10');
    wordList('games.busdepot.passengers', x.passengers, 3);
  }
  if (isObj(g.rescue)) {
    count('games.rescue.rounds', g.rescue.rounds);
    wordList('games.rescue.words', g.rescue.words, 3);
  }
  if (isObj(g.farm)) {
    count('games.farm.rounds', g.farm.rounds);
    wordList('games.farm.animals', g.farm.animals, 3, (id, w) => {
      if (!w.sound) err(`games.farm.animals: "${id}" needs a "sound"`);
    });
  }
  if (isObj(g.railway)) count('games.railway.carriages', g.railway.carriages);
  if (isObj(g.recycling)) {
    const x = g.recycling;
    count('games.recycling.rounds', x.rounds);
    if (!isPosInt(x.bins) || x.bins < 2) err('games.recycling.bins must be 2 or more');
    wordList('games.recycling.colors', x.colors, 2, (id, w) => {
      if (!w.color) err(`games.recycling.colors: "${id}" needs a "color"`);
    });
    wordList('games.recycling.shapes', x.shapes, 2, (id, w) => {
      if (!String(w.picture).startsWith('shape-')) err(`games.recycling.shapes: "${id}" needs a shape-* picture`);
    });
  }
  if (isObj(g.opposites)) {
    count('games.opposites.rounds', g.opposites.rounds);
    if (!Array.isArray(g.opposites.pairs) || !g.opposites.pairs.length) err('games.opposites.pairs needs at least one pair');
    else
      g.opposites.pairs.forEach((p, i) => {
        const at = `games.opposites.pairs[${i}]`;
        if (!hasWord(p?.a) || !hasWord(p?.b)) err(`${at}: "a" and "b" must be word ids`);
        if (!OPPOSITE_KINDS.includes(p?.kind)) err(`${at}.kind must be one of ${OPPOSITE_KINDS.join(', ')}`);
        if (!hasWord(p?.vehicle)) err(`${at}.vehicle must be a word id`);
      });
  }
  if (isObj(g.trace)) {
    count('games.trace.letters', g.trace.letters);
    const t = g.trace.threshold;
    if (typeof t !== 'number' || t <= 0 || t > 1) err('games.trace.threshold must be between 0 and 1');
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
