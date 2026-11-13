# Making it world class, offline first

This review (November 2026) asks what would make Khel Khel Mein stand beside the best children's reading apps, with one firm rule: **everything must keep working with no internet** once the app is on the device. ✅ marks what is done; ➡️ is recommended next, in priority order inside each part.

## Where it stands

The app is already strong on what the research rewards most: short, active lessons, adaptive difficulty, spaced review, retelling, a daily limit, no ads and no data leaving the device (see [LEARNING-REVIEW.md](LEARNING-REVIEW.md)). When this roadmap was first written it was weakest where top apps spend their money (the voice, the art, the reading itself).

Since then, the voice (recorded narration, a voice per comic character, voices for every lesson), the stories (moving scenes, reading on their own) and offline safety (backups, bundled downloads) have been built. What is left, from a full design review of the app's screens (November 2026), is mostly **how it looks and feels**: the layout of lessons, the life in the characters, a consistent language, and the engineering habits of a professionally run app. Sections 4–8 are that review; nothing in them is built yet.

## 1. Stories and reading (the biggest wins)

| | What | Why | Offline cost |
| --- | --- | --- | --- |
| ✅ | **Moving scenes on every page from Toddler to Grade 2** (68 stories, 353 pages): the picture walks, flies, falls, sleeps; rain, snow, lamps, bubbles or hearts around it; backdrops for night, dawn, rain, snow, sea, under water and home; a matching sound; tap to play again | Young children attend to what moves; when the motion matches the words, the picture explains the sentence (Mayer's multimedia principle, Takacs et al. 2015 on animated picture books) | None: CSS only, about 25 KB, no video |
| ✅ | **"I'll read it myself"** from Grade 1: pages wait quietly, help only on request | Moves the child from listening to reading (gradual release); listening stays one tap away | None |
| ✅ | **The key word is linked to the picture**: underlined; a tap says it in Hindi and English and plays the scene | Vocabulary sticks when the word, its sound and its meaning arrive together | None |
| ✅ | **Swipe to turn the page** | Feels like a book on a tablet | None |
| ✅ | **Record a whole story** in a family voice, one line at a time, and move the recordings to another device in one file | A familiar voice is the best narrator; it stays on the family's devices | Recordings stay on the device |
| ✅ | **A recorded voice pack for the stories** (the voices themselves are made with `tools/make-voices.mjs`): one warm narrator for every title, page and lesson, downloaded by grade or all at once from the grown-ups' area | The single largest quality jump: it removes the device-voice lottery | A few MB per grade, optional (MP3 plays on every browser) |
| ➡️ 1 | **Word-timed read-along from those recordings** (aligned once, when the app is built) | The highlight then follows the real voice exactly | Tiny (timings in JSON) |
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

## 4. Layout and ease of use

Found by looking at about 30 screens (Kindergarten and Grade 7 on a phone, Grade 1 on a tablet). Priority numbers show the order to build in.

| | What | Why |
| --- | --- | --- |
| ✅ | **Fill the screen in lessons.** Done: answer cards, pictures, letters and maths numbers now grow with the screen (up to about 250 px on a tablet, 300 px when there are only two answers), and their words grow with them | On a 1024 px tablet the answer cards stay phone-sized (about 60 px wide) in a sea of empty space; on a phone the middle third of most lesson screens is empty and the answers are small. Small targets are the main cause of missed taps for ages 2–5 |
| ➡️ 2 | **A simpler home screen for pre-readers**: one big play button, Story radio and their world; move the filter chips and the skill tags to the grown-ups' area | A toddler sees a path card, two big buttons, a row of filter chips and world cards with small labels. None of it can be read at that age, and every extra choice costs attention |
| ➡️ 3 | **The counting game**: show the animals on the bus large, and let each one bounce as it is counted | The animals are tiny and hard to count at a glance |
| ➡️ 4 | **The hint button in every game**, not only the choose-an-answer games (maths, phonics, digging, tracing, the train) | Right now the 💡 is missing in the games that don't use the shared answer handler, which feels inconsistent |
| ➡️ 5 | **A 30-second "tap here" guide** the first time each kind of game is played: a pointing hand and the instruction said aloud | Nothing tells a first-time player what to do; the best children's apps teach the interaction with the interaction |
| ➡️ 6 | **Move grown-up text off child screens** behind an ⓘ button (for example Show time's "Questions wait a few seconds…" note and the small instruction paragraph on comic covers) | Text a child can't read, or doesn't need, is noise |
| ➡️ 7 | Tablet layouts for the maps and the hub (two or three columns, bigger world cards) | The hub and map are phone layouts stretched on tablets |

## 5. Animation and feel

| | What | Why |
| --- | --- | --- |
| ✅ | **Give story characters life.** Done: every face blinks; people's mouths move while a page with speech is read; five moods (happy, sad, surprised, scared, sleepy) change eyes, mouth and arms. Each page gets its mood from its text or its move, and a page can set `mood` itself | Scenes now move a whole picture (slide, hop, spin); the characters have no moving limbs and their faces never change. This is the biggest single jump in animation quality, and it costs only a few KB of SVG |
| ➡️ 2 | **Depth in the backgrounds**: drifting clouds, layers that move at different speeds, small ambient life (a bird, a butterfly, leaves) | The backgrounds are flat (plain lavender blocks for buildings, a road strip); a little parallax makes the worlds feel alive |
| ➡️ 3 | **A guide that reacts to every answer** (cheers, thinks, encourages, claps) and is bigger on screen | The guide sits small in a corner and mostly watches; attachment to a companion is one of the strongest levers on engagement for young children |
| ➡️ 4 | **Shared-element transitions**: tapping a world, a lesson or a story grows into the next screen instead of cutting to it | It makes the app read as one place rather than a set of pages, and it tells a child where they went |
| ➡️ 5 | **A motion budget and a slow-phone test**: measure frames per second on an entry-level Android phone and an older iPad, and drop any effect that stutters | Stutter is the first thing that makes a children's app feel cheap; the new scenes and particles have only been checked on a fast machine |
| ➡️ 6 | **Hindi text animation**: letters that draw themselves in stroke order for tracing, and syllables that pop as they are said | Hindi conjuncts and matras are shapes children must see built; this turns reading support into delight |
| ➡️ 7 | Haptics and sound polish: a distinct, soft sound per interaction type, and a quieter mix under speech everywhere | Sound is half the feel; a few consistent tones help non-readers know what just happened |

## 6. Text, language and voice

| | What | Why |
| --- | --- | --- |
| ✅ | **One language rule, everywhere.** Done for the home screen and the world maps: with Hindi on, everything a child reads is Hindi; with "both", Hindi first and English small after it (English first in the maths and phonics worlds). Child-facing text follows the language setting, and never English alone. Today the home screen mixes them ("Keep going / Rhymes / Story time", the skill tags and some world names are English only, while titles are Hindi) | A child who is learning Hindi shouldn't have to switch languages to find the play button; mixed screens also read as unfinished |
| ➡️ 2 | **Fix the wrong or awkward captions**, starting with "Find the house that says letter" (it should be "Find the house with this word") | The caption bar quotes the app's own prompts; small slips here are the most visible in screenshots and reviews |
| ➡️ 3 | **More praise, mostly for effort**: ten or more lines instead of two (शाबाश!, वाह!), such as "तुमने कोशिश की!", "ध्यान से सुना!", "अब और अच्छा!" | Praising effort and strategy builds persistence far better than praising being right (Mueller and Dweck); repeating the same two lines becomes noise |
| ➡️ 4 | **Re-record the very short lines inside a carrier phrase** (single letters, *है*, *Yes*) so one narrator voice says everything | About 40 lines (those the premium voice returned as silence) use a different, standard voice, so a few moments sound like a different person |
| ➡️ 5 | **A native-speaker review by a Hindi teacher** of all stories and prompts, and a spot-check of the voices, especially names and nasal sounds | All the Hindi was written by the build tool and the voices are computer-made; a teacher will catch phrases a parent would find odd |
| ➡️ 6 | **A style guide for the words**: everyday Hindi for ages 2–8, school terms in brackets from Grade 3, one spelling for each word, and a short glossary the voice, captions and stories all follow | The "everyday Hindi" pass found bookish words in many places; a guide keeps new content from drifting back |
| ➡️ 7 | **Voice speed for beginners**: a slower setting for Toddler and Kindergarten, applied on top of the recorded voice | A child learning a sound needs more time between words than an older reader does |

## 7. Engagement

| | What | Why |
| --- | --- | --- |
| ➡️ 1 | **Make collections playable**: a scene the child decorates with the stickers they earn (a farm, a town, a jungle), not just a list of pictures | A collection that can be used is worth coming back for, and it gives the stars a purpose a child can see |
| ➡️ 2 | **Favourites and "read again"**: a heart on any story, and the favourite shows on the home screen | Young children love repetition; letting them find a favourite in one tap is the best retention feature they ask for |
| ➡️ 3 | **Story radio**: a sleep timer, a way to pick a story from picture tiles, and "play this one again" | The radio is the most-used screen on a journey and at bedtime, and it has no way to choose or to stop on its own |
| ➡️ 4 | **A gentle daily rhythm**: a "today's three" view with a small celebration at the end, and a week-long sticker trail | There is a daily path, but the end of the day has nothing to look forward to; a visible finish makes short sessions satisfying |
| ➡️ 5 | **Little rewards that aren't stars**: a new guide outfit, a new backdrop, a new sound | Variety in what is earned keeps a long-running app fresh |
| ➡️ 6 | **Shared play for a grown-up and child**: prompts like "ask me why" after a story, and a two-player mode on one device for brothers and sisters | Co-viewing and conversation add far more to learning than the app can on its own |

## 8. Engineering and industry practice

| | What | Why |
| --- | --- | --- |
| ➡️ 1 | **Automated checks on every pull request**: run the tests (176 today), a screenshot comparison of the main screens, and an offline check (install, go offline, play one lesson from each grade) | The repository has no checks, so the tests only run when someone runs them; a change can quietly break a screen or the offline cache |
| ➡️ 2 | **Watch three to five real children per age group** use it, in silence, noting where they get stuck, and fix what they do rather than what is said | It finds more than any review, including this one (which could not test with a child) |
| ➡️ 3 | **Accessibility pass**: colour-blind-safe colours (not only red/green for right/wrong), a minimum tap size of about 48 px, a left-handed layout option, screen-reader labels checked with a real screen reader, and reduced motion verified everywhere | The audit found no automated errors, but real assistive-technology use has not been tried |
| ➡️ 4 | **Children's-app store rules**, designed in now: a gate before the grown-ups' area, no links out of the app, a clear privacy statement, and no data collection | Both stores review children's apps harder, and the Play Store and App Store versions in [PLATFORM-EVALUATION.md](PLATFORM-EVALUATION.md) will need these |
| ➡️ 5 | **Performance budget**: first screen under about 2 seconds on a mid-range phone, content loaded per grade (see section 2), and images and scenes only drawn when on screen | Slow first launches are the main reason a family never opens an app a second time |
| ➡️ 6 | **A "what's new" note** inside the refresh bar and a short in-app changelog | Families should know why the app asks to refresh, and what changed for their child |
| ➡️ 7 | **Local, private usage insight for grown-ups**: which games a child finds hard, which stories they replay, how long they play (kept on the device, never uploaded) | Lets a parent steer a child toward the right game without any online analytics |
| ➡️ 8 | **Content tooling**: a script that checks every Hindi string against the style guide (bookish words, spelling, length) and every picture against the art rules | The content is now thousands of lines; checks catch drift faster than a review |

## Suggested order

1. ✅ **Sections 4.1 and 6.1** (fill the screen, one language rule): done.
2. ✅ **Section 5.1** (character poses and faces): done.
3. **Section 8.2** (watch real children), to check the first two and set the order for the rest.
4. **Sections 8.1 and 8.5** (automated checks and a performance budget), so nothing slips as the app grows.
5. The rest, in the order the watching of real children suggests.

## What not to do

- **No cloud accounts or online analytics.** Trust is a feature; the privacy-first design is part of what makes this app different.
- **No video files for stories.** CSS scenes give most of the delight at a thousandth of the size, and they stay sharp on every screen.
- **No speech recognition yet.** In browsers it needs the internet, and offline models are too large for this audience's phones.
