// Festivals and seasons that arrive on their day (docs/ROADMAP.md 7.11). Near Diwali, Holi, Rakhi, Eid,
// Christmas, Lohri, Pongal and Onam the home screen puts up decorations, offers the festival's story and
// gives a special sticker, once a year. It goes by the device's date, so it works offline.
//
// Most of these follow the moon, so their dates are listed year by year (from panchang and holiday lists;
// sources sometimes differ by a day, which the window of days around each date covers). Add the next years
// here when they are known; a festival with no date for a year simply doesn't come that year.
import { el } from './ui.js';

export const FEST_BEFORE = 4; // days before the festival the decorations go up
export const FEST_AFTER = 2; // and days after that they stay

// story: the Kindergarten story; more: a longer one offered from Grade 1 up (roadmap 9.7)
export const FESTIVALS = [
  { id: 'diwali', name: { hi: 'दीपावली', en: 'Diwali' }, story: 'ram-diwali', more: 'ram-ghar-aaye', sticker: 'lamp', dates: { 2026: '11-08', 2027: '10-29', 2028: '10-17', 2029: '11-05', 2030: '10-26' } },
  { id: 'holi', name: { hi: 'होली', en: 'Holi' }, story: 'k2-holi', sticker: 'gulal', dates: { 2026: '03-04', 2027: '03-22', 2028: '03-11', 2029: '03-01', 2030: '03-20' } },
  { id: 'rakhi', name: { hi: 'रक्षाबंधन', en: 'Raksha Bandhan' }, story: 'k2-rakhi', sticker: 'rakhi', dates: { 2026: '08-28', 2027: '08-17', 2028: '08-05', 2029: '08-23', 2030: '08-13' } },
  { id: 'eid', name: { hi: 'ईद', en: 'Eid' }, story: 'k3-eid', more: 'fest-idgah', sticker: 'eidmoon', dates: { 2026: '03-20', 2027: '03-10', 2028: '02-27', 2029: '02-14', 2030: '02-04' } },
  { id: 'christmas', name: { hi: 'क्रिसमस', en: 'Christmas' }, story: 'k3-christmas', more: 'fest-pahad-christmas', sticker: 'xmastree', every: '12-25' },
  { id: 'lohri', name: { hi: 'लोहड़ी', en: 'Lohri' }, story: 'k3-lohri', more: 'fest-lohri', sticker: 'bonfire', every: '01-13' },
  { id: 'pongal', name: { hi: 'पोंगल', en: 'Pongal' }, story: 'k3-pongal', more: 'fest-pongal', sticker: 'pongalpot', every: '01-14' },
  { id: 'onam', name: { hi: 'ओणम', en: 'Onam' }, story: 'k3-onam', more: 'fest-mahabali', sticker: 'pookalam', dates: { 2026: '08-26', 2027: '09-12', 2028: '09-01' } },
  // Guru Nanak Jayanti, on Kartik Purnima (the full moon about sixteen days after Diwali)
  { id: 'gurpurab', name: { hi: 'गुरुपर्व', en: 'Guru Nanak Jayanti' }, story: 'k3-gurpurab', more: 'fest-sacha-sauda', sticker: 'roti', dates: { 2026: '11-24', 2027: '11-14', 2028: '11-02', 2029: '11-21', 2030: '11-10' } },
];
// The festival's story for this child: the short one in Toddler and Kindergarten, the longer one after.
export function festStory(f, level) {
  return f.more && !['toddler', 'kg'].includes(level) ? f.more : f.story;
}
// the spoken greeting for each (content.phrases)
export const festPhrase = (id) => `fest_${id}`;

// the day of a festival in a year, or null
export function festivalDay(f, year) {
  const md = f.every || f.dates?.[year];
  return md ? new Date(year, Number(md.slice(0, 2)) - 1, Number(md.slice(3, 5))) : null;
}

// The festival near `now` (the nearest one if two are close, like Lohri and Pongal), or null.
export function festivalNow(now = Date.now()) {
  const today = new Date(now);
  const day0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  let best = null;
  for (const f of FESTIVALS)
    for (const y of [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1]) {
      const d = festivalDay(f, y);
      if (!d) continue;
      const diff = Math.round((d.getTime() - day0) / 86400000); // days until the festival (negative: since)
      if (diff > FEST_BEFORE || diff < -FEST_AFTER) continue;
      if (!best || Math.abs(diff) < Math.abs(best.diff)) best = { festival: f, diff, year: y };
    }
  return best;
}

// the sticker's place in progress.festStickers: "diwali-2026"
export const festKey = (id, year) => `${id}-${year}`;

const bunting = (art, n = 7) =>
  el('div', { class: 'fest-bunting', 'aria-hidden': 'true' }, [
    el('div', { class: 'fest-string', html: '<svg viewBox="0 0 400 40" preserveAspectRatio="none"><path d="M0 6 Q200 44 400 6" fill="none" stroke="#C9A227" stroke-width="2.5"/></svg>' }),
    ...Array.from({ length: n }, (_, i) => el('span', { class: 'fest-flag', style: { left: `${(i + 0.5) * (100 / n)}%`, top: `${6 + Math.sin((Math.PI * (i + 0.5)) / n) * 22}px`, animationDelay: `${(i % 3) * 0.3}s` }, html: art })),
  ]);

// The home screen's festival banner: decorations, the greeting, the festival's story, and (once a year)
// the festival's sticker. Returns null when no festival is near.
export function festivalBanner(api, { now = Date.now(), openStory, art } = {}) {
  const near = festivalNow(now);
  if (!near) return null;
  const { festival: f, year, diff } = near;
  const key = festKey(f.id, year);
  const got = !!api.state.progress.festStickers?.[key];
  const sticker = el('span', { class: `fest-sticker${got ? ' got' : ' new'}`, html: art(f.sticker) });
  const when = diff > 0 ? { hi: `${diff} दिन बाद ${f.name.hi}!`, en: `${f.name.en} in ${diff} day${diff > 1 ? 's' : ''}!` } : { hi: `${f.name.hi} मुबारक!`, en: `Happy ${f.name.en}!` };
  const read = el('button', { class: 'bubble fest-read', 'aria-label': `Read the ${f.name.en} story` }, [el('span', { 'aria-hidden': 'true', text: '📖' }), el('b', { lang: 'hi', text: 'त्योहार की कहानी' })]);
  read.addEventListener('click', () => openStory(festStory(f, api.state.settings.level), read));
  const banner = el('section', { class: `fest-banner fest-${f.id}`, 'aria-label': f.name.en }, [
    bunting(art(f.sticker)),
    el('div', { class: 'fest-body' }, [sticker, el('div', { class: 'fest-text' }, [el('b', { lang: 'hi', text: when.hi }), el('small', { text: when.en })]), read]),
  ]);
  // the sticker, once a year
  if (!got) {
    api.state.progress = { ...api.state.progress, festStickers: { ...(api.state.progress.festStickers || {}), [key]: f.sticker } };
    api.persistProgress();
    setTimeout(async () => {
      if (!banner.isConnected) return;
      api.sfx.feel?.('reward');
      await api.say(festPhrase(f.id));
      if (banner.isConnected) await api.say('festSticker');
    }, 900);
  } else setTimeout(() => banner.isConnected && api.say(festPhrase(f.id)), 900);
  return banner;
}
