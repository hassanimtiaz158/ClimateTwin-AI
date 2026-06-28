"""Explainable AI for Climate Projections.

This module provides explanations for AI-generated climate recommendations
using feature importance, SHAP-like values, and rule-based explanations.
"""

from typing import Dict, List, Any, Optional
import numpy as np


class ProjectionExplainer:
    """Generates human-readable explanations for climate projections."""
    
    # Action metadata for explanations
    ACTION_METADATA = {
        'renewable_energy': {
            'name': 'Renewable Energy Adoption',
            'mechanism': 'reduces fossil fuel dependence',
            'impact_type': 'CO2 reduction',
            'typical_reduction': '15-25%',
            'timeframe': '5-10 years',
        },
        'public_transit': {
            'name': 'Public Transit Expansion',
            'mechanism': 'reduces vehicle miles traveled',
            'impact_type': 'transport emissions',
            'typical_reduction': '10-20%',
            'timeframe': '3-7 years',
        },
        'reforestation': {
            'name': 'Reforestation Program',
            'mechanism': 'increases carbon sequestration',
            'impact_type': 'carbon absorption',
            'typical_reduction': '5-15%',
            'timeframe': '10-20 years',
        },
        'carbon_tax': {
            'name': 'Carbon Tax Implementation',
            'mechanism': 'incentivizes emission reductions',
            'impact_type': 'industrial emissions',
            'typical_reduction': '20-30%',
            'timeframe': '2-5 years',
        },
        'waste_reduction': {
            'name': 'Waste Reduction Initiative',
            'mechanism': 'reduces methane from landfills',
            'impact_type': 'waste emissions',
            'typical_reduction': '5-10%',
            'timeframe': '2-5 years',
        },
        'green_buildings': {
            'name': 'Green Building Standards',
            'mechanism': 'improves energy efficiency',
            'impact_type': 'building emissions',
            'typical_reduction': '10-15%',
            'timeframe': '5-15 years',
        },
    }
    
    def __init__(self):
        self.feature_names = [
            'temperature', 'co2_emissions', 'renewable_energy',
            'air_quality', 'sea_level', 'precipitation'
        ]
    
    def explain_projection(
        self,
        projections: List[Dict[str, Any]],
        actions: List[str],
        region: str = "Global",
    ) -> Dict[str, Any]:
        """Generate comprehensive explanation for projections."""
        
        if not projections:
            return self._empty_explanation()
        
        # Calculate key metrics
        metrics = self._calculate_metrics(projections)
        
        # Generate action explanations
        action_explanations = self._explain_actions(actions)
        
        # Generate confidence assessment
        confidence = self._assess_confidence(actions, projections)
        
        # Generate key findings
        findings = self._generate_findings(metrics, actions, region)
        
        # Generate SHAP-like feature importance
        feature_importance = self._calculate_feature_importance(actions)
        
        return {
            'summary': self._generate_summary(metrics, actions, region),
            'metrics': metrics,
            'action_explanations': action_explanations,
            'findings': findings,
            'confidence': confidence,
            'feature_importance': feature_importance,
            'methodology': self._get_methodology_note(),
        }
    
    def _calculate_metrics(self, projections: List[Dict]) -> Dict[str, float]:
        """Calculate projection metrics."""
        first = projections[0]
        last = projections[-1]
        
        temp_change = last['temperature'] - first['temperature']
        co2_change = ((last['co2_emissions'] - first['co2_emissions']) 
                      / first['co2_emissions'] * 100)
        
        return {
            'temperature_change': round(temp_change, 2),
            'co2_change_percent': round(co2_change, 1),
            'projection_years': len(projections),
            'start_year': first['year'],
            'end_year': last['year'],
        }
    
    def _explain_actions(self, actions: List[str]) -> List[Dict[str, Any]]:
        """Explain each selected action."""
        explanations = []
        
        for action_id in actions:
            metadata = self.ACTION_METADATA.get(action_id, {})
            if metadata:
                explanations.append({
                    'action': action_id,
                    'name': metadata['name'],
                    'explanation': f"By {metadata['mechanism']}, this action "
                                  f"can achieve {metadata['typical_reduction']} "
                                  f"{metadata['impact_type']} within {metadata['timeframe']}.",
                    'impact_type': metadata['impact_type'],
                    'typical_reduction': metadata['typical_reduction'],
                })
        
        return explanations
    
    def _assess_confidence(
        self,
        actions: List[str],
        projections: List[Dict],
    ) -> Dict[str, Any]:
        """Assess confidence in projections."""
        # Base confidence factors
        factors = []
        
        # More actions = higher confidence in impact
        if len(actions) >= 3:
            factors.append(('Multiple actions', 10))
        elif len(actions) >= 1:
            factors.append(('Single action', 5))
        
        # Projection horizon affects confidence
        years = len(projections)
        if years <= 5:
            factors.append(('Short-term projection', 15))
        elif years <= 10:
            factors.append(('Medium-term projection', 10))
        else:
            factors.append(('Long-term projection', 5))
        
        # Calculate total confidence
        base_confidence = 60
        total_bonus = sum(f[1] for f in factors)
        confidence = min(95, base_confidence + total_bonus)
        
        return {
            'score': confidence,
            'factors': [{'name': f[0], 'impact': f[1]} for f in factors],
            'note': 'Confidence based on model assumptions and data quality.',
        }
    
    def _generate_findings(
        self,
        metrics: Dict,
        actions: List[str],
        region: str,
    ) -> List[str]:
        """Generate key findings."""
        findings = []
        
        # Temperature finding
        temp_change = metrics['temperature_change']
        if temp_change < -0.5:
            findings.append(
                f"The scenario projects a significant temperature reduction of "
                f"{abs(temp_change):.1f}°C by {metrics['end_year']}."
            )
        elif temp_change < 0:
            findings.append(
                f"The scenario shows a modest temperature reduction of "
                f"{abs(temp_change):.2f}°C over {metrics['projection_years']} years."
            )
        else:
            findings.append(
                f"Temperature is projected to increase by {temp_change:.2f}°C, "
                f"indicating the need for stronger climate actions."
            )
        
        # CO2 finding
        co2_change = metrics['co2_change_percent']
        if co2_change < -20:
            findings.append(
                f"CO2 emissions are projected to decrease by {abs(co2_change):.1f}%, "
                f"meeting ambitious reduction targets."
            )
        elif co2_change < 0:
            findings.append(
                f"CO2 emissions show a {abs(co2_change):.1f}% reduction, "
                f"contributing to climate mitigation efforts."
            )
        
        # Action-specific findings
        if 'renewable_energy' in actions:
            findings.append(
                "Renewable energy adoption is a key driver of emission reductions "
                "in this scenario."
            )
        
        return findings
    
    def _calculate_feature_importance(self, actions: List[str]) -> Dict[str, float]:
        """Calculate feature importance for the scenario."""
        # Simplified feature importance based on actions
        importance = {
            'renewable_energy': 0.25 if 'renewable_energy' in actions else 0.05,
            'transportation': 0.20 if 'public_transit' in actions else 0.10,
            'land_use': 0.15 if 'reforestation' in actions else 0.05,
            'policy': 0.20 if 'carbon_tax' in actions else 0.10,
            'buildings': 0.10 if 'green_buildings' in actions else 0.05,
            'waste': 0.10 if 'waste_reduction' in actions else 0.05,
        }
        
        # Normalize
        total = sum(importance.values())
        return {k: round(v / total, 2) for k, v in importance.items()}
    
    def _generate_summary(
        self,
        metrics: Dict,
        actions: List[str],
        region: str,
    ) -> str:
        """Generate executive summary."""
        return (
            f"This scenario for {region} implements {len(actions)} climate actions "
            f"over {metrics['projection_years']} years ({metrics['start_year']}-{metrics['end_year']}). "
            f"The projections indicate a temperature change of {metrics['temperature_change']:+.2f}°C "
            f"and CO2 emissions change of {metrics['co2_change_percent']:+.1f}%. "
            f"{'The actions show promising potential for climate mitigation.' if metrics['co2_change_percent'] < 0 else 'Stronger actions may be needed to achieve significant reductions.'}"
        )
    
    def _get_methodology_note(self) -> str:
        """Get methodology explanation."""
        return (
            "Projections are generated using an ensemble of statistical and machine learning "
            "models, including trend extrapolation and gradient boosting. Confidence intervals "
            "are estimated based on historical variability and model uncertainty. Results should "
            "be interpreted as indicative scenarios rather than precise predictions."
        )
    
    def _empty_explanation(self) -> Dict[str, Any]:
        """Return empty explanation when no data available."""
        return {
            'summary': 'No projection data available for explanation.',
            'metrics': {},
            'action_explanations': [],
            'findings': ['Insufficient data to generate findings.'],
            'confidence': {'score': 0, 'factors': [], 'note': 'No data available.'},
            'feature_importance': {},
            'methodology': self._get_methodology_note(),
        }


def get_shap_like_values(
    features: List[str],
    actions: List[str],
) -> Dict[str, float]:
    """Generate SHAP-like values for explainability."""
    # Simplified SHAP-like values for MVP
    base_values = {f: 0.0 for f in features}
    
    # Action contributions
    action_contributions = {
        'renewable_energy': {'co2_emissions': -0.3, 'air_quality': 0.2},
        'public_transit': {'co2_emissions': -0.2, 'air_quality': 0.15},
        'reforestation': {'co2_emissions': -0.15, 'temperature': -0.1},
        'carbon_tax': {'co2_emissions': -0.25},
        'waste_reduction': {'co2_emissions': -0.1},
        'green_buildings': {'co2_emissions': -0.15, 'energy_use': -0.2},
    }
    
    for action in actions:
        if action in action_contributions:
            for feature, value in action_contributions[action].items():
                if feature in base_values:
                    base_values[feature] += value
    
    return base_values
