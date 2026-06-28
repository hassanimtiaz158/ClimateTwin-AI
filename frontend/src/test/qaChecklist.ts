/**
 * QA Checklist — ClimateTwin AI Frontend
 *
 * Run through each item manually. Mark [ ] → [x] when verified.
 * Requires: backend running on localhost:8000, frontend on localhost:3000.
 */

export const qaChecklist = {
  landing: [
    'Page loads without console errors',
    'Hero section renders with title and subtitle',
    '"Get Started" button navigates to /scenario-builder',
    '"Try Demo" button appears in hero',
    'Demo cards section shows 4 preset scenarios',
    'Clicking a demo card triggers simulation and navigates to /dashboard',
    'Navbar links: Get Started, Try Demo, History, GitHub',
    'Logo + ClimateTwin text in navbar',
    'Responsive: hamburger menu on mobile (< 768px)',
    'Smooth scroll animations on section entry',
    'Footer renders with version info',
    'Glassmorphism card styling visible (blur, border)',
  ],

  scenarioBuilder: [
    'Page loads, Step 1 of 3 shown',
    'Step 1: Location fields (City, Country) accept input',
    'Step 1: Target year dropdown shows 2025-2050',
    'Step 1: "Quick Start" preset buttons visible',
    'Clicking a preset button fills sliders and advances',
    'Step 2: All 6 sliders render with labels',
    'Step 2: Sliders update values on drag',
    'Step 2: Numeric display shows current slider value',
    'Step 2: "Next" button enables when at least one slider > 0',
    'Step 3: Review shows scenario summary',
    'Step 3: "Run Simulation" button triggers API call',
    'Loading spinner appears during simulation',
    'On success, navigates to /dashboard',
    'On error, shows retry-friendly error message',
    'Step navigation: can go back between steps',
    'Progress indicator shows current step',
  ],

  dashboard: [
    'Page loads with results from cache or API',
    'Impact Score circle/number renders',
    '8 metric cards render with values',
    'Temperature Change shows positive/negative color',
    'CO2 Level Change card renders',
    'Forest Cover card renders',
    'Air Quality card renders',
    'Biodiversity card renders',
    'Water Stress card renders',
    'Heatwave Frequency card renders',
    'Flood Risk card renders',
    'Recharts line chart renders for temperature',
    'Chart tooltip shows year + value on hover',
    'Recommendations section renders (if available)',
    'Recommendation cards show priority badge (high/medium/low)',
    'Export JSON button triggers download',
    'Export Report (HTML) button triggers download',
    'Retry button visible on error state',
    'Empty state shows "No results" message',
    'Back button returns to /scenario-builder',
  ],

  compare: [
    'Page loads with two scenario panels',
    'Each panel shows location + year selector',
    '"Compare" button triggers side-by-side results',
    'Results table renders for both scenarios',
    'Metric comparison shows which scenario is better',
    'Color coding: green = better, red = worse',
    'Export JSON button works',
    'Export Report button works',
    'Clear button resets comparison',
  ],

  history: [
    'Page loads and fetches history from API',
    'List of past simulations renders',
    'Each item shows: name, date, status badge',
    'Clicking an item navigates to /dashboard',
    'Empty state shows "No simulations yet" message',
    'Retry button visible on error state',
    'Date format is human-readable',
    'Loading spinner shows during fetch',
  ],

  recommendations: [
    'Page loads and fetches recommendations',
    'Summary text renders',
    'Findings list renders',
    'Action cards render with title + description',
    'Priority badge shows correct color',
    'Confidence score displays',
    'Empty state message renders when no data',
    'Retry button visible on error state',
  ],

  responsive: [
    'Mobile (< 640px): hamburger nav opens sidebar',
    'Mobile: sidebar closes on route change',
    'Mobile: cards stack vertically',
    'Mobile: charts resize appropriately',
    'Tablet (768px-1024px): 2-column layout',
    'Desktop (> 1024px): full layout',
  ],

  accessibility: [
    'All buttons have visible text or aria-label',
    'Form inputs have associated labels',
    'Color contrast passes WCAG AA for body text',
    'Keyboard navigation: Tab through interactive elements',
    'Focus visible on all interactive elements',
    'Screen reader: headings hierarchy is correct (h1 → h2 → h3)',
  ],

  export: [
    'JSON export: valid JSON structure',
    'JSON export: contains run_id, metrics, projections, recommendations',
    'HTML export: opens in browser with inline styles',
    'HTML export: "Print / Save as PDF" button present',
    'HTML export: no external CSS/JS dependencies',
    'Comparison JSON: contains both scenarios',
    'Comparison HTML: side-by-side table',
  ],

  apiIntegration: [
    'Frontend shows friendly message when backend is down',
    'Retry button re-fetches data',
    '422 validation errors show user-friendly message',
    '404 errors show "not found" message',
    'Timeout (> 30s) shows connection error',
    'Cached results display instantly on Dashboard',
    'ScenarioBuilder caches results before navigation',
  ],
};

/**
 * Summary helper
 */
export function getQASummary() {
  let total = 0;
  let sections = Object.keys(qaChecklist).length;
  for (const items of Object.values(qaChecklist)) {
    total += items.length;
  }
  return { sections, totalItems: total };
}
