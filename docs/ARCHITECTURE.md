# ClimateTwin AI - Architecture Guide

## System Overview

ClimateTwin AI follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Scenario │ │Dashboard │ │ Compare  │ │   Maps   │      │
│  │ Builder  │ │  Charts  │ │  Views   │ │ Leaflet  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                    REST API (JSON)
                           │
┌─────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Scenarios│ │Simulation│ │ Results  │ │   AI     │      │
│  │  Router  │ │  Router  │ │  Router  │ │ Recs     │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Service Layer                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │ Scenario │ │Simulation│ │Projection│             │  │
│  │  │ Service  │ │ Service  │ │ Engine   │             │  │
│  │  └──────────┘ └──────────┘ └──────────┘             │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   AI Pipeline                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │ Data     │ │Forecasting│ │Explainer │             │  │
│  │  │ Loader   │ │ Models   │ │          │             │  │
│  │  └──────────┘ └──────────┘ └──────────┘             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │PostgreSQL│ │  Redis   │ │  File    │                    │
│  │   (DB)   │ │ (Cache)  │ │ Storage  │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (React + Tailwind)

**Responsibilities:**
- User interface rendering
- State management (Zustand)
- API communication (Axios)
- Data visualization (Recharts, Leaflet)

**Key Features:**
- Responsive design with Tailwind CSS
- Client-side routing with React Router
- Interactive charts and maps
- Real-time updates

### 2. Backend (FastAPI)

**Responsibilities:**
- REST API endpoints
- Request validation (Pydantic)
- Database operations (SQLAlchemy)
- Business logic execution

**Key Features:**
- Async/await for high performance
- Automatic API documentation (Swagger/ReDoc)
- Type-safe request/response handling
- Middleware support

### 3. AI Pipeline

**Responsibilities:**
- Data preprocessing
- Model training/inference
- Projection generation
- Explainability

**Key Features:**
- Modular forecasting models
- Ensemble methods
- Feature importance analysis
- Confidence intervals

### 4. Data Layer

**Responsibilities:**
- Persistent storage
- Caching
- File management

**Key Features:**
- PostgreSQL for structured data
- Redis for caching (optional)
- File storage for datasets

## Data Flow

### Scenario Creation Flow

```
User Input → Frontend Validation → API Request → Schema Validation
    → Scenario Service → Database Insert → Response
```

### Simulation Flow

```
Scenario ID → Simulation Service → Create Run Record
    → Projection Engine → AI Pipeline → Generate Projections
    → Save Results → Return Response
```

### Results Retrieval Flow

```
Run ID → Results Service → Query Database
    → Format Response → Return to Frontend
```

## Database Schema

### Entity Relationship

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Users    │     │  Scenarios  │     │Simulation   │
│─────────────│────>│─────────────│────>│Runs         │
│ id          │     │ id          │     │ id          │
│ email       │     │ user_id     │     │ scenario_id │
│ name        │     │ name        │     │ status      │
│ role        │     │ region      │     │ started_at  │
└─────────────┘     │ actions     │     │ completed_at│
                    └─────────────┘     └─────────────┘
                                               │
                                               v
                    ┌─────────────┐     ┌─────────────┐
                    │   Datasets  │     │ Projections │
                    │─────────────│     │─────────────│
                    │ id          │     │ id          │
                    │ name        │     │ run_id      │
                    │ source      │     │ year        │
                    │ region      │     │ value       │
                    └─────────────┘     └─────────────┘
```

## Security Considerations

### Authentication (Future)

- JWT-based authentication
- Role-based access control
- Secure password hashing

### API Security

- Input validation on all endpoints
- Rate limiting
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)

### Data Security

- Environment variable management
- Secure file uploads
- Database connection encryption

## Scalability

### Horizontal Scaling

- Stateless API servers
- Load balancing support
- Container orchestration (Docker/Kubernetes)

### Vertical Scaling

- Database connection pooling
- Async I/O operations
- Caching strategies

### Performance Optimizations

- Redis caching for frequent queries
- Database indexing
- API response compression
- Frontend code splitting

## Monitoring

### Health Checks

- `/health` endpoint for API status
- Database connection monitoring
- Memory/CPU usage tracking

### Logging

- Structured logging
- Request/response logging
- Error tracking

### Metrics

- API response times
- Simulation completion rates
- User engagement metrics

## Future Enhancements

### Phase 2

- WebSocket for real-time updates
- Background task processing (Celery)
- Advanced ML models (Prophet, LSTM)

### Phase 3

- Satellite data integration
- IoT sensor data
- Multi-region deployment

### Phase 4

- Mobile app support
- Offline capabilities
- Collaborative features
