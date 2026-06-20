"""Prompt loader for Scoop V2.

All agent system prompts are stored as Markdown files in the ``prompts/``
directory.  This module reads them once at import time and exposes them as
module-level constants consumed by the node functions.
"""

import os

PROMPTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts")


def load_prompt(filename: str) -> str:
    path = os.path.join(PROMPTS_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()


# ── V1 Core Pipeline Prompts ────────────────────────────────────────
CLASSIFICATION_PROMPT = load_prompt("classification.md")
CLAIM_DECOMPOSITION_PROMPT = load_prompt("claim_decomposition.md")
RETRIEVAL_PLANNING_PROMPT = load_prompt("retrieval_planning.md")
SOURCE_CLASSIFICATION_PROMPT = load_prompt("source_classification.md")
EVIDENCE_STRUCTURING_PROMPT = load_prompt("evidence_structuring.md")
BELIEF_FORMATION_PROMPT = load_prompt("belief_formation.md")
SKEPTIC_PROMPT = load_prompt("skeptic.md")
CONSTITUTION_PROMPT = load_prompt("constitution.md")
ACTION_RECOMMENDATION_PROMPT = load_prompt("action_recommendation.md")
RESPONSE_FORMATTER_PROMPT = load_prompt("response_formatter.md")

# ── V2 New Layer Prompts ────────────────────────────────────────────
FINGERPRINTING_PROMPT = load_prompt("fingerprinting.md")
CITATION_GRAPH_PROMPT = load_prompt("citation_graph.md")
TRUST_PASSPORT_PROMPT = load_prompt("trust_passport.md")
EMOTIONAL_MANIPULATION_PROMPT = load_prompt("emotional_manipulation.md")
CONTEXT_INTEGRITY_PROMPT = load_prompt("context_integrity.md")

# ── V2 Courtroom Prompts ────────────────────────────────────────────
EVIDENCE_COLLECTOR_PROMPT = load_prompt("evidence_collector.md")
PROSECUTOR_PROMPT = load_prompt("prosecutor.md")
DEFENSE_PROMPT = load_prompt("defense.md")
CROSS_EXAMINER_PROMPT = load_prompt("cross_examiner.md")
JUDGE_PROMPT = load_prompt("judge.md")
