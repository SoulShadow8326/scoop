from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalyzeRequest(BaseModel):
    claim: str = Field(..., description="The claim to analyze")

class AnalyzeResponse(BaseModel):
    claim_id: str
    classification: Dict[str, Any]
    evidence: List[Dict[str, Any]]
    reasoning: Dict[str, Any]
    skeptic: Dict[str, Any]
    constitution: Dict[str, Any]
    confidence: Dict[str, Any]
    recommendations: List[Dict[str, Any]]

class FeedbackRequest(BaseModel):
    claim_id: str
    feedback: str = Field(..., description="helpful, not_helpful, misleading, report")

class ClaimResponse(BaseModel):
    id: str
    text: str
    analysis: Optional[Dict[str, Any]] = None
