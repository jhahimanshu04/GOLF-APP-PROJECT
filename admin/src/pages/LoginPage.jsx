import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../context/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-800 border border-primary-700 text-3xl mb-4">
            🛡️
          </div>
          <h1 className="text-white text-2xl font-display font-bold">Admin Portal</h1>
          <p className="text-primary-500 text-sm mt-1">GolfDraw Administration</p>
        </div>

        {/* Card */}
        <div className="bg-primary-800/60 border border-primary-700 rounded-2xl p-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-primary-400 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="admin@golfdraw.com"
                className="w-full bg-primary-900 border border-primary-600 text-white placeholder-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-primary-400 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-primary-900 border border-primary-600 text-white placeholder-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gold-500 text-primary-900 font-bold text-sm hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In to Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-primary-600 text-xs mt-6">
          Admin access only · Unauthorized access is prohibited
        </p>
      </motion.div>
    </div>
  );
}
