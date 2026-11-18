// Writes docs/STYLE-GUIDE.md, the guide to the words (roadmap 6.6), from the rules the content check enforces
// (tools/style-rules.mjs), so the guide and the check never disagree. Run it after changing a rule:
//   node tools/style-guide.mjs
// (npm test fails while the guide is out of date.)
import { writeFileSync } from 'node:fs';
import { BOOKISH, KEEP_AS_IS, SPELLING, MAX_WORDS, EXEMPT_LEVELS } from './style-rules.mjs';

const LEVEL_NAMES = { toddler: 'Toddler (2–3)', kg: 'Kindergarten (4–5)', grade1: 'Grade 1', grade2: 'Grade 2', grade3: 'Grade 3', grade4: 'Grade 4', grade7: 'Grade 7', grade8: 'Grade 8' };

// The words the app itself uses for its own parts, so every screen, caption and recording names them alike.
export const GLOSSARY = [
  ['भाग', 'a unit on a world map', 'not "इकाई" or "अध्याय"'],
  ['पाठ', 'a lesson', ''],
  ['कहानी', 'a story', 'a poem is कविता; a rhyme for little ones is also कविता'],
  ['पुस्तकालय', 'the story library', ''],
  ['अक्षर', 'a letter (क, ख …)', 'not "वर्ण" before Grade 3; from Grade 3 "वर्ण" may follow in brackets'],
  ['मात्रा', 'a vowel sign (ा, ि …)', ''],
  ['शब्द', 'a word', ''],
  ['वाक्य', 'a sentence', ''],
  ['सवाल', 'a question', 'not "प्रश्न" (bookish), except in प्रश्नोत्तरी'],
  ['जवाब', 'an answer', 'not "उत्तर" before Grade 3'],
  ['आवाज़', 'a sound', 'not "ध्वनि" before Grade 3'],
  ['उल्टे शब्द (विलोम)', 'opposites', 'the school word in brackets from Grade 3'],
  ['एक जैसे मतलब वाले शब्द (पर्यायवाची)', 'synonyms', 'the school word in brackets from Grade 3'],
  ['शाबाश!', 'well done', 'praise names the effort, not the child (js/praise.js)'],
  ['बड़ों के लिए', 'the grown-ups’ area', ''],
];

const rows = (pairs) => pairs.map((r) => `| ${r.join(' | ')} |`).join('\n');

export function styleGuide() {
  return `# The words of Khel Khel Mein: a style guide

The app speaks to children from two to fourteen, in the Google voice, in captions and on every page. This guide
says which words it uses and how it spells them, so that new stories, prompts and lessons sound like the rest
(roadmap 6.6). It is written from \`tools/style-rules.mjs\`, the same rules \`npm run check-content\` enforces;
run \`node tools/style-guide.mjs\` after changing a rule, and \`npm test\` fails while this file is out of date.

## 1. Everyday Hindi for ages 2–8

Toddler, Kindergarten, Grade 1 and Grade 2 use the word a child hears at home, not the schoolbook word.
From Grade 3 a school word may follow the everyday one, or stand in brackets after it: "उल्टे शब्द (विलोम)".
After "यानी" a bookish word is welcome, since that is how the app teaches synonyms ("हाथी, यानी गज").
${EXEMPT_LEVELS.map((l) => LEVEL_NAMES[l]).join(' and ')} read the Hindi of their schoolbooks, so these word and length rules do not apply there (spelling still does).

| Bookish word | Everyday word to use |
| --- | --- |
${rows(Object.entries(BOOKISH))}

Set phrases keep their bookish word, because that is how everyone says them: ${KEEP_AS_IS.map((w) => `"${w}"`).join(', ')}.

## 2. One spelling for each word

The standard spelling of the Central Hindi Directorate: the anusvara (ं) for a nasal before a consonant of
its own group (हिंदी, सुंदर, अंदर), ए/ई rather than ये/यी in verb endings (गई, आएगा), and the nukta where it
is said (ज़रूर, ज़्यादा). The chandrabindu (ँ) stays where the vowel itself is nasal (हँसना, चाँद, आँख), so
हंस (a swan) and हँस (laugh) stay different words. ख़ुद (self) and खुद (dug) are both words.

| Not this | But this |
| --- | --- |
${rows(Object.entries(SPELLING))}

## 3. Short sentences for young readers

The longest sentence, in words, for each grade's own content:

| Grade | Longest sentence |
| --- | --- |
${rows(Object.entries(MAX_WORDS).map(([l, n]) => [LEVEL_NAMES[l], `${n} words`]))}

## 4. Speaking to the child

- Talk to the child as "तुम", warmly. Write so the line fits a boy or a girl: a ने-construction ("तुमने हार नहीं मानी!"),
  a noun the verb agrees with ("तुम्हारी मेहनत रंग लाई!") or an imperative ("बताओ!"), never करोगे / करोगी.
- Talk to a grown-up as "आप" ("पूछिए", "खोलिए").
- Praise the effort and the care, not the child: "तुमने ध्यान से सुना!" rather than "तुम बहुत होशियार हो!".
- Hindi first; English small after it when the language setting is "both". Never English alone on a Hindi screen.

## 5. Punctuation

- The full stop in Hindi is the पूर्ण विराम "।"; "?" and "!" as in English.
- Curly quotes for speech: “ ” in English, and "…" in Hindi lines the voice reads.
- Numbers in Hindi lines are written in digits (3, 10) unless the lesson teaches the number words.

## 6. The app's own words

Every screen, caption and recording names the parts of the app the same way:

| Hindi | Means | Note |
| --- | --- | --- |
${rows(GLOSSARY)}

## 7. Every line is spoken

Anything a child can hear is the recorded Google voice (see CLAUDE.md). A new line is part of a list the voice
generator reads (usually \`lessonVoiceLines\` in js/logic.js) and is recorded with \`tools/make-voices.mjs\` in the
same change.
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL('../docs/STYLE-GUIDE.md', import.meta.url), styleGuide());
  console.log('docs/STYLE-GUIDE.md written');
}
