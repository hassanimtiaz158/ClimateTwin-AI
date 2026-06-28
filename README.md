# ClimateTwin AI

**AI-Powered Climate Scenario Simulation Platform**

ClimateTwin AI helps governments, researchers, organizations, and citizens understand how today's environmental decisions influence climate indicators over the next 5-10 years. Users create custom scenarios with sustainability sliders, run AI projections, and receive actionable recommendations.

---

## Features

- **Scenario Builder** -- 3-step wizard to configure location, actions, and target year
- **Projection Dashboard** -- Interactive charts showing temperature, CO2, air quality, forest cover, biodiversity, water stress, heatwave frequency, and flood risk
- **AI Recommendations** -- Data-driven suggestions based on scenario gaps and projection trends
- **Compare Futures** -- Side-by-side comparison of multiple scenario outcomes
- **History** -- Browse and re-run past simulations
- **Report Export** -- JSON and HTML reports for single scenarios and comparisons
- **Demo Mode** -- 4 one-click climate scenarios for instant exploration

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Recharts, Zustand, React Router |
| Backend | FastAPI, SQLAlchemy (async), Alembic, Pydantic v2 |
| Database | PostgreSQL (prod) / SQLite (dev) |
| AI/ML | XGBoost, NumPy, Pandas, custom projection engine |
| Deployment | Docker, Vercel (FE), Render/Railway (BE), Docker Compose |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (or SQLite for local dev)
- Docker (optional)

### Local Development

```bash
git clone https://github.com/hassanimtiaz158/ClimateTwin-AI.git
cd ClimateTwin-AI
```

**Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate              # Windows
source venv/bin/activate           # macOS/Linux

pip install -r requirements.txt

cp .env.example .env
# Edit .env: DEBUG=true, DATABASE_URL=sqlite+aiosqlite:///./climatetwin.db

uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. API docs at http://localhost:8000/docs.

### Docker

```bash
docker compose up -d --build
```

Frontend: http://localhost:3000 | Backend: http://localhost:8000

## Deployment

See [DEPLOY.md](DEPLOY.md) for full instructions.

### Render (recommended)

1. Push to GitHub
2. Create a **Web Service** (backend) with root directory `backend`
3. Create a **Static Site** (frontend) with root directory `frontend`
4. Set environment variables (see below)
5. Deploy

### Vercel + Railway

1. Deploy frontend to Vercel (root: `frontend`)
2. Deploy backend to Railway (root: `backend`) with PostgreSQL plugin
3. Set `VITE_API_BASE_URL` to your Railway URL

### Environment Variables

**Backend** (set in Render/Railway dashboard):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string (async) |
| `SECRET_KEY` | Random 64-char string (generate with `python -c "import secrets; print(secrets.token_urlsafe(64))"`) |
| `CORS_ORIGINS` | Your frontend URL as JSON array, e.g. `["https://climatetwin.vercel.app"]` |
| `DEBUG` | `false` |

**Frontend:**

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | Backend API URL, e.g. `https://climatetwin-api.onrender.com/api` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info |
| `GET` | `/health` | Health check |
| `POST` | `/api/scenarios` | Create scenario |
| `GET` | `/api/scenarios` | List scenarios |
| `GET` | `/api/scenarios/{id}` | Get scenario |
| `PATCH` | `/api/scenarios/{id}` | Update scenario |
| `DELETE` | `/api/scenarios/{id}` | Delete scenario |
| `POST` | `/api/simulate` | Run simulation |
| `GET` | `/api/results/{run_id}` | Get results |
| `GET` | `/api/history` | Simulation history |
| `GET` | `/api/recommendations/{run_id}` | AI recommendations |
| `POST` | `/api/datasets/upload` | Upload dataset |

## Project Structure

```
ClimateTwin-AI/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages (6 pages)
│   │   ├── services/         # API client, exports
│   │   ├── store/            # Zustand state
│   │   ├── hooks/            # Custom React hooks
│   │   └── types/            # TypeScript types
│   ├── vercel.json           # Vercel config
│   └── vite.config.ts        # Vite config
├── backend/                  # FastAPI REST API
│   ├── app/
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # API routes (6 routers)
│   │   ├── services/         # Business logic
│   │   ├── ai/               # ML pipeline, projections
│   │   └── middleware/       # Timing middleware
│   ├── tests/                # 126 tests
│   ├── alembic/              # Database migrations
│   ├── Dockerfile            # Production Docker build
│   └── requirements.txt
├── docker-compose.yml        # Development stack
├── docker-compose.prod.yml   # Production stack
├── render.yaml               # Render blueprint
└── DEPLOY.md                 # Deployment guide
```

## Testing

```bash
# Backend (126 tests)
cd backend
pytest tests/ -v

# Frontend (19 tests)
cd frontend
npm run test

# Type check
cd frontend
npm run typecheck
```

## Climate Actions (Sliders)

| Slider | Range | Effect |
|--------|-------|--------|
| Reforestation | 0.0 - 1.0 | Tree planting, carbon sequestration |
| Renewable Energy | 0.0 - 1.0 | Solar, wind adoption |
| EV Adoption | 0.0 - 1.0 | Electric vehicle transition |
| Emission Reduction | 0.0 - 1.0 | CO2 cut targets |
| Public Transit | 0.0 - 1.0 | Public transportation expansion |
| Water Conservation | 0.0 - 1.0 | Water-saving policies |

## Climate Indicators

Temperature change, CO2 level, air quality index, forest cover, biodiversity score, water stress, heatwave frequency, flood risk.

## License

MIT License -- see [LICENSE](LICENSE).

## Support

- **Docs**: [docs/](docs/), [DEPLOY.md](DEPLOY.md)
- **Issues**: [GitHub Issues](https://github.com/hassanimtiaz158/ClimateTwin-AI/issues)
