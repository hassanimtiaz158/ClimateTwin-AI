# 🌍 ClimateTwin AI

**AI-Powered Climate Scenario Simulation Platform**

ClimateTwin AI helps governments, researchers, organizations, and citizens understand how today's environmental decisions may influence climate indicators over the next 5–10 years.

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **Scenario Builder** | Create custom climate scenarios by selecting sustainability actions |
| **Projection Dashboard** | Visualize AI-generated climate projections with interactive charts |
| **Map Visualization** | Explore regional climate data on interactive maps |
| **AI Recommendations** | Get explainable AI-powered suggestions for climate action |
| **Compare Futures** | Side-by-side comparison of different scenario outcomes |
| **Report Export** | Download PDF/CSV reports of simulation results |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Tailwind CSS, Recharts, Leaflet |
| **Backend** | FastAPI, SQLAlchemy, Alembic, Pydantic |
| **Database** | PostgreSQL (Supabase compatible) |
| **AI/ML** | Scikit-learn, XGBoost, Prophet, Pandas |
| **Deployment** | Docker, Vercel (FE), Render (BE), GitHub Actions |

---

## 📁 Project Structure

```
ClimateTwin-AI/
├── frontend/          # React SPA with Tailwind CSS
├── backend/           # FastAPI REST API
│   ├── app/
│   │   ├── models/    # SQLAlchemy database models
│   │   ├── schemas/   # Pydantic request/response schemas
│   │   ├── routers/   # API route handlers
│   │   ├── services/  # Business logic layer
│   │   ├── ai/        # ML models and pipeline
│   │   └── middleware/ # Auth, CORS, rate limiting
│   └── tests/         # Backend tests
├── datasets/          # Climate data files
├── models/            # Trained ML models
├── docs/              # Documentation
└── docker-compose.yml # Container orchestration
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/climatetwin-ai.git
cd climatetwin-ai
```

### 2. Environment Setup

```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `.env` files with your configuration.

### 3. Docker Setup (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| API Redoc | http://localhost:8000/redoc |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scenarios` | Create a new scenario |
| `GET` | `/api/scenarios/{id}` | Get scenario details |
| `POST` | `/api/simulate` | Run climate simulation |
| `GET` | `/api/results/{run_id}` | Get projection results |
| `GET` | `/api/history` | List past simulations |
| `GET` | `/api/recommendations/{run_id}` | Get AI recommendations |
| `POST` | `/api/datasets/upload` | Upload climate dataset |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm run test

# Run all tests
docker-compose exec backend pytest
```

---

## 📊 Development Phases

| Phase | Timeline | Focus |
|-------|----------|-------|
| **Phase 1** | Week 1-2 | Foundation (scaffolding, DB, CI/CD) |
| **Phase 2** | Week 3-4 | Core Engine (projections, scenarios) |
| **Phase 3** | Week 5-6 | Frontend Dashboard |
| **Phase 4** | Week 7-8 | AI Recommendations & Polish |
| **Phase 5** | Week 9-10 | Testing & Launch |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/climatetwin-ai/issues)
- **Email**: support@climatetwin.ai
