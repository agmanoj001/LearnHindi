// A two-minute placement check that suggests a grade. Two questions per level, from Kindergarten
// letters up to Grade 4 grammar; the child keeps going while they get both right, and the first
// level they don't know yet is where they should start. Pure: the screen lives in screens.js.
//
// Each question: { level, ask: { hi, en }, show?: text to read, options, answer, pictures? }

export const PLACEMENT = [
  // Kindergarten: knows the letters
  { level: 'kg', ask: { hi: 'क ढूँढो', en: 'Find क' }, options: ['क', 'म', 'प'], answer: 'क' },
  { level: 'kg', ask: { hi: 'अ ढूँढो', en: 'Find अ' }, options: ['अ', 'इ', 'उ'], answer: 'अ' },
  // Grade 1: reads words with matras
  { level: 'grade1', ask: { hi: 'यह शब्द पढ़ो। इसकी तस्वीर कौन सी है?', en: 'Read the word. Which picture is it?' }, show: 'मोर', options: ['peacock', 'mango', 'kite'], answer: 'peacock', pictures: true },
  { level: 'grade1', ask: { hi: 'यह शब्द पढ़ो। इसकी तस्वीर कौन सी है?', en: 'Read the word. Which picture is it?' }, show: 'केला', options: ['banana', 'kite', 'house'], answer: 'banana', pictures: true },
  // Grade 2: reads half letters
  { level: 'grade2', ask: { hi: 'यह शब्द पढ़ो। इसकी तस्वीर कौन सी है?', en: 'Read the word. Which picture is it?' }, show: 'पत्ता', options: ['leaf', 'tree', 'flower'], answer: 'leaf', pictures: true },
  { level: 'grade2', ask: { hi: 'यह शब्द पढ़ो। इसकी तस्वीर कौन सी है?', en: 'Read the word. Which picture is it?' }, show: 'चम्मच', options: ['spoon', 'cup', 'bottle'], answer: 'spoon', pictures: true },
  // Grade 3: gender and number
  { level: 'grade3', ask: { hi: '"लड़का" का स्त्रीलिंग क्या है?', en: 'What is the female form of "लड़का"?' }, options: ['लड़की', 'लड़के', 'लड़कों'], answer: 'लड़की' },
  { level: 'grade3', ask: { hi: '"केला" का बहुवचन क्या है?', en: 'What is the plural of "केला"?' }, options: ['केले', 'केला', 'कला'], answer: 'केले' },
  // Grade 4: pronouns and describing words
  { level: 'grade4', ask: { hi: 'सही शब्द चुनो', en: 'Pick the right word' }, show: '___ रोज़ स्कूल जाता है।', options: ['वह', 'वे', 'हम'], answer: 'वह' },
  { level: 'grade4', ask: { hi: '"लाल गुब्बारा" में विशेषण कौन सा है?', en: 'Which is the describing word in "लाल गुब्बारा"?' }, options: ['लाल', 'गुब्बारा'], answer: 'लाल' },
];

export const PLACEMENT_LEVELS = ['kg', 'grade1', 'grade2', 'grade3', 'grade4'];

// answers: { level: number right } for the levels asked so far (2 questions each).
// Returns the level to start at, or null while more questions are needed.
export function placementResult(answers) {
  for (const level of PLACEMENT_LEVELS) {
    const right = answers[level];
    if (right === undefined) return null; // not asked yet
    if (right < 2) return level; // the first level they don't know yet
  }
  return 'grade4';
}

export function placementQuestions(level) {
  return PLACEMENT.filter((q) => q.level === level);
}
