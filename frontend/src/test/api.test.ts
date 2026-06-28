import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, ApiError } from '../services/api';
import type { ScenarioConfig } from '../types';

// Mock axios
vi.mock('axios', () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();
  const mockPatch = vi.fn();
  const mockDelete = vi.fn();

  const axiosInstance = {
    post: mockPost,
    get: mockGet,
    patch: mockPatch,
    delete: mockDelete,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn((onFulfilled: any) => { (axiosInstance as any)._responseInterceptor = onFulfilled; }) },
    },
    _responseInterceptor: null as any,
  };

  return {
    default: {
      create: vi.fn(() => axiosInstance),
    },
    AxiosError: class AxiosError extends Error {
      response?: any;
      constructor(msg: string, _code?: string, _config?: any, _request?: any, response?: any) {
        super(msg);
        this.response = response;
      }
    },
  };
});

describe('api', () => {
  let mockPost: ReturnType<typeof vi.fn>;
  let mockGet: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const axios = (await import('axios')).default;
    const instance = (axios as any).create();
    mockPost = instance.post;
    mockGet = instance.get;
    mockDelete = instance.delete;
  });

  describe('ApiError', () => {
    it('has correct properties', () => {
      const error = new ApiError(404, 'Not found');
      expect(error.status).toBe(404);
      expect(error.detail).toBe('Not found');
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Not found');
    });
  });

  describe('createScenario', () => {
    it('sends correct payload', async () => {
      const config: ScenarioConfig = {
        name: 'Test',
        city: 'Lisbon',
        country: 'Portugal',
        targetYear: 2035,
        reforestationSlider: 0.5,
        renewableEnergySlider: 0.7,
        evAdoptionSlider: 0.3,
        emissionReductionSlider: 0.4,
        publicTransitSlider: 0.6,
        waterConservationSlider: 0.2,
        notes: 'Test notes',
      };
      mockPost.mockResolvedValue({ data: { id: '123', name: 'Test' } });

      await api.createScenario(config);

      expect(mockPost).toHaveBeenCalledWith('/scenarios', {
        name: 'Test',
        city: 'Lisbon',
        country: 'Portugal',
        target_year: 2035,
        reforestation_slider: 0.5,
        renewable_energy_slider: 0.7,
        ev_adoption_slider: 0.3,
        emission_reduction_slider: 0.4,
        public_transit_slider: 0.6,
        water_conservation_slider: 0.2,
        notes: 'Test notes',
      });
    });
  });

  describe('runInlineSimulation', () => {
    it('sends inline config without scenario_id', async () => {
      const config: ScenarioConfig = {
        name: 'Inline',
        city: 'Tokyo',
        country: 'Japan',
        targetYear: 2030,
        reforestationSlider: 0.0,
        renewableEnergySlider: 1.0,
        evAdoptionSlider: 0.0,
        emissionReductionSlider: 0.0,
        publicTransitSlider: 0.0,
        waterConservationSlider: 0.0,
        notes: '',
      };
      mockPost.mockResolvedValue({ data: { status: 'completed' } });

      await api.runInlineSimulation(config);

      expect(mockPost).toHaveBeenCalledWith('/simulate', {
        city: 'Tokyo',
        country: 'Japan',
        target_year: 2030,
        reforestation_slider: 0.0,
        renewable_energy_slider: 1.0,
        ev_adoption_slider: 0.0,
        emission_reduction_slider: 0.0,
        public_transit_slider: 0.0,
        water_conservation_slider: 0.0,
      });
    });
  });

  describe('runSimulation', () => {
    it('sends scenario_id', async () => {
      mockPost.mockResolvedValue({ data: { status: 'completed' } });
      await api.runSimulation('abc-123');
      expect(mockPost).toHaveBeenCalledWith('/simulate', { scenario_id: 'abc-123' });
    });
  });

  describe('listScenarios', () => {
    it('calls GET /scenarios', async () => {
      mockGet.mockResolvedValue({ data: [] });
      await api.listScenarios();
      expect(mockGet).toHaveBeenCalledWith('/scenarios');
    });
  });

  describe('deleteScenario', () => {
    it('calls DELETE with id', async () => {
      mockDelete.mockResolvedValue({ data: null });
      await api.deleteScenario('abc-123');
      expect(mockDelete).toHaveBeenCalledWith('/scenarios/abc-123');
    });
  });

  describe('getHistory', () => {
    it('calls GET /history', async () => {
      mockGet.mockResolvedValue({ data: [] });
      await api.getHistory();
      expect(mockGet).toHaveBeenCalledWith('/history');
    });
  });

  describe('getRecommendations', () => {
    it('calls GET /recommendations/:runId', async () => {
      mockGet.mockResolvedValue({ data: {} });
      await api.getRecommendations('run-123');
      expect(mockGet).toHaveBeenCalledWith('/recommendations/run-123');
    });
  });
});
