// The grown-ups' area (behind a 3-second press): grade, language, voices and recordings,
// sound, unlocking, the special photo, and a progress report. Nothing here leaves the device.
import { el, ICONS } from './ui.js';
import { normalizeProgress, clipKeysFor, clipKeyFromFileName, practiceReport, DAILY_LIMITS, showLines, storyVoiceLines } from './logic.js';
import { skillName, SKILLS as MATH_SKILLS } from './mathgen.js';
import { phonicsName } from './phonicsgen.js';
import { worldStars, worldLessons, lessonRecord, weekSummary, dueReviews, learningGains } from './curriculum.js';
import { refreshClipKeys, voicesFor, setVoicePrefs, hasVoice, play, setVoicePack } from './audio.js';
import { loadIndex, savedVoiceKeys, packFiles, bundlesFor, downloadVoices, removeVoices, formatMB } from './voicepack.js';
import { deviceKind, VOICE_SETUP } from './logic.js';
import { KEYS, save, load, clips, resizeImage, addProfile, removeProfile, MAX_PROFILES, makeBackup, readBackup, localKeys, keepOffline, exportClips, readClipsFile } from './storage.js';
import { MASCOTS, MASCOT_IDS, mascotSvg } from './mascot.js';
import { specialVehicle, pictureForWord } from './art.js';
import { levelCard } from './screens.js';
import { translateParent, translateText } from './parent-hi.js';

// the parent area in Hindi when a grown-up picks it
const localize = (api, root) => api.state.settings.parentLang === 'hi' && translateParent(root);

