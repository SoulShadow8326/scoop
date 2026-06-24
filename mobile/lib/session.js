// In-memory handoff for the active analysis as the user moves between the
// Analysis and Details screens within a single session.
const cache = new Map();

export function putAnalysis(result) {
  if (result && result.claim_id) cache.set(result.claim_id, result);
}

export function getAnalysis(id) {
  return cache.get(id) || null;
}
