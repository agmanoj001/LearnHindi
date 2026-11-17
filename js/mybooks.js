// Make-your-own story (docs/ROADMAP.md 7.8). In the sticker picture the child arranges the stickers,
// presses record and tells what is happening; the picture and their voice become their own book, on a
// "मेरी किताबें" shelf at the top of that world's library. Creating beats consuming, and it is speaking
// practice. The picture is kept with the progress (progress.myBooks); the voice stays on this device
// (the recordings store, like every family recording) and is never sent anywhere.
import { el, sleep, ICONS } from './ui.js';
import { clips } from './storage.js';
import { sceneSvg } from './art-scenes.js';

export const MYBOOKS_MAX = 30;
export const RECORD_MAX_MS = 60000;
export const bookKey = (profileId, id) => `mybook:${profileId}:${id}`;
// a new book: the world and where each sticker stands
export const newBook = (world, stickers, now = Date.now()) => ({
  id: `b${now.toString(36)}`,
  world: world.id,
  made: now,
  stickers: stickers.slice(0, 30).map(({ id, x, y }) => ({ id, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })),
});
export const booksOf = (progress, worldId) => (progress?.myBooks || []).filter((b) => b.world === worldId);
const sizeAt = (y) => 0.62 + (Math.max(0, Math.min(100, y)) / 100) * 0.62;

// the picture of a book: the world's scene with its stickers where the child put them
export function bookPicture(world, book, artOf, { cls = '' } = {}) {
  const pic = el('div', { class: `book-picture ${cls}`.trim(), html: sceneSvg(world.theme) });
  for (const s of book.stickers) {
    const n = el('span', { class: 'book-sticker', html: artOf(s.id), style: { left: `${s.x}%`, top: `${s.y}%`, '--s': sizeAt(s.y).toFixed(3), zIndex: String(Math.round(s.y * 10)) } });
    pic.append(n);
  }
  return pic;
}

const MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8 21h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>';

// Record a story about the picture: tap the microphone, tell it, tap again; listen, keep it or try again.
export function recordBook(api, world, stickers, artOf) {
  const book = newBook(world, stickers);
  const sheet = el('div', { class: 'mybook-sheet', role: 'dialog', 'aria-label': 'Tell a story about your picture' });
  const status = el('p', { class: 'mybook-status' });
  const mic = el('button', { class: 'round-btn big mybook-mic', 'aria-label': 'Record', html: MIC });
  const keep = el('button', { class: 'bubble green', 'aria-label': 'Keep my book', html: ICONS.check, hidden: true });
  const again = el('button', { class: 'bubble ghost', 'aria-label': 'Record again', html: ICONS.replay, hidden: true });
  const close = el('button', { class: 'round-btn small mybook-close', 'aria-label': 'Close', html: ICONS.back });
  sheet.append(
    el('div', { class: 'mybook-card' }, [
      close,
      el('b', { class: 'mybook-title', lang: 'hi', text: 'अपनी कहानी सुनाओ!' }),
      el('small', { text: 'Tell a story about your picture' }),
      bookPicture(world, book, artOf),
      status,
      el('div', { class: 'mybook-actions' }, [again, mic, keep]),
    ]),
  );
  (api.app.querySelector('.screen') || api.app).append(sheet);
  api.say('bookTell');
  let rec = null;
  let blob = null;
  let timer = 0;
  let audio = null;
  const done = () => {
    clearTimeout(timer);
    audio?.pause();
    if (rec?.state === 'recording') rec.stop();
    sheet.remove();
  };
  close.addEventListener('click', done);
  const stopRec = () => rec?.state === 'recording' && rec.stop();
  mic.addEventListener('click', async () => {
    if (rec?.state === 'recording') return stopRec();
    try {
      api.stop?.();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        clearTimeout(timer);
        blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        mic.innerHTML = MIC;
        mic.classList.remove('on');
        sheet.classList.remove('recording');
        keep.hidden = again.hidden = false;
        status.textContent = '';
        audio = new Audio(URL.createObjectURL(blob));
        audio.play().catch(() => {});
      };
      rec.start();
      mic.innerHTML = STOP;
      mic.classList.add('on');
      sheet.classList.add('recording');
      keep.hidden = again.hidden = true;
      status.textContent = '● …';
      timer = setTimeout(stopRec, RECORD_MAX_MS);
    } catch {
      status.textContent = 'The microphone is off. A grown-up can allow it in the browser settings.';
    }
  });
  again.addEventListener('click', () => {
    audio?.pause();
    blob = null;
    keep.hidden = again.hidden = true;
    mic.click();
  });
  keep.addEventListener('click', async () => {
    if (!blob) return;
    audio?.pause();
    await clips.put(bookKey(api.state.profiles?.current || 'main', book.id), blob).catch(() => {});
    api.state.progress = { ...api.state.progress, myBooks: [book, ...(api.state.progress.myBooks || [])].slice(0, MYBOOKS_MAX) };
    api.persistProgress();
    api.sfx.feel?.('reward');
    sheet.classList.add('saved');
    await api.say('bookSaved');
    await sleep(300);
    done();
  });
}

// Play a book: its picture, big, with the child's own voice; the stickers bob while it plays.
export async function playBook(api, world, book, artOf, { onDelete } = {}) {
  const pic = bookPicture(world, book, artOf, { cls: 'big' });
  const del = el('button', { class: 'round-btn small mybook-del', 'aria-label': 'Delete this book', text: '🗑' });
  const close = el('button', { class: 'round-btn small mybook-close', 'aria-label': 'Close', html: ICONS.back });
  const sheet = el('div', { class: 'mybook-sheet playing', role: 'dialog', 'aria-label': 'My book' }, [el('div', { class: 'mybook-card' }, [close, pic, del])]);
  (api.app.querySelector('.screen') || api.app).append(sheet);
  let audio = null;
  const done = () => {
    audio?.pause();
    sheet.remove();
  };
  close.addEventListener('click', done);
  del.addEventListener('click', async () => {
    if (!confirm('Delete this book?')) return;
    done();
    await clips.del(bookKey(api.state.profiles?.current || 'main', book.id)).catch(() => {});
    api.state.progress = { ...api.state.progress, myBooks: (api.state.progress.myBooks || []).filter((b) => b.id !== book.id) };
    api.persistProgress();
    onDelete?.();
  });
  const blob = await clips.get(bookKey(api.state.profiles?.current || 'main', book.id)).catch(() => null);
  if (!blob || !sheet.isConnected) return;
  api.stop?.();
  audio = new Audio(URL.createObjectURL(blob));
  pic.classList.add('telling');
  audio.onended = () => pic.classList.remove('telling');
  audio.play().catch(() => {});
}
