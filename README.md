# Vehicle Town 🚌

A small, offline web app (PWA) where a child learns **Hindi (Devanagari)** and **English** by exploring a town full of vehicles. It grows with the child in five phases: **Toddler, Kindergarten (Balvatika), Grade 1, Grade 2 and Grade 3**, following India's NIPUN Bharat targets and the NCF foundational stage. [CURRICULUM.md](CURRICULUM.md) explains what each phase teaches and why.

Everything is spoken out loud, so the child doesn't need to be able to read. Tap targets are big, there are no timers, and nothing can go wrong: a wrong tap just says what was tapped and lets the child try again. Each game takes about 2–5 minutes.

It's plain HTML, CSS and JavaScript with no build step, so it can be hosted on GitHub Pages.

## Phases

On first launch a grown-up picks who is learning. Each phase has its own places on the map, letters, words and difficulty:

| Phase | Age | Focus |
| --- | --- | --- |
| Toddler | 2–3 | Listening and naming: vehicles, animals and their sounds, colours, shapes, opposites, counting to 5. No letters |
| Kindergarten | 3–6 | स्वर, व्यंजन and A–Z with their sounds, letter order, tracing, counting to 10, first words without matras (घर, नल, कमल) |
| Grade 1 | 6–7 | Matras and the barakhadi, two- and three-letter words with matras (आम, किला, फूल, मोर), short sentences, rhymes, first stories |
| Grade 2 | 7–8 | Half letters and conjuncts (पत्ता, चम्मच, स्कूल), longer sentences, stories with questions, opposites and plurals |
| Grade 3 | 8–9 | Longer stories and questions, विलोम, वचन, लिंग (male and female: शेर / शेरनी) |

Games adapt to the child as well: each answer is recorded (right on the first tap or not), and words, letters and matras the child finds hard come up more often.

## Places in the town

| Place | Vehicles | Game |
| --- | --- | --- |
| Construction site | digger, dump truck, crane, cement mixer, bulldozer | Dig up letters · deliver the block that matches the sound · the crane stacks tiles to build words (बस / BUS, कार / CAR …) |
| Bus depot | bus | Pick up the animal or letter that is called · count passengers getting on and off (1–10, both languages) |
| Fire station, police station, hospital | fire engine, police car, ambulance | Rescue: the siren asks for a letter or word; tap the window that has it |
| Farm | tractor | Animal names and sounds in both languages ("Where is the cow?", "Who says moo?") |
| Railway station | train | Alphabet train: each carriage gets the next letter. Hindi vowels, Hindi consonants and English A–Z are separate trains, and each visit picks up where the last one stopped |
| Recycling yard | garbage truck | Sort things into bins by colour, then by shape |
| Airport & harbour | plane, helicopter, boat, ship | Opposites: big/small, up/down, fast/slow |
| Drive the road | any unlocked vehicle | Finger-trace a big letter; your vehicle drives along it |
| Matra garage | car | Explore one consonant's barakhadi (क का कि की …), find the syllable that is said, and put the missing matra back into a word (म◌र → मोर) |
| Post office | mail van | Reading: deliver the parcel (a picture) to the house with its word written on it, or read a letter and find its picture. Wrong choices look alike, so the child has to read the whole word |
| Metro station | metro | Hear a sentence, then put its word cards into the carriages in order |
| Ice-cream van | ice-cream van | Rhymes: pick the scoop that rhymes (नल / जल, car / star) |
| Library | library bus | Read-along picture stories (every word can be tapped to hear it), then picture questions about the story |
| Parking | cars | Park each word next to its partner: opposites, singular/plural (केला / केले), male/female (मोर / मोरनी) |

Which places appear depends on the phase.

**Rewards:** every finished game unlocks a new vehicle in **My Garage**. Tapping a vehicle there says its name and a short sentence about it.

**My special vehicle:** a parent can pick a photo on the device to use as a custom vehicle (it shows in the garage and in Drive the road). The photo is shrunk and saved only in this browser's local storage. It is never uploaded and never goes into this repo.

## Parent settings

**Press and hold the settings button (top right of the map) for 3 seconds.** A ring fills up while you hold it. In settings you can change:

- **Learning stage:** Toddler, Kindergarten, Grade 1, 2 or 3.
- **Language:** Hindi, English, or both. In "both", words are said in Hindi and then English, and word-building, counting, sentence and rhyme rounds alternate between the two.
- **Places:** hide any of this stage's places.
- **Letter sets:** this stage's letter sets (Hindi vowels, Hindi consonants, English A–Z). Only sets in the chosen language are used.
- **My special vehicle:** choose or remove a photo.
- **Family voices:** load voice recordings from the device (see below).
- **Progress:** games finished, a "practise together" list of words, letters and matras the child often gets wrong, a "doing great" list, and a reset button. All of this stays on the device.

