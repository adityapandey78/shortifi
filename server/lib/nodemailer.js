import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) === 465 : true),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // optional: let nodemailer sign with DKIM if you manage keys yourself
  // dkim: {
  //   domainName: "yourdomain.com",
  //   keySelector: "default",
  //   privateKey: process.env.DKIM_PRIVATE_KEY
  // }
});

// Verify SMTP connection in background (non-blocking)
// Only logs warning if connection fails, doesn't crash the server
transporter.verify((error, success) => {
  if (error) {
    console.warn('[SMTP] Connection failed. Email sending will not work:', error.message);
    console.warn('[SMTP] To fix: Configure SMTP settings in .env file (SMTP_USER, SMTP_PASS)');
  } else {
    console.log('[SMTP] Connection verified - Email service ready');
  }
});

export const sendEmail = async ({ to, subject, html, text, unsubscribeUrl }) => {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME || "URL_SHORTNER"} <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || htmlToPlaintext(html) || "",
      html,
      headers: {
        // include List-Unsubscribe for bulk/marketing messages
        ...(unsubscribeUrl ? { "List-Unsubscribe": `<${unsubscribeUrl}>` } : {}),
      },
    });
    return info;
  } catch (err) {
    throw err;
  }
};

function htmlToPlaintext(html) {
  // minimal fallback: strip tags (use a library for production)
  return html ? html.replace(/<\/?[^>]+(>|$)/g, "") : "";
}