import { create } from 'zustand';
import type { SimulationResults } from '../types';

interface AppState {
  resultsCache: Record<string, SimulationResults>;
  cacheResults: (runId: string, results: SimulationResults) => void;
  getCachedResults: (runId: string) => SimulationResults | null;
  clearResultsCache: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  resultsCache: {},
  cacheResults: (runId, results) =>
    set((state) => ({
      resultsCache: { ...state.resultsCache, [runId]: results },
    })),
  getCachedResults: (runId) => get().resultsCache[runId] ?? null,
  clearResultsCache: () => set({ resultsCache: {} }),
}));
