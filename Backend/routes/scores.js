import express from 'express';
import {
  getScores,
  addScore,
  updateScore,
  deleteScore,
  getScoreStats,
} from '../controllers/scoreController.js';
import { protect, subscribedOnly } from '../middleware/auth.js';

const router = express.Router();

// All score routes require login + active subscription
router.use(protect, subscribedOnly);

router.get('/', getScores);
router.get('/stats', getScoreStats);
router.post('/', addScore);
router.put('/:scoreId', updateScore);
router.delete('/:scoreId', deleteScore);

export default router;
