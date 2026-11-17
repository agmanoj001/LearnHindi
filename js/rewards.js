// Little rewards that aren't stars (docs/ROADMAP.md 7.5): as the stars add up, the child unlocks new things
// to wear and use: an outfit for every guide, a new home-screen background, a new sound for the buttons.
// Nothing can be bought or lost; what is unlocked follows from the stars, and what is chosen is kept in
// progress.style ({ outfit, backdrop, sound }).

export const REWARDS = [
  { id: 'party-hat', kind: 'outfit', stars: 10, name: { hi: 'पार्टी टोपी', en: 'Party hat' } },
  { id: 'garden', kind: 'backdrop', stars: 20, name: { hi: 'बगीचा', en: 'Garden' } },
  { id: 'bell', kind: 'sound', stars: 30, name: { hi: 'घंटी', en: 'Bell' } },
  { id: 'crown', kind: 'outfit', stars: 45, name: { hi: 'मुकुट', en: 'Crown' } },
  { id: 'ocean', kind: 'backdrop', stars: 60, name: { hi: 'समुद्र', en: 'Ocean' } },
  { id: 'marimba', kind: 'sound', stars: 80, name: { hi: 'लकड़ी की टक', en: 'Wood block' } },
  { id: 'flower', kind: 'outfit', stars: 100, name: { hi: 'फूल', en: 'Flower' } },
  { id: 'space', kind: 'backdrop', stars: 125, name: { hi: 'अंतरिक्ष', en: 'Space' } },
  { id: 'bubble', kind: 'sound', stars: 150, name: { hi: 'बुलबुला', en: 'Bubble' } },
  { id: 'bow', kind: 'outfit', stars: 180, name: { hi: 'रिबन', en: 'Bow' } },
  { id: 'igloo', kind: 'backdrop', stars: 220, name: { hi: 'बर्फ़', en: 'Snow' } },
  { id: 'kalimba', kind: 'sound', stars: 260, name: { hi: 'झनकार', en: 'Chime' } },
  { id: 'garland', kind: 'outfit', stars: 300, name: { hi: 'गेंदे की माला', en: 'Marigold garland' } },
  { id: 'carnival', kind: 'backdrop', stars: 350, name: { hi: 'मेला', en: 'Fair' } },
];
export const REWARD_KINDS = ['outfit', 'backdrop', 'sound'];

export const unlockedRewards = (stars) => REWARDS.filter((r) => stars >= r.stars);
// what this lesson's stars just unlocked
export const newRewards = (before, after) => REWARDS.filter((r) => before < r.stars && after >= r.stars);
// the next one to look forward to
export const nextReward = (stars) => REWARDS.find((r) => stars < r.stars) || null;
// the chosen style, keeping only what is unlocked
export function styleFor(progress, stars) {
  const have = new Set(unlockedRewards(stars).map((r) => r.id));
  const s = progress?.style || {};
  const pick = (kind) => (s[kind] && have.has(s[kind]) && REWARDS.find((r) => r.id === s[kind])?.kind === kind ? s[kind] : null);
  return { outfit: pick('outfit'), backdrop: pick('backdrop'), sound: pick('sound') };
}
