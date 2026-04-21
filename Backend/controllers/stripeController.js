import Stripe from 'stripe';
import User from '../models/User.js';
import PrizePool from '../models/PrizePool.js';
import { sendEmail } from '../utils/email.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─── CREATE CHECKOUT SESSION ───────────────────────────────────────────────
// POST /api/stripe/create-checkout
export const createCheckoutSession = async (req, res) => {
  const { plan } = req.body; // 'monthly' or 'yearly'

  if (!['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ success: false, message: 'Invalid plan. Choose monthly or yearly.' });
  }

  const priceId =
    plan === 'monthly'
      ? process.env.STRIPE_MONTHLY_PRICE_ID
      : process.env.STRIPE_YEARLY_PRICE_ID;

  try {
    const user = req.user;

    // Create or retrieve Stripe customer
    let customerId = user.subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;

      await User.findByIdAndUpdate(user._id, {
        'subscription.stripeCustomerId': customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?subscription=cancelled`,
      metadata: {
        userId: user._id.toString(),
        plan,
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          plan,
        },
      },
      allow_promotion_codes: true,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create checkout session.' });
  }
};

// ─── CREATE BILLING PORTAL SESSION ────────────────────────────────────────
// POST /api/stripe/portal
export const createPortalSession = async (req, res) => {
  const user = req.user;

  if (!user.subscription.stripeCustomerId) {
    return res.status(400).json({ success: false, message: 'No billing account found.' });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard/settings`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ success: false, message: 'Failed to open billing portal.' });
  }
};

// ─── GET SUBSCRIPTION STATUS ──────────────────────────────────────────────
// GET /api/stripe/subscription
export const getSubscription = async (req, res) => {
  const user = req.user;

  try {
    let stripeSubscription = null;

    if (user.subscription.stripeSubscriptionId) {
      stripeSubscription = await stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId
      );
    }

    res.status(200).json({
      success: true,
      subscription: {
        ...user.subscription.toObject(),
        stripeDetails: stripeSubscription
          ? {
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
              status: stripeSubscription.status,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscription.' });
  }
};

// ─── CANCEL SUBSCRIPTION ──────────────────────────────────────────────────
// POST /api/stripe/cancel
export const cancelSubscription = async (req, res) => {
  const user = req.user;

  if (!user.subscription.stripeSubscriptionId) {
    return res.status(400).json({ success: false, message: 'No active subscription found.' });
  }

  try {
    // Cancel at period end (user keeps access until billing period ends)
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await User.findByIdAndUpdate(user._id, {
      'subscription.cancelAtPeriodEnd': true,
    });

    res.status(200).json({
      success: true,
      message: 'Subscription will cancel at the end of the current billing period.',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel subscription.' });
  }
};

// ─── RESUME SUBSCRIPTION ──────────────────────────────────────────────────
// POST /api/stripe/resume
export const resumeSubscription = async (req, res) => {
  const user = req.user;

  if (!user.subscription.stripeSubscriptionId) {
    return res.status(400).json({ success: false, message: 'No subscription found.' });
  }

  try {
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await User.findByIdAndUpdate(user._id, {
      'subscription.cancelAtPeriodEnd': false,
    });

    res.status(200).json({ success: true, message: 'Subscription resumed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resume subscription.' });
  }
};

// ─── STRIPE WEBHOOK ───────────────────────────────────────────────────────
// POST /api/stripe/webhook
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {

      // ── Checkout completed ──────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;

        const userId = session.metadata.userId;
        const plan = session.metadata.plan;
        const subscriptionId = session.subscription;

        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

        await User.findByIdAndUpdate(userId, {
          'subscription.stripeSubscriptionId': subscriptionId,
          'subscription.plan': plan,
          'subscription.status': 'active',
          'subscription.currentPeriodEnd': new Date(stripeSub.current_period_end * 1000),
          'subscription.cancelAtPeriodEnd': false,
        });

        // Update prize pool
        await updatePrizePool('add', plan);

        const user = await User.findById(userId);
        if (user) {
          await sendEmail({
            to: user.email,
            subject: '🎉 Subscription Activated!',
            template: 'subscriptionActivated',
            data: { name: user.name, plan },
          });
        }

        console.log(`✅ Subscription activated for user ${userId}`);
        break;
      }

      // ── Subscription updated ────────────────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const userId = sub.metadata.userId;

        if (!userId) break;

        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': sub.id },
          {
            'subscription.status': sub.status,
            'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
            'subscription.cancelAtPeriodEnd': sub.cancel_at_period_end,
          }
        );

        console.log(`🔄 Subscription updated: ${sub.id}`);
        break;
      }

      // ── Subscription deleted/cancelled ──────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object;

        const user = await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': sub.id },
          {
            'subscription.status': 'cancelled',
            'subscription.cancelAtPeriodEnd': false,
          },
          { new: true }
        );

        if (user) {
          await updatePrizePool('remove', user.subscription.plan);
          await sendEmail({
            to: user.email,
            subject: 'Your GolfDraw subscription has ended',
            template: 'subscriptionCancelled',
            data: { name: user.name },
          });
        }

        console.log(`❌ Subscription cancelled: ${sub.id}`);
        break;
      }

      // ── Payment succeeded ───────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.billing_reason === 'subscription_cycle') {
          // Renewal — update period end
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          await User.findOneAndUpdate(
            { 'subscription.stripeSubscriptionId': invoice.subscription },
            {
              'subscription.status': 'active',
              'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
            }
          );
          console.log(`💳 Renewal payment succeeded: ${invoice.subscription}`);
        }
        break;
      }

      // ── Payment failed ──────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        const user = await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': invoice.subscription },
          { 'subscription.status': 'past_due' },
          { new: true }
        );

        if (user) {
          await sendEmail({
            to: user.email,
            subject: '⚠️ Payment failed — action required',
            template: 'paymentFailed',
            data: { name: user.name },
          });
        }

        console.log(`❌ Payment failed: ${invoice.subscription}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook processing failed.' });
  }
};

// ─── HELPER: Update prize pool on sub change ──────────────────────────────
const updatePrizePool = async (action, plan) => {
  try {
    // Define how much of each plan goes to prize pool
    // Example: Monthly = £9.99, Yearly = £99.99/12 = £8.33/mo
    const monthlyContribution = plan === 'monthly' ? 4.0 : 3.5; // £ per month to prize pool

    const modifier = action === 'add' ? monthlyContribution : -monthlyContribution;

    await PrizePool.findOneAndUpdate(
      {},
      {
        $inc: { currentMonthPool: modifier },
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Prize pool update error:', err.message);
  }
};
