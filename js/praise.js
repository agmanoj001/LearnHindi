// More praise, mostly for effort (roadmap 6.3). Praising effort and strategy builds persistence far better
// than praising being right (Mueller and Dweck), and the same two lines over and over become noise. At the
// end of a lesson the guide says one of these, chosen by how the lesson went: a child who got there after
// mistakes hears about not giving up; one who answered everything first time hears about listening and
// looking carefully. Every line is recorded in the Google voice (lessonVoiceLines in js/logic.js), and the
// Hindi suits a boy or a girl (a ने-construction or a noun the verb agrees with, never करोगे / करोगी).
export const PRAISE = {
  // after mistakes: the child kept going
  effort: [
    { hi: 'तुमने हार नहीं मानी!', en: "You didn't give up!" },
    { hi: 'तुमने दोबारा सोचा, और सही चुना!', en: 'You thought again and chose right!' },
    { hi: 'कोशिश जारी रखी, और हो गया!', en: 'You kept trying, and you did it!' },
    { hi: 'ग़लती से सीखा, अब और अच्छा!', en: 'You learned from a mistake. Even better now!' },
    { hi: 'मुश्किल था, पर तुमने कर दिखाया!', en: 'It was hard, but you did it!' },
    { hi: 'तुम्हारी मेहनत रंग लाई!', en: 'Your hard work paid off!' },
  ],
  // everything first time: how they did it
  focus: [
    { hi: 'तुमने ध्यान से सुना!', en: 'You listened carefully!' },
    { hi: 'तुमने ध्यान से देखा!', en: 'You looked carefully!' },
    { hi: 'तुमने पूरा ध्यान लगाया!', en: 'You gave it your full attention!' },
    { hi: 'क्या बढ़िया सोच है!', en: 'What clever thinking!' },
    { hi: 'एक-एक करके, सब सही!', en: 'One by one, all right!' },
  ],
  // and now and then the old favourites
  done: [
    { hi: 'शाबाश!', en: 'Well done!' },
    { hi: 'वाह!', en: 'Yay!' },
    { hi: 'बहुत ख़ूब!', en: 'Brilliant!' },
  ],
};
export const ALL_PRAISE = Object.values(PRAISE).flat();

// The line for the end of a lesson. `session` has answered and firstTry (how many answers came first time).
// Mistakes along the way: an effort line. All first time: a focus line, or now and then a classic one.
// The same line never comes twice in a row.
let lastLine = null;
export function lessonPraise(session = {}, rng = Math.random) {
  const answered = session.answered || 0;
  const firstTry = session.firstTry || 0;
  const kind = answered > firstTry ? 'effort' : answered && rng() < 0.75 ? 'focus' : 'done';
  const pool = PRAISE[kind].filter((p) => p !== lastLine);
  lastLine = pool[Math.floor(rng() * pool.length)] || PRAISE[kind][0];
  return lastLine;
}
