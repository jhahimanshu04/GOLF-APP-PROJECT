import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { startDrawScheduler, ensureUpcomingDraw } from './utils/scheduler.js';
import errorHandler from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import stripeRoutes from './routes/stripe.js';
import scoreRoutes from './routes/scores.js';
import drawRoutes from './routes/draws.js';
import charityRoutes from './routes/charities.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  ensureUpcomingDraw();
  startDrawScheduler();
});

const app = express();

// --- Middleware ---
app.use(cors({
  
   origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],

  credentials: true,
}));

// Raw body needed for Stripe webhooks (must be before express.json())
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'GolfDraw API is running 🏌️', env: process.env.NODE_ENV });
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
