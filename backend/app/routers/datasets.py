from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.schemas.dataset import DatasetResponse
from app.services.dataset_service import DatasetService

router = APIRouter()


@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    source: Optional[str] = Form(None),
    region: str = Form("Global"),
    db: AsyncSession = Depends(get_db),
):
    """Upload a climate dataset."""
    service = DatasetService(db)
    
    # Validate file type
    if not file.filename.endswith(('.csv', '.parquet', '.json')):
        raise HTTPException(status_code=400, detail="Invalid file type. Supported: CSV, Parquet, JSON")
    
    dataset = await service.upload(file, name=name, source=source, region=region)
    return dataset


@router.get("/", response_model=List[DatasetResponse])
async def list_datasets(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """List all datasets."""
    service = DatasetService(db)
    datasets = await service.list(skip=skip, limit=limit)
    return datasets


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get dataset by ID."""
    service = DatasetService(db)
    dataset = await service.get(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset
