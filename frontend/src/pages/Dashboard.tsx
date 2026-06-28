import { useEffect, useState } from 'react';
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
} from 'recharts';
import { api } from '../services/api';
import type { SimulationResults } from '../types';

export default function Dashboard() {
  const { runId } = useParams<{ runId: string }>();
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!runId) return;
      try {
        const data = await api.getResults(runId);
        setResults(data);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [runId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No results found</p>
        <Link to="/scenario/new" className="btn-primary mt-4 inline-block">
          Create New Scenario
        </Link>
      </div>
    );
  }

  const metrics = results.metrics;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Simulation Results</h1>
          <p className="text-gray-500">Run ID: {runId}</p>
        </div>
        <Link
          to={`/recommendations/${runId}`}
          className="btn-primary"
        >
          View AI Recommendations
        </Link>
      </div>

      {/* Metrics Cards - 8 Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500">Temperature Change</div>
          <div className={`text-2xl font-bold ${metrics.temperature_change > 0 ? 'text-climate-orange' : 'text-climate-green'}`}>
            {metrics.temperature_change > 0 ? '+' : ''}{metrics.temperature_change.toFixed(2)}°C
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">CO₂ Level Change</div>
          <div className={`text-2xl font-bold ${metrics.co2_change > 0 ? 'text-climate-red' : 'text-climate-green'}`}>
            {metrics.co2_change > 0 ? '+' : ''}{metrics.co2_change.toFixed(1)} ppm
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Air Quality Index</div>
          <div className={`text-2xl font-bold ${metrics.air_quality_change > 0 ? 'text-climate-orange' : 'text-climate-green'}`}>
            {metrics.air_quality_change > 0 ? '+' : ''}{metrics.air_quality_change.toFixed(1)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Forest Cover</div>
          <div className={`text-2xl font-bold ${metrics.forest_cover_change > 0 ? 'text-climate-green' : 'text-climate-orange'}`}>
            {metrics.forest_cover_change > 0 ? '+' : ''}{metrics.forest_cover_change.toFixed(1)}%
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Biodiversity Score</div>
          <div className={`text-2xl font-bold ${metrics.biodiversity_change > 0 ? 'text-climate-green' : 'text-climate-orange'}`}>
            {metrics.biodiversity_change > 0 ? '+' : ''}{metrics.biodiversity_change.toFixed(3)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Water Stress</div>
          <div className={`text-2xl font-bold ${metrics.water_stress_change > 0 ? 'text-climate-orange' : 'text-climate-green'}`}>
            {metrics.water_stress_change > 0 ? '+' : ''}{metrics.water_stress_change.toFixed(3)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Heatwave Days</div>
          <div className={`text-2xl font-bold ${metrics.heatwave_change > 0 ? 'text-climate-red' : 'text-climate-green'}`}>
            {metrics.heatwave_change > 0 ? '+' : ''}{metrics.heatwave_change.toFixed(0)} days
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Flood Risk</div>
          <div className={`text-2xl font-bold ${metrics.flood_risk_change > 0 ? 'text-climate-orange' : 'text-climate-green'}`}>
            {metrics.flood_risk_change > 0 ? '+' : ''}{metrics.flood_risk_change.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Temperature Projection Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Temperature Projection</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={results.projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="temperature_change"
              stroke="#f97316"
              fill="#fed7aa"
              name="Temperature Change (°C)"
            />
            <Area
              type="monotone"
              dataKey="baseline_temperature"
              stroke="#9ca3af"
              fill="#f3f4f6"
              name="Baseline"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* CO2 Level Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">CO₂ Level Projection</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={results.projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="co2_level"
              stroke="#22c55e"
              strokeWidth={2}
              name="CO₂ (ppm)"
            />
            <Line
              type="monotone"
              dataKey="baseline_co2"
              stroke="#9ca3af"
              strokeDasharray="5 5"
              name="Baseline CO₂"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Air Quality & Forest Cover */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Air Quality Index</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="air_quality_index"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="AQI"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Forest Cover</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={results.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="forest_cover"
                stroke="#16a34a"
                fill="#bbf7d0"
                name="Forest Cover (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biodiversity & Heatwave */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Biodiversity Score</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="biodiversity_score"
                stroke="#ec4899"
                strokeWidth={2}
                name="Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Heatwave Frequency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="heatwave_frequency"
                fill="#ef4444"
                name="Days/Year"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations Summary */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">AI Recommendations</h2>
          <div className="space-y-3">
            {results.recommendations.slice(0, 3).map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'high'
                    ? 'border-climate-red bg-red-50'
                    : rec.priority === 'medium'
                    ? 'border-climate-orange bg-orange-50'
                    : 'border-climate-green bg-green-50'
                }`}
              >
                <div className="font-medium">{rec.title}</div>
                <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
