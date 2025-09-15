import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { 
  verificationEmailTemplate, 
  passwordResetEmailTemplate, 
  adminPasswordResetEmailTemplate, 
  adminVerificationEmailTemplate 
} from "./emailTemplates.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Your original working functions
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

export const sendAdminResetEmail = async (to, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Admin Password",
    html: adminPasswordResetEmailTemplate(code),
  };
  await transporter.sendMail(mailOptions);
};

// STUB FUNCTIONS - These won't actually send emails but prevent errors
export const sendTesdaEligibilityEmail = async (to, name) => {
  console.log(`STUB: Would send TESDA eligibility email to ${to} for ${name}`);
  // TODO: Implement actual email sending
};

export const sendTesdaReservationEmail = async (to, name) => {
  console.log(`STUB: Would send TESDA reservation email to ${to} for ${name}`);
};

export const sendTesdaEnrollmentEmail = async (to, name) => {
  console.log(`STUB: Would send TESDA enrollment email to ${to} for ${name}`);
};

export const sendTesdaGraduationEmail = async (to, name) => {
  console.log(`STUB: Would send TESDA graduation email to ${to} for ${name}`);
};

export const sendKaritonRiderRegistrationEmail = async (to, name, code) => {
  console.log(`STUB: Would send Kariton rider registration email to ${to} for ${name}`);
};

export const sendKaritonLoginResetEmail = async (to, name, code) => {
  console.log(`STUB: Would send Kariton login reset email to ${to} for ${name}`);
};

export const sendKaritonNewLoginCodeEmail = async (to, name, newLoginCode) => {
  console.log(`STUB: Would send Kariton new login code email to ${to} for ${name}`);
};

export const sendSellerApprovalEmail = async (to, name, storeName) => {
  console.log(`STUB: Would send seller approval email to ${to} for ${name} - ${storeName}`);
};

export const sendSellerRejectionEmail = async (to, name, storeName, reason = "") => {
  console.log(`STUB: Would send seller rejection email to ${to} for ${name} - ${storeName}`);
};

export const sendEmployerApprovalEmail = async (to, name, companyName) => {
  console.log(`STUB: Would send employer approval email to ${to} for ${name} - ${companyName}`);
};

export const sendEmployerRejectionEmail = async (to, name, companyName, reason = "") => {
  console.log(`STUB: Would send employer rejection email to ${to} for ${name} - ${companyName}`);
};

export const sendWorkerApprovalEmail = async (to, name) => {
  console.log(`STUB: Would send worker approval email to ${to} for ${name}`);
};

export const sendWorkerRejectionEmail = async (to, name, reason = "") => {
  console.log(`STUB: Would send worker rejection email to ${to} for ${name}`);
};

export const sendCustomerApprovalEmail = async (to, name) => {
  console.log(`STUB: Would send customer approval email to ${to} for ${name}`);
};

export const sendCustomerRejectionEmail = async (to, name, reason = "") => {
  console.log(`STUB: Would send customer rejection email to ${to} for ${name}`);
};