## Audio

For everything the app says, it tries these in order:

1. **A recording loaded on this device** (Parent settings › Family voices). These are kept in the browser's IndexedDB and never uploaded.
2. **A file in the `audio/` folder** that is named in `content.json` (e.g. `"audio": { "hi": "bus_hi.mp3" }`).
3. **The browser's text-to-speech**, using `hi-IN` for Hindi and `en-US` for English.

`audio/` is in `.gitignore` on purpose, so family voices never end up in this public repo. That also means `audio/` files are **not** on the GitHub Pages site. Use option 2 only when you host the app yourself; on GitHub Pages, use option 1.

### Loading family recordings onto a phone

1. Record each word with any voice-recorder app and **name each file after what it says**:
   - Words: `<word id>_<hi|en>`, e.g. `bus_hi.m4a`, `bus_en.m4a`, `cow_hi.mp3`
   - Animal sounds: `<word id>-sound_<hi|en>`, e.g. `cow-sound_hi.m4a`
   - Letters: the letter id, e.g. `hc-ka.m4a` (क), `hv-aa.m4a` (आ), `en-b.m4a` (B)
   - Numbers: `num-<1-10>_<hi|en>`, e.g. `num-3_hi.m4a`
   - Sentences: `sentence-<id>_<hi|en>`, e.g. `sentence-bus-here_hi.m4a`
   - Phrases without a `{w}` slot: `phrase-<key>_<hi|en>`, e.g. `phrase-great_hi.m4a` ("शाबाश!")
   - Story pages: `story-<story id>-<page number>_<hi|en>`, e.g. `story-red-bus-1_hi.m4a`
2. Open Parent settings › Family voices › **Load recordings** and select the files. You can select many at once. Files with names the app doesn't recognise are listed so you can rename them.
3. The full list of valid names is in Parent settings, under "Recording file names".

When a word has a recording but the phrase around it doesn't (for example "Find {w}"), the phrase is spoken by text-to-speech and your recording is slotted in for the word.

**Tip for Android:** if Hindi comes out silent or in an English accent, install the Hindi voice: *Settings › System › Languages & input › Text-to-speech output › Google Speech Services (or Speech Recognition & Synthesis) › Install voice data › Hindi (India)*.

## Editing `content.json` (no coding needed)

All places, vehicles, words, letters, numbers and sentences live in [`content.json`](content.json). Edit it in any text editor, or on GitHub with the pencil icon. When you're done, check it:

- Run `npm test` (needs Node 20 or newer, no installs), **or**
- Just open the app: if something is wrong, it shows a list of the problems instead of the town.

After you deploy a change, open the app twice on the phone. The first open downloads the update in the background and the second open shows it.

### Words

Every word lives in `"words"` under an id made of lowercase letters, digits and dashes:

