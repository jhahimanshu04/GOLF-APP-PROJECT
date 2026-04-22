// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import useAuthStore from '../context/authStore';

// export const LoginPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const { login, isLoading } = useAuthStore();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const result = await login(email, password);
//     if (result.success) navigate('/dashboard');
//     else toast.error(result.message);
//   };

//   return (
//     <div className="min-h-screen bg-primary-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-sm">
//         <div className="text-center mb-8">
//           <h1 className="text-white text-3xl font-display font-bold">GolfDraw 🏌️</h1>
//           <p className="text-primary-400 text-sm mt-2">Sign in to your account</p>
//         </div>
//         <form onSubmit={handleSubmit} className="bg-primary-800 border border-primary-700 rounded-2xl p-6 space-y-4">
//           <div>
//             <label className="text-primary-300 text-xs font-medium block mb-1">Email</label>
//             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
//               className="w-full bg-primary-700 border border-primary-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
//           </div>
//           <div>
//             <label className="text-primary-300 text-xs font-medium block mb-1">Password</label>
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
//               className="w-full bg-primary-700 border border-primary-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
//           </div>
//           <button type="submit" disabled={isLoading}
//             className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 transition-colors disabled:opacity-50">
//             {isLoading ? 'Signing in...' : 'Sign In'}
//           </button>
//           <div className="text-center space-y-2">
//             <Link to="/pricing" className="block text-primary-400 text-xs hover:text-white transition-colors">
//               Don't have an account? Subscribe →
//             </Link>
//             <Link to="/register" className="block text-primary-400 text-xs hover:text-white transition-colors">
//               Already subscribed? Register →
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export const RegisterPage = () => {
//   const [form, setForm] = useState({ name: '', email: '', password: '' });
//   const { register, isLoading } = useAuthStore();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
//     const result = await register(form.name, form.email, form.password);
//     if (result.success) { toast.success('Account created!'); navigate('/pricing'); }
//     else toast.error(result.message);
//   };

//   return (
//     <div className="min-h-screen bg-primary-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-sm">
//         <div className="text-center mb-8">
//           <h1 className="text-white text-3xl font-display font-bold">GolfDraw 🏌️</h1>
//           <p className="text-primary-400 text-sm mt-2">Create your account</p>
//         </div>
//         <form onSubmit={handleSubmit} className="bg-primary-800 border border-primary-700 rounded-2xl p-6 space-y-4">
//           {[
//             { key: 'name', label: 'Full Name', type: 'text' },
//             { key: 'email', label: 'Email', type: 'email' },
//             { key: 'password', label: 'Password (min 8 chars)', type: 'password' },
//           ].map(({ key, label, type }) => (
//             <div key={key}>
//               <label className="text-primary-300 text-xs font-medium block mb-1">{label}</label>
//               <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required
//                 className="w-full bg-primary-700 border border-primary-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
//             </div>
//           ))}
//           <button type="submit" disabled={isLoading}
//             className="w-full py-3 bg-gold-500 text-primary-900 font-bold rounded-xl hover:bg-gold-400 transition-colors disabled:opacity-50">
//             {isLoading ? 'Creating...' : 'Create Account'}
//           </button>
//           <Link to="/login" className="block text-center text-primary-400 text-xs hover:text-white transition-colors">
//             Already have an account? Sign in →
//           </Link>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';

// ✅ ICONS
import { FaGolfBall, FaUser, FaLock } from "react-icons/fa";
import { FiMail } from "react-icons/fi";

// ─── LOGIN PAGE ─────────────────────────────────────────
export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) navigate('/dashboard');
    else toast.error(result.message);
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <FaGolfBall className="text-3xl text-gold-400" />
          </div>
          <h1 className="text-white text-3xl font-display font-bold">GolfDraw</h1>
          <p className="text-primary-400 text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-primary-800 border border-primary-700 rounded-2xl p-6 space-y-4">

          {/* Email */}
          <div>
            <label className="text-primary-300 text-xs font-medium block mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 bg-primary-700 border border-primary-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-primary-300 text-xs font-medium block mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 bg-primary-700 border border-primary-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Links */}
          <div className="text-center space-y-2">
            <Link to="/pricing" className="block text-primary-400 text-xs hover:text-white transition-colors">
              Don't have an account? Subscribe →
            </Link>
            <Link to="/register" className="block text-primary-400 text-xs hover:text-white transition-colors">
              Already subscribed? Register →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── REGISTER PAGE ──────────────────────────────────────
export const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    const result = await register(form.name, form.email, form.password);

    if (result.success) {
      toast.success('Account created!');
      navigate('/pricing');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <FaGolfBall className="text-3xl text-gold-400" />
          </div>
          <h1 className="text-white text-3xl font-display font-bold">GolfDraw</h1>
          <p className="text-primary-400 text-sm mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-primary-800 border border-primary-700 rounded-2xl p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="text-primary-300 text-xs font-medium block mb-1">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full pl-9 bg-primary-700 border border-primary-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-primary-300 text-xs font-medium block mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full pl-9 bg-primary-700 border border-primary-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-primary-300 text-xs font-medium block mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full pl-9 bg-primary-700 border border-primary-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gold-500 text-primary-900 font-bold rounded-xl hover:bg-gold-400 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>

          {/* Link */}
          <Link to="/login" className="block text-center text-primary-400 text-xs hover:text-white transition-colors">
            Already have an account? Sign in →
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;