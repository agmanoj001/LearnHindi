// समय और पैसे: days, months, seasons, telling the time and rupees, in Hindi (docs/ROADMAP.md 10.6). Everyday
// number talk at home is in these words. Pure data and the sentences the game says (js/games/samay.js):
// every sentence is fixed, so each one is recorded (js/logic.js lessonVoiceLines) and none needs the
// device's voice. Numbers inside a sentence are their own recordings (num-15_hi), said between the pieces.

export const DAYS = [
  { hi: 'सोमवार', en: 'Monday' },
  { hi: 'मंगलवार', en: 'Tuesday' },
  { hi: 'बुधवार', en: 'Wednesday' },
  { hi: 'गुरुवार', en: 'Thursday' },
  { hi: 'शुक्रवार', en: 'Friday' },
  { hi: 'शनिवार', en: 'Saturday' },
  { hi: 'रविवार', en: 'Sunday' },
];
export const MONTHS = [
  { hi: 'जनवरी', en: 'January' },
  { hi: 'फ़रवरी', en: 'February' },
  { hi: 'मार्च', en: 'March' },
  { hi: 'अप्रैल', en: 'April' },
  { hi: 'मई', en: 'May' },
  { hi: 'जून', en: 'June' },
  { hi: 'जुलाई', en: 'July' },
  { hi: 'अगस्त', en: 'August' },
  { hi: 'सितंबर', en: 'September' },
  { hi: 'अक्टूबर', en: 'October' },
  { hi: 'नवंबर', en: 'November' },
  { hi: 'दिसंबर', en: 'December' },
];
// the four seasons a child feels in North India, each with a picture
export const SEASONS = [
  { id: 'garmi', hi: 'गर्मी', en: 'summer', pic: 'sun' },
  { id: 'barsat', hi: 'बरसात', en: 'the rains', pic: 'raincloud' },
  { id: 'sardi', hi: 'सर्दी', en: 'winter', pic: 'bonfire' },
  { id: 'vasant', hi: 'वसंत', en: 'spring', pic: 'flower' },
];
// [question, in English, the season]
export const SEASON_QS = [
  ['बारिश किस मौसम में होती है?', 'When does it rain a lot?', 'barsat'],
  ['किस मौसम में स्वेटर पहनते हैं?', 'When do we wear sweaters?', 'sardi'],
  ['आम किस मौसम में आते हैं?', 'When do mangoes come?', 'garmi'],
  ['किस मौसम में छाता लेकर निकलते हैं?', 'When do we take an umbrella out?', 'barsat'],
  ['किस मौसम में आइसक्रीम सबसे अच्छी लगती है?', 'When is ice cream best?', 'garmi'],
  ['किस मौसम में पेड़ों पर नए फूल खिलते हैं?', 'When do new flowers bloom on the trees?', 'vasant'],
  ['किस मौसम में आग के पास बैठना अच्छा लगता है?', 'When is it nice to sit by a fire?', 'sardi'],
  ['किस मौसम में मेंढक टर्र-टर्र करते हैं?', 'When do the frogs croak?', 'barsat'],
  ['होली किस मौसम में आती है?', 'Which season does Holi come in?', 'vasant'],
  ['किस मौसम में पंखे और कूलर चलते हैं?', 'When do the fans and coolers run?', 'garmi'],
];
// the six ऋतुएँ of the Indian year, in order (for older children)
export const RITU = [
  { hi: 'वसंत', en: 'spring' },
  { hi: 'ग्रीष्म', en: 'summer' },
  { hi: 'वर्षा', en: 'the rains' },
  { hi: 'शरद', en: 'autumn' },
  { hi: 'हेमंत', en: 'the cool season' },
  { hi: 'शिशिर', en: 'winter' },
];

// the hours in words (एक … बारह)
export const HOURS = ['एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस', 'ग्यारह', 'बारह'];
// "कितने बजे हैं?": the time the Hindi way. 1:30 is डेढ़ and 2:30 is ढाई; 3:15 is सवा तीन; 3:45 is पौने चार.
export function timeHi(h, m) {
  const w = (x) => HOURS[(((x - 1) % 12) + 12) % 12];
  if (m === 0) return h === 1 ? 'एक बजा है' : `${w(h)} बजे हैं`;
  if (m === 15) return `सवा ${w(h)} बजे हैं`;
  if (m === 30) return h === 1 ? 'डेढ़ बजे हैं' : h === 2 ? 'ढाई बजे हैं' : `साढ़े ${w(h)} बजे हैं`;
  if (m === 45) return `पौने ${w(h + 1)} बजे हैं`;
  throw new Error(`no Hindi words for ${h}:${m}`);
}
// the minutes each level asks: whole hours, then half past, then quarter past and quarter to
export const TIME_MINUTES = [[0], [0, 30], [0, 15, 30, 45]];

