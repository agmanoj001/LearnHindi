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

A first open over slow 4G has a looser budget for the play button because about 400 KB must arrive before it (the code it needs, the stylesheet, the core content and the child's grade), and at 1.6 Mbit/s that alone takes about two seconds. Every later open comes from the offline cache.

The first thing painted has its own line, the one the industry uses: Google's Core Web Vitals call a launch good when the main content is painted within **2.5 seconds** (Largest Contentful Paint), on every network above.

## How it is measured

`node tools/perf-budget.mjs` serves the app the way GitHub Pages does (HTTP/2, compressed), opens it in Chromium with the processor slowed four times and the network slowed, and times a first open as Toddler, Kindergarten and Grade 7 over both networks, then an open from the offline cache: when the play button is ready, and when the browser itself says the first screen was painted (its largest contentful paint, as Lighthouse reads it). Each number is the median of three runs. `node tools/device-check.mjs` does the same on an emulated Android Go phone and an older iPad (3.2, [DEVICES.md](DEVICES.md)). CI runs it on every push and pull request and puts the table in the job summary; a number over budget is a warning, not a failure, because a shared CI machine's timings vary.

## Where it stands (November 2026)

In milliseconds, medians of five runs, on a quiet machine. "Before" is the app before the launch work below; "after" is with it. The play button:

| Grade | First open, 4G | First open, slow 4G | Home after play | Next opens |
| --- | --- | --- | --- | --- |
| Toddler | 1017 → **1099** | 3221 → **3180** | 332 → **314** | 1149 → **829** |
| Kindergarten | 1102 → **1152** | 3579 → **3249** | 336 → **343** | 1166 → **802** |
| Grade 7 | 1538 → **1150** | 4211 → **3282** | 522 → **521** | 1089 → **716** |

The first screen painted (Core Web Vitals' largest contentful paint; before the app shell, nothing was painted until the play button, so "before" is the column above):

| Grade | First open, 4G | First open, slow 4G | Next opens |
| --- | --- | --- | --- |
| Toddler | 1017 → **228** | 3221 → **308** | 1149 → **260** |
| Kindergarten | 1102 → **228** | 3579 → **308** | 1166 → **292** |
| Grade 7 | 1538 → **248** | 4211 → **312** | 1089 → **260** |

(Differences of about 100 ms either way are noise between runs.) Every number is inside its budget.

## Launch: the evaluation against the industry standard

**The standard.** Google's Core Web Vitals, which Lighthouse and the Chrome UX Report use, call a launch good when the main content is painted within **2.5 seconds** (Largest Contentful Paint) and something first appears within **1.8 seconds** (First Contentful Paint), on a mid-range phone; Lighthouse's own mobile test is the slow-4G case above. For an installed app, Android's vitals treat a cold start of 5 seconds or more as excessive. A launch within **2 seconds**, the aim set for this app, is inside both.

**Verdict.** The first screen now paints in about a quarter to a third of a second in every case, on a first open over 4G, over slow 4G, and on every open after that: far inside both the 2-second aim and the 2.5-second Core Web Vitals line. The play button is live within 2 seconds on every open from the device (the usual launch of an installed app: 0.7–0.8 s) and on a first open over 4G (1.1–1.2 s). Only a first open over slow 4G takes longer to become playable (3.2–3.3 s, inside its 3.5-second budget), and that is the time the first download takes at 1.6 Mbit/s: it happens once, and every later open comes from the device. On the emulated Android Go phone (6 times slower, slow 4G) a first open is about 0.4 s quicker than before (DEVICES.md).

**What changed.**

- **The app shell.** `index.html` paints the first screen itself, the title and the play circle, from a few lines of CSS in the page, before any code, stylesheet or content has arrived. The stylesheet no longer holds up that first paint: a script adds it, and the app waits for it before drawing its own screens in the same place, so nothing jumps. The shell uses the phone's own font, so the app's fonts still download only after the content (naming them in the shell made a first open of Grade 7 over slow 4G about 1.5 seconds slower to become playable, which the measurement caught).
- **Grade 7 and 8 load less before the first screen.** Their comics are most of their content (716 KB of Grade 7's 880 KB), and no first screen shows them, so each grade's comics are a pack of their own (`grade7-comics.<hash>.json`) that loads after the home screen is up, like the other grades' packs; a comic opened in that moment waits for it, as every screen but the first few already does. And Kindergarten's stories, for the Grade 7–8 "read to your brother or sister" mission, no longer come first: the mission card counts from the story ids in the core. Grade 7's download before the play button went from 608 KB to 436 KB.

### Later opens, and the play button at once (November 2026)

A family reported that on their phone the play button came up late. Two causes, both on later opens:

- **The voice pack.** With every recording downloaded, the app listed the 31,000 entries of the voice cache before its first screen; the browser refused ("Operation too large") after making the phone wait. The voices are now kept as about 90 whole bundles and read alongside the first screen, not before it (`js/voicepack.js`, README "The voice pack").
- **Everything before the play button.** From the offline cache, a later open loaded every grade's content and checked all of it before the play button. Now it loads only the child's grade, like a first open; the other grades and the check follow once the home screen is up, or after a second on the play button (a screen that needs them asks for them at once). On the emulated Android Go phone that halved the wait: 1.62 s → 0.60 s.
- **The play button is drawn at once.** The app shell now draws the real button, play sign and all, exactly where the app puts it (a space is kept for the guides' parade above the title), so it is on screen in about a quarter of a second and comes alive in place.

Later opens to the play button (medians of five runs, CPU 4x, slow 4G), across the day's changes:

| Grade | Before the launch work | With the app shell | Now |
| --- | --- | --- | --- |
| Toddler | 1149 | 829 | **416** |
| Kindergarten | 1166 | 802 | **428** |
| Grade 7 | 1089 | 716 | **441** |

## What keeps it there

- **The app shell**: the first screen is painted by `index.html` itself, before anything else arrives (above).
- **Content loaded per grade** (2.1): the core and the child's own grade before the first screen, on every open; the other grades, Grade 7's and 8's comics and the check of the whole content after it.
- **The content starts downloading at once**: a few lines in `index.html` fetch the core and the child's grade while the code is still loading, instead of after it.
- **No waterfall of imports**: `index.html` preloads every module the first screen needs (`<link rel="modulepreload">`), so they download together instead of one import after another. `npm test` fails if that list and the code's imports drift apart.
- **Code loaded when its screen opens**: the content checks, Show time and Story radio, the grown-ups' area, the comic maker and the quiz duel. The first screen needs 36 modules, 194 KB compressed, instead of about 330 KB.
- **Fonts not preloaded**: text shows at once in the phone's own font (`font-display: swap`) and switches when the font arrives, so the code and content come first.
- **Pictures drawn when on screen**: the home screen's world cards and the library's book covers draw their art as they come near the screen (`drawWhenSeen` in `js/ui.js`), except the first few; the map's units skip drawing while off screen (5.5).

## Next, if it is needed

- The stylesheet is 55 KB compressed and every screen's styles load at the start; the first screen needs a small part of it.
- The core content (108 KB compressed) includes every grade's quizzes and Show time episodes, which could move to the grade packs. On a first open over slow 4G these two are now most of what stands between the painted first screen and the play button.
