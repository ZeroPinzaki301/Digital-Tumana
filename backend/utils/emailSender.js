import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  adminPasswordResetEmailTemplate,
  adminVerificationEmailTemplate,
  tesdaEligibilityEmailTemplate,
  tesdaReservationEmailTemplate,
  tesdaEnrollmentEmailTemplate,
  tesdaGraduationEmailTemplate,
  karitonRiderRegistrationEmailTemplate,
  sellerRegistrationApprovedEmailTemplate,
  sellerRegistrationRejectedEmailTemplate,
  employerRegistrationApprovedEmailTemplate,
  employerRegistrationRejectedEmailTemplate,
  workerRegistrationApprovedEmailTemplate,
  workerRegistrationRejectedEmailTemplate,
  customerRegistrationApprovedEmailTemplate,
  customerRegistrationRejectedEmailTemplate,
  karitonLoginResetEmailTemplate,
  karitonNewLoginCodeEmailTemplate
} from "./emailTemplates.js";

dotenv.config();

// SendGrid SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'apikey', // This is always 'apikey' for SendGrid
    pass: process.env.SENDGRID_API_KEY // Your actual API key
  }
});

// If using verified domain, use this sender:
// const SENDER_EMAIL = '"Digital Tumana" <noreply@digital.tumana.com>';

// If using single sender verification, use your verified email:
const SENDER_EMAIL = `"Digital Tumana" <${process.env.VERIFIED_SENDER_EMAIL}>`;

export const sendVerificationEmail = async (to, name, code) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Verify Your Digital Tumana Account",
    html: verificationEmailTemplate(name, code),
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (to, code) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Reset Your Password",
    html: passwordResetEmailTemplate(code),
  };

  await transporter.sendMail(mailOptions);
};

export const sendAdminVerificationEmail = async (to, name, code) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Admin Login Verification Code",
    html: adminVerificationEmailTemplate(name, code),
  };

  await transporter.sendMail(mailOptions);
};

export const sendAdminResetEmail = async (to, code) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Reset Your Admin Password",
    html: adminPasswordResetEmailTemplate(code),
  };

  await transporter.sendMail(mailOptions);
};

export const sendTesdaEligibilityEmail = async (to, name) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "TESDA NC1 Eligibility Confirmed",
    html: tesdaEligibilityEmailTemplate(name),
  };

  await transporter.sendMail(mailOptions);
};

export const sendTesdaReservationEmail = async (to, name) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "TESDA NC1 Slot Reserved",
    html: tesdaReservationEmailTemplate(name),
  };

  await transporter.sendMail(mailOptions);
};

export const sendTesdaEnrollmentEmail = async (to, name) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Enrollment Confirmed - TESDA NC1",
    html: tesdaEnrollmentEmailTemplate(name),
  };

  await transporter.sendMail(mailOptions);
};

export const sendTesdaGraduationEmail = async (to, name) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "🎓 Congratulations on Your TESDA NC1 Graduation!",
    html: tesdaGraduationEmailTemplate(name),
  };

  await transporter.sendMail(mailOptions);
};

export const sendKaritonRiderRegistrationEmail = async (to, name, code) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Kariton Rider Registration & Login Code",
    html: karitonRiderRegistrationEmailTemplate(name, code),
  };

  await transporter.sendMail(mailOptions);
};

export const sendKaritonLoginResetEmail = async (to, name, code) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Kariton Rider Login Reset Code",
    html: karitonLoginResetEmailTemplate(name, code),
  };

  await transporter.sendMail(mailOptions);
};

export const sendKaritonNewLoginCodeEmail = async (to, name, newLoginCode) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Your New Kariton Rider Login Code",
    html: karitonNewLoginCodeEmailTemplate(name, newLoginCode),
  };

  await transporter.sendMail(mailOptions);
};

export const sendSellerApprovalEmail = async (to, name, storeName) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: `Seller Account Approved - ${storeName}`,
    html: sellerRegistrationApprovedEmailTemplate(name, storeName),
  };

  await transporter.sendMail(mailOptions);
};

export const sendSellerRejectionEmail = async (to, name, storeName, reason = "") => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: `Seller Account Application Update - ${storeName}`,
    html: sellerRegistrationRejectedEmailTemplate(name, storeName, reason),
  };

  await transporter.sendMail(mailOptions);
};

export const sendEmployerApprovalEmail = async (to, name, companyName) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: `Employer Account Approved - ${companyName}`,
    html: employerRegistrationApprovedEmailTemplate(name, companyName),
  };

  await transporter.sendMail(mailOptions);
};

export const sendEmployerRejectionEmail = async (to, name, companyName, reason = "") => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: `Employer Account Application Update - ${companyName}`,
    html: employerRegistrationRejectedEmailTemplate(name, companyName, reason),
  };

  await transporter.sendMail(mailOptions);
};

export const sendWorkerApprovalEmail = async (to, name) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Worker Account Approved",
    html: workerRegistrationApprovedEmailTemplate(name),
  };

  await transporter.sendMail(mailOptions);
};

export const sendWorkerRejectionEmail = async (to, name, reason = "") => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Worker Account Application Update",
    html: workerRegistrationRejectedEmailTemplate(name, reason),
  };

  await transporter.sendMail(mailOptions);
};

export const sendCustomerApprovalEmail = async (to, name) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Customer Account Verified",
    html: customerRegistrationApprovedEmailTemplate(name),
  };

  await transporter.sendMail(mailOptions);
};

export const sendCustomerRejectionEmail = async (to, name, reason = "") => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: "Customer Account Verification Update",
    html: customerRegistrationRejectedEmailTemplate(name, reason),
  };

  await transporter.sendMail(mailOptions);
};
