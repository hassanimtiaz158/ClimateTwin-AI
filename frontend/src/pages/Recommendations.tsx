import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  SparklesIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { api, ApiError } from '../services/api';
import type { Recommendations as RecommendationsType } from '../types';

export default function Recommendations() {
  const { runId } = useParams<{ runId: string }>();
  const [recommendations, setRecommendations] = useState<RecommendationsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!runId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRecommendations(runId);
      setRecommendations(data);
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.detail
        : 'Failed to load recommendations';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to={`/dashboard/${runId}`}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
            <p className="text-gray-500">Based on your scenario analysis</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative mb-4">
            <div className="w-12 h-12 border-4 border-climate-green/20 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-climate-green rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Generating AI recommendations...</p>
          <p className="text-gray-400 text-sm mt-1">Analyzing your climate projections</p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────
  if (error || !recommendations) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to={`/dashboard/${runId}`}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
            <p className="text-gray-500">Based on your scenario analysis</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Failed to load recommendations</h2>
          <p className="text-gray-500 text-sm mb-4 max-w-md text-center">
            {error || 'No recommendations available for this simulation.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRecommendations}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Try Again
            </button>
            <Link
              to={`/dashboard/${runId}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-climate-green text-white rounded-xl font-medium hover:bg-climate-green/90 transition-colors text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to={`/dashboard/${runId}`}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
          <p className="text-gray-500">Based on your scenario analysis</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-climate-green/5 to-emerald-50 rounded-2xl border border-climate-green/20 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-climate-green/10 rounded-xl">
            <SparklesIcon className="h-6 w-6 text-climate-green" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Executive Summary</h2>
            <p className="text-gray-700 leading-relaxed">{recommendations.summary}</p>
          </div>
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Key Findings</h2>
        <ul className="space-y-3">
          {recommendations.findings.map((finding, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-climate-green/10 text-climate-green rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </span>
              <p className="text-gray-700 leading-relaxed">{finding}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recommended Actions</h2>
        <div className="space-y-4">
          {recommendations.actions.map((action, index) => (
            <div
              key={index}
              className={`p-5 rounded-xl border-l-4 ${
                action.priority === 'high'
                  ? 'border-red-500 bg-red-50/50'
                  : action.priority === 'medium'
                  ? 'border-amber-500 bg-amber-50/50'
                  : 'border-green-500 bg-green-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{action.title}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    action.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : action.priority === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {action.priority}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{action.description}</p>
              <div className="flex items-center gap-1.5 text-sm">
                <CheckCircleIcon className="h-4 w-4 text-climate-green" />
                <span className="text-gray-500">Expected Impact:</span>
                <span className="font-medium text-climate-green">{action.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Model Confidence</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-700 ${
                recommendations.confidence >= 80
                  ? 'bg-climate-green'
                  : recommendations.confidence >= 60
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${recommendations.confidence}%` }}
            />
          </div>
          <span className="font-semibold text-lg text-gray-800">
            {recommendations.confidence}%
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Confidence is based on data quality and model reliability for this region.
        </p>
      </div>

      {/* Back to Dashboard */}
      <div className="text-center pb-8">
        <Link
          to={`/dashboard/${runId}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-climate-green text-white rounded-xl font-medium hover:bg-climate-green/90 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