// money: coins and notes, by id, with their value in paise (₹1 = 100 paise). Drawn by js/art-math.js ("rupee").
export const RUPEES = {
  c50: { value: 50, note: false },
  c1: { value: 100, note: false },
  c2: { value: 200, note: false },
  c5: { value: 500, note: false },
  c10: { value: 1000, note: false },
  n10: { value: 1000, note: true },
  n20: { value: 2000, note: true },
  n50: { value: 5000, note: true },
  n100: { value: 10000, note: true },
};
// ₹15, ₹12.50, 50 पैसे
export const rupeeLabel = (p) => (p < 100 ? `${p} पैसे` : p % 100 ? `₹${Math.floor(p / 100)}.${String(p % 100).padStart(2, '0')}` : `₹${p / 100}`);
// what each level pays with, and up to how much (in paise)
export const MONEY_LEVELS = [
  { kinds: ['c1', 'c2', 'c5'], max: 1000 },
  { kinds: ['c1', 'c2', 'c5', 'c10', 'n10', 'n20'], max: 5000 },
  { kinds: ['c50', 'c1', 'c2', 'c5', 'c10', 'n20', 'n50'], max: 10000 },
];
// things to buy at the market: word ids (pictures and their recorded names)
export const MARKET = ['mango', 'banana', 'apple', 'grapes', 'laddoo', 'kite', 'balloon', 'ball', 'book', 'cup'];

// the fixed sentences
export const LINES = {
  dayNext: (d) => `आज ${d} है। कल कौन-सा दिन होगा?`,
  dayPrev: (d) => `आज ${d} है। कल कौन-सा दिन था?`,
  dayAfter: (d) => `${d} के बाद कौन-सा दिन आता है?`,
  monthAfter: (m) => `${m} के बाद कौन-सा महीना आता है?`,
  monthBefore: (m) => `${m} से पहले कौन-सा महीना आता है?`,
  rituAfter: (r) => `${r} के बाद कौन-सी ऋतु आती है?`,
  weekDays: 'हफ़्ते में कितने दिन होते हैं?',
  yearMonths: 'साल में कितने महीने होते हैं?',
  firstMonth: 'साल का पहला महीना कौन-सा है?',
  lastMonth: 'साल का आख़िरी महीना कौन-सा है?',
  ritus: 'भारत में कितनी ऋतुएँ होती हैं?',
  whatTime: 'कितने बजे हैं?',
  howMuch: 'कितने रुपये हैं?',
  // paying: "आम … पंद्रह … रुपये … का है। पैसे दो।"
  costs: 'का है।',
  rupees: 'रुपये',
  paise: 'पैसे',
  pay: 'पैसे दो।',
  tooMuch: 'ज़्यादा हो गए। कुछ वापस लो।',
  tooLittle: 'अभी कम हैं। और दो।',
  thanks: 'धन्यवाद! यह लो।',
};
// every sentence the game can say, for the voice pack
export function samayLines() {
  const out = new Set();
  for (const d of DAYS) [LINES.dayNext(d.hi), LINES.dayPrev(d.hi), LINES.dayAfter(d.hi), d.hi].forEach((x) => out.add(x));
  for (const m of MONTHS) [LINES.monthAfter(m.hi), LINES.monthBefore(m.hi), m.hi].forEach((x) => out.add(x));
  for (const r of RITU) [LINES.rituAfter(r.hi), r.hi].forEach((x) => out.add(x));
  for (const s of SEASONS) out.add(s.hi);
  for (const [q] of SEASON_QS) out.add(q);
  for (let h = 1; h <= 12; h++) for (const m of [0, 15, 30, 45]) out.add(timeHi(h, m));
  for (const k of ['weekDays', 'yearMonths', 'firstMonth', 'lastMonth', 'ritus', 'whatTime', 'howMuch', 'costs', 'rupees', 'paise', 'pay', 'tooMuch', 'tooLittle', 'thanks']) out.add(LINES[k]);
  return [...out];
}
// what a grown-up sees in the progress view for each kind of round
export const SAMAY_SKILLS = {
  'hi-days': 'दिन · Days of the week',
  'hi-months': 'महीने · Months',
  'hi-seasons': 'मौसम और ऋतुएँ · Seasons',
  'hi-clock': 'कितने बजे हैं? · Telling the time in Hindi',
  'hi-rupees': 'रुपये और पैसे · Rupees and paise',
};
// the kinds of round a lesson can ask for, and the skill each records
export const SAMAY_MODES = { days: 'hi-days', months: 'hi-months', seasons: 'hi-seasons', ritu: 'hi-seasons', clock: 'hi-clock', count: 'hi-rupees', pay: 'hi-rupees' };
