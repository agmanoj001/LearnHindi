# Making it world class, offline first

This review (November 2026) asks what would make Khel Khel Mein stand beside the best children's reading apps, with one firm rule: **everything must keep working with no internet** once the app is on the device. ✅ marks what is done; ➡️ is recommended next, in priority order inside each part.

## Where it stands

The app is already strong on what the research rewards most: short, active lessons, adaptive difficulty, spaced review, retelling, a daily limit, no ads and no data leaving the device (see [LEARNING-REVIEW.md](LEARNING-REVIEW.md)). When this roadmap was first written it was weakest where top apps spend their money (the voice, the art, the reading itself).

Since then, the voice (recorded narration, a voice per comic character, voices for every lesson), the stories (moving scenes, reading on their own) and offline safety (backups, bundled downloads) have been built. What is left, from a full design review of the app's screens (November 2026), is mostly **how it looks and feels**: the layout of lessons, the life in the characters, a consistent language, and the engineering habits of a professionally run app. Sections 4–8 are that review; the first items of each are now built (marked ✅). A second review (November 2026) looked at what would bring a child back day after day and at what the app teaches: it added items 7 to 16 in section 7, and sections 9 (Hindi stories and poems to add) and 10 (maths to add).

## 1. Stories and reading (the biggest wins)

