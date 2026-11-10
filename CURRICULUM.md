# Curriculum and learning design

Khel Khel Mein has eight grades, from Toddler to Grade 4 plus Grades 7 and 8, and 25 worlds: at least three in every grade from Kindergarten to Grade 4, four comic worlds and a grammar world in Grade 7, and three comic worlds and a grammar world in Grade 8. The **Hindi worlds** follow India's foundational-stage targets and the themes of the NCERT Hindi books; from Grade 2 each grade has one world for phonics and reading, one for grammar and writing, and one for stories and poems. Kindergarten and Grade 1 also have an **English phonics world** and an **English math world**, both following the North Carolina Standard Course of Study. Every world is tagged with what it teaches. Everything below lives in [`content.json`](content.json) (Hindi), [`js/phonicsgen.js`](js/phonicsgen.js) (phonics) and [`js/mathgen.js`](js/mathgen.js) (math), and the README explains how to change it.

## Sources

| Source | Publisher | What it gives us |
| --- | --- | --- |
| **NIPUN Bharat** (National Initiative for Proficiency in Reading with Understanding and Numeracy), 2021 | Ministry of Education, India | The *Lakshya* (targets). Balvatika: letters and their sounds, reading simple 2–3 letter words. Grade 1: short sentences of 4–5 simple words. Grade 2: 45–60 words a minute with meaning. Grade 3: at least 60 words a minute with meaning |
| **National Curriculum Framework for the Foundational Stage (NCF-FS)**, 2022 | NCERT | Curricular goals CG-9 (talk in two languages), CG-10 (read and write in the first language) and CG-11 (begin a second language). That's why the Hindi worlds can run in Hindi, English or both |
| **NCERT Hindi books**: *Sarangi* (Classes 1–2), *Veena* (Classes 3–4) | NCERT | The **themes** of each grade: family, food, festivals and the fair in Class 1; home and grandparents in Class 2; insects, the Moon mission and Panchatantra in Class 3; birds, trees, food and folktales in Class 4. They are free to read but **not openly licensed**, so nothing is copied: every word list, quiz, sentence and story here is original or a retelling of a public-domain folktale |
| **NC Standard Course of Study, Mathematics** (adopted 2017) and the NC DPI unpacking documents for Kindergarten and Grade 1 | North Carolina Department of Public Instruction | The math standards, by code (NC.K.CC.1 … NC.1.G.3). NC differs from Common Core in places, e.g. Grade 1 counts to **150** (not 120) |
| **NC Standard Course of Study, English Language Arts: Reading Foundational Skills** (NC.K.RF, NC.1.RF) | North Carolina Department of Public Instruction | Print concepts, phonological awareness (rhyme, syllables, sounds) and phonics (letter sounds, short and long vowels, digraphs, blends, final -e, vowel teams, high-frequency and irregular words) for Kindergarten and Grade 1. The codes on each phonics skill follow the Common Core numbering NC adopted; check exact wording against the DPI documents |
| **Panchatantra, Jataka, Akbar–Birbal, Tenali Raman** and Aesop-style fables | Public-domain folk literature | Retold in simple Hindi for the story library |
| **StoryWeaver** (Pratham Books) | Pratham Books | Openly licensed (CC BY 4.0) Hindi readers at levels 1–4: a good next step for reading together |
| **NCERT *मल्हार*** (Hindi, Classes 7 and 8, 2025–26, under NCF-SE 2023) and the CBSE Hindi grammar syllabus for Classes 7–8 | NCERT, CBSE | The grammar topics for Grades 7 and 8. *मल्हार* teaches grammar inside each chapter's exercises rather than in separate grammar chapters, so the topic list follows the standard CBSE व्याकरण syllabus for these classes as schools teach it with *मल्हार* (and earlier with *वसंत*). Every rule card, example and question is original |

> **Note:** the official PDFs (ncert.nic.in, pib.gov.in, dpi.nc.gov) could not be fetched from the environment this was built in. The targets, themes and standards above come from search results and pages that quote them, so please check the exact wording against the official documents before relying on it for school purposes.

## How the Hindi is ordered

