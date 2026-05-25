from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Learner(Base):
    """SQLAlchemy model mirroring the Spring Boot Learner entity."""

    __tablename__ = "learners"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    student_id = Column("student_id", String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    course = Column(String, nullable=True)
    semester = Column(Integer, nullable=True)
    gpa = Column(Float, nullable=True)
    skills = Column(Text, nullable=True)
    experience_months = Column("experience_months", Integer, nullable=True)
    resume_url = Column("resume_url", String, nullable=True)
    status = Column(String, nullable=False, default="ACTIVE")
    created_at = Column("created_at", DateTime, nullable=True)
    updated_at = Column("updated_at", DateTime, nullable=True)

    predictions = relationship("MLPrediction", back_populates="learner")


class MLPrediction(Base):
    """SQLAlchemy model mirroring the Spring Boot MLPrediction entity."""

    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column("learner_id", Integer, ForeignKey("learners.id"), nullable=False)
    placement_probability = Column("placement_probability", Float, nullable=False)
    placeable = Column(Boolean, nullable=False, default=False)
    top_factors = Column("top_factors", Text, nullable=True)
    features_used = Column("features_used", Text, nullable=True)
    predicted_at = Column("predicted_at", DateTime, nullable=True)

    learner = relationship("Learner", back_populates="predictions")


class User(Base):
    """Read-only reference to the users table (managed by Spring Boot)."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column("created_at", DateTime, nullable=True)
    updated_at = Column("updated_at", DateTime, nullable=True)
