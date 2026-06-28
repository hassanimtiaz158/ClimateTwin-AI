import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const POLICY_SLIDERS = [
  { id: 'renewableEnergySlider', label: 'Renewable Energy', category: 'Energy', description: 'Solar, wind, hydro adoption level' },
  { id: 'publicTransitSlider', label: 'Public Transit', category: 'Transport', description: 'Electric buses, metro expansion' },
  { id: 'reforestationSlider', label: 'Reforestation', category: 'Land Use', description: 'Tree planting, forest protection' },
  { id: 'carbonTaxSlider', label: 'Carbon Tax', category: 'Policy', description: 'Carbon pricing for emitters' },
  { id: 'greenInnovationSlider', label: 'Green Innovation', category: 'Technology', description: 'Clean tech R&D investment' },
];

interface ScenarioConfig {
  name: string;
  city: string;
  country: string;
  targetYear: number;
  renewableEnergySlider: number;
  publicTransitSlider: number;
  reforestationSlider: number;
  carbonTaxSlider: number;
  greenInnovationSlider: number;
  notes: string;
}

export default function ScenarioBuilder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ScenarioConfig>({
    name: '',
    city: '',
    country: '',
    targetYear: 2035,
    renewableEnergySlider: 0.5,
    publicTransitSlider: 0.5,
    reforestationSlider: 0.5,
    carbonTaxSlider: 0.5,
    greenInnovationSlider: 0.5,
    notes: '',
  });

  const updateSlider = (field: keyof ScenarioConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!config.name) {
      toast.error('Please enter a scenario name');
      return;
    }

    setLoading(true);
    try {
      const result = await api.runInlineSimulation(config);
      toast.success('Simulation completed!');
      navigate(`/dashboard/${result.run_id}`);
    } catch (error) {
      toast.error('Failed to run simulation');
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
                Target Year
              </label>
              <input
                type="number"
                className="input-field"
                min={2025}
                max={2050}
                value={config.targetYear}
                onChange={(e) =>
                  setConfig({ ...config, targetYear: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., New York"
                value={config.city}
                onChange={(e) => setConfig({ ...config, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., USA"
                value={config.country}
                onChange={(e) => setConfig({ ...config, country: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Policy Sliders */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Sustainability Policy Sliders</h2>
          <p className="text-gray-500 mb-6">
            Adjust each slider from 0.0 (no action) to 1.0 (maximum effort)
          </p>
          <div className="space-y-6">
            {POLICY_SLIDERS.map((slider) => {
              const value = config[slider.id as keyof ScenarioConfig] as number;
              return (
                <div key={slider.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{slider.label}</span>
                      <span className="text-sm text-gray-500 ml-2">({slider.category})</span>
                    </div>
                    <span className="font-mono text-sm">{(value as number).toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-400">{slider.description}</p>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={value}
                    onChange={(e) => updateSlider(slider.id as keyof ScenarioConfig, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0.0 (None)</span>
                    <span>0.5 (Moderate)</span>
                    <span>1.0 (Maximum)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Notes (Optional)</h2>
          <textarea
            className="input-field w-full h-24"
            placeholder="Add any notes about this scenario..."
            value={config.notes}
            onChange={(e) => setConfig({ ...config, notes: e.target.value })}
          />
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
            {loading ? 'Running...' : 'Run Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
