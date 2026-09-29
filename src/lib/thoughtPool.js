// "Thinking of your partner" prompt pool. See docs/FEATURES_AND_FLOWS.md §8.
// A prompt uses {p} as a placeholder for "@partnerUsername".

export const THOUGHT_GENERIC = [
  "What's something small {p} did recently that you appreciated?",
  "If {p} had a free afternoon with nothing to do, what do you think they'd choose?",
  "What's one thing you're grateful {p} does for you?",
  "What do you think has been on {p}'s mind today?",
  "What's a memory with {p} you haven't thought about in a while?",
  "What's one way {p} has been there for you lately?",
  "What's something {p} is probably looking forward to this week?",
];

export function fillPartner(text, partnerUsername) {
  return text.replace(/\{p\}/g, "@" + (partnerUsername || "them"));
}

// hobby/favourite come from the current user's OWN private notes about their
// partner — used only to phrase the question, never stored or shared as-is.
export function buildPromptPool({ hobby, favourite } = {}) {
  const pool = [...THOUGHT_GENERIC];
  if (hobby) pool.push(`When did you last ask {p} about ${hobby.toLowerCase()}?`);
  if (favourite) pool.push(`{p} loves ${favourite.toLowerCase()}. When did you last share that together?`);
  return pool;
}

export function pickPrompt(pool, partnerUsername) {
  const raw = pool[Math.floor(Math.random() * pool.length)];
  return fillPartner(raw, partnerUsername);
}
