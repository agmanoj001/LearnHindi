# A Hindi teacher's review

All the Hindi in Khel Khel Mein was written with a build tool, and every voice is computer-made. A teacher
who reads it and listens to it will catch the phrases a parent would find odd (roadmap 6.5). This page is
for that teacher, and for whoever sets the review up.

## Setting it up

1. Run `node tools/review-sheet.mjs`. It writes three spreadsheets to `review/` (they open in Excel,
   Google Sheets or LibreOffice; the folder stays out of the repository):
   - `stories.csv`: every story's title, pages, questions, moral, talk-together prompts and glossary,
     grade by grade, with the English beside it.
   - `prompts.csv`: everything the app says around the lessons (prompts, praise, the guide's greetings).
   - `listen.csv`: about a thousand words to listen to in the recorded voice: names, and words with a
     nasal sound (ँ or ं), where computer voices slip most.
2. Give the teacher the app on a phone or tablet (the recordings play there, offline), and the sheets.

## What to check

In the sheets, write in the last column only where something should change. Short notes are plenty.

- **Does it sound like Hindi a family says?** Mark anything stiff, bookish or translated-sounding.
  The words the app prefers are in [STYLE-GUIDE.md](STYLE-GUIDE.md).
- **Is it right?** Spelling (one spelling for each word, as in the style guide), gender and number
  agreement, postpositions (को, से, में, पर), and the full stop "।".
- **Does a prompt to the child fit a boy and a girl?** Lines spoken to the child should not use करोगे / करोगी.
- **Is it right for the grade?** Toddler to Grade 2 use everyday words and short sentences; Grades 3–4 may
  add a school word in brackets; Grades 7–8 read the Hindi of their schoolbooks.
- **Does the voice say it right?** In `listen.csv`, play each word in the app (or listen in the stories)
  and mark any that is wrong: names, nasal sounds (हँसना / हंस), the nukta (ज़, फ़), joined letters.

## After the review

Changes go into the content (the story or prompt, then `tools/make-voices.mjs` for its recording, in the same
change, as CLAUDE.md says). Mark roadmap 6.5 ✅ once the teacher's notes are done.
