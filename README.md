# Khel Khel Mein · खेल-खेल में

*"Learning through play."* An offline web app (PWA) where children learn **Hindi** from Toddler to Grade 4, and **English phonics** and **math in English** in Kindergarten and Grade 1. There are 16 animated worlds, at least three in every grade from Kindergarten to Grade 4, each with its own guide character, a path of short lessons, stars to earn and a collection to fill. Every world is tagged with what it teaches (Phonics, Grammar, Stories, Math …).

- **Hindi** follows India's NIPUN Bharat targets and the themes of the NCERT books (*Sarangi*, *Veena*). From Grade 2 each grade has a phonics-and-reading world, a grammar-and-writing world and a stories-and-poems world.
- **English phonics** follows the **North Carolina Standard Course of Study, Reading: Foundational Skills** for Kindergarten and Grade 1.
- **Math** follows the **North Carolina Standard Course of Study** for Kindergarten and Grade 1, in English only.
- **Every lesson adapts** while the child plays: it gets harder after a run of right answers and easier after misses.

Everything is spoken aloud, so a child doesn't need to read to play. Tap targets are big, there are no timers, and nothing can go wrong: a wrong tap is a gentle wobble and a hint. Lessons take 2–5 minutes.

It's plain HTML, CSS and JavaScript with no build step, so it runs on GitHub Pages and works offline once opened.

### Does it work without internet?

**Yes, after the first visit.** The first time the app is opened online, it saves all its files on the device (the pages, every picture, the fonts and the lessons: about 55 files). After that it opens and plays with no internet at all: every lesson, story, game, recording and setting works offline, and progress is saved on the device. Updates download in the background the next time it is online.

The one thing that can depend on the device is the **computer voice**. On Android the Google text-to-speech voices work offline once their voice data is installed (*Settings › System › Languages › Text-to-speech › Google › Install voice data › Hindi*). Some desktop browsers use online voices, so offline they fall back to a plainer voice or stay silent. **Family recordings made in the app always work offline**, which is another good reason to record them.

On an iPhone or iPad, **add the app to the Home Screen** (Share › Add to Home Screen): Safari can clear the data of websites that haven't been opened for a while, but not of home-screen apps. Installed copies also ask the browser to keep progress and recordings safe from storage clean-ups.

Thinking of rebuilding it in an app builder? [docs/PLATFORM-EVALUATION.md](docs/PLATFORM-EVALUATION.md) compares FlutterFlow, Thunkable and Appy Pie with the current web app, with offline as the deciding requirement, and explains how to put the app in Google Play and the App Store without a rewrite.

[CURRICULUM.md](CURRICULUM.md) explains what each grade teaches, the sources, and the learning research behind the design.

## The worlds

| Grade | World | Guide | Subject | Tags | What it teaches |
| --- | --- | --- | --- | --- | --- |
| Toddler (2–3) | **Animal Farm** · पशु फ़ार्म | Kuku the chick | Hindi | Listening, Vocabulary, Counting | Animals and their sounds, colours, shapes, big and small, counting to 5, vehicles |
| Kindergarten (3–6) | **Vehicle Town** · गाड़ी नगर | Gappu the elephant | Hindi | Letters, Phonics, Reading | Hearing sounds, स्वर and व्यंजन, tracing, the alphabet train, two- and three-letter words, counting to 10 |
| Kindergarten | **Buzz's Letter Garden** | Buzz the bee | English | English, Phonics, Letters | Letters big and small, first and last sounds, rhyming, clapping syllables, reading CVC words, short vowels, sight words |
| Kindergarten | **Pip's Number Igloo** | Pip the penguin | Math (English) | Math, Counting, Shapes | Counting, numbers to 100, comparing, adding and taking away, making 10, teen numbers, shapes, positions, measuring |
| Grade 1 (6–7) | **Jolly Jungle** · मस्त जंगल | Chiku the monkey | Hindi | Phonics, Reading, Vocabulary, Stories | Every matra, the barakhadi, words with matras, family, food and festival words, rhymes, little sentences, first stories |
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

Each world is a winding path of **units** named for what the child is learning ("Let's learn matras ा ि ी", "Let's learn magic e", "Let's make 10"). Each unit has a few **lessons**, joined by a trail that is gold where the child has been and dotted ahead, with a **Start** tag on the next lesson. Lessons open one after another, each earns 1–3 stars (for answers right on the first try), and each first finish (and every 3-star replay) adds something to the world's **collection**.

The **home screen** shows the child's grade first, then every other world, so moving between grades is one tap. A row of **tags** at the top filters the worlds: tap *Grammar* to see every grammar world, *Stories* for every story world, and so on. Each card shows its tags too. A parent can lock the app to one grade instead.

**Getting out is always one tap.** The back button in a lesson returns to the world map, and the map's back button returns home. Android's back button and gesture do the same.

### The story library

