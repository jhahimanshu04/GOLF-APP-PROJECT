import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// --- Protect: verify JWT ---
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// --- Admin only ---
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

// --- Subscribed users only ---
export const subscribedOnly = (req, res, next) => {
  if (!req.user.isSubscribed()) {
    return res.status(403).json({
      success: false,
      message: 'Active subscription required to access this feature.',
      code: 'SUBSCRIPTION_REQUIRED',
    });
  }
  next();
};
