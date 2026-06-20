"""V1 core pipeline nodes for Scoop, updated for V2 state compatibility.

These nodes implement the original Scoop pipeline:
  classification → decomposition → retrieval planning → evidence retrieval →
  source classification → evidence structuring → evidence graph builder →
  belief formation → skeptic → constitution → confidence engine →
  action recommendation → response formatter
"""

import json
import logging
from typing import Any, Dict, List

from langchain_core.messages import HumanMessage, SystemMessage

from agents.llm import get_fast_model, get_reasoning_model
from agents.prompts import (
    ACTION_RECOMMENDATION_PROMPT,
    BELIEF_FORMATION_PROMPT,
    CLAIM_DECOMPOSITION_PROMPT,
    CLASSIFICATION_PROMPT,
    CONSTITUTION_PROMPT,
    EVIDENCE_STRUCTURING_PROMPT,
    RESPONSE_FORMATTER_PROMPT,
    RETRIEVAL_PLANNING_PROMPT,
    SKEPTIC_PROMPT,
    SOURCE_CLASSIFICATION_PROMPT,
)
from agents.state import GraphState

logger = logging.getLogger("scoop.agents")


# ── Helpers ──────────────────────────────────────────────────────────

def _parse_json(response_content: str) -> Dict[str, Any]:
    """Extract JSON from an LLM response that may be wrapped in markdown."""
    content = response_content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    try:
        return json.loads(content.strip())
    except Exception:
        logger.error("Failed to parse JSON: %s", content[:200])
        return {}


# ── V1 Core Nodes ────────────────────────────────────────────────────

def classification_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    messages = [
        SystemMessage(content=CLASSIFICATION_PROMPT),
        HumanMessage(content=f"Claim: {state['claim']}"),
    ]
    res = llm.invoke(messages)
    state["classification"] = _parse_json(res.content)
    return state


def claim_decomposition_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    messages = [
        SystemMessage(content=CLAIM_DECOMPOSITION_PROMPT),
        HumanMessage(content=f"Claim: {state['claim']}"),
    ]
    res = llm.invoke(messages)
    state["decomposition"] = _parse_json(res.content)
    return state


def retrieval_planning_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    messages = [
        SystemMessage(content=RETRIEVAL_PLANNING_PROMPT),
        HumanMessage(
            content=f"Decomposed claim: {json.dumps(state.get('decomposition', {}))}"
        ),
    ]
    res = llm.invoke(messages)
    parsed = _parse_json(res.content)
    state["search_queries"] = parsed.get("search_queries", [])
    return state


def evidence_retrieval_node(state: GraphState) -> GraphState:
    """Mock evidence retrieval – abstraction layer for future search providers."""
    queries = state.get("search_queries", [])
    evidence: List[Dict[str, Any]] = []
    for q in queries:
        evidence.append(
            {
                "source": "MockNews",
                "content": f"Mock article about '{q}'.",
                "url": "https://mocknews.example.com/article",
            }
        )
    if not evidence:
        evidence.append(
            {
                "source": "MockOfficial",
                "content": "No specific queries were generated, generic mock content.",
                "url": "https://official.example.gov/mock",
            }
        )
    state["raw_evidence"] = evidence
    return state


def source_classification_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    classifications: List[Dict[str, Any]] = []
    for ev in state.get("raw_evidence", []):
        messages = [
            SystemMessage(content=SOURCE_CLASSIFICATION_PROMPT),
            HumanMessage(content=f"Source: {ev['source']}\nURL: {ev['url']}"),
        ]
        res = llm.invoke(messages)
        parsed = _parse_json(res.content)
        parsed["url"] = ev["url"]
        parsed["source_name"] = ev.get("source", "")
        classifications.append(parsed)
    state["source_classifications"] = classifications
    return state


def evidence_structuring_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    messages = [
        SystemMessage(content=EVIDENCE_STRUCTURING_PROMPT),
        HumanMessage(
            content=(
                f"Primary Claim: {state['claim']}\n"
                f"Evidence: {json.dumps(state.get('raw_evidence', []))}"
            )
        ),
    ]
    res = llm.invoke(messages)
    state["structured_evidence"] = _parse_json(res.content)
    return state


def evidence_graph_builder_node(state: GraphState) -> GraphState:
    """Deterministic evidence graph builder – no LLM."""
    raw = state.get("raw_evidence", [])
    sources = [ev.get("source", "") for ev in raw]
    unique = set(sources)

    # Simple duplicate detection
    duplicates: List[str] = []
    seen_content: Dict[str, str] = {}
    for ev in raw:
        content_key = ev.get("content", "")[:100]
        if content_key in seen_content:
            duplicates.append(
                f"Duplicate content between '{ev.get('source')}' and "
                f"'{seen_content[content_key]}'"
            )
        else:
            seen_content[content_key] = ev.get("source", "")

    state["evidence_graph"] = {
        "nodes": len(raw),
        "independent_sources": len(unique),
        "duplicate_alerts": duplicates,
        "source_names": list(unique),
    }
    return state


def belief_formation_node(state: GraphState) -> GraphState:
    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=BELIEF_FORMATION_PROMPT),
        HumanMessage(
            content=(
                f"Structured Evidence: {json.dumps(state.get('structured_evidence', {}))}\n"
                f"Judge Ruling: {json.dumps(state.get('judge_ruling', {}))}"
            )
        ),
    ]
    res = llm.invoke(messages)
    state["belief"] = _parse_json(res.content)
    return state


