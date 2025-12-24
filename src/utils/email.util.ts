import nodemailer from 'nodemailer';
import { envConfig } from '@/configs/env.config.js';
import { logger } from '@/configs/logger.config.js';

// Mailtrap transporter for development
const createTransporter = () => {
  if (envConfig.isDevelopment || envConfig.isTest) {
    // Mailtrap Sandbox configuration
    return nodemailer.createTransport({
      host: envConfig.email.mailtrapHost,
      port: envConfig.email.mailtrapPort,
      auth: {
        user: envConfig.email.mailtrapUser,
        pass: envConfig.email.mailtrapPass,
      },
    });
  }

  // Production: Use Brevo or other SMTP service
  // TODO: Configure production email service later
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
      user: 'api',
      pass: envConfig.email.brevoApiKey,
    },
  });
};

const transporter = createTransporter();

/**
 * Send verification email to user with 5-digit code
 */
export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationCode: string
): Promise<void> => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - ${envConfig.appName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4F46E5;
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .content h2 {
      color: #1f2937;
      margin-bottom: 15px;
    }
    .content p {
      color: #4b5563;
      margin-bottom: 15px;
    }
    .code-container {
      text-align: center;
      margin: 30px 0;
    }
    .verification-code {
      display: inline-block;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: #ffffff;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 8px;
      padding: 20px 40px;
      border-radius: 12px;
      font-family: 'Courier New', monospace;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 14px;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 15px;
      margin: 20px 0;
      border-radius: 0 5px 5px 0;
    }
    .warning p {
      margin: 0;
      color: #92400e;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 ${envConfig.appName}</h1>
    </div>

    <div class="content">
      <h2>Welcome, ${name}! 👋</h2>
      <p>Thank you for registering with ${envConfig.appName}. To complete your registration and start your learning journey, please use the verification code below:</p>

      <div class="code-container">
        <div class="verification-code">${verificationCode}</div>
      </div>

      <p style="text-align: center; color: #6b7280;">Enter this code in the app to verify your email address.</p>

      <div class="warning">
        <p>⏰ This code will expire in <strong>5 minutes</strong>. If it expires, you'll need to request a new verification code.</p>
      </div>
    </div>

    <div class="footer">
      <p>If you didn't create an account with ${envConfig.appName}, please ignore this email.</p>
      <p>&copy; ${new Date().getFullYear()} ${envConfig.appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Welcome to ${envConfig.appName}!

Hi ${name},

Thank you for registering. Your verification code is:

${verificationCode}

Enter this code in the app to verify your email address.
This code will expire in 5 minutes.

If you didn't create an account with ${envConfig.appName}, please ignore this email.

© ${new Date().getFullYear()} ${envConfig.appName}. All rights reserved.
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${envConfig.email.fromName}" <${envConfig.email.from}>`,
      to: email,
      subject: `Verify Your Email - ${envConfig.appName}`,
      text: textContent,
      html: htmlContent,
    });

    logger.info(`Verification email sent to ${email}`, {
      messageId: info.messageId,
      response: info.response,
    });
  } catch (error) {
    logger.error('Failed to send verification email', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${envConfig.clientUrl}/reset-password/${resetToken}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - ${envConfig.appName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4F46E5;
      margin: 0;
      font-size: 28px;
    }
    .content h2 {
      color: #1f2937;
      margin-bottom: 15px;
    }
    .content p {
      color: #4b5563;
      margin-bottom: 15px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .reset-button {
      display: inline-block;
      background-color: #DC2626;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .link-fallback {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 5px;
      word-break: break-all;
      font-size: 14px;
      color: #6b7280;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 14px;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 15px;
      margin: 20px 0;
      border-radius: 0 5px 5px 0;
    }
    .warning p {
      margin: 0;
      color: #92400e;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 ${envConfig.appName}</h1>
    </div>

    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>

      <div class="button-container">
        <a href="${resetUrl}" class="reset-button">Reset Password</a>
      </div>

      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <div class="link-fallback">
        ${resetUrl}
      </div>

      <div class="warning">
        <p>⏰ This reset link will expire in <strong>10 minutes</strong>. If it expires, you'll need to request a new password reset.</p>
      </div>

      <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${envConfig.appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Password Reset Request - ${envConfig.appName}

Hi ${name},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 10 minutes.

If you didn't request a password reset, please ignore this email.

© ${new Date().getFullYear()} ${envConfig.appName}. All rights reserved.
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${envConfig.email.fromName}" <${envConfig.email.from}>`,
      to: email,
      subject: `Reset Your Password - ${envConfig.appName}`,
      text: textContent,
      html: htmlContent,
    });

    logger.info(`Password reset email sent to ${email}`, {
      messageId: info.messageId,
    });
  } catch (error) {
    logger.error('Failed to send password reset email', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Verify transporter connection
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    logger.info('Email transporter is ready');
    return true;
  } catch (error) {
    logger.error('Email transporter verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
};
