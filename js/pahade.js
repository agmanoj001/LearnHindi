// पहाड़े: the times tables 2 to 10 chanted the Hindi way, "दो एकम दो, दो दूनी चार, दो तिया छह …"
// (docs/ROADMAP.md 10.7). Chanted tables are how generations learned them. Pure data and the fixed lines
// the game says (js/games/pahade.js), so each one is recorded (js/logic.js lessonVoiceLines).
// `word(n)` is the Hindi word for a number (content.numbers), passed in so this stays pure.

// what each multiplier is called in the chant: एकम, दूनी, तिया, चौके, पंजे, छक्के, सत्ते, अट्ठे, नवें, दहाई
export const MULT = ['एकम', 'दूनी', 'तिया', 'चौके', 'पंजे', 'छक्के', 'सत्ते', 'अट्ठे', 'नवें', 'दहाई'];
export const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

// "दो छक्के बारह"
export const chantLine = (t, k, word) => `${word(t)} ${MULT[k - 1]} ${word(t * k)}`;
// "दो छक्के?" (the line without its answer, asked as a question)
export const askLine = (t, k, word) => `${word(t)} ${MULT[k - 1]}?`;
// "दो का पहाड़ा"
export const titleLine = (t, word) => `${word(t)} का पहाड़ा`;

export const PAHADA_LINES = {
  singWithMe: 'मेरे साथ गाओ!',
  yourTurn: 'अब तुम बोलो!',
  howMany: 'कितने हुए?',
  wellDone: 'वाह! पूरा पहाड़ा याद हो गया!',
};

// every line, for the voice pack
export function pahadaLines(word) {
  const out = [];
  for (const t of TABLES) {
    out.push(titleLine(t, word));
    for (let k = 1; k <= 10; k++) out.push(chantLine(t, k, word), askLine(t, k, word));
  }
  return [...out, ...Object.values(PAHADA_LINES)];
}
// what a grown-up sees for each table in the progress view
export const pahadaName = (id) => {
  const t = Number(String(id).replace('pahada-', ''));
  return TABLES.includes(t) ? `${t} का पहाड़ा · the ${t} times table` : null;
};
