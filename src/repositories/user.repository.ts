import { BaseRepository } from './base.repository.js';
import { User, IUser } from '../models/user.model.js';
import { UserRole, UserStatus } from '../enums/user.enum.js';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email });
  }

  /**
   * Find user by email with password (for authentication)
   * Returns raw Mongoose document with instance methods
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    const user = await this.model.findOne({ email }).select('+password +refreshToken').exec();
    return user;
  }

  /**
   * Find user by ID with refresh token (for token refresh)
   */
  async findByIdWithRefreshToken(id: string): Promise<IUser | null> {
    const user = await this.model.findById(id).select('+refreshToken').exec();
    return user;
  }

  /**
   * Find user by ID with password (for password change)
   */
  async findByIdWithPassword(id: string): Promise<IUser | null> {
    const user = await this.model.findById(id).select('+password').exec();
    return user;
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<IUser[]> {
    return await this.findAll({ filter: { role } });
  }

  /**
   * Find active users
   */
  async findActiveUsers(): Promise<IUser[]> {
    return await this.findAll({ filter: { status: UserStatus.ACTIVE } });
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<IUser> {
    return await this.updateById(userId, { refreshToken } as Partial<IUser>);
  }

  /**
   * Update verification token
   */
  async updateVerificationToken(
    userId: string,
    verificationToken: string,
    verificationTokenExpiry: Date
  ): Promise<IUser> {
    return await this.updateById(userId, {
      verificationToken,
      verificationTokenExpiry,
    } as Partial<IUser>);
  }

  /**
   * Find user by verification token
   */
  async findByVerificationToken(hashedToken: string): Promise<IUser | null> {
    const user = await this.model
      .findOne({
        verificationToken: hashedToken,
        verificationTokenExpiry: { $gt: new Date() },
      })
      .select('+verificationToken +verificationTokenExpiry')
      .exec();
    return user;
  }

  /**
   * Mark email as verified and clear verification token
   */
  async verifyEmail(userId: string): Promise<IUser> {
    const user = await this.model.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        verificationToken: undefined,
        verificationTokenExpiry: undefined,
        status: UserStatus.ACTIVE,
      },
      { new: true }
    );
    return user as IUser;
  }

  /**
   * Format user document - remove sensitive fields
   */
  protected override formatDocument(document: any): IUser {
    if (!document) return document;

    // Convert Mongoose document to plain object (preserves _id)
    const obj = document.toObject ? document.toObject() : document;

    // Remove sensitive fields
    delete obj.password;
    delete obj.refreshToken;
    delete obj.__v;

    return obj as IUser;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