1. **स्वर** (vowels) अ आ इ ई उ ऊ ऋ ए ऐ ओ औ अं अः
2. **व्यंजन** (consonants) क to ज्ञ in three groups, each letter with an example word (क … कार)
3. **Sounds before letters**: rhymes and first sounds ("which picture starts with क?") alongside the letters, because phonological awareness supports phonics
4. **अ-कार words**: two- and three-letter words with no matra (घर, नल, जल, कमल, मटर)
5. **मात्राएँ** in pairs: ा ि ी, then ु ू, े ै, ो ौ, then अं and ँ, each with picture words (आम, किला, तीर, फूल, केला, मोर, पंखा, चाँद)
6. **बारहखड़ी**: one consonant with every matra
7. **संयुक्त अक्षर** (half letters and conjuncts), and the three shapes of र (र्, ्र, ृ)
8. **Sentences** (3–5 words, then 5–8) and **stories** with questions
9. **Grammar and word knowledge**: विलोम, वचन, लिंग, संज्ञा and क्रिया, पर्यायवाची, विराम चिह्न, सर्वनाम, विशेषण, काल, मुहावरे

English runs alongside: A–Z, English names for every picture, English rhymes, and English sentences and story text in "both" mode.

## Grade by grade

### Toddler (age 2–3) · Animal Farm
*NCF-FS CG-9: listening, naming, joining in. No letters yet.*

| Unit | What the child does |
| --- | --- |
| Animal friends | Who said that? (animal sounds), find the animal, the bus ride |
| Colours and shapes | Sort by colour, then by shape |
| Big and small | Big/small, up/down, fast/slow |
| Count to 5 | Count passengers getting on and off |
| Vehicles | Dig up pictures, find the vehicle |

### Kindergarten / Balvatika (age 3–6) · Vehicle Town (Hindi)
*NIPUN Balvatika: recognise letters and their sounds; read simple 2–3 letter words.*

