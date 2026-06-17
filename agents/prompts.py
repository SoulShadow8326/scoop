import os

PROMPTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts")

def load_prompt(filename: str) -> str:
    path = os.path.join(PROMPTS_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()

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
