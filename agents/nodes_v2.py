import json
import logging
from typing import Any, Dict, List

from langchain_core.messages import SystemMessage, HumanMessage

from agents.state import GraphState
from agents.llm import get_fast_model, get_reasoning_model
from agents.prompts import (
    FINGERPRINTING_PROMPT,
    CITATION_GRAPH_PROMPT,
    TRUST_PASSPORT_PROMPT,
    EMOTIONAL_MANIPULATION_PROMPT,
    CONTEXT_INTEGRITY_PROMPT,
    EVIDENCE_COLLECTOR_PROMPT,
    PROSECUTOR_PROMPT,
    DEFENSE_PROMPT,
    CROSS_EXAMINER_PROMPT,
    JUDGE_PROMPT,
)

logger = logging.getLogger("scoop.agents.v2")

# ---------------------------------------------------------------------------
# Shared JSON parsing helper (mirrors nodes.py pattern)
# ---------------------------------------------------------------------------

def _parse_json(response_content: str) -> Dict[str, Any]:
    content = response_content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    try:
        return json.loads(content.strip())
    except Exception as e:
        logger.error(f"Failed to parse JSON: {content}")
        return {}


# ---------------------------------------------------------------------------
# 1. Fingerprinting – claim DNA / canonical representation
# ---------------------------------------------------------------------------

def fingerprinting_node(state: GraphState) -> GraphState:
    """Generate an information-DNA fingerprint for the claim."""
    claim = state.get("claim", "")
    if not claim:
        state["information_dna"] = {
            "fingerprint": "",
            "semantic_features": [],
            "canonical_form": "",
        }
        return state

    llm = get_fast_model()
    messages = [
        SystemMessage(content=FINGERPRINTING_PROMPT),
        HumanMessage(content=f"Claim: {claim}"),
    ]
    res = llm.invoke(messages)
    parsed = _parse_json(res.content)
    state["information_dna"] = {
        "fingerprint": parsed.get("fingerprint", ""),
        "semantic_features": parsed.get("semantic_features", []),
        "canonical_form": parsed.get("canonical_form", ""),
    }
    return state


# ---------------------------------------------------------------------------
# 2. Citation Graph – map relationships between evidence sources
# ---------------------------------------------------------------------------

def citation_graph_node(state: GraphState) -> GraphState:
    """Build a citation / provenance graph across the collected evidence."""
    raw_evidence = state.get("raw_evidence", [])
    source_classifications = state.get("source_classifications", [])

    if not raw_evidence:
        state["citation_graph"] = {"nodes": [], "edges": [], "clusters": []}
        return state

    llm = get_fast_model()
    messages = [
        SystemMessage(content=CITATION_GRAPH_PROMPT),
        HumanMessage(
            content=(
                f"Raw Evidence:\n{json.dumps(raw_evidence, default=str)}\n\n"
                f"Source Classifications:\n{json.dumps(source_classifications, default=str)}"
            )
        ),
    ]
    res = llm.invoke(messages)
    parsed = _parse_json(res.content)
    state["citation_graph"] = {
        "nodes": parsed.get("nodes", []),
        "edges": parsed.get("edges", []),
        "clusters": parsed.get("clusters", []),
    }
    return state


# ---------------------------------------------------------------------------
# 3. Trust Passport – per-source trust profile
# ---------------------------------------------------------------------------

def trust_passport_node(state: GraphState) -> GraphState:
    """Build a trust passport for every classified source."""
    source_classifications = state.get("source_classifications", [])

    if not source_classifications:
        state["trust_passports"] = []
        return state

    llm = get_fast_model()
    passports: List[Dict[str, Any]] = []

    for source in source_classifications:
        messages = [
            SystemMessage(content=TRUST_PASSPORT_PROMPT),
            HumanMessage(
                content=f"Source Classification:\n{json.dumps(source, default=str)}"
            ),
        ]
        res = llm.invoke(messages)
        parsed = _parse_json(res.content)
        # Attach the original URL for traceability
        parsed["url"] = source.get("url", "")
        passports.append(parsed)

    state["trust_passports"] = passports
    return state


