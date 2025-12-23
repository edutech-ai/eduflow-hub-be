import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { asyncHandler } from '../utils/async-handler.util.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly, isOwnerOrAdmin } from '../middlewares/authorize.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  deleteUserSchema,
} from '../validators/user.validator.js';

const router = Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Authenticated users - students can see the list of teachers)
 * @query   page, limit, role, status
 * @example GET /api/v1/users?role=teacher&status=active&page=1&limit=10
 */
router.get('/', authenticate, asyncHandler(userController.getAllUsers));

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Authenticated users)
 */
router.get(
  '/:id',
  authenticate,
  validate(getUserByIdSchema),
  asyncHandler(userController.getUserById)
);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user (Admin only)
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  adminOnly,
  validate(createUserSchema),
  asyncHandler(userController.createUser)
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin or own profile)
 */
router.put(
  '/:id',
  authenticate,
  isOwnerOrAdmin('id'),
  validate(updateUserSchema),
  asyncHandler(userController.updateUser)
);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Update user status (Admin only)
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/status',
  authenticate,
  adminOnly,
  asyncHandler(userController.updateUserStatus)
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  adminOnly,
  validate(deleteUserSchema),
  asyncHandler(userController.deleteUser)
);

export default router;
