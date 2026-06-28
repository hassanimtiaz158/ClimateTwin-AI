import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';

describe('useStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useStore.setState({
      currentScenario: {
        name: '',
        city: '',
        country: '',
        targetYear: 2035,
        reforestationSlider: 0.0,
        renewableEnergySlider: 0.0,
        evAdoptionSlider: 0.0,
        emissionReductionSlider: 0.0,
        publicTransitSlider: 0.0,
        waterConservationSlider: 0.0,
      },
      resultsCache: {},
      sidebarOpen: true,
      isSimulating: false,
      simulationError: null,
    });
  });

  describe('currentScenario', () => {
    it('starts with default values', () => {
      const state = useStore.getState();
      expect(state.currentScenario.name).toBe('');
      expect(state.currentScenario.targetYear).toBe(2035);
      expect(state.currentScenario.reforestationSlider).toBe(0.0);
    });

    it('setCurrentScenario merges partial data', () => {
      const { setCurrentScenario } = useStore.getState();
      setCurrentScenario({ name: 'Test', city: 'Lisbon' });
      const state = useStore.getState();
      expect(state.currentScenario.name).toBe('Test');
      expect(state.currentScenario.city).toBe('Lisbon');
      expect(state.currentScenario.targetYear).toBe(2035);
    });

    it('resetCurrentScenario restores defaults', () => {
      const { setCurrentScenario, resetCurrentScenario } = useStore.getState();
      setCurrentScenario({ name: 'Changed', city: 'Berlin' });
      resetCurrentScenario();
      const state = useStore.getState();
      expect(state.currentScenario.name).toBe('');
      expect(state.currentScenario.city).toBe('');
    });
  });

  describe('resultsCache', () => {
    it('starts empty', () => {
      const state = useStore.getState();
      expect(state.resultsCache).toEqual({});
    });

    it('cacheResults stores results', () => {
      const { cacheResults } = useStore.getState();
      const mockResults = {
        run_id: 'run-1',
        scenario_id: 'sc-1',
        status: 'completed',
        message: 'Done',
        projections: [],
        metrics: {
          temperature_change: 0,
          co2_change: 0,
          air_quality_change: 0,
          forest_cover_change: 0,
          biodiversity_change: 0,
          water_stress_change: 0,
          heatwave_change: 0,
          flood_risk_change: 0,
        },
        chart_data: {},
        recommendations: [],
      };
      cacheResults('run-1', mockResults);
      const state = useStore.getState();
      expect(state.resultsCache['run-1']).toEqual(mockResults);
    });

    it('getCachedResults returns cached or null', () => {
      const { cacheResults, getCachedResults } = useStore.getState();
      expect(getCachedResults('nonexistent')).toBeNull();

      const mockResults = {
        run_id: 'run-2',
        scenario_id: 'sc-2',
        status: 'completed',
        message: 'Done',
        projections: [],
        metrics: {
          temperature_change: 0,
          co2_change: 0,
          air_quality_change: 0,
          forest_cover_change: 0,
          biodiversity_change: 0,
          water_stress_change: 0,
          heatwave_change: 0,
          flood_risk_change: 0,
        },
        chart_data: {},
        recommendations: [],
      };
      cacheResults('run-2', mockResults);
      expect(getCachedResults('run-2')).toEqual(mockResults);
    });

    it('clearResultsCache empties cache', () => {
      const { cacheResults, clearResultsCache } = useStore.getState();
      cacheResults('run-x', {} as any);
      clearResultsCache();
      expect(useStore.getState().resultsCache).toEqual({});
    });
  });

  describe('UI state', () => {
    it('toggleSidebar toggles', () => {
      const { toggleSidebar } = useStore.getState();
      expect(useStore.getState().sidebarOpen).toBe(true);
      toggleSidebar();
      expect(useStore.getState().sidebarOpen).toBe(false);
      toggleSidebar();
      expect(useStore.getState().sidebarOpen).toBe(true);
    });

    it('setSimulating updates state', () => {
      const { setSimulating } = useStore.getState();
      setSimulating(true);
      expect(useStore.getState().isSimulating).toBe(true);
      setSimulating(false);
      expect(useStore.getState().isSimulating).toBe(false);
    });

    it('setSimulationError updates state', () => {
      const { setSimulationError } = useStore.getState();
      setSimulationError('Something went wrong');
      expect(useStore.getState().simulationError).toBe('Something went wrong');
      setSimulationError(null);
      expect(useStore.getState().simulationError).toBeNull();
    });
  });
});
