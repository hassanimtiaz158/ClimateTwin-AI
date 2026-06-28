# Deployment Guide — ClimateTwin AI

Step-by-step instructions for deploying ClimateTwin AI to production.

---

## Option A: Render (Recommended for beginners)

### 1. Push to GitHub

```bash
git add -A
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Create Render Account

Sign up at [render.com](https://render.com) using your GitHub account.

### 3. Deploy Backend

1. Click **New +** → **Web Service**
2. Connect your GitHub repo: `hassanimtiaz158/ClimateTwin-AI`
3. Configure:
   | Setting | Value |
   |---------|-------|
   | Name | `climatetwin-api` |
   | Region | Oregon (or closest to you) |
   | Branch | `main` |
   | Runtime | Python |
   | Root Directory | `backend` |
   | Build Command | `pip install -r requirements.txt && alembic upgrade head` |
   | Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
4. Add Environment Variables (see below)
5. Click **Create Web Service**

### 4. Deploy Frontend

1. Click **New +** → **Static Site**
2. Connect the same repo
3. Configure:
   | Setting | Value |
   |---------|-------|
   | Name | `climatetwin-frontend` |
   | Branch | `main` |
   | Build Command | `cd frontend && npm install && npm run build` |
   | Publish Directory | `frontend/dist` |
4. Add env var: `VITE_API_BASE_URL` = `https://climatetwin-api.onrender.com/api`
5. Click **Create Static Site**

### Render Environment Variables

Set these in the backend service's **Environment** tab:

```
DATABASE_URL          postgresql+asyncpg://... (from Render PostgreSQL)
SECRET_KEY            <generate: python -c "import secrets; print(secrets.token_urlsafe(64))">
CORS_ORIGINS          ["https://climatetwin-frontend.onrender.com"]
DEBUG                 false
```

---

## Option B: Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import `hassanimtiaz158/ClimateTwin-AI`
4. Configure:
   | Setting | Value |
   |---------|-------|
   | Framework | Vite |
   | Root Directory | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
5. Add env var: `VITE_API_BASE_URL` = your Railway backend URL + `/api`
6. Deploy

### Backend on Railway

1. Go to [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo**
3. Select your repo, set root directory to `backend`
4. Add a **PostgreSQL** plugin
5. Set env vars:
   ```
   DATABASE_URL     ${{PostgreSQL.DATABASE_URL}}
   SECRET_KEY       <generate a secret>
   CORS_ORIGINS     ["https://your-frontend.vercel.app"]
   DEBUG            false
   ```
6. Railway auto-deploys

---

## Option C: Docker (Self-hosted)

```bash
# Clone the repo
git clone https://github.com/hassanimtiaz158/ClimateTwin-AI.git
cd ClimateTwin-AI

# Create .env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your values (especially SECRET_KEY)

# Start production stack
docker compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

The app will be available at `http://localhost:80`.

---

## Option D: Local Development

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate        # macOS/Linux
pip install -r requirements.txt

# Create .env with: DATABASE_URL=sqlite+aiosqlite:///./climatetwin.db
cp .env.example .env
# Edit .env: set DEBUG=true, leave SECRET_KEY empty

uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Generating a Secret Key

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))"
```

---

## Environment Variables Reference

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `sqlite+aiosqlite:///./climatetwin.db` | Database connection string |
| `SECRET_KEY` | **Production** | `""` (empty) | JWT signing secret |
| `CORS_ORIGINS` | Yes | localhost origins | Allowed frontend origins (JSON array or comma-separated) |
| `DEBUG` | No | `false` | Enable debug mode, auto-create tables, show API docs |
| `API_HOST` | No | `0.0.0.0` | Bind host |
| `API_PORT` | No | `8000` | Bind port |
| `RATE_LIMIT_PER_MINUTE` | No | `60` | Max requests/min/client |
| `DEFAULT_FORECAST_YEARS` | No | `10` | Projection horizon |
| `DATASET_PATH` | No | `./datasets` | Climate data directory |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | `http://localhost:8000/api` | Backend API URL |
| `VITE_APP_NAME` | No | `ClimateTwin AI` | Display name |

---

## Troubleshooting

### Backend won't connect to PostgreSQL

- Ensure `DATABASE_URL` uses the async driver: `postgresql+asyncpg://`
- Check the database is reachable from the hosting platform
- Render: use the **Connection string** from the database info panel

### Frontend shows "Cannot connect to server"

- Check `VITE_API_BASE_URL` is set correctly
- Verify CORS_ORIGINS on backend includes your frontend URL
- Check the backend is healthy: `GET /health`

### "SECRET_KEY is empty" warning in logs

- Generate a secret key and set it as an env var
- Use `python -c "import secrets; print(secrets.token_urlsafe(64))"`

### Database tables don't exist

- Run `alembic upgrade head` (PostgreSQL)
- Or set `DEBUG=true` temporarily to auto-create tables (SQLite only)
