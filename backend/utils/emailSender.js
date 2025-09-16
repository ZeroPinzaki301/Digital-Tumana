import sgMail from '@sendgrid/mail';
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

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SENDER_EMAIL = process.env.VERIFIED_SENDER_EMAIL || 'digitaltumana@gmail.com';

// Helper function to send email via SendGrid Web API
const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: {
      email: SENDER_EMAIL,
      name: 'Digital Tumana'
    },
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (to, name, code) => {
  await sendEmail(to, "Verify Your Digital Tumana Account", verificationEmailTemplate(name, code));
};

export const sendPasswordResetEmail = async (to, code) => {
  await sendEmail(to, "Reset Your Password", passwordResetEmailTemplate(code));
};

export const sendAdminVerificationEmail = async (to, name, code) => {
  await sendEmail(to, "Admin Login Verification Code", adminVerificationEmailTemplate(name, code));
};

export const sendAdminResetEmail = async (to, code) => {
  await sendEmail(to, "Reset Your Admin Password", adminPasswordResetEmailTemplate(code));
};

export const sendTesdaEligibilityEmail = async (to, name) => {
  await sendEmail(to, "TESDA NC1 Eligibility Confirmed", tesdaEligibilityEmailTemplate(name));
};

export const sendTesdaReservationEmail = async (to, name) => {
  await sendEmail(to, "TESDA NC1 Slot Reserved", tesdaReservationEmailTemplate(name));
};

export const sendTesdaEnrollmentEmail = async (to, name) => {
  await sendEmail(to, "Enrollment Confirmed - TESDA NC1", tesdaEnrollmentEmailTemplate(name));
};

export const sendTesdaGraduationEmail = async (to, name) => {
  await sendEmail(to, "🎓 Congratulations on Your TESDA NC1 Graduation!", tesdaGraduationEmailTemplate(name));
};

export const sendKaritonRiderRegistrationEmail = async (to, name, code) => {
  await sendEmail(to, "Kariton Rider Registration & Login Code", karitonRiderRegistrationEmailTemplate(name, code));
};

export const sendKaritonLoginResetEmail = async (to, name, code) => {
  await sendEmail(to, "Kariton Rider Login Reset Code", karitonLoginResetEmailTemplate(name, code));
};

export const sendKaritonNewLoginCodeEmail = async (to, name, newLoginCode) => {
  await sendEmail(to, "Your New Kariton Rider Login Code", karitonNewLoginCodeEmailTemplate(name, newLoginCode));
};

export const sendSellerApprovalEmail = async (to, name, storeName) => {
  await sendEmail(to, `Seller Account Approved - ${storeName}`, sellerRegistrationApprovedEmailTemplate(name, storeName));
};

export const sendSellerRejectionEmail = async (to, name, storeName, reason = "") => {
  await sendEmail(to, `Seller Account Application Update - ${storeName}`, sellerRegistrationRejectedEmailTemplate(name, storeName, reason));
};

export const sendEmployerApprovalEmail = async (to, name, companyName) => {
  await sendEmail(to, `Employer Account Approved - ${companyName}`, employerRegistrationApprovedEmailTemplate(name, companyName));
};

export const sendEmployerRejectionEmail = async (to, name, companyName, reason = "") => {
  await sendEmail(to, `Employer Account Application Update - ${companyName}`, employerRegistrationRejectedEmailTemplate(name, companyName, reason));
};

export const sendWorkerApprovalEmail = async (to, name) => {
  await sendEmail(to, "Worker Account Approved", workerRegistrationApprovedEmailTemplate(name));
};

export const sendWorkerRejectionEmail = async (to, name, reason = "") => {
  await sendEmail(to, "Worker Account Application Update", workerRegistrationRejectedEmailTemplate(name, reason));
};

export const sendCustomerApprovalEmail = async (to, name) => {
  await sendEmail(to, "Customer Account Verified", customerRegistrationApprovedEmailTemplate(name));
};

export const sendCustomerRejectionEmail = async (to, name, reason = "") => {
  await sendEmail(to, "Customer Account Verification Update", customerRegistrationRejectedEmailTemplate(name, reason));
};