# ---------------------------------------------------------------------------
# 4. Emotional Manipulation Detection
# ---------------------------------------------------------------------------

def emotional_manipulation_node(state: GraphState) -> GraphState:
    """Score the claim and its supporting evidence for emotional manipulation."""
    claim = state.get("claim", "")
    raw_evidence = state.get("raw_evidence", [])

    evidence_text = "\n".join(
        ev.get("content", "") for ev in raw_evidence
    ) if raw_evidence else "No evidence available."

    llm = get_fast_model()
    messages = [
        SystemMessage(content=EMOTIONAL_MANIPULATION_PROMPT),
        HumanMessage(
            content=(
                f"Claim: {claim}\n\n"
                f"Evidence Content:\n{evidence_text}"
            )
        ),
    ]
    res = llm.invoke(messages)
    parsed = _parse_json(res.content)

    # Ensure consistent schema with sensible defaults
    defaults = {
        "fear": 0.0,
        "anger": 0.0,
        "outrage": 0.0,
        "urgency": 0.0,
        "guilt": 0.0,
        "overall_manipulation_score": 0.0,
        "techniques_detected": [],
    }
    defaults.update(parsed)
    state["emotional_manipulation"] = defaults
    return state


# ---------------------------------------------------------------------------
# 5. Context Integrity – detecting decontextualisation / misframing
# ---------------------------------------------------------------------------

def context_integrity_node(state: GraphState) -> GraphState:
    """Evaluate whether the claim preserves its original context."""
    claim = state.get("claim", "")
    screenshot_ref = state.get("screenshot_ref", "")
    metadata = state.get("metadata", {})

    parts = [f"Claim: {claim}"]
    if screenshot_ref:
        parts.append(f"Screenshot Reference: {screenshot_ref}")
    if metadata:
        parts.append(f"Metadata: {json.dumps(metadata, default=str)}")

    llm = get_fast_model()
    messages = [
        SystemMessage(content=CONTEXT_INTEGRITY_PROMPT),
        HumanMessage(content="\n\n".join(parts)),
    ]
    res = llm.invoke(messages)
    parsed = _parse_json(res.content)

    defaults: Dict[str, Any] = {
        "is_decontextualized": False,
        "is_misquoted": False,
        "is_selectively_edited": False,
        "is_temporally_misleading": False,
        "integrity_score": 1.0,
        "details": "",
    }
    defaults.update(parsed)
    state["context_integrity"] = defaults
    return state


# ---------------------------------------------------------------------------
# 6. Evidence Strength – deterministic weighted scoring (no LLM)
# ---------------------------------------------------------------------------

_SOURCE_TYPE_WEIGHTS: Dict[str, float] = {
    "official_notice": 1.0,
    "government": 0.95,
    "peer_reviewed": 0.9,
    "news": 0.75,
    "expert": 0.7,
    "community": 0.4,
    "social": 0.25,
    "anonymous": 0.1,
}


def evidence_strength_node(state: GraphState) -> GraphState:
    """Compute a deterministic evidence-strength score from source types."""
    source_classifications = state.get("source_classifications", [])

    if not source_classifications:
        state["evidence_strength"] = {
            "score": 0.0,
            "source_weights": [],
            "weighted_sources": 0,
        }
        return state

    source_weights: List[Dict[str, Any]] = []
    total_weight = 0.0
    counted = 0

    for sc in source_classifications:
        src_type = sc.get("source_type", "anonymous")
        weight = _SOURCE_TYPE_WEIGHTS.get(src_type, 0.1)
        source_weights.append({
            "url": sc.get("url", ""),
            "source_type": src_type,
            "weight": weight,
        })
        total_weight += weight
        counted += 1

    weighted_avg = total_weight / counted if counted else 0.0

    state["evidence_strength"] = {
        "score": round(weighted_avg, 4),
        "source_weights": source_weights,
        "weighted_sources": counted,
    }
    return state


# ---------------------------------------------------------------------------
# 7. Evidence Collector – compile courtroom exhibit list
# ---------------------------------------------------------------------------

