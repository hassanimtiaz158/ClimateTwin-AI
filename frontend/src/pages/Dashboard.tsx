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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{results.scenario.name}</h1>
          <p className="text-gray-500">{results.scenario.region}</p>
        </div>
        <Link
          to={`/recommendations/${runId}`}
          className="btn-primary"
        >
          View AI Recommendations
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500">Temperature Change</div>
          <div className="text-2xl font-bold text-climate-orange">
            +{results.metrics.temp_change}°C
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">CO₂ Reduction</div>
          <div className="text-2xl font-bold text-climate-green">
            -{results.metrics.co2_reduction}%
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Renewable Energy</div>
          <div className="text-2xl font-bold text-climate-blue">
            {results.metrics.renewable_pct}%
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Air Quality Index</div>
          <div className="text-2xl font-bold text-primary-600">
            {results.metrics.aqi}
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
              dataKey="temperature"
              stroke="#f97316"
              fill="#fed7aa"
              name="Temperature (°C)"
            />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#9ca3af"
              fill="#f3f4f6"
              name="Baseline"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* CO2 Emissions Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">CO₂ Emissions Projection</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={results.projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="co2_emissions"
              stroke="#22c55e"
              strokeWidth={2}
              name="CO₂ (Mt)"
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

      {/* Actions Applied */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Actions Applied</h2>
        <div className="flex flex-wrap gap-2">
          {results.scenario.actions.map((action) => (
            <span
              key={action}
              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              {action.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