| Unit | What the child does |
| --- | --- |
| Let's hear sounds | Rhymes; which picture starts with this sound |
| Let's learn vowels | Dig, train, trace and rescue with स्वर |
| Consonants क to ञ, ट to न, प to ज्ञ | Dig, deliver, trace, train, rescue and first sounds for each group |
| Two- and three-letter words | Build words with the crane; read them at the post office |
| Numbers 1 to 10 | Count passengers in Hindi and English |
| Rhyme time | Seven बाल गीत to listen to and join in |
| First stories | Eight listen-along stories of 5–7 pages, one short line a page: *Hanuman and the sun*, *The little squirrel* (the Ramayana's bridge), *The night of lamps* (why Diwali), *The butter thief* (Krishna), *Ganesh goes round*, *Two goats*, *The sun and the wind*, *The elephant and the ant*. Two picture questions each (no reading needed) and a one-line सीख |

### Kindergarten · Pip's Number Igloo (math, English)

| Unit | Standards |
| --- | --- |
| Let's count! | NC.K.CC.4–5: count to tell how many (rows, scattered, up to 20); quick looks at dot patterns and ten frames |
| Let's learn numbers | NC.K.CC.1–3: read numbers 0–20, count on from any number, count by tens to 100 |
| Let's compare | NC.K.CC.6–7: more, fewer or the same (the smaller group is sometimes drawn bigger); which number is bigger |
| Let's add and take away | NC.K.OA.1, 2, 5: story problems with objects; facts within 5 |
| Let's make 10 | NC.K.OA.3–4, NBT.1: number partners on a ten frame, how many more make 10, teen numbers as ten and some ones |
| Let's find shapes | NC.K.G.1–3: above, below, beside, in front of, behind; name flat shapes in any size or turn; flat or solid |
| Let's measure and sort | NC.K.MD.1–3: longer, taller, heavier (on a balance); sort a mixed group and count each kind |
| Number party! | Mixed review of the year |

### Grade 1 (age 6–7) · Jolly Jungle
*NIPUN Grade 1: read short sentences of 4–5 simple words. NCERT Sarangi 1 themes: family, food, festivals, weather.*

| Unit | What the child does |
| --- | --- |
| Let's learn matras ा ि ी · ु ू · े ै · ो ौ · अं and ँ | Barakhadi, find the syllable, put the missing matra back, read words with those matras, build words from syllables |
| Let's talk about family and food | Who is माँ? Family and food words, with pictures |
| Festivals and weather | Diwali lamps, Makar Sankranti kites, 15 August, the fair, rangoli, rain |
| Let's learn the barakhadi | One consonant with every matra |
| Rhyme time | नल / जल, car / star |
| Let's read little sentences | Put 3–5 words in order |
| Story time | 7 picture stories with picture questions |
| Tales from the Ramayana | *Ram and the bow*, *The golden deer*, *Hanuman's great leap*, *Hanuman brings the mountain*: 6–7 pages, one or two short sentences a page, told gently for six-year-olds (no battle scenes) |
| Folk tales | *The Govardhan hill* (Krishna), *The fox and the crow*, *Two cats and a monkey*, *The donkey and the salt*, *The elephant and the tailor*, each ending with its सीख |

### Grade 1 · Tiko's Number Carnival (math, English)

| Unit | Standards |
| --- | --- |
| Let's count to 150 | NC.1.NBT.1: count on from any number to 150, across the hundreds; read numbers to 150 (105 is not 15) |
| Let's learn tens and ones | NC.1.NBT.2–3: base-ten blocks, tens and ones, compare with >, = and < |
| Let's add and subtract to 20 | NC.1.OA.2, 3, 6: make a ten on two ten frames (8 + 5 = 8 + 2 + 3), three addends, missing numbers |
| Let's solve story problems | NC.1.OA.1, 7, 8: add to, take from, put together, compare (Pip and Tiko line up their kites); is this equation true? |
| Let's add big numbers | NC.1.NBT.4–6: 10 more and 10 less, add tens and ones, subtract tens |
| Let's measure and tell time | NC.1.MD.1–3: order by length, measure with cubes, tell time to the hour and half hour (the hour hand sits halfway at half past) |
| Let's learn coins and graphs | NC.1.MD.4–5: penny, nickel, dime and quarter and their value in pennies; read picture graphs (how many, most, how many more) |
| Let's explore shapes | NC.1.G.1–3: sides and corners, put two shapes together, halves and fourths (a half is bigger than a fourth) |
| Carnival challenge | Mixed review of the year |

### Kindergarten · Buzz's Letter Garden (English phonics)

| Unit | Standards |
| --- | --- |
| Let's meet the letters | NC.K.RF.1d: find letters, big and small (b d p q look-alikes at the top level); the ABC train; tracing |
| Let's hear first sounds | NC.K.RF.3a: which letter does *ball* start with; which picture starts with B; dig up ABC |
| Let's rhyme | NC.K.RF.2a: which picture rhymes with *cat* |
| Let's clap syllables | NC.K.RF.2b: clap *but-ter-fly*, then see the parts |
| Let's read short words | NC.K.RF.3b: read c-a-t letter by letter and find the picture; the missing middle vowel |
| Let's hear last sounds | NC.K.RF.2d: how does *bus* end |
| Let's learn sight words | NC.K.RF.3c: the, and, is, see, look … |
| Garden party! | Mixed review |

### Grade 1 · Kiki's Phonics Castle (English phonics)

| Unit | Standards |
| --- | --- |
| Short vowels | NC.1.RF.3b: the missing a, e, i, o or u (f_x, b_g) |
| sh, ch, wh, ck | NC.1.RF.3a: digraphs at the start and end (__ip, du__) |
| Blends | NC.1.RF.2b: fr, fl, st, sn, tr, cr, pl …, and reading blend words |
| Magic e | NC.1.RF.3c: kite or kit, cake or cak |
| Vowel teams | NC.1.RF.3c: ee, ea, ai, oa, oo |
| Bossy r | ar, or, ir |
| Syllables and endings | NC.1.RF.3d–f: syllables in longer words; cats, boxes |
| Tricky words | NC.1.RF.3g: said, was, have, they, where … |
| Castle challenge | Mixed review |

### Grade 2 (age 7–8) · three worlds
*NIPUN Grade 2: read 45–60 words a minute with meaning. NCERT Sarangi 2 themes: home, grandparents.*

| World | Units |
| --- | --- |
| **Dino Valley** · Phonics, Reading, Spelling | Half letters (पत्ता, चम्मच, स्कूल); the shapes of र; ि or ी; ड or ड़; home words; all the matras; reading |
| **Desert Fair** · Grammar, Writing, Vocabulary | Who does what (action words); living and non-living; opposites; one and many; । and ?; times of day and seasons; building sentences |
| **Bholu's Story Forest** · Stories, Poems, Listening | One lesson for each story (*The thirsty crow*, *The lion and the mouse*, *The tortoise and the hare*, *The cap seller and the monkeys* …), two poems (बादल राजा, मेरी साइकिल), rhymes |

### Grade 3 (age 8–9) · three worlds
*NIPUN Grade 3: read at least 60 words a minute with meaning. NCERT Veena 3 themes: insects, the Moon mission, Panchatantra, unity.*

| World | Units |
| --- | --- |
| **Space Trip** · Grammar, Vocabulary | लिंग, वचन, विलोम, नाम and काम, पर्यायवाची, punctuation, space words |
| **Mitthu's Folktale Palace** · Stories, Poems | One lesson for each tale (*The monkey and the crocodile*, *The blue jackal*, *Strength in unity*, *The honest woodcutter* …), two poems (चाँद की सैर, पेड़ हमारे दोस्त), "which story teaches this?" |
| **Gauri's Village** · Reading, Writing, Spelling | Village words; spell it right; build words; complete the sentence; longer sentences |

### Grade 4 (age 9–10) · three worlds
*NCERT Veena 4 themes: birds, garden creatures, trees, food and health, folktales.*

| World | Units |
| --- | --- |
| **Ocean Voyage** · Grammar, Vocabulary | सर्वनाम, विशेषण, क्रिया, काल, opposites and same-meaning words, ocean words |
| **Himu's Story Mountain** · Stories, Poems | One lesson for each tale (*The talkative tortoise*, *Birbal's khichdi*, *Tenali Rama and the thieves*, *The golden egg* …), two poems (किसान, पहाड़ों पर), "which story teaches this?" |
| **Chintu's Word City** · Vocabulary, Writing, Reading | मुहावरे, समानार्थी शब्द, one word for many (अध्यापक, दर्ज़ी, माली …), days and months, city words, longer sentences |

