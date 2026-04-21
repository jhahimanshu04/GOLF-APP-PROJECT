import express from 'express';
import multer from 'multer';
import {
  getDraws,
  getUpcomingDraw,
  getMyDrawHistory,
  uploadWinnerProof,
  adminGetAllDraws,
  adminCreateDraw,
  adminSimulateDraw,
  adminRunDraw,
  adminPublishDraw,
  adminVerifyWinner,
  adminMarkWinnerPaid,
} from '../controllers/drawController.js';
import { protect, adminOnly, subscribedOnly } from '../middleware/auth.js';

const router = express.Router();

// Multer for proof uploads (memory storage → Cloudinary)
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'), false);
  },
});

// ── Public / User routes ──
router.get('/', protect, getDraws);
router.get('/upcoming', protect, getUpcomingDraw);
router.get('/my-history', protect, subscribedOnly, getMyDrawHistory);
router.post('/proof/:winningId', protect, subscribedOnly, upload.single('proof'), uploadWinnerProof);

// ── Admin routes ──
router.get('/admin/all', protect, adminOnly, adminGetAllDraws);
router.post('/admin/create', protect, adminOnly, adminCreateDraw);
router.post('/admin/simulate/:drawId', protect, adminOnly, adminSimulateDraw);
router.post('/admin/run/:drawId', protect, adminOnly, adminRunDraw);
router.put('/admin/publish/:drawId', protect, adminOnly, adminPublishDraw);
router.put('/admin/verify-winner/:drawId/:winnerId', protect, adminOnly, adminVerifyWinner);
router.put('/admin/mark-paid/:drawId/:winnerId', protect, adminOnly, adminMarkWinnerPaid);

export default router;
