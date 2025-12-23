import { BaseRepository } from './base.repository.js';
import { User, IUser } from '../models/user.model.js';
import { UserRole } from '../enums/user.enum.js';

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
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<IUser[]> {
    return await this.findAll({ filter: { role } });
  }

  /**
   * Find active users
   */
  async findActiveUsers(): Promise<IUser[]> {
    return await this.findAll({ filter: { status: 'active' } });
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<IUser> {
    return await this.updateById(userId, { refreshToken } as Partial<IUser>);
  }

  /**
   * Format user document - remove sensitive fields
   */
  protected override formatDocument(document: any): IUser {
    if (!document) return document;

    // Remove sensitive fields
    const formatted = { ...document };
    delete (formatted as any).password;
    delete (formatted as any).refreshToken;
    delete (formatted as any).__v;

    return formatted as IUser;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
