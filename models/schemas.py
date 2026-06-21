from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalyzeRequest(BaseModel):
    claim: str = Field(..., description="The claim to analyze")
    screenshot_ref: Optional[str] = Field(None, description="Optional file reference to a screenshot")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional metadata about the claim's origin")

class AnalyzeResponse(BaseModel):
    claim_id: str
    classification: Dict[str, Any]
    information_dna: Dict[str, Any]
    citation_graph: Dict[str, Any]
    trust_passport: Dict[str, Any]
    context_integrity: Dict[str, Any]
    emotional_manipulation: Dict[str, Any]
    evidence_strength: Dict[str, Any]
    reasoning: Dict[str, Any]
    confidence: Dict[str, Any]
    recommendations: List[str]

class LandingAnalyzeRequest(BaseModel):
    claim: str = Field(..., description="The claim or question to validate and preview")

class LandingAnalyzeResponse(BaseModel):
    valid: bool
    message: Optional[str] = None
    claim: Optional[str] = None
    information_dna: Optional[Dict[str, Any]] = None
    emotional_manipulation: Optional[Dict[str, Any]] = None
    context_integrity: Optional[Dict[str, Any]] = None

class FeedbackRequest(BaseModel):
    claim_id: str
    feedback: str = Field(..., description="helpful, not_helpful, misleading, report")
    note: Optional[str] = Field(None, description="Optional text note explaining the feedback")

class ClaimResponse(BaseModel):
    id: str
    text: str
    screenshot_ref: Optional[str]
    metadata: Optional[Dict[str, Any]]
    analysis: Optional[Dict[str, Any]]
    confidence_history: List[Dict[str, Any]]
    feedback_history: List[Dict[str, Any]]
    watch_status: Optional[Dict[str, Any]]

class WatchRequest(BaseModel):
    claim_id: str
    recheck_horizon_hours: Optional[int] = Field(24, description="Hours before next automated recheck")

class WatchResponse(BaseModel):
    claim_id: str
    watching: bool
    created_at: str
    recheck_horizon_hours: int
    latest_confidence: Optional[Dict[str, Any]]
    analysis_count: int
