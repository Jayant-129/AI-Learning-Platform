from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.database import get_db
from app.models import Learner, MLPrediction
from app.logger import logger

router = APIRouter()


@router.get("/analytics/top-learners")
async def get_top_learners(limit: int = 10, db: Session = Depends(get_db)):
    """Return top learners ranked by GPA."""
    logger.info(f"Fetching top {limit} learners by GPA")
    learners = (
        db.query(Learner)
        .filter(Learner.gpa.isnot(None))
        .order_by(Learner.gpa.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": l.id,
            "name": l.name,
            "student_id": l.student_id,
            "course": l.course,
            "gpa": l.gpa,
            "skills": l.skills,
            "experience_months": l.experience_months,
            "status": l.status,
        }
        for l in learners
    ]


@router.get("/analytics/weak-learners")
async def get_weak_learners(gpa_threshold: float = 6.5, db: Session = Depends(get_db)):
    """Return learners with GPA below the threshold (at-risk learners)."""
    logger.info(f"Fetching weak learners (GPA < {gpa_threshold})")
    learners = (
        db.query(Learner)
        .filter(Learner.gpa.isnot(None), Learner.gpa < gpa_threshold)
        .order_by(Learner.gpa.asc())
        .all()
    )
    return [
        {
            "id": l.id,
            "name": l.name,
            "student_id": l.student_id,
            "course": l.course,
            "gpa": l.gpa,
            "skills": l.skills,
            "experience_months": l.experience_months,
            "status": l.status,
        }
        for l in learners
    ]


@router.get("/analytics/batch-performance")
async def get_batch_performance(db: Session = Depends(get_db)):
    """Return average GPA and learner count grouped by course/batch."""
    logger.info("Fetching batch performance analytics")
    results = (
        db.query(
            Learner.course,
            func.count(Learner.id).label("total"),
            func.avg(Learner.gpa).label("avg_gpa"),
            func.max(Learner.gpa).label("max_gpa"),
            func.min(Learner.gpa).label("min_gpa"),
            func.avg(Learner.experience_months).label("avg_experience"),
        )
        .filter(Learner.course.isnot(None))
        .group_by(Learner.course)
        .order_by(func.avg(Learner.gpa).desc())
        .all()
    )
    return [
        {
            "course": r.course,
            "total_learners": r.total,
            "avg_gpa": round(r.avg_gpa, 2) if r.avg_gpa else None,
            "max_gpa": round(r.max_gpa, 2) if r.max_gpa else None,
            "min_gpa": round(r.min_gpa, 2) if r.min_gpa else None,
            "avg_experience_months": round(r.avg_experience, 1) if r.avg_experience else None,
        }
        for r in results
    ]


@router.get("/analytics/placement-trends")
async def get_placement_trends(db: Session = Depends(get_db)):
    """Return placement readiness segmentation: Ready / Moderate / High Risk."""
    logger.info("Fetching placement trend analytics")
    learners = db.query(Learner).filter(Learner.gpa.isnot(None)).all()

    ready = 0
    moderate = 0
    high_risk = 0
    total = len(learners)

    for l in learners:
        gpa = l.gpa or 0
        if gpa >= 8.0:
            ready += 1
        elif gpa >= 6.5:
            moderate += 1
        else:
            high_risk += 1

    # Latest ML predictions distribution
    predictions = db.query(MLPrediction).all()
    avg_probability = (
        sum(p.placement_probability for p in predictions) / len(predictions)
        if predictions else 0
    )
    placed_count = sum(1 for p in predictions if p.placeable)

    return {
        "total_learners": total,
        "placement_ready": ready,
        "moderate_risk": moderate,
        "high_risk": high_risk,
        "avg_placement_probability": round(avg_probability * 100, 1),
        "ml_placed_count": placed_count,
        "ml_total_predictions": len(predictions),
        "segments": [
            {"label": "Placement Ready", "count": ready, "color": "#10b981"},
            {"label": "Moderate Risk", "count": moderate, "color": "#f59e0b"},
            {"label": "High Risk", "count": high_risk, "color": "#ef4444"},
        ],
    }
