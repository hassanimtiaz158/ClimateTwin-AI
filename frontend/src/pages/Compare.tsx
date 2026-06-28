import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  CheckCircleIcon,
  BoltIcon,
  ChartBarIcon,
  SparklesIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { exportComparisonJSON, exportComparisonHTML, type ComparisonData } from '../services/exportReport';

// ── Predefined Scenarios ─────────────────────────────────────
const PRESET_SCENARIOS = [
  {
    id: 'no-action',
    name: 'No Action',
    subtitle: 'Business as Usual',
    description: 'Continue current practices without any climate intervention',
    color: '#94a3b8',
    colorName: 'slate',
    sliders: {
      reforestation: 0.0,
      renewable_energy: 0.0,
      ev_adoption: 0.0,
      emission_reduction: 0.0,
      public_transit: 0.0,
      water_conservation: 0.0,
    },
  },
  {
    id: 'moderate',
    name: 'Moderate Action',
    subtitle: 'Balanced Approach',
    description: 'Implement common sustainability measures at moderate levels',
    color: '#f59e0b',
    colorName: 'amber',
    sliders: {
      reforestation: 0.4,
      renewable_energy: 0.5,
      ev_adoption: 0.3,
      emission_reduction: 0.3,
      public_transit: 0.4,
      water_conservation: 0.3,
    },
  },
  {
    id: 'strong',
    name: 'Strong Action',
    subtitle: 'Aggressive Transition',
    description: 'Maximum effort across all climate action areas',
    color: '#22c55e',
    colorName: 'green',
    sliders: {
      reforestation: 0.8,
      renewable_energy: 0.9,
      ev_adoption: 0.8,
      emission_reduction: 0.9,
      public_transit: 0.7,
      water_conservation: 0.7,
    },
  },
  {
    id: 'custom',
    name: 'Custom Scenario',
    subtitle: 'Your Configuration',
    description: 'Define your own climate action levels',
    color: '#8b5cf6',
    colorName: 'violet',
    sliders: {
      reforestation: 0.5,
      renewable_energy: 0.5,
      ev_adoption: 0.5,
      emission_reduction: 0.5,
      public_transit: 0.5,
      water_conservation: 0.5,
    },
  },
];

// ── Simulated Projection Data Generator ──────────────────────
function generateProjections(sliders: Record<string, number>, years: number = 11) {
  const baseYear = 2024;
  const projections = [];

  const totalEffort = Object.values(sliders).reduce((a, b) => a + b, 0) / 6;

  for (let i = 0; i < years; i++) {
    const year = baseYear + i;
    const progress = i / (years - 1);

    // Natural trends (worsening without action)
    const naturalTemp = 14.5 + (i * 0.03);
    const naturalCo2 = 420 + (i * 2.5);
    const naturalAqi = 49 + (i * 0.5);
    const naturalForest = 29 - (i * 0.3);
    const naturalBiodiversity = 0.64 - (i * 0.005);
    const naturalWaterStress = 0.5 + (i * 0.01);
    const naturalHeatwave = 18 + (i * 0.5);
    const naturalFloodRisk = 0.34 + (i * 0.005);

    // Action benefits
    const tempBenefit = totalEffort * 0.15 * progress;
    const co2Benefit = totalEffort * 40 * progress;
    const aqiBenefit = totalEffort * 8 * progress;
    const forestBenefit = totalEffort * 5 * progress;
    const biodiversityBenefit = totalEffort * 0.1 * progress;
    const waterBenefit = totalEffort * 0.08 * progress;
    const heatwaveBenefit = totalEffort * 3 * progress;
    const floodBenefit = totalEffort * 0.05 * progress;

    projections.push({
      year,
      temperature: +(naturalTemp - tempBenefit).toFixed(2),
      co2_level: +(naturalCo2 - co2Benefit).toFixed(1),
      air_quality: +(naturalAqi - aqiBenefit).toFixed(1),
      forest_cover: +(naturalForest + forestBenefit).toFixed(1),
      biodiversity: +(naturalBiodiversity + biodiversityBenefit).toFixed(3),
      water_stress: +(naturalWaterStress - waterBenefit).toFixed(3),
      heatwave_days: +Math.round(naturalHeatwave - heatwaveBenefit),
      flood_risk: +(naturalFloodRisk - floodBenefit).toFixed(3),
    });
  }

  return projections;
}

