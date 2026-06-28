# ===========================
# ClimateTwin AI — Production Backend
# Multi-stage build: Python 3.12 slim
# ===========================

# ── Stage 1: Build dependencies ─────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# System deps for psycopg2, xgboost
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Production image ──────────────────────────────
FROM python:3.12-slim AS runtime

# Non-root user
RUN groupadd -r climatetwin && useradd -r -g climatetwin -d /app -s /sbin/nologin climatetwin

WORKDIR /app

# Runtime system deps (libpq for asyncpg at runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY app/ ./app/
COPY alembic.ini .
COPY alembic/ ./alembic/
COPY datasets/ ./datasets/

# Create writable directories
RUN mkdir -p /app/uploads /app/datasets /app/models/trained \
    && chown -R climatetwin:climatetwin /app

USER climatetwin

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=15s \
    CMD curl -f http://localhost:8000/health || exit 1

# Production command — no --reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
