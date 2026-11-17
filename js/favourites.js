// Favourite stories and "read again" (docs/ROADMAP.md 7.2). A heart on every book in the library and on
// the results screen after a story; the favourites wait on the home screen, one tap from reading again.
// Young children love the same story over and over; this lets them find it themselves.
// Kept in the child's progress (progress.favs, newest first), so it is in backups too.
import { el } from './ui.js';
import { storyLang, worldStoryLang, homeWorld } from './curriculum.js';

export const FAV_MAX = 50;
export const HOME_FAVS = 4; // how many wait on the home screen

export const isFav = (progress, id) => (progress?.favs || []).includes(id);
// add a story (to the front) or take it away
export const toggleFav = (favs, id) => ((favs || []).includes(id) ? favs.filter((x) => x !== id) : [id, ...(favs || [])].slice(0, FAV_MAX));
// the favourites that still exist, newest first
export const favStories = (content, progress) => (progress?.favs || []).map((id) => content.stories.find((s) => s.id === id)).filter(Boolean);

// the world whose library a story belongs to (its grade and language), for opening it from the home screen
export function storyWorld(content, settings, story) {
  const lang = storyLang(story);
  return content.worlds.find((w) => w.level === story.level && worldStoryLang(w) === lang && w.subject !== 'math') || content.worlds.find((w) => worldStoryLang(w) === lang && w.subject !== 'math') || homeWorld(content, settings);
}

const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill="currentColor" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';

// The heart button for a story: tap to keep it as a favourite (the guide says so), tap again to let go.
export function heartButton(api, story, { cls = '' } = {}) {
  const b = el('button', { class: `fav-btn ${cls}`.trim(), html: HEART });
  const draw = () => {
    const on = isFav(api.state.progress, story.id);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? `${story.title.en}: a favourite` : `Keep ${story.title.en} as a favourite`);
  };
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    api.state.progress = { ...api.state.progress, favs: toggleFav(api.state.progress.favs, story.id) };
    api.persistProgress();
    draw();
    const on = isFav(api.state.progress, story.id);
    api.sfx.feel?.(on ? 'reward' : 'select');
    if (on) api.say('favAdded');
  });
  draw();
  return b;
}
