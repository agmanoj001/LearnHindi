# Learning review: what works, what's missing, and the standards to follow

A review of Khel Khel Mein (November 2026) against learning research, education-technology standards, accessibility and children's privacy law, with what this round implemented (✅) and what's recommended next (➡️).

## 1. How the app scores on the research

The most widely used framework for judging children's learning apps is Hirsh-Pasek et al. (2015), *Putting Education in "Educational" Apps*: learning happens when children are **active**, **engaged** (not distracted), **meaningful** (connected to their lives) and **socially interactive**, in service of a **clear learning goal**.

| Pillar | Where the app is strong | Gap | Status |
| --- | --- | --- | --- |
| Active | Every screen asks for a choice; tracing, building words and sentences, putting a story in order | Few open-ended or creative tasks (drawing, recording their own story) | ➡️ "Tell it back": the child records themselves retelling a story |
| Engaged | No ads, no menus mid-lesson, no timers; short lessons; adaptive difficulty | Collections could tempt "collecting for its own sake" | ✅ The daily limit and break screen keep play bounded |
| Meaningful | Indian themes (family, festivals, village, folktales), NCERT topics, everyday objects | English phonics words are generic | ➡️ Add more Indian-context English words (mango, auto, kite, chai) |
| Socially interactive | Parent recordings; "what to do off-screen" list | Nothing prompts talk between child and grown-up | ✅ The break screen suggests an off-screen activity. ➡️ "Ask me" prompts after stories ("What would you do?") for the grown-up |
| Clear goal | Units are named for the goal and tagged with NC and NIPUN standards | The child doesn't see progress towards a goal across days | ✅ Today's path (3 steps a day) |

Other well-established findings, and where they stand:

| Finding | Status |
| --- | --- |
| **Spacing and retrieval** (Cepeda et al. 2006; Roediger & Karpicke 2006): reviewing after growing gaps beats re-studying | ✅ Spaced review: each finished lesson comes back after 1, 2, 4, 7 and then 14 days (a Leitner system). Strong results move it to a longer gap; weak ones bring it back tomorrow. Due reviews appear in Today's path |
| **Interleaving** (Rohrer & Taylor 2007) | ✅ Math and phonics lessons interleave skills; review units mix them; Today's path mixes subjects |
| **Scaffolding / zone of proximal development** | ✅ Levels move inside every lesson; hints after a second miss |
| **Concrete → pictorial → abstract** for math | ✅ Math levels |
| **Science of Reading** (Scarborough's Reading Rope; Ehri's phases): phonological awareness → phonics → fluency → comprehension, with vocabulary and background knowledge alongside | ✅ Phonics and Hindi follow this order. ✅ New: putting stories in order (comprehension) and captions (print–speech link). ➡️ Fluency: timed-free repeated reading with word highlighting |
| **Dual coding / multimedia principle** (Mayer): words with pictures, spoken not written for pre-readers | ✅ Everywhere. Captions are optional, so they don't clutter for pre-readers |
| **Character attachment** (Calvert et al. 2019) | ✅ A guide per world; children pick their own guide in their profile |
| **Process praise** (Mueller & Dweck 1998) | ✅ Feedback explains the strategy. ➡️ Vary praise for "you kept trying" after a correct second try |
| **Screen time** (WHO 2019: under-5s no more than 1 hour; AAP: 1 hour of high-quality media for ages 2–5, co-viewed) | ✅ Daily limit (15–60 minutes) with a friendly break screen; play time per day in the parent area |

## 2. Standards to follow

