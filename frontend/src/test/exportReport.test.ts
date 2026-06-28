import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportJSON, exportHTML, exportComparisonJSON, exportComparisonHTML } from '../services/exportReport';
import type { SimulationResults } from '../types';

// Mock downloadBlob (DOM APIs)
const mockClick = vi.fn();

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:mock'),
  revokeObjectURL: vi.fn(),
});

vi.stubGlobal('document', {
  createElement: vi.fn(() => ({
    href: '',
    download: '',
    click: mockClick,
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
});

const mockResults: SimulationResults = {
  run_id: 'run-abc-1234-5678',
  scenario_id: 'sc-xyz-9876',
  status: 'completed',
  message: 'Done',
  projections: [
    { year: 2024, temperature_change: 1.0, co2_level: 420, air_quality_index: 30, forest_cover: 30, biodiversity_score: 0.6, water_stress: 0.4, heatwave_frequency: 10, flood_risk: 0.2, baseline_temperature: 1.0, baseline_co2: 420 },
    { year: 2030, temperature_change: 1.2, co2_level: 435, air_quality_index: 32, forest_cover: 28, biodiversity_score: 0.55, water_stress: 0.42, heatwave_frequency: 12, flood_risk: 0.22, baseline_temperature: 1.18, baseline_co2: 435 },
    { year: 2035, temperature_change: 1.4, co2_level: 450, air_quality_index: 35, forest_cover: 26, biodiversity_score: 0.5, water_stress: 0.45, heatwave_frequency: 14, flood_risk: 0.25, baseline_temperature: 1.35, baseline_co2: 448 },
  ],
  metrics: {
    temperature_change: 0.4,
    co2_change: 30,
    air_quality_change: 5,
    forest_cover_change: -4,
    biodiversity_change: -0.1,
    water_stress_change: 0.05,
    heatwave_change: 4,
    flood_risk_change: 0.05,
  },
  chart_data: {
    temperature_change: [{ year: 2024, value: 1.0 }, { year: 2035, value: 1.4 }],
  },
  recommendations: [
    { category: 'temperature', priority: 'high', title: 'Temp Rising', description: 'Desc', action: 'renewable_energy', confidence: 0.85 },
    { category: 'co2', priority: 'medium', title: 'CO2 Rising', description: 'Desc', action: 'emission_reduction', confidence: 0.7 },
  ],
};

describe('exportReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportJSON', () => {
    it('creates a JSON blob and triggers download', () => {
      exportJSON(mockResults);
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportHTML', () => {
    it('creates an HTML blob and triggers download', () => {
      exportHTML(mockResults);
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportComparisonJSON', () => {
    it('creates comparison JSON and triggers download', () => {
      exportComparisonJSON({
        scenarios: [
          {
            name: 'Scenario A',
            city: 'Paris',
            country: 'France',
            targetYear: 2035,
            metrics: mockResults.metrics,
          },
        ],
      });
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportComparisonHTML', () => {
    it('creates comparison HTML and triggers download', () => {
      exportComparisonHTML({
        scenarios: [
          {
            name: 'Scenario A',
            city: 'Paris',
            country: 'France',
            targetYear: 2035,
            metrics: mockResults.metrics,
          },
          {
            name: 'Scenario B',
            city: 'Berlin',
            country: 'Germany',
            targetYear: 2030,
            metrics: mockResults.metrics,
          },
        ],
      });
      expect(mockClick).toHaveBeenCalled();
    });
  });
});
