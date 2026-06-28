import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/api';
import type { SimulationResults } from '../types';

export default function Compare() {
  const [scenarioIds, setScenarioIds] = useState<string[]>(['', '']);
  const [results, setResults] = useState<SimulationResults[]>([]);
  const [loading, setLoading] = useState(false);

  const colors = ['#0ea5e9', '#22c55e', '#f97316', '#ef4444', '#8b5cf6'];

  const handleCompare = async () => {
    const validIds = scenarioIds.filter((id) => id.trim() !== '');
    if (validIds.length < 2) {
      return;
    }

    setLoading(true);
    try {
      const promises = validIds.map((id) => api.getResults(id));
      const allResults = await Promise.all(promises);
      setResults(allResults);
    } catch (error) {
      console.error('Failed to compare scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const addScenario = () => {
    setScenarioIds([...scenarioIds, '']);
  };

  const removeScenario = (index: number) => {
    if (scenarioIds.length > 2) {
      setScenarioIds(scenarioIds.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Compare Scenarios</h1>

      {/* Scenario Selection */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Select Scenarios to Compare</h2>
        <div className="space-y-3">
          {scenarioIds.map((id, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1"
                placeholder={`Scenario Run ID ${index + 1}`}
                value={id}
                onChange={(e) => {
                  const newIds = [...scenarioIds];
                  newIds[index] = e.target.value;
                  setScenarioIds(newIds);
                }}
              />
              {scenarioIds.length > 2 && (
                <button
                  onClick={() => removeScenario(index)}
                  className="btn-secondary text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={addScenario} className="btn-secondary">
            Add Scenario
          </button>
          <button
            onClick={handleCompare}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {results.length > 0 && (
        <>
          {/* Temperature Comparison */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Temperature Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={results[0].projections.map((_, i) => ({
                  year: results[0].projections[i].year,
                  ...Object.fromEntries(
                    results.map((r, idx) => [
                      `scenario_${idx + 1}`,
                      r.projections[i]?.temperature,
                    ])
                  ),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                {results.map((r, idx) => (
                  <Line
                    key={idx}
                    type="monotone"
                    dataKey={`scenario_${idx + 1}`}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    name={r.scenario.name || `Scenario ${idx + 1}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CO2 Comparison */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">CO₂ Emissions Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={results[0].projections.map((_, i) => ({
                  year: results[0].projections[i].year,
                  ...Object.fromEntries(
                    results.map((r, idx) => [
                      `scenario_${idx + 1}`,
                      r.projections[i]?.co2_emissions,
                    ])
                  ),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                {results.map((r, idx) => (
                  <Line
                    key={idx}
                    type="monotone"
                    dataKey={`scenario_${idx + 1}`}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    name={r.scenario.name || `Scenario ${idx + 1}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Scenario</th>
                  <th className="text-right py-2">Temp Change</th>
                  <th className="text-right py-2">CO₂ Reduction</th>
                  <th className="text-right py-2">Renewable %</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{r.scenario.name || `Scenario ${idx + 1}`}</td>
                    <td className="text-right py-2">+{r.metrics.temp_change}°C</td>
                    <td className="text-right py-2">-{r.metrics.co2_reduction}%</td>
                    <td className="text-right py-2">{r.metrics.renewable_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