def evidence_collector_node(state: GraphState) -> GraphState:
    """Compile structured evidence into a numbered exhibit list."""
    structured_evidence = state.get("structured_evidence", {})

    if not structured_evidence:
        state["courtroom_exhibits"] = {"exhibits": [], "summary": "No evidence available."}
        return state

    llm = get_fast_model()
    messages = [
        SystemMessage(content=EVIDENCE_COLLECTOR_PROMPT),
        HumanMessage(
            content=f"Structured Evidence:\n{json.dumps(structured_evidence, default=str)}"
        ),
    ]
    res = llm.invoke(messages)
    parsed = _parse_json(res.content)

    state["courtroom_exhibits"] = {
        "exhibits": parsed.get("exhibits", []),
        "summary": parsed.get("summary", ""),
    }
    return state


# ---------------------------------------------------------------------------
# 8. Prosecutor – argue the claim is FALSE
# ---------------------------------------------------------------------------

def prosecutor_node(state: GraphState) -> GraphState:
    """Build the prosecution case against the claim's veracity."""
    exhibits = state.get("courtroom_exhibits", {})
    claim = state.get("claim", "")

    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=PROSECUTOR_PROMPT),
        HumanMessage(
            content=(
                f"Claim: {claim}\n\n"
                f"Exhibits:\n{json.dumps(exhibits, default=str)}"
            )
        ),
    ]
    res = llm.invoke(messages)
    state["prosecutor_output"] = _parse_json(res.content)
    return state


# ---------------------------------------------------------------------------
# 9. Defense – argue the claim is TRUE / plausible
# ---------------------------------------------------------------------------

def defense_node(state: GraphState) -> GraphState:
    """Build the defense case supporting the claim's veracity."""
    exhibits = state.get("courtroom_exhibits", {})
    claim = state.get("claim", "")

    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=DEFENSE_PROMPT),
        HumanMessage(
            content=(
                f"Claim: {claim}\n\n"
                f"Exhibits:\n{json.dumps(exhibits, default=str)}"
            )
        ),
    ]
    res = llm.invoke(messages)
    state["defense_output"] = _parse_json(res.content)
    return state


# ---------------------------------------------------------------------------
# 10. Cross-Examiner – stress-test both sides
# ---------------------------------------------------------------------------

def cross_examiner_node(state: GraphState) -> GraphState:
    """Cross-examine the prosecution and defense arguments."""
    prosecutor_output = state.get("prosecutor_output", {})
    defense_output = state.get("defense_output", {})

    if not prosecutor_output and not defense_output:
        state["cross_examination"] = {
            "weaknesses_prosecution": [],
            "weaknesses_defense": [],
            "unresolved_questions": [],
        }
        return state

    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=CROSS_EXAMINER_PROMPT),
        HumanMessage(
            content=(
                f"Prosecution Argument:\n{json.dumps(prosecutor_output, default=str)}\n\n"
                f"Defense Argument:\n{json.dumps(defense_output, default=str)}"
            )
        ),
    ]
    res = llm.invoke(messages)
    state["cross_examination"] = _parse_json(res.content)
    return state


# ---------------------------------------------------------------------------
# 11. Judge – issue the final ruling
# ---------------------------------------------------------------------------

def judge_node(state: GraphState) -> GraphState:
    """Weigh all courtroom arguments and issue a ruling."""
    exhibits = state.get("courtroom_exhibits", {})
    prosecutor_output = state.get("prosecutor_output", {})
    defense_output = state.get("defense_output", {})
    cross_examination = state.get("cross_examination", {})

    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=JUDGE_PROMPT),
        HumanMessage(
            content=(
                f"Exhibits:\n{json.dumps(exhibits, default=str)}\n\n"
                f"Prosecution:\n{json.dumps(prosecutor_output, default=str)}\n\n"
                f"Defense:\n{json.dumps(defense_output, default=str)}\n\n"
                f"Cross-Examination:\n{json.dumps(cross_examination, default=str)}"
            )
        ),
    ]
    res = llm.invoke(messages)
    state["judge_ruling"] = _parse_json(res.content)
    return state
