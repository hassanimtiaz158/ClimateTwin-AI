"""Service tests."""

import pytest

from app.services.projection_engine import ProjectionEngine
from app.ai.pipeline import ClimatePipeline
from app.ai.forecasters import StatisticalForecaster, EnsembleForecaster
from app.ai.explainer import ProjectionExplainer


class TestProjectionEngine:
    """Test projection engine."""
    
    def setup_method(self):
        self.engine = ProjectionEngine()
    
    def test_run_basic_projection(self):
        """Test basic projection run."""
        projections = self.engine.run(
            actions=["renewable_energy"],
            start_year=2024,
            end_year=2029,
            region="Global",
        )
        
        assert len(projections) == 6  # 2024-2029
        assert "year" in projections[0]
        assert "temperature_change" in projections[0]
        assert "co2_level" in projections[0]
        assert "air_quality_index" in projections[0]
        assert "forest_cover" in projections[0]


class TestClimatePipeline:
    """Test climate pipeline."""
    
    def setup_method(self):
        self.pipeline = ClimatePipeline()
    
    def test_pipeline_execution(self):
        """Test full pipeline execution."""
        projections = self.pipeline.run(
            actions=["renewable_energy", "reforestation"],
            start_year=2024,
            end_year=2034,
            region="Global",
        )
        
        assert len(projections) == 11
        assert all("year" in p for p in projections)


class TestForecasters:
    """Test forecasting models."""
    
    def test_statistical_forecaster(self):
        """Test statistical forecaster."""
        import numpy as np

        forecaster = StatisticalForecaster()
        X = np.array([1, 2, 3, 4, 5]).reshape(-1, 1)
        y = np.array([10.0, 12.0, 14.0, 16.0, 18.0])

        forecaster.fit(X, y)
        predictions = forecaster.predict(X)

        assert len(predictions) == 5
        assert all(isinstance(float(p), (int, float)) for p in predictions)
    
    def test_ensemble_forecaster(self):
        """Test ensemble forecaster."""
        import numpy as np
        
        forecaster = EnsembleForecaster()
        X = np.array([1, 2, 3, 4, 5]).reshape(-1, 1)
        y = np.array([10, 12, 14, 16, 18])
        
        forecaster.fit(X, y)
        predictions = forecaster.predict(X)
        
        assert len(predictions) == 5


class TestProjectionExplainer:
    """Test projection explainer."""
    
    def setup_method(self):
        self.explainer = ProjectionExplainer()
    
    def test_explain_projection(self):
        """Test projection explanation."""
        projections = [
            {"year": 2024, "temperature": 14.5, "co2_emissions": 400},
            {"year": 2029, "temperature": 14.3, "co2_emissions": 350},
        ]
        
        explanation = self.explainer.explain_projection(
            projections=projections,
            actions=["renewable_energy"],
            region="Global",
        )
        
        assert "summary" in explanation
        assert "metrics" in explanation
        assert "confidence" in explanation


class TestClimateDataLoader:
    """Test climate data loader service."""
    
    def setup_method(self):
        from app.services.climate_data_loader import ClimateDataLoader
        import os
        # Use the sample data directory relative to backend
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data", "sample")
        self.loader = ClimateDataLoader(data_dir=data_dir)
    
    def test_load_csv(self):
        """Test loading a CSV file."""
        dataset = self.loader.load_csv("global_climate_data.csv", region="Global")
        
        assert len(dataset.records) == 10
        assert dataset.region == "Global"
        assert dataset.records[0].year == 2015
        assert dataset.records[-1].year == 2024
    
    def test_csv_validation(self):
        """Test that CSV data is validated by Pydantic."""
        dataset = self.loader.load_csv("global_climate_data.csv")
        
        # All records should be valid ClimateDataRecord instances
        for record in dataset.records:
            assert 1900 <= record.year <= 2100
            assert -50 <= record.temperature <= 60
            assert 150 <= record.co2_level <= 1000
            assert 0 <= record.air_quality_index <= 500
            assert 0 <= record.forest_cover <= 100
            assert 0 <= record.biodiversity_score <= 1
            assert 0 <= record.flood_risk <= 1
            assert 0 <= record.heatwave_frequency <= 365
    
    def test_get_baseline(self):
        """Test getting baseline data for a year."""
        baseline = self.loader.get_baseline("global_climate_data.csv", base_year=2024)
        
        assert baseline is not None
        assert baseline.year == 2024
    
    def test_list_datasets(self):
        """Test listing available datasets."""
        datasets = self.loader.list_available_datasets()
        
        assert len(datasets) >= 4
        regions = [d["region"] for d in datasets]
        assert "Global" in regions
        assert "Europe" in regions