export function showParent(api) {
  api.stop();
  const { content } = api.state;
  const s = api.state.settings;
  const persist = () => api.persistSettings();
  const section = (title, ...kids) => el('section', {}, [el('h2', { text: title }), ...kids]);
  const toggle = (text, checked, onchange, note) =>
    el('label', { class: 'check' }, [
      el('input', { type: 'checkbox', checked, onchange: (e) => onchange(e.target.checked) }),
      el('span', {}, [el('span', { text }), note ? el('small', { class: 'note', text: note }) : null]),
    ]);

  // ---- grade ----
  const levels = el(
    'div',
    { class: 'level-list compact' },
    content.levels.map((l) =>
      levelCard(api, l, l.id === s.level, () => {
        s.level = l.id;
        s.onboarded = true;
        persist();
        showParent(api);
      }),
    ),
  );

  // ---- language ----
  const langRow = el(
    'div',
    { class: 'seg' },
    [
      ['hi', 'हिन्दी Hindi'],
      ['en', 'English'],
      ['both', 'Both / दोनों'],
    ].map(([value, text]) =>
      el('label', {}, [
        el('input', {
          type: 'radio',
          name: 'lang',
          value,
          checked: s.lang === value,
          onchange: () => {
            s.lang = value;
            persist();
          },
        }),
        el('span', { text }),
      ]),
    ),
  );

  // ---- voices ----
  const voiceRow = (lang, label) => {
    const list = voicesFor(lang);
    const select = el(
      'select',
      {
        class: 'select',
        'aria-label': `${label} voice`,
        onchange: (e) => {
          s.voice[lang] = e.target.value;
          setVoicePrefs(s.voice);
          persist();
        },
      },
      [el('option', { value: '', text: list.length ? `Best available (${list[0].name})` : 'No voice installed' }), ...list.map((v) => el('option', { value: v.name, text: `${v.name} (${v.lang})`, selected: v.name === s.voice[lang] }))],
    );
    const test = el('button', {
      class: 'btn',
      text: 'Test',
      onclick: () => play([{ text: lang === 'hi' ? 'नमस्ते! चलो साथ में सीखें।' : "Hello! Let's learn together.", lang }]),
    });
    return el('div', { class: 'voice-row' }, [el('span', { class: 'voice-label', text: label }), select, test]);
  };
  const rate = el('input', {
    type: 'range',
    min: '0.6',
    max: '1.2',
    step: '0.05',
    value: String(s.voice.rate),
    oninput: (e) => {
      s.voice.rate = Number(e.target.value);
      setVoicePrefs(s.voice);
      persist();
    },
  });
  const missing = ['hi', 'en'].filter((l) => !hasVoice(l));
  const voiceNote = el('p', {
    class: 'note',
    text: missing.length
      ? `This device has no ${missing.map((l) => (l === 'hi' ? 'Hindi' : 'English')).join(' or ')} voice. ${voiceSteps()}`
      : 'Computer voices can sound robotic. The best fix is to record your own voice below: it is used instead, word by word.',
  });

  // ---- recorder ----
  const recorder = recorderSection(api);

  // ---- special photo ----
  const preview = el('div', { class: 'special-preview', html: api.state.special ? specialVehicle(api.state.special) : '' });
  const photoInput = el('input', { type: 'file', accept: 'image/*', class: 'visually-hidden', id: 'photo-in' });
  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;
    try {
      api.state.special = await resizeImage(file);
      if (!save(KEYS.special, api.state.special)) alert('This browser could not save the photo.');
      preview.innerHTML = specialVehicle(api.state.special);
    } catch {
      alert('That file could not be opened as a picture.');
    }
  });

  // ---- recordings from files ----
  const validKeys = clipKeysFor(content);
  const audioStatus = el('p', { class: 'note' });
  const showCount = async () => {
    audioStatus.textContent = `${(await clips.keys()).length} recording(s) saved on this device.`;
    localize(api, audioStatus);
  };
  showCount();
  const audioInput = el('input', { type: 'file', accept: 'audio/*', multiple: true, class: 'visually-hidden', id: 'audio-in' });
  audioInput.addEventListener('change', async () => {
    let added = 0;
    const unknown = [];
    for (const f of audioInput.files) {
      const key = clipKeyFromFileName(f.name, validKeys);
      if (!key) {
        unknown.push(f.name);
        continue;
      }
      await clips.put(key, f).then(() => added++, () => unknown.push(f.name));
    }
    refreshClipKeys(await clips.keys());
    await showCount();
    audioStatus.textContent = `Added ${added}. ${audioStatus.textContent}${unknown.length ? ` Not recognised: ${unknown.join(', ')}.` : ''}`;
  });

  // ---- progress ----
  const report = practiceReport(api.state.progress.stats);
  const describe = (key) => {
    const [kind, id] = [key[0], key.slice(2)];
    if (kind === 'w') return api.word(id) ? `${api.word(id).hi} · ${api.word(id).en}` : id;
    if (kind === 'l') return content.letterSets.flatMap((x) => x.letters).find((l) => l.id === id)?.char ?? id;
    if (kind === 's') return MATH_SKILLS[id] ? skillName(id) : phonicsName(id);
    if (kind === 'g') return content.grammar?.[id] ? `${content.grammar[id].title.hi} · ${content.grammar[id].title.en}` : id;
    if (kind === 'm') {
      const m = content.matras.find((x) => x.id === id);
      return m ? `क${m.sign} (${m.vowel})` : id;
    }
    return id;
  };
  const chips = (rows) => el('div', { class: 'chips-row' }, rows.slice(0, 16).map((r) => el('span', { class: 'chip', lang: 'hi', text: describe(r.key) })));
  const worldRows = content.worlds.map((w) => {
    const st = worldStars(api.state.progress, w);
    const done = worldLessons(w).filter((l) => lessonRecord(api.state.progress, l.id).stars > 0).length;
    return el('div', { class: 'world-row' }, [
      el('span', { class: 'world-row-name', text: `${content.levels.find((l) => l.id === w.level).name.en} · ${w.name.en}` }),
      el('span', { class: 'world-row-bar', style: { '--p': String(st.max ? st.got / st.max : 0) } }),
      el('span', { class: 'world-row-num', text: `${done}/${worldLessons(w).length} lessons · ${st.got}★` }),
    ]);
  });

  const reset = el('button', {
    class: 'btn danger',
    text: 'Reset all progress',
    onclick: () => {
      if (!confirm('Reset stars, collections and practice data on this device?')) return;
      api.state.progress = normalizeProgress(null, content);
      api.persistProgress();
      showParent(api);
    },
  });

  api.app.replaceChildren(
    el('div', { class: 'screen settings enter' }, [
      el('div', { class: 'settings-head' }, [el('button', { class: 'round-btn', 'aria-label': 'Done', html: ICONS.back, onclick: () => api.back() }), el('h1', { text: 'Grown-ups' }), parentLangSwitch(api)]),
      childrenSection(api),
      section('Grade', levels, el('button', { class: 'btn', text: 'Not sure? Quick check (2 minutes)', onclick: () => api.go('placement') })),
      section(
        'Navigation',
        toggle('Stay in this grade', s.lockGrade, (v) => ((s.lockGrade = v), persist()), 'The home screen shows only this grade’s worlds.'),
        toggle('Unlock every lesson', s.unlockAll, (v) => ((s.unlockAll = v), persist()), 'Normally lessons open one after another.'),
        toggle('Math worlds', s.math, (v) => ((s.math = v), persist()), 'English math for Kindergarten and Grade 1, following the North Carolina Standard Course of Study.'),
      ),
      section('Language', langRow, el('p', { class: 'note', text: 'For Hindi worlds. Math worlds are always in English.' })),
      section(
        'Play time and reading support',
        el('label', { class: 'rate' }, [
          el('span', { text: 'Daily limit' }),
          el(
            'select',
            { class: 'select', onchange: (e) => ((s.dailyLimit = Number(e.target.value)), persist()) },
            DAILY_LIMITS.map((m) => el('option', { value: String(m), text: m ? `${m} minutes a day` : 'No limit', selected: s.dailyLimit === m })),
          ),
        ]),
        el('p', { class: 'note', text: `Played today: ${api.minutesToday()} min. When the limit is reached, the next lesson shows a break screen with an idea for off-screen play (a lesson already started is never cut off). WHO and the AAP suggest about an hour a day of good-quality screen time for young children, ideally together with a grown-up.` }),
        toggle('Captions', s.captions, (v) => ((s.captions = v), persist()), 'Shows everything the app says as text. Helps children who are hard of hearing, and helps early readers match sounds to words.'),
        toggle(
          'Tell it back',
          s.retell,
          async (v) => {
            s.retell = v;
            persist();
            // ask for the microphone now, while a grown-up is here
            if (v && navigator.mediaDevices?.getUserMedia) navigator.mediaDevices.getUserMedia({ audio: true }).then((st) => st.getTracks().forEach((t) => t.stop())).catch(() => {});
          },
          'After each story the child can record themselves retelling it, with the pictures as prompts. Retelling is one of the best checks of understanding. Recordings stay on this device; listen to them under Progress.',
        ),
      ),
      tripSection(api),
      backupSection(api),
      section(
        'Sound',
        toggle('Music', s.music, (v) => ((s.music = v), persist(), api.music.setEnabled(v))),
        toggle('Sound effects', s.sfx, (v) => ((s.sfx = v), persist(), (api.sfx.enabled = v))),
      ),
      storyVoicesSection(api),
      section('Voices', voiceRow('hi', 'Hindi'), voiceRow('en', 'English'), el('label', { class: 'rate' }, [el('span', { text: 'Speed' }), rate]), voiceNote),
      storyRecorderSection(api),
      recorder,
      section(
        'Recordings from files',
        el('p', { class: 'note', text: 'Or load recordings made elsewhere. Name each file after what it says, e.g. bus_hi.m4a or hc-ka.mp3 (see README).' }),
        el('div', { class: 'row' }, [el('label', { class: 'btn', for: 'audio-in', text: 'Load files' }), audioInput, el('button', { class: 'btn', text: 'Remove all recordings', onclick: async () => confirm('Remove all voice recordings?') && (await clips.clear(), refreshClipKeys([]), showCount()) })]),
        audioStatus,
      ),
      section(
        'Special vehicle photo',
        el('p', { class: 'note', text: 'A photo from this device becomes a vehicle in Vehicle Town. It stays in this browser and is never uploaded.' }),
        preview,
        el('div', { class: 'row' }, [el('label', { class: 'btn', for: 'photo-in', text: 'Choose photo' }), photoInput, el('button', { class: 'btn', text: 'Remove', onclick: () => ((api.state.special = null), save(KEYS.special, null), (preview.innerHTML = '')) })]),
      ),
      section(
        'Progress',
        weekView(api),
        showsWatched(api),
        gainsView(api),
        retellView(api),
        el('div', { class: 'world-rows' }, worldRows),
        el('h3', { text: 'Practise together' }),
        report.practise.length ? chips(report.practise) : el('p', { class: 'note', text: 'Items show up here after a few tries.' }),
        el('h3', { text: 'Doing great' }),
        report.mastered.length ? chips(report.mastered) : el('p', { class: 'note', text: 'Items show up here once they are right first time most of the time.' }),
        reset,
      ),
      api.state.warnings.length ? section('Content warnings', el('ul', {}, api.state.warnings.map((w) => el('li', { text: w })))) : null,
    ]),
  );
  localize(api, api.app);
}

