import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const StatCard = ({ label, value, sub, icon, color = 'text-white', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-primary-800/60 border border-primary-700 rounded-2xl p-5"
  >
    <div className="text-2xl mb-2">{icon}</div>
    <div className={`text-2xl font-display font-bold ${color}`}>{value}</div>
    <div className="text-white text-sm font-medium mt-0.5">{label}</div>
    {sub && <div className="text-primary-500 text-xs mt-0.5">{sub}</div>}
  </motion.div>
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/admin/analytics');
        setAnalytics(data.analytics);
      } catch (err) {
        console.error('Analytics fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary-400">Loading analytics...</div>
      </div>
    );
  }

  const a = analytics;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-white text-3xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-primary-400 text-sm mt-1">Platform overview and management</p>
      </motion.div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon="👥" label="Total Users" value={a?.users.total || 0} sub={`+${a?.users.recentSignups || 0} this week`} delay={0.05} />
        <StatCard icon="✅" label="Active Subs" value={a?.users.active || 0} color="text-green-400" sub="paying subscribers" delay={0.1} />
        <StatCard icon="💰" label="Monthly Revenue" value={`£${a?.revenue.monthlyEstimate || '0.00'}`} color="text-gold-400" sub="estimated" delay={0.15} />
        <StatCard icon="🎰" label="Prize Pool" value={`£${a?.revenue.currentPool || '0.00'}`} sub={`Jackpot: £${a?.revenue.jackpot || '0.00'}`} delay={0.2} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon="⚠️" label="Past Due" value={a?.users.pastDue || 0} color="text-orange-400" sub="payment failed" delay={0.25} />
        <StatCard icon="❌" label="Cancelled" value={a?.users.cancelled || 0} color="text-red-400" sub="churned users" delay={0.3} />
        <StatCard icon="🏆" label="Total Winners" value={a?.draws.totalWinners || 0} sub={`${a?.draws.completed || 0} draws run`} delay={0.35} />
        <StatCard icon="💛" label="Charities" value={a?.charities.total || 0} sub={`£${a?.revenue.totalDistributed || '0.00'} distributed`} delay={0.4} />
      </div>

      {/* Monthly signups chart (simple bar) */}
      {a?.users.monthlySignups?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-primary-800/60 border border-primary-700 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-white font-bold mb-4">Monthly Signups</h3>
          <div className="flex items-end gap-2 h-24">
            {a.users.monthlySignups.map((m, i) => {
              const max = Math.max(...a.users.monthlySignups.map((x) => x.count));
              const height = max > 0 ? (m.count / max) * 100 : 0;
              const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-primary-400 text-xs">{m.count}</span>
                  <div
                    className="w-full bg-primary-600 rounded-t-md transition-all hover:bg-gold-500/60"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${months[m._id.month - 1]} ${m._id.year}: ${m.count}`}
                  />
                  <span className="text-primary-600 text-xs">{months[m._id.month - 1]}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick admin links */}
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { to: '/admin/users', icon: '👥', label: 'User Management', desc: 'View, edit, manage all users' },
          { to: '/admin/draws', icon: '🎰', label: 'Draw Management', desc: 'Run, simulate, publish draws' },
          { to: '/admin/charities', icon: '💛', label: 'Charity Management', desc: 'Add, edit, manage charities' },
        ].map(({ to, icon, label, desc }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
          >
            <Link
              to={to}
              className="flex items-center gap-4 bg-primary-800/60 border border-primary-700 rounded-2xl p-4 hover:border-primary-500 transition-all group"
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-white font-medium text-sm">{label}</p>
                <p className="text-primary-500 text-xs">{desc}</p>
              </div>
              <span className="ml-auto text-primary-600 group-hover:text-primary-300 transition-colors">→</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
