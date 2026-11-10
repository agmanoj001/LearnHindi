# Khel Khel Mein · खेल-खेल में

*"Learning through play."* An offline web app (PWA) where children learn **Hindi** from Toddler to Grade 4 (with comics and grammar for Grades 7 and 8), and **English phonics** and **math in English** in Kindergarten and Grade 1. There are 25 animated worlds, at least three in every grade from Kindergarten to Grade 4, five in Grade 7 and four in Grade 8, each with its own guide character, a path of short lessons, stars to earn and a collection to fill. Every world is tagged with what it teaches (Phonics, Grammar, Stories, Math …).

- **Hindi** follows India's NIPUN Bharat targets and the themes of the NCERT books (*Sarangi*, *Veena*). From Grade 2 each grade has a phonics-and-reading world, a grammar-and-writing world and a stories-and-poems world.
- **English phonics** follows the **North Carolina Standard Course of Study, Reading: Foundational Skills** for Kindergarten and Grade 1.
- **Math** follows the **North Carolina Standard Course of Study** for Kindergarten and Grade 1, in English only.
- **Grades 7 and 8** have Hindi comic series (four in Grade 7, three in Grade 8) and a grammar world each: 120 comics in all (fifty of them longer reads of 16–20 panels), from Akbar–Birbal and Vikram–Betal to a robot who takes every idiom literally and an eleven-year-old girl in a city colony. The grammar follows the व्याकरण CBSE schools teach with NCERT's *मल्हार*.
- **Every lesson adapts** while the child plays: it gets harder after a run of right answers and easier after misses.

Everything is spoken aloud, so a child doesn't need to read to play. Tap targets are big, there are no timers, and nothing can go wrong: a wrong tap is a gentle wobble and a hint. Lessons take 2–5 minutes.

It's plain HTML, CSS and JavaScript with no build step, so it runs on GitHub Pages and works offline once opened.

### Does it work without internet?

**Yes, after the first visit.** The first time the app is opened online, it saves all its files on the device (the pages, every picture, the fonts and the lessons: about 55 files). After that it opens and plays with no internet at all: every lesson, story, game, recording and setting works offline, and progress is saved on the device. Updates download in the background the next time it is online; when a new version is ready, a small bar on the home screen offers to refresh (never in the middle of a lesson).

The one thing that can depend on the device is the **computer voice**. On Android the Google text-to-speech voices work offline once their voice data is installed (*Settings › System › Languages › Text-to-speech › Google › Install voice data › Hindi*). Some desktop browsers use online voices, so offline they fall back to a plainer voice or stay silent. **Family recordings made in the app always work offline**, which is another good reason to record them.

On an iPhone or iPad, **add the app to the Home Screen** (Share › Add to Home Screen): Safari can clear the data of websites that haven't been opened for a while, but not of home-screen apps. Installed copies also ask the browser to keep progress and recordings safe from storage clean-ups.

Thinking of rebuilding it in an app builder? [docs/PLATFORM-EVALUATION.md](docs/PLATFORM-EVALUATION.md) compares FlutterFlow, Thunkable and Appy Pie with the current web app, with offline as the deciding requirement, and explains how to put the app in Google Play and the App Store without a rewrite.

[CURRICULUM.md](CURRICULUM.md) explains what each grade teaches, the sources, and the learning research behind the design.

### How it feels to use

- **Everything pressable feels pressable**: cards, buttons and map stops have a solid bottom edge and sink when tapped (and lift a little under a mouse).
- **Answers answer back**: a right answer glows green, grows a ring and bursts into sparkles; a wrong one wobbles with a brief red edge, and nothing is lost. Three, five, eight or twelve right first time in a row earn a quick “3 in a row! · लगातार 3!”.
- **The home screen greets the child**: the guide of the next lesson says नमस्ते (by name, if a nickname is set), with the day's path, a ring that fills as it is walked, and the streak of days.
- **Finishing a lesson is a small celebration**: stars pop in one by one with sparkles, a perfect score gets a golden card, and chips show how many were right first time and the best run.
- **Stories read like a picture book**: stacked pages, page dots, a turning animation, words that light up as they are read, and on tablets the picture sits beside the text.
- **Little ones' stories move**: every page of a Toddler or Kindergarten story is a small scene that follows the words. Hanuman flies up to the sun, rain patters and the frog jumps with a splash, the two goats bump heads on the bridge, Diwali lamps light up one by one, Ganesh goes round and round his mother, the cat falls asleep under the stars. Each scene has its own backdrop (night, dawn, rain, sea, under water, a room at home), a matching sound, and plays again when the picture is tapped.
- **Things arrive with a little life**: answer cards, world cards and map stops pop in one after another. All of it stands still for anyone who has asked their device for reduced motion.

## The worlds

