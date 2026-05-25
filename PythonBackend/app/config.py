from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql://admin:admin123@localhost:5432/learner_db"
    MODEL_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "models", "placement_model.joblib"
    )
    APP_NAME: str = "Learner ML Service"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
