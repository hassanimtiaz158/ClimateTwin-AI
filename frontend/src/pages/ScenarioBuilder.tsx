import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  CalendarDaysIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  RocketLaunchIcon,
  BoltIcon,
  TruckIcon,
  CloudArrowUpIcon,
  BuildingOffice2Icon,
  BeakerIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { api } from '../services/api';

// ── Action Definitions ──────────────────────────────────────
const CLIMATE_ACTIONS = [
  {
    id: 'reforestationSlider',
    label: 'Tree Planting & Reforestation',
    shortLabel: 'Reforestation',
    icon: RocketLaunchIcon,
    category: 'Nature',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    description: 'Large-scale tree planting programs to absorb CO₂ and restore ecosystems.',
    impact: 'Absorbs 22kg CO₂/tree/year',
    examples: ['Urban tree planting', 'Forest restoration', 'Mangrove protection'],
    sliderLabel: 'Reforestation Effort',
  },
  {
    id: 'renewableEnergySlider',
    label: 'Renewable Energy Adoption',
    shortLabel: 'Renewables',
    icon: BoltIcon,
    category: 'Energy',
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    description: 'Transition to solar, wind, and hydroelectric power sources.',
    impact: 'Reduces CO₂ by 70-90%',
    examples: ['Solar panels', 'Wind farms', 'Hydroelectric'],
    sliderLabel: 'Renewable Energy Level',
  },
  {
    id: 'evAdoptionSlider',
    label: 'Electric Vehicle Adoption',
    shortLabel: 'EV Adoption',
    icon: TruckIcon,
    category: 'Transport',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    description: 'Accelerate transition from fossil fuel vehicles to electric vehicles.',
    impact: 'Reduces transport CO₂ by 50-70%',
    examples: ['EV subsidies', 'Charging infrastructure', 'Fleet conversion'],
    sliderLabel: 'EV Adoption Rate',
  },
  {
    id: 'emissionReductionSlider',
    label: 'Industrial Emission Reduction',
    shortLabel: 'Emission Cut',
    icon: CloudArrowUpIcon,
    category: 'Industry',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    description: 'Mandate emission caps and carbon pricing for industrial sectors.',
    impact: 'Reduces industrial CO₂ by 20-40%',
    examples: ['Carbon tax', 'Emission caps', 'Green manufacturing'],
    sliderLabel: 'Emission Reduction Strength',
  },
  {
    id: 'publicTransitSlider',
    label: 'Public Transport Improvement',
    shortLabel: 'Public Transit',
    icon: BuildingOffice2Icon,
    category: 'Urban',
    color: 'from-cyan-500 to-teal-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    description: 'Expand and electrify public transportation networks.',
    impact: 'Reduces urban CO₂ by 15-30%',
    examples: ['Electric buses', 'Metro expansion', 'Bike lanes'],
    sliderLabel: 'Public Transit Investment',
  },
  {
    id: 'waterConservationSlider',
    label: 'Water Conservation',
    shortLabel: 'Water',
    icon: BeakerIcon,
    category: 'Resource',
    color: 'from-sky-500 to-blue-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700',
    description: 'Implement water recycling, efficiency, and conservation programs.',
    impact: 'Reduces water stress by 20-40%',
    examples: ['Water recycling', 'Efficient irrigation', 'Drought planning'],
    sliderLabel: 'Water Conservation Level',
  },
];

