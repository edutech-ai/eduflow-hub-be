import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { ApiError } from '../utils/error.util.js';
import { HTTP_STATUS } from '../constants/http.constant.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Access token is required',
        'MISSING_TOKEN'
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Access token is required',
        'MISSING_TOKEN'
      );
    }

    // Verify token
    try {
      const decoded = verifyAccessToken(token);

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Access token has expired',
          'TOKEN_EXPIRED'
        );
      }

      if (error.name === 'JsonWebTokenError') {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Invalid access token',
          'INVALID_TOKEN'
        );
      }

      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
          };
        } catch {
          // Token invalid but optional, so continue
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
