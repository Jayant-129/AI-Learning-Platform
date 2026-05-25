from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.logger import logger
from app.database import SessionLocal
from app.models import Learner
from app.ml_service import ml_service
from app.routes.predict import router as predict_router
from app.routes.analytics import router as analytics_router
from app.schemas import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # ---- Startup ----
    logger.info("Starting Learner ML Service...")

    # Try to load existing model
    if not ml_service.load_model():
        # Train from database data
        logger.info("No saved model found. Training from database...")
        try:
            db = SessionLocal()
            learners = db.query(Learner).all()
            if learners:
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
                samples, accuracy = ml_service.train(learners_data)
                logger.info(f"Initial training complete: {samples} samples, accuracy={accuracy}")
            else:
                logger.warning("No learners in database. Creating fallback model.")
                ml_service._create_fallback_model()
            db.close()
        except Exception as e:
            logger.error(f"Failed to train initial model: {e}")
            ml_service._create_fallback_model()

    logger.info("ML Service started successfully")

    yield

    # ---- Shutdown ----
    logger.info("Shutting down ML Service...")


# Create FastAPI app
app = FastAPI(
    title="Learner Placement ML Service",
    description="AI-powered placement prediction service for the Learner & Placement Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(predict_router, tags=["Predictions"])
app.include_router(analytics_router, tags=["Analytics"])


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Service health check endpoint."""
    return HealthResponse(
        status="UP",
        service="learner-ml-service",
        model_loaded=ml_service.model is not None,
    )
