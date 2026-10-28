// Everything personal (settings, progress, the special-vehicle photo, family voice recordings)
// stays in this browser only: localStorage + IndexedDB. Nothing is ever uploaded.

export const KEYS = {
  settings: 'vt.settings',
  progress: 'vt.progress',
  special: 'vt.special',
};

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

export const clips = {
  put: (key, blob) => tx('readwrite', (s) => s.put(blob, key)),
  get: (key) => tx('readonly', (s) => s.get(key)),
  keys: () => tx('readonly', (s) => s.getAllKeys()).catch(() => []),
  clear: () => tx('readwrite', (s) => s.clear()),
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
