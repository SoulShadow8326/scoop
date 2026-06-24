// Sample analyses shaped like the Scoop backend /analyze response, used for the
// demo experience and as a graceful fallback when no backend is reachable.

export const sampleAnalysis = {
  claim_id: 'demo-reneet',
  claim: 're-neet leaked again ?',
  source_label: 'Direct message screenshot',
  thumb: null,
  classification: { category: 'Exam rumor', risk_level: 'high', time_sensitivity: 'high' },
  confidence: {
    score: 31,
    components: {
      authority: 24,
      freshness: 38,
      independence: 18,
      evidence_agreement: 22,
      historical_trust: 30,
      context_integrity: 10,
      manipulation_inverse: 36,
      evidence_strength: 28,
    },
  },
  context_integrity: {
    integrity_score: 10,
    is_decontextualized: true,
    cropped_context: true,
    missing_source: true,
    missing_date: true,
    is_temporally_misleading: true,
    is_misquoted: false,
    is_selectively_edited: false,
    details: 'The screenshot is cropped, undated, and detached from the original conversation.',
  },
  emotional_manipulation: {
    fear: 72,
    anger: 41,
    outrage: 58,
    manipulation_risk: 76,
    emotional_resistance: 24,
    techniques_detected: ['fear_appeal', 'urgency_framing'],
  },
  evidence_strength: { score: 28, weighted_sources: 1 },
  trust_passport: {
    sources: [
      {
        url: 'mocksnew.example.com',
        reliability_trend: 'declining',
        authority_score: 22,
        primary_source_usage: 14,
        evidence_density: 48,
        retraction_history: 31,
        emotional_language_tendency: 70,
        transparency_score: 26,
      },
    ],
  },
  citation_graph: {
    origin_candidate: 'anon-telegram-channel',
    independent_sources: [],
    amplified_sources: ['mocksnew.example.com'],
    copied_sources: ['repost-bot-04'],
    independently_verified: false,
    nodes: [{ id: 'origin' }, { id: 'amp' }],
  },
  reasoning: {
    judge: {
      ruling: 'No credible primary source supports a re-leak of the exam. The claim traces to a single anonymous channel and an undated, cropped screenshot.',
      confidence_assessment: 'Low. The evidence is thin and emotionally framed.',
      recommended_action: 'Wait for an official notice from the examination authority before sharing.',
      key_factors: ['No official confirmation', 'Single anonymous origin', 'Cropped, undated screenshot'],
      dissenting_considerations: ['Past leaks have occurred, so the topic is plausible in isolation'],
    },
  },
  recommendations: [
    'Wait for an official source before acting on this claim.',
    'Do not forward the screenshot until it is independently verified.',
    'Check the examination authority website for any real notice.',
  ],
  flags: [
    { key: 'unreliable_source', label: 'Unreliable source', detail: 'Traces to a single anonymous channel with a declining trust record.' },
    { key: 'cropped', label: 'Cropped Screenshot', detail: 'The image is cut off, hiding the surrounding conversation.' },
    { key: 'no_context', label: 'No Background/Context', detail: 'No date, sender, or original thread is attached to the claim.' },
  ],
};

export const trending = [
  {
    id: 't1',
    verified: true,
    title: 'Hi okay cool ya iits shit reneet omg oh no new date',
    meta: 'Trending Fake AI',
  },
  {
    id: 't2',
    verified: true,
    title: 'Leaked memo says finals move online next week, share fast',
    meta: 'Trending Fake AI',
  },
  {
    id: 't3',
    verified: true,
    title: 'Viral clip claims water supply cut for three days citywide',
    meta: 'Trending Fake AI',
  },
];