// Record a whole story in your own voice, one line at a time: the title, each page and the lesson.
// After each recording it moves on to the next line, so a story takes a few minutes. Your recordings
// play instead of the story voices and the computer voice, on this device only.
function storyRecorderSection(api) {
  const { content, settings } = api.state;
  if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null;
  const order = content.levels.map((l) => l.id);
  const stories = [...content.stories].sort((a, b) => (b.level === settings.level) - (a.level === settings.level) || order.indexOf(a.level) - order.indexOf(b.level));
  let story = stories[0];
  let lang = story.lang === 'en' ? 'en' : 'hi';
  let at = 0;
  let have = new Set();
  let rec = null;
  const all = storyVoiceLines(content);
  const linesOf = () => all.filter((l) => l.story === story.id && l.lang === lang);
  const levelName = (id) => content.levels.find((l) => l.id === id)?.name.en || id;

  const pick = el(
    'select',
    {
      class: 'select story-pick',
      'aria-label': 'Story',
      onchange: (e) => {
        story = content.stories.find((s) => s.id === e.target.value);
        if (story.lang === 'en') lang = 'en';
        at = 0;
        render();
      },
    },
    stories.map((s) => el('option', { value: s.id, text: `${s.title.hi || s.title.en} · ${s.title.en} (${levelName(s.level)})` })),
  );
  const langSeg = el('div', { class: 'seg' });
  const count = el('p', { class: 'note' });
  const card = el('div', { class: 'rec-card' });
  const nav = el('div', { class: 'btn-row rec-nav' });

  const stopRec = () => rec?.stop();
  const startRec = async (key) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        rec = null;
        await clips.put(key, new Blob(chunks, { type: mr.mimeType || 'audio/webm' }));
        refreshClipKeys(await clips.keys());
        if (at < linesOf().length - 1) at++; // on to the next line
        render();
      };
      rec = mr;
      mr.start();
      render();
    } catch {
      alert('The microphone is not available. Allow microphone access for this site and try again.');
    }
  };

  const render = async () => {
    have = new Set(await clips.keys());
    const lines = linesOf();
    at = Math.min(at, lines.length - 1);
    const line = lines[at];
    const done = lines.filter((l) => have.has(l.key)).length;
    count.textContent = `${done} of ${lines.length} lines recorded`;
    langSeg.replaceChildren(
      ...(story.lang === 'en' ? [['en', 'English']] : [['hi', 'हिन्दी'], ['en', 'English']]).map(([v, t]) =>
        el('label', {}, [el('input', { type: 'radio', name: 'srec-lang', value: v, checked: lang === v, onchange: () => ((lang = v), (at = 0), render()) }), el('span', { text: t })]),
      ),
    );
    const part = line.key.match(/-(title|moral|\d+)_/)[1];
    const label = part === 'title' ? 'Title' : part === 'moral' ? 'The lesson' : `Page ${part} of ${story.pages.length}`;
    const pageWord = /^\d+$/.test(part) ? story.pages[Number(part) - 1].word : story.cover;
    const recording = !!rec;
    card.className = `rec-card${have.has(line.key) ? ' has' : ''}${recording ? ' on' : ''}`;
    card.replaceChildren(
      el('div', { class: 'rec-pic', html: pictureForWord(api.word(pageWord)) }),
      el('div', { class: 'rec-say' }, [el('small', { text: `${label}${have.has(line.key) ? ' · recorded ✓' : ''}` }), el('p', { lang, text: line.text })]),
    );
    const recBtn = el('button', { class: `btn rec${recording ? ' on' : ''}`, text: recording ? '■ Stop' : have.has(line.key) ? '● Record again' : '● Record', onclick: () => (recording ? stopRec() : startRec(line.key)) });
    nav.replaceChildren(
      el('button', { class: 'btn', text: '←', 'aria-label': 'Previous line', disabled: at === 0 || recording, onclick: () => ((at -= 1), render()) }),
      recBtn,
      el('button', { class: 'btn', text: '▶ Listen', disabled: !have.has(line.key) || recording, onclick: () => play([{ text: line.text, lang, clipKey: line.key }]) }),
      el('button', { class: 'btn', text: '→', 'aria-label': 'Next line', disabled: at >= lines.length - 1 || recording, onclick: () => ((at += 1), render()) }),
    );
    localize(api, nav);
  };
  // move the family's recordings to another device: one file out, one file in
  const saveFile = async () => {
    const file = await exportClips();
    if (!Object.keys(file.clips).length) return alert('There are no recordings yet.');
    const a = el('a', { href: URL.createObjectURL(new Blob([JSON.stringify(file)], { type: 'application/json' })), download: `khel-khel-mein-recordings-${file.savedAt.slice(0, 10)}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const input = el('input', {
    type: 'file',
    accept: 'application/json,.json',
    class: 'visually-hidden',
    onchange: async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      let parsed = null;
      try {
        parsed = JSON.parse(await f.text());
      } catch {
        /* not JSON */
      }
      const r = readClipsFile(parsed, clipKeysFor(content));
      if (r.error) return alert(r.error);
      if (!confirm(`Add ${r.entries.length} recordings to this device? Recordings of the same lines are replaced.`)) return;
      for (const [k, blob] of r.entries) await clips.put(k, blob);
      refreshClipKeys(await clips.keys());
      render();
    },
  });
  render();
  return el('section', {}, [
    el('h2', { text: 'Record a story' }),
    el('p', { class: 'note', text: 'Read a whole story in your own voice: tap Record, read the line, tap Stop, and the next line comes up. Your recordings play instead of the story voices, on this device only.' }),
    pick,
    langSeg,
    count,
    card,
    nav,
    el('p', { class: 'note', text: 'To use your recordings on another phone or tablet, save them to a file and load it there.' }),
    el('div', { class: 'btn-row' }, [el('button', { class: 'btn', text: 'Save my recordings to a file', onclick: saveFile }), el('button', { class: 'btn', text: 'Load recordings from a file', onclick: () => input.click() }), input]),
  ]);
}

// Record your own voice for the words, letters and phrases of the child's grade.
function recorderSection(api) {
  const { content, settings } = api.state;
  const supported = typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia;
  if (!supported) return el('section', {}, [el('h2', { text: 'Record your voice' }), el('p', { class: 'note', text: 'This browser cannot record audio. Try Chrome on Android.' })]);
  let lang = 'hi';
  let filter = 'words';
  const list = el('div', { class: 'rec-list' });
  const items = () => {
    const level = settings.level;
    const worlds = content.worlds.filter((w) => w.level === level);
    if (filter === 'letters') {
      const sets = new Set(worlds.flatMap((w) => w.letterSets));
      return content.letterSets.filter((x) => sets.has(x.id)).flatMap((x) => x.letters.map((l) => ({ key: l.id, hi: l.char, en: l.translit, langFixed: x.lang })));
    }
    if (filter === 'shows') {
      // Show time episodes: every line, in order (this grade's episodes first)
      const shows = [...(content.shows || [])].sort((a, b) => (b.level === level) - (a.level === level));
      return shows.flatMap((sh) => showLines(sh).map((l, i) => ({ key: l.key, hi: l.hi || l.en, en: l.en, note: `${sh.title.en} · line ${i + 1}` })));
    }
    if (filter === 'stories') {
      // this grade's story shelf (Grade 1 stories for the younger grades): every page, then the moral
      const shelf = content.stories.filter((s) => s.level === level);
      const stories = shelf.length ? shelf : content.stories.filter((s) => s.level === 'grade1');
      return stories.flatMap((s) => [
        ...s.pages.map((p, i) => ({ key: `story-${s.id}-${i + 1}`, hi: p.hi || p.en, en: p.en, note: `${s.title.en} · page ${i + 1}` })),
        ...(s.moral ? [{ key: `story-${s.id}-moral`, hi: s.moral.hi, en: s.moral.en, note: `${s.title.en} · moral` }] : []),
      ]);
    }
    if (filter === 'phrases') return Object.entries(content.phrases).filter(([, p]) => !p.hi.includes('{w}')).map(([k, p]) => ({ key: `phrase-${k}`, hi: p.hi, en: p.en }));
    const ids = new Set();
    for (const [id, w] of Object.entries(content.words)) if (w.level === level) ids.add(id);
    for (const w of worlds) for (const id of content.collections[w.collection].items) ids.add(id);
    return [...ids].map((id) => ({ key: id, hi: api.word(id).hi, en: api.word(id).en }));
  };
  let have = new Set();
  let active = null;
  const render = async () => {
    have = new Set(await clips.keys());
    const rows = items().slice(0, 120).map((it) => {
      const key = it.langFixed ? it.key : `${it.key}_${lang}`;
      const recBtn = el('button', { class: 'btn rec', text: '● Record' });
      const playBtn = el('button', { class: 'btn', text: '▶', disabled: !have.has(key), 'aria-label': 'play' });
      const delBtn = el('button', { class: 'btn', text: '✕', disabled: !have.has(key), 'aria-label': 'delete' });
      recBtn.addEventListener('click', async () => {
        if (active) return active.stop();
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mr = new MediaRecorder(stream);
          const chunks = [];
          mr.ondataavailable = (e) => chunks.push(e.data);
          mr.onstop = async () => {
            stream.getTracks().forEach((t) => t.stop());
            active = null;
            await clips.put(key, new Blob(chunks, { type: mr.mimeType || 'audio/webm' }));
            refreshClipKeys(await clips.keys());
            render();
          };
          active = mr;
          mr.start();
          recBtn.textContent = '■ Stop';
          recBtn.classList.add('on');
        } catch {
          alert('The microphone is not available. Allow microphone access for this site and try again.');
        }
      });
      playBtn.addEventListener('click', () => play([{ text: lang === 'hi' ? it.hi : it.en, lang, clipKey: key }]));
      delBtn.addEventListener('click', async () => {
        await clips.del(key);
        refreshClipKeys(await clips.keys());
        render();
      });
      // show what to read out in bold, in the language being recorded
      const inEnglish = lang === 'en' && !it.langFixed;
      const sub = [it.note, inEnglish ? it.hi : it.en].filter(Boolean).join(' · ');
      return el('div', { class: `rec-row ${have.has(key) ? 'has' : ''}` }, [el('span', { class: 'rec-text' }, [el('b', { lang: inEnglish ? 'en' : 'hi', text: inEnglish ? it.en : it.hi }), el('small', { text: sub })]), recBtn, playBtn, delBtn]);
    });
    list.replaceChildren(...rows);
    localize(api, list);
  };
  const seg = (name, options, get, set) =>
    el(
      'div',
      { class: 'seg' },
      options.map(([value, text]) => el('label', {}, [el('input', { type: 'radio', name, value, checked: get() === value, onchange: () => (set(value), render()) }), el('span', { text })])),
    );
  render();
  return el('section', {}, [
    el('h2', { text: 'Record your voice' }),
    el('p', { class: 'note', text: 'Children learn best from a familiar voice. Tap Record, say the word, tap Stop. Your recording replaces the computer voice. Recordings stay on this device.' }),
    seg('rec-filter', [['words', 'Words'], ['letters', 'Letters'], ['stories', 'Stories'], ['shows', 'Shows'], ['phrases', 'Phrases']], () => filter, (v) => (filter = v)),
    seg('rec-lang', [['hi', 'हिन्दी'], ['en', 'English']], () => lang, (v) => (lang = v)),
    list,
  ]);
}

// The last seven days: minutes played, lessons, and reviews waiting.
function weekView(api) {
  const week = weekSummary(api.state.progress, Date.now());
  const max = Math.max(10, ...week.days.map((d) => d.minutes));
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const due = dueReviews(api.state.progress, api.state.content.worlds, Date.now()).length;
  return el('div', { class: 'week' }, [
    el('div', { class: 'week-bars', role: 'img', 'aria-label': `Minutes played in the last 7 days: ${week.days.map((d) => d.minutes).join(', ')}` }, week.days.map((d) =>
      el('div', { class: 'week-day' }, [
        el('span', { class: 'week-min', text: d.minutes ? String(d.minutes) : '' }),
        el('span', { class: 'week-bar', style: { height: `${Math.max(3, (d.minutes / max) * 70)}px` } }),
        el('span', { class: 'week-name', text: names[d.weekday] }),
      ]),
    )),
    el('p', { class: 'note', text: `This week: ${week.minutes} minutes, ${week.lessons} lessons played. ${due ? `${due} finished lessons are due for a review (they show up in Today's path).` : 'No reviews due.'}` }),
  ]);
}

// Show time episodes this child has watched to the end.
function showsWatched(api) {
  const seen = api.state.progress.shows || {};
  const list = (api.state.content.shows || []).filter((s) => seen[s.id]);
  if (!list.length) return el('p', { class: 'note', text: 'Show time: no episodes watched yet.' });
  return el('div', {}, [
    el('h3', { text: 'Show time' }),
    el('ul', { class: 'watched-list' }, list.map((s) => el('li', {}, [el('b', { text: s.title.en }), el('span', { text: ` · ${s.teaches.en} · watched ${seen[s.id].views}× (last ${seen[s.id].last})` })]))),
  ]);
}

// Before a trip: what to check while there is still internet.
function tripSection(api) {
  const list = el('ul', { class: 'trip-list' });
  const row = (ok, title, note) => el('li', { class: ok === true ? 'ok' : ok === false ? 'todo' : 'info' }, [el('span', { class: 'trip-mark', text: ok === true ? '✓' : ok === false ? '!' : 'i' }), el('span', {}, [el('b', { text: title }), el('small', { text: note })])]);
  const check = async () => {
    const cached = 'caches' in window ? (await caches.keys().catch(() => [])).some((k) => k.startsWith('kkm-')) && !!navigator.serviceWorker?.controller : false;
    const installed = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
    const kept = (await navigator.storage?.persisted?.().catch(() => false)) || false;
    const recordings = (await clips.keys().catch(() => [])).length;
    const limit = api.state.settings.dailyLimit;
    list.replaceChildren(
      row(cached, cached ? 'Saved for offline use' : 'Not saved for offline use yet', cached ? 'Every lesson, story, episode and picture is on this device.' : 'Open the app once with internet and reload the page; it then saves itself on this device.'),
      row(installed, installed ? 'On the home screen' : 'Not on the home screen', installed ? 'It opens like an app, without the browser.' : 'Browser menu › Add to Home screen (or Install app). On iPhone and iPad this also stops Safari clearing its data.'),
      row(hasVoice('hi'), hasVoice('hi') ? 'Hindi voice found' : 'No Hindi voice on this device', hasVoice('hi') ? 'On Android, make sure it works offline: Settings › System › Languages › Text-to-speech › Google › Install voice data › Hindi.' : voiceSteps()),
      row(recordings > 0 ? true : null, `${recordings} family recording(s)`, 'Recorded voices always work offline. Record a few words or episode lines under Record your voice.'),
      row(kept, kept ? 'Storage kept safe' : 'Storage may be cleared', kept ? 'The browser will not delete progress or recordings to free space.' : 'Installing the app on the home screen usually fixes this.'),
      row(null, limit ? `Daily limit: ${limit} minutes` : 'Daily limit: none', 'For a long journey you can change it under Play time. Story radio keeps the screen dark, which helps with car sickness; headphones with a volume limit are kind to small ears.'),
    );
    localize(api, list);
  };
  check();
  return el('section', {}, [el('h2', { text: 'Before a trip' }), el('p', { class: 'note', text: 'Check these while you still have internet. Then Show time, Story radio and every lesson work with no signal.' }), list]);
}

// Siblings each get their own grade, settings and progress. A nickname is optional and stays on this device.
// The story voice pack: a natural recorded voice for every story, downloaded once and kept offline.
function storyVoicesSection(api) {
  const { content, settings } = api.state;
  const order = content.levels.map((l) => l.id);
  const i = order.indexOf(settings.level);
  const myLevels = order.slice(Math.max(0, i - 1), i + 1); // the library shows this grade and the one before
  const gradeName = content.levels[i]?.name.en || 'this grade';
  const status = el('p', { class: 'note', text: 'Checking…' });
  const bar = el('div', { class: 'dl-bar', hidden: true }, [el('i')]);
  const buttons = el('div', { class: 'btn-row' });
  const say = (text) => {
    status.textContent = (settings.parentLang === 'hi' && translateText(text)) || text;
  };
  const render = async () => {
    const idx = await loadIndex();
    const have = await savedVoiceKeys();
    setVoicePack(have, settings.storyVoices);
    if (!idx?.files) {
      buttons.replaceChildren();
      return say('The story voices are not available yet. Stories use the device voice (or your recordings).');
    }
    const mine = packFiles(idx, myLevels);
    const all = packFiles(idx);
    // what a download costs: the bundles still to fetch (or the single files, for an older index)
    const size = (files) => (idx.packs?.length ? bundlesFor(idx, files, have).reduce((a, p) => a + p.bytes, 0) : files.reduce((a, f) => a + f.bytes, 0));
    const missing = (files) => files.filter((f) => !have.has(f.key));
    const savedBytes = all.filter((f) => have.has(f.key)).reduce((a, f) => a + f.bytes, 0);
    say(have.size ? `Saved on this device: ${have.size} of ${all.length} recordings (${formatMB(savedBytes)}).` : 'Not downloaded yet.');
    const get = (files) => async () => {
      buttons.querySelectorAll('button').forEach((b) => (b.disabled = true));
      bar.hidden = false;
      try {
        const failed = await downloadVoices(files, (done, total) => {
          bar.firstChild.style.width = `${total ? Math.round((done / total) * 100) : 100}%`;
          say(idx.packs?.length ? `Downloading… ${formatMB(done)} of ${formatMB(total)}` : `Downloading… ${done} of ${total}`);
        });
        if (failed) alert(`${failed} recordings could not be downloaded. Check the internet connection and try again.`);
      } catch (e) {
        alert(e.message);
      }
      bar.hidden = true;
      render();
    };
    const rows = [];
    if (missing(mine).length) rows.push(el('button', { class: 'btn primary', text: `Download for ${gradeName} (${formatMB(size(mine))})`, onclick: get(mine) }));
    if (missing(all).length && missing(all).length !== missing(mine).length) rows.push(el('button', { class: 'btn', text: `Download everything (${formatMB(size(all))})`, onclick: get(all) }));
    if (have.size) rows.push(el('button', { class: 'btn danger', text: 'Remove', onclick: async () => confirm('Remove the story voices from this device?') && (await removeVoices(), render()) }));
    buttons.replaceChildren(...rows);
    localize(api, buttons);
  };
  render();
  return el('section', {}, [
    el('h2', { text: 'Story voices' }),
    el('p', { class: 'note', text: 'A natural recorded voice reads every story (title, pages, questions and lesson) and says the app’s prompts and words, in Hindi and English, instead of the device’s computer voice. Download once and it works offline. Anything you record yourself always plays instead.' }),
    el('label', { class: 'check' }, [
      el('input', {
        type: 'checkbox',
        checked: settings.storyVoices,
        onchange: (e) => {
          settings.storyVoices = e.target.checked;
          api.persistSettings();
          setVoicePack(null, e.target.checked);
        },
      }),
      el('span', {}, [el('span', { text: 'Use the story voices' })]),
    ]),
    buttons,
    bar,
    status,
  ]);
}

// Save the stars somewhere safe, and bring them back on a new phone or after the browser was cleared.
function backupSection(api) {
  const status = el('p', { class: 'note', text: 'Checking whether this device keeps the app…' });
  keepOffline().then((kept) => {
    const text = kept
      ? 'This device keeps the app and its saves, even when space runs low.'
      : 'This browser may clear the app’s saves if the device runs low on space. Installing the app (Add to Home Screen) and keeping a backup protects them.';
    status.textContent = (api.state.settings.parentLang === 'hi' && translateText(text)) || text;
  });
  const download = () => {
    const backup = makeBackup(load, localKeys());
    const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `khel-khel-mein-backup-${backup.savedAt.slice(0, 10)}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const file = el('input', {
    type: 'file',
    accept: 'application/json,.json',
    class: 'visually-hidden',
    onchange: async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      let parsed = null;
      try {
        parsed = JSON.parse(await f.text());
      } catch {
        /* not JSON */
      }
      const r = readBackup(parsed);
      if (r.error) return alert(r.error);
      const when = r.savedAt ? ` from ${new Date(r.savedAt).toLocaleDateString()}` : '';
      if (!confirm(`Restore the backup${when}? The stars and settings on this device will be replaced.`)) return;
      for (const [k, v] of r.entries) save(k, v);
      location.reload();
    },
  });
  return el('section', {}, [
    el('h2', { text: 'Backup' }),
    el('p', { class: 'note', text: 'Everything is saved on this device only. Keep a backup file (stars, settings and children; not the photo or voice recordings) to move to a new device or recover after the browser is cleared.' }),
    el('div', { class: 'btn-row' }, [el('button', { class: 'btn', text: 'Save a backup file', onclick: download }), el('button', { class: 'btn', text: 'Restore from a file', onclick: () => file.click() }), file]),
    status,
  ]);
}

function childrenSection(api) {
  const profiles = api.state.profiles;
  const rows = profiles.list.map((p, i) => {
    const current = p.id === profiles.current;
    const face = el('span', { class: 'who-face small', html: mascotSvg(p.avatar) });
    const pick = el(
      'select',
      {
        class: 'select',
        'aria-label': 'Guide',
        onchange: (e) => {
          api.saveProfiles({ ...api.state.profiles, list: api.state.profiles.list.map((x) => (x.id === p.id ? { ...x, avatar: e.target.value } : x)) });
          face.innerHTML = mascotSvg(e.target.value);
        },
      },
      MASCOT_IDS.map((m) => el('option', { value: m, text: MASCOTS[m].name.en, selected: m === p.avatar })),
    );
    const name = el('input', {
      class: 'select',
      type: 'text',
      maxlength: '20',
      placeholder: `Child ${i + 1} (nickname, optional)`,
      value: p.name,
      onchange: (e) => api.saveProfiles({ ...api.state.profiles, list: api.state.profiles.list.map((x) => (x.id === p.id ? { ...x, name: e.target.value.trim() } : x)) }),
    });
    return el('div', { class: `child-row${current ? ' current' : ''}` }, [
      face,
      el('div', { class: 'child-fields' }, [name, pick]),
      current
        ? el('span', { class: 'chip', text: 'Playing now' })
        : el('button', { class: 'btn', text: 'Switch', onclick: () => (api.switchProfile(p.id), showParent(api)) }),
      p.id !== 'p1' ? el('button', { class: 'btn danger', text: '✕', 'aria-label': 'Remove this child', onclick: () => confirm("Remove this child's profile? Their stars and settings on this device will be forgotten.") && (api.saveProfiles(removeProfile(api.state.profiles, p.id)), api.switchProfile(api.state.profiles.current), showParent(api)) }) : null,
    ]);
  });
  const add =
    profiles.list.length < MAX_PROFILES
      ? el('button', { class: 'btn', text: '+ Add a child', onclick: () => (api.saveProfiles(addProfile(api.state.profiles, MASCOT_IDS[profiles.list.length % MASCOT_IDS.length])), showParent(api)) })
      : null;
  return el('section', {}, [
    el('h2', { text: 'Children' }),
    el('p', { class: 'note', text: 'Each child has their own grade, stars and settings. Family voice recordings are shared. With more than one child, the start screen asks who is playing.' }),
    ...rows,
    add,
  ]);
}

// Before and after: each lesson's first score against its latest one.
function gainsView(api) {
  const g = learningGains(api.state.progress, api.state.content);
  if (!g.rows.length) return el('p', { class: 'note', text: 'Getting better: once lessons have been played twice, their first and latest scores show here.' });
  return el('div', { class: 'gains' }, [
    el('h3', { text: 'Getting better' }),
    el('p', { class: 'note', text: `Lessons played more than once: ${g.rows.length}. Average score the first time ${g.first}%, latest ${g.recent}% (right on the first try).` }),
    ...g.rows.slice(0, 8).map((r) =>
      el('div', { class: 'gain-row' }, [
        el('span', { class: 'gain-name', text: `${r.world.name.en} · ${r.lesson.title.en}` }),
        el('span', { class: 'gain-bar' }, [el('span', { class: 'gain-first', style: { width: `${r.first}%` } }), el('span', { class: 'gain-recent', style: { width: `${r.recent}%` } })]),
        el('span', { class: `gain-num${r.gain > 0 ? ' up' : ''}`, text: `${r.first}% → ${r.recent}%` }),
      ]),
    ),
  ]);
}

// The child's "tell it back" recordings.
function retellView(api) {
  const box = el('div', { class: 'retells' });
  const prefix = `retell:${api.state.profiles.current}:`;
  const refresh = async () => {
    const mine = (await clips.keys()).filter((k) => String(k).startsWith(prefix));
    box.replaceChildren(
      ...(mine.length ? [el('h3', { text: 'Story retellings' })] : []),
      ...mine.map((k) => {
        const id = k.slice(prefix.length);
        const story = api.state.content.stories.find((x) => x.id === id);
        return el('div', { class: 'rec-row has' }, [
          el('span', { class: 'rec-text' }, [el('b', { lang: 'hi', text: story?.title.hi || id }), el('small', { text: story?.title.en || '' })]),
          el('button', { class: 'btn', text: '▶', 'aria-label': 'play', onclick: async () => new Audio(URL.createObjectURL(await clips.get(k))).play().catch(() => {}) }),
          el('button', { class: 'btn', text: '✕', 'aria-label': 'delete', onclick: async () => (await clips.del(k), refresh()) }),
        ]);
      }),
    );
    localize(api, box);
  };
  refresh();
  return box;
}

function parentLangSwitch(api) {
  const s = api.state.settings;
  return el(
    'div',
    { class: 'seg parent-lang', role: 'group', 'aria-label': 'Parent area language' },
    [
      ['en', 'English'],
      ['hi', 'हिन्दी'],
    ].map(([value, text]) =>
      el('label', {}, [
        el('input', { type: 'radio', name: 'parent-lang', value, checked: s.parentLang === value, onchange: () => ((s.parentLang = value), api.persistSettings(), showParent(api)) }),
        el('span', { text }),
      ]),
    ),
  );
}

// how to add a voice on this kind of device
function voiceSteps() {
  const help = VOICE_SETUP[deviceKind(navigator.userAgent, navigator.maxTouchPoints || 0)];
  return `On ${help.device}: ${help.steps}`;
}
