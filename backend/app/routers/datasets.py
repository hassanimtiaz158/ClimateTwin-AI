"""
Datasets Router - Upload and manage climate datasets.
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.dataset import DatasetResponse
from app.services.dataset_service import DatasetService

router = APIRouter()

ALLOWED_EXTENSIONS = {".csv", ".parquet", ".json"}


@router.post(
    "/upload",
    response_model=DatasetResponse,
    status_code=201,
    summary="Upload a climate dataset",
)
async def upload_dataset(
    file: UploadFile = File(..., description="Dataset file (CSV, Parquet, JSON)"),
    name: str = Form(..., description="Dataset name"),
    source: Optional[str] = Form(None, description="Data source (e.g., NOAA)"),
    region: str = Form("Global", description="Region covered"),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a climate dataset for use in simulations.

    Supported formats: CSV, Parquet, JSON
    """
    # Validate file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    service = DatasetService(db)
    dataset = await service.upload(file, name=name, source=source, region=region)
    return dataset


@router.get(
    "/",
    response_model=List[DatasetResponse],
    summary="List all datasets",
)
async def list_datasets(
    skip: int = Form(0),
    limit: int = Form(100),
    db: AsyncSession = Depends(get_db),
):
    """List all uploaded datasets with pagination."""
    service = DatasetService(db)
    datasets = await service.list(skip=skip, limit=limit)
    return datasets


@router.get(
    "/{dataset_id}",
    response_model=DatasetResponse,
    summary="Get dataset details",
)
async def get_dataset(
    dataset_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve metadata for a specific dataset."""
    service = DatasetService(db)
    dataset = await service.get(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset
