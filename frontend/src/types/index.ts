export interface ScenarioConfig {
  name: string;
  city: string;
  country: string;
  targetYear: number;
  reforestationSlider: number;
  renewableEnergySlider: number;
  evAdoptionSlider: number;
  emissionReductionSlider: number;
  publicTransitSlider: number;
  waterConservationSlider: number;
  notes: string;
}

export interface Scenario {
  id: string;
  user_id?: string;
  name: string;
  city: string;
  country: string;
  target_year: number;
  reforestation_slider: number;
  renewable_energy_slider: number;
  ev_adoption_slider: number;
  emission_reduction_slider: number;
  public_transit_slider: number;
  water_conservation_slider: number;
  notes?: string;
  // Derived fields (backward compatibility)
  region: string;
  actions: string[];
  start_year: number;
  end_year: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectionDataPoint {
  year: number;
  temperature_change: number;
  co2_level: number;
  air_quality_index: number;
  forest_cover: number;
  biodiversity_score: number;
  water_stress: number;
  heatwave_frequency: number;
  flood_risk: number;
  // Baseline comparisons
  baseline_temperature: number;
  baseline_co2: number;
  // Confidence bounds
  temperature_change_low?: number;
  temperature_change_high?: number;
}

export interface SimulationMetrics {
  temperature_change: number;
  co2_change: number;
  air_quality_change: number;
  forest_cover_change: number;
  biodiversity_change: number;
  water_stress_change: number;
  heatwave_change: number;
  flood_risk_change: number;
}

export interface ChartDataPoint {
  year: number;
  value: number;
  baseline?: number;
  label?: string;
}

export interface SimulationResults {
  run_id: string;
  scenario_id: string;
  status: string;
  message: string;
  projections: ProjectionDataPoint[];
  metrics: SimulationMetrics;
  chart_data: Record<string, ChartDataPoint[]>;
  recommendations: RecommendationItem[];
}

export interface RecommendationItem {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  confidence: number;
}

export interface RecommendationAction {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export interface Recommendations {
  run_id: string;
  summary: string;
  findings: string[];
  actions: RecommendationAction[];
  confidence: number;
}

export interface HistoryItem {
  id: string;
  scenario_id: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}
