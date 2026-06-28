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
  city: '',
  country: '',
  targetYear: 2035,
  renewableEnergySlider: 0.5,
  publicTransitSlider: 0.5,
  reforestationSlider: 0.5,
  carbonTaxSlider: 0.5,
  greenInnovationSlider: 0.5,
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
