import Draw from '../models/Draw.js';
import User from '../models/User.js';
import { runDraw, simulateDraw, generateWinningNumbers } from '../utils/drawEngine.js';
import { sendEmail } from '../utils/email.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

// ─── USER: GET ALL DRAWS ──────────────────────────────────────────────────
// GET /api/draws
export const getDraws = async (req, res) => {
  try {
    const draws = await Draw.find({ status: { $in: ['published', 'completed'] } })
      .select('-winners.user') // don't expose other users
      .sort({ year: -1, month: -1 })
      .limit(12);

    res.status(200).json({ success: true, draws });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch draws.' });
  }
};

// ─── USER: GET UPCOMING DRAW ──────────────────────────────────────────────
// GET /api/draws/upcoming
export const getUpcomingDraw = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const draw = await Draw.findOne({
      $or: [
        { month, year },
        { status: 'upcoming' },
      ],
    }).sort({ year: 1, month: 1 });

    res.status(200).json({ success: true, draw });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming draw.' });
  }
};

// ─── USER: GET MY DRAW HISTORY ────────────────────────────────────────────
// GET /api/draws/my-history
export const getMyDrawHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('winnings')
      .populate({
        path: 'winnings.draw',
        select: 'month year title winningNumbers status publishedAt',
      });

    res.status(200).json({ success: true, winnings: user.winnings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch draw history.' });
  }
};

// ─── USER: UPLOAD WINNER PROOF ────────────────────────────────────────────
// POST /api/draws/proof/:winningId
export const uploadWinnerProof = async (req, res) => {
  const { winningId } = req.params;

  try {
    const user = await User.findById(req.user._id);
    const winning = user.winnings.id(winningId);

    if (!winning) {
      return res.status(404).json({ success: false, message: 'Winning record not found.' });
    }

    if (winning.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Proof already submitted.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a proof image.' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'golfdraw/proofs',
      resource_type: 'image',
    });

    winning.proofUrl = result.secure_url;
    winning.status = 'pending'; // stays pending until admin verifies
    await user.save();

    // Also update the draw winners array
    await Draw.updateOne(
      { 'winners.user': user._id, _id: winning.draw },
      { $set: { 'winners.$.proofUrl': result.secure_url } }
    );

    res.status(200).json({
      success: true,
      message: 'Proof uploaded successfully. Awaiting admin verification.',
      proofUrl: result.secure_url,
    });
  } catch (error) {
    console.error('Proof upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload proof.' });
  }
};

// ─── ADMIN: GET ALL DRAWS ─────────────────────────────────────────────────
// GET /api/draws/admin/all
export const adminGetAllDraws = async (req, res) => {
  try {
    const draws = await Draw.find()
      .sort({ year: -1, month: -1 })
      .populate('winners.user', 'name email');

    res.status(200).json({ success: true, draws });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch draws.' });
  }
};

// ─── ADMIN: CREATE DRAW ───────────────────────────────────────────────────
// POST /api/draws/admin/create
export const adminCreateDraw = async (req, res) => {
  const { month, year, drawLogic } = req.body;

  if (!month || !year || month < 1 || month > 12) {
    return res.status(400).json({ success: false, message: 'Valid month (1-12) and year required.' });
  }

  try {
    const existing = await Draw.findOne({ month, year });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Draw already exists for this month/year.' });
    }

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const draw = await Draw.create({
      month,
      year,
      title: `${monthNames[month - 1]} ${year} Draw`,
      status: 'upcoming',
      drawLogic: drawLogic || 'random',
    });

    res.status(201).json({ success: true, draw });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create draw.' });
  }
};

// ─── ADMIN: SIMULATE DRAW ─────────────────────────────────────────────────
// POST /api/draws/admin/simulate/:drawId
export const adminSimulateDraw = async (req, res) => {
  const { drawId } = req.params;
  const { logic } = req.body;

  try {
    const simulation = await simulateDraw(drawId, logic || 'random');
    res.status(200).json({ success: true, simulation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: RUN DRAW ──────────────────────────────────────────────────────
// POST /api/draws/admin/run/:drawId
export const adminRunDraw = async (req, res) => {
  const { drawId } = req.params;
  const { logic } = req.body;

  try {
    const draw = await runDraw(drawId, logic || 'random');
    res.status(200).json({
      success: true,
      message: `Draw completed. ${draw.winners.length} winner(s) found.`,
      draw,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: PUBLISH DRAW RESULTS ─────────────────────────────────────────
// PUT /api/draws/admin/publish/:drawId
export const adminPublishDraw = async (req, res) => {
  const { drawId } = req.params;

  try {
    const draw = await Draw.findByIdAndUpdate(
      drawId,
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );

    if (!draw) {
      return res.status(404).json({ success: false, message: 'Draw not found.' });
    }

    res.status(200).json({ success: true, message: 'Draw results published.', draw });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to publish draw.' });
  }
};

// ─── ADMIN: VERIFY WINNER ─────────────────────────────────────────────────
// PUT /api/draws/admin/verify-winner/:drawId/:winnerId
export const adminVerifyWinner = async (req, res) => {
  const { drawId, winnerId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be approve or reject.' });
  }

  try {
    const draw = await Draw.findById(drawId).populate('winners.user', 'name email');
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found.' });

    const winner = draw.winners.id(winnerId);
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found.' });

    winner.status = action === 'approve' ? 'verified' : 'rejected';
    winner.verifiedAt = new Date();
    await draw.save();

    // Update user winnings too
    await User.updateOne(
      { _id: winner.user._id, 'winnings.draw': drawId },
      { $set: { 'winnings.$.status': winner.status } }
    );

    // Notify winner
    if (action === 'approve') {
      try {
        await sendEmail({
          to: winner.user.email,
          template: 'winnerVerified',
          data: { name: winner.user.name, prizeAmount: winner.prizeAmount },
        });
      } catch (e) {
        console.error('Verification email failed:', e.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Winner ${action === 'approve' ? 'verified' : 'rejected'} successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify winner.' });
  }
};

// ─── ADMIN: MARK WINNER PAID ──────────────────────────────────────────────
// PUT /api/draws/admin/mark-paid/:drawId/:winnerId
export const adminMarkWinnerPaid = async (req, res) => {
  const { drawId, winnerId } = req.params;

  try {
    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found.' });

    const winner = draw.winners.id(winnerId);
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found.' });

    if (winner.status !== 'verified') {
      return res.status(400).json({ success: false, message: 'Winner must be verified before marking as paid.' });
    }

    winner.status = 'paid';
    winner.paidAt = new Date();
    await draw.save();

    await User.updateOne(
      { _id: winner.user, 'winnings.draw': drawId },
      { $set: { 'winnings.$.status': 'paid', 'winnings.$.paidAt': new Date() } }
    );

    res.status(200).json({ success: true, message: 'Winner marked as paid.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark winner as paid.' });
  }
};
