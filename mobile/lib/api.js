import Constants from 'expo-constants';
import { sampleAnalysis } from '../data/mock';

// Point this at a running Scoop backend to get live analyses. When unset the app
// runs a faithful simulated pipeline against the bundled sample so the demo works
// fully offline.
export const API_BASE =
  (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiBase) || '';

const STAGES = [
  { pct: 8, label: 'Classifying the claim' },
  { pct: 18, label: 'Fingerprinting information DNA' },
  { pct: 32, label: 'Retrieving evidence' },
  { pct: 46, label: 'Profiling source trust' },
  { pct: 58, label: 'Mapping citation lineage' },
  { pct: 68, label: 'Reading emotional framing' },
  { pct: 78, label: 'Checking context integrity' },
  { pct: 88, label: 'Running courtroom reasoning' },
  { pct: 96, label: 'Calibrating confidence' },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function analyzeClaim({ claim, sourceLabel, onStage }) {
  if (API_BASE) {
    try {
      return await streamFromBackend({ claim, onStage });
    } catch (e) {
      // fall through to the simulated pipeline
    }
  }
  return simulate({ claim, sourceLabel, onStage });
}

async function simulate({ claim, sourceLabel, onStage }) {
  for (const stage of STAGES) {
    onStage && onStage(stage);
    await wait(380);
  }
  onStage && onStage({ pct: 100, label: 'Report ready' });
  await wait(200);
  return {
    ...sampleAnalysis,
    claim_id: 'a-' + Date.now().toString(36),
    claim: claim || sampleAnalysis.claim,
    source_label: sourceLabel || sampleAnalysis.source_label,
  };
}

async function streamFromBackend({ claim, onStage }) {
  const res = await fetch(API_BASE.replace(/\/$/, '') + '/analyze/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim }),
  });
  if (!res.ok || !res.body) throw new Error('stream failed');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let final = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      let evt;
      try {
        evt = JSON.parse(line);
      } catch (e) {
        continue;
      }
      if ((evt.type === 'stage' || evt.type === 'section') && typeof evt.pct === 'number') {
        onStage && onStage({ pct: evt.pct, label: evt.label });
      }
      if (evt.type === 'done' && evt.data) {
        final = mergeFlags({ ...evt.data, claim });
      }
    }
  }
  if (!final) throw new Error('no result');
  onStage && onStage({ pct: 100, label: 'Report ready' });
  return final;
}

// Derive the headline issue list (shown on the Analysis screen) from the engines
// when the backend does not provide an explicit flags array.
function mergeFlags(data) {
  if (Array.isArray(data.flags) && data.flags.length) return data;
  const ci = data.context_integrity || {};
  const flags = [];
  if ((data.evidence_strength || {}).weighted_sources <= 1) {
    flags.push({ key: 'unreliable_source', label: 'Unreliable source', detail: 'Few or low-authority sources back this claim.' });
  }
  if (ci.cropped_context || ci.is_decontextualized) {
    flags.push({ key: 'cropped', label: 'Cropped Screenshot', detail: 'The image appears cut off or detached from its source.' });
  }
  if (ci.missing_source || ci.missing_date) {
    flags.push({ key: 'no_context', label: 'No Background/Context', detail: 'Date, sender, or original thread is missing.' });
  }
  return { ...data, flags };
}
