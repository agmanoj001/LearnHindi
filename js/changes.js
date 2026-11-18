// What's new (roadmap 8.6): a short changelog for families, in changes.json, newest first. Each entry is one
// version of the app (its service-worker version), with a headline and a few lines in Hindi and English.
// When a new version takes over, the refresh bar reads the NEW changes.json (the new service worker serves
// it), so a family sees what changed before they refresh.

export async function loadChanges() {
  try {
    const r = await fetch('changes.json', { cache: 'no-cache' });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data?.changes) ? data.changes : [];
  } catch {
    return [];
  }
}

// The entries a family hasn't seen: everything newer than the version they were running. If that version
// isn't in the list (a first install, or a very old one), just the newest entry.
export function changesSince(changes, running) {
  const at = changes.findIndex((c) => c.version === running);
  if (at === 0) return [];
  return at > 0 ? changes.slice(0, at) : changes.slice(0, 1);
}

export function changeDate(iso, lang = 'en') {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  } catch {
    return iso;
  }
}
