"""ML Forecasting Models for Climate Projections.

This module contains different forecasting approaches:
- Statistical (Prophet-like)
- Machine Learning (XGBoost)
- Ensemble methods
"""

from typing import List, Dict, Any, Optional
import numpy as np
from abc import ABC, abstractmethod


class BaseForecaster(ABC):
    """Base class for forecasting models."""
    
    @abstractmethod
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        """Train the model."""
        pass
    
    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions."""
        pass


class StatisticalForecaster(BaseForecaster):
    """Simple statistical forecasting using trend extrapolation."""
    
    def __init__(self):
        self.trend = None
        self.seasonality = None
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        """Fit linear trend."""
        if len(X) > 1:
            self.trend = np.polyfit(X.flatten(), y, 1)
        else:
            self.trend = [0, y[0]]
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict using fitted trend."""
        if self.trend is None:
            return np.zeros_like(X)
        return np.polyval(self.trend, X)


class XGBoostForecaster(BaseForecaster):
    """XGBoost-based forecasting model."""
    
    def __init__(self):
        self.model = None
        self._try_import_xgboost()
    
    def _try_import_xgboost(self):
        """Try to import XGBoost, fallback if not available."""
        try:
            import xgboost as xgb
            self.xgb = xgb
        except ImportError:
            self.xgb = None
            print("Warning: XGBoost not available, using fallback")
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        """Train XGBoost model."""
        if self.xgb is None:
            # Fallback to simple model
            self.fallback = StatisticalForecaster()
            self.fallback.fit(X, y)
            return
        
        self.model = self.xgb.XGBRegressor(
            n_estimators=100,
            max_depth=3,
            learning_rate=0.1,
            random_state=42,
        )
        self.model.fit(X, y)
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions with XGBoost."""
        if self.model is None:
            return self.fallback.predict(X)
        return self.model.predict(X)


class EnsembleForecaster(BaseForecaster):
    """Ensemble of multiple forecasting models."""
    
    def __init__(self, models: List[BaseForecaster] = None):
        self.models = models or [
            StatisticalForecaster(),
            XGBoostForecaster(),
        ]
        self.weights = None
    
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        """Fit all models and determine weights."""
        errors = []
        
        for model in self.models:
            model.fit(X, y)
            predictions = model.predict(X)
            mse = np.mean((predictions - y) ** 2)
            errors.append(mse)
        
        # Inverse error weighting
        inv_errors = [1 / (e + 1e-10) for e in errors]
        total = sum(inv_errors)
        self.weights = [e / total for e in inv_errors]
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make weighted ensemble predictions."""
        predictions = []
        
        for model, weight in zip(self.models, self.weights):
            pred = model.predict(X)
            predictions.append(pred * weight)
        
        return sum(predictions)


def get_forecaster(model_type: str = "ensemble") -> BaseForecaster:
    """Factory function to get appropriate forecaster."""
    forecasters = {
        "statistical": StatisticalForecaster,
        "xgboost": XGBoostForecaster,
        "ensemble": EnsembleForecaster,
    }
    
    forecaster_class = forecasters.get(model_type, EnsembleForecaster)
    return forecaster_class()
