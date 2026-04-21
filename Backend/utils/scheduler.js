import cron from 'node-cron';
import Draw from '../models/Draw.js';
import { runDraw } from './drawEngine.js';

// ─── MONTHLY DRAW SCHEDULER ───────────────────────────────────────────────
// Runs on the 1st of every month at midnight UTC
// Cron syntax: '0 0 1 * *' = minute 0, hour 0, day 1, every month, every weekday

export const startDrawScheduler = () => {
  console.log('🕐 Draw scheduler started — runs on 1st of each month at midnight UTC');

  cron.schedule('0 0 1 * *', async () => {
    console.log('⏰ Monthly draw cron triggered:', new Date().toISOString());
    await runScheduledDraw();
  });
};

const runScheduledDraw = async () => {
  try {
    const now = new Date();
    // We want the draw for the PREVIOUS month (draws close at end of month)
    const drawMonth = now.getMonth() === 0 ? 12 : now.getMonth(); // getMonth() is 0-indexed
    const drawYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    // Find the draw for this month
    let draw = await Draw.findOne({ month: drawMonth, year: drawYear });

    if (!draw) {
      // Auto-create if it doesn't exist
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      draw = await Draw.create({
        month: drawMonth,
        year: drawYear,
        title: `${monthNames[drawMonth - 1]} ${drawYear} Draw`,
        status: 'upcoming',
      });
    }

    if (draw.status === 'completed') {
      console.log(`Draw for ${drawMonth}/${drawYear} already completed. Skipping.`);
      return;
    }

    console.log(`🎰 Running draw for ${drawMonth}/${drawYear}...`);
    const result = await runDraw(draw._id, 'random');
    console.log(`✅ Draw completed. ${result.winners.length} winner(s). Jackpot won: ${result.jackpotWon}`);
  } catch (error) {
    console.error('❌ Scheduled draw failed:', error.message);
  }
};

// ─── ENSURE NEXT DRAW EXISTS ──────────────────────────────────────────────
// Called on server start to make sure there's always an upcoming draw ready
export const ensureUpcomingDraw = async () => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() is 0-indexed
    const year = now.getFullYear();

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const existing = await Draw.findOne({ month, year });
    if (!existing) {
      await Draw.create({
        month,
        year,
        title: `${monthNames[month - 1]} ${year} Draw`,
        status: 'upcoming',
      });
      console.log(`📅 Created upcoming draw for ${monthNames[month - 1]} ${year}`);
    }
  } catch (error) {
    console.error('Failed to ensure upcoming draw:', error.message);
  }
};
