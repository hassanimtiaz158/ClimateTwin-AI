import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ChartBarIcon, 
  MapIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Projections',
    description: 'Advanced machine learning models predict climate indicators for the next 5-10 years.',
  },
  {
    icon: ChartBarIcon,
    title: 'Interactive Dashboard',
    description: 'Visualize projections with beautiful charts and real-time data updates.',
  },
  {
    icon: MapIcon,
    title: 'Regional Analysis',
    description: 'Explore climate data on interactive maps with regional breakdowns.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <header className="p-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold">ClimateTwin AI</span>
          </div>
          <Link to="/scenario/new" className="btn-primary">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero Content */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6">
            Understand Tomorrow's Climate
            <br />
            <span className="text-gradient">Starting Today</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered climate scenario simulation helping governments, researchers, 
            and citizens make informed environmental decisions.
          </p>
          <Link 
            to="/scenario/new" 
            className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-3"
          >
            Start Simulation
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="card text-center">
              <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            {['Create Scenario', 'Select Actions', 'Run Simulation', 'View Results'].map(
              (step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="card min-w-[150px]">
                    <div className="text-primary-600 font-bold mb-1">Step {index + 1}</div>
                    <div className="font-medium">{step}</div>
                  </div>
                  {index < 3 && (
                    <ArrowRightIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
