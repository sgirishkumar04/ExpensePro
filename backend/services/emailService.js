const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    throw new Error('Email could not be sent');
  }
};

const sendWelcomeEmail = async (name, email) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">💰 ExpensePro</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Your personal finance companion</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Welcome, ${name}! 🎉</h2>
          <p style="color: #475569; line-height: 1.6;">Thank you for joining ExpensePro. Your account is now active and ready to help you take control of your finances.</p>
          <p style="color: #475569; line-height: 1.6;">With ExpensePro, you can:</p>
          <ul style="color: #475569; line-height: 1.8;">
            <li>📊 Track daily expenses and income</li>
            <li>📈 View detailed financial reports</li>
            <li>💼 Manage multiple bank accounts</li>
            <li>🎯 Set and track savings goals</li>
          </ul>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Go to Dashboard</a>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">If you have any questions, feel free to contact us.</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 ExpensePro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail({ to: email, subject: 'Welcome to ExpensePro! 🎉', html });
};

const sendVerificationOTP = async (name, email, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">💰 ExpensePro</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Email Verification</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${name}, please use the following OTP to verify your email address:</p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 36px; font-weight: 700; letter-spacing: 12px; padding: 20px 40px; border-radius: 12px;">${otp}</div>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 ExpensePro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail({ to: email, subject: 'ExpensePro – Email Verification OTP', html });
};

const sendPasswordResetOTP = async (name, email, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">💰 ExpensePro</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Password Reset Request</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${name}, you requested a password reset. Use this OTP:</p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; font-size: 36px; font-weight: 700; letter-spacing: 12px; padding: 20px 40px; border-radius: 12px;">${otp}</div>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">This OTP is valid for <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 ExpensePro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail({ to: email, subject: 'ExpensePro – Password Reset OTP', html });
};

module.exports = { sendEmail, sendWelcomeEmail, sendVerificationOTP, sendPasswordResetOTP };
