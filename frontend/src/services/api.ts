import axios from 'axios';
import type {
  ScenarioConfig,
  Scenario,
  SimulationResults,
  Recommendations,
  HistoryItem,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  // Scenarios
  async createScenario(config: ScenarioConfig): Promise<Scenario> {
    const response = await client.post('/scenarios', config);
    return response as unknown as Scenario;
  },

  async getScenario(id: string): Promise<Scenario> {
    const response = await client.get(`/scenarios/${id}`);
    return response as unknown as Scenario;
  },

  async listScenarios(): Promise<Scenario[]> {
    const response = await client.get('/scenarios');
    return response as unknown as Scenario[];
  },

  async updateScenario(id: string, data: Partial<ScenarioConfig>): Promise<Scenario> {
    const response = await client.patch(`/scenarios/${id}`, data);
    return response as unknown as Scenario;
  },

  async deleteScenario(id: string): Promise<void> {
    await client.delete(`/scenarios/${id}`);
  },

  // Simulations
  async runSimulation(scenarioId: string): Promise<SimulationResults> {
    const response = await client.post('/simulate', { scenario_id: scenarioId });
    return response as unknown as SimulationResults;
  },

  async runInlineSimulation(config: ScenarioConfig): Promise<SimulationResults> {
    const response = await client.post('/simulate', {
      city: config.city,
      country: config.country,
      target_year: config.targetYear,
      renewable_energy_slider: config.renewableEnergySlider,
      public_transit_slider: config.publicTransitSlider,
      reforestation_slider: config.reforestationSlider,
      carbon_tax_slider: config.carbonTaxSlider,
      green_innovation_slider: config.greenInnovationSlider,
    });
    return response as unknown as SimulationResults;
  },

  async getResults(runId: string): Promise<SimulationResults> {
    const response = await client.get(`/results/${runId}`);
    return response as unknown as SimulationResults;
  },

  async getHistory(): Promise<HistoryItem[]> {
    const response = await client.get('/history');
    return response as unknown as HistoryItem[];
  },

  // Recommendations
  async getRecommendations(runId: string): Promise<Recommendations> {
    const response = await client.get(`/recommendations/${runId}`);
    return response as unknown as Recommendations;
  },

  // Datasets
  async uploadDataset(file: File, metadata: Record<string, string>): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const response = await client.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response as unknown as { id: string };
  },
};
