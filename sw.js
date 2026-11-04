// Offline support: cache the app shell, then serve from cache and refresh in the background.
const VERSION = 'kkm-v7';
const SHELL = [
  './',
  'index.html',
  'styles.css',
  'content.json',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'fonts/baloo2-devanagari.woff2',
  'fonts/baloo2-latin.woff2',
  'fonts/fredoka-latin.woff2',
  'js/app.js',
  'js/logic.js',
  'js/validate.js',
  'js/art.js',
  'js/art-kit.js',
  'js/art-words.js',
  'js/art-creatures.js',
  'js/art-people.js',
  'js/art-scenes.js',
  'js/art-math.js',
  'js/art-icons.js',
  'js/mathgen.js',
  'js/phonicsgen.js',
  'js/placement.js',
  'js/art-phonics.js',
  'js/curriculum.js',
  'js/screens.js',
  'js/parent.js',
  'js/parent-hi.js',
  'js/mascot.js',
  'js/audio.js',
  'js/storage.js',
  'js/sfx.js',
  'js/ui.js',
  'js/games/kit.js',
  'js/games/construction.js',
  'js/games/busdepot.js',
  'js/games/rescue.js',
  'js/games/farm.js',
  'js/games/railway.js',
  'js/games/recycling.js',
  'js/games/opposites.js',
  'js/games/trace.js',
  'js/games/matra.js',
  'js/games/read.js',
  'js/games/sentence.js',
  'js/games/rhyme.js',
  'js/games/story.js',
  'js/games/pairs.js',
  'js/games/firstsound.js',
  'js/games/quiz.js',
  'js/games/sort.js',
  'js/games/math.js',
  'js/games/phonics.js',
  'js/games/sequence.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const key = req.mode === 'navigate' ? 'index.html' : req;
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          if (res.ok && res.status === 200) cache.put(key, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      return (await network) || new Response('Offline', { status: 503, statusText: 'Offline' });
    }),
  );
});
