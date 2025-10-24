import nodemailer from "nodemailer";

const createTransporter = nodemailer.createTransport || nodemailer.default?.createTransport;

const transporter = createTransporter({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) === 465 : true),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.warn('[SMTP] Connection failed. Email sending will not work:', error.message);
    console.warn('[SMTP] To fix: Configure SMTP settings in .env file (SMTP_USER, SMTP_PASS)');
  } else {
    console.log('[SMTP] Connection verified - Email service ready');
  }
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || "Shortifi"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || htmlToPlaintext(html) || "",
      html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Shortifi',
      },
      priority: 'high',
    });
    console.log('[Email] Sent successfully to:', to);
    return info;
  } catch (err) {
    console.error('[Email] Failed to send:', err);
    throw err;
  }
};

function htmlToPlaintext(html) {
  return html ? html.replace(/<\/?[^>]+(>|$)/g, "") : "";
}