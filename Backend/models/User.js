import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: null,
    },

    // --- Subscription ---
    subscription: {
      stripeCustomerId: { type: String, default: null },
      stripeSubscriptionId: { type: String, default: null },
      plan: { type: String, enum: ['monthly', 'yearly', null], default: null },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
        default: 'inactive',
      },
      currentPeriodEnd: { type: Date, default: null },
      cancelAtPeriodEnd: { type: Boolean, default: false },
    },

    // --- Charity ---
    selectedCharity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charity',
      default: null,
    },
    charityContributionPercent: {
      type: Number,
      default: 10, // minimum 10%
      min: [10, 'Minimum charity contribution is 10%'],
      max: [100, 'Cannot exceed 100%'],
    },

    // --- Golf Scores (max 5, rolling) ---
    scores: [
      {
        value: {
          type: Number,
          required: true,
          min: [1, 'Score must be at least 1'],
          max: [45, 'Score cannot exceed 45'],
        },
        date: {
          type: Date,
          required: true,
        },
        enteredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // --- Draw Participation ---
    drawsEntered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Draw',
      },
    ],

    // --- Winner Info ---
    winnings: [
      {
        draw: { type: mongoose.Schema.Types.ObjectId, ref: 'Draw' },
        matchType: { type: String, enum: ['3-match', '4-match', '5-match'] },
        amount: { type: Number },
        status: {
          type: String,
          enum: ['pending', 'verified', 'paid', 'rejected'],
          default: 'pending',
        },
        proofUrl: { type: String, default: null },
        paidAt: { type: Date, default: null },
      },
    ],

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// --- Hash password before save ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Compare password method ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// --- Check if subscription is active ---
userSchema.methods.isSubscribed = function () {
  return (
    this.subscription.status === 'active' &&
    this.subscription.currentPeriodEnd > new Date()
  );
};

// --- Add score with rolling logic ---
userSchema.methods.addScore = function (value, date) {
  const scoreDate = new Date(date);
  scoreDate.setHours(0, 0, 0, 0);

  // Check for duplicate date
  const duplicate = this.scores.find((s) => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === scoreDate.getTime();
  });

  if (duplicate) {
    throw new Error('A score already exists for this date. Edit or delete it instead.');
  }

  // Sort by date descending, keep latest 5
  this.scores.push({ value, date: scoreDate });
  this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (this.scores.length > 5) {
    this.scores = this.scores.slice(0, 5);
  }
};

const User = mongoose.model('User', userSchema);
export default User;
