import axios, { AxiosError } from 'axios';
import type {
  ScenarioConfig,
  Scenario,
  SimulationResults,
  Recommendations,
  PaginatedHistory,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ── API Error class ──────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

// ── Axios client ─────────────────────────────────────────────
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Response interceptor: unwrap data + normalize errors
client.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ detail?: string }>) => {
    const status = error.response?.status ?? 0;
    const detail =
      error.response?.data?.detail ??
      error.message ??
      'Unknown error';

    // Friendly messages for common scenarios
    if (status === 0) {
      return Promise.reject(new ApiError(0, `Cannot connect to server at ${API_BASE_URL}. Is the backend running?`));
    }
    if (status === 404) {
      return Promise.reject(new ApiError(404, 'Resource not found. It may have been deleted.'));
    }
    if (status === 422) {
      return Promise.reject(new ApiError(422, 'Invalid request. Please check your inputs.'));
    }
    if (status >= 500) {
      return Promise.reject(new ApiError(status, 'Server error. Please try again later.'));
    }

    return Promise.reject(new ApiError(status, detail));
  }
);

// ── Typed API methods ────────────────────────────────────────
export const api = {
  // ── Scenarios ────────────────────────────────────────────────
  async createScenario(config: ScenarioConfig): Promise<Scenario> {
    return client.post('/scenarios', {
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
    }) as Promise<Scenario>;
  },

  async getScenario(id: string): Promise<Scenario> {
    return client.get(`/scenarios/${id}`) as Promise<Scenario>;
  },

  async listScenarios(): Promise<Scenario[]> {
    return client.get('/scenarios') as Promise<Scenario[]>;
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

    return client.patch(`/scenarios/${id}`, updateData) as Promise<Scenario>;
  },

  async deleteScenario(id: string): Promise<void> {
    await client.delete(`/scenarios/${id}`);
  },

  // ── Simulations ──────────────────────────────────────────────
  async runSimulation(scenarioId: string): Promise<SimulationResults> {
    return client.post('/simulate', { scenario_id: scenarioId }) as Promise<SimulationResults>;
  },

  async runInlineSimulation(config: ScenarioConfig): Promise<SimulationResults> {
    return client.post('/simulate', {
      city: config.city,
      country: config.country,
      target_year: config.targetYear,
      reforestation_slider: config.reforestationSlider,
      renewable_energy_slider: config.renewableEnergySlider,
      ev_adoption_slider: config.evAdoptionSlider,
      emission_reduction_slider: config.emissionReductionSlider,
      public_transit_slider: config.publicTransitSlider,
      water_conservation_slider: config.waterConservationSlider,
    }) as Promise<SimulationResults>;
  },

  async getResults(runId: string): Promise<SimulationResults> {
    return client.get(`/results/${runId}`) as Promise<SimulationResults>;
  },

  // ── History ──────────────────────────────────────────────────
  async getHistory(page: number = 1, pageSize: number = 20): Promise<PaginatedHistory> {
    return client.get('/history', { params: { page, page_size: pageSize } }) as Promise<PaginatedHistory>;
  },

  // ── Recommendations ──────────────────────────────────────────
  async getRecommendations(runId: string): Promise<Recommendations> {
    return client.get(`/recommendations/${runId}`) as Promise<Recommendations>;
  },

  // ── Datasets ─────────────────────────────────────────────────
  async uploadDataset(file: File, metadata: Record<string, string>): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return client.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as Promise<{ id: string }>;
  },
};
