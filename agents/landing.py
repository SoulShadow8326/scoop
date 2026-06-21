import logging
from typing import Any, Dict

from langchain_core.messages import HumanMessage, SystemMessage

from agents.llm import get_fast_model
from agents.nodes import _parse_json
from agents.nodes_v2 import (
    fingerprinting_node,
    emotional_manipulation_node,
    context_integrity_node,
)
from agents.prompts import load_prompt

logger = logging.getLogger("scoop.landing")

LANDING_VALIDATION_PROMPT = load_prompt("landing_validation.md")


def validate_claim(claim: str) -> Dict[str, Any]:
    text = (claim or "").strip()
    if len(text) < 8:
        return {
            "valid": False,
            "reason": "Please enter a real claim or question we can analyze.",
        }

    llm = get_fast_model()
    messages = [
        SystemMessage(content=LANDING_VALIDATION_PROMPT),
        HumanMessage(content=f"Text: {text}"),
    ]
    try:
        res = llm.invoke(messages)
        parsed = _parse_json(res.content)
    except Exception as exc:
        logger.error("Validation call failed: %s", exc)
        return {"valid": True, "reason": ""}

    return {
        "valid": bool(parsed.get("valid", False)),
        "reason": parsed.get("reason", "Please enter a real claim or question we can analyze."),
    }


def preview_analysis(claim: str) -> Dict[str, Any]:
    state: Dict[str, Any] = {
        "claim": claim,
        "screenshot_ref": "",
        "input_metadata": {},
        "raw_evidence": [],
        "source_classifications": [],
    }

    state = fingerprinting_node(state)
    state = emotional_manipulation_node(state)
    state = context_integrity_node(state)

    return {
        "information_dna": state.get("information_dna", {}),
        "emotional_manipulation": state.get("emotional_manipulation", {}),
        "context_integrity": state.get("context_integrity", {}),
    }
