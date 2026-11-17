// "Read to your brother or sister" (docs/ROADMAP.md 7.9). A mission for Grades 7–8: pick a Kindergarten
// story and record it page by page, with tips for reading aloud to a little one. The story then plays in
// that voice on this device (the recordings use the same keys as the story voice), and its cover says who
// read it. The older reader gets a real audience; the younger one a loved voice. Recordings stay here.
import { el, sleep, ICONS } from './ui.js';
import { clips, load, save } from './storage.js';
import { storyVoiceLines } from './logic.js';
import { refreshClipKeys, play } from './audio.js';
import { pictureForWord } from './art.js';

export const READ_BY_KEY = 'vt.readBy';
export const MISSION_LEVELS = ['grade7', 'grade8'];
// the stories to read: Kindergarten's Hindi stories (the ones a little brother or sister listens to)
export const missionStories = (content) => content.stories.filter((s) => s.level === 'kg' && s.lang !== 'en');
// the lines to record: the title, every page, the lesson at the end (Hindi), in order
export const missionLines = (content, story) => storyVoiceLines(content).filter((l) => l.story === story.id && l.lang === 'hi' && !/-q\d+_/.test(l.key));
// who read which story: { storyId: { name, day } } (this device)
export const readByAll = () => load(READ_BY_KEY) || {};
export const readBy = (storyId) => readByAll()[storyId] || null;
// the reader's nickname, or (no nickname on this profile) "a big brother or sister"
export const readerName = (name) => (name && name.trim() ? { hi: name.trim(), en: name.trim() } : { hi: 'बड़े भाई-बहन', en: 'your big brother or sister' });

const TIPS = [
  { hi: 'धीरे-धीरे पढ़ो, छोटे बच्चे ध्यान से सुनते हैं।', en: 'Read slowly: little ones listen carefully.' },
  { hi: 'आवाज़ में जान डालो! खुश, हैरान, डरा हुआ…', en: 'Put feeling in your voice: happy, surprised, scared…' },
  { hi: 'हर वाक्य के बाद ज़रा रुको।', en: 'Pause a little after each sentence.' },
  { hi: 'जानवरों की आवाज़ भी निकाल सकते हो!', en: 'You can do the animal sounds too!' },
];

const MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8 21h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>';

