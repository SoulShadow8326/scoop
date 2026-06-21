from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import text
from sqlalchemy.orm import Session
import uuid
import datetime
import json
import asyncio
import threading

from config import logger, settings
from database import engine, Base, get_db, SessionLocal
from models.domain import (
    Claim, AnalysisSnapshot, Feedback, ClaimWatch, 
    ConfidenceHistory, SourcePassport, CitationNode
)
from models.schemas import (
    AnalyzeRequest, AnalyzeResponse, FeedbackRequest,
    ClaimResponse, WatchRequest, WatchResponse,
    LandingAnalyzeRequest, LandingAnalyzeResponse
)
from agents.graph import app_graph
from agents.landing import validate_claim, preview_analysis

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

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("assets/logo.svg", media_type="image/svg+xml")

@app.get("/", response_class=HTMLResponse)
async def get_landing(request: Request):
    return templates.TemplateResponse("landing/landing.html", {"request": request, "active": "home"})

@app.get("/login", response_class=HTMLResponse)
async def get_login(request: Request):
    return templates.TemplateResponse("auth/auth.html", {"request": request})

@app.get("/onboarding", response_class=HTMLResponse)
async def get_onboarding(request: Request):
    return templates.TemplateResponse("onboarding/onboarding.html", {"request": request})

@app.get("/app", response_class=HTMLResponse)
async def get_app(request: Request):
    return templates.TemplateResponse("app/app.html", {"request": request, "active": "app"})

@app.get("/watch", response_class=HTMLResponse)
async def get_watch_page(request: Request):
    # Mission-control view for an evolving claim. The claim id is read
    # client-side from the ?claim= query string.
    return templates.TemplateResponse("app/watch/watch.html", {"request": request, "active": "watch"})

@app.post("/landing/analyze", response_model=LandingAnalyzeResponse)
async def landing_analyze(request: LandingAnalyzeRequest):
    claim = (request.claim or "").strip()

    verdict = validate_claim(claim)
    if not verdict.get("valid"):
        return LandingAnalyzeResponse(
            valid=False,
            message=verdict.get("reason") or "Please enter a real claim or question we can analyze.",
        )

    try:
        preview = preview_analysis(claim)
    except Exception as e:
        logger.error(f"Landing preview failed: {e}")
        raise HTTPException(status_code=500, detail="Preview analysis failed")

    return LandingAnalyzeResponse(
        valid=True,
        claim=claim,
        information_dna=preview.get("information_dna", {}),
        emotional_manipulation=preview.get("emotional_manipulation", {}),
        context_integrity=preview.get("context_integrity", {}),
    )

