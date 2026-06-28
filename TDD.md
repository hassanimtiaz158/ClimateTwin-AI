
# ClimateTwin AI - Technical Design Document (TDD)

## Tech Stack
Frontend:
- React
- Tailwind CSS
- Leaflet
- Recharts

Backend:
- FastAPI
- PostgreSQL (Supabase)
- SQLAlchemy
- Alembic
- Redis (optional)

AI
- Python
- Scikit-learn
- XGBoost
- Prophet
- Pandas

Deployment
- Vercel
- Render
- Docker
- GitHub Actions

## Architecture
React UI
    |
FastAPI REST API
    |
Service Layer
    |
Projection Engine ---- AI Recommendation Service
    |
PostgreSQL

## Modules
- auth
- scenarios
- projections
- datasets
- recommendations
- reports

## Database
users
scenarios
simulation_runs
projection_results
datasets

## API
POST /api/scenarios
POST /api/simulate
GET /api/results/{id}
GET /api/history
GET /api/recommendations/{id}

## AI Pipeline
1. Load historical climate data
2. Clean & normalize
3. Generate scenario variables
4. Run forecasting model
5. Produce projections
6. Generate explanation
7. Return charts + metrics

## Security
JWT
Rate limiting
Input validation
HTTPS

## Testing
Pytest
Frontend unit tests
API integration tests