| Grade | World | Guide | Subject | Tags | What it teaches |
| --- | --- | --- | --- | --- | --- |
| Toddler (2–3) | **Animal Farm** · पशु फ़ार्म | Kuku the chick | Hindi | Listening, Vocabulary, Counting | Animals and their sounds, colours, shapes, big and small, counting to 5, vehicles, six tiny moving stories |
| Kindergarten (3–6) | **Vehicle Town** · गाड़ी नगर | Gappu the elephant | Hindi | Letters, Phonics, Reading | Hearing sounds, स्वर and व्यंजन, tracing, the alphabet train, two- and three-letter words, counting to 10, rhymes, and eight first stories (Hanuman, Krishna, Ganesh, folk tales) |
| Kindergarten | **Buzz's Letter Garden** | Buzz the bee | English | English, Phonics, Letters | Letters big and small, first and last sounds, rhyming, clapping syllables, reading CVC words, short vowels, sight words |
| Kindergarten | **Pip's Number Igloo** | Pip the penguin | Math (English) | Math, Counting, Shapes | Counting, numbers to 100, comparing, adding and taking away, making 10, teen numbers, shapes, positions, measuring |
| Grade 1 (6–7) | **Jolly Jungle** · मस्त जंगल | Chiku the monkey | Hindi | Phonics, Reading, Vocabulary, Stories | Every matra, the barakhadi, words with matras, family, food and festival words, rhymes, little sentences, first stories, tales from the Ramayana and folk tales |
| Grade 1 | **Kiki's Phonics Castle** | Kiki the dragon | English | English, Phonics, Reading | Short vowels, sh ch wh ck, blends, magic e, vowel teams, bossy r, syllables, -s and -es, tricky words |
| Grade 1 | **Tiko's Number Carnival** | Tiko the owl | Math (English) | Math, Counting, Shapes | Counting to 150, tens and ones, > = <, facts to 20, story problems, time, coins, graphs, halves and fourths |
| Grade 2 (7–8) | **Dino Valley** · डायनो घाटी | Dumdum the dinosaur | Hindi | Phonics, Reading, Spelling | Half letters, the shapes of र, ि and ी, ड and ड़, home words, all the matras |
| Grade 2 | **Desert Fair** · रेगिस्तान का मेला | Ooty the camel | Hindi | Grammar, Writing, Vocabulary | Action words, living and non-living, opposites, one and many, । and ?, times of day and seasons, sentences |
| Grade 2 | **Bholu's Story Forest** · भोलू का कहानी वन | Bholu the bear | Hindi | Stories, Poems, Listening | A lesson for each of the 8 Grade 2 stories, two poems, rhymes |
| Grade 3 (8–9) | **Space Trip** · अंतरिक्ष यात्रा | Zoomi the robot | Hindi | Grammar, Vocabulary | लिंग, वचन, विलोम, नाम and काम, पर्यायवाची, punctuation, space words |
| Grade 3 | **Mitthu's Folktale Palace** · मिट्ठू का कथा महल | Mitthu the parrot | Hindi | Stories, Poems | A lesson for each Panchatantra and folk tale, two poems, "which story teaches this?" |
| Grade 3 | **Gauri's Village** · गौरी का गाँव | Gauri the calf | Hindi | Reading, Writing, Spelling | Village words, spelling, building words, completing sentences, building sentences |
| Grade 4 (9–10) | **Ocean Voyage** · समुद्री सफ़र | Ollu the octopus | Hindi | Grammar, Vocabulary | सर्वनाम, विशेषण, क्रिया, काल, opposites and same-meaning words, ocean words |
| Grade 4 | **Himu's Story Mountain** · हिमू का कथा पर्वत | Himu the snow leopard | Hindi | Stories, Poems | Akbar–Birbal, Tenali Raman and fables with a moral, two poems, "which story teaches this?" |
| Grade 4 | **Chintu's Word City** · चिंटू का शब्द नगर | Chintu the squirrel | Hindi | Vocabulary, Writing, Reading | मुहावरे, synonyms, one word for many, days and months, city words, longer sentences |
| Grade 7 (12–13) | **Mishti's Mischief** · मिष्टी की मस्ती | Bijli the goat | Hindi comics | Comics, Stories, Vocabulary | Seventeen comedies from the small town of कटहलपुर, with idioms, word meanings, questions and an idiom quiz |
| Grade 7 | **Rimjhim's Rumpus** · रिमझिम का धमाल | Biscuit the puppy | Hindi comics | Comics, Stories, Vocabulary | Twenty comics (ten short, ten long) about Rimjhim, eleven, her family, her best friend and her puppy: home, school, friendship, fairness and confidence |
| Grade 7 | **Birbal's Wit** · बीरबल की बुद्धि | Moru the peacock | Hindi comics | Comics, Stories, Vocabulary | Sixteen Akbar–Birbal tales from folk tradition; each stops so the reader can think like Birbal before the trick |
| Grade 7 | **Chippu the Robot** · चिप्पू रोबो | Chippu the robot | Hindi comics | Comics, Vocabulary, Stories | Seventeen comedies about a robot who takes every मुहावरा literally; say what it really means before Kavya explains |
| Grade 7 | **Gyanu's Grammar Library** · ज्ञानू का पुस्तकालय | Gyanu the tortoise | Hindi grammar | Grammar, Vocabulary, Writing | संज्ञा, सर्वनाम, विशेषण, क्रिया and काल, कारक, अव्यय, वाक्य and विराम चिह्न, उपसर्ग-प्रत्यय, संधि, समास, शब्द-भंडार, correct sentences and spelling |
| Grade 8 (13–14) | **Detective Dadi** · जासूस दादी | Mausi the cat | Hindi comics | Comics, Stories, Vocabulary | Seventeen mysteries to solve: name the culprit before the reveal; richer vocabulary and idioms |
| Grade 8 | **Vikram and Betal** · विक्रम और बेताल | Betal the spirit | Hindi comics | Comics, Stories, Vocabulary | Sixteen riddle tales from the Baital Pachisi tradition and folk logic puzzles; answer Betal's riddle before King Vikram does |
| Grade 8 | **Master Murari** · मास्टर मुरारी | Minku the lab mouse | Hindi comics | Comics, Stories, Science, Vocabulary | Seventeen episodes where a retired science teacher exposes a fake magician's “miracles”: indicators, refraction, density, echoes, magnets, eclipses, static, combustion, air pressure, dispersion, rusting, mosquitoes and snakebite first aid |
| Grade 8 | **Chatur's Word Lab** · चतुर की शब्द-प्रयोगशाला | Chatur the fox | Hindi grammar | Grammar, Vocabulary, Writing | शब्द-भेद, उपसर्ग-प्रत्यय, the kinds of संधि and समास, क्रिया, the 14 काल, वाच्य, सरल-संयुक्त-मिश्र वाक्य, अलंकार, मुहावरे and लोकोक्तियाँ, अशुद्धि-शोधन |

Each world is a winding path of **units** named for what the child is learning ("Let's learn matras ा ि ी", "Let's learn magic e", "Let's make 10"). Each unit has a few **lessons**, joined by a trail that is gold where the child has been and dotted ahead, with a **Start** tag on the next lesson. Lessons open one after another, each earns 1–3 stars (for answers right on the first try), and each first finish (and every 3-star replay) adds something to the world's **collection**.

The **home screen** shows the child's grade first, then every other world, so moving between grades is one tap. A row of **tags** at the top filters the worlds: tap *Grammar* to see every grammar world, *Stories* for every story world, and so on. Each card shows its tags too. A parent can lock the app to one grade instead.

**Getting out is always one tap.** The back button in a lesson returns to the world map, and the map's back button returns home. Android's back button and gesture do the same.

### The story library

