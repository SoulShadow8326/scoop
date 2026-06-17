from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    analysis = relationship("AnalysisResult", back_populates="claim", uselist=False)
    feedback = relationship("Feedback", back_populates="claim")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.id"), unique=True)
    
    classification = Column(JSON, nullable=True)
    decomposition = Column(JSON, nullable=True)
    retrieval_plan = Column(JSON, nullable=True)
    evidence = Column(JSON, nullable=True)
    source_classification = Column(JSON, nullable=True)
    structured_evidence = Column(JSON, nullable=True)
    evidence_graph = Column(JSON, nullable=True)
    belief = Column(JSON, nullable=True)
    skeptic = Column(JSON, nullable=True)
    constitution = Column(JSON, nullable=True)
    confidence = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    response = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    claim = relationship("Claim", back_populates="analysis")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.id"))
    feedback_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    claim = relationship("Claim", back_populates="feedback")
