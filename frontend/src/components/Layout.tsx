import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  PlusCircleIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  GlobeAltIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'History',    href: '/history',      icon: ClockIcon },
  { name: 'New Scenario', href: '/scenario/new', icon: PlusCircleIcon },
  { name: 'Compare',    href: '/compare',       icon: ArrowsRightLeftIcon },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  const NavLink = ({ item }: { item: typeof navigation[0] }) => (
    <Link
      to={item.href}
      onClick={() => setMobileOpen(false)}
      className={`sidebar-link ${isActive(item.href) ? 'sidebar-link-active' : ''}`}
    >
      <item.icon className="h-5 w-5" />
      {item.name}
    </Link>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-100 shadow-sidebar z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
            <GlobeAltIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-display font-bold text-gray-900">ClimateTwin</span>
            <span className="block text-[10px] text-gray-400 font-medium -mt-0.5 tracking-wide uppercase">AI Platform</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100">
          <Link
            to="/"
            className="sidebar-link text-gray-400 hover:text-gray-600"
          >
            <HomeIcon className="h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* ── Mobile Header ────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <GlobeAltIcon className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-base font-display font-bold text-gray-900">ClimateTwin</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <Bars3Icon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Sidebar Overlay ──────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl animate-slide-in-left">
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <GlobeAltIcon className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="text-base font-display font-bold text-gray-900">ClimateTwin</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-gray-100">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="sidebar-link text-gray-400 hover:text-gray-600"
              >
                <HomeIcon className="h-5 w-5" />
                Back to Home
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-16 lg:pt-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