```json
"tram": {
  "hi": "ट्राम",
  "translit": "traam",
  "en": "tram",
  "picture": "tram",
  "audio": { "hi": "tram_hi.mp3", "en": "tram_en.mp3" }
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `hi` | yes | The word in Devanagari |
| `translit` | yes | How to say it in Latin letters (for parents) |
| `en` | yes | The English word |
| `picture` | yes | Id of a built-in drawing (list below). `many:<id>` draws three of it, for plurals (`"many:banana"` for केले). If there's no drawing with that id, a coloured badge with the first letter is shown instead, and Parent settings shows a warning |
| `level` | no | The phase where this is a reading word: `kg`, `grade1`, `grade2` or `grade3`. Word lists can use `"@grade1"` to mean "every Grade 1 word" |
| `audio` | no | File names inside `audio/` for `hi` and/or `en` |
| `syllables` | no | The word's aksharas, used by the crane and the matra garage, e.g. `["कि", "ता", "ब"]`. The pieces must join up to exactly `hi`. If left out, the browser splits the word itself |
| `sound` | farm animals | What the animal says: `{ "hi": "मूँ", "en": "moo" }` |
| `color` | colour words | e.g. `"#e53935"`, used by the recycling game |

Built-in pictures: `bus, car, policecar, ambulance, firetruck, digger, dumptruck, crane, mixer, bulldozer, tractor, train, carriage, garbagetruck, plane, helicopter, boat, ship, auto, scooter, bicycle, motorbike, truck, rocket, submarine, cow, dog, cat, horse, goat, sheep, elephant, lion, rabbit, monkey, parrot, fish, duck, rooster, color, size-big, size-small, dir-up, dir-down, speed-fast, speed-slow, place-construction, place-busdepot, place-fire, place-police, place-hospital, place-farm, place-railway, place-recycling, place-airport, place-trace, place-garage, house, tap, fruit, cup, water, lotus, pen, button, peas, crocodile, envelope, mango, lock, carrot, tea, garland, fort, butterfly, book, arrow, lamp, whistle, cucumber, bridge, rose, flower, bear, sun, shoe, mouse, swing, potato, banana, apple, tree, table, foot, ox, bag, peacock, drum, cap, bottle, crow, plant, fan, kite, grapes, moon, camel, snake, eye, umbrella, leaf, spoon, fly, school, balloon, glasses, bucket, lioness, hen, peahen, river, pot, stones, postvan, metro, icecreamvan, bookbus, place-matra, place-postoffice, place-metro, place-icecream, place-library, place-parking, shape-circle, shape-square, shape-triangle, shape-star, shape-heart`. To add a new drawing, add a function to `js/art-words.js` (or `js/art.js`).

### Add a new vehicle to the garage

1. Add the word (see above).
2. Add `{ "id": "tram" }` to `"vehicles"`. Vehicles unlock in list order, one per finished game. Add `"unlockedByDefault": true` to have it from the start.

### Add words to a game

The `"games"` section lists the word ids each game uses. For example, to add the horse to the bus passengers, add `"horse"` to `games.busdepot.passengers`.

| Game | Settings |
| --- | --- |
| `construction` | `digLetters`, `deliverRounds`, `buildRounds`, `buildWords` (words for the crane; give them `syllables`) |
| `busdepot` | `pickupRounds`, `countRounds`, `maxPassengers` (3–10), `passengers` (word ids) |
| `rescue` | `rounds`, `words` (word ids that can be in the windows) |
| `farm` | `rounds`, `animals` (word ids; each needs a `sound`) |
| `railway` | `carriages` (letters per train ride) |
| `recycling` | `rounds`, `bins`, `colors` (words with `color`), `shapes` (words with a `shape-*` picture) |
| `opposites` | `rounds`, `pairs`: `{ "a": "big", "b": "small", "kind": "size" \| "height" \| "speed", "vehicle": "plane" }`. For `size`, `a` is shown big; for `height`, `a` is shown up high; for `speed`, `a` is shown fast |
| `trace` | `letters` (letters per visit), `threshold` (0–1: how much of the letter has to be covered) |
| `matra` | `rounds`, `consonants` (for the barakhadi), `matras` (ids from `matras`), `words` (words with matras for the "missing matra" rounds) |
| `read` | `rounds`, `words`, `modes`: `find` (picture → written word) and/or `match` (written word → picture) |
| `sentence` | `rounds`, `levels` (which phases' sentences to use) |
| `rhyme` | `rounds`, `groups`: `{ "lang": "hi", "words": ["tap", "water", "fruit"] }`. Each language needs at least two groups |
| `story` | `levels` (which phases' stories to use) |
| `pairs` | `rounds`, `kinds` (`opposite`, `plural`, `female`), `sets`: lists of `[word, partner]` pairs per kind |

Word lists can use `"@kg"`, `"@grade1"` and so on to include every word of that phase. The construction site also takes `activities` (`dig`, `deliver`, `build`) and `digWords` (pictures to dig up when a phase has no letters).

### Phases

`"levels"` lists the phases in order. Each one has:

```json
{
  "id": "grade1",
  "picture": "bus",
  "name": { "hi": "कक्षा 1", "en": "Grade 1" },
  "age": "6–7",
  "about": "Shown to parents when picking a stage.",
  "places": ["matra", "postoffice", "construction"],
  "letterSets": ["hindiVowels", "hindiConsonants", "english"],
  "games": { "read": { "words": ["@grade1"], "modes": ["find", "match"] } }
}
```

`places` sets which places are on the map, in this order. `letterSets` can be empty (toddlers get no letters). `games` overrides any setting from `"games"` for this phase only.

### Matras, sentences and stories

- `"matras"` lists the vowel signs in teaching order: `{ "id": "aa", "sign": "ा", "vowel": "आ", "translit": "aa" }`.
- Each sentence has a `level`; the metro uses the sentences of its phase. Words are split on spaces, so keep punctuation attached to the word before it (`है।`).
- A story has an `id`, `level`, `title`, a `cover` word, `pages` (`{ "word": "bus", "hi": "…", "en": "…" }`, where the word's picture is shown) and `questions` (`{ "hi": "…", "en": "…", "answer": "banana", "options": ["banana", "mango", "carrot"] }`).

### Letters

`"letterSets"` holds three sets: `hindiVowels`, `hindiConsonants`, `english`. Each letter looks like:

```json
{ "id": "hc-ka", "char": "क", "translit": "ka", "word": "car" }
```

- `id` must be unique across all sets (case doesn't matter) and is also the recording file name.
- `word` is optional: an example word that is said after the letter ("क … कार").
- Optional `say` overrides what text-to-speech reads for the letter.
- Optional `audio` works like it does for words.
- Letters are used in the order listed (this matters for the alphabet train).
- Add `"enabledByDefault": false` to a set to start with it turned off.

### Places

```json
{ "id": "fire", "word": "place-fire", "game": "rescue", "color": "#e53935", "options": { "vehicle": "firetruck" } }
```

`game` is one of `construction, busdepot, rescue, farm, railway, recycling, opposites, trace, matra, read, sentence, rhyme, story, pairs`. `word` is the word that names the place. Rescue places need `options.vehicle`. A place only shows on the map in the phases that list it. `"langs": ["hi"]` hides a place in English-only mode (the matra garage uses this). Add `"unlockedByDefault": false` to hide it until a parent switches it on.

### Phrases, numbers and sentences

- `"phrases"` are the spoken instructions. `{w}` marks where the word goes, e.g. `"find": { "hi": "{w} ढूँढो", "en": "Find {w}" }`. You can reword them, but keep `{w}` in the ones that already have it.
- `"numbers"` must be 1 to 10 in order (`hi`, `en`, Devanagari digit `digitHi`).
- `"sentences"` are used by the metro (by `level`) and said in the garage (by `about`, the word id whose picture goes with the sentence).

## Run it locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080. A service worker needs `http://localhost` or `https://`; opening the file directly won't work.

