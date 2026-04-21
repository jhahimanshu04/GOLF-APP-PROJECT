import User from '../models/User.js';

// ─── GET ALL SCORES ───────────────────────────────────────────────────────
// GET /api/scores
export const getScores = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('scores');

    // Sort by date descending (most recent first)
    const scores = user.scores.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.status(200).json({ success: true, count: scores.length, scores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch scores.' });
  }
};

// ─── ADD SCORE ────────────────────────────────────────────────────────────
// POST /api/scores
export const addScore = async (req, res) => {
  const { value, date } = req.body;

  // Validate value
  if (!value || value < 1 || value > 45) {
    return res.status(400).json({
      success: false,
      message: 'Score must be between 1 and 45 (Stableford format).',
    });
  }

  // Validate date
  if (!date) {
    return res.status(400).json({ success: false, message: 'Date is required.' });
  }

  const scoreDate = new Date(date);
  if (isNaN(scoreDate.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid date format.' });
  }

  // Don't allow future dates
  if (scoreDate > new Date()) {
    return res.status(400).json({ success: false, message: 'Score date cannot be in the future.' });
  }

  try {
    const user = await User.findById(req.user._id);

    // Check for duplicate date
    const normalizedDate = new Date(scoreDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const duplicate = user.scores.find((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === normalizedDate.getTime();
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'A score already exists for this date. Edit or delete it instead.',
      });
    }

    // Add new score
    user.scores.push({ value: parseInt(value), date: normalizedDate });

    // Sort by date descending and keep only latest 5 (rolling logic)
    user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (user.scores.length > 5) {
      user.scores = user.scores.slice(0, 5);
    }

    await user.save();

    const scores = user.scores.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.status(201).json({
      success: true,
      message: 'Score added successfully.',
      scores,
    });
  } catch (error) {
    console.error('Add score error:', error);
    res.status(500).json({ success: false, message: 'Failed to add score.' });
  }
};

// ─── UPDATE SCORE ─────────────────────────────────────────────────────────
// PUT /api/scores/:scoreId
export const updateScore = async (req, res) => {
  const { scoreId } = req.params;
  const { value, date } = req.body;

  if (value && (value < 1 || value > 45)) {
    return res.status(400).json({
      success: false,
      message: 'Score must be between 1 and 45.',
    });
  }

  try {
    const user = await User.findById(req.user._id);
    const scoreIndex = user.scores.findIndex(
      (s) => s._id.toString() === scoreId
    );

    if (scoreIndex === -1) {
      return res.status(404).json({ success: false, message: 'Score not found.' });
    }

    // If updating the date, check for duplicate
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);

      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format.' });
      }
      if (newDate > new Date()) {
        return res.status(400).json({ success: false, message: 'Date cannot be in the future.' });
      }

      const duplicate = user.scores.find((s, i) => {
        if (i === scoreIndex) return false; // skip current score
        const d = new Date(s.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === newDate.getTime();
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'A score already exists for this date.',
        });
      }

      user.scores[scoreIndex].date = newDate;
    }

    if (value) {
      user.scores[scoreIndex].value = parseInt(value);
    }

    await user.save();

    const scores = user.scores.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.status(200).json({
      success: true,
      message: 'Score updated successfully.',
      scores,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update score.' });
  }
};

// ─── DELETE SCORE ─────────────────────────────────────────────────────────
// DELETE /api/scores/:scoreId
export const deleteScore = async (req, res) => {
  const { scoreId } = req.params;

  try {
    const user = await User.findById(req.user._id);
    const scoreIndex = user.scores.findIndex(
      (s) => s._id.toString() === scoreId
    );

    if (scoreIndex === -1) {
      return res.status(404).json({ success: false, message: 'Score not found.' });
    }

    user.scores.splice(scoreIndex, 1);
    await user.save();

    const scores = user.scores.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.status(200).json({
      success: true,
      message: 'Score deleted successfully.',
      scores,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete score.' });
  }
};

// ─── GET SCORE STATS ──────────────────────────────────────────────────────
// GET /api/scores/stats
export const getScoreStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('scores');

    if (!user.scores.length) {
      return res.status(200).json({
        success: true,
        stats: { count: 0, average: 0, highest: 0, lowest: 0, trend: 'neutral' },
      });
    }

    const values = user.scores.map((s) => s.value);
    const average = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);

    // Simple trend: compare latest score to average
    const sorted = [...user.scores].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const latest = sorted[0]?.value;
    const trend =
      latest > average ? 'up' : latest < average ? 'down' : 'neutral';

    res.status(200).json({
      success: true,
      stats: {
        count: user.scores.length,
        average: parseFloat(average),
        highest,
        lowest,
        trend,
        latest,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};
