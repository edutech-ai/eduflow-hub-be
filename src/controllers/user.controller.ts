import { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import { UserRole, UserStatus } from '../enums/user.enum.js';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const role = req.query.role as UserRole;
  const status = req.query.status as UserStatus;

  const users = await userService.getAllUsers({ page, limit, role, status });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users,
    pagination: {
      page,
      limit,
      total: await userService.countUsers({ role, status }),
    },
  });
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'User ID is required',
    });
    return;
  }

  const user = await userService.getUserById(id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
};

/**
 * Create new user (Admin only)
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const user = await userService.createUser(req.body);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'User ID is required',
    });
    return;
  }

  const user = await userService.updateUser(id, req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
};

/**
 * Delete user
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'User ID is required',
    });
    return;
  }

  await userService.deleteUser(id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User deleted successfully',
  });
};

/**
 * Update user status
 */
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'User ID is required',
    });
    return;
  }

  const user = await userService.updateUserStatus(id, status);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User status updated successfully',
    data: user,
  });
};