| Area | Standard | What it means here | Status |
| --- | --- | --- | --- |
| Curriculum | NIPUN Bharat, NCF-FS (India); NC Standard Course of Study for Math and ELA Foundational Skills (US) | Every unit names its standard | ✅ Done in earlier rounds |
| Learning design | Hirsh-Pasek four pillars; **UDL** (Universal Design for Learning, CAST): several ways to take in information, act and stay engaged | Audio + pictures + text; tap, trace, build; choice of worlds | ✅ Captions add a third channel. ➡️ Bigger-text option |
| Evidence | **ESSA tiers of evidence** (US) and Digital Promise's *Research-Based Design* certification | Document the research basis (this file) and, later, measure learning | ➡️ A simple pre/post check per unit (e.g. 5 questions before and after) would give Tier 3–4 evidence |
| Accessibility | **WCAG 2.2 AA** | Text alternatives, captions for speech, visible focus, no time limits, reduced motion, contrast, touch targets ≥ 24 px (ours are ≥ 100 px) | ✅ Captions, visible keyboard focus (new), reduced motion, no timers, `lang` on Hindi text, aria labels. ➡️ Check every colour pair against 4.5:1 contrast |
| Privacy | **COPPA** (US), **GDPR** / **UK Age Appropriate Design Code**, **India's DPDP Act 2023** (verifiable parental consent for anyone under 18) | Collect nothing; keep everything on the device; no ads, no tracking, no third-party SDKs | ✅ By design: no accounts, no analytics, no network calls except loading the app. Profiles are a nickname on the device only |
| Platform | Google Play **Families** policy / Apple **Kids** category | No ads or tracking; parental gate before settings and external links | ✅ Press-and-hold parent gate. ➡️ Needed only if published as a store app |
| Wellbeing | **5Rights** / UK Children's Code "no nudge" principle | No streak pressure, no loot boxes, no manipulative rewards | ✅ Streak is shown but never punished; collections are earned by learning. ✅ Daily limit |

## 3. Making it easier to use

| Problem | Change | Status |
| --- | --- | --- |
| "Which lesson should we do today?" | **Today's path** on the home screen: keep going (the next lesson in the world with the least done), a due review, and a story. One tap each | ✅ |
| Siblings share one device | **Profiles**: up to four children, each with their own grade, stars and settings; "Who's playing?" on the start screen. Voice recordings are shared | ✅ |
| Parents want to see how it's going | **This week** in the parent area: minutes per day, lessons played, reviews due | ✅ |
| Hard of hearing, or learning to read | **Captions** of everything said | ✅ |
| Too much screen time | **Daily limit** and break screen with an off-screen idea; a grown-up can allow 10 more minutes | ✅ |
| Keyboard and switch access | Visible focus outline | ✅ |
| Placement: which grade? | ➡️ A 3-minute placement check that suggests a grade and starting level |  |
| Grandparents who don't read English | ➡️ Parent area in Hindi |  |

## 4. Stories

Added this round (10): *टिंकू की छलाँग*, *चूज़ा खो गया*, *बारिश का दिन* (Grade 1 originals); *हाथी और चूहे* (Panchatantra), *किसान और तीन ठग* (Panchatantra), *आम का पेड़* (Grade 2); *बीरबल और कौवे*, *हाथी और गौरैया* (Panchatantra) (Grade 3); *तेनाली की बिल्ली*, *बंदरों का राजा* (Jataka) (Grade 4). That makes 41 stories and 6 poems. Every story world also has a new **story order** lesson.

Worth adding next:

- **StoryWeaver** (Pratham Books, CC BY 4.0): hundreds of levelled Hindi readers that may be reused with attribution. Good candidates: *Ammachi's Amazing Machines*, *Too Much Noise*, *Bunny Rabbit's Carrot*, *Smile Please*. Check each book's licence page before importing.
- More **Jataka** tales (the golden swan, the hare in the moon), **Hitopadesha**, **Tenali Raman** and **Akbar–Birbal** (the well, the mango tree), and regional folk tales (Bengali *Tuntunir Golpo*, Rajasthani tales) for variety beyond Panchatantra.
- **Non-fiction readers** matched to NCERT themes: the water cycle, Chandrayaan, festivals across India, a day in a farmer's life.
- **Read-along with word highlighting** for fluency; recording a family member reading each story (already possible in the parent area).

## 5. What to do next, in order

1. Record family voices for the most-used words and stories (the biggest quality jump).
2. A teacher's read of new Hindi quizzes, poems and stories.
3. Placement check and a pre/post check per unit, to see real learning gains.
4. Parent area in Hindi.
5. StoryWeaver imports with attribution.
6. Read-along word highlighting and "tell it back" recordings.
