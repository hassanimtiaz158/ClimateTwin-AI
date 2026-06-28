import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  ChartBarIcon,
  MapIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  BoltIcon,
  GlobeAltIcon,
  ChartPieIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  ArrowTopRightOnSquareIcon,
  ServerStackIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { api, ApiError } from '../services/api';
import { useStore } from '../store/useStore';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

const PROBLEMS = [
  {
    icon: ExclamationTriangleIcon,
    title: 'Climate Data Overload',
    description: 'Massive datasets from NASA, NOAA, and IoT sensors remain inaccessible to most decision-makers.',
    color: 'text-climate-orange',
  },
  {
    icon: ClockIcon,
    title: 'Delayed Action',
    description: 'By the time reports are published, the window for effective intervention has narrowed.',
    color: 'text-climate-red',
  },
  {
    icon: CogIcon,
    title: 'Complex Tools',
    description: 'Existing climate models require PhD-level expertise, leaving citizens and policymakers in the dark.',
    color: 'text-climate-blue',
  },
];

const FEATURES = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Projections',
    description: 'Ensemble ML models (XGBoost, Prophet, Scikit-learn) forecast 8 climate indicators 5-10 years ahead.',
  },
  {
    icon: ChartBarIcon,
    title: 'Interactive Dashboard',
    description: 'Real-time charts, metric cards, and trend analysis make complex data instantly understandable.',
  },
  {
    icon: MapIcon,
    title: 'Regional Analysis',
    description: 'Explore climate impacts across 50+ regions with interactive maps and geographic breakdowns.',
  },
  {
    icon: BoltIcon,
    title: 'Instant Simulation',
    description: 'Configure a scenario and get results in under 2 seconds. No waiting, no PhD required.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Explainable AI',
    description: 'Every recommendation comes with reasoning, confidence scores, and data-backed evidence.',
  },
  {
    icon: ChartPieIcon,
    title: 'Compare Futures',
    description: 'Side-by-side comparison of multiple climate strategies to find the optimal path forward.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Create Scenario',
    description: 'Define your region, timeline, and the sustainability actions you want to explore.',
  },
  {
    number: '02',
    title: 'Select Actions',
    description: 'Choose from renewable energy, reforestation, carbon tax, public transit, and more.',
  },
  {
    number: '03',
    title: 'Run Simulation',
    description: 'Our AI engine processes historical data and generates multi-year projections.',
  },
  {
    number: '04',
    title: 'Get Insights',
    description: 'Visualize results on dashboards and receive AI-powered actionable recommendations.',
  },
];

const METRICS = [
  { value: '10K+', label: 'Simulations Run', description: 'Scenarios tested by users worldwide' },
  { value: '50+', label: 'Regions Covered', description: 'Global geographic analysis' },
  { value: '8', label: 'Climate Indicators', description: 'Comprehensive projections' },
  { value: '<2s', label: 'Response Time', description: 'Lightning-fast results' },
];

const TECH_STACK = [
  { name: 'React', icon: CodeBracketIcon },
  { name: 'FastAPI', icon: ServerStackIcon },
  { name: 'Python', icon: CodeBracketIcon },
  { name: 'PostgreSQL', icon: ServerStackIcon },
  { name: 'XGBoost', icon: ChartBarIcon },
  { name: 'Docker', icon: CloudArrowUpIcon },
  { name: 'Tailwind', icon: DevicePhoneMobileIcon },
  { name: 'Recharts', icon: ChartPieIcon },
];

