import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/error.util.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import { IUser } from '../models/user.model.js';
import { UserRole, UserStatus } from '../enums/user.enum.js';

export class UserService {
  /**
   * Get all users with pagination
   */
  async getAllUsers(options: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<IUser[]> {
    const { page = 1, limit = 10, role, status } = options;

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    return await userRepository.findAll({
      filter,
      pagination: { page, limit, sort: '-createdAt' },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return user;
  }

  /**
   * Create new user
   */
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string;
  }): Promise<IUser> {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already in use');
    }

    // Admin-created users are auto-verified and active
    return await userRepository.create({
      ...data,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    } as Partial<IUser>);
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    data: { name?: string; email?: string; avatar?: string; status?: UserStatus }
  ): Promise<IUser> {
    // Check if user exists
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Check if email is being changed and already exists
    if (data.email && data.email !== user.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already in use');
      }
    }

    const updateData: Partial<IUser> = { ...data };
    if (data.status === UserStatus.ACTIVE && !user.isEmailVerified) {
      updateData.isEmailVerified = true;
    }

    return await userRepository.updateById(id, updateData);
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<IUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    return await userRepository.deleteById(id);
  }

  /**
   * Get active users
   */
  async getActiveUsers(): Promise<IUser[]> {
    return await userRepository.findActiveUsers();
  }

  /**
   * Update user status
   */
  async updateUserStatus(id: string, status: UserStatus): Promise<IUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Auto-verify email when admin sets status to ACTIVE
    const updateData: Partial<IUser> = { status };
    if (status === UserStatus.ACTIVE && !user.isEmailVerified) {
      updateData.isEmailVerified = true;
    }

    const updatedUser = await userRepository.updateById(id, updateData);

    return updatedUser;
  }

  /**
   * Count users
   */
  async countUsers(filter?: { role?: UserRole; status?: UserStatus }): Promise<number> {
    return await userRepository.count(filter || {});
  }
}

// Export singleton instance
export const userService = new UserService();
