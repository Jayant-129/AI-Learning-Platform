from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Learner, MLPrediction
from app.schemas import (
    LearnerInput,
    PredictionResponse,
    PredictionHistoryItem,
    ModelStatusResponse,
    RetrainResponse,
    BulkPredictionRequest,
    BulkPredictionResponse,
)
from app.ml_service import ml_service
from app.logger import logger

router = APIRouter()


@router.post("/predict/{learner_id}", response_model=PredictionResponse)
async def predict_placement(learner_id: int, data: LearnerInput, db: Session = Depends(get_db)):
    """Run ML prediction for a specific learner."""
    logger.info(f"Prediction requested for learner_id={learner_id}")

    # Fetch learner from DB
    learner = db.query(Learner).filter(Learner.id == learner_id).first()
    if not learner:
        raise HTTPException(status_code=404, detail=f"Learner not found: {learner_id}")

    # Use request data (which comes from Spring backend with learner's actual values)
    probability, placeable, top_factors = ml_service.predict(
        gpa=data.gpa,
        experience_months=data.experience_months,
        skills=data.skills,
        semester=data.semester,
        course=data.course,
    )

    # Save prediction to DB
    prediction = MLPrediction(
        learner_id=learner_id,
        placement_probability=probability,
        placeable=placeable,
        top_factors=",".join(top_factors),
        features_used=str(data.model_dump()),
        predicted_at=datetime.utcnow(),
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    logger.info(f"Prediction result for learner {learner_id}: probability={probability}")

    return PredictionResponse(
        learner_id=learner_id,
        learner_name=learner.name,
        probability=probability,
        placeable=placeable,
        top_factors=top_factors,
        predicted_at=prediction.predicted_at,
    )


@router.get("/history/{learner_id}", response_model=list[PredictionHistoryItem])
async def get_prediction_history(learner_id: int, db: Session = Depends(get_db)):
    """Get prediction history for a specific learner."""
    logger.info(f"Fetching prediction history for learner_id={learner_id}")

    predictions = (
        db.query(MLPrediction)
        .filter(MLPrediction.learner_id == learner_id)
        .order_by(MLPrediction.predicted_at.desc())
        .all()
    )

    return [PredictionHistoryItem.model_validate(p) for p in predictions]


@router.post("/retrain", response_model=RetrainResponse)
async def retrain_model(db: Session = Depends(get_db)):
    """Retrain the ML model using current database data."""
    logger.info("Model retrain requested")

    learners = db.query(Learner).all()
    learners_data = [
        {
            "gpa": l.gpa,
            "experience_months": l.experience_months,
            "skills": l.skills,
            "semester": l.semester,
            "course": l.course,
        }
        for l in learners
    ]

    training_samples, accuracy = ml_service.train(learners_data)

    return RetrainResponse(
        message="Model retrained successfully",
        training_samples=training_samples,
        accuracy=accuracy,
    )


@router.get("/model/status", response_model=ModelStatusResponse)
async def get_model_status():
    """Get current model status and info."""
    return ModelStatusResponse(
        model_loaded=ml_service.model is not None,
        model_type="RandomForestClassifier" if ml_service.model else "None",
        feature_count=len(ml_service.feature_names),
        training_samples=ml_service.training_samples,
        accuracy=ml_service.accuracy,
    )


@router.post("/predict/bulk", response_model=BulkPredictionResponse)
async def predict_bulk(request: BulkPredictionRequest, db: Session = Depends(get_db)):
    """Run predictions for multiple learners at once."""
    logger.info(f"Bulk prediction requested for {len(request.learner_ids)} learners")

    predictions = []
    for learner_id in request.learner_ids:
        learner = db.query(Learner).filter(Learner.id == learner_id).first()
        if not learner:
            continue

        probability, placeable, top_factors = ml_service.predict(
            gpa=learner.gpa or 0.0,
            experience_months=learner.experience_months or 0,
            skills=learner.skills or "",
            semester=learner.semester or 1,
            course=learner.course or "",
        )

        # Save prediction
        pred = MLPrediction(
            learner_id=learner_id,
            placement_probability=probability,
            placeable=placeable,
            top_factors=",".join(top_factors),
            features_used=f"gpa={learner.gpa},exp={learner.experience_months},skills={learner.skills}",
            predicted_at=datetime.utcnow(),
        )
        db.add(pred)

        predictions.append(PredictionResponse(
            learner_id=learner_id,
            learner_name=learner.name,
            probability=probability,
            placeable=placeable,
            top_factors=top_factors,
            predicted_at=pred.predicted_at,
        ))

    db.commit()

    return BulkPredictionResponse(predictions=predictions, total=len(predictions))
