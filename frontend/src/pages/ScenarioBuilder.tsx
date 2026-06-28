import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const ACTIONS = [
  { id: 'renewable_energy', label: 'Renewable Energy Adoption', category: 'Energy' },
  { id: 'public_transit', label: 'Public Transit Expansion', category: 'Transport' },
  { id: 'reforestation', label: 'Reforestation Program', category: 'Land Use' },
  { id: 'carbon_tax', label: 'Carbon Tax Implementation', category: 'Policy' },
  { id: 'waste_reduction', label: 'Waste Reduction Initiative', category: 'Waste' },
  { id: 'green_buildings', label: 'Green Building Standards', category: 'Buildings' },
];

const REGIONS = [
  'Global',
  'North America',
  'Europe',
  'Asia Pacific',
  'Africa',
  'South America',
  'Middle East',
];

interface ScenarioConfig {
  name: string;
  region: string;
  actions: string[];
  startYear: number;
  endYear: number;
}

export default function ScenarioBuilder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ScenarioConfig>({
    name: '',
    region: 'Global',
    actions: [],
    startYear: 2024,
    endYear: 2034,
  });

  const toggleAction = (actionId: string) => {
    setConfig((prev) => ({
      ...prev,
      actions: prev.actions.includes(actionId)
        ? prev.actions.filter((a) => a !== actionId)
        : [...prev.actions, actionId],
    }));
  };

  const handleSubmit = async () => {
    if (!config.name) {
      toast.error('Please enter a scenario name');
      return;
    }
    if (config.actions.length === 0) {
      toast.error('Please select at least one action');
      return;
    }

    setLoading(true);
    try {
      const scenario = await api.createScenario(config);
      const result = await api.runSimulation(scenario.id);
      toast.success('Simulation started!');
      navigate(`/dashboard/${result.run_id}`);
    } catch (error) {
      toast.error('Failed to create scenario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create Climate Scenario</h1>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Scenario Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scenario Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Green City 2030"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                className="input-field"
                value={config.region}
                onChange={(e) => setConfig({ ...config, region: e.target.value })}
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Year
              </label>
              <input
                type="number"
                className="input-field"
                min={2024}
                max={2030}
                value={config.startYear}
                onChange={(e) =>
                  setConfig({ ...config, startYear: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Year
              </label>
              <input
                type="number"
                className="input-field"
                min={2025}
                max={2035}
                value={config.endYear}
                onChange={(e) =>
                  setConfig({ ...config, endYear: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
        </div>

        {/* Actions Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Select Climate Actions</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => toggleAction(action.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  config.actions.includes(action.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{action.label}</div>
                <div className="text-sm text-gray-500">{action.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Run Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
