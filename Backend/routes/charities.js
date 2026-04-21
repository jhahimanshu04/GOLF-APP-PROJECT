import express from 'express';
import multer from 'multer';
import {
  getCharities,
  getCharity,
  getFeaturedCharities,
  selectCharity,
  getMyCharity,
  adminCreateCharity,
  adminUpdateCharity,
  adminDeleteCharity,
  adminAddEvent,
  adminGetAll,
  adminGetStats,
} from '../controllers/charityController.js';
import { protect, adminOnly, subscribedOnly } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed.'), false);
  },
});

const multiUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

// ── Public routes ──
router.get('/', getCharities);
router.get('/featured', getFeaturedCharities);
router.get('/:slug', getCharity);

// ── User routes (login required) ──
router.get('/user/my-charity', protect, getMyCharity);
router.put('/user/select', protect, subscribedOnly, selectCharity);

// ── Admin routes ──
router.get('/admin/all', protect, adminOnly, adminGetAll);
router.get('/admin/stats', protect, adminOnly, adminGetStats);
router.post('/admin', protect, adminOnly, multiUpload, adminCreateCharity);
router.put('/admin/:id', protect, adminOnly, multiUpload, adminUpdateCharity);
router.delete('/admin/:id', protect, adminOnly, adminDeleteCharity);
router.post('/admin/:id/events', protect, adminOnly, upload.single('image'), adminAddEvent);

export default router;
