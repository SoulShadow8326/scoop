import json
import logging
from typing import Any, Dict, List
from langchain_core.messages import SystemMessage, HumanMessage
from agents.state import GraphState
from agents.prompts import *
from agents.llm import get_fast_model, get_reasoning_model

logger = logging.getLogger("scoop.agents")

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

def classification_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    messages = [
        SystemMessage(content=CLASSIFICATION_PROMPT),
        HumanMessage(content=f"Claim: {state['claim']}")
    ]
    res = llm.invoke(messages)
    state["classification"] = _parse_json(res.content)
    return state

def claim_decomposition_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    messages = [
        SystemMessage(content=CLAIM_DECOMPOSITION_PROMPT),
        HumanMessage(content=f"Claim: {state['claim']}")
    ]
    res = llm.invoke(messages)
    state["decomposition"] = _parse_json(res.content)
    return state

def retrieval_planning_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    messages = [
        SystemMessage(content=RETRIEVAL_PLANNING_PROMPT),
        HumanMessage(content=f"Decomposed claim: {json.dumps(state.get('decomposition', {}))}")
    ]
    res = llm.invoke(messages)
    parsed = _parse_json(res.content)
    state["search_queries"] = parsed.get("search_queries", [])
    return state

def evidence_retrieval_node(state: GraphState) -> GraphState:
    queries = state.get("search_queries", [])
    evidence = []
    for q in queries:
        evidence.append({
            "source": "MockNews",
            "content": f"Mock article about '{q}'.",
            "url": "https://mocknews.example.com/article"
        })
    if not evidence:
        evidence.append({
            "source": "MockOfficial",
            "content": "No specific queries were generated, generic mock content.",
            "url": "https://official.example.gov/mock"
        })
    state["raw_evidence"] = evidence
    return state

def source_classification_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    classifications = []
    for ev in state.get("raw_evidence", []):
        messages = [
            SystemMessage(content=SOURCE_CLASSIFICATION_PROMPT),
            HumanMessage(content=f"Source: {ev['source']}\nURL: {ev['url']}")
        ]
        res = llm.invoke(messages)
        parsed = _parse_json(res.content)
        parsed["url"] = ev["url"]
        classifications.append(parsed)
    state["source_classifications"] = classifications
    return state

def evidence_structuring_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    messages = [
        SystemMessage(content=EVIDENCE_STRUCTURING_PROMPT),
        HumanMessage(content=f"Primary Claim: {state['claim']}\nEvidence: {json.dumps(state.get('raw_evidence', []))}")
    ]
    res = llm.invoke(messages)
    state["structured_evidence"] = _parse_json(res.content)
    return state

def evidence_graph_builder_node(state: GraphState) -> GraphState:
    graph = {
        "nodes": len(state.get("raw_evidence", [])),
        "independent_sources": len(set(ev.get("source") for ev in state.get("raw_evidence", []))),
        "duplicate_alerts": []
    }
    state["evidence_graph"] = graph
    return state

def belief_formation_node(state: GraphState) -> GraphState:
    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=BELIEF_FORMATION_PROMPT),
        HumanMessage(content=f"Structured Evidence: {json.dumps(state.get('structured_evidence', {}))}")
    ]
    res = llm.invoke(messages)
    state["belief"] = _parse_json(res.content)
    return state

def skeptic_node(state: GraphState) -> GraphState:
    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=SKEPTIC_PROMPT),
        HumanMessage(content=f"Evidence: {json.dumps(state.get('structured_evidence', {}))}\nBeliefs: {json.dumps(state.get('belief', {}))}")
    ]
    res = llm.invoke(messages)
    state["skeptic"] = _parse_json(res.content)
    return state

def constitution_node(state: GraphState) -> GraphState:
    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=CONSTITUTION_PROMPT),
        HumanMessage(content=f"Beliefs: {json.dumps(state.get('belief', {}))}\nSkeptic: {json.dumps(state.get('skeptic', {}))}")
    ]
    res = llm.invoke(messages)
    state["constitution"] = _parse_json(res.content)
    return state

def confidence_engine_node(state: GraphState) -> GraphState:
    avg_authority = 50
    avg_freshness = 50
    avg_independence = 50
    
    if state.get("source_classifications"):
        sources = state["source_classifications"]
        avg_authority = sum(s.get("authority", 50) for s in sources) / len(sources)
        avg_freshness = sum(s.get("freshness", 50) for s in sources) / len(sources)
        avg_independence = sum(s.get("independence", 50) for s in sources) / len(sources)
        
    evidence_agreement = 50
    struct_ev = state.get("structured_evidence", {})
    supp = len(struct_ev.get("supporting", []))
    cont = len(struct_ev.get("contradicting", []))
    total = supp + cont
    if total > 0:
        evidence_agreement = (supp / total) * 100
        
    historical_trust = 50
    
    score = (
        0.25 * avg_authority +
        0.20 * avg_freshness +
        0.20 * avg_independence +
        0.20 * evidence_agreement +
        0.15 * historical_trust
    )
    
    state["confidence"] = {"score": round(score, 2)}
    return state

def action_recommendation_node(state: GraphState) -> GraphState:
    llm = get_reasoning_model()
    messages = [
        SystemMessage(content=ACTION_RECOMMENDATION_PROMPT),
        HumanMessage(content=f"Risk: {json.dumps(state.get('classification', {}))}\nConfidence: {state.get('confidence', {})}\nEvidence: {json.dumps(state.get('structured_evidence', {}))}")
    ]
    res = llm.invoke(messages)
    parsed = _parse_json(res.content)
    state["recommendations"] = parsed.get("recommendations", [])
    return state

def response_formatter_node(state: GraphState) -> GraphState:
    llm = get_fast_model()
    messages = [
        SystemMessage(content=RESPONSE_FORMATTER_PROMPT),
        HumanMessage(content=f"Beliefs: {json.dumps(state.get('belief', {}))}\nConfidence: {json.dumps(state.get('confidence', {}))}\nRecommendations: {json.dumps(state.get('recommendations', []))}")
    ]
    res = llm.invoke(messages)
    state["final_response"] = _parse_json(res.content)
    return state
