/**
 * Shared utility functions for ClimateTwin AI.
 */

import type { SimulationResults } from './types';

/**
 * Calculate the overall impact score (0-100) from simulation metrics.
 * Higher score = more positive climate impact.
 */
export function calculateImpactScore(metrics: SimulationResults['metrics']): number {
  let score = 50;
  if (metrics.temperature_change < 0) score += 15;
  else if (metrics.temperature_change > 1) score -= 15;
  if (metrics.co2_change < 0) score += 10;
  else if (metrics.co2_change > 50) score -= 10;
  if (metrics.forest_cover_change > 0) score += 10;
  else if (metrics.forest_cover_change < -5) score -= 10;
  if (metrics.biodiversity_change > 0) score += 5;
  if (metrics.water_stress_change < 0) score += 5;
  return Math.max(0, Math.min(100, score));
}

/**
 * Get color class for an impact score.
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Get background color class for an impact score.
 */
export function getScoreBgColor(score: number): string {
  if (score >= 70) return 'bg-green-100';
  if (score >= 50) return 'bg-amber-100';
  return 'bg-red-100';
}

/**
 * Get label for an impact score.
 */
export function getScoreLabel(score: number): string {
  if (score >= 70) return 'Positive Impact';
  if (score >= 50) return 'Moderate Impact';
  return 'Needs Improvement';
}

/**
 * Escape HTML special characters to prevent injection.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
