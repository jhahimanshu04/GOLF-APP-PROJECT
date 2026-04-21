import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useScoreStore from '../context/scoreStore';

// ─── Score Card ───────────────────────────────────────────────────────────
const ScoreCard = ({ score, onEdit, onDelete, index }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });

  const getScoreColor = (value) => {
    if (value >= 36) return 'text-green-400';
    if (value >= 28) return 'text-gold-400';
    if (value >= 20) return 'text-blue-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ delay: index * 0.05 }}
      className="bg-primary-800/60 border border-primary-700 rounded-2xl p-5 flex items-center justify-between group hover:border-primary-500 transition-all duration-200"
    >
      {/* Position badge */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-primary-400 text-xs font-bold">
          {index + 1}
        </div>

        {/* Score value */}
        <div>
          <div className={`text-3xl font-display font-bold ${getScoreColor(score.value)}`}>
            {score.value}
          </div>
          <div className="text-primary-400 text-xs mt-0.5">Stableford pts</div>
        </div>
      </div>

      {/* Date */}
      <div className="text-center hidden sm:block">
        <div className="text-white text-sm font-medium">{formatDate(score.date)}</div>
        <div className="text-primary-500 text-xs mt-0.5">
          Added {new Date(score.enteredAt).toLocaleDateString('en-GB')}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(score._id)}
              className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 bg-primary-700 text-primary-300 text-xs rounded-lg hover:bg-primary-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onEdit(score)}
              className="p-2 rounded-xl bg-primary-700/0 text-primary-400 hover:bg-primary-700 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              ✏️
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-xl bg-primary-700/0 text-primary-400 hover:bg-red-500/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─── Score Form Modal ─────────────────────────────────────────────────────
const ScoreModal = ({ isOpen, onClose, onSubmit, editingScore, isLoading }) => {
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingScore) {
      setValue(editingScore.value.toString());
      setDate(new Date(editingScore.date).toISOString().split('T')[0]);
    } else {
      setValue('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [editingScore, isOpen]);

  const handleSubmit = async () => {
    setError('');
    if (!value || value < 1 || value > 45) {
      setError('Score must be between 1 and 45.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }
    await onSubmit(value, date);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-primary-900 border border-primary-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-white text-xl font-bold mb-1">
            {editingScore ? 'Edit Score' : 'Add New Score'}
          </h2>
          <p className="text-primary-400 text-sm mb-6">
            {editingScore ? 'Update your Stableford score.' : 'Enter your latest Stableford score (1–45).'}
          </p>

          {/* Score input */}
          <div className="mb-4">
            <label className="block text-primary-300 text-sm font-medium mb-2">
              Stableford Points
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="45"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 32"
                className="w-full bg-primary-800 border border-primary-600 text-white text-2xl font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors placeholder-primary-600"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 text-sm">
                pts
              </span>
            </div>
            {/* Visual range indicator */}
            <div className="flex justify-between text-xs text-primary-600 mt-1 px-1">
              <span>1 (min)</span>
              <span className="text-primary-400">Stableford range</span>
              <span>45 (max)</span>
            </div>
          </div>

          {/* Date input */}
          <div className="mb-6">
            <label className="block text-primary-300 text-sm font-medium mb-2">
              Date Played
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-primary-800 border border-primary-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-primary-800 border border-primary-600 text-primary-300 font-medium hover:bg-primary-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-gold-500 text-primary-900 font-bold hover:bg-gold-400 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : editingScore ? 'Update Score' : 'Add Score'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────
const StatsBar = ({ stats }) => {
  if (!stats || stats.count === 0) return null;

  const trendIcon = stats.trend === 'up' ? '📈' : stats.trend === 'down' ? '📉' : '➡️';
  const trendText = stats.trend === 'up' ? 'Improving' : stats.trend === 'down' ? 'Declining' : 'Steady';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
    >
      {[
        { label: 'Average', value: stats.average, suffix: 'pts' },
        { label: 'Best', value: stats.highest, suffix: 'pts', color: 'text-green-400' },
        { label: 'Lowest', value: stats.lowest, suffix: 'pts', color: 'text-red-400' },
        { label: 'Trend', value: `${trendIcon} ${trendText}`, isText: true },
      ].map(({ label, value, suffix, color, isText }) => (
        <div
          key={label}
          className="bg-primary-800/60 border border-primary-700 rounded-xl p-4 text-center"
        >
          <div className={`text-xl font-bold ${color || 'text-white'} ${isText ? 'text-base' : ''}`}>
            {isText ? value : `${value}${suffix ? ` ${suffix}` : ''}`}
          </div>
          <div className="text-primary-500 text-xs mt-1">{label}</div>
        </div>
      ))}
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const ScoresPage = () => {
  const { scores, stats, isLoading, fetchScores, fetchStats, addScore, updateScore, deleteScore } =
    useScoreStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState(null);

  useEffect(() => {
    fetchScores();
    fetchStats();
  }, []);

  const handleSubmit = async (value, date) => {
    let result;
    if (editingScore) {
      result = await updateScore(editingScore._id, value, date);
    } else {
      result = await addScore(value, date);
    }

    if (result.success) {
      toast.success(editingScore ? 'Score updated!' : 'Score added!');
      setModalOpen(false);
      setEditingScore(null);
    } else {
      toast.error(result.message);
    }
  };

  const handleEdit = (score) => {
    setEditingScore(score);
    setModalOpen(true);
  };

  const handleDelete = async (scoreId) => {
    const result = await deleteScore(scoreId);
    if (result.success) {
      toast.success('Score deleted.');
    } else {
      toast.error(result.message);
    }
  };

  const handleAddNew = () => {
    setEditingScore(null);
    setModalOpen(true);
  };

  const slotsRemaining = 5 - scores.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold font-display">My Scores</h1>
          <p className="text-primary-400 text-sm mt-1">
            {scores.length}/5 scores entered
            {slotsRemaining > 0
              ? ` · ${slotsRemaining} slot${slotsRemaining > 1 ? 's' : ''} remaining`
              : ' · New scores replace the oldest'}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-primary-900 font-bold rounded-xl hover:bg-gold-400 active:scale-95 transition-all text-sm"
        >
          <span>+</span> Add Score
        </button>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Rolling logic info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-primary-800/30 border border-primary-700/50 rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <span className="text-xl">ℹ️</span>
        <div>
          <p className="text-primary-300 text-sm font-medium">Rolling 5-Score System</p>
          <p className="text-primary-500 text-xs mt-1">
            Only your 5 most recent scores are kept. Adding a 6th score automatically removes your oldest one.
            One score per date — duplicates are not allowed.
          </p>
        </div>
      </motion.div>

      {/* Score list */}
      {isLoading && scores.length === 0 ? (
        <div className="text-center py-16 text-primary-500">Loading scores...</div>
      ) : scores.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-5xl mb-4">⛳</div>
          <p className="text-white font-medium text-lg mb-2">No scores yet</p>
          <p className="text-primary-500 text-sm mb-6">
            Add your first Stableford score to get entered into the monthly draw.
          </p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-gold-500 text-primary-900 font-bold rounded-xl hover:bg-gold-400 transition-colors"
          >
            Add Your First Score
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {scores.map((score, index) => (
              <ScoreCard
                key={score._id}
                score={score}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Score Modal */}
      <ScoreModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingScore(null); }}
        onSubmit={handleSubmit}
        editingScore={editingScore}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ScoresPage;
