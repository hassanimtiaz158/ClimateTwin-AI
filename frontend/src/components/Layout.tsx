import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  PlusCircleIcon, 
  ChartBarIcon, 
  ArrowsRightLeftIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/history', icon: HomeIcon },
  { name: 'New Scenario', href: '/scenario/new', icon: PlusCircleIcon },
  { name: 'Compare', href: '/compare', icon: ArrowsRightLeftIcon },
  { name: 'History', href: '/history', icon: ClockIcon },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <ChartBarIcon className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-gradient">ClimateTwin</span>
        </Link>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
