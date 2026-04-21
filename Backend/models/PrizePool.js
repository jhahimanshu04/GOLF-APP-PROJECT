import mongoose from 'mongoose';

const prizePoolSchema = new mongoose.Schema(
  {
    // Running jackpot amount (rolls over if no 5-match winner)
    jackpotAmount: { type: Number, default: 0 },

    // Current month pool accumulation
    currentMonthPool: { type: Number, default: 0 },

    // Per-subscriber contribution amount (calculated from plan price)
    monthlyContributionPerUser: { type: Number, default: 0 },

    // Total ever distributed
    totalDistributed: { type: Number, default: 0 },

    // Last updated
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PrizePool = mongoose.model('PrizePool', prizePoolSchema);
export default PrizePool;
