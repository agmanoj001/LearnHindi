// The user-experience round: voice help per device, readable colours, music that changes and makes room
// for speech, and comics that remember where they were left.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deviceKind, VOICE_SETUP, readable, contrastWithWhite, normalizeSettings, normalizeProgress } from '../js/logic.js';
import { makePhrase, songRound, progOf, musicLevel, MUSIC_STYLES } from '../js/sfx.js';

const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));

test('each kind of device gets its own steps for adding a Hindi voice', () => {
  const ua = {
    ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15',
    android: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/124 Mobile',
    windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124',
    mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1',
    chromeos: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 Chrome/124',
  };
  for (const [kind, s] of Object.entries(ua)) assert.equal(deviceKind(s, 0), kind);
  // an iPad says it is a Mac, but has a touch screen
  assert.equal(deviceKind(ua.mac, 5), 'ios');
  assert.equal(deviceKind('Mozilla/5.0 (X11; Linux x86_64)', 0), 'other');
  for (const k of ['ios', 'android', 'windows', 'mac', 'chromeos', 'other']) assert.ok(VOICE_SETUP[k].device && VOICE_SETUP[k].steps.length > 20, k);
  assert.match(VOICE_SETUP.ios.steps, /Spoken Content/);
  assert.match(VOICE_SETUP.android.steps, /Install voice data/);
});

test('tag colours are darkened just enough for white text (WCAG AA)', () => {
  for (const t of Object.values(content.tags)) {
    const c = readable(t.color);
    assert.ok(contrastWithWhite(c) >= 4.5, `${t.en}: ${c}`);
    // colours that already pass are left alone
    if (contrastWithWhite(t.color) >= 4.5) assert.equal(c, t.color);
  }
});

test('the music: a world keeps its opening phrase, the answers change each time round', () => {
  const style = { root: 60, scale: [0, 2, 4, 7, 9], bpm: 96 };
  const a = songRound(style, 'jungle', 0);
  const b = songRound(style, 'jungle', 1);
  assert.equal(a.length, 128, '16 bars of eighth notes');
  assert.deepEqual(a.slice(0, 32), b.slice(0, 32), 'the same opening every time');
  assert.notDeepEqual(a.slice(64, 96), b.slice(64, 96), 'a new answering phrase');
  assert.notDeepEqual(songRound(style, 'farm', 0).slice(0, 32), a.slice(0, 32), 'each world has its own tune');
  // strong beats sit on the bar's chord, and each phrase comes home to the root
  const prog = progOf(style);
  for (const phrase of [a.slice(0, 32), a.slice(64, 96)]) {
    for (let i = 0; i < 30; i += 4) {
      if (phrase[i] == null) continue;
      const chord = [0, 4, 7].map((x) => (prog[Math.floor(i / 8)] + x) % 12);
      assert.ok(chord.includes((phrase[i] - 60) % 12), `beat ${i}`);
    }
    assert.equal((phrase[30] - 60) % 12, 0);
  }
  assert.equal(makePhrase(style, 5).length, 32);
});

test('every world has its own music style, and lessons sit quieter under speech', () => {
  const themes = new Set(content.worlds.map((w) => w.theme));
  for (const t of themes) assert.ok(MUSIC_STYLES.includes(t), `${t} has a music style`);
  assert.ok(musicLevel('lesson', false) < musicLevel('free', false));
  assert.ok(musicLevel('lesson', true) < musicLevel('free', true));
  assert.ok(musicLevel('lesson', true) < musicLevel('lesson', false) * 0.2, 'speech in a lesson: the music nearly stops');
});

test('comics remember where they were left, and the bigger-text choice is kept', () => {
  const p = normalizeProgress({ comicPos: { 'd-book': { panel: 12, solved: true }, bad: { panel: -3 }, worse: 'x', big: { panel: 500 } } }, content);
  assert.deepEqual(p.comicPos['d-book'], { panel: 12, solved: true });
  assert.equal(p.comicPos.bad, undefined);
  assert.equal(p.comicPos.worse, undefined);
  assert.equal(p.comicPos.big.panel, 99);
  assert.deepEqual(normalizeProgress(null, content).comicPos, {});
  assert.equal(normalizeSettings({ bigText: true }, content).bigText, true);
  assert.equal(normalizeSettings({ bigText: 'yes' }, content).bigText, false);
});
