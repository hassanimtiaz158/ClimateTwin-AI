import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  PlayIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { api, ApiError } from '../services/api';
import type { HistoryItem } from '../types';

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
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

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    case 'failed':
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
    case 'running':
      return <PlayIcon className="h-5 w-5 text-yellow-600" />;
    default:
      return <ClockIcon className="h-5 w-5 text-gray-500" />;
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-100';
    case 'failed': return 'bg-red-100';
    case 'running': return 'bg-yellow-100';
    default: return 'bg-gray-100';
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-700';
    case 'running': return 'bg-yellow-100 text-yellow-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
}

type StatusFilter = 'all' | 'completed' | 'running' | 'failed' | 'pending';

export default function History() {
  const [runs, setRuns] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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

  const filteredRuns = useMemo(() => {
    if (statusFilter === 'all') return runs;
    return runs.filter((r) => r.status === statusFilter);
  }, [runs, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: runs.length, completed: 0, running: 0, failed: 0, pending: 0 };
    runs.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [runs]);

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Header />
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative mb-4">
            <div className="w-12 h-12 border-4 border-primary-200 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
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
        <Header />
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
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulation History</h1>
          <p className="text-gray-500 text-sm mt-1">{runs.length} simulation{runs.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
          <Link
            to="/scenario/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm"
          >
            <PlusCircleIcon className="h-4 w-4" />
            New Scenario
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs */}
      {runs.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <FunnelIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          {(['all', 'completed', 'running', 'failed', 'pending'] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className="ml-1 text-[10px] opacity-70">({statusCounts[filter] || 0})</span>
            </button>
          ))}
        </div>
      )}

      {filteredRuns.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card text-center py-16">
          <ClockIcon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {statusFilter === 'all' ? 'No simulations yet' : `No ${statusFilter} simulations`}
          </h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            {statusFilter === 'all'
              ? 'Create your first climate scenario to see simulation results here.'
              : 'Try a different filter or create a new scenario.'}
          </p>
          <Link
            to="/scenario/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Create Your First Scenario
          </Link>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {filteredRuns.map((run) => (
            <div
              key={run.id}
              className="bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${getStatusBg(run.status)}`}>
                  {getStatusIcon(run.status)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Scenario {run.scenario_id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(run.created_at)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">
                    Run: {run.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(run.status)}`}>
                  {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                </span>
                {run.status === 'completed' && (
                  <Link
                    to={`/dashboard/${run.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors text-sm font-medium"
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

function Header() {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Simulation History</h1>
      <Link
        to="/scenario/new"
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm"
      >
        <PlusCircleIcon className="h-4 w-4" />
        New Scenario
      </Link>
    </div>
  );
}
