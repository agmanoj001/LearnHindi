# The motion budget

Stutter is the first thing that makes a children's app feel cheap, and the scenes, particles and transitions were first checked only on a fast machine (roadmap 5.5). This is the budget, how it is measured, and what the app does on a slow device.

## The budget

On a phone about four times slower than a laptop (roughly an entry-level Android phone):

- **50 frames a second or more** while scrolling the home screen and while answering (sparkles, the guide's cheer);
- **no single frame over 150 ms** when a screen opens.

## How it is measured

`tools/motion-budget.mjs` opens the app in Chromium with the CPU slowed down 4× and 6× (Chrome's CPU throttling), scrolls the home screen, opens a world map and a lesson, and answers, counting frames. Each number is the median of three runs; run it again whenever animations change:

```
npm run serve                      # in another terminal
node tools/motion-budget.mjs 3     # needs Playwright with Chromium
```

These are emulated slow phones: throttling slows the main thread, not the graphics chip. A check on a real entry-level Android phone and an older iPad is still worth doing when one is at hand (Chrome's remote debugging shows the same frame timings).

## What was found, and what changed

At first, at 4× slower: opening a world map froze for up to 283 ms, scrolling the home screen ran at 48 frames a second, and opening a lesson at 54. The causes:

1. **A card growing into its screen** (5.4): the browser snapshots both screens, which costs paint on a slow device.
2. **Drifting backgrounds, ambient birds and leaves, and a dozen bobbing guides on the world cards**, all animating while the home screen scrolls.
3. **The map's trail** was measured in the same frame that built the map (forcing a second full layout), and again straight after.
4. **144 small SVG stars** under the map's stops.

Fixes for everyone: the trail is measured once, in a task of its own after the map has painted; map units off screen are not rendered until they come near (`content-visibility`); the stars are drawn by CSS.

**Lighter animations** (`js/motion.js`) for slow devices: no grow transitions, still backgrounds (no drift, no parallax, no ambient life), still world-card guides, no blur behind panels, and four sparkles instead of a burst. Story scenes, the guide's reactions, answer feedback and every game keep moving. The grown-ups' area has *Animations: Automatic / Full / Lighter*. In *Automatic* (the default) the app times the first few screens of each start; if two of them run under 40 frames a second (or more than a fifth of frames take over 34 ms), it remembers that this device is slow and switches to lighter animations.

## Results (median of three runs)

| | 4× full | 4× lighter | 6× full | 6× lighter |
| --- | --- | --- | --- | --- |
| Scroll the home screen | 51 fps | **55 fps** | 42 fps | 50 fps |
| Open a world map (worst frame) | 39 fps (150 ms) | **50 fps (150 ms)** | 23 fps (183 ms) | 42 fps (217 ms) |
| Open a lesson (worst frame) | 55 fps (83 ms) | **59 fps (33 ms)** | 54 fps (117 ms) | 58 fps (50 ms) |
| Answering | 59 fps | **60 fps** | 58 fps | 58 fps |

At 4× with lighter animations every row is within the budget. At 6× the one frame that builds a world map is still over 150 ms; a long map (17 units, 48 stops) is the heaviest screen in the app.
