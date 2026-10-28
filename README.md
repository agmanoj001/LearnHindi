# Vehicle Town 🚌

A small, offline web app (PWA) where a young child learns **Hindi (Devanagari)** and **English** by exploring a town full of vehicles. Everything is spoken out loud, so the child doesn't need to read. Tap targets are big, there are no timers, and nothing can go wrong: a wrong tap just says what was tapped and lets the child try again. Each game takes about 2–5 minutes.

It's plain HTML, CSS and JavaScript with no build step, so it can be hosted on GitHub Pages.

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

**Rewards:** every finished game unlocks a new vehicle in **My Garage**. Tapping a vehicle there says its name and a short sentence about it.

**My special vehicle:** a parent can pick a photo on the device to use as a custom vehicle (it shows in the garage and in Drive the road). The photo is shrunk and saved only in this browser's local storage. It is never uploaded and never goes into this repo.

## Parent settings

**Press and hold the faint gear (top right of the map) for 3 seconds.** A ring fills up while you hold it. In settings you can change:

- **Language:** Hindi, English, or both. In "both", words are said in Hindi and then English, and word-building and counting rounds alternate between the two.
- **Places on the map:** which places are unlocked.
- **Letter sets:** Hindi vowels, Hindi consonants, English A–Z. Only sets in the chosen language are used.
- **My special vehicle:** choose or remove a photo.
- **Family voices:** load voice recordings from the device (see below).
- **Progress:** lock the garage again.

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
| `picture` | yes | Id of a built-in drawing (list below). If there's no drawing with that id, a coloured badge with the first letter is shown instead, and Parent settings shows a warning |
| `audio` | no | File names inside `audio/` for `hi` and/or `en` |
| `syllables` | no | How the crane splits the Hindi word into tiles, e.g. `["का", "र"]`. The pieces must join up to exactly `hi` |
| `sound` | farm animals | What the animal says: `{ "hi": "मूँ", "en": "moo" }` |
| `color` | colour words | e.g. `"#e53935"`, used by the recycling game |

Built-in pictures: `bus, car, policecar, ambulance, firetruck, digger, dumptruck, crane, mixer, bulldozer, tractor, train, carriage, garbagetruck, plane, helicopter, boat, ship, auto, scooter, bicycle, motorbike, truck, rocket, submarine, cow, dog, cat, horse, goat, sheep, elephant, lion, rabbit, monkey, parrot, fish, duck, rooster, color, size-big, size-small, dir-up, dir-down, speed-fast, speed-slow, place-construction, place-busdepot, place-fire, place-police, place-hospital, place-farm, place-railway, place-recycling, place-airport, place-trace, place-garage, shape-circle, shape-square, shape-triangle, shape-star, shape-heart`. To add a new drawing, add a function to `js/art.js`.

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

`game` is one of `construction, busdepot, rescue, farm, railway, recycling, opposites, trace`. `word` is the word that names the place. Rescue places need `options.vehicle`. Add `"unlockedByDefault": false` to hide a place until a parent switches it on.

### Phrases, numbers and sentences

- `"phrases"` are the spoken instructions. `{w}` marks where the word goes, e.g. `"find": { "hi": "{w} ढूँढो", "en": "Find {w}" }`. You can reword them, but keep `{w}` in the ones that already have it.
- `"numbers"` must be 1 to 10 in order (`hi`, `en`, Devanagari digit `digitHi`).
- `"sentences"` are said in the garage; `about` is the vehicle's word id.

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

## Project layout

```
index.html            page shell
styles.css            all styles
content.json          everything the child sees and hears
manifest.webmanifest  PWA install info
sw.js                 offline cache (add new js files to SHELL)
icons/                app icons
js/app.js             map, garage, parent settings, game frame
js/logic.js           pure game logic (tested)
js/validate.js        content.json checks (tested)
js/art.js             all vector drawings
js/audio.js           recordings → audio/ files → text-to-speech
js/storage.js         localStorage + IndexedDB (device only)
js/sfx.js             small synthesised sound effects
js/games/*.js         one file per game
tests/                node:test unit tests
```
