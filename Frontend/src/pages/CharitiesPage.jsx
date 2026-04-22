// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';
// import useCharityStore from '../context/charityStore';
// import { FaHeart, FaStar } from "react-icons/fa";
// import { FiSearch } from "react-icons/fi";

// const categories = ['all', 'health', 'education', 'environment', 'community', 'sports', 'other'];

// // ─── Charity Card ─────────────────────────────────────────────────────────
// const CharityCard = ({ charity, isSelected, onSelect, index }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [percent, setPercent] = useState(10);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.04 }}
//       className={`bg-primary-800/60 border rounded-2xl overflow-hidden transition-all duration-300 ${
//         isSelected
//           ? 'border-gold-500 shadow-lg shadow-gold-500/10'
//           : 'border-primary-700 hover:border-primary-500'
//       }`}
//     >
//       {/* Image */}
//       {charity.images?.[0] && (
//         <div className="h-36 overflow-hidden">
//           <img
//             src={charity.images[0]}
//             alt={charity.name}
//             className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
//           />
//         </div>
//       )}

//       <div className="p-5">
//         {/* Header */}
//         <div className="flex items-start justify-between gap-3 mb-3">
//           <div className="flex items-center gap-3">
//             {charity.logo && (
//               <img src={charity.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
//             )}
//             <div>
//               <h3 className="text-white font-bold text-sm leading-tight">{charity.name}</h3>
//               <span className="text-primary-500 text-xs capitalize">{charity.category}</span>
//             </div>
//           </div>
//           {isSelected && (
//             <span className="shrink-0 bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-bold px-2 py-0.5 rounded-full">
//               ★ Selected
//             </span>
//           )}
//         </div>

//         {/* Description */}
//         <p className="text-primary-400 text-xs leading-relaxed mb-3 line-clamp-2">
//           {charity.shortDescription || charity.description}
//         </p>

//         {/* Stats */}
//         <div className="flex gap-4 mb-4 text-xs">
//           <div>
//             <span className="text-primary-500">Supporters</span>
//             <span className="text-white font-medium ml-1">{charity.subscriberCount}</span>
//           </div>
//           {charity.totalContributions > 0 && (
//             <div>
//               <span className="text-primary-500">Raised</span>
//               <span className="text-green-400 font-medium ml-1">£{charity.totalContributions.toFixed(0)}</span>
//             </div>
//           )}
//         </div>

//         {/* Expand to select */}
//         {!isSelected && (
//           <button
//             onClick={() => setExpanded(!expanded)}
//             className="w-full py-2 rounded-xl bg-primary-700 text-primary-300 text-xs font-medium hover:bg-primary-600 hover:text-white transition-colors"
//           >
//             {expanded ? 'Cancel' : 'Support This Charity'}
//           </button>
//         )}