// ── Metric Comparison Data ────────────────────────────────────
const METRICS = [
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️', goodDirection: 'lower' as const, decimals: 2 },
  { key: 'co2_level', label: 'CO₂ Level', unit: 'ppm', icon: '☁️', goodDirection: 'lower' as const, decimals: 1 },
  { key: 'air_quality', label: 'Air Quality', unit: 'AQI', icon: '💨', goodDirection: 'lower' as const, decimals: 1 },
  { key: 'forest_cover', label: 'Forest Cover', unit: '%', icon: '🌲', goodDirection: 'higher' as const, decimals: 1 },
  { key: 'biodiversity', label: 'Biodiversity', unit: '', icon: '🦋', goodDirection: 'higher' as const, decimals: 3 },
  { key: 'water_stress', label: 'Water Stress', unit: '', icon: '💧', goodDirection: 'lower' as const, decimals: 3 },
  { key: 'heatwave_days', label: 'Heatwave Days', unit: 'days', icon: '🔥', goodDirection: 'lower' as const, decimals: 0 },
  { key: 'flood_risk', label: 'Flood Risk', unit: '', icon: '🌊', goodDirection: 'lower' as const, decimals: 3 },
];

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl max-w-xs">
        <p className="font-bold text-gray-800 mb-3 text-sm">Year {label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600 truncate">{entry.name}</span>
              </div>
              <span className="font-semibold text-gray-800">
                {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ── Main Component ────────────────────────────────────────────
export default function Compare() {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['no-action', 'moderate', 'strong']);
  const [customSliders, setCustomSliders] = useState<Record<string, number>>({
    reforestation: 0.5,
    renewable_energy: 0.5,
    ev_adoption: 0.5,
    emission_reduction: 0.5,
    public_transit: 0.5,
    water_conservation: 0.5,
  });

  // Generate projections for each selected scenario
  const scenarioProjections = useMemo(() => {
    const result: Record<string, any[]> = {};

    selectedScenarios.forEach((id) => {
      const scenario = PRESET_SCENARIOS.find((s) => s.id === id);
      if (scenario) {
        const sliders = id === 'custom' ? customSliders : scenario.sliders;
        result[id] = generateProjections(sliders);
      }
    });

    return result;
  }, [selectedScenarios, customSliders]);

  // Toggle scenario selection
  const toggleScenario = (id: string) => {
    setSelectedScenarios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Get color for scenario
  const getScenarioColor = (id: string) => {
    return PRESET_SCENARIOS.find((s) => s.id === id)?.color || '#6b7280';
  };

  // Calculate summary for each scenario
  const getScenarioSummary = (id: string) => {
    const projections = scenarioProjections[id];
    if (!projections || projections.length === 0) return null;

    const first = projections[0];
    const last = projections[projections.length - 1];

    return {
      tempChange: +(last.temperature - first.temperature).toFixed(2),
      co2Change: +(last.co2_level - first.co2_level).toFixed(0),
      forestChange: +(last.forest_cover - first.forest_cover).toFixed(1),
      heatwaveChange: last.heatwave_days - first.heatwave_days,
    };
  };

  // Impact score calculation
  const getImpactScore = (id: string) => {
    const summary = getScenarioSummary(id);
    if (!summary) return 50;

    let score = 50;
    if (summary.tempChange < 0) score += 20;
    else if (summary.tempChange > 0.5) score -= 20;
    if (summary.co2Change < 0) score += 15;
    else if (summary.co2Change > 30) score -= 15;
    if (summary.forestChange > 0) score += 15;
    else if (summary.forestChange < -2) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  // Export comparison data
  const buildComparisonData = (): ComparisonData => ({
    scenarios: selectedScenarios.map((id) => {
      const scenario = PRESET_SCENARIOS.find((s) => s.id === id)!;
      const summary = getScenarioSummary(id);
      return {
        name: scenario.name,
        city: scenario.id === 'custom' ? 'Custom' : scenario.name,
        country: '',
        targetYear: 2035,
        metrics: {
          temperature_change: summary?.tempChange ?? 0,
          co2_change: summary?.co2Change ?? 0,
          air_quality_change: 0,
          forest_cover_change: summary?.forestChange ?? 0,
          biodiversity_change: 0,
          water_stress_change: 0,
          heatwave_change: summary?.heatwaveChange ?? 0,
          flood_risk_change: 0,
        },
      };
    }),
  });

  const handleExportComparison = (format: 'json' | 'html') => {
    const data = buildComparisonData();
    if (format === 'json') exportComparisonJSON(data);
    else exportComparisonHTML(data);
  };

  // Merge projections for comparison charts
  const mergedTemperatureData = useMemo(() => {
    if (selectedScenarios.length === 0) return [];
    const base = scenarioProjections[selectedScenarios[0]];
    if (!base) return [];

    return base.map((point, idx) => {
      const merged: any = { year: point.year };
      selectedScenarios.forEach((id) => {
        const proj = scenarioProjections[id];
        if (proj && proj[idx]) {
          merged[id] = proj[idx].temperature;
        }
      });
      return merged;
    });
  }, [scenarioProjections, selectedScenarios]);

  const mergedCo2Data = useMemo(() => {
    if (selectedScenarios.length === 0) return [];
    const base = scenarioProjections[selectedScenarios[0]];
    if (!base) return [];

    return base.map((point, idx) => {
      const merged: any = { year: point.year };
      selectedScenarios.forEach((id) => {
        const proj = scenarioProjections[id];
        if (proj && proj[idx]) {
          merged[id] = proj[idx].co2_level;
        }
      });
      return merged;
    });
  }, [scenarioProjections, selectedScenarios]);

  const mergedForestData = useMemo(() => {
    if (selectedScenarios.length === 0) return [];
    const base = scenarioProjections[selectedScenarios[0]];
    if (!base) return [];

    return base.map((point, idx) => {
      const merged: any = { year: point.year };
      selectedScenarios.forEach((id) => {
        const proj = scenarioProjections[id];
        if (proj && proj[idx]) {
          merged[id] = proj[idx].forest_cover;
        }
      });
      return merged;
    });
  }, [scenarioProjections, selectedScenarios]);

  const mergedHeatwaveData = useMemo(() => {
    if (selectedScenarios.length === 0) return [];
    const base = scenarioProjections[selectedScenarios[0]];
    if (!base) return [];

    return base.map((point, idx) => {
      const merged: any = { year: point.year };
      selectedScenarios.forEach((id) => {
        const proj = scenarioProjections[id];
        if (proj && proj[idx]) {
          merged[id] = proj[idx].heatwave_days;
        }
      });
      return merged;
    });
  }, [scenarioProjections, selectedScenarios]);

  // Radar data for comparison
  const radarData = useMemo(() => {
    if (selectedScenarios.length === 0) return [];

    const metrics = ['temperature', 'co2_level', 'air_quality', 'forest_cover', 'biodiversity', 'water_stress'];
    const maxValues: Record<string, number> = {
      temperature: 20,
      co2_level: 500,
      air_quality: 80,
      forest_cover: 40,
      biodiversity: 1,
      water_stress: 0.8,
    };

    return metrics.map((metric) => {
      const data: any = { subject: metric.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) };
      selectedScenarios.forEach((id) => {
        const proj = scenarioProjections[id];
        if (proj && proj.length > 0) {
          const lastVal = proj[proj.length - 1][metric as keyof typeof proj[0]];
          data[id] = Math.max(0, Math.min(100, (1 - (lastVal as number) / maxValues[metric]) * 100));
        }
      });
      return data;
    });
  }, [scenarioProjections, selectedScenarios]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Hero Header ──────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-600 text-sm font-medium mb-4">
            <ChartBarIcon className="h-4 w-4" />
            Climate Scenario Comparison
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Compare <span className="text-gradient-green">Futures</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg mb-6">
            See how different climate action levels impact our planet over the next decade.
            Choose scenarios to compare and discover the power of action.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleExportComparison('json')}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium bg-white shadow-card"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExportComparison('html')}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium bg-white shadow-card"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* ── Scenario Selector ────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-primary-600" />
            Select Scenarios to Compare
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_SCENARIOS.map((scenario) => {
              const isSelected = selectedScenarios.includes(scenario.id);
              const score = getImpactScore(scenario.id);

              return (
                <button
                  key={scenario.id}
                  onClick={() => toggleScenario(scenario.id)}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-primary-400 bg-primary-600/5 shadow-lg scale-[1.02]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-card-hover hover:-translate-y-0.5'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                    </div>
                  )}
                  <div
                    className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: scenario.color }}
                  >
                    {scenario.name[0]}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{scenario.name}</h3>
                  <p className="text-sm font-medium text-gray-500 mb-2">{scenario.subtitle}</p>
                  <p className="text-xs text-gray-400 mb-3">{scenario.description}</p>

                  {/* Score badge */}
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${score}%`,
                          backgroundColor: score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{score}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Custom Scenario Sliders ──────────────────────── */}
        {selectedScenarios.includes('custom') && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-10">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BoltIcon className="h-5 w-5 text-violet-500" />
              Customize Your Scenario
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(customSliders).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <span className="text-sm font-bold text-gray-800">{(value * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={value}
                    onChange={(e) =>
                      setCustomSliders((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:h-5
                      [&::-webkit-slider-thumb]:w-5
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-violet-500
                      [&::-webkit-slider-thumb]:shadow-md
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Impact Comparison Cards ──────────────────────── */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-orange-500" />
            Impact Comparison by 2034
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedScenarios.map((id) => {
              const scenario = PRESET_SCENARIOS.find((s) => s.id === id);
              const summary = getScenarioSummary(id);
              const score = getImpactScore(id);

              if (!scenario || !summary) return null;

              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl shadow-card overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="p-4 text-white"
                    style={{ backgroundColor: scenario.color }}
                  >
                    <h3 className="font-bold text-lg">{scenario.name}</h3>
                    <p className="text-sm opacity-90">{scenario.subtitle}</p>
                  </div>

                  {/* Stats */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Temp Change</span>
                      <span className={`font-bold ${summary.tempChange <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {summary.tempChange > 0 ? '+' : ''}{summary.tempChange}°C
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">CO₂ Change</span>
                      <span className={`font-bold ${summary.co2Change <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {summary.co2Change > 0 ? '+' : ''}{summary.co2Change} ppm
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Forest Cover</span>
                      <span className={`font-bold ${summary.forestChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {summary.forestChange > 0 ? '+' : ''}{summary.forestChange}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Heatwave Days</span>
                      <span className={`font-bold ${summary.heatwaveChange <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {summary.heatwaveChange > 0 ? '+' : ''}{summary.heatwaveChange} days
                      </span>
                    </div>

                    {/* Score */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Impact Score</span>
                        <span className={`text-lg font-bold ${
                          score >= 70 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {score}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${score}%`,
                            backgroundColor: score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Comparison Charts ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

          {/* Temperature Comparison */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🌡️</span>
              Temperature Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mergedTemperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedScenarios.map((id) => (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    stroke={getScenarioColor(id)}
                    strokeWidth={3}
                    dot={{ fill: getScenarioColor(id), strokeWidth: 2, r: 4 }}
                    name={PRESET_SCENARIOS.find((s) => s.id === id)?.name || id}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CO2 Comparison */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">☁️</span>
              CO₂ Level Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mergedCo2Data}>
                <defs>
                  {selectedScenarios.map((id) => (
                    <linearGradient key={id} id={`co2Gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getScenarioColor(id)} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={getScenarioColor(id)} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedScenarios.map((id) => (
                  <Area
                    key={id}
                    type="monotone"
                    dataKey={id}
                    stroke={getScenarioColor(id)}
                    strokeWidth={2}
                    fill={`url(#co2Gradient-${id})`}
                    name={PRESET_SCENARIOS.find((s) => s.id === id)?.name || id}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Forest Cover Comparison */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🌲</span>
              Forest Cover Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mergedForestData}>
                <defs>
                  {selectedScenarios.map((id) => (
                    <linearGradient key={id} id={`forestGradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getScenarioColor(id)} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={getScenarioColor(id)} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedScenarios.map((id) => (
                  <Area
                    key={id}
                    type="monotone"
                    dataKey={id}
                    stroke={getScenarioColor(id)}
                    strokeWidth={2}
                    fill={`url(#forestGradient-${id})`}
                    name={PRESET_SCENARIOS.find((s) => s.id === id)?.name || id}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Heatwave Comparison */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              Heatwave Days Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mergedHeatwaveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedScenarios.map((id) => (
                  <Bar
                    key={id}
                    dataKey={id}
                    fill={getScenarioColor(id)}
                    radius={[4, 4, 0, 0]}
                    name={PRESET_SCENARIOS.find((s) => s.id === id)?.name || id}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Radar Chart ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Climate Health Overview
          </h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={12} />
                <PolarRadiusAxis stroke="#e5e7eb" fontSize={10} />
                {selectedScenarios.map((id) => (
                  <Radar
                    key={id}
                    name={PRESET_SCENARIOS.find((s) => s.id === id)?.name || id}
                    dataKey={id}
                    stroke={getScenarioColor(id)}
                    fill={getScenarioColor(id)}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Detailed Comparison Table ────────────────────── */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-10">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-primary-600" />
              Detailed Metrics Comparison (2034)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Metric</th>
                  {selectedScenarios.map((id) => {
                    const scenario = PRESET_SCENARIOS.find((s) => s.id === id);
                    return (
                      <th key={id} className="text-center py-4 px-6 text-sm font-semibold" style={{ color: scenario?.color }}>
                        {scenario?.name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((metric) => (
                  <tr key={metric.key} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{metric.icon}</span>
                        <div>
                          <div className="font-medium text-gray-800">{metric.label}</div>
                          <div className="text-xs text-gray-400">{metric.unit}</div>
                        </div>
                      </div>
                    </td>
                    {selectedScenarios.map((id) => {
                      const projections = scenarioProjections[id];
                      const lastProj = projections?.[projections.length - 1];
                      const firstProj = projections?.[0];
                      if (!lastProj || !firstProj) return null;

                      const value = lastProj[metric.key as keyof typeof lastProj] as number;
                      const firstVal = firstProj[metric.key as keyof typeof firstProj] as number;
                      const change = value - firstVal;

                      // Determine if this is the best/worst
                      const allValues = selectedScenarios.map((sid) => {
                        const proj = scenarioProjections[sid];
                        const last = proj?.[proj.length - 1];
                        return last ? (last[metric.key as keyof typeof last] as number) : 0;
                      });

                      const isBest =
                        (metric.goodDirection === 'lower' && value === Math.min(...allValues)) ||
                        (metric.goodDirection === 'higher' && value === Math.max(...allValues));

                      return (
                        <td key={id} className="text-center py-4 px-6">
                          <div className={`text-lg font-bold ${isBest ? 'text-green-600' : 'text-gray-800'}`}>
                            {value.toFixed(metric.decimals)}
                          </div>
                          <div className={`text-xs ${change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(metric.decimals)}
                          </div>
                          {isBest && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Best
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Key Insights ─────────────────────────────────── */}
        <div className="bg-gradient-to-br from-primary-500/5 to-emerald-50/50 rounded-2xl border border-primary-400/20 p-8 mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-primary-600" />
            Key Insights
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="text-3xl mb-3">🌡️</div>
              <h4 className="font-bold text-gray-800 mb-2">Temperature Impact</h4>
              <p className="text-sm text-gray-600">
                Strong action can reduce temperature increase by up to{' '}
                <span className="font-bold text-primary-600">0.15°C</span> compared to no action.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="text-3xl mb-3">🌲</div>
              <h4 className="font-bold text-gray-800 mb-2">Forest Recovery</h4>
              <p className="text-sm text-gray-600">
                Aggressive reforestation can increase forest cover by{' '}
                <span className="font-bold text-primary-600">+5%</span> over the decade.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="text-3xl mb-3">☁️</div>
              <h4 className="font-bold text-gray-800 mb-2">CO₂ Reduction</h4>
              <p className="text-sm text-gray-600">
                Strong measures can reduce CO₂ levels by{' '}
                <span className="font-bold text-primary-600">40+ ppm</span> compared to baseline.
              </p>
            </div>
          </div>
        </div>

        {/* ── Call to Action ────────────────────────────────── */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/scenario/new"
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Create Your Own Scenario
            </Link>
            <Link
              to="/history"
              className="px-8 py-4 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
