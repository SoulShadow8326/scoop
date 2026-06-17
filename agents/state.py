from typing import TypedDict, Dict, Any, List, Optional

class GraphState(TypedDict):
    claim_id: str
    claim: str
    
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
    confidence: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    
    final_response: Dict[str, Any]
    errors: List[str]