//         <AnimatePresence>
//           {expanded && !isSelected && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               className="overflow-hidden"
//             >
//               <div className="pt-3 border-t border-primary-700 mt-3">
//                 <label className="block text-primary-300 text-xs font-medium mb-2">
//                   Contribution: <span className="text-gold-400 font-bold">{percent}%</span> of your subscription
//                 </label>
//                 <input
//                   type="range"
//                   min="10"
//                   max="100"
//                   step="5"
//                   value={percent}
//                   onChange={(e) => setPercent(parseInt(e.target.value))}
//                   className="w-full accent-gold-500 mb-3"
//                 />
//                 <div className="flex justify-between text-xs text-primary-600 mb-3">
//                   <span>10% (min)</span>
//                   <span>100%</span>
//                 </div>
//                 <button
//                   onClick={() => onSelect(charity._id, percent)}
//                   className="w-full py-2.5 rounded-xl bg-gold-500 text-primary-900 font-bold text-sm hover:bg-gold-400 active:scale-95 transition-all"
//                 >
//                   Confirm — Support with {percent}%
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {isSelected && (
//           <button
//             onClick={() => setExpanded(!expanded)}
//             className="w-full py-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-medium hover:bg-gold-500/20 transition-colors mt-2"
//           >
//             Change Contribution %
//           </button>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// // ─── My Charity Widget ────────────────────────────────────────────────────
// const MyCharityWidget = ({ charity, percent }) => {
//   if (!charity) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="bg-gradient-to-r from-gold-500/10 to-primary-800/60 border border-gold-500/30 rounded-2xl p-5 mb-6 flex items-center gap-4"
//     >
//       {charity.logo && (
//         <img src={charity.logo} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
//       )}
//       <div className="flex-1 min-w-0">
//         <p className="text-primary-400 text-xs mb-0.5">Currently Supporting</p>
//         <p className="text-white font-bold truncate">{charity.name}</p>
//         <p className="text-gold-400 text-xs mt-0.5">{percent}% of your subscription</p>
//       </div>
//       <FaHeart className="text-2xl text-gold-400" />
//     </motion.div>
//   );
// };

// // ─── Main Page ────────────────────────────────────────────────────────────
// const CharitiesPage = () => {
//   const { charities, myCharity, myContributionPercent, isLoading, fetchCharities, fetchMyCharity, selectCharity } = useCharityStore();
//   const [search, setSearch] = useState('');
//   const [category, setCategory] = useState('all');

//   useEffect(() => {
//     fetchMyCharity();
//     fetchCharities();
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchCharities({
//         ...(search && { search }),
//         ...(category !== 'all' && { category }),
//       });
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [search, category]);

//   const handleSelect = async (charityId, percent) => {
//     const result = await selectCharity(charityId, percent);
//     if (result.success) {
//       toast.success(result.message);
//       fetchMyCharity();
//     } else {
//       toast.error(result.message || 'Failed to select charity.');
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-white text-2xl font-bold font-display">Charities</h1>
//         <p className="text-primary-400 text-sm mt-1">
//           Choose a charity to support with part of your subscription.
//         </p>
//       </div>

//       {/* My charity widget */}
//       <MyCharityWidget charity={myCharity} percent={myContributionPercent} />

//       {/* Search + filter */}
//       <div className="flex flex-col sm:flex-row gap-3 mb-6">
//         <input
//           type="text"
//           placeholder="Search charities..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="flex-1 bg-primary-800 border border-primary-600 text-white placeholder-primary-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 transition-colors"
//         />
//         <div className="flex gap-1.5 flex-wrap">
//           {categories.map((cat) => (
//             <button
//               key={cat}
//               onClick={() => setCategory(cat)}
//               className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
//                 category === cat
//                   ? 'bg-primary-600 text-white'
//                   : 'bg-primary-800/50 text-primary-400 border border-primary-700 hover:text-white'
//               }`}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Grid */}
//       {isLoading && charities.length === 0 ? (
//         <div className="text-center py-16 text-primary-500">Loading charities...</div>
//       ) : charities.length === 0 ? (
//         <div className="text-center py-16">
//           <div className="text-4xl mb-3">🔍</div>
//           <p className="text-primary-500 text-sm">No charities found. Try a different search.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {charities.map((charity, i) => (
//             <CharityCard
//               key={charity._id}
//               charity={charity}
//               index={i}
//               isSelected={myCharity?._id === charity._id}
//               onSelect={handleSelect}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CharitiesPage;


import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useCharityStore from '../context/charityStore';

// ✅ ICONS
import { FaHeart, FaStar } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

const categories = ['all', 'health', 'education', 'environment', 'community', 'sports', 'other'];

// ─── Charity Card ─────────────────────────────────────────────────────────
const CharityCard = ({ charity, isSelected, onSelect, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [percent, setPercent] = useState(10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-primary-800/60 border rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'border-gold-500 shadow-lg shadow-gold-500/10'
          : 'border-primary-700 hover:border-primary-500'
      }`}
    >
      {/* Image */}
      {charity.images?.[0] && (
        <div className="h-36 overflow-hidden">
          <img
            src={charity.images[0]}
            alt={charity.name}
            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {charity.logo && (
              <img src={charity.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
            )}
            <div>
              <h3 className="text-white font-bold text-sm leading-tight">{charity.name}</h3>
              <span className="text-primary-500 text-xs capitalize">{charity.category}</span>
            </div>
          </div>

          {/* ✅ Selected Badge */}
          {isSelected && (
            <span className="flex items-center gap-1 shrink-0 bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-bold px-2 py-0.5 rounded-full">
              <FaStar className="text-xs" />
              Selected
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-primary-400 text-xs leading-relaxed mb-3 line-clamp-2">
          {charity.shortDescription || charity.description}
        </p>

        {/* Stats */}
        <div className="flex gap-4 mb-4 text-xs">
          <div>
            <span className="text-primary-500">Supporters</span>
            <span className="text-white font-medium ml-1">{charity.subscriberCount}</span>
          </div>
          {charity.totalContributions > 0 && (
            <div>
              <span className="text-primary-500">Raised</span>
              <span className="text-green-400 font-medium ml-1">
                £{charity.totalContributions.toFixed(0)}
              </span>
            </div>
          )}
        </div>

        {/* Expand */}
        {!isSelected && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2 rounded-xl bg-primary-700 text-primary-300 text-xs font-medium hover:bg-primary-600 hover:text-white transition-colors"
          >
            {expanded ? 'Cancel' : 'Support This Charity'}
          </button>
        )}

        <AnimatePresence>
          {expanded && !isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-primary-700 mt-3">
                <label className="block text-primary-300 text-xs font-medium mb-2">
                  Contribution: <span className="text-gold-400 font-bold">{percent}%</span>
                </label>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={percent}
                  onChange={(e) => setPercent(parseInt(e.target.value))}
                  className="w-full accent-gold-500 mb-3"
                />

                <div className="flex justify-between text-xs text-primary-600 mb-3">
                  <span>10% (min)</span>
                  <span>100%</span>
                </div>

                <button
                  onClick={() => onSelect(charity._id, percent)}
                  className="w-full py-2.5 rounded-xl bg-gold-500 text-primary-900 font-bold text-sm hover:bg-gold-400 active:scale-95 transition-all"
                >
                  Confirm — Support with {percent}%
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isSelected && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-medium hover:bg-gold-500/20 transition-colors mt-2"
          >
            Change Contribution %
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── My Charity Widget ────────────────────────────────────────────────────
const MyCharityWidget = ({ charity, percent }) => {
  if (!charity) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-gold-500/10 to-primary-800/60 border border-gold-500/30 rounded-2xl p-5 mb-6 flex items-center gap-4"
    >
      {charity.logo && (
        <img src={charity.logo} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-primary-400 text-xs mb-0.5">Currently Supporting</p>
        <p className="text-white font-bold truncate">{charity.name}</p>
        <p className="text-gold-400 text-xs mt-0.5">{percent}% of your subscription</p>
      </div>

      {/* ✅ Heart Icon */}
      <FaHeart className="text-2xl text-gold-400" />
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const CharitiesPage = () => {
  const {
    charities,
    myCharity,
    myContributionPercent,
    isLoading,
    fetchCharities,
    fetchMyCharity,
    selectCharity
  } = useCharityStore();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchMyCharity();
    fetchCharities();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCharities({
        ...(search && { search }),
        ...(category !== 'all' && { category }),
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const handleSelect = async (charityId, percent) => {
    const result = await selectCharity(charityId, percent);
    if (result.success) {
      toast.success(result.message);
      fetchMyCharity();
    } else {
      toast.error(result.message || 'Failed to select charity.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold font-display">Charities</h1>
        <p className="text-primary-400 text-sm mt-1">
          Choose a charity to support with part of your subscription.
        </p>
      </div>

      <MyCharityWidget charity={myCharity} percent={myContributionPercent} />

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm" />
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 bg-primary-800 border border-primary-600 text-white placeholder-primary-500 rounded-xl py-2.5 text-sm focus:outline-none focus:border-primary-400"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading && charities.length === 0 ? (
        <div className="text-center py-16 text-primary-500">Loading charities...</div>
      ) : charities.length === 0 ? (
        <div className="text-center py-16">
          {/* ✅ Search Icon */}
          <FiSearch className="text-4xl text-primary-500 mb-3 mx-auto" />
          <p className="text-primary-500 text-sm">
            No charities found. Try a different search.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {charities.map((charity, i) => (
            <CharityCard
              key={charity._id}
              charity={charity}
              index={i}
              isSelected={myCharity?._id === charity._id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CharitiesPage;