| | What | Why | Offline cost |
| --- | --- | --- | --- |
| ✅ | **Moving scenes on every page from Toddler to Grade 2** (68 stories, 353 pages): the picture walks, flies, falls, sleeps; rain, snow, lamps, bubbles or hearts around it; backdrops for night, dawn, rain, snow, sea, under water and home; a matching sound; tap to play again | Young children attend to what moves; when the motion matches the words, the picture explains the sentence (Mayer's multimedia principle, Takacs et al. 2015 on animated picture books) | None: CSS only, about 25 KB, no video |
| ✅ | **"I'll read it myself"** from Grade 1: pages wait quietly, help only on request | Moves the child from listening to reading (gradual release); listening stays one tap away | None |
| ✅ | **The key word is linked to the picture**: underlined; a tap says it in Hindi and English and plays the scene | Vocabulary sticks when the word, its sound and its meaning arrive together | None |
| ✅ | **Swipe to turn the page** | Feels like a book on a tablet | None |
| ✅ | **Record a whole story** in a family voice, one line at a time, and move the recordings to another device in one file | A familiar voice is the best narrator; it stays on the family's devices | Recordings stay on the device |
| ✅ | **A recorded voice pack for the stories** (the voices themselves are made with `tools/make-voices.mjs`): one warm narrator for every title, page and lesson, downloaded by grade or all at once from the grown-ups' area | The single largest quality jump: it removes the device-voice lottery | A few MB per grade, optional (MP3 plays on every browser) |
| ✅ | **Word-timed read-along from those recordings.** Done: `tools/align-words.mjs` times every story page once, when the pack is made (a second voice that reports word times reads the line; its pauses are matched to the recording's), into `voices/words.json`; the reader lights each word as the recorded voice reaches it, at any reading speed | The highlight then follows the real voice exactly | Tiny (timings in JSON, saved with the pack) |
| ✅ | **Decodable stories for Grade 1.** Done: every Hindi story is tagged with the matras and joined letters it needs; ten new short stories in five stages (no matras, then + ा ि ी, + ु ू, + े ै, + ो ौ) use only what has been taught, and one of each stage closes its matra unit. In the Grade 1–2 library, books the child can read come first with "ख़ुद पढ़ो", others show the matras still to learn, and "अब यह पढ़ो!" suggests the next one | The Science of Reading: early texts should use only the sounds taught so far | None |
| ✅ | **"Ask me" prompts for the grown-up** after each story (CROWD prompts: complete, recall, open-ended, wh-, distancing). Done: all 174 stories have five prompts for a grown-up to ask (finish the line, what happened first, open a page and tell, a "why" question, and a "what about you" question), behind a "साथ में बात करें" button on the results screen after a story. The first three are made from the story; the last two are written for each story, and the build stops if a story has none | Dialogic reading gives clearly larger vocabulary gains than plain reading aloud (Whitehurst et al. 1988) | None |
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
| ✅ | **A simpler home screen for pre-readers.** Done: Toddler and Kindergarten see their guide, one big play button (the next thing on today's path), Show time, Story radio and their own worlds. No filters, skill tags or other grades; a grown-up can switch back with "Simple home screen" in the grown-ups' area | A toddler sees a path card, two big buttons, a row of filter chips and world cards with small labels. None of it can be read at that age, and every extra choice costs attention |
| ➡️ 3 | **The counting game**: show the animals on the bus large, and let each one bounce as it is counted | The animals are tiny and hard to count at a glance |
| ➡️ 4 | **The hint button in every game**, not only the choose-an-answer games (maths, phonics, digging, tracing, the train) | Right now the 💡 is missing in the games that don't use the shared answer handler, which feels inconsistent |
| ➡️ 5 | **A 30-second "tap here" guide** the first time each kind of game is played: a pointing hand and the instruction said aloud | Nothing tells a first-time player what to do; the best children's apps teach the interaction with the interaction |
| ➡️ 6 | **Move grown-up text off child screens** behind an ⓘ button (for example Show time's "Questions wait a few seconds…" note and the small instruction paragraph on comic covers) | Text a child can't read, or doesn't need, is noise |
| ➡️ 7 | Tablet layouts for the maps and the hub (two or three columns, bigger world cards) | The hub and map are phone layouts stretched on tablets |

## 5. Animation and feel

| | What | Why |
| --- | --- | --- |
| ✅ | **Give story characters life.** Done: every face blinks; people's mouths move while a page with speech is read; five moods (happy, sad, surprised, scared, sleepy) change eyes, mouth and arms. Each page gets its mood from its text or its move, and a page can set `mood` itself | Scenes now move a whole picture (slide, hop, spin); the characters have no moving limbs and their faces never change. This is the biggest single jump in animation quality, and it costs only a few KB of SVG |
| ✅ | **Depth in the backgrounds.** Done: Vehicle Town is redrawn in layers (a pale skyline, houses with roofs and windows, trees, traffic both ways); the layers drift at different speeds and follow a finger or a tilt a little; birds, butterflies and falling leaves pass through the outdoor worlds. All of it stands still with "reduce motion" | The backgrounds are flat (plain lavender blocks for buildings, a road strip); a little parallax makes the worlds feel alive |
| ➡️ 3 | **A guide that reacts to every answer** (cheers, thinks, encourages, claps) and is bigger on screen | The guide sits small in a corner and mostly watches; attachment to a companion is one of the strongest levers on engagement for young children |
| ➡️ 4 | **Shared-element transitions**: tapping a world, a lesson or a story grows into the next screen instead of cutting to it | It makes the app read as one place rather than a set of pages, and it tells a child where they went |
| ➡️ 5 | **A motion budget and a slow-phone test**: measure frames per second on an entry-level Android phone and an older iPad, and drop any effect that stutters | Stutter is the first thing that makes a children's app feel cheap; the new scenes and particles have only been checked on a fast machine |
| ➡️ 6 | **Hindi text animation**: letters that draw themselves in stroke order for tracing, and syllables that pop as they are said | Hindi conjuncts and matras are shapes children must see built; this turns reading support into delight |
| ➡️ 7 | Haptics and sound polish: a distinct, soft sound per interaction type, and a quieter mix under speech everywhere | Sound is half the feel; a few consistent tones help non-readers know what just happened |

## 6. Text, language and voice

| | What | Why |
| --- | --- | --- |
| ✅ | **One language rule, everywhere.** Done for the home screen and the world maps: with Hindi on, everything a child reads is Hindi; with "both", Hindi first and English small after it (English first in the maths and phonics worlds). Child-facing text follows the language setting, and never English alone. Today the home screen mixes them ("Keep going / Rhymes / Story time", the skill tags and some world names are English only, while titles are Hindi) | A child who is learning Hindi shouldn't have to switch languages to find the play button; mixed screens also read as unfinished |
| ✅ | **Fix the wrong or awkward captions.** Done: "Find the cup house", "Help! Find the cow", "{word} for a boy. And for a girl?", and Hindi word order ("गाय कौन बोलता है?", "बड़ा कौन सा है?"); "भाग" for a unit, as on the map. The changed lines were recorded again, and a device that saved the old recordings forgets them | The caption bar quotes the app's own prompts; small slips here are the most visible in screenshots and reviews |
| ➡️ 3 | **More praise, mostly for effort**: ten or more lines instead of two (शाबाश!, वाह!), such as "तुमने कोशिश की!", "ध्यान से सुना!", "अब और अच्छा!" | Praising effort and strategy builds persistence far better than praising being right (Mueller and Dweck); repeating the same two lines becomes noise |
| ➡️ 4 | **Re-record the very short lines inside a carrier phrase** (single letters, *है*, *Yes*) so one narrator voice says everything | About 40 lines (those the premium voice returned as silence) use a different, standard voice, so a few moments sound like a different person |
| ➡️ 5 | **A native-speaker review by a Hindi teacher** of all stories and prompts, and a spot-check of the voices, especially names and nasal sounds | All the Hindi was written by the build tool and the voices are computer-made; a teacher will catch phrases a parent would find odd |
| ➡️ 6 | **A style guide for the words**: everyday Hindi for ages 2–8, school terms in brackets from Grade 3, one spelling for each word, and a short glossary the voice, captions and stories all follow | The "everyday Hindi" pass found bookish words in many places; a guide keeps new content from drifting back |
| ➡️ 7 | **Voice speed for beginners**: a slower setting for Toddler and Kindergarten, applied on top of the recorded voice | A child learning a sound needs more time between words than an older reader does |

## 7. Engagement

| | What | Why |
| --- | --- | --- |
| ✅ | **Make collections playable.** Done: a collection opens as its world's picture with a tray of earned stickers. Tap or drag a sticker in; drag it around (lower is nearer, so bigger); tap it to hear it; drag it out to take it away. Animals blink and bob. The picture is saved with the progress and in backups; the album button still shows every sticker | A collection that can be used is worth coming back for, and it gives the stars a purpose a child can see |
| ➡️ 2 | **Favourites and "read again"**: a heart on any story, and the favourite shows on the home screen | Young children love repetition; letting them find a favourite in one tap is the best retention feature they ask for |
| ➡️ 3 | **Story radio**: a sleep timer, a way to pick a story from picture tiles, and "play this one again" | The radio is the most-used screen on a journey and at bedtime, and it has no way to choose or to stop on its own |
| ➡️ 4 | **A gentle daily rhythm**: a "today's three" view with a small celebration at the end, and a week-long sticker trail | There is a daily path, but the end of the day has nothing to look forward to; a visible finish makes short sessions satisfying |
| ➡️ 5 | **Little rewards that aren't stars**: a new guide outfit, a new backdrop, a new sound | Variety in what is earned keeps a long-running app fresh |
| ✅ | **Shared play for a grown-up and child**: prompts like "ask me why" after a story, and a two-player mode on one device for brothers and sisters. Done: the talk-together prompts after every story (1.4), and "साथ खेलो" on the home screen. Two players (any child on the device, or a grown-up) take turns for 10 rounds, each at their own level: find the picture for Toddler and KG, read the word for Grades 1–2, that grade's quizzes for Grades 3–8, and a Hindi number word past 20 for the grown-up. Every right answer adds a star to one shared jar, and the other player may help | Co-viewing and conversation add far more to learning than the app can on its own |
| ➡️ 7 | **Sing-along rhymes**: the rhymes play as songs with a bouncing ball over the words (the word timings from section 1 make this possible), a clap-along beat and actions the guide does | Song is how small children hold on to language; there are 11 Hindi and 8 English rhymes today, all spoken, none sung |
| ➡️ 8 | **Make-your-own story**: in the sticker picture, the child arranges the stickers, presses record and tells what is happening; the picture and their voice are saved as their own book in the library | Creating beats consuming for engagement and for speaking practice, and it reuses two things already built (sticker scenes and the recorder) |
| ➡️ 9 | **An older child reads to a younger one**: a "read to your brother or sister" mission in Grades 7–8 that walks the older child through recording a Kindergarten story, which then plays for the younger child with a "read by…" ribbon | It gives the older reader a real audience (the best reason to read aloud well) and the younger one a loved voice; recordings stay on the device |
| ✅ | **A guide with far more to say.** Done: 42 tap lines (riddles, animal sounds, things to do, little facts) instead of 6; a greeting as the app opens that fits the time of day; a glad "I missed you" after three or more days away (never a word about streaks); and a cheer on the results screen for the first lesson, 10 to 500 stars, 1 to 50 stories read, 3 to 100 days played and a finished world. All recorded in the story voice | The guide is the child's friend in the app, and it repeats itself within a minute; warmth after an absence brings children back better than streak pressure does |
| ➡️ 11 | **Festivals and seasons that arrive on their day**: near Diwali, Holi, Rakhi, Eid, Christmas, Lohri, Pongal and Onam, the home screen puts up decorations, the festival's story and a special sticker (by the device's date, so it works offline) | Something new on a known day is a reason to open the app, and it ties the Hindi to what the family is actually doing that week |
| ➡️ 12 | **A surprise each day**: after the first lesson of the day, a gift box with one small thing (a sticker, a guide joke, a new sound for the play button) | A small, unpredictable reward is one of the most reliable reasons children return; it must never be bought or lost |
| ➡️ 13 | **"Words I know" book**: every word a child has got right three times goes into a picture dictionary they can flip through, hear, and show a grown-up, with a count on the home screen | Stars count lessons; children and parents care about words. Seeing "I know 84 words" is a stronger motivator than a star total |
| ✅ | **Free play between lessons**: a small sandbox with no right answer per world (drive a vehicle around the town, colour a picture of a word just learned, feed the farm animals) that opens after two lessons. Done: after every second lesson from Toddler to Grade 4, the results screen offers "खेल का समय!". Every world can colour a picture of its stickers, newest first; Vehicle Town adds driving the collected vehicles around the town with a horn; the farm adds feeding the animals, where each has foods it likes and any food can be offered. Nothing is scored | Open play is what children choose themselves; using it as the pause between lessons keeps sessions going without adding pressure |
| ➡️ 15 | **More Show time**: 3 episodes today; a series of 8 to 10 per guide, each ending on a question the next lesson answers | The episodes are the most TV-like part of the app, and three are used up in a day |
| ➡️ 16 | **For Grades 7–8**: a riddle of the day (पहेली), an idiom of the day (मुहावरा) with a comic strip, a comic maker using the cast, and quiz duels on one device | The older worlds are 120 comics and grammar; once read there is little reason to return daily, and this age likes wit, making things and competing |

## 8. Engineering and industry practice

| | What | Why |
| --- | --- | --- |
| ➡️ 1 | **Automated checks on every pull request**: run the tests, a screenshot comparison of the main screens, and an offline check (install, go offline, play one lesson from each grade). *Partly done: the tests now run on every pull request; the screenshot comparison and the offline check are left* | A change can quietly break a screen or the offline cache without failing a test |
| ➡️ 2 | **Watch three to five real children per age group** use it, in silence, noting where they get stuck, and fix what they do rather than what is said | It finds more than any review, including this one (which could not test with a child) |
| ➡️ 3 | **Accessibility pass**: colour-blind-safe colours (not only red/green for right/wrong), a minimum tap size of about 48 px, a left-handed layout option, screen-reader labels checked with a real screen reader, and reduced motion verified everywhere | The audit found no automated errors, but real assistive-technology use has not been tried |
| ➡️ 4 | **Children's-app store rules**, designed in now: a gate before the grown-ups' area, no links out of the app, a clear privacy statement, and no data collection | Both stores review children's apps harder, and the Play Store and App Store versions in [PLATFORM-EVALUATION.md](PLATFORM-EVALUATION.md) will need these |
| ➡️ 5 | **Performance budget**: first screen under about 2 seconds on a mid-range phone, content loaded per grade (see section 2), and images and scenes only drawn when on screen | Slow first launches are the main reason a family never opens an app a second time |
| ➡️ 6 | **A "what's new" note** inside the refresh bar and a short in-app changelog | Families should know why the app asks to refresh, and what changed for their child |
| ➡️ 7 | **Local, private usage insight for grown-ups**: which games a child finds hard, which stories they replay, how long they play (kept on the device, never uploaded) | Lets a parent steer a child toward the right game without any online analytics |
| ➡️ 8 | **Content tooling**: a script that checks every Hindi string against the style guide (bookish words, spelling, length) and every picture against the art rules | The content is now thousands of lines; checks catch drift faster than a review |

## 9. Hindi stories and poems to add

When this review was written: Toddler 6 stories; Kindergarten 40 stories and 7 rhymes; Grade 1 31 stories (10 of them decodable); Grade 2 16 and 2 poems; Grade 3 15 and 2; Grade 4 13 and 2; Grades 7–8 120 comics and **no prose at all**. The thinnest shelves are Toddler, poems everywhere, and prose for the oldest. Titles below are not in the app yet. Older authors are suggested where their work is out of copyright in India (60 years after the author's death); check each text before using it, and retell rather than copy any modern version.

| | What to add | Why |
| --- | --- | --- |
| ✅ | **Toddler: 12 more tiny stories about the child's own day.** Done: brushing teeth, bath time, getting dressed, दाल-चावल, hide and seek, my hands and feet, the park, Nani's house, the vegetable seller, bedtime, what vehicles say and who eats what, in two new units on the farm, with 13 new pictures (toothbrush, soap, shirt, dal, hand, slide, ball, tomato, grass, rasgulla, wheel, peanut, grain) | Six stories last a toddler a week; this age wants their own routine told back to them, with one new word a page |
| ➡️ 2 | **Vehicle stories for Kindergarten** (8): a day at the fire station, the garbage truck's morning, the night train with sleeping berths, inside the metro, the airport, the school bus, the ambulance helps, the digger builds a road | Follows the child's interest in vehicles, in the world he already plays in (Vehicle Town), and teaches the words for places and jobs |
| ✅ | **Rhymes and counting-out games.** Done: 12, each marked with where it comes from. Folk: अक्कड़ बक्कड़, पोशम पा, आहा टमाटर, ऊपर पंखा चलता है, गोल-गोल रानी, चिड़िया उड़, and the first lines of काले मेघा. Adapted (a kinder ending): तितली उड़ी and चुन्नू-मुन्नू (who now share the rasgulla half and half). Written for the app, because every version found may have an author: a counting song, a lullaby (चंदा सोया, तारे सोए) and an action rhyme (मेरे दो हाथ). Four are on the farm map, eight in a new KG unit; no film songs | Rhymes are the most replayed content for ages 2–6 and the base for sing-along (7.7); avoid film songs, which are in copyright |
| ➡️ 4 | **Cumulative and call-back folk tales for Kindergarten and Grade 1** (8): चल रे मटके टम्मक टू (the old woman in the pumpkin), चिड़िया का दाना (the sparrow and her grain), the ant and the grasshopper, the three fish, the crane and the crab (बगुला भगत), the sparrow and the crow, the mouse who became a lion, the singing donkey | Repeating lines let a child join in and, later, read along; these are among the best-known Hindi nursery tales and none are in the app |
| ➡️ 5 | **More decodable books for Grade 1** (15): three more at each of the five matra stages, then a sixth stage with ं and ँ, each with a repeating sentence frame | Ten books (section 1) are read in two weeks; a beginner needs many easy wins at each stage before the next matra |
| ➡️ 6 | **Ramayana and Krishna, continued** (Grade 1–2, 10): Shabari's berries, building the bridge to Lanka, Bharat and the sandals, Ram comes home (the first Diwali), Krishna and Sudama, Krishna and Kaliya, Dhruv the star, Ganesh and the moon, Arjun and the bird's eye, Eklavya | The four Ramayana stories in Grade 1 stop mid-tale; children ask what happens next, and these tie to the festival items (7.11) |
| ➡️ 7 | **Festival stories for everyone's calendar** (6): Eid at the fair (after Premchand's ईदगाह, also Grade 3), Guru Nanak and the true bargain (सच्चा सौदा), Christmas in the hills, Lohri by the fire, Pongal's sweet rice, King Mahabali comes home (Onam) | The app has Diwali, Holi and Rakhi only; India's festivals are a child's whole year |
| ➡️ 8 | **Tales from across India** (Grade 2–4, 10): Punyakoti the truthful cow (Karnataka), Tejimola (Assam), Lalkamal and Neelkamal (Bengal), a Gonu Jha tale (Mithila), a Sheikh Chilli tale, more Akbar–Birbal (the green horse, the camel's neck), more Tenali Rama (the red peacock, the brinjal curry), Jataka tales (the banyan deer, the wise quails) | The shelves lean on the Panchatantra; regional tales widen the vocabulary and show Hindi as a window on all of India |
| ➡️ 9 | **True stories of real people** (Grade 3–4, 10): Kalam the newspaper boy, Kalpana Chawla looks at the stars, Salim Ali and the sparrow, C. V. Raman asks why the sea is blue, Ramanujan and numbers, Savitribai Phule opens a school, Rani Lakshmibai, Milkha Singh runs, Gandhi and the spelling test, Sudha Chandran dances again | Non-fiction is missing entirely; it builds the knowledge that reading comprehension depends on from Grade 3 |
| ➡️ 10 | **"How things work" books** (Grade 2–4, 8): where rain comes from, how a seed grows, why the moon changes shape, how bees make honey, how a letter travels, where milk comes from, how a train stays on its track, day and night | Information text in simple Hindi is rare anywhere; it also feeds the science tag, which has almost nothing behind it |
| ➡️ 11 | **Classic poems for Grades 3–4** (8): Subhadra Kumari Chauhan's यह कदंब का पेड़ and खिलौनेवाला, verses of झाँसी की रानी, Ayodhya Singh Upadhyay 'Hariaudh''s एक बूँद, Maithili Sharan Gupt's children's verses, Shridhar Pathak's nature poems | Four poems cover two grades; these are the poems Hindi schoolbooks have used for generations, and they suit the recorded voice and sing-along |
| ➡️ 12 | **Prose for Grades 7–8** (12, abridged with a glossary and questions): Premchand's ईदगाह, दो बैलों की कथा, बड़े भाई साहब, पंच परमेश्वर and नमक का दारोगा; Tagore's काबुलीवाला and तोता-कहानी in Hindi; two long folk tales; a diary, a letter and a news report to read | The oldest reader has comics and grammar but no real prose; these are the stories her school syllabus draws on, and reading stamina only comes from longer text |

## 10. Maths to add

When this review was written: one English maths world each for Kindergarten (21 lessons) and Grade 1 (21 lessons), following the North Carolina standards, one episode of Show time, and nothing after Grade 1. Every lesson is the same kind of game (a question and answer cards). Hindi numbers exist in the content but are not taught as maths.

| | What to add | Why |
| --- | --- | --- |
| ➡️ 1 | **Maths games you do with your hands**, not only answer cards: fill a ten-frame, hop along a number line, a balance scale for "equal", a shop with coins, a pattern train, a clock with hands to turn, a shape builder (tangram), measuring with a ruler | 42 lessons share one format, so maths feels like a quiz while Hindi has a dozen kinds of game; young children learn number by moving things |
| ✅ | **Counting stories.** Done: 8 for Kindergarten in Hindi and English (five little monkeys, Nani's rotis, how many wheels, the bus fills up, sharing laddoos fairly, five little ducks, counting stars, the ant and ten grains), next to the numbers in Vehicle Town. A story page can now count (scene "count"): the things appear one by one, each with its number, under the vehicle when it is its wheels being counted | Maths has no stories at all; a story gives a reason to count and joins the two halves of the app |
| ✅ | **गिनती: Hindi numbers as their own strand.** Done: the numbers now go to 100 (words, English, Devanagari digits, all recorded), and a new game teaches them in ten kinds of round (count by tapping, find the group, hear and find, Devanagari digits, what comes next, read the word, ज़्यादा / कम / बराबर, जोड़ो, घटाओ, आधा). Units: 1–10 on the farm, 1–20 in Kindergarten, 21–50 and the maths words in Grade 1, 51–100 in Grade 2 | For a child growing up abroad, Hindi numbers past ten are among the first things lost; the content already holds them but no lesson teaches them |
| ➡️ 4 | **Fill the gaps in Kindergarten and Grade 1**: counting back from 10 and 20, first–second–third, patterns (AB, AAB), skip counting by 2s and 5s, doubles and near-doubles, a number-bond game to 10 and to 20, and fluency practice with no timer | These are the skills the two worlds touch least, and the ones Grade 2 leans on |
| ➡️ 5 | **A Grade 2 maths world** (about 24 lessons): hundreds, tens and ones; adding and subtracting within 100, then 1,000; odd and even; equal groups and arrays; time to five minutes; inches, feet and centimetres; money problems; halves, thirds and fourths; bar graphs | Maths simply stops after Grade 1; a child who finishes the carnival has nowhere to go |
| ➡️ 6 | **Days, months, time and money in Hindi**: सोमवार to रविवार, the months and seasons, "कितने बजे हैं?", and a market with rupees and paise (the English world uses US coins) *Partly there: a Grade 4 quiz on the days and months (7 questions). Left: days, months and seasons for younger children, telling the time in Hindi, and rupees and paise* | Everyday number talk at home is in these words; they are vocabulary and maths at once |
| ➡️ 7 | **पहाड़े: times tables sung the Hindi way** ("दो एकम दो, दो दूनी चार"), 2 to 10, with a beat, then a game | Chanted tables are how generations learned them, they are fun to sing along to, and they prepare Grade 3 |
| ➡️ 8 | **Grade 3 and Grade 4 maths worlds**: multiplication and division, fractions on a number line, area and perimeter, elapsed time, rounding (Grade 3); multi-digit multiplication, long division, equal fractions, decimals, angles, factors, and the Indian number system of lakh and crore (Grade 4) | Completes the path, so the app grows with the child instead of being left behind at age 7 |
| ➡️ 9 | **Maths stories and puzzles for older children** (Grades 3–8): the grains of rice on the chessboard (doubling), the seventeen camels (fractions), Aryabhata and zero, Ramanujan and the taxi number 1729, Shakuntala Devi, Birbal and Tenali number puzzles, and logic puzzles inside the detective comics | Shows maths as something people did and enjoyed; the oldest reader gets maths through the comics she already likes |
| ➡️ 10 | **More maths in Show time**: an episode for each Kindergarten unit (counting, comparing, making ten, shapes, measuring) | There is one maths episode; the episode-then-game pattern is the app's best way to introduce an idea |

## Suggested order

1. ✅ **Sections 4.1 and 6.1** (fill the screen, one language rule): done.
2. ✅ **Section 5.1** (character poses and faces): done.
3. **Section 8.2** (watch real children), to check the first two and set the order for the rest.
4. **Sections 8.1 and 8.5** (automated checks and a performance budget), so nothing slips as the app grows.
5. ✅ From the second review, the cheapest big wins first: **7.10** (a guide with more to say), **9.1 and 9.3** (toddler stories and rhymes), **10.2 and 10.3** (counting stories and Hindi numbers): done. Then ✅ **7.6 and 7.14** (shared play, with **1.4**, and free play): done. Next: **7.7** (sing-along) and **10.1** (hands-on maths games).
6. The rest, in the order the watching of real children suggests.

## What not to do

- **No cloud accounts or online analytics.** Trust is a feature; the privacy-first design is part of what makes this app different.
- **No video files for stories.** CSS scenes give most of the delight at a thousandth of the size, and they stay sharp on every screen.
- **No speech recognition yet.** In browsers it needs the internet, and offline models are too large for this audience's phones.
