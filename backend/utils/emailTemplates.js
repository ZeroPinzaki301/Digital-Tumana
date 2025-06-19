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