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

// Production-ready transporter configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  requireTLS: true,
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds  
  socketTimeout: 60000,     // 60 seconds
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Additional options for better reliability
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection failed:', error);
  } else {
    console.log('SMTP server is ready to take messages');
  }
});

export const safeSendMail = async (mailOptions, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Email send attempt ${attempt}/${retries} to ${mailOptions.to}`);
      
      const result = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully on attempt ${attempt}:`, result.messageId);
      return result;
      
    } catch (error) {
      console.error(`Email send attempt ${attempt} failed:`, error.message);
      
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        console.error(`All ${retries} email send attempts failed for ${mailOptions.to}`);
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
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