The libraries hold **100 read-along stories and rhymes**. Toddlers have **six tiny stories** of three or four pages, two to four words a line (*The chick and its mother*, *Here comes the rain*, *Fly, butterfly*, *Night time*, *Little fish*, *Elephant bath time*), and every Toddler and Kindergarten page is a little moving scene. Kindergarten and Grade 1 have **easy first stories** in a few short lines a page: from the **Ramayana** (*Hanuman and the sun*, *The little squirrel* who helped build the bridge, *The night of lamps*, *Ram and the bow*, *The golden deer*, *Hanuman's great leap*, *Hanuman brings the mountain*), **Krishna** (*The butter thief*, *The Govardhan hill*), **Ganesh** (*Ganesh goes round*), and folk tales (*Two goats*, *The sun and the wind*, *The elephant and the ant*, *The fox and the crow*, *Two cats and a monkey*, *The donkey and the salt*, *The elephant and the tailor*). Each has picture questions and ends with a gentle lesson (सीख). The older grades have Panchatantra and Jataka tales (*The lion and the mouse*, *The monkey and the crocodile*, *The four friends*, *The jackal and the drum*, *The monkey and the wedge*, *The hare in the moon*), Akbar–Birbal stories (*The emperor's parrot*, *Who owns the water?*, *The shorter line*, *The cucumber in the bottle*, *Birbal counts the crows*, *Birbal's khichdi*), Tenali Raman, fables, poems, new stories starring the app's characters, **बाल गीत** for Kindergarten (मछली जल की रानी है, चंदा मामा दूर के, आलू कचालू, हाथी राजा and new ones), and classic **English nursery rhymes** in the English phonics worlds (*Twinkle, Twinkle*, *Humpty Dumpty*, *Baa, Baa, Black Sheep*, *Hickory, Dickory, Dock*, *Jack and Jill*, *Rain, Rain*, *Row Your Boat*, *Hey Diddle Diddle*), each with a rhyming-word question. Only traditional or public-domain rhymes and our own are used; film songs are left out because they are still in copyright. Every word can be tapped to hear it, pages are read aloud in Hindi (and English in "both" mode), and each story ends with questions: pictures for the younger grades, short written answers for older ones. Folktales finish with their **सीख** (moral). The library shows the child's grade and the one before it. Every story world also has a **story order** lesson: pictures from a story, shuffled, to tap in the order things happened.

### The characters

Each world has a guide who waves, talks when the app speaks, reacts to answers, and does something silly when tapped (sneezes, spins, dances). They turn up in each other's worlds too: Pip and Tiko star in Grade 1 story problems, Chiku chases a banana and Zoomi flies to the Moon in the story library.

### Placement check

Not sure which grade to start with? The first screen (and the parent area) has a **two-minute check**: two quick questions per level, from Kindergarten letters (क, अ) through reading words with matras and half letters to Grade 4 grammar. It stops at the first level the child doesn't know yet and suggests that grade.

### Read-along and "tell it back"

Story pages light up **word by word** as they are read (exactly, where the voice reports word timings; otherwise estimated from word length, which also works for family recordings). With **Tell it back** turned on in the parent area, each story ends with "Now you tell the story!": the child records their own retelling, with the pictures as prompts, and grown-ups can listen to it later. Recordings never leave the device.

### Today's path

The top of the home screen shows **three steps for today**: *Keep going* (the next new lesson, in the grade's world with the least done, so subjects stay balanced), *Review* (a finished lesson that is due again) and *Story time* (a story not read yet). Each turns green once done today.

### Comics (Grades 7 and 8)

For confident readers, seven comic series in Hindi, 120 comics in all, in the spirit of classic Indian comics. Each series has ten short comics (10–12 panels) and then longer ones (16–20 panels, 500 words or more) for readers ready for more. Five series are original; two retell folk tales that belong to everyone.

- **मिष्टी की मस्ती** (Grade 7): Mishti, twelve, and her goat Bijli, who eats everything, turn the small town of कटहलपुर upside down: a goat-eaten science project, the Colonel's vanishing roses, a kite fight, a power cut, a solar cooker, a lost cousin at the Dussehra fair, Grandpa's first smartphone … and, in the longer ones, a class-monitor election, a fort trip, a green-bearded Holi, saplings versus a hungry goat, Grandpa racing the Colonel, a neighbourhood newspaper and a dusty library brought back to life.
- **रिमझिम का धमाल** (Grade 7): Rimjhim, eleven, lives in Gulmohar Colony with her little brother Bablu, Mummy (an engineer), Papa (who loves to cook), Dadi Amma and Biscuit, a puppy she found in the rain. Her best friend is Zoya; Sunny is the show-off in class. Short comics: a rakhi tied both ways, Mummy's Sunday strike, a milk tooth, Dadi Amma teaching her to cycle, girls' cricket, getting glasses, a falling-out with her best friend, the tree in the school play, a lauki lunchbox. Long ones: a new girl from Ladakh, stage fright, the science fair, a skin-colour story, speaking up about bullying on the bus, Dadi Amma finishing her degree at 68, a hidden report card, the colony's stray dogs, a nature camp, and what lies behind Sunny's teasing.
- **बीरबल की बुद्धि** (Grade 7): Akbar–Birbal tales in new words: the line made shorter without touching it, the well sold without its water, the thief's magic stick, a pot full of wisdom, sugar sorted by ants, the camel's crooked neck, and longer ones: the green horse, the hen or the egg, four perfect fools, counting the blind, the emperor's dream and eggs in the pond. (The crows and the khichdi are already in the Grade 4 story library.)
- **चिप्पू रोबो** (Grade 7): Kavya, twelve, builds Chippu, a robot with ten thousand words and no idea what idioms mean. Told to “light lamps of ghee”, he empties the kitchen's ghee; told an exam is “riding on her head”, he tries to catch it. By the last episode he gets them right. The longer comics take him to the hills, a lemonade stall, a debate, a fever night, a new neighbour from Kerala, a sulking little brother and a colony “thief”.
- **जासूस दादी** (Grade 8): Dadi, a retired school principal with an old black umbrella, solves mysteries with her granddaughter Roohi, the gentle giant Pappu and her sharp-eyed cat Mausi: a wedding necklace, a night train, a fake museum statue, a master of disguise, a haunted haveli, an online scam, a locked room, fake milk … The longer cases: a library manuscript, a leaked exam paper caught by its spelling mistakes, a swapped painting, a show dog that didn't bark, a treasure map with a railway station on it, a hotel “ghost” on a pulley, and expired medicines with new date stickers.
- **विक्रम और बेताल** (Grade 8): King Vikram carries Betal from the old peepal tree; each night Betal tells a tale and ends with a riddle. Classic tales (the lion-makers, the three delicate queens, the three golden statues) and folk logic puzzles (the seventeen camels, the river crossing, the two guards). In the last tale Betal reveals the trick behind it all. In season two the two are friends, and Vikram visits the peepal to keep playing their old game: the apples at three gates (work backwards), the purse of a hundred coins, the seven-link chain, the slowest race, four litres from five and three, and tops or bottoms.
- **मास्टर मुरारी** (Grade 8): a retired science teacher on an old bicycle and his young friend Golu keep exposing Thagraj, a fake magician: a lemon that “bleeds” (turmeric and lime), a vanishing coin (refraction), floating eggs (density), a ghost in a well (echo), a spirit letter (invisible ink), a magic ring (a hidden magnet), eclipse fear, a mirage, a magic comb (static charge), and a money-doubling scam. In season two Thagraj is back: a candle that makes water climb (air pressure), dancing raisins (carbon dioxide), a “rainbow stone” (a prism), a mosquito amulet (where mosquitoes breed, and see a doctor for fever), a bed of nails (pressure = force ÷ area), iron turned to “gold” (displacement and rusting), and a snake stone (what really to do for a snakebite: keep still and get to hospital for antivenom).

Comics scroll panel by panel (one column on a phone, a two-column comic page on a tablet), with speech and thought bubbles, narration boxes and sound effects. A comic left half-read opens with **“Continue from panel 13”** (a mystery already solved stays solved), and the **अ+** button makes the text bigger and remembers it. **Tap a bubble** to hear it; each character has their own voice pitch. The speaker button reads the whole comic aloud. **Underlined words** show their meaning in Hindi and English. Mysteries, Birbal's tricks, Betal's riddles, Chippu's idioms and Masterji's science all **stop before the reveal** so the reader answers first (a wrong guess gets a hint). Every comic ends with its word list and three questions, and each world has an **idiom quiz** built from its comics. Finishing a comic collects a character card.

### Grammar (Grades 7 and 8)

Two grammar worlds follow the व्याकरण that CBSE schools teach alongside NCERT's मल्हार textbooks: twelve topics a grade (see [CURRICULUM.md](CURRICULUM.md)). Each topic is one lesson in two parts:

- **सीखो (learn)**: two to four short cards with the rule in Hindi, a line of English, examples with the key part highlighted, and a table (the kinds of संज्ञा, the eight कारक, the संधि rules…). The speaker button reads a card aloud.
- **अभ्यास (practise)**: eight questions mixing three kinds: **choose the answer**, **tap the word** in a sentence (the विशेषण, the कर्म, the wrong word), and **sort** words into groups (तत्सम or तद्भव, करण or अपादान). After every answer a **क्यों?** box explains the rule and waits until the reader taps *आगे*, so nobody is rushed past the explanation.

Each unit ends with a **mixed review** that takes questions from every topic in the unit, in turn, without the cards. The parent area lists grammar topics among the things to practise.

### Show time and Story radio (for journeys)

Two big buttons under Today's path are for times when a child would otherwise just watch something, such as a long car or train ride. Both work fully offline.

- **Show time (कार्टून)**: short animated comic episodes (about 3 minutes) starring the guides. Each one quietly teaches one thing and repeats it 4–6 times inside the story: *Chiku's magic stick* (Grade 1, the ा matra: नाव, गाय, छाता, माला, तारा), *Gappu's letter bus* (Kindergarten, क ख ग घ) and *Tiko's ten balloons* (Grade 1 English math, partners of 10 and the make-10 trick). Speech bubbles light up word by word as they are spoken (like same-language subtitles), characters ask questions, and "say it with me!" pauses let the child join in. **Just watch** answers each question by itself after a few seconds, so it plays hands-free; **Play along** waits for a tap. Afterwards a recap shows the words again, with a button for the matching game; the next episode starts by itself, up to three in a row, then it suggests a stretch. An episode watched today or yesterday adds *Play what you watched* to Today's path.
- **Story radio (कहानी रेडियो)**: the grade's stories and rhymes read aloud one after another (a rhyme after every two stories), each ending with a question to think about. In Grades 7 and 8 it plays the comics as radio plays: a narrator reads the captions, each character speaks in their own voice, and mysteries and riddles pause with “सोचो…” before the reveal (that grade's comics first, then the grade below's). Toddler, which has no stories of its own, hears Kindergarten's. The screen stays on but goes dark, which suits car rides and children who feel sick looking at a screen. Family recordings of story pages are used when there are any.

Episodes are scripts in `content.json`, built from the app's own drawings, so each one is a few kilobytes instead of a video file. See [Writing an episode](#writing-an-episode).

### How lessons adapt

- **Inside a lesson**, two answers right first time in a row make the next round harder, and two misses in a row make it easier. A small "Level up!" marks each step up. Harder means 3 or 4 choices instead of 2, look-alike wrong answers, bigger numbers with fewer pictures in math, a decoy word in sentence building, or words without their picture when sorting.
- **The next visit** to a lesson starts at the level the child reached.
- **Practice weighting**: every answer is recorded per word, letter, matra and math skill, and the ones a child finds hard come up more often.
- **Spaced review across days**: every finished lesson comes back for review after 1, 2, 4, 7 and then 14 days. A strong result moves it to a longer gap; a weak one brings it back tomorrow. Reviews show up in Today's path.
- **Hints, never answers**: in math, a second wrong tap brings a strategy ("Count on from 6", "Fill the ten first"), and objects can be tapped to count them one by one.

## Parent area

**Press and hold the settings button (top right of the home screen) for 1 second.** A ring fills while you hold; a quick tap shows a reminder to hold.

- **Children**: up to four children, each with their own grade, stars and settings, a guide character and an optional nickname. With more than one, the start screen asks "Who's playing?". Voice recordings are shared.
- **Grade**: who is learning.
- **Navigation**: *Stay in this grade* shows only this grade's worlds on the home screen. *Unlock every lesson* opens the whole path. *Math worlds* shows or hides the English math worlds.
- **Language** (Hindi worlds): Hindi, English, or both. In "both", words are said in Hindi then English, and some rounds alternate languages. Math worlds are always in English.
- **Play time and reading support**: a *daily limit* (15–60 minutes, or none). When it's reached, the next lesson shows a break screen with an idea for off-screen play; a lesson already started is never cut off, and a grown-up can hold *+10* for ten more minutes. *Captions* show everything the app says as text. *Tell it back* lets the child record themselves retelling each story.
- **Sound**: background music and sound effects, each on or off. Music can also be switched off with the ♪ button on the home screen (handy in a car or a quiet room). Each world has its own tune, built from a four-chord progression: its opening phrase stays the same so the world sounds like itself, and the answering phrases change each time round, so it never loops every few seconds. In lessons the music plays quieter and all but stops while anything is said, so children hear the sounds they are learning.
- **Voices**: pick the Hindi and English text-to-speech voice (the best installed voice is chosen by default), set the speed, and test them.
- **Before a trip**: a checklist to run while there is still internet: saved for offline use, on the home screen, a Hindi voice on the device, family recordings, storage kept safe, and the daily limit.
- **Record your voice**: record any word, letter, story page, moral, episode line or phrase right in the app. Your recording replaces the computer voice. See below.
- **Recordings from files**: load recordings made elsewhere.
- **Special vehicle photo**: a photo from the device becomes a vehicle in Vehicle Town's garage. It is shrunk and saved only in this browser.
- **Parent area language**: English or हिन्दी, switched at the top.
- **Progress**: this week's minutes per day, lessons played and reviews due; Show time episodes watched; **Getting better** (each lesson's first score against its latest, as a before-and-after measure); the child's **story retellings**; stars per world, a "practise together" list (words, letters, matras and math skills the child often misses) and a "doing great" list, and a reset button.

Everything stays on the device. Nothing is uploaded.

## Voices and recordings

For everything the app says, it uses, in order:

1. **A recording on this device** (made in the app or loaded from files). Kept in the browser's IndexedDB, never uploaded.
2. **A file in `audio/`** named in `content.json` (`"audio": { "hi": "bus_hi.mp3" }`).
3. **The browser's text-to-speech**, using the best Hindi (`hi-IN`) and English voices installed.

If the device has no Hindi voice, the home screen shows a card with the steps for that kind of device (Android, iPhone and iPad, Windows, Mac or Chromebook) until a grown-up hides it, and the parent area's trip checklist repeats them.

`audio/` is in `.gitignore` on purpose, so family voices never end up in this public repo (and aren't on the GitHub Pages site either). On GitHub Pages, use option 1.

### Recording in the app

Parent area › **Record your voice**. Pick *Words*, *Letters*, *Stories* or *Phrases*, and *हिन्दी* or *English*, then tap **● Record**, say it, and tap **■ Stop**. ▶ plays it back and ✕ deletes it. The lists follow the chosen grade. A grandparent reading the story pages aloud is a lovely use of this.

### Loading recordings from files

Name each file after what it says, then use Parent area › Recordings from files › **Load files** (you can pick many at once):

| What | File name | Example |
| --- | --- | --- |
| Words | `<word id>_<hi\|en>` | `bus_hi.m4a`, `cow_en.mp3` |
| Animal sounds | `<word id>-sound_<hi\|en>` | `cow-sound_hi.m4a` |
| Letters | the letter id | `hc-ka.m4a` (क), `hv-aa.m4a` (आ), `en-b.m4a` (B) |
| Numbers | `num-<1-10>_<hi\|en>` | `num-3_hi.m4a` |
| Sentences | `sentence-<id>_<hi\|en>` | `sentence-bus-here_hi.m4a` |
| Phrases without `{w}` | `phrase-<key>_<hi\|en>` | `phrase-great_hi.m4a` |
| Story pages | `story-<story id>-<page>_<hi\|en>` | `story-lion-mouse-1_hi.m4a` |
| Story morals | `story-<story id>-moral_<hi\|en>` | `story-lion-mouse-moral_hi.m4a` |

Files with names the app doesn't recognise are listed so you can rename them. When a word has a recording but the phrase around it doesn't ("Find {w}"), the phrase uses text-to-speech and your recording is slotted in for the word.

**Android tip:** if Hindi is silent or has an English accent, install the Hindi voice: *Settings › System › Languages & input › Text-to-speech output › Google Speech Services › Install voice data › Hindi (India)*.

## Editing `content.json` (no coding needed)

Worlds, units, lessons, words, letters, stories, quizzes and phrases all live in [`content.json`](content.json). Edit it in any text editor or on GitHub with the pencil icon, then check it:

- run `npm test` (Node 20+, nothing to install), **or**
- open the app: if something is wrong it lists the problems instead of starting.

After deploying a change, open the app twice on the phone: the first open fetches the update, the second shows it.

### Words

```json
"tram": { "hi": "ट्राम", "translit": "traam", "en": "tram", "picture": "tram", "level": "grade2" }
```

| Field | Required | Meaning |
| --- | --- | --- |
| `hi`, `en` | yes | The word in Devanagari and in English |
| `translit` | yes | How to say it in Latin letters (for parents) |
| `picture` | yes | A built-in drawing id. `many:<id>` draws three (for plurals like केले). A missing drawing shows a letter badge and a warning in the parent area |
| `level` | no | The grade where this is a reading word (`kg` … `grade4`). Word lists can say `"@grade1"` for "every Grade 1 word" |
| `syllables` | no | The aksharas, for word building: `["कि", "ता", "ब"]` (must join up to `hi`) |
| `sound` | farm animals | `{ "hi": "मूँ", "en": "moo" }` |
| `color` | colour words | e.g. `"#e53935"` |
| `audio` | no | File names in `audio/` for `hi` and/or `en` |

Built-in drawings are in `js/art.js`, `js/art-words.js`, `js/art-creatures.js` and `js/art-people.js`; `KNOWN_PICTURES` in `js/art.js` lists them all.

### Worlds, units and lessons

```json
{
  "id": "jungle", "level": "grade1", "subject": "hindi", "theme": "jungle", "mascot": "chiku",
  "color": "#2EC27E", "collection": "jungle", "letterSets": ["hindiVowels", "hindiConsonants"],
  "name": { "hi": "मस्त जंगल", "en": "Jolly Jungle" },
  "units": [
    {
      "id": "g1-m1", "title": { "hi": "मात्राएँ: ा ि ी", "en": "Let's learn matras ा ि ी" }, "skill": "Phonics", "icon": "letter:ा",
      "lessons": [{ "id": "g1-m1-1", "game": "matra", "icon": "place-matra", "title": { "hi": "बारहखड़ी", "en": "Barakhadi" }, "config": { "focus": ["aa", "i", "ii"] } }]
    }
  ]
}
```

- `subject` is `hindi`, `english` or `math`. English and math worlds need `"lang": "en"`.
- `tags` lists what the world teaches, from the `"tags"` table (`{ "grammar": { "hi": "व्याकरण", "en": "Grammar", "color": "#E11D48" } }`). They show on the world's card and power the filter on the home screen.
- `theme` picks the animated scene and music: `farm, town, jungle, dino, space, ocean, igloo, carnival, garden, castle, desert, forest, palace, village, mountain, city`, and for Grades 7 and 8 `kasba, colony, noir, library, lab, darbar, gadget, peepal, chaupal` (`js/art-scenes.js`; each has a music style in `js/sfx.js`).
- `mascot`: `kuku, gappu, chiku, dumdum, zoomi, ollu, pip, tiko, buzz, kiki, ooty, bholu, mitthu, gauri, himu, chintu` (`js/mascot.js`).
- `collection` is an id from `"collections"`: `{ "name": {…}, "items": [word ids], "start": 2 }` (`start` = how many are owned from the beginning).
- `icon` is a picture id, `letter:क` for a big letter or number, `num`, or an **activity icon** that puts a world's creature into the activity: `book:` (story), `talk:` (sentences), `pair:` (word pairs), `card:` (reading words), `blocks:` (building words), `matra:`, `rhyme:` or `find:` followed by a picture id, e.g. `book:turtle`. Each Hindi grade uses its own creatures, so no two grades share an icon.
- Lesson ids must be unique. A lesson's `config` overrides that game's defaults in `"games"`.
- `helpers` (optional) names who helps inside the games in this world, as word ids: `courier` delivers the word in reading lessons, `vendor` serves the rhymes, `lifter` lifts the letters in word building, `rescuer` answers the call in rescue, `holder` holds up the matra sign, `engine` pulls the sentence carriages, and `digger` digs up letters. For example the jungle has `{ "courier": "parrot", "lifter": "elephant", "engine": "snake" }`. Anything left out uses the Vehicle Town helper (post van, ice-cream van, crane …). The houses, cups, carriages and parking spaces around them take the world's look from its `theme`.

### Games and their settings

| Game | What it is | Main settings |
| --- | --- | --- |
| `farm` | Who said that? Animal sounds | `rounds`, `animals` |
| `rescue` | A siren asks for a picture, letter or word; tap the window | `rounds`, `words`, `cards` |
| `busdepot` | Pick up passengers; count them on and off | `parts` (`pickup`, `count`), `pickupRounds`, `countRounds`, `maxPassengers`, `passengers` |
| `construction` | Dig up letters, deliver the matching block, build words with the crane | `activities` (`dig`, `deliver`, `build`), `digLetters`, `deliverRounds`, `buildRounds`, `buildWords`, `digWords` |
| `railway` | Alphabet train: the next letter in order | `carriages`, `letters` |
| `recycling` | Sort by colour or shape | `rounds`, `bins`, `modes`, `colors`, `shapes` |
| `opposites` | Big/small, up/down, fast/slow | `rounds`, `pairs` |
| `trace` | Finger-trace a letter | `count`, `threshold` (0–1) |
| `firstsound` | Hear a letter, find the picture that starts with it | `rounds`, `letters`, `words` |
| `matra` | Barakhadi and the missing matra | `rounds`, `consonants`, `matras`, `words`, `focus` |
| `read` | Post office: picture → written word, written word → picture | `rounds`, `words`, `modes` (`find`, `match`), `focus` |
| `rhyme` | Pick the word that rhymes | `rounds`, `groups` |
| `pairs` | Opposites, singular/plural, male/female | `rounds`, `kinds`, `sets` |
| `sentence` | Put the words of a sentence in order | `rounds`, `levels` |
| `quiz` | A question with answer bubbles (grammar, meanings, idioms…) | `bank` (a `quizzes` id), `rounds` |
| `sort` | Put each word in the right box (noun or verb, र forms…) | `sort` (a `sorts` id), `rounds` |
| `story` | Read-along story with questions | `levels`, or `story` for one story |
| `math` | Math problems with pictures and models | `skills` (ids from `js/mathgen.js`), `rounds` |
| `phonics` | English phonics: pictures to hear, words with a gap, letters to blend | `skills` (ids from `js/phonicsgen.js`), `rounds` |
| `sequence` | Story order: tap a story's pictures in the order things happened | `levels` or `story`, `rounds` |
| `comic` | A Hindi comic with word meanings and questions (Grades 7 and 8) | `comic` (a `comics` id) |
| `grammar` | Rule cards, then practice with a "क्यों?" after each answer (Grades 7 and 8) | `topic` (a `grammar` id), or `topics` for a mixed review; `rounds` (default 8) |

Every game also takes `choices`: how many options to show at each of the three levels, e.g. `[2, 3, 4]` (the default). `letters` can name a range: `{ "sets": ["hindiConsonants"], "from": 0, "to": 10 }`.

### Quizzes and sorts

```json
"quizzes": {
  "g3-synonyms": {
    "title": { "hi": "पर्यायवाची शब्द", "en": "Same-meaning words" },
    "questions": [{ "hi": "'सूरज' का दूसरा नाम क्या है?", "en": "Another word for 'सूरज'?", "options": ["सूर्य", "चाँद", "तारा"], "answer": "सूर्य", "word": "sun" }]
  }
}
```

A question can also have `"show": "मैं ___ जाता हूँ।"` (a sentence with a gap), `"word"` (a picture to show) or `"pictures": true` (the options are word ids shown as pictures).

```json
"sorts": {
  "g3-nouns": {
    "prompt": { "hi": "यह नाम है या काम?", "en": "Is it a naming word or an action word?" },
    "bins": [{ "id": "name", "hi": "नाम (संज्ञा)", "en": "Naming word" }, { "id": "action", "hi": "काम (क्रिया)", "en": "Action word" }],
    "items": [{ "text": "पेड़", "bin": "name", "word": "tree" }]
  }
}
```

### Stories

```json
{
  "id": "lion-mouse", "level": "grade2", "cover": "lion",
  "title": { "hi": "शेर और चूहा", "en": "The lion and the mouse" },
  "pages": [{ "word": "lion", "hi": "जंगल में एक शेर सो रहा था।", "en": "A lion was sleeping in the jungle." }],
  "questions": [
    { "hi": "जाल किसने काटा?", "en": "Who cut the net?", "answer": "mouse", "options": ["mouse", "lion", "monkey"] },
    { "hi": "शेर ने चूहे को क्यों छोड़ा?", "en": "Why did the lion let the mouse go?", "text": true, "answer": "उसे हँसी आई", "options": ["उसे हँसी आई", "वह डर गया"] }
  ],
  "moral": { "hi": "छोटे दोस्त भी बड़ी मदद कर सकते हैं।", "en": "Small friends can be a big help." }
}
```

Each page shows its `word`'s picture. Picture questions use word ids as options; `"text": true` questions use short Hindi answers. `moral` is optional.

A page can also carry an `act`, which makes its picture a small moving scene (used for every Toddler and Kindergarten page):

```json
{ "word": "goat", "hi": "“तुम हटो!” “नहीं, तुम हटो!”", "en": "“You move!” “No, you move!”", "act": { "move": "bump", "with": "goat", "sky": "field" } }
```

- `move`: how the picture moves: `enter`, `enter-right`, `walk`, `run`, `scurry`, `drive`, `roll`, `fly-up`, `fly-across`, `jump`, `dance`, `fall`, `grow`, `peek`, `shake`, `sleep`, `float`, `sway`, `swim`, `spin`, `talk`, `lift`, `shrink`, and with a partner `approach`, `bump`, `orbit` or `climb`.
- `with`: a second picture (a word id) that shares the page.
- `fx`: what happens around it, one or a list of two: `rain`, `splash`, `sparkles`, `stars`, `hearts`, `wind`, `music`, `zzz`, `lamps`, `leaves`, `bubbles`, `confetti`, `glow`, `dust`, `steam`.
- `sky`: the backdrop: `day`, `night`, `dawn`, `rain`, `sky`, `field`, `river`, `sea`, `underwater`, `home`.
- `sound`: a sound effect instead of the move's own (`toot`, `sneeze`, `chime` …).

The lists live in [`js/scene.js`](js/scene.js); the validator rejects anything not on them.

### Letters, phrases and the rest

- `"letterSets"`: `hindiVowels`, `hindiConsonants`, `english`. Each letter is `{ "id": "hc-ka", "char": "क", "translit": "ka", "word": "car" }`; `id` is also its recording name.
- `"matras"`: the vowel signs in teaching order: `{ "id": "aa", "sign": "ा", "vowel": "आ", "translit": "aa" }`.
- `"sentences"`: `{ "id", "level", "hi", "en", "about" }`. Words are split on spaces, so keep punctuation on the word before it (`है।`).
- `"phrases"`: the spoken instructions. `{w}` marks where a word goes: `"find": { "hi": "{w} ढूँढो", "en": "Find {w}" }`.
- `"mascotLines"`: what the guides say when tapped, with a `move` (`silly`, `sneeze`, `spin`, `dance`, `wave`).
- `"levels"`: the grades, with `name`, `age` and an `about` line for parents.

### Stories, poems and story lessons

A story with `"kind": "poem"` is shown as a poem (or a rhyme) in the library. `"lang": "en"` makes an English-only story (pages and questions need only `en`); English worlds show only English stories, Hindi worlds only Hindi ones. A lesson can name one story with `{ "game": "story", "config": { "story": "lion-mouse" } }`; without `story` it opens the next story on the grade's shelf.

### Writing a comic

Comics live in `"comics"`. Each has 10–20 panels and an `id`, a `series` (`"mishti"`, `"rimjhim"`, `"birbal"` or `"chippu"` for Grade 7; `"dadi"`, `"betal"` or `"murari"` for Grade 8), a `level`, a `title`, a `blurb`, optional `parts` (one-off characters: `{"seth": {"look": "man-b", "name": "सेठ धनपतराय"}}`, with optional colour overrides), `panels`, an optional `guess`, `words` and `questions`. A panel is:

```json
{
  "bg": "classroom",
  "cast": [{ "who": "teacher", "at": 30, "face": "angry", "arms": "hips" }, { "who": "mishti", "at": 72, "face": "worried" }],
  "cap": "अगली सुबह...",
  "say": [{ "who": "teacher", "text": "मिष्टी, तुम्हारी परियोजना कहाँ है?" }, { "who": "mishti", "text": "मैडम... वो...", "kind": "whisper" }],
  "sfx": "धड़ाम!",
  "prop": { "word": "tortoise", "at": 84 },
  "wide": true,
  "dark": true
}
```

- **Backgrounds** (`bg`): room, kitchen, classroom, street, bazaar, park, garden, terrace, fair, night, train, station, museum, wedding, police, haveli, ground, dairy, bank, village, school, darbar (a royal court), bagh (a Mughal garden), peepal (the tree at night), jungle, river, desert, workshop, chaupal (a village square), fort, library, hills, clinic, colony (a housing-colony courtyard), schoolbus, stage, or any world scene.
- **Characters** (`who`): mishti, bijli, buntu, colonel, mummy, papa, dadaji, laddoolal, teacher, rocky, guddu; akbar, birbal, chugal; kavya, chippu, nani, montu, chameli; dadi, roohi, pappu, mausi, inspector, chhedilal; vikram, betal; murari, golu, thagraj; rimjhim, zoya, bablu, rmummy, rpapa, amma, sunny, biscuit; and the looks man-a, man-b, man-c, man-d, man-old, guard, chef, woman-a, woman-b, boy-a, boy-b, girl-a, girl-b, sadhu, courtier, king, queen, princess, pandit, soldier, farmer, doctor (give these a name under `parts`, with any changes such as `"hat": "crown"`). `at` is 0–100 across the panel; `flip` turns a character to face left; `hold` puts a prop in their hand (umbrella, magnifier, phone, book, stick, kite, bat, plate, lantern, rose, camera, bag, notebook, glass, laddoo, sword, scroll, diya, lemon, flask, pot, mango, coins, candle, trophy, mirror, apple).
- **Faces**: smile, grin, laugh, shock, angry, sad, think, sly, worried, sleep, wink, chew. **Arms**: down, point, up, hips, chin, wave.
- **Bubbles**: `kind` is `shout`, `whisper` or `think`; plain speech without it. Put the first speaker on the left.
- **`guess`** (mysteries, riddles, “what's the science?”): `{"at": 8, "q": "...", "options": [...], "answer": "...", "hint": "..."}`; panels from `at` on stay hidden until the reader answers.
- **`words`**: `{"hi": "टेढ़ी खीर", "mean": "मुहावरा: बहुत कठिन काम", "en": "a very hard task"}`. The first place each `hi` appears in the comic is underlined. Idioms start their meaning with `मुहावरा:` (or `कहावत:`), and the world's idiom quiz is built from them.

A lesson opens a comic with `{"game": "comic", "config": {"comic": "m-homework"}}`. The content checks name any character, face, background or answer that is wrong.

### Writing a grammar topic

Grammar topics live in `"grammar"`, keyed by id: `{"level": "grade7", "title": {"hi": "संज्ञा और उसके भेद", "en": "Nouns and their kinds"}, "learn": [...], "practice": [...]}`. Put **[square brackets]** around the part to highlight; brackets are never read aloud.

- A **learn card** has a `title` and any of `text`, `en`, `examples` (a list) and `table` (`{"head": ["भेद", "उदाहरण"], "rows": [["व्यक्तिवाचक", "गंगा, हिमालय"], …]}`; the first cell of each row is its heading).
- A **question** has a `kind`, a question `q` and a `why` (the "क्यों?" explanation, with the key idea in brackets):
  - `"mcq"`: `options` (2–4) and the `answer`, which must be one of them; an optional sentence `s` is shown above the options.
  - `"tap"`: a sentence `s` and the `answer`, one word of it (punctuation doesn't count). The word should appear only once.
  - `"sort"`: `bins` (2–4 group names) and `items`: `[{"text": "ताजमहल", "bin": "व्यक्तिवाचक"}, …]`.

A lesson is `{"game": "grammar", "config": {"topic": "g7-sangya"}}`; a review is `{"config": {"topics": ["g7-karak", "g7-avyay"], "rounds": 10}}`. The content checks name a tap answer that isn't in its sentence, an answer that isn't an option, an item in a group that doesn't exist, a table row with the wrong number of cells, and unbalanced brackets.

### Writing an episode

An episode in `"shows"` has an `id`, `level`, `world` (for its colour and guide), `lang` (`"hi"`, or `"en"` for English-only), a `title`, `teaches` (one line for grown-ups), an optional `lesson` to practise afterwards, a `recap` (`{"words": [...], "mark": "ा"}` or `{"lines": ["6 + 4 = 10"]}`) and `scenes`. Each scene has a background `bg` (any world theme, like `"jungle"` or `"space"`), optional `actors` already standing there (`{"chiku": 24, "kuku": 72}`, positions from 0 to 100) and a list of `beats`, played in order:

| Beat | What happens |
| --- | --- |
| `{"narrate": true, "hi": "…", "en": "…"}` | a narrator's box at the top |
| `{"say": "chiku", "hi": "…", "en": "…", "do": "happy"}` | a speech bubble from a guide (`do` is optional: happy, cheer, oops, silly, wave, dance, spin, sneeze) |
| `{"enter": "kuku", "at": 72, "from": "right"}`, `{"move": "kuku", "to": 40}`, `{"exit": "kuku", "to": "left"}` | a guide walks on, across or off |
| `{"do": "dance", "who": "kuku"}` | a guide does something |
| `{"show": "cow", "at": 70, "from": "left"}` | a picture appears (or slides in) |
| `{"word": "boat", "mark": "ा"}` | a big word card; syllables with the mark light up, and the word is said |
| `{"letter": "क", "word": "dove"}` | a big letter with a picture, and the letter is said |
| `{"build": ["न", "ा"], "hi": "…", "en": "…"}` | two pieces join into one syllable (ना) while the line is said |
| `{"glyph": "ा"}`, `{"number": 10}`, `{"tenframe": [{"a": 6, "b": 4}]}` | a sign, a number or a ten frame |
| `{"ask": {"hi": "…", "en": "…"}, "who": "chiku", "options": ["umbrella", "cup"], "answer": "umbrella", "then": {…}}` | a question with picture answers (`"kind": "number"` for number answers) |
| `{"echo": {"hi": "क से कबूतर", "en": "Ka for kabootar"}}` | "say it with me!", a pause for the child, then the line again |
| `{"clear": true}`, `{"sfx": "toot"}`, `{"wait": 800}` | clear the pictures, play a sound, pause |

Every spoken line can be recorded in a family voice (Record your voice › Shows), or loaded from files named `show-<id>-<line>_hi.m4a`. The content checks name any beat that is wrong.

### Phonics skills

Phonics lessons list skills from [`js/phonicsgen.js`](js/phonicsgen.js), for example `{ "game": "phonics", "config": { "skills": ["k-rhyme", "k-read-cvc"] } }`. Each skill carries its NC Reading: Foundational Skills code. Sounds are always said with a key word ("c, as in cat"), because text-to-speech can't say bare letter sounds well; you can record the real sounds in the parent area (Letters tab).

### Math skills

Math lessons list skills from [`js/mathgen.js`](js/mathgen.js), for example `{ "game": "math", "config": { "skills": ["k-make10", "k-teens"] } }`. Each skill carries its NC standard code and makes problems at three levels. Kindergarten skills start with `k-`, Grade 1 skills with `g1-`. [CURRICULUM.md](CURRICULUM.md) lists them all. To add a new kind of problem, add a skill to `SKILLS` in `mathgen.js` (and a drawing to `js/art-math.js` if it needs a new picture); the tests check every skill at every level.

## Run it locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080. (A service worker needs `http://localhost` or `https://`, so opening the file directly won't work.)

```bash
npm test
```

runs the unit tests (Node 20+, no dependencies).

## Deploy on GitHub Pages

1. Push to GitHub.
2. Open the repo's **Settings › Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch **`main`**, folder **`/ (root)`**, and **Save**.
4. A minute later the app is at `https://<your-username>.github.io/<repo-name>/`.

The repo and the site are public, so keep them to general learning content. Personal photos and voices belong on the device, never in the repo.

## Install on an Android phone or tablet

1. Open the GitHub Pages address in **Chrome**.
2. Tap ▶ and wait a few seconds so the app can save itself for offline use.
3. Tap **⋮ › Add to Home screen** (or **Install app**).
4. Open **Khel Khel Mein** from the home screen. It runs full screen and works offline.
5. Optional: turn on **App pinning** (*Settings › Security › App pinning*) so the child stays in the app.

## What else could be done

See [docs/LEARNING-REVIEW.md](docs/LEARNING-REVIEW.md) for a full review against learning research and standards (WCAG 2.2, COPPA, GDPR, the UK Children's Code, India's DPDP Act, WHO and AAP screen-time guidance), what has been done, and what to do next. The short list:

1. **Record family voices** for the words and stories the child uses most.
2. **A teacher's read** of the Hindi quizzes, poems and stories, and of the English math and phonics wording.
3. **Openly licensed readers** from StoryWeaver (Pratham Books, CC BY 4.0), with attribution: check each book's licence page first.
4. **Stroke-order handwriting** for Devanagari, and **math beyond Grade 1**.
5. **A Play Store app** via a Trusted Web Activity, once tested on real phones.
6. **More Show time episodes**, one per unit, with recorded narration for the favourites.

## Project layout

```
index.html            page shell
styles.css            all styles
content.json          everything the child sees and hears
manifest.webmanifest  PWA install info
sw.js                 offline cache (add new js files to SHELL)
icons/                app icons
fonts/                Baloo 2 and Fredoka (SIL Open Font License)
CURRICULUM.md         what each grade teaches, sources and research
js/app.js             app start, router, lesson frame
js/screens.js         splash, hub, world maps, results, collections, library
js/shows.js           Show time episode player and Story radio
js/art-comic.js       comic characters (faces, poses, props) and panel backgrounds
js/games/comic.js     the comic reader (Grades 7 and 8)
js/games/grammar.js   grammar rule cards and practice (Grades 7 and 8)
js/parent.js          parent area and voice recorder
js/curriculum.js      unlocking, stars, levels, streaks (pure, tested)
js/logic.js           game logic (pure, tested)
js/mathgen.js         math problems for every NC skill (pure, tested)
js/validate.js        content.json checks (tested)
js/art*.js            drawings: vehicles, words, creatures, people, scenes, math models
js/mascot.js          the guide characters
js/audio.js           recordings → audio/ files → text-to-speech
js/sfx.js             synthesised sound effects and music
js/storage.js         localStorage + IndexedDB (device only)
js/games/*.js         one file per game
tests/                node:test unit tests
```