### Grades 7 and 8 (age 12–14) · comics for confident readers
*For children who already read Hindi fluently. Reading level in line with NCERT Vasant 2 and 3 and मल्हार: longer sentences, everyday Urdu-Hindi vocabulary, तत्सम words and idioms in context. Four series are original; they are in the spirit of classic Indian comics but borrow no characters. Two retell folk tales in new words (Akbar–Birbal anecdotes and the Baital Pachisi), which belong to everyone. Each series has ten short comics (10–12 panels, 150–400 words) and then six or seven longer ones (16–20 panels, 500–600 words) that build reading stamina: more scenes, more characters, and the clues, steps or science spread across the story.*

| World | What it practises |
| --- | --- |
| **मिष्टी की मस्ती** · Grade 7 | Seventeen comedies in the small town of कटहलपुर: Mishti, twelve, and her goat Bijli. Each story weaves in a value or a bit of science (honesty, evidence before blame, kite-string safety, a balanced diet, saving electricity and water, a solar cooker, staying safe at a fair, online safety for grandparents). The longer ones add a class election (promises you can keep), a fort and its stepwell, a safe, natural-colour Holi, caring for saplings, fair play in a race, checking facts before printing them, and reviving a library. 2–4 idioms per comic, a word list with meanings, three comprehension questions, and an idiom quiz for the whole world. |
| **रिमझिम का धमाल** · Grade 7 | Twenty comics (ten short, ten long) led by Rimjhim, eleven, in a city housing colony, written for girls (and boys) of 11–13 to see themselves in. Family and home: a pet's care and vaccines, a rakhi tied both ways, sharing chores, milk teeth, a grandmother who cycles and finishes her BA at 68. Friends and school: girls' cricket, getting glasses (short-sightedness), a falling-out and making up, every role in a play matters, sharing tiffins, a new friend from Ladakh (जूले, altitude, apricots). Confidence and fairness: stage fright and how to structure a speech, a science fair (a water-tank alarm, and India's women scientists), melanin and why skin colour is no flaw, speaking up about bullying (a complaint is not tattling; Childline 1098), stray dogs and the Animal Birth Control approach, an overnight camp with a safety plan (112, three whistle blasts, stay where you are), and empathy for a bully. Idioms such as आटे-दाल का भाव, बात का बतंगड़, जले पर नमक, बिल्ली के गले में घंटी, गुरु गुड़ रह गए चेला चीनी हो गया. |
| **बीरबल की बुद्धि** · Grade 7 | Sixteen Akbar–Birbal tales: wit, fairness and quick thinking. Mughal-court Urdu vocabulary (जहाँपनाह, फ़रियाद, अशर्फ़ी, हाज़िरजवाबी) alongside Hindi idioms; one tale (फेरा न था) is about अनेकार्थी शब्द. Each stops so the reader can work out Birbal's trick first. The six longer tales (the green horse, the hen or the egg, four fools, counting the blind, the emperor's dream, eggs in the pond) give more room to courtly Hindi and Urdu and to Birbal's reasoning step by step. |
| **चिप्पू रोबो** · Grade 7 | Nearly sixty मुहावरे and कहावतें taught by getting them wrong: a robot takes each one literally, the reader says what it really means, and Kavya explains. Woven in: staying safe if lost at a fair, checking a rumour before passing it on (true, necessary, kind?), saving water and rainwater harvesting, a quieter Diwali, and why there is no moon at Diwali. The longer comics add “अंगूर खट्टे हैं” and other कहावतें, idioms in a debate, a new neighbour from Kerala (a few words of Malayalam, and making him welcome), a fever night (wet cloth, fluids, no old medicines without a doctor, hand-washing), a trip to the hills, and doing the sums (and keeping things clean) at a school-fair lemonade stall. |
| **जासूस दादी** · Grade 8 | Seventeen fair-play mysteries solved by Dadi, a retired principal, with her granddaughter Roohi, Pappu the wrestler and Mausi the cat. Richer vocabulary (संग्रहालय, मिश्रधातु, बरामद, प्रतियोगिता …), idioms, and a stop before each reveal where the reader names the culprit and gets a hint if wrong. Two stories carry practical lessons: spotting an online scam (helpline 1930) and testing milk for adulteration. The seven longer cases add clues a reader can check: a dry umbrella on a rainy day, two grammar mistakes (लिंग and वर्तनी) that unmask an exam-paper leak, canvas versus glass by weight, a dog that didn't bark, Vikram Samvat to AD (minus 57) and the first train in India (1853), how fog forms, and how to buy medicines safely (a licensed chemist, a bill, a sealed pack, the expiry date printed on the strip). |
| **विक्रम और बेताल** · Grade 8 | Sixteen riddle tales: reasoning, fairness and ethics (knowledge without sense, the value of a gift, sharing credit), plus maths and logic puzzles (fractions in the seventeen camels, the river crossing, deduction from tracks, the truth-teller and the liar). The reader answers each riddle before Vikram. अतिशयोक्ति, तर्क and तत्सम vocabulary. Season two (six longer tales, Vikram and Betal now friends) adds working backwards, using a liar's own claim against him, binary pieces (1, 2, 4) in the seven-link chain, reading a rule word by word in the slowest race, the two-jug measuring puzzle, and which part of a plant we eat (a potato is a stem, a carrot a root, maize grows mid-stalk). |
| **मास्टर मुरारी** · Grade 8 | Seventeen science episodes matched to NCERT Classes 6–8: turmeric as an acid–base indicator, refraction and apparent depth, density and floating, echo and the speed of sound, invisible ink, magnets and the compass, solar and lunar eclipses (and how to watch one safely), mirages, static electricity and lightning safety, and the arithmetic of chain (ponzi) scams. Each asks “what's the science?” before Masterji explains. Season two adds combustion and air pressure (and stop, drop and roll), carbon dioxide and the lime-water test, dispersion of light and the rainbow (never look at the sun), mosquito life cycles and dengue and malaria prevention (see a doctor, never self-medicate), pressure = force ÷ area, displacement reactions and the conditions for rusting, and snakes: why they don't drink milk or hear the been, and snakebite first aid (keep still, no cutting or tight tying, straight to hospital for antivenom). |

