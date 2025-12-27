import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/error.util.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import { UserRole } from '../enums/user.enum.js';

/**
 * Authorization middleware factory
 * Checks if user has one of the allowed roles
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 *
 * @example
 * // Only admin can access
 * router.delete('/users/:id', authenticate, authorize([UserRole.ADMIN]), deleteUser);
 *
 * @example
 * // Admin or teacher can access
 * router.post('/lessons', authenticate, authorize([UserRole.ADMIN, UserRole.TEACHER]), createLesson);
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'NOT_AUTHENTICATED');
      }

      // Check if user has one of the allowed roles
      const userRole = (req.user as any).role as UserRole;

      if (!allowedRoles.includes(userRole)) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          'INSUFFICIENT_PERMISSIONS'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Shorthand: Only admin can access
 */
export const adminOnly = authorize([UserRole.ADMIN]);

/**
 * Shorthand: Admin or teacher can access
 */
export const teacherOrAdmin = authorize([UserRole.ADMIN, UserRole.TEACHER]);

/**
 * Middleware to check if user is accessing their own resource or is admin
 *
 * @example
 * router.put('/users/:id', authenticate, isOwnerOrAdmin('id'), updateUser);
 */
export const isOwnerOrAdmin = (paramName: string = 'id') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required', 'NOT_AUTHENTICATED');
      }

      const resourceId = req.params[paramName];
      const userId = (req.user as any).userId || (req.user as any)._id?.toString();
      const userRole = (req.user as any).role as UserRole;

      // Allow if user is admin OR accessing their own resource
      if (userRole === UserRole.ADMIN || resourceId === userId) {
        next();
      } else {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You can only access your own resources', 'INSUFFICIENT_PERMISSIONS');
      }
    } catch (error) {
      next(error);
    }
  };
};
