import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder
import joblib
from typing import List, Tuple, Optional

from app.logger import logger
from app.config import get_settings

settings = get_settings()


class PlacementMLService:
    """Machine Learning service for placement prediction."""

    def __init__(self):
        self.model: Optional[RandomForestClassifier] = None
        self.label_encoder = LabelEncoder()
        self.feature_names = ["gpa", "experience_months", "skill_count", "semester", "course_encoded"]
        self.training_samples = 0
        self.accuracy = 0.0
        self._known_courses: List[str] = []

    def _encode_course(self, course: str) -> int:
        """Encode a course name to a numeric value."""
        if not course:
            return 0
        course_lower = course.lower().strip()
        if course_lower in [c.lower() for c in self._known_courses]:
            idx = [c.lower() for c in self._known_courses].index(course_lower)
            return idx + 1
        return 0

    def _extract_features(self, gpa: float, experience_months: int, skills: str,
                          semester: int, course: str) -> np.ndarray:
        """Extract feature vector from learner attributes."""
        skill_count = len([s.strip() for s in skills.split(",") if s.strip()]) if skills else 0
        course_encoded = self._encode_course(course)

        return np.array([[
            gpa if gpa else 0.0,
            experience_months if experience_months else 0,
            skill_count,
            semester if semester else 1,
            course_encoded,
        ]])

    def train(self, learners_data: List[dict]) -> Tuple[int, float]:
        """Train the model on learner data.

        Uses a heuristic labeling approach: learners with GPA >= 7.0,
        experience > 3 months, and >= 3 skills are labeled as 'placeable'.
        """
        logger.info(f"Training ML model with {len(learners_data)} samples")

        if len(learners_data) < 3:
            logger.warning("Not enough data to train. Using fallback heuristic model.")
            self._create_fallback_model()
            return 0, 0.0

        # Collect all courses for encoding
        self._known_courses = list(set(
            d.get("course", "") for d in learners_data if d.get("course")
        ))

        # Build feature matrix and labels
        X = []
        y = []

        for learner in learners_data:
            gpa = learner.get("gpa", 0.0) or 0.0
            exp = learner.get("experience_months", 0) or 0
            skills = learner.get("skills", "") or ""
            semester = learner.get("semester", 1) or 1
            course = learner.get("course", "") or ""

            skill_count = len([s.strip() for s in skills.split(",") if s.strip()]) if skills else 0

            features = [
                gpa,
                exp,
                skill_count,
                semester,
                self._encode_course(course),
            ]
            X.append(features)

            # Heuristic label: placeable if good GPA + some experience + skills
            placeable = 1 if (gpa >= 7.0 and exp >= 3 and skill_count >= 3) else 0
            y.append(placeable)

        X = np.array(X)
        y = np.array(y)

        # Ensure we have both classes
        if len(set(y)) < 2:
            logger.warning("Only one class in training data. Adding synthetic minority sample.")
            # Add a synthetic sample for the missing class
            if 1 not in y:
                X = np.vstack([X, [9.0, 12, 5, 8, 1]])
                y = np.append(y, 1)
            else:
                X = np.vstack([X, [3.0, 0, 0, 1, 0]])
                y = np.append(y, 0)

        # Train RandomForest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=5,
            random_state=42,
            class_weight="balanced",
        )
        self.model.fit(X, y)
        self.training_samples = len(X)

        # Cross-validation accuracy
        try:
            cv_folds = min(5, len(X))
            if cv_folds >= 2:
                scores = cross_val_score(self.model, X, y, cv=cv_folds, scoring="accuracy")
                self.accuracy = round(float(scores.mean()), 4)
            else:
                self.accuracy = 0.0
        except Exception as e:
            logger.warning(f"Cross-validation failed: {e}")
            self.accuracy = 0.0

        # Save model
        self._save_model()

        logger.info(
            f"Model trained successfully. Samples: {self.training_samples}, "
            f"Accuracy: {self.accuracy}"
        )
        return self.training_samples, self.accuracy

    def predict(self, gpa: float, experience_months: int, skills: str,
                semester: int, course: str) -> Tuple[float, bool, List[str]]:
        """Predict placement probability for a learner."""
        if self.model is None:
            logger.warning("No model loaded, using fallback heuristic")
            return self._fallback_predict(gpa, experience_months, skills, semester)

        features = self._extract_features(gpa, experience_months, skills, semester, course)

        try:
            probability = float(self.model.predict_proba(features)[0][1])
            probability = round(probability, 4)
            placeable = probability >= 0.5

            # Compute top factors from feature importances
            top_factors = self._get_top_factors(
                gpa, experience_months, skills, semester, course
            )

            logger.info(
                f"Prediction: probability={probability}, placeable={placeable}"
            )
            return probability, placeable, top_factors
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return self._fallback_predict(gpa, experience_months, skills, semester)

    def _get_top_factors(self, gpa: float, experience_months: int, skills: str,
                         semester: int, course: str) -> List[str]:
        """Generate human-readable top factors influencing the prediction."""
        skill_count = len([s.strip() for s in skills.split(",") if s.strip()]) if skills else 0

        factors = []

        if self.model is not None:
            importances = self.model.feature_importances_
            feature_importance = list(zip(self.feature_names, importances))
            feature_importance.sort(key=lambda x: x[1], reverse=True)

            for name, importance in feature_importance[:3]:
                if name == "gpa":
                    factors.append(f"GPA: {gpa} (impact: {importance:.1%})")
                elif name == "experience_months":
                    factors.append(f"Experience: {experience_months} months (impact: {importance:.1%})")
                elif name == "skill_count":
                    factors.append(f"Skills: {skill_count} skills (impact: {importance:.1%})")
                elif name == "semester":
                    factors.append(f"Semester: {semester} (impact: {importance:.1%})")
                elif name == "course_encoded":
                    factors.append(f"Course: {course} (impact: {importance:.1%})")
        else:
            factors = [
                f"GPA: {gpa}",
                f"Experience: {experience_months} months",
                f"Skills: {skill_count}",
            ]

        return factors

    def _fallback_predict(self, gpa: float, experience_months: int, skills: str,
                          semester: int) -> Tuple[float, bool, List[str]]:
        """Simple heuristic fallback when no ML model is available."""
        gpa = gpa or 0.0
        experience = experience_months or 0
        skill_count = len([s.strip() for s in skills.split(",") if s.strip()]) if skills else 0

        probability = min(
            1.0,
            (gpa / 10.0) * 0.4 + (experience / 24.0) * 0.3 + (skill_count / 10.0) * 0.3,
        )
        probability = round(probability, 4)
        placeable = probability >= 0.5

        top_factors = [
            f"GPA: {gpa}",
            f"Experience: {experience} months",
            f"Skills: {skill_count}",
        ]

        return probability, placeable, top_factors

    def _create_fallback_model(self):
        """Create a simple model with synthetic data for when real data is insufficient."""
        X = np.array([
            [9.0, 12, 5, 8, 1],
            [8.5, 6, 4, 6, 2],
            [7.0, 3, 3, 4, 1],
            [5.0, 0, 1, 2, 0],
            [4.0, 0, 0, 1, 0],
            [6.5, 1, 2, 3, 2],
        ])
        y = np.array([1, 1, 1, 0, 0, 0])

        self.model = RandomForestClassifier(
            n_estimators=50, max_depth=3, random_state=42
        )
        self.model.fit(X, y)
        self.training_samples = len(X)
        self.accuracy = 0.0
        self._known_courses = ["Computer Science", "Information Technology"]
        logger.info("Fallback model created with synthetic data")

    def _save_model(self):
        """Save the trained model to disk."""
        try:
            model_dir = os.path.dirname(settings.MODEL_PATH)
            os.makedirs(model_dir, exist_ok=True)

            model_data = {
                "model": self.model,
                "known_courses": self._known_courses,
                "training_samples": self.training_samples,
                "accuracy": self.accuracy,
                "feature_names": self.feature_names,
            }
            joblib.dump(model_data, settings.MODEL_PATH)
            logger.info(f"Model saved to {settings.MODEL_PATH}")
        except Exception as e:
            logger.error(f"Failed to save model: {e}")

    def load_model(self) -> bool:
        """Load a previously trained model from disk."""
        try:
            if os.path.exists(settings.MODEL_PATH):
                model_data = joblib.load(settings.MODEL_PATH)
                self.model = model_data["model"]
                self._known_courses = model_data.get("known_courses", [])
                self.training_samples = model_data.get("training_samples", 0)
                self.accuracy = model_data.get("accuracy", 0.0)
                self.feature_names = model_data.get("feature_names", self.feature_names)
                logger.info(f"Model loaded from {settings.MODEL_PATH}")
                return True
            else:
                logger.info("No saved model found")
                return False
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False


# Singleton instance
ml_service = PlacementMLService()
