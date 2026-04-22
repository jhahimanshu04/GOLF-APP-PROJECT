// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';
// import useDrawStore from '../context/drawStore';

// const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// const statusColors = {
//   pending:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
//   verified: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
//   paid:     'bg-green-500/20 text-green-400 border-green-500/30',
//   rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
// };

// // ─── Upcoming Draw Card ───────────────────────────────────────────────────
// const UpcomingDrawCard = ({ draw }) => {
//   if (!draw) return null;
//   const drawDate = new Date(draw.year, draw.month - 1, 1);
//   const daysLeft = Math.ceil((drawDate - new Date()) / (1000 * 60 * 60 * 24));

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-800 border border-primary-600 rounded-2xl p-6 mb-8"
//     >
//       {/* Glow */}
//       <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl" />

//       <div className="relative">
//         <div className="flex items-center gap-2 mb-3">
//           <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
//           <span className="text-green-400 text-xs font-bold uppercase tracking-widest">
//             Next Draw
//           </span>
//         </div>
//         <h2 className="text-white text-2xl font-display font-bold mb-1">{draw.title}</h2>
//         <p className="text-primary-300 text-sm mb-4">
//           {daysLeft > 0
//             ? `Draw runs in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
//             : 'Draw runs soon!'}
//         </p>

//         <div className="grid grid-cols-3 gap-3">
//           {[
//             { label: '5 Match', value: '40%', sub: 'of pool' },
//             { label: '4 Match', value: '35%', sub: 'of pool' },
//             { label: '3 Match', value: '25%', sub: 'of pool' },
//           ].map(({ label, value, sub }) => (
//             <div key={label} className="bg-primary-900/50 rounded-xl p-3 text-center">
//               <div className="text-gold-400 font-bold text-lg">{value}</div>
//               <div className="text-white text-xs font-medium">{label}</div>
//               <div className="text-primary-500 text-xs">{sub}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// // ─── Draw Result Card ─────────────────────────────────────────────────────
// const DrawResultCard = ({ draw, index }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.05 }}
//       className="bg-primary-800/60 border border-primary-700 rounded-2xl p-5 hover:border-primary-500 transition-all"
//     >
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h3 className="text-white font-bold">{draw.title}</h3>
//           <p className="text-primary-500 text-xs mt-0.5">
//             {draw.participantCount} participants · {draw.winners?.length || 0} winner(s)
//           </p>
//         </div>
//         <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${
//           draw.status === 'completed' || draw.status === 'published'
//             ? 'bg-green-500/20 text-green-400 border-green-500/30'
//             : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
//         }`}>
//           {draw.status}
//         </span>
//       </div>

//       {/* Winning numbers */}
//       {draw.winningNumbers?.length === 5 && (
//         <div className="flex gap-2 mb-4">
//           {draw.winningNumbers.map((n) => (
//             <div
//               key={n}
//               className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 font-bold text-sm flex items-center justify-center"
//             >
//               {n}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Prize pool */}
//       {draw.prizePool?.total > 0 && (
//         <div className="text-primary-400 text-xs">
//           Total pool: <span className="text-white font-medium">£{draw.prizePool.total.toFixed(2)}</span>
//           {!draw.jackpotWon && (
//             <span className="ml-2 text-gold-400">🎰 Jackpot rolled over</span>
//           )}
//         </div>
//       )}
//     </motion.div>
//   );
// };

// // ─── Winning History ──────────────────────────────────────────────────────
// const WinningsHistory = ({ winnings, onUploadProof }) => {
//   if (!winnings.length) {
//     return (
//       <div className="text-center py-12">
//         <div className="text-4xl mb-3">🏆</div>
//         <p className="text-primary-500 text-sm">No winnings yet — keep playing!</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-3">
//       {winnings.map((w, i) => (
//         <motion.div
//           key={w._id}
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: i * 0.05 }}
//           className="bg-primary-800/60 border border-primary-700 rounded-2xl p-5"
//         >
//           <div className="flex items-center justify-between mb-3">
//             <div>
//               <p className="text-white font-bold">
//                 {w.draw?.title || 'Draw'}
//               </p>
//               <p className="text-primary-400 text-xs mt-0.5 capitalize">{w.matchType}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-gold-400 font-bold text-lg">£{w.amount?.toFixed(2)}</p>
//               <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${statusColors[w.status]}`}>
//                 {w.status}
//               </span>
//             </div>
//           </div>

