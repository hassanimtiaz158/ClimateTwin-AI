import type { SimulationResults } from '../types';
import { calculateImpactScore, escapeHtml } from '../utils';

// ── Helpers ──────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── JSON Export ──────────────────────────────────────────────

export function exportJSON(results: SimulationResults) {
  const report = {
    reportType: 'ClimateTwin AI — Simulation Report',
    generatedAt: new Date().toISOString(),
    runId: results.run_id,
    scenarioId: results.scenario_id,
    status: results.status,
    metrics: results.metrics,
    projections: results.projections,
    chartData: results.chart_data,
    recommendations: results.recommendations,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const filename = `climatetwin-report-${results.run_id.slice(0, 8)}.json`;
  downloadBlob(blob, filename);
}

// ── HTML Report Export ───────────────────────────────────────

function metricRow(label: string, value: number, unit: string, goodDown: boolean) {
  const isGood = goodDown ? value < 0 : value > 0;
  const color = isGood ? '#16a34a' : value === 0 ? '#6b7280' : '#dc2626';
  const sign = value > 0 ? '+' : '';
  return `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-weight:500">${label}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;text-align:right;color:${color};font-weight:700;font-size:15px">
        ${sign}${value.toFixed(2)} ${unit}
      </td>
    </tr>`;
}

function priorityColor(p: string) {
  if (p === 'high') return '#dc2626';
  if (p === 'medium') return '#d97706';
  return '#16a34a';
}

export function exportHTML(results: SimulationResults) {
  const m = results.metrics;

  const summaryScore = calculateImpactScore(m);

  const scoreColor = summaryScore >= 70 ? '#16a34a' : summaryScore >= 50 ? '#d97706' : '#dc2626';
  const scoreLabel = summaryScore >= 70 ? 'Positive Impact' : summaryScore >= 50 ? 'Moderate Impact' : 'Low Impact';

  // Build projection summary table (first, mid, last year)
  const projLen = results.projections.length;
  const projSamples = projLen > 0
    ? [results.projections[0], results.projections[Math.floor(projLen / 2)], results.projections[projLen - 1]]
    : [];

  const projectionTableRows = projSamples.map((p) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:500">${p.year}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right">${p.temperature_change.toFixed(2)}°C</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right">${p.co2_level.toFixed(0)} ppm</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right">${p.forest_cover.toFixed(1)}%</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right">${p.air_quality_index.toFixed(0)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right">${p.heatwave_frequency.toFixed(0)}</td>
    </tr>`).join('');

  const recsHTML = results.recommendations.map((r) => `
    <div style="padding:16px;border-left:4px solid ${priorityColor(r.priority)};background:${r.priority === 'high' ? '#fef2f2' : r.priority === 'medium' ? '#fffbeb' : '#f0fdf4'};border-radius:8px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${priorityColor(r.priority)}">${r.priority} priority</span>
        <span style="font-size:11px;color:#6b7280">${Math.round(r.confidence * 100)}% confidence</span>
      </div>
      <div style="font-weight:700;margin-bottom:4px">${escapeHtml(r.title)}</div>
      <div style="font-size:14px;color:#4b5563">${escapeHtml(r.description)}</div>
    </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ClimateTwin AI — Report</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',system-ui,-apple-system,sans-serif; color:#1e293b; line-height:1.6; background:#f8fafc; }
    @media print { body { background:#fff; } .no-print { display:none !important; } }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:32px 24px">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #e2e8f0">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#16a34a;margin-bottom:8px">ClimateTwin AI</div>
      <h1 style="font-size:28px;font-weight:800;margin-bottom:4px">Climate Impact Report</h1>
      <div style="color:#6b7280;font-size:14px">Generated ${formatDate()}</div>
      <div style="color:#94a3b8;font-size:12px;margin-top:4px">Run ID: ${escapeHtml(results.run_id.slice(0, 12))}...</div>
    </div>

    <!-- Impact Score -->
    <div style="text-align:center;margin-bottom:36px;padding:28px;background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border-radius:16px;border:1px solid #bbf7d0">
      <div style="font-size:48px;font-weight:800;color:${scoreColor}">${summaryScore}</div>
      <div style="font-size:16px;font-weight:600;color:${scoreColor}">${scoreLabel}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px">Overall Impact Score (0–100)</div>
    </div>

    <!-- Key Metrics -->
    <div style="margin-bottom:32px">
      <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Key Metrics</h2>
      <table style="width:100%;border-collapse:collapse">
        ${metricRow('Temperature Change', m.temperature_change, '°C', true)}
        ${metricRow('CO₂ Level Change', m.co2_change, 'ppm', true)}
        ${metricRow('Air Quality Index', m.air_quality_change, 'AQI', true)}
        ${metricRow('Forest Cover Change', m.forest_cover_change, '%', false)}
        ${metricRow('Biodiversity Score', m.biodiversity_change, '', false)}
        ${metricRow('Water Stress Change', m.water_stress_change, '', true)}
        ${metricRow('Heatwave Days Change', m.heatwave_change, 'days', true)}
        ${metricRow('Flood Risk Change', m.flood_risk_change, '', true)}
      </table>
    </div>

    <!-- Projection Highlights -->
    ${projSamples.length > 0 ? `
    <div style="margin-bottom:32px">
      <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Projection Highlights</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:8px 12px;text-align:left;font-weight:600;border-bottom:2px solid #e2e8f0">Year</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:2px solid #e2e8f0">Temp (°C)</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:2px solid #e2e8f0">CO₂ (ppm)</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:2px solid #e2e8f0">Forest</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:2px solid #e2e8f0">AQI</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:2px solid #e2e8f0">Heatwaves</th>
          </tr>
        </thead>
        <tbody>${projectionTableRows}</tbody>
      </table>
    </div>` : ''}

    <!-- Recommendations -->
    ${results.recommendations.length > 0 ? `
    <div style="margin-bottom:32px">
      <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">AI Recommendations</h2>
      ${recsHTML}
    </div>` : ''}

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px">
      <p>Generated by <strong>ClimateTwin AI</strong> — AI-Powered Climate Intelligence</p>
      <p style="margin-top:4px">climatetwin.ai &middot; Open Source Climate Platform</p>
    </div>

    <!-- Print Button -->
    <div class="no-print" style="text-align:center;margin-top:24px">
      <button onclick="window.print()" style="padding:12px 32px;background:#16a34a;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer">
        Print / Save as PDF
      </button>
    </div>

  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const filename = `climatetwin-report-${results.run_id.slice(0, 8)}.html`;
  downloadBlob(blob, filename);
}

// ── Comparison Report Export ─────────────────────────────────

export interface ComparisonData {
  scenarios: Array<{
    name: string;
    city: string;
    country: string;
    targetYear: number;
    metrics: SimulationResults['metrics'];
  }>;
}

export function exportComparisonJSON(data: ComparisonData) {
  const report = {
    reportType: 'ClimateTwin AI — Comparison Report',
    generatedAt: new Date().toISOString(),
    scenarios: data.scenarios,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'climatetwin-comparison.json');
}

export function exportComparisonHTML(data: ComparisonData) {
  const rows = data.scenarios.map((s) => {
    const m = s.metrics;
    return `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-weight:600">${s.name}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0">${s.city}, ${s.country}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;text-align:center">${s.targetYear}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;text-align:right;color:${m.temperature_change > 0 ? '#dc2626' : '#16a34a'}">${m.temperature_change > 0 ? '+' : ''}${m.temperature_change.toFixed(2)}°C</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;text-align:right;color:${m.co2_change > 0 ? '#dc2626' : '#16a34a'}">${m.co2_change > 0 ? '+' : ''}${m.co2_change.toFixed(0)} ppm</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;text-align:right;color:${m.forest_cover_change > 0 ? '#16a34a' : '#dc2626'}">${m.forest_cover_change > 0 ? '+' : ''}${m.forest_cover_change.toFixed(1)}%</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;text-align:right;color:${m.air_quality_change < 0 ? '#16a34a' : '#dc2626'}">${m.air_quality_change > 0 ? '+' : ''}${m.air_quality_change.toFixed(2)}</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ClimateTwin AI — Comparison Report</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',system-ui,-apple-system,sans-serif; color:#1e293b; line-height:1.6; background:#f8fafc; }
    @media print { body { background:#fff; } .no-print { display:none !important; } }
  </style>
</head>
<body>
  <div style="max-width:900px;margin:0 auto;padding:32px 24px">

    <div style="text-align:center;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #e2e8f0">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#16a34a;margin-bottom:8px">ClimateTwin AI</div>
      <h1 style="font-size:28px;font-weight:800;margin-bottom:4px">Scenario Comparison Report</h1>
      <div style="color:#6b7280;font-size:14px">Generated ${formatDate()}</div>
    </div>

    <div style="margin-bottom:32px">
      <h2 style="font-size:18px;font-weight:700;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Comparison Summary</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:10px 16px;text-align:left;font-weight:600;border-bottom:2px solid #e2e8f0">Scenario</th>
            <th style="padding:10px 16px;text-align:left;font-weight:600;border-bottom:2px solid #e2e8f0">Location</th>
            <th style="padding:10px 16px;text-align:center;font-weight:600;border-bottom:2px solid #e2e8f0">Target</th>
            <th style="padding:10px 16px;text-align:right;font-weight:600;border-bottom:2px solid #e2e8f0">Temp Δ</th>
            <th style="padding:10px 16px;text-align:right;font-weight:600;border-bottom:2px solid #e2e8f0">CO₂ Δ</th>
            <th style="padding:10px 16px;text-align:right;font-weight:600;border-bottom:2px solid #e2e8f0">Forest Δ</th>
            <th style="padding:10px 16px;text-align:right;font-weight:600;border-bottom:2px solid #e2e8f0">AQI Δ</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div style="text-align:center;padding-top:24px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px">
      <p>Generated by <strong>ClimateTwin AI</strong> — AI-Powered Climate Intelligence</p>
    </div>

    <div class="no-print" style="text-align:center;margin-top:24px">
      <button onclick="window.print()" style="padding:12px 32px;background:#16a34a;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer">
        Print / Save as PDF
      </button>
    </div>

  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, 'climatetwin-comparison.html');
}
