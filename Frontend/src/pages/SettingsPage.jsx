import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import useSubscriptionStore from '../context/subscriptionStore';
import api from '../utils/api';

const Section = ({ title, children }) => (
  <div className="bg-primary-800/60 border border-primary-700 rounded-2xl p-6 mb-4">
    <h3 className="text-white font-bold mb-4">{title}</h3>
    {children}
  </div>
);

const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuthStore();
  const { openPortal, cancelSubscription, resumeSubscription, isLoading: subLoading } = useSubscriptionStore();

  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileUpdate = async () => {
    if (!name.trim()) { toast.error('Name is required.'); return; }
    setProfileLoading(true);
    const result = await updateProfile({ name });
    setProfileLoading(false);
    result.success ? toast.success('Profile updated!') : toast.error(result.message);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) { toast.error('Fill in all password fields.'); return; }
    if (newPassword.length < 8) { toast.error('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return; }

    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    }
    setPwLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure? You will keep access until the end of your billing period.')) return;
    const result = await cancelSubscription();
    result.success ? toast.success('Subscription will cancel at period end.') : toast.error(result.message);
  };

  const handleResume = async () => {
    const result = await resumeSubscription();
    result.success ? toast.success('Subscription resumed!') : toast.error(result.message);
  };

  const sub = user?.subscription;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold font-display">Account Settings</h1>
        <p className="text-primary-400 text-sm mt-1">Manage your profile, password, and billing.</p>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <div className="space-y-4">
          <div>
            <label className="text-primary-300 text-xs font-medium block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-primary-700 border border-primary-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>
          <div>
            <label className="text-primary-300 text-xs font-medium block mb-1">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full bg-primary-900/50 border border-primary-700 text-primary-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
            />
            <p className="text-primary-600 text-xs mt-1">Email cannot be changed here.</p>
          </div>
          <button
            onClick={handleProfileUpdate}
            disabled={profileLoading}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-500 transition-colors disabled:opacity-50"
          >
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Section>

      {/* Password */}
      <Section title="Change Password">
        <div className="space-y-3">
          {[
            { label: 'Current Password', value: currentPassword, set: setCurrentPassword },
            { label: 'New Password', value: newPassword, set: setNewPassword },
            { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="text-primary-300 text-xs font-medium block mb-1">{label}</label>
              <input
                type="password"
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full bg-primary-700 border border-primary-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
          ))}
          <button
            onClick={handlePasswordChange}
            disabled={pwLoading}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl text-sm hover:bg-primary-500 transition-colors disabled:opacity-50"
          >
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </Section>

      {/* Subscription */}
      <Section title="Subscription & Billing">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Status', value: sub?.status || 'inactive', colored: true },
              { label: 'Plan', value: sub?.plan ? `${sub.plan} plan` : '—' },
              { label: sub?.cancelAtPeriodEnd ? 'Access Until' : 'Renews On',
                value: sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
              { label: 'Auto-renew', value: sub?.cancelAtPeriodEnd ? 'Off' : 'On' },
            ].map(({ label, value, colored }) => (
              <div key={label} className="bg-primary-900/50 rounded-xl p-3">
                <p className="text-primary-500 text-xs">{label}</p>
                <p className={`text-sm font-medium mt-0.5 capitalize ${
                  colored && value === 'active' ? 'text-green-400' :
                  colored && value === 'cancelled' ? 'text-red-400' :
                  colored && value === 'past_due' ? 'text-orange-400' : 'text-white'
                }`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={openPortal}
              disabled={subLoading}
              className="w-full py-2.5 rounded-xl bg-primary-700 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Manage Billing & Payment Methods
            </button>
            {sub?.status === 'active' && !sub?.cancelAtPeriodEnd && (
              <button
                onClick={handleCancel}
                disabled={subLoading}
                className="w-full py-2.5 rounded-xl bg-transparent border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
              >
                Cancel Subscription
              </button>
            )}
            {sub?.cancelAtPeriodEnd && (
              <button
                onClick={handleResume}
                disabled={subLoading}
                className="w-full py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors"
              >
                Resume Subscription
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Account">
        <div className="space-y-2">
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="w-full py-2.5 rounded-xl bg-primary-700 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </Section>
    </div>
  );
};

export default SettingsPage;