Run the tests (Node 20+, no dependencies):

```bash
npm test
```

## Deploy on GitHub Pages

1. Push to GitHub.
2. In the repo, open **Settings › Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then branch **`main`** and folder **`/ (root)`**, and click **Save**.
4. After a minute the app is live at `https://<your-username>.github.io/<repo-name>/`.

The repo and the site are public, so only put general learning content in them. Personal photos and voices belong on the device (Parent settings), never in the repo.

## Install on an Android home screen

1. Open the GitHub Pages address in **Chrome** on the phone or tablet.
2. Tap the big ▶ button and wait a few seconds so the app can save itself for offline use.
3. Tap the **⋮** menu, then **Add to Home screen** (or **Install app**), then **Install**.
4. Open it from the new **Vehicle Town** icon. It runs full screen and works with no internet.
5. Optional: turn on **App pinning** (*Settings › Security › App pinning*) so the child stays inside the app.

## What else could be done

Roughly in order of how much they would help:

1. **Record family voices.** Browser Hindi text-to-speech varies a lot between phones. Recordings are already supported (Parent settings › Family voices). An in-app "record this word" button would make that much easier than naming files.
2. **Have a Hindi teacher review the word lists, sentences and stories** in `content.json` for spelling, naturalness and age fit.
3. **Stroke-order handwriting** for Devanagari: guided strokes per letter instead of free tracing. This needs stroke data for each letter.
4. **Openly licensed graded readers**: add StoryWeaver (Pratham Books, CC BY 4.0) Hindi stories at levels 1–4 as library stories, with attribution.
5. **Numeracy**: NIPUN Bharat also sets maths targets (numbers to 99, adding, taking away). A petrol pump or toll booth could teach those.
6. **Read-aloud practice**: the child reads a sentence aloud and speech recognition checks it. Chrome's recognition needs the internet and sends audio to a server, so it should be strictly opt-in.
7. **Child profiles** for siblings, each with their own phase and progress.
8. **Spaced review across days**, plus a weekly summary for parents.
9. **Play Store app** via a Trusted Web Activity, once it has been tested on real phones.

## Project layout

```
index.html            page shell
styles.css            all styles
content.json          everything the child sees and hears
manifest.webmanifest  PWA install info
sw.js                 offline cache (add new js files to SHELL)
icons/                app icons
fonts/                Baloo 2 (SIL Open Font License, see fonts/OFL.txt)
CURRICULUM.md         what each phase teaches, and the sources
js/app.js             map, garage, parent settings, game frame
js/logic.js           pure game logic (tested)
js/validate.js        content.json checks (tested)
js/art.js             vehicles, animals, shapes, places
js/art-words.js       pictures for the phase word lists and reading games
js/art-kit.js         drawing helpers
js/audio.js           recordings → audio/ files → text-to-speech
js/storage.js         localStorage + IndexedDB (device only)
js/sfx.js             small synthesised sound effects
js/games/*.js         one file per game
tests/                node:test unit tests
```
