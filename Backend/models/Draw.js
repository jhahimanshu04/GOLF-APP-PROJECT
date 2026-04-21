import mongoose from 'mongoose';

const drawSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    title: { type: String }, // e.g. "June 2026 Draw"

    status: {
      type: String,
      enum: ['upcoming', 'simulation', 'published', 'completed'],
      default: 'upcoming',
    },

    drawLogic: {
      type: String,
      enum: ['random', 'weighted'],
      default: 'random',
    },

    // The 5 winning numbers drawn
    winningNumbers: {
      type: [Number],
      default: [],
      validate: {
        validator: (arr) => arr.length === 0 || arr.length === 5,
        message: 'Must have exactly 0 or 5 winning numbers',
      },
    },

    // Prize pool for this draw
    prizePool: {
      total: { type: Number, default: 0 },
      fiveMatch: { type: Number, default: 0 },  // 40%
      fourMatch: { type: Number, default: 0 },   // 35%
      threeMatch: { type: Number, default: 0 },  // 25%
    },

    // Jackpot rollover from previous draw
    jackpotRollover: { type: Number, default: 0 },

    // Participants snapshot at draw time
    participantCount: { type: Number, default: 0 },

    // Winners
    winners: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        matchType: { type: String, enum: ['3-match', '4-match', '5-match'] },
        matchedNumbers: [Number],
        prizeAmount: { type: Number },
        status: {
          type: String,
          enum: ['pending', 'verified', 'paid', 'rejected'],
          default: 'pending',
        },
        proofUrl: { type: String, default: null },
        verifiedAt: { type: Date, default: null },
        paidAt: { type: Date, default: null },
      },
    ],

    // If no 5-match winner, jackpot rolls to next draw
    jackpotWon: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    runAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound index to ensure one draw per month/year
drawSchema.index({ month: 1, year: 1 }, { unique: true });

const Draw = mongoose.model('Draw', drawSchema);
export default Draw;
