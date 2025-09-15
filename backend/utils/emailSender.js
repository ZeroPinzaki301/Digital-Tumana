import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { setTimeout } from "timers/promises";

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const safeSendMail = async (mailOptions) => {
  try {
    const sendPromise = transporter.sendMail(mailOptions);
    const result = await Promise.race([
      sendPromise,
      setTimeout(10000).then(() => {
        throw new Error("SMTP timeout");
      }),
    ]);
    return result;
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
};

// Verification & Reset Emails
export const sendVerificationEmail = async (to, name, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Digital Tumana Account",
    html: verificationEmailTemplate(name, code),
  };
  await safeSendMail(mailOptions);
};

export const sendPasswordResetEmail = async (to, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    html: passwordResetEmailTemplate(code),
  };
  await safeSendMail(mailOptions);
};

export const sendAdminVerificationEmail = async (to, name, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Admin Login Verification Code",
    html: adminVerificationEmailTemplate(name, code),
  };
  await safeSendMail(mailOptions);
};

export const sendAdminResetEmail = async (to, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Admin Password",
    html: adminPasswordResetEmailTemplate(code),
  };
  await safeSendMail(mailOptions);
};

// TESDA Notifications
export const sendTesdaEligibilityEmail = async (to, name) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "TESDA NC1 Eligibility Confirmed",
    html: tesdaEligibilityEmailTemplate(name),
  };
  await safeSendMail(mailOptions);
};

export const sendTesdaReservationEmail = async (to, name) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "TESDA NC1 Slot Reserved",
    html: tesdaReservationEmailTemplate(name),
  };
  await safeSendMail(mailOptions);
};

export const sendTesdaEnrollmentEmail = async (to, name) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Enrollment Confirmed - TESDA NC1",
    html: tesdaEnrollmentEmailTemplate(name),
  };
  await safeSendMail(mailOptions);
};

export const sendTesdaGraduationEmail = async (to, name) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🎓 Congratulations on Your TESDA NC1 Graduation!",
    html: tesdaGraduationEmailTemplate(name),
  };
  await safeSendMail(mailOptions);
};

// Kariton Rider Emails
export const sendKaritonRiderRegistrationEmail = async (to, name, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Kariton Rider Registration & Login Code",
    html: karitonRiderRegistrationEmailTemplate(name, code),
  };
  await safeSendMail(mailOptions);
};

export const sendKaritonLoginResetEmail = async (to, name, code) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Kariton Rider Login Reset Code",
    html: karitonLoginResetEmailTemplate(name, code),
  };
  await safeSendMail(mailOptions);
};

export const sendKaritonNewLoginCodeEmail = async (to, name, newLoginCode) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your New Kariton Rider Login Code",
    html: karitonNewLoginCodeEmailTemplate(name, newLoginCode),
  };
  await safeSendMail(mailOptions);
};

// Seller Registration Emails
export const sendSellerApprovalEmail = async (to, name, storeName) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Seller Account Approved - ${storeName}`,
    html: sellerRegistrationApprovedEmailTemplate(name, storeName),
  };
  await safeSendMail(mailOptions);
};

export const sendSellerRejectionEmail = async (to, name, storeName, reason = "") => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Seller Account Application Update - ${storeName}`,
    html: sellerRegistrationRejectedEmailTemplate(name, storeName, reason),
  };
  await safeSendMail(mailOptions);
};

// Employer Registration Emails
export const sendEmployerApprovalEmail = async (to, name, companyName) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Employer Account Approved - ${companyName}`,
    html: employerRegistrationApprovedEmailTemplate(name, companyName),
  };
  await safeSendMail(mailOptions);
};

export const sendEmployerRejectionEmail = async (to, name, companyName, reason = "") => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Employer Account Application Update - ${companyName}`,
    html: employerRegistrationRejectedEmailTemplate(name, companyName, reason),
  };
  await safeSendMail(mailOptions);
};

// Worker Registration Emails
export const sendWorkerApprovalEmail = async (to, name) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Worker Account Approved",
    html: workerRegistrationApprovedEmailTemplate(name),
  };
  await safeSendMail(mailOptions);
};

export const sendWorkerRejectionEmail = async (to, name, reason = "") => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Worker Account Application Update",
    html: workerRegistrationRejectedEmailTemplate(name, reason),
  };
  await safeSendMail(mailOptions);
};

// Customer Registration Emails
export const sendCustomerApprovalEmail = async (to, name) => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Customer Account Verified",
    html: customerRegistrationApprovedEmailTemplate(name),
  };
  await safeSendMail(mailOptions);
};

export const sendCustomerRejectionEmail = async (to, name, reason = "") => {
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Customer Account Verification Update",
    html: customerRegistrationRejectedEmailTemplate(name, reason),
  };
  await safeSendMail(mailOptions);
};
