import User from '../models/User.js';
import Draw from '../models/Draw.js';
import PrizePool from '../models/PrizePool.js';
import { sendEmail } from './email.js';

// ─── GENERATE WINNING NUMBERS ─────────────────────────────────────────────
// Random mode: picks 5 unique numbers from 1-45
// Weighted mode: numbers more likely to appear if they appear more in user scores

export const generateWinningNumbers = async (logic = 'random') => {
  if (logic === 'random') {
    return generateRandom();
  } else {
    return generateWeighted();
  }
};

const generateRandom = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const generateWeighted = async () => {
  // Build frequency map from all active subscribers' scores
  const users = await User.find({
    'subscription.status': 'active',
    'scores.0': { $exists: true },
  }).select('scores');

  const frequency = {};
  for (let i = 1; i <= 45; i++) frequency[i] = 1; // base weight of 1 for all

  users.forEach((user) => {
    user.scores.forEach((score) => {
      if (score.value >= 1 && score.value <= 45) {
        frequency[score.value] = (frequency[score.value] || 1) + 2; // extra weight
      }
    });
  });

  // Weighted random selection (no duplicates)
  const selected = new Set();
  const pool = [];

  // Build weighted pool
  for (let num = 1; num <= 45; num++) {
    for (let w = 0; w < frequency[num]; w++) {
      pool.push(num);
    }
  }

  while (selected.size < 5) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.add(pool[idx]);
  }

  return Array.from(selected).sort((a, b) => a - b);
};

// ─── MATCH NUMBERS ────────────────────────────────────────────────────────
// Compare user's scores to winning numbers
// Returns how many score values appear in winning numbers

export const getMatchCount = (userScores, winningNumbers) => {
  const scoreValues = userScores.map((s) => s.value);
  const winSet = new Set(winningNumbers);
  const matched = scoreValues.filter((v) => winSet.has(v));
  return { count: matched.length, matched };
};

// ─── RUN DRAW ─────────────────────────────────────────────────────────────
export const runDraw = async (drawId, logic = 'random') => {
  const draw = await Draw.findById(drawId);
  if (!draw) throw new Error('Draw not found.');
  if (draw.status === 'completed') throw new Error('Draw already completed.');

  // Generate winning numbers
  const winningNumbers = await generateWinningNumbers(logic);
  draw.winningNumbers = winningNumbers;
  draw.drawLogic = logic;
  draw.runAt = new Date();

  // Get all active subscribers with scores
  const subscribers = await User.find({
    'subscription.status': 'active',
    'scores.0': { $exists: true },
  }).select('scores email name');

  draw.participantCount = subscribers.length;

  // Prize pool calculation
  const pool = await PrizePool.findOne({});
  const totalPool = (pool?.currentMonthPool || 0) + (draw.jackpotRollover || 0);

  draw.prizePool = {
    total: totalPool,
    fiveMatch: parseFloat((totalPool * 0.4).toFixed(2)),
    fourMatch: parseFloat((totalPool * 0.35).toFixed(2)),
    threeMatch: parseFloat((totalPool * 0.25).toFixed(2)),
  };

  // Find winners
  const winnersByTier = { '5-match': [], '4-match': [], '3-match': [] };

  subscribers.forEach((user) => {
    const { count, matched } = getMatchCount(user.scores, winningNumbers);
    if (count >= 3) {
      const tier = `${count}-match`;
      if (winnersByTier[tier]) {
        winnersByTier[tier].push({ user, matched });
      }
    }
  });

  // Calculate prize per winner per tier (split equally)
  draw.winners = [];
  let jackpotWon = false;

  for (const [tier, winners] of Object.entries(winnersByTier)) {
    if (winners.length === 0) continue;

    const poolKey = tier === '5-match' ? 'fiveMatch' : tier === '4-match' ? 'fourMatch' : 'threeMatch';
    const tierPool = draw.prizePool[poolKey];
    const prizePerWinner = parseFloat((tierPool / winners.length).toFixed(2));

    if (tier === '5-match') jackpotWon = true;

    winners.forEach(({ user, matched }) => {
      draw.winners.push({
        user: user._id,
        matchType: tier,
        matchedNumbers: matched,
        prizeAmount: prizePerWinner,
        status: 'pending',
      });
    });
  }

  // Jackpot rollover logic
  draw.jackpotWon = jackpotWon;
  if (!jackpotWon) {
    // Jackpot rolls to next month
    const nextDraw = await getOrCreateNextDraw(draw.month, draw.year);
    if (nextDraw) {
      nextDraw.jackpotRollover = (nextDraw.jackpotRollover || 0) + draw.prizePool.fiveMatch;
      await nextDraw.save();
    }
  }

  draw.status = 'completed';
  draw.publishedAt = new Date();
  await draw.save();

  // Reset prize pool for next month
  if (pool) {
    pool.currentMonthPool = 0;
    pool.totalDistributed += totalPool;
    pool.lastUpdated = new Date();
    await pool.save();
  }

  // Notify all participants
  await notifyDrawResults(draw, subscribers);

  return draw;
};

// ─── SIMULATE DRAW ────────────────────────────────────────────────────────
// Runs draw logic WITHOUT saving results — for admin preview
export const simulateDraw = async (drawId, logic = 'random') => {
  const draw = await Draw.findById(drawId);
  if (!draw) throw new Error('Draw not found.');

  const winningNumbers = await generateWinningNumbers(logic);

  const subscribers = await User.find({
    'subscription.status': 'active',
    'scores.0': { $exists: true },
  }).select('scores name');

  const simulation = {
    winningNumbers,
    participantCount: subscribers.length,
    winners: { '5-match': 0, '4-match': 0, '3-match': 0 },
    sampleWinners: [],
  };

  subscribers.forEach((user) => {
    const { count } = getMatchCount(user.scores, winningNumbers);
    if (count >= 3) {
      simulation.winners[`${count}-match`]++;
      if (simulation.sampleWinners.length < 5) {
        simulation.sampleWinners.push({ name: user.name, matchCount: count });
      }
    }
  });

  return simulation;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────
const getOrCreateNextDraw = async (currentMonth, currentYear) => {
  let nextMonth = currentMonth + 1;
  let nextYear = currentYear;
  if (nextMonth > 12) { nextMonth = 1; nextYear++; }

  return await Draw.findOneAndUpdate(
    { month: nextMonth, year: nextYear },
    { $setOnInsert: { month: nextMonth, year: nextYear, status: 'upcoming', title: `${getMonthName(nextMonth)} ${nextYear} Draw` } },
    { upsert: true, new: true }
  );
};

const getMonthName = (month) => {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month - 1];
};

const notifyDrawResults = async (draw, subscribers) => {
  const winnerIds = new Set(draw.winners.map((w) => w.user.toString()));
  const monthName = getMonthName(draw.month);

  const notifications = subscribers.map(async (user) => {
    const isWinner = winnerIds.has(user._id.toString());
    const winnerInfo = draw.winners.find((w) => w.user.toString() === user._id.toString());

    try {
      await sendEmail({
        to: user.email,
        template: 'drawResults',
        data: {
          name: user.name,
          month: monthName,
          year: draw.year,
          isWinner,
          matchType: winnerInfo?.matchType,
          prizeAmount: winnerInfo?.prizeAmount,
        },
      });
    } catch (err) {
      console.error(`Failed to notify ${user.email}:`, err.message);
    }
  });

  await Promise.allSettled(notifications);
};
