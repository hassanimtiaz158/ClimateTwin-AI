export interface ScenarioConfig {
  name: string;
  region: string;
  actions: string[];
  startYear: number;
  endYear: number;
}

export interface Scenario {
  id: string;
  name: string;
  region: string;
  actions: string[];
  startYear: number;
  endYear: number;
  created_at: string;
}

export interface SimulationRun {
  id: string;
  scenario_id: string;
  scenario_name: string;
  region: string;
  actions: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface ProjectionDataPoint {
  year: number;
  temperature: number;
  co2_emissions: number;
  baseline: number;
  baseline_co2: number;
}

export interface SimulationMetrics {
  temp_change: number;
  co2_reduction: number;
  renewable_pct: number;
  aqi: number;
}

export interface SimulationResults {
  run_id: string;
  scenario: {
    name: string;
    region: string;
    actions: string[];
  };
  projections: ProjectionDataPoint[];
  metrics: SimulationMetrics;
}

export interface RecommendationAction {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export interface Recommendations {
  summary: string;
  findings: string[];
  actions: RecommendationAction[];
  confidence: number;
}

export interface HistoryItem {
  id: string;
  scenario_name: string;
  region: string;
  actions: string[];
  status: string;
  created_at: string;
}