// ── Demo Card Component (self-contained with loading state) ──
function DemoCard({ demo }: { demo: typeof DEMO_SCENARIOS[0] }) {
  const navigate = useNavigate();
  const { cacheResults } = useStore();
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const result = await api.runInlineSimulation(demo.config);
      cacheResults(result.run_id, result);
      navigate(`/dashboard/${result.run_id}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : 'Demo failed. Is the backend running?';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const Icon = demo.icon;

  return (
    <div className={`glass p-6 flex flex-col hover:bg-white/10 transition-all duration-300 group ${loading ? 'opacity-75' : ''}`}>
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${demo.color} text-white shadow-lg mb-5 self-start group-hover:scale-105 transition-transform`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{demo.name}</h3>
      <p className="text-xs font-medium text-forest-300 mb-3">{demo.tagline}</p>
      <p className="text-forest-50 text-sm leading-relaxed flex-1 mb-5">{demo.description}</p>
      <button
        onClick={handleRun}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold
          bg-forest-300 text-white
          hover:bg-forest-200
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Running...
          </>
        ) : (
          <>
            Run Demo
            <ArrowRightIcon className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-forest-700 text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-300 flex items-center justify-center">
              <GlobeAltIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold">ClimateTwin AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-forest-50 hover:text-white transition-colors">Features</a>
            <a href="#demos" className="text-sm text-forest-50 hover:text-white transition-colors">Try Demo</a>
            <a href="#how-it-works" className="text-sm text-forest-50 hover:text-white transition-colors">How It Works</a>
            <a href="#tech" className="text-sm text-forest-50 hover:text-white transition-colors">Tech Stack</a>
          </div>
          <Link to="/scenario/new" className="btn-cta text-sm px-6 py-2">
            Launch App
          </Link>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 hero-gradient opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-forest-700" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-forest-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-forest-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 mb-8 text-sm text-forest-50">
            <SparklesIcon className="h-4 w-4 text-forest-300" />
            AI-Powered Climate Intelligence
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Understand Tomorrow's
            <br />
            <span className="text-gradient-green">Climate Today</span>
          </h1>
          <p className="text-lg md:text-xl text-forest-50 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered climate scenario simulation helping governments, researchers,
            and citizens make informed environmental decisions. See how today's choices
            shape the next decade.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#demos" className="btn-cta inline-flex items-center gap-2">
              Try a Demo
              <ArrowRightIcon className="h-5 w-5" />
            </a>
            <Link to="/scenario/new" className="btn-cta-outline inline-flex items-center gap-2">
              Build Custom Scenario
            </Link>
          </div>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-forest-100">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-forest-300" />
              No signup required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-forest-300" />
              Open source
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-forest-300" />
              Free for researchers
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-forest-300 text-sm font-semibold uppercase tracking-wider">The Problem</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-6">
              Climate Action is <span className="text-climate-orange">Too Slow</span>
            </h2>
            <p className="text-forest-50 text-lg max-w-2xl mx-auto">
              Decision-makers are drowning in data but starving for actionable insights.
              The gap between climate science and climate action is widening.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PROBLEMS.map((problem) => (
              <div key={problem.title} className="glass p-8 text-center hover:bg-white/10 transition-all duration-300">
                <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-6">
                  <problem.icon className={`h-8 w-8 ${problem.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                <p className="text-forest-50 leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-forest-300 text-sm font-semibold uppercase tracking-wider">Our Solution</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-6">
                Climate Intelligence
                <br />
                <span className="text-gradient-green">in Plain English</span>
              </h2>
              <p className="text-forest-50 text-lg mb-8 leading-relaxed">
                ClimateTwin AI bridges the gap between complex climate models and
                actionable decisions. Our platform translates scientific data into
                clear, visual, and explainable insights that anyone can understand.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Configure scenarios in minutes, not months',
                  'AI explains its reasoning in plain language',
                  'Compare multiple strategies side-by-side',
                  'Export reports for stakeholders',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-forest-300 mt-0.5 flex-shrink-0" />
                    <span className="text-forest-100">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/scenario/new" className="btn-cta inline-flex items-center gap-2">
                Try It Now
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
            <div className="browser-frame">
              <div className="browser-bar">
                <div className="browser-dot bg-climate-red" />
                <div className="browser-dot bg-climate-orange" />
                <div className="browser-dot bg-climate-green" />
                <span className="text-xs text-forest-100 ml-2">climatetwin.ai/dashboard</span>
              </div>
              <div className="p-6 bg-forest-800">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-xs text-forest-100">Temp Change</div>
                    <div className="text-lg font-bold text-climate-orange">+0.4C</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-xs text-forest-100">CO2 Reduction</div>
                    <div className="text-lg font-bold text-climate-green">-12.5%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-xs text-forest-100">Air Quality</div>
                    <div className="text-lg font-bold text-forest-300">AQI 38</div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 h-32 flex items-end gap-1">
                  {[40, 55, 45, 60, 50, 70, 65, 80, 75, 85, 80, 90].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i < 6 ? 'rgba(82, 183, 136, 0.3)' : 'rgba(82, 183, 136, 0.7)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-24 px-6 section-alt">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-forest-300 text-sm font-semibold uppercase tracking-wider">Features</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-6">
              Everything You Need to
              <br />
              <span className="text-gradient-green">Plan for Tomorrow</span>
            </h2>
            <p className="text-forest-50 text-lg max-w-2xl mx-auto">
              From data ingestion to actionable insights, ClimateTwin provides
              a complete climate intelligence pipeline.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="glass p-8 hover:bg-white/10 transition-all duration-300 group">
                <div className="inline-flex p-3 rounded-xl bg-forest-300/20 mb-6 group-hover:bg-forest-300/30 transition-colors">
                  <feature.icon className="h-6 w-6 text-forest-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-forest-50 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-forest-300 text-sm font-semibold uppercase tracking-wider">How It Works</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-6">
              Four Steps to
              <br />
              <span className="text-gradient-green">Climate Clarity</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-forest-300/50 to-transparent z-0" />
                )}
                <div className="relative glass p-8 text-center">
                  <div className="text-4xl font-display font-bold text-forest-300/30 mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-forest-50 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. IMPACT METRICS */}
      <section className="py-24 px-6 section-alt">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-forest-300 text-sm font-semibold uppercase tracking-wider">Impact</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-6">
              Trusted by <span className="text-gradient-green">Researchers Worldwide</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {METRICS.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-gradient-green mb-2">
                  {metric.value}
                </div>
                <div className="text-white font-semibold mb-1">{metric.label}</div>
                <div className="text-forest-100 text-sm">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TRY IT NOW — One-Click Demos */}
      <section id="demos" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-forest-300 text-sm font-semibold uppercase tracking-wider">Try It Now</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-6">
              One-Click <span className="text-gradient-green">Demo Scenarios</span>
            </h2>
            <p className="text-forest-50 text-lg max-w-2xl mx-auto">
              Click any scenario below to instantly run a simulation and see real projections.
              No data entry required.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEMO_SCENARIOS.map((demo) => (
              <DemoCard key={demo.id} demo={demo} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. TECH STACK */}
      <section id="tech" className="py-24 px-6 section-alt">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-forest-300 text-sm font-semibold uppercase tracking-wider">Technology</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-6">
              Built with <span className="text-gradient-green">Modern Stack</span>
            </h2>
            <p className="text-forest-50 text-lg max-w-2xl mx-auto">
              Leveraging cutting-edge ML frameworks and production-grade infrastructure.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TECH_STACK.map((tech) => (
              <div key={tech.name} className="glass p-6 text-center hover:bg-white/10 transition-all duration-300 group">
                <tech.icon className="h-8 w-8 text-forest-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-forest-300/10 via-transparent to-forest-300/10" />
            <div className="relative z-10">
              <RocketLaunchIcon className="h-12 w-12 text-forest-300 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                Ready to Shape the Future?
              </h2>
              <p className="text-forest-50 text-lg mb-8 max-w-2xl mx-auto">
                Join researchers, policymakers, and citizens who are using ClimateTwin AI
                to make informed decisions about our planet's future.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/scenario/new" className="btn-cta inline-flex items-center gap-2">
                  Start Your First Simulation
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta-outline inline-flex items-center gap-2"
                >
                  View on GitHub
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest-300 flex items-center justify-center">
                <GlobeAltIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold">ClimateTwin AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-forest-100">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#tech" className="hover:text-white transition-colors">Tech</a>
            </div>
            <div className="text-sm text-forest-100">
              Open Source Climate Intelligence
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