//           {w.status === 'pending' && !w.proofUrl && (
//             <button
//               onClick={() => onUploadProof(w._id)}
//               className="w-full py-2 rounded-xl bg-gold-500/20 border border-gold-500/30 text-gold-400 text-sm font-medium hover:bg-gold-500/30 transition-colors"
//             >
//               📎 Upload Proof to Claim
//             </button>
//           )}
//           {w.proofUrl && w.status === 'pending' && (
//             <p className="text-primary-500 text-xs">✅ Proof submitted — awaiting admin review</p>
//           )}
//         </motion.div>
//       ))}
//     </div>
//   );
// };

// // ─── Main Page ────────────────────────────────────────────────────────────
// const DrawsPage = () => {
//   const { draws, upcomingDraw, myHistory, isLoading, fetchDraws, fetchUpcoming, fetchMyHistory, uploadProof } = useDrawStore();
//   const [activeTab, setActiveTab] = useState('upcoming');
//   const [uploadingFor, setUploadingFor] = useState(null);

//   useEffect(() => {
//     fetchUpcoming();
//     fetchDraws();
//     fetchMyHistory();
//   }, []);

//   const handleProofUpload = (winningId) => {
//     setUploadingFor(winningId);
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = 'image/*';
//     input.onchange = async (e) => {
//       const file = e.target.files[0];
//       if (!file) return;
//       const result = await uploadProof(winningId, file);
//       if (result.success) {
//         toast.success('Proof uploaded! Awaiting admin review.');
//       } else {
//         toast.error(result.message || 'Upload failed.');
//       }
//       setUploadingFor(null);
//     };
//     input.click();
//   };

//   const tabs = [
//     { id: 'upcoming', label: 'Upcoming' },
//     { id: 'results', label: `Results (${draws.length})` },
//     { id: 'winnings', label: `My Winnings (${myHistory.length})` },
//   ];

//   return (
//     <div className="max-w-2xl mx-auto px-4 py-8">
//       <div className="mb-6">
//         <h1 className="text-white text-2xl font-bold font-display">Draws</h1>
//         <p className="text-primary-400 text-sm mt-1">Monthly prize draws for all active subscribers</p>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-1 bg-primary-800/50 rounded-xl p-1 mb-6">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
//               activeTab === tab.id
//                 ? 'bg-primary-700 text-white shadow'
//                 : 'text-primary-400 hover:text-white'
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       <AnimatePresence mode="wait">
//         {activeTab === 'upcoming' && (
//           <motion.div key="upcoming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <UpcomingDrawCard draw={upcomingDraw} />
//             <div className="bg-primary-800/30 border border-primary-700/50 rounded-xl p-4">
//               <p className="text-primary-300 text-sm font-medium mb-2">How draws work</p>
//               <ul className="text-primary-500 text-xs space-y-1.5">
//                 <li>✅ All active subscribers are automatically entered</li>
//                 <li>🎯 Your 5 golf scores are matched against 5 winning numbers</li>
//                 <li>🏆 Match 3, 4, or 5 numbers to win a prize</li>
//                 <li>🎰 Jackpot (5 match) rolls over if unclaimed</li>
//                 <li>💝 10%+ of your subscription goes to your chosen charity</li>
//               </ul>
//             </div>
//           </motion.div>
//         )}

//         {activeTab === 'results' && (
//           <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             {isLoading ? (
//               <div className="text-center py-12 text-primary-500">Loading draws...</div>
//             ) : draws.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="text-4xl mb-3">🎰</div>
//                 <p className="text-primary-500 text-sm">No draw results yet</p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {draws.map((draw, i) => (
//                   <DrawResultCard key={draw._id} draw={draw} index={i} />
//                 ))}
//               </div>
//             )}
//           </motion.div>
//         )}

//         {activeTab === 'winnings' && (
//           <motion.div key="winnings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <WinningsHistory winnings={myHistory} onUploadProof={handleProofUpload} />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default DrawsPage;

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useDrawStore from '../context/drawStore';

// ✅ ICONS
import { FaTrophy, FaPaperclip, FaCheckCircle, FaBullseye, FaGift } from "react-icons/fa";
import { GiSlotMachine } from "react-icons/gi";

