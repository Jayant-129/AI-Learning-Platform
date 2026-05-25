from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ---- Request Schemas ----


class LearnerInput(BaseModel):
    """Input schema for ML prediction requests."""

    learner_id: int
    gpa: float = 0.0
    skills: str = ""
    experience_months: int = 0
    course: str = ""
    semester: int = 1


# ---- Response Schemas ----


class PredictionResponse(BaseModel):
    """Response schema for a single prediction."""

    learner_id: int
    learner_name: str
    probability: float
    placeable: bool
    top_factors: List[str]
    predicted_at: Optional[datetime] = None


class PredictionHistoryItem(BaseModel):
    """Schema for prediction history entries."""

    id: int
    learner_id: int
    placement_probability: float
    placeable: bool
    top_factors: Optional[str] = None
    features_used: Optional[str] = None
    predicted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ModelStatusResponse(BaseModel):
    """Response schema for model status endpoint."""

    model_loaded: bool
    model_type: str
    feature_count: int
    training_samples: int
    accuracy: Optional[float] = None


class HealthResponse(BaseModel):
    """Response schema for health check."""

    status: str
    service: str
    model_loaded: bool


class RetrainResponse(BaseModel):
    """Response schema for retrain endpoint."""

    message: str
    training_samples: int
    accuracy: float


class BulkPredictionRequest(BaseModel):
    """Request schema for bulk predictions."""

    learner_ids: List[int]


class BulkPredictionResponse(BaseModel):
    """Response schema for bulk predictions."""

    predictions: List[PredictionResponse]
    total: int
