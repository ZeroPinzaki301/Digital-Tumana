import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter with Railway-optimized settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true, // Use connection pooling for better performance
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 20000, // Rate limiting
  rateLimit: 5
});

// Cache for email templates - load on demand
const templateCache = new Map();

const getTemplate = async (templateName) => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }
  
  try {
    const templates = await import("./emailTemplates.js");
    const template = templates[templateName];
    templateCache.set(templateName, template);
    return template;
  } catch (error) {
    console.error(`Failed to load template ${templateName}:`, error);
    throw error;
  }
};

// Core email functions - preload these templates for better performance
import { 
  verificationEmailTemplate, 
  passwordResetEmailTemplate,
  adminPasswordResetEmailTemplate,
  adminVerificationEmailTemplate 
} from "./emailTemplates.js";

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

// Dynamic template loading for less frequently used emails
export const sendTesdaEligibilityEmail = async (to, name) => {
  const template = await getTemplate('tesdaEligibilityEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "TESDA NC1 Eligibility Confirmed",
    html: template(name),
  };
  await transporter.sendMail(mailOptions);
};

export const sendTesdaReservationEmail = async (to, name) => {
  const template = await getTemplate('tesdaReservationEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "TESDA NC1 Slot Reserved",
    html: template(name),
  };
  await transporter.sendMail(mailOptions);
};

export const sendTesdaEnrollmentEmail = async (to, name) => {
  const template = await getTemplate('tesdaEnrollmentEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Enrollment Confirmed - TESDA NC1",
    html: template(name),
  };
  await transporter.sendMail(mailOptions);
};

export const sendTesdaGraduationEmail = async (to, name) => {
  const template = await getTemplate('tesdaGraduationEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🎓 Congratulations on Your TESDA NC1 Graduation!",
    html: template(name),
  };
  await transporter.sendMail(mailOptions);
};

export const sendKaritonRiderRegistrationEmail = async (to, name, code) => {
  const template = await getTemplate('karitonRiderRegistrationEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Kariton Rider Registration & Login Code",
    html: template(name, code),
  };
  await transporter.sendMail(mailOptions);
};

export const sendKaritonLoginResetEmail = async (to, name, code) => {
  const template = await getTemplate('karitonLoginResetEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Kariton Rider Login Reset Code",
    html: template(name, code),
  };
  await transporter.sendMail(mailOptions);
};

export const sendKaritonNewLoginCodeEmail = async (to, name, newLoginCode) => {
  const template = await getTemplate('karitonNewLoginCodeEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your New Kariton Rider Login Code",
    html: template(name, newLoginCode),
  };
  await transporter.sendMail(mailOptions);
};

export const sendSellerApprovalEmail = async (to, name, storeName) => {
  const template = await getTemplate('sellerRegistrationApprovedEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Seller Account Approved - ${storeName}`,
    html: template(name, storeName),
  };
  await transporter.sendMail(mailOptions);
};

export const sendSellerRejectionEmail = async (to, name, storeName, reason = "") => {
  const template = await getTemplate('sellerRegistrationRejectedEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Seller Account Application Update - ${storeName}`,
    html: template(name, storeName, reason),
  };
  await transporter.sendMail(mailOptions);
};

export const sendEmployerApprovalEmail = async (to, name, companyName) => {
  const template = await getTemplate('employerRegistrationApprovedEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Employer Account Approved - ${companyName}`,
    html: template(name, companyName),
  };
  await transporter.sendMail(mailOptions);
};

export const sendEmployerRejectionEmail = async (to, name, companyName, reason = "") => {
  const template = await getTemplate('employerRegistrationRejectedEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Employer Account Application Update - ${companyName}`,
    html: template(name, companyName, reason),
  };
  await transporter.sendMail(mailOptions);
};

export const sendWorkerApprovalEmail = async (to, name) => {
  const template = await getTemplate('workerRegistrationApprovedEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Worker Account Approved",
    html: template(name),
  };
  await transporter.sendMail(mailOptions);
};

export const sendWorkerRejectionEmail = async (to, name, reason = "") => {
  const template = await getTemplate('workerRegistrationRejectedEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Worker Account Application Update",
    html: template(name, reason),
  };
  await transporter.sendMail(mailOptions);
};

export const sendCustomerApprovalEmail = async (to, name) => {
  const template = await getTemplate('customerRegistrationApprovedEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Customer Account Verified",
    html: template(name),
  };
  await transporter.sendMail(mailOptions);
};

export const sendCustomerRejectionEmail = async (to, name, reason = "") => {
  const template = await getTemplate('customerRegistrationRejectedEmailTemplate');
  const mailOptions = {
    from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Customer Account Verification Update",
    html: template(name, reason),
  };
  await transporter.sendMail(mailOptions);
};