// The mission screen: pick a story, then record it line by line.
export function readForScreen(api, { storyId = null } = {}) {
  const { content } = api.state;
  const stories = missionStories(content);
  const who = readByAll();
  const head = (title, onBack) =>
    el('header', { class: 'game-head' }, [
      el('button', { class: 'round-btn', 'aria-label': 'Back', html: ICONS.back, onclick: onBack }),
      el('div', { class: 'head-title' }, [el('span', { class: 'world-name-hi', lang: 'hi', text: title.hi }), el('span', { class: 'world-name-en', text: title.en })]),
      el('span', { class: 'round-spacer' }),
    ]);
  const story = storyId && stories.find((s) => s.id === storyId);
  if (!story) {
    // ---- pick a story ----
    api.app.replaceChildren(
      el('div', { class: 'screen readfor enter' }, [
        head({ hi: 'छोटों के लिए कहानी पढ़ो', en: 'Read to your brother or sister' }, () => api.back()),
        el('main', { class: 'readfor-main' }, [
          el('p', { class: 'readfor-intro' }, [
            el('b', { lang: 'hi', text: 'एक कहानी चुनो और अपनी आवाज़ में पढ़ो।' }),
            el('span', { text: 'Pick a story and read it in your voice. Your little brother or sister will hear it in the story books.' }),
          ]),
          el(
            'div',
            { class: 'readfor-tiles' },
            stories.map((s) => {
              const t = el('button', { class: `readfor-tile${who[s.id] ? ' done' : ''}`, 'aria-label': s.title.en }, [
                el('span', { class: 'readfor-pic', html: pictureForWord(api.word(s.cover)) }),
                el('b', { lang: 'hi', text: s.title.hi }),
                who[s.id] ? el('small', { text: `✓ ${readerName(who[s.id].name).hi}` }) : null,
              ]);
              t.addEventListener('click', () => (api.sfx.feel?.('select'), readForScreen(api, { storyId: s.id })));
              return t;
            }),
          ),
        ]),
      ]),
    );
    api.say('readForHello');
    return;
  }
  // ---- record it, line by line ----
  const lines = missionLines(content, story);
  let at = 0;
  let rec = null;
  let have = new Set();
  const card = el('div', { class: 'readfor-card' });
  const nav = el('div', { class: 'readfor-nav' });
  const bar = el('div', { class: 'readfor-bar' });
  const screen = el('div', { class: 'screen readfor recording enter' }, [head(story.title, () => readForScreen(api)), bar, el('main', { class: 'readfor-main' }, [card, nav])]);
  api.app.replaceChildren(screen);
  const finish = async () => {
    const all = readByAll();
    const name = api.state.profiles?.list?.find((p) => p.id === api.state.profiles.current)?.name || '';
    all[story.id] = { name: name.slice(0, 30), day: new Date().toISOString().slice(0, 10) };
    save(READ_BY_KEY, all);
    card.replaceChildren(el('div', { class: 'readfor-done' }, [el('span', { class: 'readfor-pic', html: pictureForWord(api.word(story.cover)) }), el('b', { lang: 'hi', text: 'शाबाश! कहानी तैयार है।' }), el('span', { text: 'Well done! Now the story plays in your voice.' })]));
    nav.replaceChildren(el('button', { class: 'bubble green', 'aria-label': 'Done', html: ICONS.check, onclick: () => readForScreen(api) }));
    api.sfx.feel?.('reward');
    api.say('readForDone');
  };
  const render = async () => {
    have = new Set(await clips.keys());
    const line = lines[at];
    const done = lines.filter((l) => have.has(l.key)).length;
    bar.style.setProperty('--p', String(done / lines.length));
    bar.replaceChildren(el('span', { text: `${done} / ${lines.length}` }));
    const part = line.key.match(/-(title|moral|\d+)_/)[1];
    const word = /^\d+$/.test(part) ? story.pages[Number(part) - 1].word : story.cover;
    const tip = TIPS[at % TIPS.length];
    card.className = `readfor-card${have.has(line.key) ? ' has' : ''}${rec ? ' on' : ''}`;
    card.replaceChildren(
      el('span', { class: 'readfor-pic', html: pictureForWord(api.word(word)) }),
      el('small', { class: 'readfor-part', text: part === 'title' ? 'शीर्षक · Title' : part === 'moral' ? 'सीख · The lesson' : `पन्ना ${part} · Page ${part}` }),
      el('p', { class: 'readfor-line', lang: 'hi', text: line.text }),
      el('p', { class: 'readfor-tip' }, [el('span', { lang: 'hi', text: `💡 ${tip.hi}` }), el('small', { text: tip.en })]),
    );
    const recBtn = el('button', { class: `round-btn big readfor-mic${rec ? ' on' : ''}`, 'aria-label': rec ? 'Stop' : 'Record', html: rec ? STOP : MIC });
    recBtn.addEventListener('click', () => (rec ? rec.stop() : startRec(line.key)));
    nav.replaceChildren(
      el('button', { class: 'bubble ghost', 'aria-label': 'Previous line', html: ICONS.back, disabled: at === 0 || !!rec, onclick: () => ((at -= 1), render()) }),
      el('button', { class: 'bubble ghost', 'aria-label': 'Listen', text: '▶', disabled: !have.has(line.key) || !!rec, onclick: () => play([{ text: line.text, lang: 'hi', clipKey: line.key }]) }),
      recBtn,
      el('button', { class: 'bubble ghost', 'aria-label': 'Next line', html: ICONS.next, disabled: at >= lines.length - 1 || !!rec, onclick: () => ((at += 1), render()) }),
    );
  };
  const startRec = async (key) => {
    try {
      api.stop?.();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        rec = null;
        await clips.put(key, new Blob(chunks, { type: mr.mimeType || 'audio/webm' }));
        refreshClipKeys(await clips.keys());
        have = new Set(await clips.keys());
        if (lines.every((l) => have.has(l.key))) return finish();
        // on to the next line not recorded yet
        const next = lines.findIndex((l, i) => i > at && !have.has(l.key));
        at = next >= 0 ? next : lines.findIndex((l) => !have.has(l.key));
        await sleep(150);
        render();
      };
      rec = mr;
      mr.start();
      render();
    } catch {
      card.append(el('p', { class: 'readfor-tip', text: 'The microphone is off. A grown-up can allow it in the browser settings.' }));
    }
  };
  render();
  api.say('readForHow');
}

// The "read by …" ribbon on a story a brother or sister recorded
export function readByRibbon(storyId) {
  const r = readBy(storyId);
  if (!r) return null;
  const name = readerName(r.name);
  return el('div', { class: 'read-by' }, [el('span', { 'aria-hidden': 'true', text: '📖' }), el('b', { lang: 'hi', text: `पढ़ा: ${name.hi} ने` }), el('small', { text: `Read by ${name.en}` })]);
}
