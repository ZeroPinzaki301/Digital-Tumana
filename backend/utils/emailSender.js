import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  adminPasswordResetEmailTemplate,
  adminVerificationEmailTemplate,
} from "./emailTemplates.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to, name, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Digital Tumana Account",
    html: verificationEmailTemplate(name, code),
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (to, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    html: passwordResetEmailTemplate(code),
  };

  await transporter.sendMail(mailOptions);
};

export const sendAdminVerificationEmail = async (to, name, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Admin Login Verification Code",
    html: adminVerificationEmailTemplate(name, code),
  };

  await transporter.sendMail(mailOptions);
};

// Send Admin Password Reset Email
export const sendAdminResetEmail = async (to, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Admin Password",
    html: adminPasswordResetEmailTemplate(code),
  };

  await transporter.sendMail(mailOptions);
};
