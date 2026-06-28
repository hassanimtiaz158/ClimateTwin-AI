import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
      resultsCache: {},
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
});
