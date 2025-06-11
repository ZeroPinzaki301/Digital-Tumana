import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { verificationEmailTemplate, passwordResetEmailTemplate } from "./emailTemplates.js";

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




