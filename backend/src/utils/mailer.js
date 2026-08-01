const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const EMAIL_DIR = path.join(__dirname, '..', '..', 'emails');

const transporter = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

const buildHtml = ({ to, subject, body }) => `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f4f4f7;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e5e7eb;">
    <h2 style="color:#4f46e5;margin:0 0 12px;">⚒️ SkillForge</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;">${body}</p>
    <p style="color:#9ca3af;font-size:12px;margin-top:20px;">This is an automated message from the SkillForge platform.</p>
  </div></body></html>`;

const sendMail = async ({ to, subject, body }) => {
  const html = buildHtml({ to, subject, body });
  const mailer = transporter();

  if (mailer) {
    await mailer.sendMail({
      from: process.env.MAIL_FROM || 'SkillForge <no-reply@skillforge.dev>',
      to,
      subject,
      html,
    });
    console.log(`[Mailer] Sent "${subject}" → ${to}`);
    return { provider: 'smtp' };
  }

  fs.mkdirSync(EMAIL_DIR, { recursive: true });
  const filename = `${Date.now()}-${subject.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.html`;
  const filePath = path.join(EMAIL_DIR, filename);
  fs.writeFileSync(filePath, html, 'utf8');

  console.log(`\n┌────────────────────────────────────────────────────┐`);
  console.log(`│ [Mailer] SIMULATED email (no SMTP configured)       │`);
  console.log(`│   To:      ${to}`);
  console.log(`│   Subject: ${subject}`);
  console.log(`│   Body:    ${body.replace(/<[^>]*>/g, '').slice(0, 180)}...`);
  console.log(`│   File:    backend/emails/${filename}`);
  console.log(`└────────────────────────────────────────────────────┘\n`);
  return { provider: 'file', filePath };
};

module.exports = { sendMail };
