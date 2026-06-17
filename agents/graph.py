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
    response_formatter_node
)

def create_graph():
    workflow = StateGraph(GraphState)

    workflow.add_node("classification_agent", classification_node)
    workflow.add_node("decomposition_agent", claim_decomposition_node)
    workflow.add_node("retrieval_planning_agent", retrieval_planning_node)
    workflow.add_node("evidence_retrieval_step", evidence_retrieval_node)
    workflow.add_node("source_classification_agent", source_classification_node)
    workflow.add_node("evidence_structuring_agent", evidence_structuring_node)
    workflow.add_node("evidence_graph_builder", evidence_graph_builder_node)
    workflow.add_node("belief_formation_agent", belief_formation_node)
    workflow.add_node("skeptic_agent", skeptic_node)
    workflow.add_node("constitution_agent", constitution_node)
    workflow.add_node("confidence_engine", confidence_engine_node)
    workflow.add_node("recommendation_agent", action_recommendation_node)
    workflow.add_node("response_formatter", response_formatter_node)

    workflow.set_entry_point("classification_agent")
    workflow.add_edge("classification_agent", "decomposition_agent")
    workflow.add_edge("decomposition_agent", "retrieval_planning_agent")
    workflow.add_edge("retrieval_planning_agent", "evidence_retrieval_step")
    workflow.add_edge("evidence_retrieval_step", "source_classification_agent")
    workflow.add_edge("source_classification_agent", "evidence_structuring_agent")
    workflow.add_edge("evidence_structuring_agent", "evidence_graph_builder")
    workflow.add_edge("evidence_graph_builder", "belief_formation_agent")
    workflow.add_edge("belief_formation_agent", "skeptic_agent")
    workflow.add_edge("skeptic_agent", "constitution_agent")
    workflow.add_edge("constitution_agent", "confidence_engine")
    workflow.add_edge("confidence_engine", "recommendation_agent")
    workflow.add_edge("recommendation_agent", "response_formatter")
    workflow.add_edge("response_formatter", END)

    return workflow.compile()

app_graph = create_graph()
