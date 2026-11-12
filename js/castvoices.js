// Each comic character's own recorded voice, so Story radio sounds like a cast rather than one reader.
// Google's Chirp 3 HD Hindi voices (hi-IN-Chirp3-HD-<name>), chosen by role and age: brighter voices for
// children and pets, deeper ones for grandparents, kings and wrestlers. Characters who never meet in the
// same series may share a voice. The narrator (captions, sounds, "सोचो") is the app's own voice, Leda.
// Gender follows how each character speaks of themselves in the comics (करूँगी / करूँगा).
export const CAST_VOICES = {
  // मिष्टी की मस्ती
  mishti: 'Zephyr',
  bijli: 'Autonoe',
  buntu: 'Puck',
  colonel: 'Charon',
  mummy: 'Aoede',
  papa: 'Iapetus',
  dadaji: 'Rasalgethi',
  laddoolal: 'Algieba',
  teacher: 'Despina',
  rocky: 'Fenrir',
  guddu: 'Achird',
  roohi: 'Kore',
  pappu: 'Algenib',
  // जासूस दादी
  dadi: 'Gacrux',
  mausi: 'Erinome',
  inspector: 'Schedar',
  chhedilal: 'Sadachbia',
  // बीरबल की बुद्धि
  akbar: 'Charon',
  birbal: 'Orus',
  chugal: 'Sadachbia',
  // चिप्पू रोबो
  kavya: 'Kore',
  chippu: 'Fenrir',
  nani: 'Vindemiatrix',
  montu: 'Achird',
  chameli: 'Erinome',
  // विक्रम और बेताल
  vikram: 'Iapetus',
  betal: 'Algenib',
  // मास्टर मुरारी
  murari: 'Rasalgethi',
  golu: 'Puck',
  thagraj: 'Zubenelgenubi',
  // रिमझिम का धमाल
  rimjhim: 'Zephyr',
  zoya: 'Pulcherrima',
  bablu: 'Achird',
  rmummy: 'Aoede',
  rpapa: 'Umbriel',
  amma: 'Gacrux',
  sunny: 'Fenrir',
  biscuit: 'Puck',
  // the extras who play many small parts
  'man-a': 'Orus',
  'man-b': 'Umbriel',
  'man-c': 'Sadaltager',
  'man-d': 'Zubenelgenubi',
  'man-old': 'Enceladus',
  guard: 'Alnilam',
  chef: 'Algieba',
  'woman-a': 'Callirrhoe',
  'woman-b': 'Laomedeia',
  'boy-a': 'Achird',
  'boy-b': 'Fenrir',
  'girl-a': 'Pulcherrima',
  'girl-b': 'Zephyr',
  sadhu: 'Iapetus',
  courtier: 'Sadaltager',
  king: 'Schedar',
  queen: 'Callirrhoe',
  princess: 'Kore',
  pandit: 'Alnilam',
  soldier: 'Orus',
  farmer: 'Umbriel',
  doctor: 'Laomedeia',
};

export const castVoiceName = (look) => (CAST_VOICES[look] ? `hi-IN-Chirp3-HD-${CAST_VOICES[look]}` : null);
