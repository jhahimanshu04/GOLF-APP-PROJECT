import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../context/authStore';
import useScoreStore from '../context/scoreStore';
import useDrawStore from '../context/drawStore';
import useCharityStore from '../context/charityStore';
import useSubscriptionStore from '../context/subscriptionStore';
import SubscriptionBadge from '../components/ui/SubscriptionBadge';

const StatCard = ({ label, value, sub, icon, color = 'text-white', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-primary-800/60 border border-primary-700 rounded-2xl p-5"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
    </div>
    <div className={`text-2xl font-display font-bold ${color}`}>{value}</div>
    <div className="text-white text-sm font-medium mt-0.5">{label}</div>
    {sub && <div className="text-primary-500 text-xs mt-0.5">{sub}</div>}
  </motion.div>
);

const QuickLinkCard = ({ to, icon, label, description, badge, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
  >
    <Link
      to={to}
      className="flex items-center gap-4 bg-primary-800/60 border border-primary-700 rounded-2xl p-4 hover:border-primary-500 hover:bg-primary-800 transition-all group"
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-sm">{label}</p>
          {badge && (
            <span className="bg-gold-500/20 text-gold-400 border border-gold-500/30 text-xs px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-primary-500 text-xs mt-0.5 truncate">{description}</p>
      </div>
      <span className="text-primary-600 group-hover:text-primary-300 transition-colors">→</span>
    </Link>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const { scores, stats, fetchScores, fetchStats } = useScoreStore();
  const { upcomingDraw, myHistory, fetchUpcoming, fetchMyHistory } = useDrawStore();
  const { myCharity, myContributionPercent, fetchMyCharity } = useCharityStore();
  const { fetchSubscription } = useSubscriptionStore();

  useEffect(() => {
    fetchScores();
    fetchStats();
    fetchUpcoming();
    fetchMyHistory();
    fetchMyCharity();
    fetchSubscription();
  }, []);

  const isSubscribed = user?.subscription?.status === 'active';
  const pendingWinnings = myHistory.filter((w) => w.status === 'pending' && !w.proofUrl);
  const totalWon = myHistory
    .filter((w) => w.status === 'paid')
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-primary-400 text-sm">{greeting} 👋</p>
        <h1 className="text-white text-3xl font-display font-bold mt-1">
          {user?.name?.split(' ')[0]}
        </h1>
        {!isSubscribed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-4 bg-gold-500/10 border border-gold-500/30 rounded-xl flex items-center justify-between gap-4"
          >
            <p className="text-gold-300 text-sm">
              ⚡ Subscribe to enter monthly draws and support a charity.
            </p>
            <Link
              to="/pricing"
              className="shrink-0 px-4 py-2 bg-gold-500 text-primary-900 text-sm font-bold rounded-xl hover:bg-gold-400 transition-colors"
            >
              Subscribe
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          icon="⛳"
          label="Scores Entered"
          value={`${scores.length}/5`}
          sub={stats?.average ? `Avg: ${stats.average} pts` : 'No scores yet'}
          delay={0.05}
        />
        <StatCard
          icon="🎰"
          label="Draws Entered"
          value={myHistory.length || 0}
          sub="all time"
          delay={0.1}
        />
        <StatCard
          icon="🏆"
          label="Total Won"
          value={`£${totalWon.toFixed(2)}`}
          color="text-gold-400"
          sub="lifetime winnings"
          delay={0.15}
        />
        <StatCard
          icon="💛"
          label="Supporting"
          value={myCharity ? '1 charity' : 'None yet'}
          sub={myCharity ? `${myContributionPercent}% contribution` : 'Choose a charity'}
          delay={0.2}
        />
      </div>

      {/* Main content */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Left column - quick links */}
        <div className="md:col-span-2 space-y-3">
          <p className="text-primary-400 text-xs font-medium uppercase tracking-widest mb-2">Quick Access</p>

          <QuickLinkCard
            to="/dashboard/scores"
            icon="⛳"
            label="My Scores"
            description={scores.length > 0 ? `${scores.length} scores entered — latest: ${scores[0]?.value} pts` : 'No scores yet — add your first score'}
            badge={scores.length === 0 ? 'Action needed' : null}
            delay={0.1}
          />
          <QuickLinkCard
            to="/dashboard/draws"
            icon="🎰"
            label="Draws & Winnings"
            description={upcomingDraw ? `Next draw: ${upcomingDraw.title}` : 'View draw results and history'}
            badge={pendingWinnings.length > 0 ? `${pendingWinnings.length} to claim` : null}
            delay={0.15}
          />
          <QuickLinkCard
            to="/dashboard/charities"
            icon="💛"
            label="Charities"
            description={myCharity ? `Supporting: ${myCharity.name}` : 'Choose a charity to support'}
            badge={!myCharity ? 'Choose one' : null}
            delay={0.2}
          />
          <QuickLinkCard
            to="/dashboard/settings"
            icon="⚙️"
            label="Account & Billing"
            description="Manage your subscription, password, and profile"
            delay={0.25}
          />

          {/* Upcoming draw highlight */}
          {upcomingDraw && isSubscribed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-800 border border-primary-600 rounded-2xl p-5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Next Draw</span>
                </div>
                <p className="text-white font-bold">{upcomingDraw.title}</p>
                <p className="text-primary-400 text-xs mt-1">
                  {scores.length > 0
                    ? `You have ${scores.length} score(s) entered ✓`
                    : '⚠️ Add scores to be entered into this draw'}
                </p>
                <div className="flex gap-2 mt-3">
                  {[
                    { label: '5 Match', pct: '40%' },
                    { label: '4 Match', pct: '35%' },
                    { label: '3 Match', pct: '25%' },
                  ].map(({ label, pct }) => (
                    <div key={label} className="bg-primary-900/50 rounded-lg px-3 py-1.5 text-center">
                      <p className="text-gold-400 text-xs font-bold">{pct}</p>
                      <p className="text-primary-500 text-xs">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SubscriptionBadge />

          {/* My charity mini card */}
          {myCharity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-primary-800/60 border border-primary-700 rounded-2xl p-5"
            >
              <p className="text-primary-400 text-xs font-medium mb-3">My Charity</p>
              <div className="flex items-center gap-3">
                {myCharity.logo && (
                  <img src={myCharity.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
                )}
                <div>
                  <p className="text-white text-sm font-medium">{myCharity.name}</p>
                  <p className="text-gold-400 text-xs">{myContributionPercent}% contribution</p>
                </div>
              </div>
              <Link
                to="/dashboard/charities"
                className="block mt-3 text-center text-primary-400 text-xs hover:text-white transition-colors"
              >
                Change charity →
              </Link>
            </motion.div>
          )}

          {/* Score summary */}
          {stats && stats.count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-primary-800/60 border border-primary-700 rounded-2xl p-5"
            >
              <p className="text-primary-400 text-xs font-medium mb-3">Score Stats</p>
              <div className="space-y-2">
                {[
                  { label: 'Average', value: `${stats.average} pts` },
                  { label: 'Best', value: `${stats.highest} pts`, color: 'text-green-400' },
                  { label: 'Latest', value: `${stats.latest} pts` },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-primary-500">{label}</span>
                    <span className={`font-medium ${color || 'text-white'}`}>{value}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard/scores"
                className="block mt-3 text-center text-primary-400 text-xs hover:text-white transition-colors"
              >
                Manage scores →
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
