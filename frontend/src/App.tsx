import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import ScenarioBuilder from './pages/ScenarioBuilder';
import Dashboard from './pages/Dashboard';
import Compare from './pages/Compare';
import History from './pages/History';
import Recommendations from './pages/Recommendations';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/scenario/new" element={<ScenarioBuilder />} />
          <Route path="/scenario/:id" element={<ScenarioBuilder />} />
          <Route path="/dashboard/:runId" element={<Dashboard />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/history" element={<History />} />
          <Route path="/recommendations/:runId" element={<Recommendations />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
