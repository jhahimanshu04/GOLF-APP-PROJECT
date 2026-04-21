import { motion } from 'framer-motion';
import useSubscriptionStore from '../../context/subscriptionStore';
import useAuthStore from '../../context/authStore';

const statusColors = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  past_due: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  trialing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const SubscriptionBadge = () => {
  const { user } = useAuthStore();
  const { openPortal, cancelSubscription, resumeSubscription, isLoading } = useSubscriptionStore();
  const sub = user?.subscription;

  if (!sub) return null;

  const statusColor = statusColors[sub.status] || statusColors.inactive;
  const periodEnd = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-800/50 border border-primary-700 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Subscription</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${statusColor}`}>
          {sub.status}
        </span>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-primary-400">Plan</span>
          <span className="text-white capitalize font-medium">{sub.plan || '—'}</span>
        </div>
        {periodEnd && (
          <div className="flex justify-between text-sm">
            <span className="text-primary-400">
              {sub.cancelAtPeriodEnd ? 'Access until' : 'Renews on'}
            </span>
            <span className="text-white font-medium">{periodEnd}</span>
          </div>
        )}
        {sub.cancelAtPeriodEnd && (
          <p className="text-orange-400 text-xs mt-2">
            ⚠️ Your subscription is set to cancel at the end of this period.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={openPortal}
          disabled={isLoading}
          className="w-full py-2 rounded-xl bg-primary-700 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          Manage Billing
        </button>

        {sub.status === 'active' && !sub.cancelAtPeriodEnd && (
          <button
            onClick={cancelSubscription}
            disabled={isLoading}
            className="w-full py-2 rounded-xl bg-transparent border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            Cancel Subscription
          </button>
        )}

        {sub.cancelAtPeriodEnd && (
          <button
            onClick={resumeSubscription}
            disabled={isLoading}
            className="w-full py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors"
          >
            Resume Subscription
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default SubscriptionBadge;