The libraries hold **77 read-along stories and rhymes**: Panchatantra and Jataka tales (*The lion and the mouse*, *The monkey and the crocodile*, *The four friends*, *The jackal and the drum*, *The monkey and the wedge*, *The hare in the moon*), Akbar–Birbal stories (*The emperor's parrot*, *Who owns the water?*, *The shorter line*, *The cucumber in the bottle*, *Birbal counts the crows*, *Birbal's khichdi*), Tenali Raman, fables, poems, new stories starring the app's characters, **बाल गीत** for Kindergarten (मछली जल की रानी है, चंदा मामा दूर के, आलू कचालू, हाथी राजा and new ones), and classic **English nursery rhymes** in the English phonics worlds (*Twinkle, Twinkle*, *Humpty Dumpty*, *Baa, Baa, Black Sheep*, *Hickory, Dickory, Dock*, *Jack and Jill*, *Rain, Rain*, *Row Your Boat*, *Hey Diddle Diddle*), each with a rhyming-word question. Only traditional or public-domain rhymes and our own are used; film songs are left out because they are still in copyright. Every word can be tapped to hear it, pages are read aloud in Hindi (and English in "both" mode), and each story ends with questions: pictures for the younger grades, short written answers for older ones. Folktales finish with their **सीख** (moral). The library shows the child's grade and the one before it. Every story world also has a **story order** lesson: pictures from a story, shuffled, to tap in the order things happened.

### The characters

Each world has a guide who waves, talks when the app speaks, reacts to answers, and does something silly when tapped (sneezes, spins, dances). They turn up in each other's worlds too: Pip and Tiko star in Grade 1 story problems, Chiku chases a banana and Zoomi flies to the Moon in the story library.

### Placement check

Not sure which grade to start with? The first screen (and the parent area) has a **two-minute check**: two quick questions per level, from Kindergarten letters (क, अ) through reading words with matras and half letters to Grade 4 grammar. It stops at the first level the child doesn't know yet and suggests that grade.

### Read-along and "tell it back"

Story pages light up **word by word** as they are read (exactly, where the voice reports word timings; otherwise estimated from word length, which also works for family recordings). With **Tell it back** turned on in the parent area, each story ends with "Now you tell the story!": the child records their own retelling, with the pictures as prompts, and grown-ups can listen to it later. Recordings never leave the device.

### Today's path

The top of the home screen shows **three steps for today**: *Keep going* (the next new lesson, in the grade's world with the least done, so subjects stay balanced), *Review* (a finished lesson that is due again) and *Story time* (a story not read yet). Each turns green once done today.

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
- **Sound**: background music and sound effects, each on or off.
- **Voices**: pick the Hindi and English text-to-speech voice (the best installed voice is chosen by default), set the speed, and test them.
- **Record your voice**: record any word, letter, story page, moral or phrase right in the app. Your recording replaces the computer voice. See below.
- **Recordings from files**: load recordings made elsewhere.
- **Special vehicle photo**: a photo from the device becomes a vehicle in Vehicle Town's garage. It is shrunk and saved only in this browser.
- **Parent area language**: English or हिन्दी, switched at the top.
- **Progress**: this week's minutes per day, lessons played and reviews due; **Getting better** (each lesson's first score against its latest, as a before-and-after measure); the child's **story retellings**; stars per world, a "practise together" list (words, letters, matras and math skills the child often misses) and a "doing great" list, and a reset button.

Everything stays on the device. Nothing is uploaded.

## Voices and recordings

For everything the app says, it uses, in order:

1. **A recording on this device** (made in the app or loaded from files). Kept in the browser's IndexedDB, never uploaded.
2. **A file in `audio/`** named in `content.json` (`"audio": { "hi": "bus_hi.mp3" }`).
3. **The browser's text-to-speech**, using the best Hindi (`hi-IN`) and English voices installed.

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
- `theme` picks the animated scene and music: `farm, town, jungle, dino, space, ocean, igloo, carnival, garden, castle, desert, forest, palace, village, mountain, city` (`js/art-scenes.js`).
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

### Letters, phrases and the rest

- `"letterSets"`: `hindiVowels`, `hindiConsonants`, `english`. Each letter is `{ "id": "hc-ka", "char": "क", "translit": "ka", "word": "car" }`; `id` is also its recording name.
- `"matras"`: the vowel signs in teaching order: `{ "id": "aa", "sign": "ा", "vowel": "आ", "translit": "aa" }`.
- `"sentences"`: `{ "id", "level", "hi", "en", "about" }`. Words are split on spaces, so keep punctuation on the word before it (`है।`).
- `"phrases"`: the spoken instructions. `{w}` marks where a word goes: `"find": { "hi": "{w} ढूँढो", "en": "Find {w}" }`.
- `"mascotLines"`: what the guides say when tapped, with a `move` (`silly`, `sneeze`, `spin`, `dance`, `wave`).
- `"levels"`: the grades, with `name`, `age` and an `about` line for parents.

### Stories, poems and story lessons

A story with `"kind": "poem"` is shown as a poem (or a rhyme) in the library. `"lang": "en"` makes an English-only story (pages and questions need only `en`); English worlds show only English stories, Hindi worlds only Hindi ones. A lesson can name one story with `{ "game": "story", "config": { "story": "lion-mouse" } }`; without `story` it opens the next story on the grade's shelf.

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