const statusColors = {
  pending:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  verified: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  paid:     'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// ─── Upcoming Draw Card ───────────────────────────────────────────────────
const UpcomingDrawCard = ({ draw }) => {
  if (!draw) return null;

  const drawDate = new Date(draw.year, draw.month - 1, 1);
  const daysLeft = Math.ceil((drawDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-800 border border-primary-600 rounded-2xl p-6 mb-8"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-bold uppercase tracking-widest">
            Next Draw
          </span>
        </div>

        <h2 className="text-white text-2xl font-display font-bold mb-1">{draw.title}</h2>

        <p className="text-primary-300 text-sm mb-4">
          {daysLeft > 0
            ? `Draw runs in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
            : 'Draw runs soon!'}
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '5 Match', value: '40%' },
            { label: '4 Match', value: '35%' },
            { label: '3 Match', value: '25%' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-primary-900/50 rounded-xl p-3 text-center">
              <div className="text-gold-400 font-bold text-lg">{value}</div>
              <div className="text-white text-xs font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Draw Result Card ─────────────────────────────────────────────────────
const DrawResultCard = ({ draw, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-primary-800/60 border border-primary-700 rounded-2xl p-5 hover:border-primary-500 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold">{draw.title}</h3>
          <p className="text-primary-500 text-xs mt-0.5">
            {draw.participantCount} participants · {draw.winners?.length || 0} winner(s)
          </p>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${
          draw.status === 'completed' || draw.status === 'published'
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        }`}>
          {draw.status}
        </span>
      </div>

      {/* Winning numbers */}
      {draw.winningNumbers?.length === 5 && (
        <div className="flex gap-2 mb-4">
          {draw.winningNumbers.map((n) => (
            <div
              key={n}
              className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 font-bold text-sm flex items-center justify-center"
            >
              {n}
            </div>
          ))}
        </div>
      )}

      {/* Prize pool */}
      {draw.prizePool?.total > 0 && (
        <div className="text-primary-400 text-xs flex items-center gap-2">
          Total pool:
          <span className="text-white font-medium">
            £{draw.prizePool.total.toFixed(2)}
          </span>

          {!draw.jackpotWon && (
            <span className="flex items-center gap-1 text-gold-400 ml-2">
              <GiSlotMachine className="text-sm" />
              Jackpot rolled over
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ─── Winning History ──────────────────────────────────────────────────────
const WinningsHistory = ({ winnings, onUploadProof }) => {
  if (!winnings.length) {
    return (
      <div className="text-center py-12">
        <FaTrophy className="text-4xl text-gold-400 mb-3 mx-auto" />
        <p className="text-primary-500 text-sm">No winnings yet — keep playing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {winnings.map((w, i) => (
        <motion.div
          key={w._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-primary-800/60 border border-primary-700 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-bold">{w.draw?.title || 'Draw'}</p>
              <p className="text-primary-400 text-xs mt-0.5 capitalize">{w.matchType}</p>
            </div>

            <div className="text-right">
              <p className="text-gold-400 font-bold text-lg">£{w.amount?.toFixed(2)}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${statusColors[w.status]}`}>
                {w.status}
              </span>
            </div>
          </div>

          {w.status === 'pending' && !w.proofUrl && (
            <button
              onClick={() => onUploadProof(w._id)}
              className="w-full py-2 rounded-xl bg-gold-500/20 border border-gold-500/30 text-gold-400 text-sm font-medium hover:bg-gold-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <FaPaperclip />
              Upload Proof to Claim
            </button>
          )}

          {w.proofUrl && w.status === 'pending' && (
            <p className="text-primary-500 text-xs flex items-center gap-1">
              <FaCheckCircle className="text-green-400" />
              Proof submitted — awaiting admin review
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const DrawsPage = () => {
  const { draws, upcomingDraw, myHistory, isLoading, fetchDraws, fetchUpcoming, fetchMyHistory, uploadProof } = useDrawStore();

  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchUpcoming();
    fetchDraws();
    fetchMyHistory();
  }, []);

  const handleProofUpload = (winningId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const result = await uploadProof(winningId, file);

      if (result.success) {
        toast.success('Proof uploaded!');
      } else {
        toast.error('Upload failed');
      }
    };

    input.click();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <h1 className="text-white text-2xl font-bold mb-6">Draws</h1>

      <UpcomingDrawCard draw={upcomingDraw} />

      <div className="space-y-3">
        {draws.map((draw, i) => (
          <DrawResultCard key={draw._id} draw={draw} index={i} />
        ))}
      </div>

      <div className="mt-8">
        <WinningsHistory winnings={myHistory} onUploadProof={handleProofUpload} />
      </div>

    </div>
  );
};

export default DrawsPage;