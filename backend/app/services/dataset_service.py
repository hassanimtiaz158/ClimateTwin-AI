import os
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile

from app.models.dataset import Dataset
from app.config import settings


class DatasetService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upload(
        self,
        file: UploadFile,
        name: str,
        source: Optional[str] = None,
        region: str = "Global",
    ) -> Dataset:
        """Upload and process a climate dataset."""
        # Ensure upload directory exists
        upload_dir = os.path.join(settings.DATASET_PATH, "raw")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate file path
        file_ext = file.filename.split(".")[-1]
        file_path = os.path.join(upload_dir, f"{name}_{datetime.utcnow().timestamp()}.{file_ext}")
        
        # Save file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Count records (simplified)
        record_count = self._count_records(file_path, file_ext)
        
        # Create dataset record
        dataset = Dataset(
            name=name,
            source=source,
            region=region,
            file_path=file_path,
            record_count=record_count,
        )
        self.db.add(dataset)
        await self.db.flush()
        await self.db.refresh(dataset)
        
        return dataset

    def _count_records(self, file_path: str, file_ext: str) -> int:
        """Count records in the uploaded file."""
        try:
            if file_ext == "csv":
                with open(file_path, "r") as f:
                    return sum(1 for _ in f) - 1  # Subtract header
            return 0
        except Exception:
            return 0

    async def get(self, dataset_id: UUID) -> Optional[Dataset]:
        """Get dataset by ID."""
        result = await self.db.execute(
            select(Dataset).where(Dataset.id == dataset_id)
        )
        return result.scalar_one_or_none()

    async def list(self, skip: int = 0, limit: int = 100) -> List[Dataset]:
        """List datasets with pagination."""
        result = await self.db.execute(
            select(Dataset).offset(skip).limit(limit).order_by(Dataset.created_at.desc())
        )
        return list(result.scalars().all())
