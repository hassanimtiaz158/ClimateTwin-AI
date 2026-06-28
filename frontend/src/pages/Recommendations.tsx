import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';
import type { Recommendations } from '../types';

export default function Recommendations() {
  const { runId } = useParams<{ runId: string }>();
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!runId) return;
      try {
        const data = await api.getRecommendations(runId);
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [runId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Generating AI recommendations...</div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No recommendations available</p>
        <Link to="/history" className="btn-primary mt-4 inline-block">
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link to={`/dashboard/${runId}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">AI Recommendations</h1>
          <p className="text-gray-500">Based on your scenario analysis</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="card bg-gradient-to-r from-primary-50 to-green-50">
        <div className="flex items-start gap-4">
          <SparklesIcon className="h-8 w-8 text-primary-600 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Executive Summary</h2>
            <p className="text-gray-700">{recommendations.summary}</p>
          </div>
        </div>
      </div>

      {/* Key Findings */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Key Findings</h2>
        <ul className="space-y-3">
          {recommendations.findings.map((finding, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <p>{finding}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recommended Actions</h2>
        <div className="space-y-4">
          {recommendations.actions.map((action, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{action.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    action.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : action.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {action.priority}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{action.description}</p>
              <div className="text-sm text-gray-500">
                <span>Expected Impact: </span>
                <span className="font-medium text-climate-green">{action.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Model Confidence</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div
              className="bg-primary-600 h-4 rounded-full"
              style={{ width: `${recommendations.confidence}%` }}
            />
          </div>
          <span className="font-semibold">{recommendations.confidence}%</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Confidence is based on data quality and model reliability for this region.
        </p>
      </div>
    </div>
  );
}
