# Platform evaluation: FlutterFlow, Thunkable, Appy Pie, or stay a web app?

November 2026. The question: should Khel Khel Mein move to a no-code or low-code app builder? The deciding requirement is that the app **works offline**, so a child can play in a car, on a train or at a grandparent's house with no signal.

## Short answer

**Keep the app as it is (a Progressive Web App), and wrap it for the app stores only if store listing matters.**

- It already works fully offline. This was tested in a browser with the network cut off: every lesson, story, game, setting and family recording works.
- None of the three builders would make it more offline than it is now. All three would mean rebuilding 16 worlds, about 20 game types, 250 lessons and 77 stories and rhymes from scratch, and two of them could not build the tracing, drag-and-drop and read-along games at all without custom code.
- Getting into the stores doesn't need a rebuild. **Google Play:** wrap the web app with Bubblewrap (a Trusted Web Activity). **Apple App Store:** wrap it with Capacitor, which puts the app's files inside the iPhone app, so it works offline from the first launch.

## What the app needs from a platform

| Need | Why |
| --- | --- |
| Works offline after install | The main requirement |
| Custom interactive games | Tracing letters, dragging matras, building words and sentences, story order, counting with pictures, and about 240 hand-drawn SVG pictures |
| Hindi text and speech | Devanagari that renders correctly (matras, half letters), Hindi and English voices, word-by-word highlighting |
| Microphone | Family voice recordings and "tell it back" retellings, kept on the device |
| No tracking, no accounts | COPPA, GDPR-K, India's DPDP Act, Google Play Families and Apple Kids rules |
| Own the code | A public, free, editable project with no subscription |
| Runs on cheap Android phones, iPads and laptops | Families share whatever device they have |

## The options side by side

| | **Current PWA** (HTML, CSS, JavaScript) | **FlutterFlow** | **Thunkable** | **Appy Pie** |
| --- | --- | --- | --- | --- |
| What it is | A web app that installs to the home screen | A visual builder that generates Flutter (Dart) code | A drag-and-drop builder with logic blocks | A template and module app builder for business apps |
| Works offline | **Yes, today.** A service worker saves all ~55 files on the first visit, then nothing needs the internet | Yes for screens and bundled assets in phone builds. For data you add local state, SQLite (not supported for web builds) or PowerSync, which syncs with Supabase | Partly. Screens work offline. Saved data is a key-value Local Data Source, not a database; some components (photos) need the internet | Cache only. Offline means viewing and editing cached content (e.g. Google Sheets apps) |
| Custom games (trace, drag, build) | Already built | Only as hand-written Dart custom widgets | Very hard: the canvas and drag tools are basic | No: modules only |
| Hindi text and voices | Works: browser text shaping, Web Speech API, recordings | Works with plugins (e.g. flutter_tts) and custom code | Text-to-speech block; check Devanagari shaping on both platforms | Not designed for it |
| Microphone and local recordings | Works (MediaRecorder + IndexedDB) | Needs custom code | Recorder block; files may need cloud storage | Not available |
| Child privacy | No network calls, no SDKs, no accounts | Fine if you add no analytics or backend | The platform's own services sit between the app and the device | Built around a hosted backend |
| Own the code | Yes: everything is in this repository | Code export on paid plans only (about $39 a month and up; check current pricing) | No source code export | No |
| Cost | Free (GitHub Pages) | Paid to export code and publish | Paid to publish to the stores | Paid subscription |
| Effort to switch | None | A full rewrite: months | A full rewrite, with features lost | Not feasible for this app |
| Platforms | Any phone, tablet or computer with a modern browser | Android, iOS, web | Android, iOS, web | Android, iOS, web |

## Each builder in a paragraph

**FlutterFlow** is the strongest of the three. Flutter produces fast native apps, and a phone build carries its pictures and fonts inside the app, so screens work offline. Offline data is the weak spot: the officially backed route (PowerSync) stores data in a local SQLite database but syncs only with Supabase, and community guides warn SQLite isn't supported for web builds. Our games would have to be written by hand as Dart custom widgets, so we'd be rewriting the app in Flutter through a visual editor, and code export needs a paid plan. It's worth reconsidering only if the app ever needs something a browser can't do. A browser can't, for example, score a child's pronunciation with an on-device speech model.

