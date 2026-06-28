import axios from 'axios';
import type {
  ScenarioConfig,
  Scenario,
  SimulationRun,
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
    return response.data;
  },

  async getScenario(id: string): Promise<Scenario> {
    const response = await client.get(`/scenarios/${id}`);
    return response.data;
  },

  // Simulations
  async runSimulation(scenarioId: string): Promise<{ run_id: string; status: string }> {
    const response = await client.post('/simulate', { scenario_id: scenarioId });
    return response.data;
  },

  async getResults(runId: string): Promise<SimulationResults> {
    const response = await client.get(`/results/${runId}`);
    return response.data;
  },

  async getHistory(): Promise<HistoryItem[]> {
    const response = await client.get('/history');
    return response.data;
  },

  // Recommendations
  async getRecommendations(runId: string): Promise<Recommendations> {
    const response = await client.get(`/recommendations/${runId}`);
    return response.data;
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
    return response.data;
  },
};
