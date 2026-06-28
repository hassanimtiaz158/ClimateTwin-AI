import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  FireIcon,
  CloudIcon,
  BeakerIcon,
  LifebuoyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { api, ApiError } from '../services/api';
import { exportJSON, exportHTML } from '../services/exportReport';
import { calculateImpactScore } from '../utils';
import { useStore } from '../store/useStore';
import type { SimulationResults } from '../types';

// ── Metric Card Configuration ─────────────────────────────────
const METRIC_CONFIG = [
  {
    key: 'temperature_change' as const,
    label: 'Temperature Change',
    unit: '°C',
    icon: FireIcon,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    description: 'Projected temperature increase',
    goodDirection: 'down' as const,
  },
  {
    key: 'co2_change' as const,
    label: 'CO₂ Level Change',
    unit: 'ppm',
    icon: CloudIcon,
    color: 'from-gray-500 to-slate-600',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    description: 'Atmospheric CO₂ concentration',
    goodDirection: 'down' as const,
  },
  {
    key: 'air_quality_change' as const,
    label: 'Air Quality Index',
    unit: 'AQI',
    icon: BeakerIcon,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    description: 'Air pollution level',
    goodDirection: 'down' as const,
  },
  {
    key: 'forest_cover_change' as const,
    label: 'Forest Cover',
    unit: '%',
    icon: LifebuoyIcon,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    description: 'Forest coverage change',
    goodDirection: 'up' as const,
  },
  {
    key: 'biodiversity_change' as const,
    label: 'Biodiversity Score',
    unit: '',
    icon: LifebuoyIcon,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    description: 'Ecosystem health',
    goodDirection: 'up' as const,
  },
  {
    key: 'water_stress_change' as const,
    label: 'Water Stress',
    unit: '',
    icon: BeakerIcon,
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    description: 'Water scarcity pressure',
    goodDirection: 'down' as const,
  },
  {
    key: 'heatwave_change' as const,
    label: 'Heatwave Days',
    unit: 'days',
    icon: FireIcon,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    description: 'Extreme heat events',
    goodDirection: 'down' as const,
  },
  {
    key: 'flood_risk_change' as const,
    label: 'Flood Risk',
    unit: '',
    icon: ExclamationTriangleIcon,
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    description: 'Flooding probability',
    goodDirection: 'down' as const,
  },
];

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl">
        <p className="font-semibold text-gray-800 mb-2">Year {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium">{typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ── Chart Card Component ──────────────────────────────────────
function ChartCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ── Main Dashboard Component ──────────────────────────────────
export default function Dashboard() {
  const { runId } = useParams<{ runId: string }>();
  const { getCachedResults, cacheResults } = useStore();
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!runId) return;

    // Check cache first
    const cached = getCachedResults(runId);
    if (cached) {
      setResults(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.getResults(runId);
      cacheResults(runId, data);
      setResults(data);
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.detail
        : 'Failed to load simulation results';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [runId, getCachedResults, cacheResults]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="spinner w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="mt-6 text-gray-600 font-medium">Loading simulation results...</p>
        <p className="mt-2 text-gray-400 text-sm">Analyzing climate projections</p>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────
  if (error || !results) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-6 max-w-md text-center">{error || 'No results found'}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchResults}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Retry
          </button>
          <Link
            to="/scenario/new"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            New Scenario
          </Link>
        </div>
      </div>
    );
  }

  const metrics = results.metrics;
  const projections = results.projections;

  // ── Calculate overall score ─────────────────────────────────
  const impactScore = calculateImpactScore(metrics);
  const getScoreColor = () => {
    if (impactScore >= 70) return 'text-green-600';
    if (impactScore >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  // ── Prepare radar data ─────────────────────────────────────
  const radarData = [
    { subject: 'Temperature', value: Math.max(0, 100 + metrics.temperature_change * 20), fullMark: 100 },
    { subject: 'CO₂', value: Math.max(0, 100 - metrics.co2_change * 0.5), fullMark: 100 },
    { subject: 'Air Quality', value: Math.max(0, 100 - metrics.air_quality_change * 2), fullMark: 100 },
    { subject: 'Forest', value: Math.max(0, 50 + metrics.forest_cover_change * 5), fullMark: 100 },
    { subject: 'Biodiversity', value: Math.max(0, 50 + metrics.biodiversity_change * 100), fullMark: 100 },
    { subject: 'Water', value: Math.max(0, 100 - metrics.water_stress_change * 100), fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-50 rounded-xl">
                  <ChartBarIcon className="h-6 w-6 text-primary-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Climate Dashboard</h1>
              </div>
              <p className="text-gray-500 ml-11">
                Scenario {results.scenario_id.slice(0, 8)} · Run {results.run_id.slice(0, 8)}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-11 sm:ml-0">
              <Link
                to="/history"
                className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ArrowPathIcon className="h-4 w-4 inline mr-1" />
                History
              </Link>
              <Link
                to={`/recommendations/${runId}`}
                className="px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
              >
                <SparklesIcon className="h-4 w-4 inline mr-1" />
                AI Insights
                <ArrowRightIcon className="h-4 w-4 inline ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Impact Score Banner ───────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={impactScore >= 70 ? '#22c55e' : impactScore >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(impactScore / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getScoreColor()}`}>{impactScore}</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Impact Score</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {impactScore >= 70
                    ? 'Great! Your scenario shows positive climate impact'
                    : impactScore >= 50
                    ? 'Moderate impact. Consider increasing action levels'
                    : 'Low impact. More aggressive actions recommended'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${metrics.temperature_change > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                  {metrics.temperature_change > 0 ? '+' : ''}{metrics.temperature_change.toFixed(2)}°
                </div>
                <div className="text-xs text-gray-500 mt-1">Temp Change</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${metrics.co2_change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {metrics.co2_change > 0 ? '+' : ''}{metrics.co2_change.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">CO₂ ppm</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${metrics.forest_cover_change > 0 ? 'text-green-500' : 'text-orange-500'}`}>
                  {metrics.forest_cover_change > 0 ? '+' : ''}{metrics.forest_cover_change.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Forest Cover</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Metric Cards Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
          {METRIC_CONFIG.map((config) => {
            const value = metrics[config.key];
            const isGood =
              (config.goodDirection === 'down' && value < 0) ||
              (config.goodDirection === 'up' && value > 0);
            const isBad =
              (config.goodDirection === 'down' && value > 0) ||
              (config.goodDirection === 'up' && value < 0);
            const Icon = config.icon;

            return (
              <div
                key={config.key}
                className={`bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all p-5 group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.color} text-white shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isGood && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  {isBad && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="text-sm text-gray-500 mb-1">{config.label}</div>
                <div className={`text-2xl font-bold ${
                  isGood ? 'text-green-600' : isBad ? 'text-red-500' : 'text-gray-800'
                }`}>
                  {value > 0 ? '+' : ''}{value.toFixed(config.key === 'heatwave_change' ? 0 : 2)}
                  {config.unit && <span className="text-sm font-normal ml-1">{config.unit}</span>}
                </div>
                <div className="text-xs text-gray-400 mt-2">{config.description}</div>
              </div>
            );
          })}
        </div>

        {/* ── Charts Grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Temperature Chart */}
          <ChartCard title="Temperature Projection" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={projections}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="baseline_temperature"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#baselineGradient)"
                  name="Baseline (°C)"
                />
                <Area
                  type="monotone"
                  dataKey="temperature_change"
                  stroke="#f97316"
                  strokeWidth={3}
                  fill="url(#tempGradient)"
                  name="With Actions (°C)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* CO2 Chart */}
          <ChartCard title="CO₂ Level Projection">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="baseline_co2"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Baseline (ppm)"
                />
                <Line
                  type="monotone"
                  dataKey="co2_level"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="With Actions (ppm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Air Quality Chart */}
          <ChartCard title="Air Quality Index">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={projections}>
                <defs>
                  <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="air_quality_index"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#aqiGradient)"
                  name="AQI"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Forest Cover Chart */}
          <ChartCard title="Forest Cover">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={projections}>
                <defs>
                  <linearGradient id="forestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="forest_cover"
                  stroke="#16a34a"
                  strokeWidth={3}
                  fill="url(#forestGradient)"
                  name="Forest Cover (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Biodiversity Chart */}
          <ChartCard title="Biodiversity Score">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="biodiversity_score"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Heatwave Frequency Chart */}
          <ChartCard title="Heatwave Frequency">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="heatwave_frequency"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="Days/Year"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Radar Chart */}
          <ChartCard title="Climate Health Overview">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={12} />
                <PolarRadiusAxis stroke="#e5e7eb" fontSize={10} />
                <Radar
                  name="Impact"
                  dataKey="value"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Water Stress & Flood Risk */}
          <ChartCard title="Water Stress & Flood Risk">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="water_stress"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                  name="Water Stress"
                />
                <Line
                  type="monotone"
                  dataKey="flood_risk"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="Flood Risk"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── AI Recommendations ────────────────────────────── */}
        {results.recommendations && results.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-50 rounded-xl">
                <SparklesIcon className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">AI Recommendations</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.recommendations.slice(0, 6).map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-l-4 transition-all hover:shadow-sm ${
                    rec.priority === 'high'
                      ? 'border-red-500 bg-red-50/50'
                      : rec.priority === 'medium'
                      ? 'border-amber-500 bg-amber-50/50'
                      : 'border-primary-400 bg-primary-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        rec.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : rec.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round(rec.confidence * 100)}% confidence
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{rec.title}</h3>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                to={`/recommendations/${runId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                View All Recommendations
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Footer Actions ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-card p-6">
          <div className="text-sm text-gray-500">
            Run ID: <span className="font-mono">{runId?.slice(0, 8)}...</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => results && exportJSON(results)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Export JSON
            </button>
            <button
              onClick={() => results && exportHTML(results)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Export Report
            </button>
            <Link
              to="/scenario/new"
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              New Scenario
            </Link>
            <Link
              to={`/recommendations/${runId}`}
              className="px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              View Full Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
