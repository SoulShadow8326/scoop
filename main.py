from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import text
from sqlalchemy.orm import Session
import uuid
import datetime

from config import logger, settings
from database import engine, Base, get_db
from models.domain import (
    Claim, AnalysisSnapshot, Feedback, ClaimWatch, 
    ConfidenceHistory, SourcePassport, CitationNode
)
from models.schemas import (
    AnalyzeRequest, AnalyzeResponse, FeedbackRequest, 
    ClaimResponse, WatchRequest, WatchResponse
)
from agents.graph import app_graph

Base.metadata.create_all(bind=engine)

def _migrate():
    migrations = {
        "claims": {
            "screenshot_ref": "TEXT",
            "metadata_json": "TEXT",
            "fingerprint": "TEXT",
            "canonical_form": "TEXT",
        },
        "analysis_snapshots": {
            "information_dna": "TEXT",
            "citation_graph": "TEXT",
            "trust_passport": "TEXT",
            "emotional_manipulation": "TEXT",
            "context_integrity": "TEXT",
            "evidence_strength": "TEXT",
            "courtroom_reasoning": "TEXT",
            "belief": "TEXT",
            "skeptic_output": "TEXT",
            "constitution": "TEXT",
            "source_classifications": "TEXT",
            "structured_evidence": "TEXT",
            "evidence_graph_data": "TEXT",
        },
    }
    with engine.connect() as conn:
        existing_tables = {
            row[0] for row in conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table'")
            ).fetchall()
        }
        for table, columns in migrations.items():
            if table not in existing_tables:
                continue
            existing_cols = {
                row[1] for row in conn.execute(
                    text(f"PRAGMA table_info({table})")
                ).fetchall()
            }
            for col, col_type in columns.items():
                if col not in existing_cols:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                    logger.info(f"Migration: added {table}.{col}")
        conn.commit()

_migrate()

app = FastAPI(title="Scoop Backend V2", description="Confidence-calibrated, evidence-based decision-support system.")

app.mount("/static", StaticFiles(directory="."), name="static")
templates = Jinja2Templates(directory=".")

@app.get("/", response_class=HTMLResponse)
async def get_landing(request: Request):
    return templates.TemplateResponse("landing/landing.html", {"request": request})

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_claim(request: AnalyzeRequest, db: Session = Depends(get_db)):
    logger.info(f"Received claim for analysis: {request.claim[:50]}...")

    claim_id = str(uuid.uuid4())

    initial_state = {
        "claim_id": claim_id,
        "claim": request.claim,
        "screenshot_ref": request.screenshot_ref or "",
        "input_metadata": request.metadata or {},
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
        "recommendations": [],
        "information_dna": {},
        "citation_graph": {},
        "trust_passports": [],
        "emotional_manipulation": {},
        "context_integrity": {},
        "evidence_strength": {},
        "courtroom_exhibits": {},
        "prosecutor_output": {},
        "defense_output": {},
        "cross_examination": {},
        "judge_ruling": {},
        "confidence": {},
        "final_response": {},
        "errors": []
    }

    try:
        final_state = app_graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"Error during graph execution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # Determine next version
    existing_claim = db.query(Claim).filter(Claim.text == request.claim).first()
    if existing_claim:
        claim_id = existing_claim.id
        version = db.query(AnalysisSnapshot).filter(AnalysisSnapshot.claim_id == claim_id).count() + 1
    else:
        db_claim = Claim(
            id=claim_id, 
            text=request.claim, 
            screenshot_ref=request.screenshot_ref, 
            metadata_json=request.metadata,
            fingerprint=final_state.get("information_dna", {}).get("fingerprint", ""),
            canonical_form=final_state.get("information_dna", {}).get("canonical_form", "")
        )
        db.add(db_claim)
        version = 1

    db_analysis = AnalysisSnapshot(
        claim_id=claim_id,
        version=version,
        classification=final_state.get("classification"),
        decomposition=final_state.get("decomposition"),
        retrieval_plan=final_state.get("search_queries"),
        evidence=final_state.get("raw_evidence"),
        source_classifications=final_state.get("source_classifications"),
        structured_evidence=final_state.get("structured_evidence"),
        evidence_graph_data=final_state.get("evidence_graph"),
        information_dna=final_state.get("information_dna"),
        citation_graph=final_state.get("citation_graph"),
        trust_passport=final_state.get("trust_passports"),
        emotional_manipulation=final_state.get("emotional_manipulation"),
        context_integrity=final_state.get("context_integrity"),
        evidence_strength=final_state.get("evidence_strength"),
        courtroom_reasoning={
            "exhibits": final_state.get("courtroom_exhibits"),
            "prosecutor": final_state.get("prosecutor_output"),
            "defense": final_state.get("defense_output"),
            "cross_examination": final_state.get("cross_examination"),
            "judge": final_state.get("judge_ruling")
        },
        belief=final_state.get("belief"),
        skeptic_output=final_state.get("skeptic"),
        constitution=final_state.get("constitution"),
        confidence=final_state.get("confidence"),
        recommendations=final_state.get("recommendations"),
        response=final_state.get("final_response")
    )
    db.add(db_analysis)
    db.commit()

    # Track confidence history
    conf = final_state.get("confidence", {})
    conf_history = ConfidenceHistory(
        claim_id=claim_id,
        snapshot_id=db_analysis.id,
        confidence_score=conf.get("score", 0.0),
        integrity_score=conf.get("integrity_score", 0.0),
        manipulation_risk_score=conf.get("manipulation_risk_score", 0.0),
        evidence_strength_score=conf.get("evidence_strength_score", 0.0)
    )
    db.add(conf_history)
    db.commit()

    return AnalyzeResponse(
        claim_id=claim_id,
        classification=final_state.get("classification", {}),
        information_dna=final_state.get("information_dna", {}),
        citation_graph=final_state.get("citation_graph", {}),
        trust_passport={"sources": final_state.get("trust_passports", [])},
        context_integrity=final_state.get("context_integrity", {}),
        emotional_manipulation=final_state.get("emotional_manipulation", {}),
        evidence_strength=final_state.get("evidence_strength", {}),
        reasoning={
            "prosecutor": final_state.get("prosecutor_output", {}),
            "defense": final_state.get("defense_output", {}),
            "cross_examination": final_state.get("cross_examination", {}),
            "judge": final_state.get("judge_ruling", {})
        },
        confidence=final_state.get("confidence", {}),
        recommendations=final_state.get("recommendations", [])
    )