def skeptic_node(state: GraphState) -> GraphState:
    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=SKEPTIC_PROMPT),
        HumanMessage(
            content=(
                f"Evidence: {json.dumps(state.get('structured_evidence', {}))}\n"
                f"Beliefs: {json.dumps(state.get('belief', {}))}\n"
                f"Cross Examination: {json.dumps(state.get('cross_examination', {}))}"
            )
        ),
    ]
    res = llm.invoke(messages)
    state["skeptic"] = _parse_json(res.content)
    return state


def constitution_node(state: GraphState) -> GraphState:
    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=CONSTITUTION_PROMPT),
        HumanMessage(
            content=(
                f"Beliefs: {json.dumps(state.get('belief', {}))}\n"
                f"Skeptic: {json.dumps(state.get('skeptic', {}))}\n"
                f"Manipulation Risk: {json.dumps(state.get('emotional_manipulation', {}))}"
            )
        ),
    ]
    res = llm.invoke(messages)
    state["constitution"] = _parse_json(res.content)
    return state


def confidence_engine_node(state: GraphState) -> GraphState:
    """Deterministic confidence calculation – V2 expanded formula.

    confidence = 0.20 * authority
               + 0.15 * freshness
               + 0.15 * independence
               + 0.15 * evidence_agreement
               + 0.10 * historical_trust
               + 0.10 * context_integrity
               + 0.10 * (100 - manipulation_risk)
               + 0.05 * evidence_strength

    Also computes separate integrity_score, manipulation_risk_score,
    and evidence_strength_score.
    """
    # Source-level averages
    avg_authority = 50.0
    avg_freshness = 50.0
    avg_independence = 50.0

    sources = state.get("source_classifications", [])
    if sources:
        avg_authority = sum(s.get("authority", 50) for s in sources) / len(sources)
        avg_freshness = sum(s.get("freshness", 50) for s in sources) / len(sources)
        avg_independence = sum(s.get("independence", 50) for s in sources) / len(sources)

    # Evidence agreement
    evidence_agreement = 50.0
    struct_ev = state.get("structured_evidence", {})
    supp = len(struct_ev.get("supporting", []))
    cont = len(struct_ev.get("contradicting", []))
    total = supp + cont
    if total > 0:
        evidence_agreement = (supp / total) * 100

    # Historical trust (baseline; adjusted by feedback calibration later)
    historical_trust = 50.0

    # Context integrity
    ci = state.get("context_integrity", {})
    context_integrity_val = float(ci.get("integrity_score", 50))

    # Manipulation risk
    em = state.get("emotional_manipulation", {})
    manipulation_risk_val = float(em.get("manipulation_risk", 50))

    # Evidence strength (score is 0-1 weighted average, normalize to 0-100)
    es = state.get("evidence_strength", {})
    evidence_strength_val = float(es.get("score", 0.5)) * 100

    # Main confidence score
    confidence_score = (
        0.20 * avg_authority
        + 0.15 * avg_freshness
        + 0.15 * avg_independence
        + 0.15 * evidence_agreement
        + 0.10 * historical_trust
        + 0.10 * context_integrity_val
        + 0.10 * (100 - manipulation_risk_val)
        + 0.05 * evidence_strength_val
    )

    state["confidence"] = {
        "score": round(confidence_score, 2),
        "integrity_score": round(context_integrity_val, 2),
        "manipulation_risk_score": round(manipulation_risk_val, 2),
        "evidence_strength_score": round(evidence_strength_val, 2),
        "components": {
            "authority": round(avg_authority, 2),
            "freshness": round(avg_freshness, 2),
            "independence": round(avg_independence, 2),
            "evidence_agreement": round(evidence_agreement, 2),
            "historical_trust": round(historical_trust, 2),
            "context_integrity": round(context_integrity_val, 2),
            "manipulation_inverse": round(100 - manipulation_risk_val, 2),
            "evidence_strength": round(evidence_strength_val, 2),
        },
    }
    return state


def action_recommendation_node(state: GraphState) -> GraphState:
    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=ACTION_RECOMMENDATION_PROMPT),
        HumanMessage(
            content=(
                f"Risk: {json.dumps(state.get('classification', {}))}\n"
                f"Confidence: {json.dumps(state.get('confidence', {}))}\n"
                f"Evidence: {json.dumps(state.get('structured_evidence', {}))}\n"
                f"Judge Ruling: {json.dumps(state.get('judge_ruling', {}))}"
            )
        ),
    ]
    res = llm.invoke(messages)
    parsed = _parse_json(res.content)
    state["recommendations"] = parsed.get("recommendations", [])
    return state


def response_formatter_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    messages = [
        SystemMessage(content=RESPONSE_FORMATTER_PROMPT),
        HumanMessage(
            content=(
                f"Beliefs: {json.dumps(state.get('belief', {}))}\n"
                f"Confidence: {json.dumps(state.get('confidence', {}))}\n"
                f"Recommendations: {json.dumps(state.get('recommendations', []))}\n"
                f"Emotional Manipulation: {json.dumps(state.get('emotional_manipulation', {}))}\n"
                f"Context Integrity: {json.dumps(state.get('context_integrity', {}))}"
            )
        ),
    ]
    res = llm.invoke(messages)
    state["final_response"] = _parse_json(res.content)
    return state