### Grades 7 and 8 (age 12–14) · grammar (व्याकरण)
*Twelve topics a grade, each one lesson: two to four rule cards (सीखो) with examples and tables, then eight questions (अभ्यास) that mix choosing, tapping a word in a sentence and sorting, with a "क्यों?" explanation after every answer. Every unit ends with a mixed review. Grade 7 meets most ideas for the first time; Grade 8 takes संधि, समास, उपसर्ग-प्रत्यय and वाक्य further and adds वाच्य, the fourteen काल, अलंकार and लोकोक्तियाँ.*

| World | Unit | Topics |
| --- | --- | --- |
| **ज्ञानू का पुस्तकालय** · Grade 7 | शब्द और उसके रूप | संज्ञा and its five kinds, भाववाचक संज्ञा from other words · सर्वनाम and its six kinds, the three पुरुष, अपना · विशेषण and विशेष्य, four kinds of विशेषण, making विशेषण (धनी, भारतीय, सामाजिक) · क्रिया and धातु, सकर्मक and अकर्मक, the three काल |
| | वाक्य की बनावट | The eight कारक and their चिह्न, करण or अपादान (the two "से") · अव्यय: क्रियाविशेषण (रीति, काल, स्थान, परिमाण), संबंधबोधक, समुच्चयबोधक, विस्मयादिबोधक · उद्देश्य and विधेय, six kinds of sentence by meaning, विराम चिह्न |
| | शब्द बनाना | उपसर्ग and प्रत्यय (अनपढ़, लिखावट, अपमानित) · संधि: दीर्घ and गुण · समास: द्वंद्व, द्विगु, तत्पुरुष, समास-विग्रह |
| | शब्द-भंडार और शुद्ध लेखन | तत्सम and तद्भव, पर्यायवाची, विलोम, अनेकार्थी, one word for many · correct sentences (agreement, "ने", कृपया) and common spelling mistakes (आशीर्वाद, उज्ज्वल, कवयित्री) |
| **चतुर की शब्द-प्रयोगशाला** · Grade 8 | शब्द-रचना | रूढ़, यौगिक, योगरूढ़; तत्सम, तद्भव, देशज, विदेशज · उपसर्ग from Sanskrit, Hindi and Urdu-Persian; कृत् and तद्धित प्रत्यय · स्वर संधि (दीर्घ, गुण, वृद्धि, यण, अयादि), व्यंजन and विसर्ग संधि · all six समास, कर्मधारय or बहुव्रीहि |
| | क्रिया, काल और वाच्य | द्विकर्मक, प्रेरणार्थक, संयुक्त and नामधातु क्रिया · the six भूतकाल, three वर्तमान and two भविष्यत् forms · कर्तृवाच्य, कर्मवाच्य, भाववाच्य and changing one into another |
| | वाक्य | सरल, संयुक्त and मिश्र वाक्य and converting between them · eight kinds of sentence by meaning (adds संदेहवाचक and संकेतवाचक) and changing a sentence's kind |
| | अलंकार, मुहावरे और शुद्ध लेखन | अनुप्रास, यमक, श्लेष, उपमा, रूपक with classic lines (Tulsi, Bihari, Rahim, Surdas) · मुहावरे and लोकोक्तियाँ and the difference · अशुद्धि-शोधन (मेरे को, "ने" with लाना, उपर्युक्त, अनधिकार) |

