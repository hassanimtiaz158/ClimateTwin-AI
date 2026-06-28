import os
import re
import logging
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile

from app.models.dataset import Dataset
from app.config import settings

logger = logging.getLogger(__name__)

MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50 MB


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
        # Sanitize name (remove path separators)
        safe_name = re.sub(r'[^\w\-]', '_', name)[:100]

        # Validate file extension
        if not file.filename or "." not in file.filename:
            raise ValueError("File must have a valid extension")
        file_ext = file.filename.rsplit(".", 1)[-1].lower()

        # Check file size
        content = await file.read()
        if len(content) > MAX_UPLOAD_SIZE:
            raise ValueError(f"File too large. Maximum size is {MAX_UPLOAD_SIZE // (1024*1024)}MB")

        # Save file
        upload_dir = os.path.join(settings.DATASET_PATH, "raw")
        os.makedirs(upload_dir, exist_ok=True)
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        file_path = os.path.join(upload_dir, f"{safe_name}_{timestamp}.{file_ext}")

        with open(file_path, "wb") as f:
            f.write(content)

        record_count = self._count_records(file_path, file_ext)

        dataset = Dataset(
            name=safe_name,
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
                    return sum(1 for _ in f) - 1
            return 0
        except Exception:
            logger.warning("Failed to count records in %s", file_path)
            return 0

    async def get(self, dataset_id: UUID) -> Optional[Dataset]:
        """Get dataset by ID."""
        result = await self.db.execute(
            select(Dataset).where(Dataset.id == dataset_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self, skip: int = 0, limit: int = 100) -> List[Dataset]:
        """List datasets with pagination."""
        result = await self.db.execute(
            select(Dataset).offset(skip).limit(limit).order_by(Dataset.created_at.desc())
        )
        return list(result.scalars().all())
