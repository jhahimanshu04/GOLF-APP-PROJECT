import express from 'express';
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  handleWebhook,
} from '../controllers/stripeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ── Webhook (raw body — no auth middleware) ──
router.post('/webhook', handleWebhook);

// ── Protected subscription routes ──
router.post('/create-checkout', protect, createCheckoutSession);
router.post('/portal', protect, createPortalSession);
router.get('/subscription', protect, getSubscription);
router.post('/cancel', protect, cancelSubscription);
router.post('/resume', protect, resumeSubscription);

export default router;
