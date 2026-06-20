from langgraph.graph import StateGraph, END
from agents.state import GraphState
from agents.nodes import (
    classification_node,
    claim_decomposition_node,
    retrieval_planning_node,
    evidence_retrieval_node,
    source_classification_node,
    evidence_structuring_node,
    evidence_graph_builder_node,
    belief_formation_node,
    skeptic_node,
    constitution_node,
    confidence_engine_node,
    action_recommendation_node,
    response_formatter_node,
)
from agents.nodes_v2 import (
    fingerprinting_node,
    citation_graph_node,
    trust_passport_node,
    emotional_manipulation_node,
    context_integrity_node,
    evidence_strength_node,
    evidence_collector_node,
    prosecutor_node,
    defense_node,
    cross_examiner_node,
    judge_node,
)

def create_graph():
    workflow = StateGraph(GraphState)

    # 1. V1 / V2 Front-end analysis
    workflow.add_node("classification_agent", classification_node)
    workflow.add_node("decomposition_agent", claim_decomposition_node)
    workflow.add_node("fingerprinting_agent", fingerprinting_node)
    
    # 2. Retrieval & Evidence collection
    workflow.add_node("retrieval_planning_agent", retrieval_planning_node)
    workflow.add_node("evidence_retrieval_step", evidence_retrieval_node)
    
    # 3. Source & Context evaluation
    workflow.add_node("source_classification_agent", source_classification_node)
    workflow.add_node("trust_passport_agent", trust_passport_node)
    workflow.add_node("evidence_structuring_agent", evidence_structuring_node)
    workflow.add_node("evidence_graph_builder", evidence_graph_builder_node)
    workflow.add_node("citation_graph_agent", citation_graph_node)
    
    # 4. Emotional & Context Analysis
    workflow.add_node("emotional_manipulation_agent", emotional_manipulation_node)
    workflow.add_node("context_integrity_agent", context_integrity_node)
    workflow.add_node("evidence_strength_engine", evidence_strength_node)
    
    # 5. Courtroom Reasoning
    workflow.add_node("evidence_collector_agent", evidence_collector_node)
    workflow.add_node("prosecutor_agent", prosecutor_node)
    workflow.add_node("defense_agent", defense_node)
    workflow.add_node("cross_examiner_agent", cross_examiner_node)
    workflow.add_node("judge_agent", judge_node)
    
    # 6. Finalization (V1 updated)
    workflow.add_node("belief_formation_agent", belief_formation_node)
    workflow.add_node("skeptic_agent", skeptic_node)
    workflow.add_node("constitution_agent", constitution_node)
    workflow.add_node("confidence_engine", confidence_engine_node)
    workflow.add_node("recommendation_agent", action_recommendation_node)
    workflow.add_node("response_formatter", response_formatter_node)

    # Define edges sequentially
    workflow.set_entry_point("classification_agent")
    workflow.add_edge("classification_agent", "decomposition_agent")
    workflow.add_edge("decomposition_agent", "fingerprinting_agent")
    workflow.add_edge("fingerprinting_agent", "retrieval_planning_agent")
    
    workflow.add_edge("retrieval_planning_agent", "evidence_retrieval_step")
    workflow.add_edge("evidence_retrieval_step", "source_classification_agent")
    
    workflow.add_edge("source_classification_agent", "trust_passport_agent")
    workflow.add_edge("trust_passport_agent", "evidence_structuring_agent")
    workflow.add_edge("evidence_structuring_agent", "evidence_graph_builder")
    workflow.add_edge("evidence_graph_builder", "citation_graph_agent")
    
    workflow.add_edge("citation_graph_agent", "emotional_manipulation_agent")
    workflow.add_edge("emotional_manipulation_agent", "context_integrity_agent")
    workflow.add_edge("context_integrity_agent", "evidence_strength_engine")
    
    workflow.add_edge("evidence_strength_engine", "evidence_collector_agent")
    workflow.add_edge("evidence_collector_agent", "prosecutor_agent")
    workflow.add_edge("prosecutor_agent", "defense_agent")
    workflow.add_edge("defense_agent", "cross_examiner_agent")
    workflow.add_edge("cross_examiner_agent", "judge_agent")
    
    workflow.add_edge("judge_agent", "belief_formation_agent")
    workflow.add_edge("belief_formation_agent", "skeptic_agent")
    workflow.add_edge("skeptic_agent", "constitution_agent")
    workflow.add_edge("constitution_agent", "confidence_engine")
    workflow.add_edge("confidence_engine", "recommendation_agent")
    workflow.add_edge("recommendation_agent", "response_formatter")
    workflow.add_edge("response_formatter", END)

    return workflow.compile()

app_graph = create_graph()
