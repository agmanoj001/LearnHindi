# Making it world class, offline first

This review (November 2026) asks what would make Khel Khel Mein stand beside the best children's reading apps, with one firm rule: **everything must keep working with no internet** once the app is on the device. ✅ marks what is done; ➡️ is recommended next, in priority order inside each part.

## Where it stands

The app is already strong on what the research rewards most: short, active lessons, adaptive difficulty, spaced review, retelling, a daily limit, no ads and no data leaving the device (see [LEARNING-REVIEW.md](LEARNING-REVIEW.md)). It is weakest where top apps spend their money:

- **the voice**: it depends on the device's text-to-speech, which is good on Android with Hindi installed and poor or silent elsewhere
- **the art**: one picture per word rather than illustrated story scenes
- **the reading itself**: stories were listened to rather than read

## 1. Stories and reading (the biggest wins)

| | What | Why | Offline cost |
| --- | --- | --- | --- |
| ✅ | **Moving scenes on every page from Toddler to Grade 2** (68 stories, 353 pages): the picture walks, flies, falls, sleeps; rain, snow, lamps, bubbles or hearts around it; backdrops for night, dawn, rain, snow, sea, under water and home; a matching sound; tap to play again | Young children attend to what moves; when the motion matches the words, the picture explains the sentence (Mayer's multimedia principle, Takacs et al. 2015 on animated picture books) | None: CSS only, about 25 KB, no video |
| ✅ | **"I'll read it myself"** from Grade 1: pages wait quietly, help only on request | Moves the child from listening to reading (gradual release); listening stays one tap away | None |
| ✅ | **The key word is linked to the picture**: underlined; a tap says it in Hindi and English and plays the scene | Vocabulary sticks when the word, its sound and its meaning arrive together | None |
| ✅ | **Swipe to turn the page** | Feels like a book on a tablet | None |
| ➡️ 1 | **A recorded voice pack for the stories**: one warm narrator per story, saved on the device in a single optional download | The single largest quality jump: it removes the device-voice lottery. Speech compressed to 16 kbps Opus is about 12 KB a page, so all 100 stories come to about 6 MB | 6 MB, optional |
| ➡️ 2 | **Word-timed read-along from those recordings** (aligned once, when the app is built) | The highlight then follows the real voice exactly | Tiny (timings in JSON) |
| ➡️ 3 | **Decodable stories for Grade 1**: tag each story with the matras and conjuncts it needs, and suggest the next story the child can already decode | The Science of Reading: early texts should use only the sounds taught so far | None |
| ➡️ 4 | **"Ask me" prompts for the grown-up** after each story (CROWD prompts: complete, recall, open-ended, wh-, distancing) | Dialogic reading gives clearly larger vocabulary gains than plain reading aloud (Whitehurst et al. 1988) | None |
| ➡️ 5 | **Read it aloud and hear yourself**: the child records a page and plays it back next to the narrator | Builds fluency without speech recognition, which in browsers needs the internet (offline it needs a 40–75 MB model, not worth it yet) | Recordings stay on the device |
| ➡️ 6 | Scenes for Grades 3 and 4, calmer and fewer, so older readers aren't distracted | | None |

## 2. Offline that never lets a family down

| | What | Why |
| --- | --- | --- |
| ✅ | **Backup and restore** in the grown-ups' area: one small file with stars, settings and children | A lost phone or a cleared browser used to lose every star |
| ✅ | **Shows whether the browser will keep the app's saves**, and asks it to | Browsers can evict data from sites that aren't installed when space runs low |
| ✅ | Installed apps ask to keep their storage at start; recordings ask when saved | (earlier round) |
| ➡️ 1 | **Split the content by grade** | `content.json` is 2.2 MB (380 KB compressed), and two thirds of it is the Grade 7–8 comics. A toddler's first open on a slow connection would be about three times faster with a small core file plus grade packs, all still saved for offline |
| ➡️ 2 | **Share the backup** with the Web Share API (to the family's own WhatsApp or Drive), and offer a reminder once a month | Backups only help if they are made |
| ➡️ 3 | **Play Store build** (a Trusted Web Activity) and an iOS wrapper | Installed store apps aren't evicted, and families find them where they look. See [PLATFORM-EVALUATION.md](PLATFORM-EVALUATION.md) |
| ➡️ 4 | **An airplane-mode check in every release**: install, go offline, play one lesson from each grade, restart, check the stars | Catches a file missing from the offline cache before families do |

## 3. Look, feel and trust

| | What | Why |
| --- | --- | --- |
| ✅ | A long-standing bug: the "heart" picture (three Grade 1–2 stories) drew black; it is now red | |
| ➡️ 1 | **Illustrated covers and one backdrop per story** for the best-loved 20 stories (commissioned SVG, still tiny) | Story-specific art is what makes the top apps feel premium |
| ➡️ 2 | **A test on a low-end phone** (Android Go, 2 GB RAM) and an older iPad | Most Indian families' second phone is the child's phone |
| ➡️ 3 | A reading-comfort option: wider letter and line spacing, a cream background | Helps struggling and dyslexic readers |
| ➡️ 4 | In the parent area: **comprehension by question type** (who/what vs why) and stories read on their own | Shows grown-ups what to talk about |

## What not to do

- **No cloud accounts or online analytics.** Trust is a feature; the privacy-first design is part of what makes this app different.
- **No video files for stories.** CSS scenes give most of the delight at a thousandth of the size, and they stay sharp on every screen.
- **No speech recognition yet.** In browsers it needs the internet, and offline models are too large for this audience's phones.
