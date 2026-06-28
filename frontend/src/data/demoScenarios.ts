import {
  ExclamationTriangleIcon,
  SparklesIcon,
  BoltIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import type { ScenarioConfig } from '../types';

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  icon: typeof ExclamationTriangleIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  tagline: string;
  config: ScenarioConfig;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'no-action',
    name: 'No Action Future',
    description:
      'See what happens when we do nothing. All sliders at zero — projections show the trajectory of inaction.',
    icon: ExclamationTriangleIcon,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    accentColor: 'text-red-600',
    tagline: 'Baseline: business as usual',
    config: {
      name: 'No Action Future (Demo)',
      city: 'Global',
      country: 'Global (Worldwide)',
      targetYear: 2050,
      reforestationSlider: 0.0,
      renewableEnergySlider: 0.0,
      evAdoptionSlider: 0.0,
      emissionReductionSlider: 0.0,
      publicTransitSlider: 0.0,
      waterConservationSlider: 0.0,
      notes: 'Demo scenario: zero climate action to show business-as-usual trajectory.',
    },
  },
  {
    id: 'green-recovery',
    name: 'Green Recovery',
    description:
      'Heavy tree planting, strong emission cuts, and water conservation. A nature-first recovery strategy.',
    icon: SparklesIcon,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    accentColor: 'text-emerald-600',
    tagline: 'Nature-first approach',
    config: {
      name: 'Green Recovery (Demo)',
      city: 'New York',
      country: 'United States',
      targetYear: 2040,
      reforestationSlider: 0.9,
      renewableEnergySlider: 0.5,
      evAdoptionSlider: 0.3,
      emissionReductionSlider: 0.7,
      publicTransitSlider: 0.3,
      waterConservationSlider: 0.6,
      notes: 'Demo scenario: nature-first recovery with aggressive reforestation and emission cuts.',
    },
  },
  {
    id: 'renewable-europe',
    name: 'Renewable Europe',
    description:
      'Maximum renewable energy, high EV adoption, and expanded public transit across European cities.',
    icon: BoltIcon,
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    accentColor: 'text-amber-600',
    tagline: 'Energy transition leader',
    config: {
      name: 'Renewable Europe (Demo)',
      city: 'Berlin',
      country: 'Germany',
      targetYear: 2035,
      reforestationSlider: 0.3,
      renewableEnergySlider: 0.95,
      evAdoptionSlider: 0.85,
      emissionReductionSlider: 0.6,
      publicTransitSlider: 0.8,
      waterConservationSlider: 0.3,
      notes: 'Demo scenario: European-style energy transition with renewables, EVs, and public transit.',
    },
  },
  {
    id: 'urban-cooling',
    name: 'Urban Cooling Plan',
    description:
      'Reforestation + public transit + water conservation to combat urban heat islands and flooding.',
    icon: BuildingOffice2Icon,
    color: 'from-cyan-500 to-teal-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    accentColor: 'text-cyan-600',
    tagline: 'Beat the heat',
    config: {
      name: 'Urban Cooling Plan (Demo)',
      city: 'Tokyo',
      country: 'Japan',
      targetYear: 2035,
      reforestationSlider: 0.8,
      renewableEnergySlider: 0.4,
      evAdoptionSlider: 0.5,
      emissionReductionSlider: 0.4,
      publicTransitSlider: 0.9,
      waterConservationSlider: 0.7,
      notes: 'Demo scenario: urban heat mitigation through trees, transit, and water management.',
    },
  },
];
