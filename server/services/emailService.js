const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For development, use console logging
  // For production, configure with real SMTP settings
  if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
    return {
      sendMail: async (options) => {
        console.log('\n📧 ========== EMAIL SENT ==========');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        
        // Extract and display verification/reset links from HTML
        const html = options.html || '';
        const linkMatch = html.match(/href="([^"]+)"/g);
        if (linkMatch && linkMatch.length > 0) {
          const links = linkMatch.map(match => match.replace('href="', '').replace('"', ''));
          console.log('\n🔗 VERIFICATION/RESET LINK(S):');
          links.forEach((link, index) => {
            console.log(`   ${index + 1}. ${link}`);
          });
        }
        
        // Also show the full body for reference
        console.log('\n📄 Full Email Body (HTML):');
        console.log('────────────────────────────────────────');
        const textBody = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        console.log(textBody.substring(0, 500) + (textBody.length > 500 ? '...' : ''));
        console.log('────────────────────────────────────────\n');
        return { messageId: `dev-${Date.now()}` };
      }
    };
  }

  // Production email configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

/**
 * Send email verification email
 */
exports.sendVerificationEmail = async (email, name, verificationToken) => {
  // URL encode the token to handle special characters
  const encodedToken = encodeURIComponent(verificationToken);
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${encodedToken}`;
  
  // Log the verification link clearly for development
  console.log('\n🔗 ========== VERIFICATION LINK ==========');
  console.log(`Email: ${email}`);
  console.log(`Token (raw): ${verificationToken.substring(0, 30)}...`);
  console.log(`Token (encoded): ${encodedToken.substring(0, 30)}...`);
  console.log(`Link: ${verificationUrl}`);
  console.log('===========================================\n');

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@adventus.io',
    to: email,
    subject: 'Verify Your Email Address - Adventus',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Adventus!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for registering with Adventus! Please verify your email address to complete your registration and access your dashboard.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with Adventus, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Adventus. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name},
      
      Thank you for registering with Adventus! Please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account with Adventus, please ignore this email.
      
      © ${new Date().getFullYear()} Adventus. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId || 'dev mode');
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  // Log the reset link clearly for development
  console.log('\n🔗 ========== PASSWORD RESET LINK ==========');
  console.log(`Email: ${email}`);
  console.log(`Link: ${resetUrl}`);
  console.log('===========================================\n');

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@adventus.io',
    to: email,
    subject: 'Reset Your Password - Adventus',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Adventus. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name},
      
      You requested to reset your password. Click the link below to create a new password:
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      
      © ${new Date().getFullYear()} Adventus. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId || 'dev mode');
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

module.exports = exports;
