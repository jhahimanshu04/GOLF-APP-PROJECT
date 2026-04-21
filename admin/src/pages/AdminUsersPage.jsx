import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';

const statusColors = {
  active:   'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled:'bg-red-500/20 text-red-400 border-red-500/30',
  past_due: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editScores, setEditScores] = useState(false);
  const [scores, setScores] = useState([]);

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleViewUser = async (userId) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      setSelectedUser(data.user);
      setScores(data.user.scores?.map(s => ({ value: s.value, date: new Date(s.date).toISOString().split('T')[0] })) || []);
    } catch {
      toast.error('Failed to load user details.');
    }
  };

  const handleUpdateScores = async () => {
    try {
      await api.put(`/admin/users/${selectedUser._id}/scores`, { scores });
      toast.success('Scores updated!');
      setEditScores(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update scores.');
    }
  };

  const handleCancelSub = async (userId) => {
    if (!confirm('Cancel this user\'s subscription?')) return;
    try {
      await api.put(`/admin/users/${userId}/cancel-subscription`);
      toast.success('Subscription cancelled.');
      fetchUsers();
    } catch {
      toast.error('Failed to cancel subscription.');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted.');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">User Management</h1>
        <p className="text-primary-400 text-sm mt-1">{pagination.total} total users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 bg-primary-800 border border-primary-600 text-white placeholder-primary-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-primary-800 border border-primary-600 text-white rounded-xl px-3 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          {['active','inactive','cancelled','past_due'].map(s => (
            <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {/* Users table */}
        <div className={`${selectedUser ? 'md:col-span-3' : 'md:col-span-5'}`}>
          {isLoading ? (
            <div className="text-center py-12 text-primary-500">Loading users...</div>
          ) : (
            <div className="space-y-2">
              {users.map((user, i) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => handleViewUser(user._id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedUser?._id === user._id
                      ? 'bg-primary-700 border-primary-500'
                      : 'bg-primary-800/60 border-primary-700 hover:border-primary-500'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{user.name}</p>
                    <p className="text-primary-500 text-xs truncate">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize shrink-0 ${statusColors[user.subscription?.status] || statusColors.inactive}`}>
                    {user.subscription?.status || 'inactive'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex gap-2 mt-4 justify-center">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchUsers(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === pagination.page ? 'bg-primary-600 text-white' : 'bg-primary-800 text-primary-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User detail panel */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 bg-primary-800/60 border border-primary-700 rounded-2xl p-5 h-fit"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">{selectedUser.name}</h3>
                <p className="text-primary-500 text-xs">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-primary-500 hover:text-white text-lg">×</button>
            </div>

            <div className="space-y-2 mb-4">
              {[
                { label: 'Role', value: selectedUser.role },
                { label: 'Plan', value: selectedUser.subscription?.plan || '—' },
                { label: 'Status', value: selectedUser.subscription?.status || 'inactive' },
                { label: 'Scores', value: `${selectedUser.scores?.length || 0}/5` },
                { label: 'Charity', value: selectedUser.selectedCharity?.name || 'None' },
                { label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString('en-GB') },
                { label: 'Last Login', value: selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('en-GB') : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-primary-500">{label}</span>
                  <span className="text-white font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>

            {/* Scores editor */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-primary-400 text-xs font-medium">Scores</p>
                <button onClick={() => setEditScores(!editScores)} className="text-primary-400 text-xs hover:text-white">
                  {editScores ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {editScores ? (
                <div className="space-y-2">
                  {scores.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="number" min="1" max="45" value={s.value}
                        onChange={(e) => { const n = [...scores]; n[i].value = e.target.value; setScores(n); }}
                        className="w-16 bg-primary-700 border border-primary-600 text-white rounded-lg px-2 py-1 text-xs"
                      />
                      <input type="date" value={s.date}
                        onChange={(e) => { const n = [...scores]; n[i].date = e.target.value; setScores(n); }}
                        className="flex-1 bg-primary-700 border border-primary-600 text-white rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                  ))}
                  <button onClick={handleUpdateScores} className="w-full py-1.5 bg-gold-500 text-primary-900 font-bold rounded-lg text-xs mt-1">
                    Save Scores
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.scores?.length > 0
                    ? selectedUser.scores.map((s, i) => (
                        <span key={i} className="bg-primary-700 text-white text-xs px-2 py-1 rounded-lg">
                          {s.value} pts
                        </span>
                      ))
                    : <span className="text-primary-600 text-xs">No scores</span>
                  }
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-3 border-t border-primary-700">
              {selectedUser.subscription?.status === 'active' && (
                <button
                  onClick={() => handleCancelSub(selectedUser._id)}
                  className="w-full py-2 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-medium hover:bg-orange-500/30 transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
              <button
                onClick={() => handleDeleteUser(selectedUser._id, selectedUser.name)}
                className="w-full py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
              >
                Delete User
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
