# AI-Powered Learner & Placement Intelligence Platform

A full-stack, multi-service platform for learner tracking, placement prediction, and real-time notifications.

## Architecture

| Service | Tech Stack | Port |
|---------|-----------|------|
| **Spring Boot Backend** | Java 21, Spring Boot 4.x, JPA, JWT | 8080 |
| **React Frontend** | React 19, Vite, TailwindCSS, Recharts | 3000 |
| **Python ML Service** | FastAPI, scikit-learn, pandas | 8000 |
| **Node Notification Service** | Express, Socket.IO, Winston | 5000 |
| **PostgreSQL** | PostgreSQL 15 | 5432 |

## Quick Start

```bash
# Start all services
docker-compose up --build

# Rebuild a single service
docker-compose up --build spring-backend

# View logs
docker-compose logs -f spring-backend

# Stop all
docker-compose down

# Stop and clear database
docker-compose down -v
```

## Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| ML Service | http://localhost:8000 |
| Notifications | http://localhost:5000 |
| PostgreSQL | localhost:5432 |

## Individual Service Development

```bash
# Spring Boot (requires Java 21 + Maven)
cd backend && ./mvnw spring-boot:run

# React Frontend
cd learningFrontend && npm install && npm run dev

# Python ML Service
cd PythonBackend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

# Node Notifications
cd nodejsBackend && npm install && npm run dev
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@learner.com | admin123 |

## API Documentation

- Backend: http://localhost:8080/swagger-ui.html (if enabled)
- ML Service: http://localhost:8000/docs (FastAPI auto-docs)
