import nodemailer from 'nodemailer';

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

const base = (content) => `
  <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#1a3c5e;padding:32px 40px;">
      <h1 style="color:#fff;margin:0;font-size:24px;">GolfDraw 🏌️</h1>
    </div>
    <div style="padding:32px 40px;">${content}</div>
    <div style="padding:16px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 GolfDraw. All rights reserved.</p>
    </div>
  </div>
`;

const btn = (href, text, color = '#1a3c5e') =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px;">${text}</a>`;

const templates = {
  welcome: ({ name }) => ({
    subject: 'Welcome to GolfDraw! 🏌️',
    html: base(`
      <h2 style="color:#1a3c5e;margin-top:0;">Welcome, ${name}!</h2>
      <p style="color:#475569;">You've joined GolfDraw — where golf scores win prizes and support charity.</p>
      <ul style="color:#475569;"><li>Choose a plan</li><li>Select your charity</li><li>Enter your scores</li></ul>
      ${btn(`${process.env.CLIENT_URL}/pricing`, 'Get Started')}
    `),
  }),

  subscriptionActivated: ({ name, plan }) => ({
    subject: '🎉 Your subscription is active!',
    html: base(`
      <h2 style="color:#1a3c5e;margin-top:0;">You're in, ${name}!</h2>
      <p style="color:#475569;">Your <strong>${plan}</strong> subscription is active. You're entered into the next monthly draw.</p>
      ${btn(`${process.env.CLIENT_URL}/dashboard`, 'Go to Dashboard', '#f59e0b')}
    `),
  }),

  subscriptionCancelled: ({ name }) => ({
    subject: 'Your GolfDraw subscription has ended',
    html: base(`
      <h2 style="color:#1a3c5e;margin-top:0;">We'll miss you, ${name}</h2>
      <p style="color:#475569;">Your subscription has ended. Resubscribe anytime to get back in the draw.</p>
      ${btn(`${process.env.CLIENT_URL}/pricing`, 'Resubscribe')}
    `),
  }),

  paymentFailed: ({ name }) => ({
    subject: '⚠️ Payment failed — action required',
    html: base(`
      <h2 style="color:#dc2626;margin-top:0;">Payment Failed</h2>
      <p style="color:#475569;">Hi ${name}, we couldn't process your payment. Update your details to stay in the draw.</p>
      ${btn(`${process.env.CLIENT_URL}/dashboard/settings`, 'Update Payment', '#dc2626')}
    `),
  }),

  resetPassword: ({ name, resetUrl }) => ({
    subject: 'Reset Your GolfDraw Password',
    html: base(`
      <h2 style="color:#1a3c5e;margin-top:0;">Password Reset</h2>
      <p style="color:#475569;">Hi ${name}, click below to reset your password (valid 15 mins):</p>
      ${btn(resetUrl, 'Reset Password')}
      <p style="color:#94a3b8;font-size:13px;margin-top:16px;">Didn't request this? Ignore this email.</p>
    `),
  }),

  drawResults: ({ name, month, year, isWinner, matchType, prizeAmount }) => ({
    subject: `${month} ${year} Draw — ${isWinner ? '🎉 You Won!' : 'Results are in!'}`,
    html: base(`
      <h2 style="color:#1a3c5e;margin-top:0;">${month} ${year} Draw Results</h2>
      <p style="color:#475569;">Hi ${name},</p>
      ${isWinner
        ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:16px 0;">
            <p style="color:#166534;font-weight:600;margin:0;">🎉 You matched <strong>${matchType}</strong> and won <strong>£${prizeAmount}</strong>!</p>
          </div>
          ${btn(`${process.env.CLIENT_URL}/dashboard/winnings`, 'Claim Your Prize', '#f59e0b')}`
        : `<p style="color:#475569;">You didn't win this month — keep entering scores for next time!</p>
           ${btn(`${process.env.CLIENT_URL}/dashboard/scores`, 'Enter Scores')}`
      }
    `),
  }),

  winnerVerified: ({ name, prizeAmount }) => ({
    subject: '✅ Your win has been verified!',
    html: base(`
      <h2 style="color:#1a3c5e;margin-top:0;">Win Verified! 🎉</h2>
      <p style="color:#475569;">Hi ${name}, your win of <strong>£${prizeAmount}</strong> is verified. Payment is on its way!</p>
    `),
  }),
};

export const sendEmail = async ({ to, subject, template, data, html }) => {
  try {
    const transporter = createTransporter();
    let emailHtml = html;
    let emailSubject = subject;

    if (template && templates[template]) {
      const compiled = templates[template](data);
      emailHtml = compiled.html;
      emailSubject = compiled.subject;
    }

    await transporter.sendMail({
      from: `"GolfDraw" <${process.env.EMAIL_FROM}>`,
      to,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email error:`, error.message);
    throw error;
  }
};
