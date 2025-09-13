export const verificationEmailTemplate = (name, code) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">Welcome to Digital Tumana, ${name}!</h2>
    <p>Thank you for signing up. To activate your account, please enter this 6-digit verification code:</p>
    <h1 style="text-align: center; font-size: 24px; letter-spacing: 2px; background:rgba(157, 255, 36, 0.56); padding: 10px; border-radius: 5px;">${code}</h1>
    <p>If you didn’t sign up, please ignore this email.</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const passwordResetEmailTemplate = (code) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">Password Reset Request</h2>
    <p>Use the following code to reset your password:</p>
    <h1 style="text-align: center; font-size: 24px; background:rgba(157, 255, 36, 0.56); padding: 10px; border-radius: 5px;">${code}</h1>
    <p>If you didn't request this, ignore this email.</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const welcomeEmailTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #27ae60;">Welcome to Digital Tumana, ${name}!</h2>
    <p>We’re excited to have you on board. Explore the platform and start connecting today!</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const adminVerificationEmailTemplate = (name, code) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">Admin Login Verification - Digital Tumana</h2>
    <p>Hello ${name},</p>
    <p>To verify your admin login, please enter the following code:</p>
    <h1 style="text-align: center; font-size: 24px; letter-spacing: 2px; background:rgba(157, 255, 36, 0.56); padding: 10px; border-radius: 5px;">${code}</h1>
    <p>If you didn’t request this login attempt, please ignore this email.</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const adminPasswordResetEmailTemplate = (code) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">Admin Password Reset Request</h2>
    <p>Use the following code to reset your administrator password:</p>
    <h1 style="text-align: center; font-size: 24px; letter-spacing: 2px; background:rgba(157, 255, 36, 0.56); padding: 10px; border-radius: 5px;">${code}</h1>
    <p>If you did not request this, please ignore this email.</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const tesdaEligibilityEmailTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">TESDA NC1 Eligibility Confirmed</h2>
    <p>Hello ${name},</p>
    <p>Your documents have been successfully verified. You're now eligible to enroll in the TESDA NC1 Agricultural Course.</p>
    <p>We’re currently preparing your slot. You’ll receive another email once it’s reserved.</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const tesdaReservationEmailTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">TESDA NC1 Slot Reserved</h2>
    <p>Hello ${name},</p>
    <p>Your slot for the TESDA NC1 Agricultural Course has been successfully reserved.</p>
    <p><strong>Contact Information:</strong></p>
    <ul style="line-height: 1.6;">
      <li><strong>Phone:</strong> 0919-001-4825</li>
      <li><strong>Email:</strong>
        <a href="mailto:digitaltumana@gmail.com" style="color: #44a11c;"> digitaltumana@gmail.com</a>,
        <a href="mailto:digimana.sup.admn@gmail.com" style="color: #44a11c;"> digimana.sup.admn@gmail.com</a>
      </li>
      <li><strong>Location:</strong>
        <a href="https://www.google.com/maps/search/?api=1&query=ANGEL%20TOLITS%20INTEGRATED%20FARM%20SCHOOL%2CINC.%2042%20General%20Alejo%20G.%20Santos%20Hwy%2C%20Angat%2C%203012%20Bulacan" target="_blank" style="color: #44a11c;">
          Angat, Bulacan Philippines
        </a>
      </li>
    </ul>
    <p>We look forward to seeing you in training!</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const tesdaEnrollmentEmailTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">Enrollment Confirmed - TESDA NC1</h2>
    <p>Hello ${name},</p>
    <p>You are now officially enrolled in the TESDA NC1 Agricultural Course.</p>
    <p>Stay tuned for updates and feel free to join our community page for support and announcements.</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const tesdaGraduationEmailTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">🎓 Congratulations, ${name}!</h2>
    <p>You’ve successfully completed the TESDA NC1 Agricultural Course.</p>
    <p>We’re proud of your achievement and excited for what’s ahead. Keep growing and making an impact!</p>
    <br>
    <p>Warmest regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const karitonRiderRegistrationEmailTemplate = (name, code) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">Kariton Rider Registration Successful</h2>
    <p>Hello ${name},</p>
    <p>Welcome aboard! You have been successfully registered as a <strong>Kariton Rider</strong>.</p>
    <p>Use the following login code to access your rider dashboard:</p>
    <h1 style="text-align: center; font-size: 24px; letter-spacing: 2px; background:rgba(157, 255, 36, 0.56); padding: 10px; border-radius: 5px;">${code}</h1>
    <p>Please keep this code secure. If you did not request this registration, kindly ignore this email.</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const sellerRegistrationApprovedEmailTemplate = (name, storeName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #44a11c; margin: 0; padding: 10px 0;">Seller Account Approved</h2>
    </div>
    <div style="background: white; padding: 20px; border-radius: 6px;">
      <p style="color: #333;">Hello <strong>${name}</strong>,</p>
      <p style="color: #555;">Your seller account for <strong>${storeName}</strong> has been approved!</p>
      <p style="color: #555;">You can now access your seller dashboard and start listing products.</p>
      <div style="background: #f0f8e8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 3px solid #44a11c;">
        <p style="color: #2d7412; margin: 0;">Need help? Contact our support team at digitaltumana@gmail.com</p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <p style="color: #777; font-size: 14px;">Best regards,<br><strong>Digital Tumana Team</strong></p>
    </div>
  </div>
`;

export const sellerRegistrationRejectedEmailTemplate = (name, storeName, reason = "") => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #e74c3c; margin: 0; padding: 10px 0;">Seller Application Update</h2>
    </div>
    <div style="background: white; padding: 20px; border-radius: 6px;">
      <p style="color: #333;">Hello <strong>${name}</strong>,</p>
      <p style="color: #555;">Your seller account application for <strong>${storeName}</strong> could not be approved.</p>
      ${reason ? `<p style="color: #555;"><strong>Reason:</strong> ${reason}</p>` : ''}
      <p style="color: #555;">You may review and resubmit your application with corrected information.</p>
    </div>
    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <p style="color: #777; font-size: 14px;">Best regards,<br><strong>Digital Tumana Team</strong></p>
    </div>
  </div>
`;

export const employerRegistrationApprovedEmailTemplate = (name, companyName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #44a11c; margin: 0; padding: 10px 0;">Employer Account Approved</h2>
    </div>
    <div style="background: white; padding: 20px; border-radius: 6px;">
      <p style="color: #333;">Hello <strong>${name}</strong>,</p>
      <p style="color: #555;">Your employer account for <strong>${companyName}</strong> has been approved!</p>
      <p style="color: #555;">You can now post job listings and hire qualified workers.</p>
      <div style="background: #f0f8e8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 3px solid #44a11c;">
        <p style="color: #2d7412; margin: 0;">Need assistance? Contact us at digitaltumana@gmail.com</p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <p style="color: #777; font-size: 14px;">Best regards,<br><strong>Digital Tumana Team</strong></p>
    </div>
  </div>
`;

export const employerRegistrationRejectedEmailTemplate = (name, companyName, reason = "") => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #e74c3c; margin: 0; padding: 10px 0;">Employer Application Update</h2>
    </div>
    <div style="background: white; padding: 20px; border-radius: 6px;">
      <p style="color: #333;">Hello <strong>${name}</strong>,</p>
      <p style="color: #555;">Your employer account application for <strong>${companyName}</strong> could not be approved.</p>
      ${reason ? `<p style="color: #555;"><strong>Reason:</strong> ${reason}</p>` : ''}
      <p style="color: #555;">Please review your application and documentation requirements.</p>
    </div>
    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <p style="color: #777; font-size: 14px;">Best regards,<br><strong>Digital Tumana Team</strong></p>
    </div>
  </div>
`;

export const workerRegistrationApprovedEmailTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #44a11c; margin: 0; padding: 10px 0;">Worker Account Approved</h2>
    </div>
    <div style="background: white; padding: 20px; border-radius: 6px;">
      <p style="color: #333;">Hello <strong>${name}</strong>,</p>
      <p style="color: #555;">Your worker account has been approved!</p>
      <p style="color: #555;">You can now browse job opportunities and apply for positions.</p>
      <div style="background: #f0f8e8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 3px solid #44a11c;">
        <p style="color: #2d7412; margin: 0;">Complete your profile to increase hiring chances</p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <p style="color: #777; font-size: 14px;">Best regards,<br><strong>Digital Tumana Team</strong></p>
    </div>
  </div>
`;

export const workerRegistrationRejectedEmailTemplate = (name, reason = "") => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #e74c3c; margin: 0; padding: 10px 0;">Worker Application Update</h2>
    </div>
    <div style="background: white; padding: 20px; border-radius: 6px;">
      <p style="color: #333;">Hello <strong>${name}</strong>,</p>
      <p style="color: #555;">Your worker account application could not be approved.</p>
      ${reason ? `<p style="color: #555;"><strong>Reason:</strong> ${reason}</p>` : ''}
      <p style="color: #555;">Please review your application and ensure all documents are valid.</p>
    </div>
    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <p style="color: #777; font-size: 14px;">Best regards,<br><strong>Digital Tumana Team</strong></p>
    </div>
  </div>
`;

export const customerRegistrationApprovedEmailTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #44a11c; margin: 0; padding: 10px 0;">Customer Account Verified</h2>
    </div>
    <div style="background: white; padding: 20px; border-radius: 6px;">
      <p style="color: #333;">Hello <strong>${name}</strong>,</p>
      <p style="color: #555;">Your customer account has been successfully verified!</p>
      <p style="color: #555;">You now have full access to browse and purchase products.</p>
      <div style="background: #f0f8e8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 3px solid #44a11c;">
        <p style="color: #2d7412; margin: 0;">Start exploring our marketplace today</p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <p style="color: #777; font-size: 14px;">Best regards,<br><strong>Digital Tumana Team</strong></p>
    </div>
  </div>
`;

export const customerRegistrationRejectedEmailTemplate = (name, reason = "") => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #e74c3c; margin: 0; padding: 10px 0;">Verification Update</h2>
    </div>
    <div style="background: white; padding: 20px; border-radius: 6px;">
      <p style="color: #333;">Hello <strong>${name}</strong>,</p>
      <p style="color: #555;">We were unable to verify your customer account.</p>
      ${reason ? `<p style="color: #555;"><strong>Reason:</strong> ${reason}</p>` : ''}
      <p style="color: #555;">Please review your identification documents and resubmit.</p>
    </div>
    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
      <p style="color: #777; font-size: 14px;">Best regards,<br><strong>Digital Tumana Team</strong></p>
    </div>
  </div>
`;

export const karitonLoginResetEmailTemplate = (name, code) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">Kariton Rider Login Reset</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset your login code. Use the following verification code to proceed:</p>
    <h1 style="text-align: center; font-size: 24px; letter-spacing: 2px; background:rgba(157, 255, 36, 0.56); padding: 10px; border-radius: 5px;">${code}</h1>
    <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes for security reasons.</p>
    <p>If you didn't request this login code reset, please ignore this email.</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;

export const karitonNewLoginCodeEmailTemplate = (name, newLoginCode) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color:rgb(68, 161, 28);">Your New Kariton Rider Login Code</h2>
    <p>Hello ${name},</p>
    <p>Your login code has been successfully reset. Here is your new permanent login code:</p>
    <h1 style="text-align: center; font-size: 24px; letter-spacing: 2px; background:rgba(157, 255, 36, 0.56); padding: 10px; border-radius: 5px;">${newLoginCode}</h1>
    <p style="color: #666; font-size: 14px;">Please keep this code secure and use it to log in to your rider dashboard.</p>
    <p>If you did not request this change, please contact support immediately.</p>
    <br>
    <p>Best regards,</p>
    <p><strong>Digital Tumana Team</strong></p>
  </div>
`;
