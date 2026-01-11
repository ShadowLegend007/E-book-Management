import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.APP_NAME || 'EduHub'}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export const sendWelcomeEmail = async (user) => {
    const subject = "Welcome to EduHub!";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">Welcome to EduHub, ${user.name}!</h1>
      <p>We are thrilled to have you on board.</p>
      <p>Explore thousands of books, notes, and resources shared by the community.</p>
      <p>Get started by uploading your first resource or browsing the library.</p>
      <br>
      <p>Happy Learning!</p>
      <p>The EduHub Team</p>
    </div>
  `;
    return sendEmail(user.email, subject, html);
};

export const sendOtpEmail = async (user, otp) => {
    const subject = "Password Reset OTP - EduHub";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Password Reset OTP</h2>
      <p>Hello ${user.name},</p>
      <p>Your One-Time Password (OTP) for resetting your password is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3b82f6; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
    return sendEmail(user.email, subject, html);
};

export const sendPasswordResetEmail = async (user, resetLink) => {
    const subject = "Reset Your Password - EduHub";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 1 hour.</p>
    </div>
  `;
    return sendEmail(user.email, subject, html);
};
