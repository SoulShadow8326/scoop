from typing import TypedDict, Dict, Any, List, Optional


class GraphState(TypedDict):
    """Full pipeline state for Scoop V2.

    Contains all intermediate and final outputs from every agent in the
    pipeline.  Keys are intentionally named so they do NOT collide with
    LangGraph node names (node names use an ``_agent`` / ``_step`` suffix).
    """

    # ── Input ────────────────────────────────────────────────────────
    claim_id: str
    claim: str
    screenshot_ref: str          # optional file reference, "" if empty
    input_metadata: Dict[str, Any]

    # ── V1 Core Pipeline ─────────────────────────────────────────────
    classification: Dict[str, Any]
    decomposition: Dict[str, Any]
    search_queries: List[str]
    raw_evidence: List[Dict[str, Any]]
    source_classifications: List[Dict[str, Any]]
    structured_evidence: Dict[str, Any]
    evidence_graph: Dict[str, Any]
    belief: Dict[str, Any]
    skeptic: Dict[str, Any]
    constitution: Dict[str, Any]
    recommendations: List[str]

    # ── V2 New Layers ────────────────────────────────────────────────
    # Information DNA / fingerprinting
    information_dna: Dict[str, Any]

    # Citation graph
    citation_graph: Dict[str, Any]

    # Trust passports (list, one per source)
    trust_passports: List[Dict[str, Any]]

    # Emotional manipulation analysis
    emotional_manipulation: Dict[str, Any]

    # Context integrity analysis
    context_integrity: Dict[str, Any]

    # Evidence strength (deterministic)
    evidence_strength: Dict[str, Any]

    # Courtroom reasoning
    courtroom_exhibits: Dict[str, Any]
    prosecutor_output: Dict[str, Any]
    defense_output: Dict[str, Any]
    cross_examination: Dict[str, Any]
    judge_ruling: Dict[str, Any]

    # ── Scores (deterministic) ───────────────────────────────────────
    confidence: Dict[str, Any]

    # ── Final ────────────────────────────────────────────────────────
    final_response: Dict[str, Any]
    errors: List[str]
