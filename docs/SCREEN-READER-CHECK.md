# A screen-reader check, by a person (roadmap 8.3)

The automated checks already pass: every control has a name, every tap target is at least 44 px, and nothing
animates forever with reduced motion on (`node tools/browser-check.mjs`, run on every pull request). What is
left is a person using the app with a real screen reader on a real phone, once with TalkBack (Android) and
once with VoiceOver (iPhone or iPad). It takes about half an hour each. Note anything that is missing,
confusing or hard to reach, with the screen and the control.

## Setting up

- **TalkBack**: Settings › Accessibility › TalkBack › on. Swipe right and left to move between controls,
  double-tap to press. A two-finger swipe scrolls.
- **VoiceOver**: Settings › Accessibility › VoiceOver › on. Same gestures. Turn on "Reduce Motion" too
  (Settings › Accessibility › Motion) for the second half of the check.
- Open the app from the home-screen icon, with the sound on. Choose Kindergarten for the first part and
  Grade 7 for the last.

## What to check

1. **Home screen.** Every world card is read with its name and grade; the filter chips say what they filter;
   the grown-ups' button says what it is. The order follows the screen, top to bottom.
2. **A world map.** The units and lessons are read in order, with their names; a locked lesson says it is locked;
   the story library button is found.
3. **A lesson (a picture game).** The question is read, then each answer card by its word; a right and a wrong
   answer are both announced (the ✓ and ✕ marks are not the only sign); the hint (💡) and "say it again"
   buttons are found and named.
4. **A story.** The cover is read with the story's title (the 20 best-loved stories have a painted cover, read as
   a picture with the title); "मैं ख़ुद पढ़ूँ" is found; each page's words can be reached one by one; the next-page
   button is found; the questions at the end are read with their answers.
5. **The results screen.** The stars, the praise ribbon and the next button are read; after a story, "साथ में बात
   करें" opens the talk-together prompts, and each prompt's 🔊 button is named "Read it aloud".
6. **Grade 7: a prose story.** The underlined glossary words are buttons; pressing one reads the word and its
   meaning; the शब्द-भंडार list after the last page can be moved through item by item.
7. **The grown-ups' area.** The press-and-hold and the sum can be done with the screen reader on; every toggle
   says whether it is on or off.
8. **Reduced motion on.** Nothing keeps moving: story scenes stand still, the guide stops bouncing, and pages
   change without sliding.

## After the check

Fix what was found, add a line to the browser check if it can catch the same problem next time, and mark
roadmap 8.3 ✅ once both screen readers have been tried.
