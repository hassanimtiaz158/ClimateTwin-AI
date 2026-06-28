import { create } from 'zustand';
import type { ScenarioConfig, SimulationResults } from '../types';

interface AppState {
  // Current scenario being built
  currentScenario: Partial<ScenarioConfig>;
  setCurrentScenario: (scenario: Partial<ScenarioConfig>) => void;
  resetCurrentScenario: () => void;

  // Current simulation results
  currentResults: SimulationResults | null;
  setCurrentResults: (results: SimulationResults | null) => void;

  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const initialScenario: Partial<ScenarioConfig> = {
  name: '',
  region: 'Global',
  actions: [],
  startYear: 2024,
  endYear: 2034,
};

export const useStore = create<AppState>((set) => ({
  currentScenario: initialScenario,
  setCurrentScenario: (scenario) =>
    set((state) => ({
      currentScenario: { ...state.currentScenario, ...scenario },
    })),
  resetCurrentScenario: () => set({ currentScenario: initialScenario }),

  currentResults: null,
  setCurrentResults: (results) => set({ currentResults: results }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
