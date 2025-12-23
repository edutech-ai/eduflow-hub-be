import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/error.util.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { IUser } from '../models/user.model.js';
import { UserRole, UserStatus } from '../enums/user.enum.js';

export class AuthService {
  /**
   * Register new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already in use');
    }

    // Create user
    const user = await userRepository.create({
      ...data,
      role: data.role || UserRole.STUDENT,
      status: UserStatus.ACTIVE,
    } as Partial<IUser>);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    await userRepository.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user,
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    // Find user with password field
    const user = await userRepository.findOne({ email });
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is not active');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    await userRepository.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user,
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Find user
    const user = await userRepository.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Update refresh token
    await userRepository.updateRefreshToken(user._id.toString(), newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return user;
  }
}

// Export singleton instance
export const authService = new AuthService();
