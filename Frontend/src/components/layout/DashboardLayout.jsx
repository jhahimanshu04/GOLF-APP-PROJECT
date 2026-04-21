import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../context/authStore';

const navItems = [
  { to: '/dashboard',           icon: '🏠', label: 'Home',      exact: true },
  { to: '/dashboard/scores',    icon: '⛳', label: 'Scores' },
  { to: '/dashboard/draws',     icon: '🎰', label: 'Draws' },
  { to: '/dashboard/charities', icon: '💛', label: 'Charities' },
  { to: '/dashboard/settings',  icon: '⚙️', label: 'Settings' },
];

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavItems = ({ onClick }) => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map(({ to, icon, label, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          onClick={onClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'bg-primary-700 text-white' : 'text-primary-400 hover:bg-primary-800 hover:text-white'
            }`
          }
        >
          <span className="text-base">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-primary-900 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-primary-900 border-r border-primary-800 fixed h-full z-20">
        <div className="px-6 py-5 border-b border-primary-800">
          <span className="text-white font-display font-bold text-lg">GolfDraw 🏌️</span>
        </div>
        <NavItems />
        <div className="px-3 py-4 border-t border-primary-800 space-y-1">
          {user?.role === 'admin' && (
            <a href={import.meta.env.VITE_ADMIN_URL || '#'}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gold-400 hover:bg-primary-800 transition-all">
              <span>🛡️</span><span>Admin Panel</span>
            </a>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-500 hover:bg-primary-800 hover:text-white transition-all">
            <span>→</span><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-30" />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed left-0 top-0 h-full w-64 bg-primary-900 border-r border-primary-800 z-40 flex flex-col"
            >
              <div className="px-6 py-5 border-b border-primary-800 flex items-center justify-between">
                <span className="text-white font-display font-bold text-lg">GolfDraw 🏌️</span>
                <button onClick={() => setMobileOpen(false)} className="text-primary-400 hover:text-white text-xl">✕</button>
              </div>
              <NavItems onClick={() => setMobileOpen(false)} />
              <div className="px-3 py-4 border-t border-primary-800 space-y-1">
                {user?.role === 'admin' && (
                  <a href={import.meta.env.VITE_ADMIN_URL || '#'}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gold-400 hover:bg-primary-800 transition-all">
                    <span>🛡️</span><span>Admin Panel</span>
                  </a>
                )}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-500 hover:bg-primary-800 hover:text-white transition-all">
                  <span>→</span><span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-primary-900 border-b border-primary-800 flex items-center px-4 z-20 gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-primary-400 hover:text-white p-1">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <span className="text-white font-display font-bold">GolfDraw 🏌️</span>
      </div>

      {/* Main */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
