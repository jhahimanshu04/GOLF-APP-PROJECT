import express from 'express';
import {
  getAnalytics,
  getUsers,
  getUser,
  updateUser,
  editUserScores,
  adminCancelSubscription,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require login + admin role
router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/scores', editUserScores);
router.put('/users/:id/cancel-subscription', adminCancelSubscription);
router.delete('/users/:id', deleteUser);

export default router;
