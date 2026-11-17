# Performance budget

Slow first launches are the main reason a family never opens an app a second time (docs/ROADMAP.md 8.5). This is what "fast enough" means for Khel Khel Mein, how it is measured, and where it stands.

## The budget

On a **mid-range phone** (its processor about four times slower than a laptop, as Lighthouse emulates it):

| What | Budget |
| --- | --- |
| The first screen (the splash with its play button), on **every open after the first** (from the device) | 2 seconds |
| The first screen on a **first open over 4G** (9 Mbit/s, 60 ms) | 2 seconds |
| The first screen on a **first open over slow 4G** (1.6 Mbit/s, 150 ms) | 3.5 seconds |
| The home screen, after the play button | 1 second |

A first open over slow 4G has a looser budget because about 350 KB must arrive before the first screen (the code it needs, the core content and the child's grade), and at 1.6 Mbit/s that alone takes nearly two seconds. Every later open comes from the offline cache.

## How it is measured

`node tools/perf-budget.mjs` serves the app the way GitHub Pages does (HTTP/2, compressed), opens it in Chromium with the processor slowed four times and the network slowed, and times a first open as Toddler, Kindergarten and Grade 7 over both networks, then an open from the offline cache. Each number is the median of three runs. CI runs it on every push and pull request and puts the table in the job summary; a number over budget is a warning, not a failure, because a shared CI machine's timings vary.

## Where it stands (November 2026)

In milliseconds, medians of three runs. "Before" is the app with the content already split by grade (2.1); "after" adds the changes below.

| Grade | First open, 4G | First open, slow 4G | Home after play | Next opens |
| --- | --- | --- | --- | --- |
| Toddler | 1362 → **1151** | 4336 → **3281** | 477 → **493** | 1178 → **1270** |
| Kindergarten | 1672 → **1162** | 4278 → **3210** | 571 → **600** | 1182 → **958** |
| Grade 7 | 1650 → **1290** | 5293 → **3268** | 1122 → **836** | 1144 → **892** |

(Small differences of about 100 ms either way are noise between runs.)

## What keeps it there

- **Content loaded per grade** (2.1): the core and the child's own grade before the first screen; the other grades after it.
- **The content starts downloading at once**: a few lines in `index.html` fetch the core and the child's grade while the code is still loading, instead of after it.
- **No waterfall of imports**: `index.html` preloads every module the first screen needs (`<link rel="modulepreload">`), so they download together instead of one import after another. `npm test` fails if that list and the code's imports drift apart.
- **Code loaded when its screen opens**: the content checks, Show time and Story radio, the grown-ups' area, the comic maker and the quiz duel. The first screen needs 36 modules, 194 KB compressed, instead of about 330 KB.
- **Fonts not preloaded**: text shows at once in the phone's own font (`font-display: swap`) and switches when the font arrives, so the code and content come first.
- **Pictures drawn when on screen**: the home screen's world cards and the library's book covers draw their art as they come near the screen (`drawWhenSeen` in `js/ui.js`), except the first few; the map's units skip drawing while off screen (5.5).

## Next, if it is needed

- The stylesheet is 50 KB compressed and every screen's styles load at the start; the first screen needs a small part of it.
- The core content (93 KB compressed) includes every grade's quizzes and Show time episodes, which could move to the grade packs.
