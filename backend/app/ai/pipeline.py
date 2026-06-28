"""Climate Projection Pipeline.

This module orchestrates the AI/ML pipeline for climate projections.
It handles data loading, preprocessing, model execution, and result generation.
"""

from typing import Dict, List, Any
import pandas as pd
import numpy as np


class ClimatePipeline:
    """Main pipeline for climate projection processing."""
    
    def __init__(self):
        self.data_loader = DataLoader()
        self.preprocessor = DataPreprocessor()
        self.forecaster = ClimateForecaster()
        self.explainer = ProjectionExplainer()
    
    def run(
        self,
        actions: List[str],
        start_year: int,
        end_year: int,
        region: str,
        dataset_path: str = None,
    ) -> List[Dict[str, Any]]:
        """Execute the full pipeline."""
        # Step 1: Load historical data
        if dataset_path:
            historical_data = self.data_loader.load(dataset_path)
        else:
            historical_data = self.data_loader.generate_sample(region, start_year - 20)
        
        # Step 2: Clean and normalize
        cleaned_data = self.preprocessor.clean(historical_data)
        
        # Step 3: Generate scenario variables
        scenario_vars = self.preprocessor.generate_scenario_variables(
            actions=actions,
            start_year=start_year,
            end_year=end_year,
        )
        
        # Step 4: Run forecasting model
        projections = self.forecaster.predict(
            historical_data=cleaned_data,
            scenario_vars=scenario_vars,
            start_year=start_year,
            end_year=end_year,
        )
        
        # Step 5: Generate explanations
        explanations = self.explainer.explain(projections, actions)
        
        return projections


class DataLoader:
    """Handles loading climate datasets."""
    
    def load(self, file_path: str) -> pd.DataFrame:
        """Load data from file."""
        if file_path.endswith('.csv'):
            return pd.read_csv(file_path)
        elif file_path.endswith('.parquet'):
            return pd.read_parquet(file_path)
        elif file_path.endswith('.json'):
            return pd.read_json(file_path)
        raise ValueError(f"Unsupported file format: {file_path}")
    
    def generate_sample(self, region: str, years: int) -> pd.DataFrame:
        """Generate sample historical data for demonstration."""
        np.random.seed(42)
        data = []
        base_temp = 14.5  # Global average temperature
        
        for i in range(years):
            year = 2004 + i
            temp = base_temp + (i * 0.02) + np.random.normal(0, 0.1)
            co2 = 380 + (i * 2.5) + np.random.normal(0, 5)
            data.append({
                'year': year,
                'temperature': temp,
                'co2_emissions': co2,
                'renewable_energy': 10 + (i * 1.5),
            })
        
        return pd.DataFrame(data)


class DataPreprocessor:
    """Handles data cleaning and preprocessing."""
    
    def clean(self, data: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate data."""
        # Remove duplicates
        data = data.drop_duplicates()
        
        # Handle missing values
        data = data.ffill()
        
        # Validate ranges
        if 'temperature' in data.columns:
            data = data[(data['temperature'] > -50) & (data['temperature'] < 60)]
        
        return data
    
    def generate_scenario_variables(
        self,
        actions: List[str],
        start_year: int,
        end_year: int,
    ) -> pd.DataFrame:
        """Generate scenario-based variable adjustments."""
        years = list(range(start_year, end_year + 1))
        
        # Action impacts (simplified for MVP)
        action_impacts = {
            'renewable_energy': {'co2_reduction': 0.15, 'temp_benefit': -0.02},
            'public_transit': {'co2_reduction': 0.08, 'temp_benefit': -0.01},
            'reforestation': {'co2_reduction': 0.05, 'temp_benefit': -0.015},
            'carbon_tax': {'co2_reduction': 0.12, 'temp_benefit': -0.025},
            'waste_reduction': {'co2_reduction': 0.04, 'temp_benefit': -0.005},
            'green_buildings': {'co2_reduction': 0.06, 'temp_benefit': -0.008},
        }
        
        # Calculate cumulative impact
        total_co2_impact = sum(
            action_impacts.get(a, {}).get('co2_reduction', 0) for a in actions
        )
        total_temp_impact = sum(
            action_impacts.get(a, {}).get('temp_benefit', 0) for a in actions
        )
        
        # Generate variables
        data = []
        for i, year in enumerate(years):
            progress = i / (len(years) - 1) if len(years) > 1 else 0
            data.append({
                'year': year,
                'co2_factor': 1 - (total_co2_impact * progress),
                'temp_factor': total_temp_impact * progress,
                'renewable_boost': len(actions) * 2 * progress,
            })
        
        return pd.DataFrame(data)


class ClimateForecaster:
    """Performs climate projections using ML models."""
    
    def predict(
        self,
        historical_data: pd.DataFrame,
        scenario_vars: pd.DataFrame,
        start_year: int,
        end_year: int,
    ) -> List[Dict[str, Any]]:
        """Generate projections based on scenario."""
        projections = []
        
        # Get baseline trends
        last_temp = historical_data['temperature'].iloc[-1] if len(historical_data) > 0 else 14.5
        last_co2 = historical_data['co2_emissions'].iloc[-1] if len(historical_data) > 0 else 420
        
        for _, row in scenario_vars.iterrows():
            year = int(row['year'])
            year_offset = year - start_year
            
            # Baseline projection (no action)
            baseline_temp = last_temp + (year_offset * 0.03)
            baseline_co2 = last_co2 + (year_offset * 3)
            
            # Scenario projection
            projected_temp = baseline_temp + row['temp_factor']
            projected_co2 = baseline_co2 * row['co2_factor']
            
            # Add uncertainty bounds
            uncertainty = 0.1 * year_offset
            
            projections.append({
                'year': year,
                'temperature': round(projected_temp, 2),
                'co2_emissions': round(projected_co2, 1),
                'baseline': round(baseline_temp, 2),
                'baseline_co2': round(baseline_co2, 1),
                'temp_low': round(projected_temp - uncertainty, 2),
                'temp_high': round(projected_temp + uncertainty, 2),
            })
        
        return projections


class ProjectionExplainer:
    """Generates explanations for projections."""
    
    def explain(
        self,
        projections: List[Dict[str, Any]],
        actions: List[str],
    ) -> Dict[str, Any]:
        """Generate human-readable explanations."""
        if not projections:
            return {'summary': 'No projections available'}
        
        first = projections[0]
        last = projections[-1]
        
        temp_change = last['temperature'] - first['temperature']
        co2_change = ((last['co2_emissions'] - first['co2_emissions']) / first['co2_emissions']) * 100
        
        return {
            'temp_change': round(temp_change, 2),
            'co2_change_percent': round(co2_change, 1),
            'actions_applied': len(actions),
            'projection_years': len(projections),
        }
