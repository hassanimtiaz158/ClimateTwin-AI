from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings


def setup_middleware(app: FastAPI):
    """Setup all middleware for the FastAPI app."""
    
    # Request timing middleware
    @app.middleware("http")
    async def add_process_time_header(request, call_next):
        import time
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
