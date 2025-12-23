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
    message: 'User registered successfully',
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
  const userId = req.user!.userId; // Set by authenticate middleware

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
  const userId = req.user!.userId; // Set by authenticate middleware

  const user = await authService.getCurrentUser(userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: user,
  });
};