@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    logger.info(f"Received feedback for claim {request.claim_id}: {request.feedback}")

    claim = db.query(Claim).filter(Claim.id == request.claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    feedback = Feedback(claim_id=request.claim_id, feedback_type=request.feedback, note=request.note)
    db.add(feedback)
    db.commit()

    return {"status": "success"}

@app.get("/claim/{id}", response_model=ClaimResponse)
async def get_claim(id: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    analysis = db.query(AnalysisSnapshot).filter(AnalysisSnapshot.claim_id == id).order_by(AnalysisSnapshot.version.desc()).first()
    conf_history = db.query(ConfidenceHistory).filter(ConfidenceHistory.claim_id == id).all()
    feedbacks = db.query(Feedback).filter(Feedback.claim_id == id).all()
    watch = db.query(ClaimWatch).filter(ClaimWatch.claim_id == id).first()

    return ClaimResponse(
        id=claim.id,
        text=claim.text,
        screenshot_ref=claim.screenshot_ref,
        metadata=claim.metadata_json,
        analysis=analysis.response if analysis else None,
        confidence_history=[{
            "score": ch.confidence_score,
            "integrity": ch.integrity_score,
            "manipulation": ch.manipulation_risk_score,
            "strength": ch.evidence_strength_score,
            "created_at": str(ch.created_at)
        } for ch in conf_history],
        feedback_history=[{"type": f.feedback_type, "note": f.note} for f in feedbacks],
        watch_status={"active": watch.active, "horizon": watch.recheck_horizon_hours} if watch else None
    )

@app.post("/watch/{claim_id}", response_model=WatchResponse)
async def watch_claim(claim_id: str, request: WatchRequest, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    watch = db.query(ClaimWatch).filter(ClaimWatch.claim_id == claim_id).first()
    if watch:
        watch.active = True
        watch.recheck_horizon_hours = request.recheck_horizon_hours
    else:
        watch = ClaimWatch(claim_id=claim_id, recheck_horizon_hours=request.recheck_horizon_hours)
        db.add(watch)
    
    db.commit()
    db.refresh(watch)

    return WatchResponse(
        claim_id=claim_id,
        watching=watch.active,
        created_at=str(watch.created_at),
        recheck_horizon_hours=watch.recheck_horizon_hours,
        latest_confidence={},
        analysis_count=db.query(AnalysisSnapshot).filter(AnalysisSnapshot.claim_id == claim_id).count()
    )

@app.get("/watch/{claim_id}", response_model=WatchResponse)
async def get_watch_status(claim_id: str, db: Session = Depends(get_db)):
    watch = db.query(ClaimWatch).filter(ClaimWatch.claim_id == claim_id).first()
    if not watch:
        raise HTTPException(status_code=404, detail="Watch not found for this claim")

    latest_analysis = db.query(AnalysisSnapshot).filter(AnalysisSnapshot.claim_id == claim_id).order_by(AnalysisSnapshot.version.desc()).first()

    return WatchResponse(
        claim_id=claim_id,
        watching=watch.active,
        created_at=str(watch.created_at),
        recheck_horizon_hours=watch.recheck_horizon_hours,
        latest_confidence=latest_analysis.confidence if latest_analysis else None,
        analysis_count=db.query(AnalysisSnapshot).filter(AnalysisSnapshot.claim_id == claim_id).count()
    )

if __name__ == "__main__":
    import os
    import signal
    import sys
    import uvicorn

    def handle_exit(signum, frame):
        os.killpg(os.getpgid(os.getpid()), signal.SIGTERM)
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_exit)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