// ── Location Data ───────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'] },
  { code: 'UK', name: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol'] },
  { code: 'DE', name: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'] },
  { code: 'FR', name: 'France', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'] },
  { code: 'JP', name: 'Japan', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'] },
  { code: 'IN', name: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'] },
  { code: 'BR', name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'] },
  { code: 'AU', name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
  { code: 'CA', name: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'] },
  { code: 'NG', name: 'Nigeria', cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'] },
  { code: 'ZA', name: 'South Africa', cities: ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth'] },
  { code: 'EG', name: 'Egypt', cities: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'] },
  { code: 'PK', name: 'Pakistan', cities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'] },
  { code: 'BD', name: 'Bangladesh', cities: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'] },
  { code: 'GLOBAL', name: 'Global (Worldwide)', cities: ['Global'] },
];

// ── Target Years ────────────────────────────────────────────
const TARGET_YEARS = [
  { year: 2030, label: '2030', subtitle: 'Near-term', description: 'Quick wins, immediate impact' },
  { year: 2035, label: '2035', subtitle: 'Medium-term', description: 'Balanced approach' },
  { year: 2040, label: '2040', subtitle: 'Long-term', description: 'Deep transformation' },
  { year: 2050, label: '2050', subtitle: 'Net Zero', description: 'Full sustainability' },
];

// ── Validation Types ────────────────────────────────────────
interface ValidationErrors {
  name?: string;
  city?: string;
  country?: string;
  targetYear?: string;
  sliders?: string;
}

interface ScenarioConfig {
  name: string;
  city: string;
  country: string;
  targetYear: number;
  reforestationSlider: number;
  renewableEnergySlider: number;
  evAdoptionSlider: number;
  emissionReductionSlider: number;
  publicTransitSlider: number;
  waterConservationSlider: number;
  notes: string;
}

export default function ScenarioBuilder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Location, 2: Actions, 3: Review
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [config, setConfig] = useState<ScenarioConfig>({
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
    notes: '',
  });

  // ── Validation ──────────────────────────────────────────
  const validate = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!config.name.trim()) {
      newErrors.name = 'Scenario name is required';
    } else if (config.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!config.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!config.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (config.targetYear < 2025 || config.targetYear > 2050) {
      newErrors.targetYear = 'Target year must be between 2025 and 2050';
    }

    const totalSliderValue =
      config.reforestationSlider +
      config.renewableEnergySlider +
      config.evAdoptionSlider +
      config.emissionReductionSlider +
      config.publicTransitSlider +
      config.waterConservationSlider;

    if (totalSliderValue === 0) {
      newErrors.sliders = 'Select at least one climate action';
    }

    return newErrors;
  }, [config]);

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: ValidationErrors = {};

    if (stepNumber === 1) {
      if (!config.name.trim()) newErrors.name = 'Scenario name is required';
      else if (config.name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters';
      if (!config.city.trim()) newErrors.city = 'City is required';
      if (!config.country.trim()) newErrors.country = 'Country is required';
    }

    if (stepNumber === 2) {
      const totalSliderValue =
        config.reforestationSlider +
        config.renewableEnergySlider +
        config.evAdoptionSlider +
        config.emissionReductionSlider +
        config.publicTransitSlider +
        config.waterConservationSlider;
      if (totalSliderValue === 0) newErrors.sliders = 'Select at least one climate action';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleFieldChange = (field: keyof ScenarioConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Clear error for this field
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateSlider = (field: keyof ScenarioConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (errors.sliders) {
      setErrors((prev) => ({ ...prev, sliders: undefined }));
    }
  };

  const getSliderIntensity = (value: number): string => {
    if (value >= 0.8) return 'Very High';
    if (value >= 0.6) return 'High';
    if (value >= 0.4) return 'Moderate';
    if (value >= 0.2) return 'Low';
    return 'None';
  };

  const getSliderColorClass = (value: number): string => {
    if (value >= 0.7) return 'from-climate-green to-emerald-500';
    if (value >= 0.4) return 'from-climate-yellow to-amber-500';
    return 'from-gray-300 to-gray-400';
  };

  const getActiveActionsCount = (): number => {
    let count = 0;
    if (config.reforestationSlider > 0) count++;
    if (config.renewableEnergySlider > 0) count++;
    if (config.evAdoptionSlider > 0) count++;
    if (config.emissionReductionSlider > 0) count++;
    if (config.publicTransitSlider > 0) count++;
    if (config.waterConservationSlider > 0) count++;
    return count;
  };

  const getTotalSliderValue = (): number => {
    return (
      config.reforestationSlider +
      config.renewableEnergySlider +
      config.evAdoptionSlider +
      config.emissionReductionSlider +
      config.publicTransitSlider +
      config.waterConservationSlider
    );
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const result = await api.runInlineSimulation(config);
      toast.success('Simulation completed successfully!');
      navigate(`/dashboard/${result.run_id}`);
    } catch (error) {
      toast.error('Failed to run simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step Indicators ──────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
              step === s
                ? 'bg-climate-green text-white scale-110 shadow-lg'
                : step > s
                ? 'bg-climate-green text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step > s ? <CheckCircleIcon className="h-6 w-6" /> : s}
          </div>
          {s < 3 && (
            <div
              className={`w-20 h-1 mx-2 transition-all duration-300 ${
                step > s ? 'bg-climate-green' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const stepLabels = ['Location & Details', 'Climate Actions', 'Review & Run'];

  // ── Step 1: Location & Details ───────────────────────────
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Scenario Name */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-climate-green/10 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-climate-green" />
          </div>
          <h2 className="text-lg font-semibold">Scenario Name</h2>
        </div>
        <input
          type="text"
          className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
          placeholder="e.g., Green City 2030, Carbon Neutral Tokyo"
          value={config.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
        />
        {errors.name && touched.name && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <ExclamationCircleIcon className="h-4 w-4" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Location Selection */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-climate-blue/10 rounded-lg">
            <MapPinIcon className="h-5 w-5 text-climate-blue" />
          </div>
          <h2 className="text-lg font-semibold">Location</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              className={`input-field w-full ${errors.country ? 'border-red-500' : ''}`}
              value={config.country}
              onChange={(e) => {
                const country = e.target.value;
                handleFieldChange('country', country);
                // Auto-select first city of the country
                const countryData = COUNTRIES.find((c) => c.name === country);
                if (countryData && countryData.cities.length > 0) {
                  handleFieldChange('city', countryData.cities[0]);
                }
              }}
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.country && touched.country && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.country}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <select
              className={`input-field w-full ${errors.city ? 'border-red-500' : ''}`}
              value={config.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              disabled={!config.country}
            >
              <option value="">Select a city</option>
              {config.country &&
                COUNTRIES.find((c) => c.name === config.country)?.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>
            {errors.city && touched.city && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.city}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Target Year */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-climate-orange/10 rounded-lg">
            <CalendarDaysIcon className="h-5 w-5 text-climate-orange" />
          </div>
          <h2 className="text-lg font-semibold">Target Year</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TARGET_YEARS.map((ty) => (
            <button
              key={ty.year}
              onClick={() => handleFieldChange('targetYear', ty.year)}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                config.targetYear === ty.year
                  ? 'border-climate-green bg-climate-green/10 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`text-2xl font-bold ${config.targetYear === ty.year ? 'text-climate-green' : 'text-gray-700'}`}>
                {ty.label}
              </div>
              <div className={`text-sm font-medium ${config.targetYear === ty.year ? 'text-climate-green' : 'text-gray-500'}`}>
                {ty.subtitle}
              </div>
              <div className="text-xs text-gray-400 mt-1">{ty.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 2: Climate Actions ──────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-6">
      {errors.sliders && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{errors.sliders}</p>
        </div>
      )}

      {/* Summary Bar */}
      <div className="card bg-gradient-to-r from-climate-green/5 to-emerald-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Climate Action Summary</h3>
            <p className="text-sm text-gray-500">
              {getActiveActionsCount()} of 6 actions selected
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-climate-green">
              {getTotalSliderValue().toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Total Effort Score</div>
          </div>
        </div>
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-climate-green to-emerald-500 transition-all duration-500"
            style={{ width: `${(getTotalSliderValue() / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4">
        {CLIMATE_ACTIONS.map((action) => {
          const value = config[action.id as keyof ScenarioConfig] as number;
          const Icon = action.icon;
          const isActive = value > 0;

          return (
            <div
              key={action.id}
              className={`card transition-all duration-300 ${
                isActive ? `border-2 ${action.borderColor} shadow-md` : 'border border-gray-100'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Icon & Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{action.label}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${action.bgColor} ${action.textColor}`}>
                        {action.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {action.examples.map((ex) => (
                        <span key={ex} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {ex}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      <span className="font-medium">Impact:</span> {action.impact}
                    </p>
                  </div>
                </div>

                {/* Slider */}
                <div className="md:w-64 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">{action.sliderLabel}</span>
                    <span className={`text-sm font-bold ${
                      value >= 0.7 ? 'text-climate-green' : value >= 0.4 ? 'text-climate-yellow' : 'text-gray-400'
                    }`}>
                      {value.toFixed(1)}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={value}
                      onChange={(e) => updateSlider(action.id as keyof ScenarioConfig, parseFloat(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:w-5
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:border-2
                        [&::-webkit-slider-thumb]:border-climate-green
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                    <div
                      className={`absolute top-0 left-0 h-3 rounded-lg bg-gradient-to-r ${getSliderColorClass(value)} pointer-events-none`}
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>None</span>
                    <span className={`font-medium ${
                      value >= 0.7 ? 'text-climate-green' : value >= 0.4 ? 'text-climate-yellow' : ''
                    }`}>
                      {getSliderIntensity(value)}
                    </span>
                    <span>Maximum</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Step 3: Review & Run ─────────────────────────────────
  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Scenario Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Scenario Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Name</span>
              <p className="font-medium">{config.name || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location</span>
              <p className="font-medium">
                {config.city && config.country ? `${config.city}, ${config.country}` : 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Target Year</span>
              <p className="font-medium">{config.targetYear}</p>
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Active Actions ({getActiveActionsCount()})</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {CLIMATE_ACTIONS.map((action) => {
                const value = config[action.id as keyof ScenarioConfig] as number;
                if (value === 0) return null;
                return (
                  <span
                    key={action.id}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${action.bgColor} ${action.textColor}`}
                  >
                    {action.shortLabel}: {(value * 100).toFixed(0)}%
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Effort Breakdown */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Effort Breakdown</h2>
        <div className="space-y-3">
          {CLIMATE_ACTIONS.map((action) => {
            const value = config[action.id as keyof ScenarioConfig] as number;
            if (value === 0) return null;
            return (
              <div key={action.id} className="flex items-center gap-3">
                <action.icon className="h-5 w-5 text-gray-600" />
                <span className="flex-1 text-sm">{action.shortLabel}</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getSliderColorClass(value)}`}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">{(value * 100).toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Notes (Optional)</h2>
        <textarea
          className="input-field w-full h-24"
          placeholder="Add any notes about this scenario..."
          value={config.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">What happens next?</p>
          <p className="mt-1">
            Our AI engine will analyze your scenario using historical climate data and generate
            projections for 8 climate indicators. You'll receive actionable recommendations
            based on the results.
          </p>
        </div>
      </div>
    </div>
  );

  // ── Main Render ──────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Climate Scenario</h1>
        <p className="text-gray-500 mt-2">
          Configure your climate simulation in 3 simple steps
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator />
      <div className="flex justify-center gap-8 mb-8">
        {stepLabels.map((label, idx) => (
          <div
            key={idx}
            className={`text-sm font-medium ${
              step === idx + 1 ? 'text-climate-green' : step > idx + 1 ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={step === 1 ? () => navigate(-1) : handleBack}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-climate-green text-white rounded-xl font-semibold
              hover:bg-climate-green/90 transition-all shadow-lg hover:shadow-xl"
          >
            Next
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-climate-green to-emerald-600
              text-white rounded-xl font-semibold shadow-lg hover:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running Simulation...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Run Simulation
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
