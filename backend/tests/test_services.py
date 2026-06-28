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
        assert "temperature" in projections[0]
        assert "co2_emissions" in projections[0]


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
        y = np.array([10, 12, 14, 16, 18])
        
        forecaster.fit(X, y)
        predictions = forecaster.predict(X)
        
        assert len(predictions) == 5
        assert all(isinstance(p, (int, float)) for p in predictions)
    
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