> **Note:** NCERT's own pages (ncert.nic.in) and several syllabus sites could not be fetched from the environment this was built in, so the chapter lists and topics come from search results that quote the *मल्हार* books and the CBSE syllabus. Schools vary a little in what they teach in which class; a parent can play any topic from either grade.

## Phonics skills

Sounds are always said with a key word ("c, as in cat"): text-to-speech can't say bare phonemes well, and parents can record real letter sounds in the app.

| Skill | Standard | What it practises | Unit |
| --- | --- | --- | --- |
| `k-letters` | NC.K.RF.1d | Know the letters, big and small | Let's meet the letters |
| `k-first-sound` | NC.K.RF.3a | First sounds: which letter does it start with? | Let's hear first sounds, Garden party! |
| `k-last-sound` | NC.K.RF.2d | Last sounds: how does it end? | Let's hear last sounds, Garden party! |
| `k-rhyme` | NC.K.RF.2a | Rhyming words | Let's rhyme, Garden party! |
| `k-syllables` | NC.K.RF.2b | Clap the syllables | Let's clap syllables, Garden party! |
| `k-read-cvc` | NC.K.RF.3b | Read short words (CVC) | Let's read short words, Garden party! |
| `k-middle-vowel` | NC.K.RF.3b | Short vowels in the middle | Let's read short words |
| `k-sight` | NC.K.RF.3c | Sight words | Let's learn sight words, Garden party! |
| `g1-short-vowels` | NC.1.RF.3b | Short vowels a e i o u | Let's learn short vowels, Castle challenge |
| `g1-digraphs` | NC.1.RF.3a | Digraphs: sh, ch, wh, ck | Let's learn sh, ch, wh and ck, Castle challenge |
| `g1-blends` | NC.1.RF.2b | Blends: fr, st, tr, pl … | Let's learn blends, Castle challenge |
| `g1-magic-e` | NC.1.RF.3c | Magic e (kite, cake, bone) | Let's learn magic e, Castle challenge |
| `g1-vowel-teams` | NC.1.RF.3c | Vowel teams: ee, ea, ai, oa, oo | Let's learn vowel teams, Castle challenge |
| `g1-bossy-r` | NC.1.RF.3 | Bossy r: ar, or, ir | Let's learn bossy r, Castle challenge |
| `g1-syllables` | NC.1.RF.3d | Syllables in longer words | Let's learn syllables and endings, Castle challenge |
| `g1-endings` | NC.1.RF.3f | Endings: -s and -es | Let's learn syllables and endings |
| `g1-read-words` | NC.1.RF.3b | Read words with blends and digraphs | Let's learn blends, Castle challenge |
| `g1-sight` | NC.1.RF.3g | Tricky sight words | Let's learn tricky words, Castle challenge |

