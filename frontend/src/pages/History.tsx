import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';
import type { SimulationRun } from '../types';

export default function History() {
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getHistory();
        setRuns(data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Simulation History</h1>
        <Link to="/scenario/new" className="btn-primary">
          New Scenario
        </Link>
      </div>

      {runs.length === 0 ? (
        <div className="card text-center py-12">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No simulations yet</p>
          <Link to="/scenario/new" className="btn-primary">
            Create Your First Scenario
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <div key={run.id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{run.scenario_name}</h3>
                <p className="text-sm text-gray-500">
                  {run.region} • {run.created_at}
                </p>
                <div className="flex gap-2 mt-2">
                  {run.actions.slice(0, 3).map((action) => (
                    <span
                      key={action}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {action.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {run.actions.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{run.actions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    run.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : run.status === 'running'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {run.status}
                </span>
                <Link
                  to={`/dashboard/${run.id}`}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                >
                  View
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
