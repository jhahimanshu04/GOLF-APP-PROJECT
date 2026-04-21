import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useDrawStore from '../context/drawStore';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminDrawsPage = () => {
  const { draws, isLoading, adminFetchAll, adminCreateDraw, adminSimulate, adminRunDraw, adminPublish, adminVerifyWinner, adminMarkPaid } = useDrawStore();
  const [simulation, setSimulation] = useState(null);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [logic, setLogic] = useState('random');
  const [creating, setCreating] = useState(false);
  const [newDraw, setNewDraw] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  useEffect(() => { adminFetchAll(); }, []);

  const handleSimulate = async (drawId) => {
    const result = await adminSimulate(drawId, logic);
    if (result.success) {
      setSimulation(result.simulation);
      setSelectedDraw(drawId);
      toast.success('Simulation complete!');
    } else {
      toast.error(result.message);
    }
  };

  const handleRun = async (drawId) => {
    if (!confirm('Are you sure you want to run this draw? This cannot be undone.')) return;
    const result = await adminRunDraw(drawId, logic);
    if (result.success) {
      toast.success(`Draw complete! ${result.draw.winners.length} winner(s)`);
      setSimulation(null);
    } else {
      toast.error(result.message);
    }
  };

  const handlePublish = async (drawId) => {
    const result = await adminPublish(drawId);
    result.success ? toast.success('Draw published!') : toast.error(result.message);
  };

  const handleCreate = async () => {
    const result = await adminCreateDraw(newDraw.month, newDraw.year, logic);
    result.success ? toast.success('Draw created!') : toast.error(result.message);
    setCreating(false);
  };

  const handleVerify = async (drawId, winnerId, action) => {
    const result = await adminVerifyWinner(drawId, winnerId, action);
    result.success ? toast.success(`Winner ${action}d!`) : toast.error(result.message);
  };

  const handleMarkPaid = async (drawId, winnerId) => {
    const result = await adminMarkPaid(drawId, winnerId);
    result.success ? toast.success('Marked as paid!') : toast.error(result.message);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Draw Management</h1>
          <p className="text-primary-400 text-sm mt-1">Run, simulate, and manage monthly draws</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-gold-500 text-primary-900 font-bold rounded-xl text-sm hover:bg-gold-400 transition-colors"
        >
          + Create Draw
        </button>
      </div>

      {/* Logic toggle */}
      <div className="flex items-center gap-3 bg-primary-800/50 border border-primary-700 rounded-xl p-4 mb-6">
        <span className="text-primary-300 text-sm font-medium">Draw Logic:</span>
        {['random', 'weighted'].map((l) => (
          <button
            key={l}
            onClick={() => setLogic(l)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              logic === l ? 'bg-primary-600 text-white' : 'text-primary-400 hover:text-white'
            }`}
          >
            {l}
          </button>
        ))}
        <span className="text-primary-600 text-xs ml-2">
          {logic === 'random' ? 'Standard lottery-style draw' : 'Weighted by most frequent user scores'}
        </span>
      </div>

      {/* Create draw modal */}
      {creating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-800 border border-primary-600 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-white font-bold mb-4">Create New Draw</h3>
          <div className="flex gap-3 mb-4">
            <select
              value={newDraw.month}
              onChange={(e) => setNewDraw({ ...newDraw, month: parseInt(e.target.value) })}
              className="flex-1 bg-primary-700 text-white border border-primary-600 rounded-xl px-3 py-2 text-sm"
            >
              {monthNames.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              value={newDraw.year}
              onChange={(e) => setNewDraw({ ...newDraw, year: parseInt(e.target.value) })}
              className="w-28 bg-primary-700 text-white border border-primary-600 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="flex-1 py-2 bg-gold-500 text-primary-900 font-bold rounded-xl text-sm">Create</button>
            <button onClick={() => setCreating(false)} className="flex-1 py-2 bg-primary-700 text-white rounded-xl text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Simulation result */}
      {simulation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-primary-800/60 border border-gold-500/30 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-gold-400 font-bold mb-3">🎰 Simulation Result</h3>
          <div className="flex gap-2 mb-3">
            {simulation.winningNumbers.map((n) => (
              <div key={n} className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 font-bold text-sm flex items-center justify-center">
                {n}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {Object.entries(simulation.winners).map(([tier, count]) => (
              <div key={tier} className="bg-primary-900/50 rounded-xl p-3 text-center">
                <div className="text-white font-bold">{count}</div>
                <div className="text-primary-500 text-xs capitalize">{tier} winner{count !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
          <p className="text-primary-400 text-xs">{simulation.participantCount} total participants</p>
          <button
            onClick={() => handleRun(selectedDraw)}
            disabled={isLoading}
            className="mt-4 w-full py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl text-sm hover:bg-red-500/30 transition-colors"
          >
            ⚡ Run Official Draw (Cannot be undone)
          </button>
        </motion.div>
      )}

      {/* Draws list */}
      <div className="space-y-4">
        {draws.map((draw, i) => (
          <motion.div
            key={draw._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-primary-800/60 border border-primary-700 rounded-2xl p-5"
          >
            {/* Draw header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">{draw.title}</h3>
                <p className="text-primary-500 text-xs mt-0.5">{draw.participantCount || 0} participants</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${
                  draw.status === 'completed' || draw.status === 'published' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  draw.status === 'simulation' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}>
                  {draw.status}
                </span>
              </div>
            </div>

            {/* Winning numbers */}
            {draw.winningNumbers?.length === 5 && (
              <div className="flex gap-2 mb-4">
                {draw.winningNumbers.map((n) => (
                  <div key={n} className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 font-bold text-xs flex items-center justify-center">
                    {n}
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {draw.status === 'upcoming' && (
                <>
                  <button
                    onClick={() => handleSimulate(draw._id)}
                    disabled={isLoading}
                    className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    🔍 Simulate
                  </button>
                  <button
                    onClick={() => handleRun(draw._id)}
                    disabled={isLoading}
                    className="px-4 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    ⚡ Run Draw
                  </button>
                </>
              )}
              {draw.status === 'completed' && (
                <button
                  onClick={() => handlePublish(draw._id)}
                  className="px-4 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  📢 Publish Results
                </button>
              )}
            </div>

            {/* Winners */}
            {draw.winners?.length > 0 && (
              <div>
                <p className="text-primary-400 text-xs font-medium mb-2">Winners ({draw.winners.length})</p>
                <div className="space-y-2">
                  {draw.winners.map((winner) => (
                    <div key={winner._id} className="flex items-center justify-between bg-primary-900/50 rounded-xl p-3">
                      <div>
                        <p className="text-white text-sm font-medium">{winner.user?.name || 'User'}</p>
                        <p className="text-primary-500 text-xs capitalize">{winner.matchType} · £{winner.prizeAmount?.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                          winner.status === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          winner.status === 'verified' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          winner.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {winner.status}
                        </span>
                        {winner.status === 'pending' && winner.proofUrl && (
                          <>
                            <button onClick={() => handleVerify(draw._id, winner._id, 'approve')} className="text-green-400 text-xs hover:underline">✓ Approve</button>
                            <button onClick={() => handleVerify(draw._id, winner._id, 'reject')} className="text-red-400 text-xs hover:underline">✗ Reject</button>
                          </>
                        )}
                        {winner.status === 'verified' && (
                          <button onClick={() => handleMarkPaid(draw._id, winner._id)} className="text-blue-400 text-xs hover:underline">Mark Paid</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDrawsPage;
