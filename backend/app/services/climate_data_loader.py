"""
Climate Data Loader Service
───────────────────────────
Loads and validates climate CSV data with Pydantic schemas.
"""

import csv
import os
import logging
from typing import List, Dict, Optional
from datetime import datetime

from pydantic import BaseModel, Field, field_validator, ValidationError

logger = logging.getLogger(__name__)


# ── Pydantic Schema for CSV Row ───────────────────────────────
class ClimateDataRecord(BaseModel):
    """A single row of climate data validated by Pydantic."""

    year: int = Field(..., ge=1900, le=2100, description="Year of the record")
    temperature: float = Field(..., ge=-50.0, le=60.0, description="Temperature in Celsius")
    co2_level: float = Field(..., ge=150.0, le=1000.0, description="CO2 level in ppm")
    air_quality_index: float = Field(..., ge=0.0, le=500.0, description="Air quality index (0-500)")
    forest_cover: float = Field(..., ge=0.0, le=100.0, description="Forest cover percentage")
    biodiversity_score: float = Field(..., ge=0.0, le=1.0, description="Biodiversity score (0-1)")
    flood_risk: float = Field(..., ge=0.0, le=1.0, description="Flood risk score (0-1)")
    heatwave_frequency: int = Field(..., ge=0, le=365, description="Heatwave days per year")

    @field_validator("temperature")
    @classmethod
    def validate_temperature(cls, v: float) -> float:
        if v < -60 or v > 60:
            raise ValueError(f"Temperature {v}C is outside valid range (-60 to 60)")
        return round(v, 2)

    @field_validator("co2_level")
    @classmethod
    def validate_co2(cls, v: float) -> float:
        if v < 150 or v > 1000:
            raise ValueError(f"CO2 level {v} ppm is outside valid range (150-1000)")
        return round(v, 2)


class ClimateDataset(BaseModel):
    """A validated collection of climate data records."""

    region: str
    records: List[ClimateDataRecord]
    source: Optional[str] = None
    file_path: Optional[str] = None


# ── CSV Loader ────────────────────────────────────────────────
class ClimateDataLoader:
    """Loads and validates climate data from CSV files."""

    REQUIRED_COLUMNS = [
        "year", "temperature", "co2_level", "air_quality_index",
        "forest_cover", "biodiversity_score", "flood_risk", "heatwave_frequency"
    ]

    def __init__(self, data_dir: str = "data/sample"):
        self.data_dir = data_dir
        self._cache: Dict[str, ClimateDataset] = {}

    def load_csv(self, filename: str, region: str = "Global") -> ClimateDataset:
        """Load and validate a climate CSV file."""
        if filename in self._cache:
            return self._cache[filename]

        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Climate data file not found: {file_path}")

        logger.info(f"Loading climate data from {file_path}")

        records: List[ClimateDataRecord] = []
        validation_errors: List[Dict] = []

        with open(file_path, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)

            # Validate headers
            if reader.fieldnames is None:
                raise ValueError("CSV file is empty")
            
            missing_cols = set(self.REQUIRED_COLUMNS) - set(reader.fieldnames)
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")

            # Load and validate each row
            for row_num, row in enumerate(reader, start=2):
                try:
                    record = ClimateDataRecord(
                        year=int(row["year"]),
                        temperature=float(row["temperature"]),
                        co2_level=float(row["co2_level"]),
                        air_quality_index=float(row["air_quality_index"]),
                        forest_cover=float(row["forest_cover"]),
                        biodiversity_score=float(row["biodiversity_score"]),
                        flood_risk=float(row["flood_risk"]),
                        heatwave_frequency=int(row["heatwave_frequency"]),
                    )
                    records.append(record)
                except (ValueError, ValidationError) as e:
                    validation_errors.append({
                        "row": row_num,
                        "error": str(e),
                        "data": row,
                    })

        if validation_errors:
            logger.warning(f"Validation errors in {filename}: {validation_errors}")

        if not records:
            raise ValueError(f"No valid records found in {filename}")

        dataset = ClimateDataset(
            region=region,
            records=records,
            source=filename,
            file_path=file_path,
        )

        self._cache[filename] = dataset
        logger.info(f"Loaded {len(records)} records from {filename}")

        return dataset

    def get_baseline(self, filename: str, base_year: int = 2024) -> Optional[ClimateDataRecord]:
        """Get the baseline record for a given year."""
        dataset = self.load_csv(filename)
        for record in dataset.records:
            if record.year == base_year:
                return record
        # Return closest year if exact match not found
        closest = min(dataset.records, key=lambda r: abs(r.year - base_year))
        return closest

    def get_projection_data(self, filename: str, start_year: int, end_year: int) -> List[ClimateDataRecord]:
        """Get historical data for projection training."""
        dataset = self.load_csv(filename)
        return [r for r in dataset.records if start_year <= r.year <= end_year]

    def list_available_datasets(self) -> List[Dict[str, str]]:
        """List all available CSV files in the data directory."""
        datasets = []
        if os.path.exists(self.data_dir):
            for f in os.listdir(self.data_dir):
                if f.endswith(".csv"):
                    region = f.replace("_climate_data.csv", "").replace("_", " ").title()
                    datasets.append({
                        "filename": f,
                        "region": region,
                        "path": os.path.join(self.data_dir, f),
                    })
        return datasets


# ── Singleton instance ────────────────────────────────────────
_loader_instance: Optional[ClimateDataLoader] = None


def get_data_loader() -> ClimateDataLoader:
    """Get or create the singleton data loader instance."""
    global _loader_instance
    if _loader_instance is None:
        _loader_instance = ClimateDataLoader()
    return _loader_instance
