from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
import uuid

from config import logger, settings
from database import engine, Base, get_db
from models.domain import Claim, AnalysisResult, Feedback
from models.schemas import AnalyzeRequest, AnalyzeResponse, FeedbackRequest, ClaimResponse
from agents.graph import app_graph

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Scoop Backend", description="Evidence-based community rumor and claim analysis system.")

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_claim(request: AnalyzeRequest, db: Session = Depends(get_db)):
    logger.info(f"Received claim for analysis: {request.claim[:50]}...")

    claim_id = str(uuid.uuid4())

    initial_state = {
        "claim_id": claim_id,
        "claim": request.claim,
        "classification": {},
        "decomposition": {},
        "search_queries": [],
        "raw_evidence": [],
        "source_classifications": [],
        "structured_evidence": {},
        "evidence_graph": {},
        "belief": {},
        "skeptic": {},
        "constitution": {},
        "confidence": {},
        "recommendations": [],
        "final_response": {},
        "errors": []
    }

    try:
        final_state = app_graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"Error during graph execution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    db_claim = Claim(id=claim_id, text=request.claim)
    db.add(db_claim)

    db_analysis = AnalysisResult(
        claim_id=claim_id,
        classification=final_state.get("classification"),
        decomposition=final_state.get("decomposition"),
        retrieval_plan=final_state.get("search_queries"),
        evidence=final_state.get("raw_evidence"),
        source_classification=final_state.get("source_classifications"),
        structured_evidence=final_state.get("structured_evidence"),
        evidence_graph=final_state.get("evidence_graph"),
        belief=final_state.get("belief"),
        skeptic=final_state.get("skeptic"),
        constitution=final_state.get("constitution"),
        confidence=final_state.get("confidence"),
        recommendations=final_state.get("recommendations"),
        response=final_state.get("final_response")
    )
    db.add(db_analysis)
    db.commit()

    return AnalyzeResponse(
        claim_id=claim_id,
        classification=final_state.get("classification", {}),
        evidence=final_state.get("raw_evidence", []),
        reasoning=final_state.get("belief", {}),
        skeptic=final_state.get("skeptic", {}),
        constitution=final_state.get("constitution", {}),
        confidence=final_state.get("confidence", {}),
        recommendations=final_state.get("recommendations", [])
    )

@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    logger.info(f"Received feedback for claim {request.claim_id}: {request.feedback}")

    claim = db.query(Claim).filter(Claim.id == request.claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    feedback = Feedback(claim_id=request.claim_id, feedback_type=request.feedback)
    db.add(feedback)
    db.commit()

    return {"status": "success"}

@app.get("/claim/{id}", response_model=ClaimResponse)
async def get_claim(id: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    response = ClaimResponse(
        id=claim.id,
        text=claim.text,
        analysis=claim.analysis.response if claim.analysis else None
    )
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