**Thunkable** is excellent for simple form-and-list apps and for teaching children to build apps, but not for this one. Device storage is a key-value store (its own users point out it isn't really a database), photos need the internet, and the drag, trace and animation tools are far below what the games need. There is no source code export, so the app could never leave the platform, and publishing to the stores needs a paid plan.

**Appy Pie** builds business apps from ready-made modules (catalogue, booking, forms, Google Sheets). Its offline mode caches content and queues edits. Third-party reviews describe it as "content/cache oriented rather than full offline-first", and older user reports say some apps only worked online. It has no way to build custom learning games, so it's ruled out.

## If the app should be in the stores

| Store | How | Offline | Work involved |
| --- | --- | --- | --- |
| Google Play | **Bubblewrap** turns the web app into an Android App Bundle (a Trusted Web Activity). The site proves it owns the app with a Digital Asset Links file | The same service worker, so the same offline behaviour as today | About a day: Play Console account, signing, store listing, Families policy forms, review |
| Apple App Store | **Capacitor** puts the app's files inside a native iOS app | Fully offline from the first launch, since nothing loads from the web | A few days, plus review risk. Apple rejects thin website wrappers (guideline 4.2). Bundled offline content, microphone recording and a polished, app-like feel help; the Kids category has its own rules (no third-party analytics or ads, parental gate before links) |
| Android, fully bundled | Capacitor works for Android too, if the files should ship inside the app rather than download on the first open | Offline from the first launch | Shares the iOS project |

The app already meets most store rules for children: no ads, no tracking, no accounts, and a press-and-hold parental gate before settings.

## Done this round to make offline sturdier

- **Persistent storage.** The app now asks the browser to keep its data (`navigator.storage.persist()`) when it runs from the home screen and whenever a recording is saved, so a low-space clean-up doesn't delete progress or family voices. On iPhone and iPad, **add the app to the Home Screen**: Safari can clear data for websites that haven't been opened for a while, but not for home-screen apps.
- **Service worker cache** bumped to `kkm-v7`, so installed copies pick up the new design on their next online open.

## Sources

Third-party pricing pages disagree with each other; check each vendor's own pricing page before deciding.

- FlutterFlow offline: [FlutterFlow blog: a local database that auto-syncs with Supabase](https://www.flutterflow.io/blog/introducing-a-local-database-that-auto-syncs-with-supabase), [PowerSync announcement](https://releases.powersync.com/announcements/ann_jaNMN9AqJPTIp), [community guide: offline apps with FlutterFlow and Firebase](https://community.flutterflow.io/community-tutorials/post/build-offline-capable-app-with-flutterflow-and-firebase-yPwxD48EOJtGon6), [offline mode setup guide](https://www.devmatrix.us.com/flutterflow/features/flutterflow-offline-mode-setup)
- FlutterFlow pricing and code export: [nocode.mba](https://nocode.mba/articles/flutterflow-pricing), [LowCode Agency](https://www.lowcode.agency/blog/flutterflow-pricing-plans), [VP0](https://vp0.com/blogs/flutterflow-pricing-plans-2026/)
- Thunkable offline: [local storage DB](https://community.thunkable.com/t/how-to-i-use-local-storage-db-in-my-app/35609), [saving a local DB](https://community.thunkable.com/t/saving-a-local-db/879689), [offline app scoping](https://community.thunkable.com/t/scoping-questions-regarding-offline-app-and-thunkable/1281951), [photos offline](https://community.thunkable.com/t/taking-pictures-offline-and-upload-them-later/2794906)
- Thunkable pricing and export: [PricingSaaS](https://pricingsaas.com/companies/thunkable), [CostBench](https://costbench.com/software/no-code/thunkable/), [VP0: does Thunkable export code](https://vp0.com/blogs/does-thunkable-export-clean-code-to-github), [RapidDevelopers: migrating Thunkable to code](https://www.rapidevelopers.com/md/no-code-to-code/how-to-migrate-thunkable-project-to-code)
- Appy Pie: [Google Sheets app builder](https://www.appypie.com/create-google-sheets-to-app), [rfp.wiki review](https://www.rfp.wiki/vendors/appy-pie), [G2 discussion on offline](https://www.g2.com/discussions/24808-can-you-come-up-with-an-offline-desktop-mode-mobirise-have-such-feature-appy-pie-has-the-best-feature-and-can-do-more-by-having-an-offline-app-builder)
- Web app to Google Play: [Google codelab: Adding your PWA to Google Play](https://developers.google.com/codelabs/pwa-in-play), [Vaadin: submitting a PWA with Bubblewrap](https://vaadin.com/blog/submitting-a-pwa-to-google-play-store-using-bubblewrap)
- Web app to the App Store: [Capgo: web app to Capacitor](https://tanstack.com/intent/registry/%2540capgo%252Fcapgo-skills/webapp-to-capacitor), [a developer's PWA App Store review experience](https://scribe.disroot.org/post/7369014), [Apple Developer Forums: Capacitor app and guideline 4.2](https://developer.apple.com/forums/thread/812889), [Capacitor Apple review preflight](https://skillselion.com/skills/cap-go/capacitor-skills/capacitor-apple-review-preflight)
