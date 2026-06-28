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
    const response = await client.post('/scenarios', {
      name: config.name,
      city: config.city,
      country: config.country,
      target_year: config.targetYear,
      reforestation_slider: config.reforestationSlider,
      renewable_energy_slider: config.renewableEnergySlider,
      ev_adoption_slider: config.evAdoptionSlider,
      emission_reduction_slider: config.emissionReductionSlider,
      public_transit_slider: config.publicTransitSlider,
      water_conservation_slider: config.waterConservationSlider,
      notes: config.notes,
    });
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
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.targetYear !== undefined) updateData.target_year = data.targetYear;
    if (data.reforestationSlider !== undefined) updateData.reforestation_slider = data.reforestationSlider;
    if (data.renewableEnergySlider !== undefined) updateData.renewable_energy_slider = data.renewableEnergySlider;
    if (data.evAdoptionSlider !== undefined) updateData.ev_adoption_slider = data.evAdoptionSlider;
    if (data.emissionReductionSlider !== undefined) updateData.emission_reduction_slider = data.emissionReductionSlider;
    if (data.publicTransitSlider !== undefined) updateData.public_transit_slider = data.publicTransitSlider;
    if (data.waterConservationSlider !== undefined) updateData.water_conservation_slider = data.waterConservationSlider;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const response = await client.patch(`/scenarios/${id}`, updateData);
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
      reforestation_slider: config.reforestationSlider,
      renewable_energy_slider: config.renewableEnergySlider,
      ev_adoption_slider: config.evAdoptionSlider,
      emission_reduction_slider: config.emissionReductionSlider,
      public_transit_slider: config.publicTransitSlider,
      water_conservation_slider: config.waterConservationSlider,
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
