# ClimateTwin AI - Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 20+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **Docker** (optional) - [Download](https://www.docker.com/)

## Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/your-org/climatetwin-ai.git
cd climatetwin-ai

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

## Manual Setup

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/climatetwin

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### 3. Database Setup

If you're not using Docker, install PostgreSQL and create the database:

```sql
CREATE DATABASE climatetwin;
CREATE USER climatetwin WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE climatetwin TO climatetwin;
```

## Development Commands

### Backend Commands

```bash
# Start server with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest tests/ -v

# Run tests with coverage
pytest tests/ --cov=app --cov-report=html

# Run linting
flake8 app/
black app/
isort app/

# Run type checking
mypy app/

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## Project Structure

```
ClimateTwin-AI/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routers/         # API routes
│   │   ├── services/        # Business logic
│   │   ├── ai/              # ML models
│   │   └── middleware/      # Middleware
│   └── tests/               # Test files
│
├── datasets/                 # Climate data
├── models/                   # Trained ML models
└── docs/                     # Documentation
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/climatetwin

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
DEBUG=true

# AI/ML
MODEL_PATH=./models/trained
DATASET_PATH=./datasets
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=ClimateTwin AI
```

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check credentials in `.env`
3. Verify the database exists

### Port Already in Use

```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <process_id> /F
```

### Migration Issues

```bash
# Reset database (WARNING: destroys data)
alembic downgrade base
alembic upgrade head
```

## IDE Setup

### VS Code

Install recommended extensions:
- Python
- ESLint
- Prettier
- Tailwind CSS IntelliSense

### PyCharm

1. Configure Python interpreter to use virtual environment
2. Enable SQLAlchemy support
3. Set up run configurations

## Next Steps

1. Review the [API Documentation](./API.md)
2. Read the [Architecture Guide](./ARCHITECTURE.md)
3. Check out [Contributing Guidelines](./CONTRIBUTING.md)
