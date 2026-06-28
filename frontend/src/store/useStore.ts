import { create } from 'zustand';
import type { ScenarioConfig, SimulationResults } from '../types';

interface AppState {
  // Current scenario being built
  currentScenario: Partial<ScenarioConfig>;
  setCurrentScenario: (scenario: Partial<ScenarioConfig>) => void;
  resetCurrentScenario: () => void;

  // Simulation results cache (keyed by runId)
  resultsCache: Record<string, SimulationResults>;
  cacheResults: (runId: string, results: SimulationResults) => void;
  getCachedResults: (runId: string) => SimulationResults | null;
  clearResultsCache: () => void;

  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Simulation status
  isSimulating: boolean;
  setSimulating: (v: boolean) => void;
  simulationError: string | null;
  setSimulationError: (msg: string | null) => void;
}

const initialScenario: Partial<ScenarioConfig> = {
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
};

export const useStore = create<AppState>((set, get) => ({
  currentScenario: initialScenario,
  setCurrentScenario: (scenario) =>
    set((state) => ({
      currentScenario: { ...state.currentScenario, ...scenario },
    })),
  resetCurrentScenario: () => set({ currentScenario: initialScenario }),

  resultsCache: {},
  cacheResults: (runId, results) =>
    set((state) => ({
      resultsCache: { ...state.resultsCache, [runId]: results },
    })),
  getCachedResults: (runId) => get().resultsCache[runId] ?? null,
  clearResultsCache: () => set({ resultsCache: {} }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  isSimulating: false,
  setSimulating: (v) => set({ isSimulating: v }),
  simulationError: null,
  setSimulationError: (msg) => set({ simulationError: msg }),
}));
