from sqlalchemy import (
    Boolean,
    Column,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    DateTime,
    JSON,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


# ---------------------------------------------------------------------------
# Claim – the core entity being fact-checked
# ---------------------------------------------------------------------------
class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    screenshot_ref = Column(String, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    fingerprint = Column(String, nullable=True, index=True)
    canonical_form = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    analyses = relationship(
        "AnalysisSnapshot",
        back_populates="claim",
        order_by="AnalysisSnapshot.version.desc()",
        cascade="all, delete-orphan",
    )
    feedback = relationship(
        "Feedback",
        back_populates="claim",
        cascade="all, delete-orphan",
    )
    watch = relationship(
        "ClaimWatch",
        back_populates="claim",
        uselist=False,
        cascade="all, delete-orphan",
    )
    citation_nodes = relationship(
        "CitationNode",
        back_populates="claim",
        cascade="all, delete-orphan",
    )


# ---------------------------------------------------------------------------
# AnalysisSnapshot – versioned analysis replacing the old AnalysisResult
# ---------------------------------------------------------------------------
class AnalysisSnapshot(Base):
    __tablename__ = "analysis_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False, index=True)
    version = Column(Integer, nullable=False, default=1)

    # pipeline stage outputs
    classification = Column(JSON, nullable=True)
    decomposition = Column(JSON, nullable=True)
    retrieval_plan = Column(JSON, nullable=True)
    evidence = Column(JSON, nullable=True)
    source_classifications = Column(JSON, nullable=True)
    structured_evidence = Column(JSON, nullable=True)
    evidence_graph_data = Column(JSON, nullable=True)
    information_dna = Column(JSON, nullable=True)
    citation_graph = Column(JSON, nullable=True)
    trust_passport = Column(JSON, nullable=True)
    emotional_manipulation = Column(JSON, nullable=True)
    context_integrity = Column(JSON, nullable=True)
    evidence_strength = Column(JSON, nullable=True)
    courtroom_reasoning = Column(JSON, nullable=True)
    belief = Column(JSON, nullable=True)
    skeptic_output = Column(JSON, nullable=True)
    constitution = Column(JSON, nullable=True)
    confidence = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    response = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    claim = relationship("Claim", back_populates="analyses")

    __table_args__ = (
        Index("ix_snapshot_claim_version", "claim_id", "version", unique=True),
    )


# ---------------------------------------------------------------------------
# SourcePassport – trust passport for evidence sources
# ---------------------------------------------------------------------------
class SourcePassport(Base):
    __tablename__ = "source_passports"

    id = Column(Integer, primary_key=True, index=True)
    source_identifier = Column(String, unique=True, nullable=False, index=True)

    authority_score = Column(Integer, nullable=False, default=50)
    primary_source_usage = Column(Integer, nullable=False, default=50)
    evidence_density = Column(Integer, nullable=False, default=50)
    retraction_history = Column(Integer, nullable=False, default=0)
    emotional_language_tendency = Column(Integer, nullable=False, default=50)
    transparency_score = Column(Integer, nullable=False, default=50)

    total_appearances = Column(Integer, nullable=False, default=0)
    helpful_feedback_count = Column(Integer, nullable=False, default=0)
    misleading_feedback_count = Column(Integer, nullable=False, default=0)

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ---------------------------------------------------------------------------
# CitationNode – nodes in a claim's citation / propagation graph
# ---------------------------------------------------------------------------
class CitationNode(Base):
    __tablename__ = "citation_nodes"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False, index=True)
    source_url = Column(String, nullable=True)
    source_name = Column(String, nullable=True)
    node_type = Column(String, nullable=False)  # origin | copied | amplified | independent | repost
    parent_node_id = Column(Integer, ForeignKey("citation_nodes.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    claim = relationship("Claim", back_populates="citation_nodes")
    children = relationship(
        "CitationNode",
        back_populates="parent",
        cascade="all, delete-orphan",
    )
    parent = relationship(
        "CitationNode",
        back_populates="children",
        remote_side=[id],
    )


# ---------------------------------------------------------------------------
# Feedback – user / reviewer feedback on a claim analysis
# ---------------------------------------------------------------------------
class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False, index=True)
    feedback_type = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    claim = relationship("Claim", back_populates="feedback")


# ---------------------------------------------------------------------------
# ClaimWatch – monitoring configuration for recurring re-checks
# ---------------------------------------------------------------------------
class ClaimWatch(Base):
    __tablename__ = "claim_watches"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(
        String, ForeignKey("claims.id"), unique=True, nullable=False, index=True
    )
    active = Column(Boolean, nullable=False, default=True)
    recheck_horizon_hours = Column(Integer, nullable=False, default=24)
    last_checked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    claim = relationship("Claim", back_populates="watch")


# ---------------------------------------------------------------------------
# ConfidenceHistory – tracks confidence metrics over time
# ---------------------------------------------------------------------------
class ConfidenceHistory(Base):
    __tablename__ = "confidence_history"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.id"), nullable=False, index=True)
    snapshot_id = Column(
        Integer,
        ForeignKey("analysis_snapshots.id"),
        nullable=False,
        index=True,
    )

    confidence_score = Column(Float, nullable=False)
    integrity_score = Column(Float, nullable=False)
    manipulation_risk_score = Column(Float, nullable=False)
    evidence_strength_score = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
