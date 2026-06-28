"""
ClimateTwin AI — Middleware

Request-level middleware applied to every incoming request.
"""

from __future__ import annotations

import logging
import time

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestTimingMiddleware(BaseHTTPMiddleware):
    """Attach an X-Process-Time header to every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        response: Response = await call_next(request)
        elapsed = time.perf_counter() - start
        response.headers["X-Process-Time"] = f"{elapsed:.4f}"
        logger.debug(
            "%s %s %s %.4fs",
            request.method,
            request.url.path,
            response.status_code,
            elapsed,
        )
        return response


def register_middleware(app: FastAPI) -> None:
    """Add all application middleware to the FastAPI app."""
    app.add_middleware(RequestTimingMiddleware)
