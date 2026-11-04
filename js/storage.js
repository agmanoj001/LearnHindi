// Everything personal (settings, progress, the special-vehicle photo, family voice recordings)
// stays in this browser only: localStorage + IndexedDB. Nothing is ever uploaded.

export const KEYS = {
  settings: 'vt.settings',
  progress: 'vt.progress',
  special: 'vt.special',
  profiles: 'vt.profiles',
};

// ---- children's profiles ----
// Each child has their own settings and progress; voice recordings and the special photo are shared
// by the family. The first child keeps the original keys, so existing saves carry on unchanged.
// A profile is just a nickname (optional) and a guide character, stored on this device only.

export const MAX_PROFILES = 4;

export function normalizeProfiles(saved, mascots = []) {
  const list = Array.isArray(saved?.list) ? saved.list.filter((p) => p && typeof p.id === 'string' && /^p\d+$/.test(p.id)).slice(0, MAX_PROFILES) : [];
  const clean = list.map((p) => ({ id: p.id, name: typeof p.name === 'string' ? p.name.slice(0, 20) : '', avatar: mascots.includes(p.avatar) ? p.avatar : mascots[0] || 'gappu' }));
  if (!clean.some((p) => p.id === 'p1')) clean.unshift({ id: 'p1', name: '', avatar: mascots[0] || 'gappu' });
  const current = clean.some((p) => p.id === saved?.current) ? saved.current : 'p1';
  return { list: clean.slice(0, MAX_PROFILES), current };
}

export function profileKey(base, profileId) {
  return !profileId || profileId === 'p1' ? base : `${base}:${profileId}`;
}

export function addProfile(profiles, avatar) {
  if (profiles.list.length >= MAX_PROFILES) return profiles;
  let n = 1;
  while (profiles.list.some((p) => p.id === `p${n}`)) n++;
  return { ...profiles, list: [...profiles.list, { id: `p${n}`, name: '', avatar }] };
}

export function removeProfile(profiles, id) {
  if (id === 'p1') return profiles;
  const list = profiles.list.filter((p) => p.id !== id);
  return { list, current: profiles.current === id ? 'p1' : profiles.current };
}

export function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export function save(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // storage full or blocked (private mode); the app keeps working in memory
  }
}

// ---- IndexedDB for audio clips (Blobs are too big for localStorage) ----

let dbPromise = null;
function db() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') return reject(new Error('no IndexedDB'));
      const req = indexedDB.open('vehicle-town', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('clips');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function tx(mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction('clips', mode);
    const result = fn(t.objectStore('clips'));
    t.oncomplete = () => resolve(result.result ?? result);
    t.onerror = () => reject(t.error);
  });
}

// Ask the browser to keep progress and recordings even when the device runs low on space.
// Chrome and Safari decide quietly; Firefox may ask, so this runs only when a recording is saved
// or when the app was opened from the home screen.
export function keepStorage() {
  try {
    return navigator.storage?.persist?.().catch(() => false) ?? Promise.resolve(false);
  } catch {
    return Promise.resolve(false);
  }
}

export const clips = {
  put: (key, blob) => (keepStorage(), tx('readwrite', (s) => s.put(blob, key))),
  get: (key) => tx('readonly', (s) => s.get(key)),
  keys: () => tx('readonly', (s) => s.getAllKeys()).catch(() => []),
  clear: () => tx('readwrite', (s) => s.clear()),
  del: (key) => tx('readwrite', (s) => s.delete(key)),
};

// Shrink a picked photo so it fits comfortably in localStorage.
export function resizeImage(file, size = 320) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, size / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('not an image'));
    };
    img.src = url;
  });
}
