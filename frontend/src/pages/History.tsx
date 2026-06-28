import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { api, ApiError } from '../services/api';
import type { HistoryItem } from '../types';

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function History() {
  const [runs, setRuns] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHistory();
      setRuns(data);
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.detail
        : 'Failed to load simulation history';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simulation History</h1>
          <Link
            to="/scenario/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-climate-green text-white rounded-xl font-medium hover:bg-climate-green/90 transition-colors text-sm"
          >
            <PlusCircleIcon className="h-4 w-4" />
            New Scenario
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative mb-4">
            <div className="w-12 h-12 border-4 border-climate-green/20 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-climate-green rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Loading history...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching your simulation runs</p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simulation History</h1>
          <Link
            to="/scenario/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-climate-green text-white rounded-xl font-medium hover:bg-climate-green/90 transition-colors text-sm"
          >
            <PlusCircleIcon className="h-4 w-4" />
            New Scenario
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Failed to load history</h2>
          <p className="text-gray-500 text-sm mb-4 max-w-md text-center">{error}</p>
          <button
            onClick={fetchHistory}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Main Content ───────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Simulation History</h1>
        <Link
          to="/scenario/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-climate-green text-white rounded-xl font-medium hover:bg-climate-green/90 transition-colors text-sm"
        >
          <PlusCircleIcon className="h-4 w-4" />
          New Scenario
        </Link>
      </div>

      {runs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
          <ClockIcon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No simulations yet</h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Create your first climate scenario to see simulation results here.
          </p>
          <Link
            to="/scenario/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-climate-green text-white rounded-xl font-medium hover:bg-climate-green/90 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Create Your First Scenario
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${
                  run.status === 'completed'
                    ? 'bg-green-100'
                    : run.status === 'failed'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}>
                  <ClockIcon className={`h-5 w-5 ${
                    run.status === 'completed'
                      ? 'text-green-600'
                      : run.status === 'failed'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Simulation Run</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(run.created_at)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">
                    ID: {run.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    run.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : run.status === 'running'
                      ? 'bg-yellow-100 text-yellow-700'
                      : run.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {run.status}
                </span>
                {run.status === 'completed' && (
                  <Link
                    to={`/dashboard/${run.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-climate-green/10 text-climate-green rounded-xl hover:bg-climate-green/20 transition-colors text-sm font-medium"
                  >
                    View Results
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
