import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import useSubscriptionStore from '../context/subscriptionStore';

const features = [
  'Enter monthly draws',
  'Up to 5 rolling golf scores',
  'Choose your charity',
  'Win cash prizes',
  'Full dashboard access',
  'Draw results & history',
];

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { startCheckout, isLoading } = useSubscriptionStore();
  const navigate = useNavigate();

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated()) {
      navigate('/register');
      return;
    }
    await startCheckout(plan);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 py-20 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="inline-block bg-gold-500 text-primary-900 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
          Simple Pricing
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Play. Win. Give Back.
        </h1>
        <p className="text-primary-200 text-lg max-w-xl mx-auto">
          One subscription enters you into monthly prize draws while supporting the charity of your choice.
        </p>
      </motion.div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-primary-400'}`}>
          Monthly
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
            isYearly ? 'bg-gold-500' : 'bg-primary-600'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
              isYearly ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-primary-400'}`}>
          Yearly
          <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
            Save 17%
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">

        {/* Monthly */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative rounded-2xl p-8 border transition-all ${
            !isYearly
              ? 'bg-white border-gold-400 shadow-2xl shadow-gold-500/20 scale-105'
              : 'bg-primary-800/50 border-primary-600'
          }`}
        >
          {!isYearly && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-primary-900 text-xs font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </span>
          )}
          <h3 className={`text-xl font-bold mb-1 ${!isYearly ? 'text-primary-900' : 'text-white'}`}>
            Monthly
          </h3>
          <div className="flex items-end gap-1 mb-6">
            <span className={`text-5xl font-display font-bold ${!isYearly ? 'text-primary-900' : 'text-white'}`}>
              £9.99
            </span>
            <span className={`mb-2 ${!isYearly ? 'text-primary-500' : 'text-primary-300'}`}>/mo</span>
          </div>
          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className={`text-sm ${!isYearly ? 'text-primary-700' : 'text-primary-300'}`}>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
              !isYearly
                ? 'bg-primary-700 text-white hover:bg-primary-800 active:scale-95'
                : 'bg-primary-700/50 text-primary-300 hover:bg-primary-700 hover:text-white'
            }`}
          >
            {isLoading ? 'Loading...' : 'Get Started'}
          </button>
        </motion.div>

        {/* Yearly */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`relative rounded-2xl p-8 border transition-all ${
            isYearly
              ? 'bg-white border-gold-400 shadow-2xl shadow-gold-500/20 scale-105'
              : 'bg-primary-800/50 border-primary-600'
          }`}
        >
          {isYearly && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-primary-900 text-xs font-bold px-4 py-1 rounded-full">
              BEST VALUE
            </span>
          )}
          <h3 className={`text-xl font-bold mb-1 ${isYearly ? 'text-primary-900' : 'text-white'}`}>
            Yearly
          </h3>
          <div className="flex items-end gap-1 mb-1">
            <span className={`text-5xl font-display font-bold ${isYearly ? 'text-primary-900' : 'text-white'}`}>
              £99.99
            </span>
            <span className={`mb-2 ${isYearly ? 'text-primary-500' : 'text-primary-300'}`}>/yr</span>
          </div>
          <p className={`text-sm mb-6 ${isYearly ? 'text-green-600' : 'text-green-400'} font-medium`}>
            £8.33/month — save £19.89 vs monthly
          </p>
          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className={`text-sm ${isYearly ? 'text-primary-700' : 'text-primary-300'}`}>{f}</span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="text-gold-500 font-bold">★</span>
              <span className={`text-sm font-medium ${isYearly ? 'text-primary-700' : 'text-primary-300'}`}>
                Priority draw entry
              </span>
            </li>
          </ul>
          <button
            onClick={() => handleSubscribe('yearly')}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
              isYearly
                ? 'bg-gold-500 text-primary-900 hover:bg-gold-400 active:scale-95'
                : 'bg-primary-700/50 text-primary-300 hover:bg-primary-700 hover:text-white'
            }`}
          >
            {isLoading ? 'Loading...' : 'Get Started'}
          </button>
        </motion.div>
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-primary-400 text-sm mt-10"
      >
        Cancel anytime. No hidden fees. Secure payments via Stripe.
      </motion.p>
    </div>
  );
};

export default PricingPage;
