import crypto from 'crypto';

/**
 * Generate 5-digit verification code for email verification
 * Returns the code (to send in email) and hashed code (to store in DB)
 */
export const generateVerificationCode = (): {
  code: string;
  hashedCode: string;
  codeExpiry: Date;
} => {
  const code = Math.floor(10000 + Math.random() * 90000).toString();

  // Hash the code using SHA256
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  // Code expires in 5 minutes
  const codeExpiry = new Date(Date.now() + 5 * 60 * 1000);

  return { code, hashedCode, codeExpiry };
};

/**
 * Hash a token/code using SHA256
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