## Math skills

Each skill makes problems at three levels: level 1 uses small numbers with objects to count, level 2 uses bigger numbers and pictorial models (ten frames, number lines, base-ten blocks), level 3 uses the biggest numbers with fewer pictures (concrete → pictorial → abstract).

| Skill | Standard | What it practises | Unit |
| --- | --- | --- | --- |
| `k-count` | NC.K.CC.5 | Count to tell how many | Let's count!, Number party! |
| `k-quick` | NC.K.CC.4 | Quick look: how many dots | Let's count! |
| `k-numerals` | NC.K.CC.3 | Read numbers 0 to 20 | Let's learn numbers, Number party! |
| `k-next` | NC.K.CC.2 | Count forward from any number | Let's learn numbers, Number party! |
| `k-tens` | NC.K.CC.1 | Count by tens to 100 | Let's learn numbers |
| `k-more` | NC.K.CC.6 | More, fewer or the same | Let's compare |
| `k-compare` | NC.K.CC.7 | Compare two numbers | Let's compare, Number party! |
| `k-add` | NC.K.OA.2 | Add with objects (story problems) | Let's add and take away, Number party! |
| `k-sub` | NC.K.OA.2 | Take away with objects (story problems) | Let's add and take away, Number party! |
| `k-facts5` | NC.K.OA.5 | Add and subtract within 5 | Let's add and take away |
| `k-partner` | NC.K.OA.3 | Break apart numbers to 10 | Let's make 10 |
| `k-make10` | NC.K.OA.4 | Make 10 | Let's make 10, Number party! |
| `k-teens` | NC.K.NBT.1 | Teen numbers: ten and some more | Let's make 10, Number party! |
| `k-position` | NC.K.G.1 | Positions: above, below, beside… | Let's find shapes, Number party! |
| `k-shapes` | NC.K.G.2 | Name flat shapes | Let's find shapes, Number party! |
| `k-solids` | NC.K.G.3 | Flat (2D) and solid (3D) shapes | Let's find shapes |
| `k-measure` | NC.K.MD.2 | Longer, taller, heavier | Let's measure and sort, Number party! |
| `k-sort` | NC.K.MD.3 | Sort and count groups | Let's measure and sort |
| `g1-count150` | NC.1.NBT.1 | Count to 150 from any number | Let's count to 150 |
| `g1-numerals` | NC.1.NBT.1 | Read numbers to 150 | Let's count to 150 |
| `g1-place` | NC.1.NBT.2 | Tens and ones | Let's learn tens and ones, Carnival challenge |
| `g1-compare` | NC.1.NBT.3 | Compare two-digit numbers (> = <) | Let's learn tens and ones, Carnival challenge |
| `g1-facts20` | NC.1.OA.6 | Add and subtract within 20 | Let's add and subtract to 20, Carnival challenge |
| `g1-story` | NC.1.OA.1 | Word problems within 20 | Let's solve story problems, Carnival challenge |
| `g1-three` | NC.1.OA.2 | Add three numbers | Let's add and subtract to 20 |
| `g1-missing` | NC.1.OA.8 | Find the missing number | Let's add and subtract to 20, Carnival challenge |
| `g1-equal` | NC.1.OA.7 | True or false: the equal sign | Let's solve story problems |
| `g1-tenmore` | NC.1.NBT.5 | 10 more and 10 less | Let's add big numbers, Carnival challenge |
| `g1-add100` | NC.1.NBT.4 | Add and subtract tens within 100 | Let's add big numbers |
| `g1-length` | NC.1.MD.1 | Order three things by length | Let's measure and tell time |
| `g1-units` | NC.1.MD.2 | Measure length with cubes | Let's measure and tell time |
| `g1-time` | NC.1.MD.3 | Tell time to the hour and half hour | Let's measure and tell time, Carnival challenge |
| `g1-coins` | NC.1.MD.5 | Coins: penny, nickel, dime, quarter | Let's learn coins and graphs, Carnival challenge |
| `g1-graph` | NC.1.MD.4 | Read picture graphs | Let's learn coins and graphs, Carnival challenge |
| `g1-sides` | NC.1.G.1 | Sides and corners of shapes | Let's explore shapes, Carnival challenge |
| `g1-halves` | NC.1.G.3 | Halves and fourths | Let's explore shapes, Carnival challenge |
| `g1-compose` | NC.1.G.2 | Put shapes together | Let's explore shapes |

