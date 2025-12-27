import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/http.constant.js';

/**
 * Register new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { user, tokens } = await authService.register(req.body);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    data: {
      user,
      tokens,
    },
  });
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      tokens,
    },
  });
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Token refreshed successfully',
    data: tokens,
  });
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any).userId; // Set by authenticate middleware

  await authService.logout(userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logout successful',
  });
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any).userId; // Set by authenticate middleware

  const user = await authService.getCurrentUser(userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: user,
  });
};

/**
 * Update current user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any).userId;
  const { name, email, avatar } = req.body;

  const user = await authService.updateProfile(userId, { name, email, avatar });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any).userId;
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(userId, currentPassword, newPassword);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Password changed successfully',
  });
};

/**
 * Verify email with 5-digit code
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.body;

  if (!code) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Verification code is required',
    });
    return;
  }

  const user = await authService.verifyEmail(code);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Email verified successfully. Your account is now active.',
    data: user,
  });
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  await authService.resendVerificationEmail(email);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Verification email sent successfully. Please check your inbox.',
  });
};
