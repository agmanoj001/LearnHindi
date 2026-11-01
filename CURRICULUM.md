# Curriculum: how Vehicle Town follows the Indian foundational stage

Vehicle Town has five **phases**. Each one follows the targets India's school system sets for that age, and each has its own places, letters, words and game settings in [`content.json`](content.json). A grown-up picks the phase on first launch and can change it any time in parent settings.

## Sources

| Source | Publisher | What it gives us |
| --- | --- | --- |
| **NIPUN Bharat** (National Initiative for Proficiency in Reading with Understanding and Numeracy), 2021 | Ministry of Education | The *Lakshya* (targets) for Balvatika and Grades 1–3. Balvatika: recognise letters and their sounds, and read simple words of 2–3 letters. Grade 1: read short sentences of 4–5 simple words. Grade 2: read 45–60 words a minute with meaning. Grade 3: at least 60 words a minute with meaning. Its parts of early literacy (oral language, decoding, fluency, comprehension, writing) shape the games |
| **National Curriculum Framework for the Foundational Stage (NCF-FS)**, 2022 | NCERT | Curricular goals CG-9 (talk in two languages), CG-10 (read and write fluently in the first language) and CG-11 (begin reading and writing a second language). That's why the app works in both Hindi and English |
| **NCERT textbooks**: *Jaadui Pitara* (Balvatika play materials), *Sarangi* (Hindi, Classes 1–2, 2023), *Veena* (Hindi, Class 3) | NCERT | Used only as a reference for scope and order. They are free to read but **not openly licensed**, so no textbook text, poems or pictures are copied. Every word list, sentence and story here is original. *The thirsty crow* is a public-domain folk tale, retold in our own words |
| **StoryWeaver** (Pratham Books) | Pratham Books | Openly licensed (CC BY 4.0) graded readers in Hindi, levels 1–4. They are a good next step for reading together, and some could be added as app stories with attribution. See "What else could be done" in the README |

> **Note:** the official PDFs (ncert.nic.in, pib.gov.in) were not reachable from the environment this was built in. The targets above come from reports and summaries that quote them, so please check the exact wording against the official documents before relying on it for school purposes.

## The order letters and words are taught

This follows the order used across Hindi primers:

1. **स्वर** (vowels) अ आ इ ई उ ऊ ऋ ए ऐ ओ औ अं अः
2. **व्यंजन** (consonants) क to ज्ञ, each with an example word (क … कार)
3. **अ-कार words**: two- and three-letter words with no matra (घर, नल, जल, फल, कप, कमल, कलम, बटन, मटर, मगर)
4. **मात्राएँ** in order: ा ि ी ु ू (ृ) े ै ो ौ ं ँ, each with at least two picture words (आम, किला, तीर, पुल, फूल, केला, पैर, मोर, कौआ, पंखा, चाँद …). ृ only appears in the barakhadi, because few picture words use it
5. **बारहखड़ी**: one consonant with every matra (क का कि की कु कू के कै को कौ कं कः)
6. **संयुक्त अक्षर** (half letters and conjuncts): पत्ता, चम्मच, मक्खी, स्कूल, गुब्बारा, बाल्टी, कुत्ता, बिल्ली
7. **Sentences** (3–5 words, then 5–8), then **stories** with questions
8. **Word knowledge**: rhymes (तुक), opposites (विलोम), singular and plural (वचन), male and female (लिंग)

English runs alongside it: A–Z letter names, the English name of every picture, English rhymes (car/star, boat/goat, house/mouse, eye/fly) and English sentences in "both" mode.

## The phases

### Phase 1: Toddler (age 2–3)
*Foundations of oral language (NCF-FS CG-9): listening, naming, joining in.*

| Goal | Where |
| --- | --- |
| Name vehicles and animals in Hindi and English | Every place; My Garage |
| Animal sounds | Farm |
| Colours and shapes | Recycling yard |
| Big/small, up/down, fast/slow | Airport and harbour |
| Count to 5 | Bus depot (at most 5 passengers) |
| Listen and point ("Where is the cow?") | Fire station, police station, hospital (pictures only) |

No letters yet: the digger digs up pictures, and the bus picks up animals only.

### Phase 2: Kindergarten / Balvatika (age 3–6)
*NIPUN Balvatika target: recognise letters and their sounds; read simple 2–3 letter words.*

| Goal | Where |
| --- | --- |
| Letter recognition and letter sounds: स्वर, व्यंजन, A–Z | Construction (dig, deliver), rescue, bus depot |
| Letter order | Railway station (alphabet train, one train per set) |
| Letter shapes | Drive the road (finger tracing) |
| Count to 10, in both languages | Bus depot |
| Build and read two- and three-letter words without matras: बस, घर, नल, कमल | Construction (crane), post office |

### Phase 3: Grade 1 (age 6–7)
*NIPUN Grade 1 target: read short sentences of 4–5 simple words.*

| Goal | Where |
| --- | --- |
| Every matra, and the barakhadi | Matra garage (explore a consonant, then "find की") |
| Spot the missing matra in a word (म_र → मोर) | Matra garage |
| Read two- and three-letter words with matras, and match words to pictures | Post office, rescue (windows show written words) |
| Build words from syllable tiles (कि + ता + ब) | Construction (crane) |
| Read and build 3–5 word sentences (बंदर केला खाता है।) | Metro station |
| Rhyming words (नल / जल) | Ice-cream van |
| Read-along picture story with questions | Library |

### Phase 4: Grade 2 (age 7–8)
*NIPUN Grade 2 target: read 45–60 words a minute with meaning.*

| Goal | Where |
| --- | --- |
| Half letters and conjuncts (त्त, म्म, क्ख, स्क, ब्ब, ल्ट) | Post office, crane, matra garage |
| Longer sentences (4–6 words) | Metro station |
| Read short stories with meaning and answer questions | Library |
| Opposites, singular and plural | Parking |
| Rhymes | Ice-cream van |

### Phase 5: Grade 3 (age 8–9)
*NIPUN Grade 3 target: read at least 60 words a minute with meaning.*

| Goal | Where |
| --- | --- |
| Read stories of 6+ sentences and answer questions | Library (*The little boat*, *The thirsty crow*) |
| Longer sentences (6–8 words) | Metro station |
| विलोम, वचन, लिंग (opposites, plurals, male and female: शेर / शेरनी) | Parking |
| Read harder words with meaning | Post office |

## What the app does not do (and what to do instead)

The app covers listening, letter and sound knowledge, decoding and short reading. The targets also need things a screen does badly. Spend a few minutes a day on these:

- **Talking**: ask about the pictures and stories ("बस कहाँ जा रही है?"). Oral language matters most in Phases 1–2.
- **Writing with a pencil**: tracing in the app is a warm-up, not handwriting. From Grade 1, write the week's words on paper.
- **Reading speed** (Grades 2–3): time a one-minute read-aloud of a short unseen text once a month and note the words read correctly. The app deliberately has no timers.
- **Books**: read aloud every day. StoryWeaver's free Hindi books (levels 1–4) suit Grades 1–3.

## Changing the curriculum

Everything above lives in `content.json`, and the README explains how to edit it. In short:

- To add a word to a phase, give it `"level": "grade1"`. Every word list that uses `"@grade1"` picks it up.
- To move places between phases, edit the phase's `places` list.
- To add a story, add an entry to `stories` with `level`, `pages` and `questions`.
- `npm test` checks the phase rules: KG words have no matras, Grade 1 words have matras but no half letters, Grade 2 words have half letters, and sentences get longer from grade to grade.
