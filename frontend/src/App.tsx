import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';

const ScenarioBuilder = lazy(() => import('./pages/ScenarioBuilder'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Compare = lazy(() => import('./pages/Compare'));
const History = lazy(() => import('./pages/History'));
const Recommendations = lazy(() => import('./pages/Recommendations'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ScenarioBuilderWrapper() {
  const { id } = useParams();
  return <ScenarioBuilder key={id || 'new'} />;
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-forest-300 mb-6">The page you're looking for doesn't exist.</p>
      <a
        href="/"
        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-xl font-semibold transition-colors text-white"
      >
        Go Home
      </a>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<Layout />}>
            <Route path="/scenario/new" element={<Suspense fallback={<LoadingSpinner />}><ScenarioBuilderWrapper /></Suspense>} />
            <Route path="/scenario/:id" element={<Suspense fallback={<LoadingSpinner />}><ScenarioBuilderWrapper /></Suspense>} />
            <Route path="/dashboard/:runId" element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
            <Route path="/compare" element={<Suspense fallback={<LoadingSpinner />}><Compare /></Suspense>} />
            <Route path="/history" element={<Suspense fallback={<LoadingSpinner />}><History /></Suspense>} />
            <Route path="/recommendations/:runId" element={<Suspense fallback={<LoadingSpinner />}><Recommendations /></Suspense>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