**Not covered yet:** NC.K.G.4–6 (comparing, building and composing shapes with real materials), NC.K.CC.4's one-to-one counting of real objects (the app's tap-to-count is the closest), and NC.1.OA.3's properties of operations as a separate skill. These are better done with blocks, beads and paper shapes at a table.

## The learning design, and the research behind it

The look and flow were shaped by studying what makes the best early-learning apps work (characters you get attached to, a path of short lessons, things to collect, lots of praise), but the characters, art, names, sounds and every line of content are original.

| What the research says | How the app applies it |
| --- | --- |
| Children learn from apps that are **active, engaged, meaningful and socially interactive**, with a clear learning goal (Hirsh-Pasek, Zosh, Golinkoff et al., 2015, *Psychological Science in the Public Interest*) | Every screen asks the child to do something; there are no ads, menus or distractions mid-lesson; words come with pictures, stories and everyday themes (family, food, festivals); each unit names its goal ("Let's make 10"); the recorder puts a family voice in the app, and the section below suggests ways to talk about it together |
| Young children learn math faster from a **character they feel attached to** that talks to them (Calvert et al., 2019, *Child Development*) | Each world has a named guide who talks, reacts to every answer, and can be tapped for a joke; the same characters appear in stories and story problems |
| **Scaffolding in the zone of proximal development**: tasks a little above what the child can do alone, with support that fades (Vygotsky; Wood, Bruner & Ross, 1976) | The level moves inside each lesson (two right → harder, two misses → easier); math hints give a strategy after a second miss, never the answer; tap-to-count supports counting |
| **Concrete → pictorial → abstract** in math (Bruner) | Math levels go from objects to count, to ten frames, number lines and base-ten blocks, to numbers alone |
| **Retrieval practice, spacing and interleaving** strengthen memory (Roediger & Karpicke, 2006; Rohrer & Taylor, 2007) | Weak words, letters, matras and math skills come up more often; review units mix skills; lessons interleave skills so the same kind rarely comes twice in a row |
| **Phonological awareness** supports learning to read (National Reading Panel, 2000) | Rhymes and first sounds come before and alongside letters in KG |
| Praise **effort and strategy**, not ability (Mueller & Dweck, 1998) | Feedback says what was right and how ("8 and 2 make 10, and 3 more is 13"); mistakes get a gentle wobble and a hint, never a buzzer or a lost life |
| Remove **extraneous load** (Mayer's coherence principle) | One question per screen, big targets, spoken instructions, no timers or scores to chase |
| **Autonomy** keeps children motivated (self-determination theory, Ryan & Deci) | Children choose any open lesson, any world and any story; collections and stars reward finishing, not speed |

## What the app does not do (and what to do instead)

A screen is good at listening, letters and sounds, decoding, and practice. These need people and paper:

- **Talking**: ask about the pictures and stories ("बस कहाँ जा रही है?", "How many kites does Pip have?").
- **Writing**: tracing in the app is a warm-up. From Grade 1, write the week's words and numbers on paper.
- **Reading speed** (Grades 2–4): once a month, time a one-minute read-aloud of a short unseen text and note the words read correctly. The app deliberately has no timers.
- **Hands-on math**: count real things, build with blocks, share a roti into halves and fourths, find shapes around the house, read a real clock, sort real coins.
- **Books**: read aloud every day. StoryWeaver's free Hindi books (levels 1–4) suit Grades 1–4.

## Changing the curriculum

- Add a word to a grade with `"level": "grade1"`; every word list using `"@grade1"` picks it up.
- Add or reorder units and lessons in a world's `units`.
- Add a story to `stories`, a quiz bank to `quizzes`, or a sort to `sorts`.
- For math, list skills in a lesson's `config.skills`, or add a new skill to `js/mathgen.js`.
- `npm test` checks the rules: KG words have no matras, Grade 1 words have matras but no half letters, Grade 2 words have half letters, sentences get longer each grade, every math skill makes fair problems at every level, and every NC standard listed above is covered.
