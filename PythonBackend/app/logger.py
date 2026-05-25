from loguru import logger
import sys
import os

# Remove default logger
logger.remove()

# Structured JSON logging to stdout
logger.add(
    sys.stdout,
    level="INFO",
    serialize=True,
)

# File logging with daily rotation
log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
os.makedirs(log_dir, exist_ok=True)

logger.add(
    os.path.join(log_dir, "ml_service.log"),
    rotation="1 day",
    retention="30 days",
    serialize=True,
    level="DEBUG",
)
