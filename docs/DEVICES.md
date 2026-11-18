# Low-end devices

Most Indian families' second phone, often the one a child uses, is an entry-level Android phone with 2 GB of memory; many schools and families also have an older iPad (docs/ROADMAP.md 3.2). This is how the app does on both, measured by emulation, and what is left to try on the real thing.

## How it is measured

`node tools/device-check.mjs` serves the app the way GitHub Pages does (HTTP/2, compressed, `tools/pages-server.mjs`) and opens it in Chromium set up like each device:

| Device | Screen | Processor | Memory the page sees | Network |
| --- | --- | --- | --- | --- |
| Android Go phone | 360 × 640, touch | 6 times slower than a laptop (an entry-level chip) | 2 GB | slow 4G: 1.6 Mbit/s, 150 ms |
| Older iPad (6th generation, A10) | 768 × 1024, touch | 3 times slower | not reported (Safari doesn't say) | 4G: 9 Mbit/s, 60 ms |

For each one it times a first open (nothing saved yet) and an open from the device (the offline cache), then plays for a minute: the first pages of a story, two lessons with a few answers, Show time, the library, and home. During that it records the most JavaScript memory the page holds, the most elements on screen, the longest freeze (a long task), and whether the app chose its lighter animations on its own.

## Where it stands (November 2026)

Medians of three runs, with the app shell (the first screen painted by `index.html` itself; [PERFORMANCE.md](PERFORMANCE.md), "Launch") and only the child's grade loaded before the play button on later opens. The times are to the play button.

| Device | First open | then home | Next opens | then home | Memory (JS) | Most elements | Longest freeze | Lighter animations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Android Go phone, CPU 6x, slow 4G | 3213 ms | 777 ms | 596 ms | 565 ms | 21 MB | 6793 | 232 ms | yes, on its own |
| Older iPad, CPU 3x, 4G | 995 ms | 564 ms | 324 ms | 443 ms | 22 MB | 7288 | 126 ms | no (not needed) |

Before the app shell: the Android Go phone 3740 ms on a first open and 1426 ms on next opens, the iPad 1082 ms and 996 ms. Next opens on the phone came down to 0.6 s once a later open stopped loading and checking every grade before the play button.

What this says:

- **Memory is not a worry.** At most about 20 MB of JavaScript memory, where a 2 GB phone gives a browser tab a few hundred megabytes. The stories, comics and voices are loaded per grade (2.1), and pictures are drawn as they come into view.
- **No freezes a child would notice.** The longest single task is about a third of a second, on the slowest device, while a new screen opens.
- **Opening from the device is quick on both**: the first screen, play button included, shows in about 0.3 s, and the button is live within 0.6 s on the slowest phone.
- **The very first open over slow 4G** takes about 3.5 s on the Android Go phone to the play button, as long as the download itself takes, with the first screen painted from the start. That is at the budget in [PERFORMANCE.md](PERFORMANCE.md). Every later open comes from the device.
- **Lighter animations on a 2 GB phone.** Measuring frames alone did not catch the Android Go phone: an idle screen draws smoothly even on a slow chip, and it is the moment a screen opens that stutters. So a phone that reports 2 GB of memory or less now starts with the lighter animations (`lowMemoryDevice` in `js/motion.js`). Grown-ups can still choose "Full" in Grown-ups › Play time and reading support › Animations. Safari doesn't report memory, so an iPad decides by measuring, as before.

## Still to do on real devices

The emulation slows the processor and the network and sets the screen; it cannot reproduce a real phone's memory pressure when other apps are open, its thermal slowdown, or Safari itself. Before a store release, try a real Android Go phone (for example, any 2 GB phone on Android Go edition) and a 6th-generation iPad:

1. Open the app on mobile data the first time, then install it to the home screen.
2. Play a story, a comic (Grade 7), Show time and Story radio with the screen locked for a while in between.
3. Switch to two other apps and back: does it resume where it was, or reload?
4. Put it in airplane mode and open it again.
