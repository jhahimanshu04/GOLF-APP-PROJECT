import User from '../models/User.js';
import Draw from '../models/Draw.js';
import Charity from '../models/Charity.js';
import PrizePool from '../models/PrizePool.js';

// ─── ANALYTICS OVERVIEW ───────────────────────────────────────────────────
// GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeSubscribers,
      cancelledSubs,
      pastDueSubs,
      totalDraws,
      completedDraws,
      totalCharities,
      prizePool,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 'subscription.status': 'active' }),
      User.countDocuments({ 'subscription.status': 'cancelled' }),
      User.countDocuments({ 'subscription.status': 'past_due' }),
      Draw.countDocuments(),
      Draw.countDocuments({ status: 'completed' }),
      Charity.countDocuments({ isActive: true }),
      PrizePool.findOne(),
    ]);

    // Revenue estimate
    const monthlyRevenue = activeSubscribers * 9.99;

    // Recent signups (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    // Monthly signups (last 12 months)
    const monthlySignups = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    // Total prize pool distributed
    const totalDistributed = prizePool?.totalDistributed || 0;

    // Winners count
    const winnersCount = await Draw.aggregate([
      { $unwind: '$winners' },
      { $count: 'total' },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          active: activeSubscribers,
          cancelled: cancelledSubs,
          pastDue: pastDueSubs,
          recentSignups,
          monthlySignups,
        },
        revenue: {
          monthlyEstimate: monthlyRevenue.toFixed(2),
          currentPool: prizePool?.currentMonthPool?.toFixed(2) || '0.00',
          jackpot: prizePool?.jackpotAmount?.toFixed(2) || '0.00',
          totalDistributed: totalDistributed.toFixed(2),
        },
        draws: {
          total: totalDraws,
          completed: completedDraws,
          totalWinners: winnersCount[0]?.total || 0,
        },
        charities: {
          total: totalCharities,
        },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
};

// ─── GET ALL USERS ────────────────────────────────────────────────────────
// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter['subscription.status'] = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .populate('selectedCharity', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// ─── GET SINGLE USER ──────────────────────────────────────────────────────
// GET /api/admin/users/:id
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('selectedCharity', 'name logo')
      .populate('drawsEntered', 'month year title status');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
};

// ─── UPDATE USER ──────────────────────────────────────────────────────────
// PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  const { name, email, role } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (email) updates.email = email;
  if (role && ['user', 'admin'].includes(role)) updates.role = role;

  try {
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

// ─── EDIT USER SCORES (admin can fix mistakes) ────────────────────────────
// PUT /api/admin/users/:id/scores
export const editUserScores = async (req, res) => {
  const { scores } = req.body; // array of { value, date }

  if (!Array.isArray(scores) || scores.length > 5) {
    return res.status(400).json({ success: false, message: 'Scores must be an array of max 5 items.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Validate each score
    for (const s of scores) {
      if (!s.value || s.value < 1 || s.value > 45) {
        return res.status(400).json({ success: false, message: `Invalid score value: ${s.value}` });
      }
    }

    user.scores = scores.map((s) => ({
      value: parseInt(s.value),
      date: new Date(s.date),
      enteredAt: new Date(),
    }));

    await user.save();
    res.status(200).json({ success: true, message: 'Scores updated.', scores: user.scores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update scores.' });
  }
};

// ─── CANCEL USER SUBSCRIPTION (admin) ────────────────────────────────────
// PUT /api/admin/users/:id/cancel-subscription
export const adminCancelSubscription = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 'subscription.status': 'cancelled' },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'Subscription cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel subscription.' });
  }
};

// ─── DELETE USER (soft) ───────────────────────────────────────────────────
// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Don't allow deleting admins
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};