def _initial_state(claim_id: str, claim: str, screenshot_ref: str = "", metadata=None):
    """Build the empty pipeline state the analysis graph expects."""
    return {
        "claim_id": claim_id,
        "claim": claim,
        "screenshot_ref": screenshot_ref or "",
        "input_metadata": metadata or {},
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


def _persist_analysis(db: Session, claim_id: str, final_state: dict) -> AnalysisSnapshot:
    """Store a new versioned snapshot plus its confidence-history point."""
    version = db.query(AnalysisSnapshot).filter(
        AnalysisSnapshot.claim_id == claim_id
    ).count() + 1

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
    db.refresh(db_analysis)

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

    return db_analysis


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_claim(request: AnalyzeRequest, db: Session = Depends(get_db)):
    logger.info(f"Received claim for analysis: {request.claim[:50]}...")

    claim_id = str(uuid.uuid4())

    try:
        final_state = app_graph.invoke(
            _initial_state(claim_id, request.claim, request.screenshot_ref, request.metadata)
        )
    except Exception as e:
        logger.error(f"Error during graph execution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # Reuse the existing claim record if we have seen this text before
    existing_claim = db.query(Claim).filter(Claim.text == request.claim).first()
    if existing_claim:
        claim_id = existing_claim.id
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
        db.commit()

    _persist_analysis(db, claim_id, final_state)

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


# ---------------------------------------------------------------------------
# Streaming analysis — render each engine's result the moment it lands
# ---------------------------------------------------------------------------
def _response_shape(state: dict) -> dict:
    """Map raw pipeline state into the same shape the report UI consumes."""
    return {
        "claim_id": state.get("claim_id", ""),
        "classification": state.get("classification", {}),
        "information_dna": state.get("information_dna", {}),
        "citation_graph": state.get("citation_graph", {}),
        "trust_passport": {"sources": state.get("trust_passports", [])},
        "context_integrity": state.get("context_integrity", {}),
        "emotional_manipulation": state.get("emotional_manipulation", {}),
        "evidence_strength": state.get("evidence_strength", {}),
        "reasoning": {
            "prosecutor": state.get("prosecutor_output", {}),
            "defense": state.get("defense_output", {}),
            "cross_examination": state.get("cross_examination", {}),
            "judge": state.get("judge_ruling", {}),
        },
        "confidence": state.get("confidence", {}),
        "recommendations": state.get("recommendations", []),
    }


# node name -> (percent complete, human label, report section to render | None)
_STREAM_STAGES = {
    "classification_agent":        (6,  "Classifying the claim", None),
    "decomposition_agent":         (12, "Breaking the claim down", None),
    "fingerprinting_agent":        (18, "Fingerprinting information DNA", "dna"),
    "retrieval_planning_agent":    (26, "Planning evidence retrieval", None),
    "evidence_retrieval_step":     (38, "Retrieving evidence", None),
    "source_classification_agent": (46, "Classifying sources", None),
    "trust_passport_agent":        (52, "Profiling source trust", "sources"),
    "evidence_structuring_agent":  (56, "Structuring evidence", None),
    "evidence_graph_builder":      (60, "Building the evidence graph", None),
    "citation_graph_agent":        (64, "Mapping citation lineage", "citation"),
    "emotional_manipulation_agent":(68, "Reading emotional framing", "manipulation"),
    "context_integrity_agent":     (72, "Checking context integrity", "integrity"),
    "evidence_strength_engine":    (76, "Weighing evidence strength", "sources"),
    "evidence_collector_agent":    (78, "Preparing courtroom exhibits", None),
    "prosecutor_agent":            (82, "Prosecution building its case", "courtroom"),
    "defense_agent":               (85, "Defense building its case", "courtroom"),
    "cross_examiner_agent":        (88, "Cross-examining the arguments", "courtroom"),
    "judge_agent":                 (91, "Judge weighing the arguments", "courtroom"),
    "belief_formation_agent":      (93, "Forming a calibrated belief", None),
    "skeptic_agent":               (95, "Running a skeptic pass", None),
    "constitution_agent":          (96, "Applying responsible-AI checks", None),
    "confidence_engine":           (98, "Calibrating confidence", "confidence"),
    "recommendation_agent":        (99, "Recommending an action", "recommendations"),
    "response_formatter":          (100, "Report ready", None),
}


@app.post("/analyze/stream")
async def analyze_stream(request: AnalyzeRequest):
    logger.info(f"Streaming analysis for claim: {request.claim[:50]}...")

    claim_text = request.claim
    screenshot_ref = request.screenshot_ref
    metadata = request.metadata
    loop = asyncio.get_event_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def emit(event: dict):
        loop.call_soon_threadsafe(queue.put_nowait, event)

    def worker():
        wdb = SessionLocal()
        claim_id = str(uuid.uuid4())
        final_state = None
        try:
            init = _initial_state(claim_id, claim_text, screenshot_ref, metadata)
            for chunk in app_graph.stream(init, stream_mode="updates"):
                for node_name, node_state in chunk.items():
                    if not isinstance(node_state, dict):
                        continue
                    final_state = node_state
                    pct, label, section = _STREAM_STAGES.get(node_name, (None, None, None))
                    event = {"type": "stage", "node": node_name}
                    if pct is not None:
                        event["pct"] = pct
                    if label:
                        event["label"] = label
                    if section:
                        event["type"] = "section"
                        event["section"] = section
                        event["data"] = _response_shape(node_state)
                    emit(event)

            if final_state is None:
                emit({"type": "error", "message": "Analysis produced no output."})
                return

            # Resolve / create the claim record, then persist the snapshot.
            existing = wdb.query(Claim).filter(Claim.text == claim_text).first()
            if existing:
                claim_id = existing.id
            else:
                wdb.add(Claim(
                    id=claim_id,
                    text=claim_text,
                    screenshot_ref=screenshot_ref,
                    metadata_json=metadata,
                    fingerprint=final_state.get("information_dna", {}).get("fingerprint", ""),
                    canonical_form=final_state.get("information_dna", {}).get("canonical_form", ""),
                ))
                wdb.commit()

            _persist_analysis(wdb, claim_id, final_state)

            shape = _response_shape(final_state)
            shape["claim_id"] = claim_id
            emit({"type": "done", "claim_id": claim_id, "data": shape})
        except Exception as e:
            logger.error(f"Error during streaming analysis: {e}")
            emit({"type": "error", "message": str(e)})
        finally:
            wdb.close()
            loop.call_soon_threadsafe(queue.put_nowait, None)

    threading.Thread(target=worker, daemon=True).start()

    async def event_stream():
        while True:
            event = await queue.get()
            if event is None:
                break
            yield json.dumps(event) + "\n"

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")


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


# ---------------------------------------------------------------------------
# Watch Mode — turning stored snapshots into a living trust timeline
# ---------------------------------------------------------------------------
def _pct(value) -> int:
    """Normalise any stored score (0–1 or 0–100) to an integer 0–100."""
    try:
        n = float(value)
    except (TypeError, ValueError):
        return 0
    if 0 < n <= 1:
        n *= 100
    return int(max(0, min(100, round(n))))


def _snapshot_metrics(snap: AnalysisSnapshot) -> dict:
    """Pull the comparable headline numbers out of one snapshot."""
    conf = snap.confidence or {}
    components = conf.get("components") or {}
    ci = snap.context_integrity or {}
    em = snap.emotional_manipulation or {}
    es = snap.evidence_strength or {}
    passport = snap.trust_passport or {}
    if isinstance(passport, dict):
        sources = passport.get("sources") or []
    elif isinstance(passport, list):
        sources = passport
    else:
        sources = []
    return {
        "version": snap.version,
        "created_at": str(snap.created_at),
        "confidence": _pct(conf.get("score")),
        "integrity": _pct(ci.get("integrity_score")),
        "manipulation": _pct(em.get("manipulation_risk")),
        "evidence_strength": _pct(es.get("score")),
        "source_count": len(sources),
        "components": {k: _pct(v) for k, v in components.items()},
    }


# Human-readable reasons for which confidence component moved the most.
_COMPONENT_REASONS = {
    "authority": "Higher-authority sources entered the evidence set.",
    "freshness": "More recent evidence was published.",
    "independence": "Independent corroboration changed.",
    "evidence_agreement": "Sources moved toward stronger agreement.",
    "historical_trust": "Tracked publisher reliability shifted.",
    "context_integrity": "The context integrity of the claim changed.",
    "manipulation_inverse": "Emotional framing in the evidence shifted.",
    "evidence_strength": "Overall evidence strength changed.",
}


def _build_change_card(prev: dict, curr: dict) -> dict:
    """Explain *why* confidence moved between two consecutive snapshots."""
    delta = curr["confidence"] - prev["confidence"]

    # Find the component that moved the most to attribute a reason.
    reason = "A fresh check re-weighed the available evidence."
    best_key, best_move = None, 0
    for key, val in (curr.get("components") or {}).items():
        move = val - (prev.get("components") or {}).get(key, val)
        if abs(move) > abs(best_move):
            best_move, best_key = move, key
    if best_key and abs(best_move) >= 1:
        reason = _COMPONENT_REASONS.get(best_key, reason)

    src_delta = curr["source_count"] - prev["source_count"]
    if src_delta > 0:
        reason = f"{src_delta} new source{'s' if src_delta != 1 else ''} added to the evidence set."

    if delta > 0:
        title, kind = "Confidence increased", "up"
        impact = "Stronger independent verification added."
    elif delta < 0:
        title, kind = "Confidence decreased", "down"
        impact = "Evidence quality or corroboration was reduced."
    else:
        title, kind = "Re-checked, no net change", "neutral"
        impact = "New pass confirmed the previous reading."

    return {
        "title": title,
        "kind": kind,
        "previous": prev["confidence"],
        "current": curr["confidence"],
        "delta": delta,
        "reason": reason,
        "impact": impact,
        "at": curr["created_at"],
    }


def _build_timeline(metrics: list) -> list:
    """Flatten snapshot history into discrete, dated timeline events."""
    events = []
    if not metrics:
        return events
    first = metrics[0]
    events.append({
        "at": first["created_at"],
        "title": "Claim added to Watch Mode",
        "detail": f"Baseline confidence set at {first['confidence']}%.",
        "kind": "neutral",
    })
    for prev, curr in zip(metrics, metrics[1:]):
        events.append({
            "at": curr["created_at"],
            "title": "Fresh check run",
            "detail": f"Version {curr['version']} analysis completed.",
            "kind": "neutral",
        })
        if curr["source_count"] > prev["source_count"]:
            added = curr["source_count"] - prev["source_count"]
            events.append({
                "at": curr["created_at"],
                "title": "New source discovered",
                "detail": f"{added} additional source{'s' if added != 1 else ''} entered the evidence set.",
                "kind": "source",
            })
        if curr["confidence"] != prev["confidence"]:
            up = curr["confidence"] > prev["confidence"]
            events.append({
                "at": curr["created_at"],
                "title": f"Confidence {'increased' if up else 'decreased'}",
                "detail": f"Moved from {prev['confidence']}% to {curr['confidence']}%.",
                "kind": "up" if up else "down",
            })
        if curr["integrity"] != prev["integrity"] and abs(curr["integrity"] - prev["integrity"]) >= 3:
            up = curr["integrity"] > prev["integrity"]
            events.append({
                "at": curr["created_at"],
                "title": "Context integrity " + ("improved" if up else "weakened"),
                "detail": f"Integrity score {prev['integrity']} → {curr['integrity']}.",
                "kind": "up" if up else "down",
            })
    return events


def _watch_payload(db: Session, claim_id: str) -> dict:
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    snapshots = db.query(AnalysisSnapshot).filter(
        AnalysisSnapshot.claim_id == claim_id
    ).order_by(AnalysisSnapshot.version.asc()).all()
    metrics = [_snapshot_metrics(s) for s in snapshots]

    watch = db.query(ClaimWatch).filter(ClaimWatch.claim_id == claim_id).first()

    latest = metrics[-1] if metrics else None
    previous = metrics[-2] if len(metrics) >= 2 else None

    if latest and previous:
        delta = latest["confidence"] - previous["confidence"]
        if delta > 2:
            status = "Evidence strengthened"
        elif delta < -2:
            status = "Evidence weakened"
        else:
            status = "Holding steady"
    else:
        status, delta = "Baseline set", 0

    change_cards = [
        _build_change_card(metrics[i - 1], metrics[i]) for i in range(1, len(metrics))
    ]
    change_cards.reverse()  # newest first

    return {
        "claim_id": claim_id,
        "claim": claim.text,
        "watching": bool(watch.active) if watch else False,
        "recheck_horizon_hours": watch.recheck_horizon_hours if watch else 24,
        "last_checked_at": str(watch.last_checked_at) if watch and watch.last_checked_at else (latest["created_at"] if latest else None),
        "current_confidence": latest["confidence"] if latest else 0,
        "previous_confidence": previous["confidence"] if previous else None,
        "delta": delta,
        "status": status,
        "check_count": len(metrics),
        "history": [{"version": m["version"], "score": m["confidence"], "at": m["created_at"]} for m in metrics],
        "timeline": list(reversed(_build_timeline(metrics))),  # newest first
        "change_cards": change_cards,
    }


@app.get("/watch/{claim_id}/timeline")
async def get_watch_timeline(claim_id: str, db: Session = Depends(get_db)):
    return _watch_payload(db, claim_id)


@app.post("/watch/{claim_id}/recheck")
async def recheck_claim(claim_id: str, db: Session = Depends(get_db)):
    """Run a fresh pass of the pipeline so the trust timeline can evolve."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    try:
        final_state = app_graph.invoke(
            _initial_state(claim_id, claim.text, claim.screenshot_ref or "", claim.metadata_json)
        )
    except Exception as e:
        logger.error(f"Error during recheck graph execution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    _persist_analysis(db, claim_id, final_state)

    # Make sure a watch exists and stamp the recheck time.
    watch = db.query(ClaimWatch).filter(ClaimWatch.claim_id == claim_id).first()
    if not watch:
        watch = ClaimWatch(claim_id=claim_id)
        db.add(watch)
    watch.active = True
    watch.last_checked_at = datetime.datetime.utcnow()
    db.commit()

    return _watch_payload(db, claim_id)


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
