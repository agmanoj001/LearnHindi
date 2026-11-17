// Offline support: cache the app shell, then serve from cache and refresh in the background.
const VERSION = 'kkm-v33';
// the story voice pack is saved by the page (Grown-ups › Story voices) into its own cache, kept across versions
const VOICES = 'kkm-voices';
const SHELL = [
  './',
  'index.html',
  'styles.css',
  // the content: a core and a pack per grade; the packs are added from the core's list below
  'content/core.json',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'fonts/baloo2-devanagari.woff2',
  'fonts/baloo2-latin.woff2',
  'fonts/fredoka-latin.woff2',
  'js/app.js',
  'js/packs.js',
  'js/show-icons.js',
  'js/guide.js',
  'js/together.js',
  'js/freeplay.js',
  'js/coach.js',
  'js/motion.js',
  'js/favourites.js',
  'js/rewards.js',
  'js/mybooks.js',
  'js/readfor.js',
  'js/festivals.js',
  'js/art-festival.js',
  'js/surprise.js',
  'js/wordbook.js',
  'js/corner.js',
  'js/comicmaker.js',
  'js/duel.js',
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
  'js/shows.js',
  'js/art-comic.js',
  'js/parent.js',
  'js/parent-hi.js',
  'js/mascot.js',
  'js/audio.js',
  'js/storage.js',
  'js/sfx.js',
  'js/voicepack.js',
  'js/castvoices.js',
  'js/scene.js',
  'js/ui.js',
  'js/games/comic.js',
  'js/games/grammar.js',
  'js/games/handson.js',
  'js/games/ginti.js',
  'js/games/samay.js',
  'js/samay.js',
  'js/games/pahade.js',
  'js/pahade.js',
  'js/games/together.js',
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
  // `reload` skips the browser's HTTP cache, so a new version never mixes in a minutes-old copy of a file
  event.waitUntil(
    caches
      .open(VERSION)
      .then(async (c) => {
        await c.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' })));
        // every grade's pack, so the whole app works offline whichever grade is played
        const core = await (await c.match('content/core.json')).json();
        await c.addAll((core.packs || []).map((p) => new Request(`content/${p.file}`, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== VOICES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // voice recordings: from the voice pack when saved, else from the network (not kept in the app cache)
  if (url.pathname.includes('/voices/')) {
    // an exact match: ignoreSearch would make the browser look through every one of ~15,000 recordings
    event.respondWith(caches.open(VOICES).then(async (c) => (await c.match(req)) || fetch(req).catch(() => new Response('Offline', { status: 503 }))));
    return;
  }
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
