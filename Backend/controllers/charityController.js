import Charity from '../models/Charity.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// ─── PUBLIC: GET ALL CHARITIES ────────────────────────────────────────────
// GET /api/charities
export const getCharities = async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;

    const charities = await Charity.find(filter)
      .select('-events')
      .sort({ isFeatured: -1, subscriberCount: -1 });

    res.status(200).json({ success: true, count: charities.length, charities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch charities.' });
  }
};

// ─── PUBLIC: GET SINGLE CHARITY ───────────────────────────────────────────
// GET /api/charities/:slug
export const getCharity = async (req, res) => {
  try {
    const charity = await Charity.findOne({
      $or: [{ slug: req.params.slug }, { _id: req.params.slug }],
      isActive: true,
    });

    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    res.status(200).json({ success: true, charity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch charity.' });
  }
};

// ─── PUBLIC: GET FEATURED CHARITIES ──────────────────────────────────────
// GET /api/charities/featured
export const getFeaturedCharities = async (req, res) => {
  try {
    const charities = await Charity.find({ isActive: true, isFeatured: true })
      .select('name slug shortDescription logo images totalContributions subscriberCount')
      .limit(4);

    res.status(200).json({ success: true, charities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured charities.' });
  }
};

// ─── USER: SELECT CHARITY ─────────────────────────────────────────────────
// PUT /api/charities/select
export const selectCharity = async (req, res) => {
  const { charityId, contributionPercent } = req.body;

  if (!charityId) {
    return res.status(400).json({ success: false, message: 'Charity ID is required.' });
  }

  const percent = parseInt(contributionPercent) || 10;
  if (percent < 10 || percent > 100) {
    return res.status(400).json({
      success: false,
      message: 'Contribution must be between 10% and 100%.',
    });
  }

  try {
    const charity = await Charity.findById(charityId);
    if (!charity || !charity.isActive) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    // Decrement old charity's subscriber count
    const user = await User.findById(req.user._id);
    if (user.selectedCharity && user.selectedCharity.toString() !== charityId) {
      await Charity.findByIdAndUpdate(user.selectedCharity, {
        $inc: { subscriberCount: -1 },
      });
    }

    // Update user
    user.selectedCharity = charityId;
    user.charityContributionPercent = percent;
    await user.save();

    // Increment new charity subscriber count
    if (!user.selectedCharity || user.selectedCharity.toString() !== charityId) {
      await Charity.findByIdAndUpdate(charityId, { $inc: { subscriberCount: 1 } });
    }

    res.status(200).json({
      success: true,
      message: `You are now supporting ${charity.name} with ${percent}% of your subscription.`,
      selectedCharity: charity,
      contributionPercent: percent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to select charity.' });
  }
};

// ─── USER: GET MY CHARITY ─────────────────────────────────────────────────
// GET /api/charities/my-charity
export const getMyCharity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('selectedCharity charityContributionPercent')
      .populate('selectedCharity');

    res.status(200).json({
      success: true,
      selectedCharity: user.selectedCharity,
      contributionPercent: user.charityContributionPercent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch charity.' });
  }
};

// ─── ADMIN: CREATE CHARITY ────────────────────────────────────────────────
// POST /api/charities/admin
export const adminCreateCharity = async (req, res) => {
  const { name, description, shortDescription, website, category, tags, isFeatured } = req.body;

  if (!name || !description) {
    return res.status(400).json({ success: false, message: 'Name and description are required.' });
  }

  try {
    let logo = null;
    let images = [];

    // Upload logo if provided
    if (req.files?.logo?.[0]) {
      const result = await cloudinary.uploader.upload(req.files.logo[0].path, {
        folder: 'golfdraw/charities/logos',
      });
      logo = result.secure_url;
    }

    // Upload images if provided
    if (req.files?.images) {
      for (const file of req.files.images) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'golfdraw/charities/images',
        });
        images.push(result.secure_url);
      }
    }

    const charity = await Charity.create({
      name,
      description,
      shortDescription,
      website,
      category: category || 'other',
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      isFeatured: isFeatured === 'true',
      logo,
      images,
    });

    res.status(201).json({ success: true, charity });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A charity with this name already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create charity.' });
  }
};

// ─── ADMIN: UPDATE CHARITY ────────────────────────────────────────────────
// PUT /api/charities/admin/:id
export const adminUpdateCharity = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.files?.logo?.[0]) {
      const result = await cloudinary.uploader.upload(req.files.logo[0].path, {
        folder: 'golfdraw/charities/logos',
      });
      updates.logo = result.secure_url;
    }

    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t) => t.trim());
    }

    const charity = await Charity.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    res.status(200).json({ success: true, charity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update charity.' });
  }
};

// ─── ADMIN: DELETE CHARITY ────────────────────────────────────────────────
// DELETE /api/charities/admin/:id
export const adminDeleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    // Soft delete — don't remove, just deactivate
    charity.isActive = false;
    await charity.save();

    // Unset from users who had this charity selected
    await User.updateMany(
      { selectedCharity: req.params.id },
      { $unset: { selectedCharity: '' }, charityContributionPercent: 10 }
    );

    res.status(200).json({ success: true, message: 'Charity deactivated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete charity.' });
  }
};

// ─── ADMIN: ADD EVENT TO CHARITY ──────────────────────────────────────────
// POST /api/charities/admin/:id/events
export const adminAddEvent = async (req, res) => {
  const { title, description, date, location } = req.body;

  if (!title || !date) {
    return res.status(400).json({ success: false, message: 'Title and date are required.' });
  }

  try {
    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'golfdraw/charities/events',
      });
      imageUrl = result.secure_url;
    }

    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          events: { title, description, date: new Date(date), location, imageUrl },
        },
      },
      { new: true }
    );

    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    res.status(201).json({ success: true, charity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add event.' });
  }
};

// ─── ADMIN: GET ALL CHARITIES (including inactive) ────────────────────────
// GET /api/charities/admin/all
export const adminGetAll = async (req, res) => {
  try {
    const charities = await Charity.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, charities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch charities.' });
  }
};

// ─── ADMIN: GET CHARITY STATS ─────────────────────────────────────────────
// GET /api/charities/admin/stats
export const adminGetStats = async (req, res) => {
  try {
    const totalCharities = await Charity.countDocuments({ isActive: true });
    const totalSubscribers = await User.countDocuments({ selectedCharity: { $exists: true, $ne: null } });

    const topCharities = await Charity.find({ isActive: true })
      .sort({ subscriberCount: -1 })
      .limit(5)
      .select('name subscriberCount totalContributions');

    res.status(200).json({
      success: true,
      stats: { totalCharities, totalSubscribers, topCharities },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};
