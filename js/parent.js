// The grown-ups' area (behind a 3-second press): grade, language, voices and recordings,
// sound, unlocking, the special photo, and a progress report. Nothing here leaves the device.
import { el, ICONS } from './ui.js';
import { normalizeProgress, clipKeysFor, clipKeyFromFileName, practiceReport, DAILY_LIMITS } from './logic.js';
import { skillName, SKILLS as MATH_SKILLS } from './mathgen.js';
import { phonicsName } from './phonicsgen.js';
import { worldStars, worldLessons, lessonRecord, weekSummary, dueReviews, learningGains } from './curriculum.js';
import { refreshClipKeys, voicesFor, setVoicePrefs, hasVoice, play } from './audio.js';
import { KEYS, save, clips, resizeImage, addProfile, removeProfile, MAX_PROFILES } from './storage.js';
import { MASCOTS, MASCOT_IDS, mascotSvg } from './mascot.js';
import { specialVehicle } from './art.js';
import { levelCard } from './screens.js';
import { translateParent } from './parent-hi.js';

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
      ? `This device has no ${missing.map((l) => (l === 'hi' ? 'Hindi' : 'English')).join(' or ')} voice. On Android: Settings › System › Languages › Text-to-speech › Google › Install voice data.`
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
        toggle('Stay in this grade', s.lockGrade, (v) => ((s.lockGrade = v), persist()), 'Hides the other worlds. The home screen opens this grade’s Hindi world.'),
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
      section(
        'Sound',
        toggle('Music', s.music, (v) => ((s.music = v), persist(), api.music.setEnabled(v))),
        toggle('Sound effects', s.sfx, (v) => ((s.sfx = v), persist(), (api.sfx.enabled = v))),
      ),
      section('Voices', voiceRow('hi', 'Hindi'), voiceRow('en', 'English'), el('label', { class: 'rate' }, [el('span', { text: 'Speed' }), rate]), voiceNote),
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
    if (filter === 'stories') {
      // this grade's story shelf (Grade 1 stories for the younger grades): every page, then the moral
      const shelf = content.stories.filter((s) => s.level === level);
      const stories = shelf.length ? shelf : content.stories.filter((s) => s.level === 'grade1');
      return stories.flatMap((s) => [
        ...s.pages.map((p, i) => ({ key: `story-${s.id}-${i + 1}`, hi: p.hi, en: p.en, note: `${s.title.en} · page ${i + 1}` })),
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
    seg('rec-filter', [['words', 'Words'], ['letters', 'Letters'], ['stories', 'Stories'], ['phrases', 'Phrases']], () => filter, (v) => (filter = v)),
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

// Siblings each get their own grade, settings and progress. A nickname is optional and stays on this device.
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
