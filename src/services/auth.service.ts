import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/error.util.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { IUser } from '../models/user.model.js';
import { UserRole, UserStatus } from '../enums/user.enum.js';
import { generateVerificationCode, hashToken } from '../utils/crypto.util.js';
import { sendVerificationEmail } from '../utils/email.util.js';
import { logger } from '../configs/logger.config.js';

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
      status: UserStatus.PENDING,
      isEmailVerified: false,
    } as Partial<IUser>);

    // Generate 5-digit verification code
    const { code, hashedCode, codeExpiry } = generateVerificationCode();

    // Save hashed code to user
    await userRepository.updateVerificationToken(
      user._id.toString(),
      hashedCode,
      codeExpiry
    );

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, code);
    } catch (error) {
      logger.error('Failed to send verification email during registration', {
        userId: user._id.toString(),
        email: user.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to send verification email'
      );
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
   * Login user
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    // Find user with password field (raw Mongoose document with instance methods)
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Please verify your email before logging in. Check your inbox for the verification link.'
      );
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is not active');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Wrong password');
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

    // Find user with refresh token
    const user = await userRepository.findByIdWithRefreshToken(payload.userId);
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

  /**
   * Update current user profile
   */
  async updateProfile(
    userId: string,
    data: { name?: string; email?: string; avatar?: string }
  ): Promise<IUser> {
    const user = await userRepository.findById(userId);
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

    return await userRepository.updateById(userId, data as Partial<IUser>);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Find user with password
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Current password is incorrect');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<IUser> {
    // Hash the token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find user with valid verification token
    const user = await userRepository.findByVerificationToken(hashedToken);
    if (!user) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid or expired verification token'
      );
    }

    // Mark email as verified
    const verifiedUser = await userRepository.verifyEmail(user._id.toString());

    logger.info('Email verified successfully', {
      userId: user._id.toString(),
      email: user.email,
    });

    return verifiedUser;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    if (user.isEmailVerified) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email is already verified');
    }

    // Generate new 5-digit verification code
    const { code, hashedCode, codeExpiry } = generateVerificationCode();

    // Save hashed code to user
    await userRepository.updateVerificationToken(
      user._id.toString(),
      hashedCode,
      codeExpiry
    );

    // Send verification email
    await sendVerificationEmail(user.email, user.name, code);

    logger.info('Verification email resent', {
      userId: user._id.toString(),
      email: user.email,
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
