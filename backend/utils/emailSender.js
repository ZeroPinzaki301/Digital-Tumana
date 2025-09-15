import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
});

// Import only core templates first
import { 
  verificationEmailTemplate, 
  passwordResetEmailTemplate,
  adminPasswordResetEmailTemplate,
  adminVerificationEmailTemplate 
} from "./emailTemplates.js";

// Core email functions that were working before
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

// Lazy load other templates only when needed
const getTemplate = async (templateName) => {
  try {
    const { [templateName]: template } = await import("./emailTemplates.js");
    return template;
  } catch (error) {
    console.error(`Failed to load template ${templateName}:`, error);
    throw error;
  }
};

// TESDA email functions
export const sendTesdaEligibilityEmail = async (to, name) => {
  try {
    const template = await getTemplate('tesdaEligibilityEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "TESDA NC1 Eligibility Confirmed",
      html: template(name),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending TESDA eligibility email:', error);
    throw error;
  }
};

export const sendTesdaReservationEmail = async (to, name) => {
  try {
    const template = await getTemplate('tesdaReservationEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "TESDA NC1 Slot Reserved",
      html: template(name),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending TESDA reservation email:', error);
    throw error;
  }
};

export const sendTesdaEnrollmentEmail = async (to, name) => {
  try {
    const template = await getTemplate('tesdaEnrollmentEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Enrollment Confirmed - TESDA NC1",
      html: template(name),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending TESDA enrollment email:', error);
    throw error;
  }
};

export const sendTesdaGraduationEmail = async (to, name) => {
  try {
    const template = await getTemplate('tesdaGraduationEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🎓 Congratulations on Your TESDA NC1 Graduation!",
      html: template(name),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending TESDA graduation email:', error);
    throw error;
  }
};

// Kariton email functions
export const sendKaritonRiderRegistrationEmail = async (to, name, code) => {
  try {
    const template = await getTemplate('karitonRiderRegistrationEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Kariton Rider Registration & Login Code",
      html: template(name, code),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending Kariton rider registration email:', error);
    throw error;
  }
};

export const sendKaritonLoginResetEmail = async (to, name, code) => {
  try {
    const template = await getTemplate('karitonLoginResetEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Kariton Rider Login Reset Code",
      html: template(name, code),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending Kariton login reset email:', error);
    throw error;
  }
};

export const sendKaritonNewLoginCodeEmail = async (to, name, newLoginCode) => {
  try {
    const template = await getTemplate('karitonNewLoginCodeEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your New Kariton Rider Login Code",
      html: template(name, newLoginCode),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending Kariton new login code email:', error);
    throw error;
  }
};

// Seller email functions
export const sendSellerApprovalEmail = async (to, name, storeName) => {
  try {
    const template = await getTemplate('sellerRegistrationApprovedEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Seller Account Approved - ${storeName}`,
      html: template(name, storeName),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending seller approval email:', error);
    throw error;
  }
};

export const sendSellerRejectionEmail = async (to, name, storeName, reason = "") => {
  try {
    const template = await getTemplate('sellerRegistrationRejectedEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Seller Account Application Update - ${storeName}`,
      html: template(name, storeName, reason),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending seller rejection email:', error);
    throw error;
  }
};

// Employer email functions
export const sendEmployerApprovalEmail = async (to, name, companyName) => {
  try {
    const template = await getTemplate('employerRegistrationApprovedEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Employer Account Approved - ${companyName}`,
      html: template(name, companyName),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending employer approval email:', error);
    throw error;
  }
};

export const sendEmployerRejectionEmail = async (to, name, companyName, reason = "") => {
  try {
    const template = await getTemplate('employerRegistrationRejectedEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Employer Account Application Update - ${companyName}`,
      html: template(name, companyName, reason),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending employer rejection email:', error);
    throw error;
  }
};

// Worker email functions
export const sendWorkerApprovalEmail = async (to, name) => {
  try {
    const template = await getTemplate('workerRegistrationApprovedEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Worker Account Approved",
      html: template(name),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending worker approval email:', error);
    throw error;
  }
};

export const sendWorkerRejectionEmail = async (to, name, reason = "") => {
  try {
    const template = await getTemplate('workerRegistrationRejectedEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Worker Account Application Update",
      html: template(name, reason),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending worker rejection email:', error);
    throw error;
  }
};

// Customer email functions
export const sendCustomerApprovalEmail = async (to, name) => {
  try {
    const template = await getTemplate('customerRegistrationApprovedEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Customer Account Verified",
      html: template(name),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending customer approval email:', error);
    throw error;
  }
};

export const sendCustomerRejectionEmail = async (to, name, reason = "") => {
  try {
    const template = await getTemplate('customerRegistrationRejectedEmailTemplate');
    const mailOptions = {
      from: `"Digital Tumana" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Customer Account Verification Update",
      html: template(name, reason),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending customer rejection email:', error);
    throw error;
  }
};
