/* eslint-disable @typescript-eslint/no-explicit-any */
import { notificationRepository } from '../repositories/notification.repository.js';
import { ApiError } from '../utils/error.util.js';
import { HTTP_STATUS } from '../constants/http.constant.js';
import { INotification } from '../models/notification.model.js';
import { NotificationType } from '../enums/notification.enum.js';

export class NotificationService {
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<INotification> {
    return await notificationRepository.create({
      user: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
    } as any);
  }

  async getUserNotifications(
    userId: string,
    options: { page?: number; limit?: number; status?: 'READ' | 'UNREAD' } = {}
  ): Promise<{ notifications: INotification[]; unreadCount: number }> {
    const notifications = await notificationRepository.findByUser(userId, options);
    const unreadCount = await notificationRepository.countUnread(userId);

    return { notifications, unreadCount };
  }

  async getUnreadNotifications(userId: string): Promise<INotification[]> {
    return await notificationRepository.findUnreadByUser(userId);
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notification not found');
    }

    // Check ownership
    if (notification.user.toString() !== userId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You can only access your own notifications');
    }

    return await notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await notificationRepository.markAllAsRead(userId);
    return { count };
  }

  /**
   * Delete old read notifications (cleanup job)
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    return await notificationRepository.deleteOldReadNotifications(daysOld);
  }

  // ============================================
  // Notification Templates
  // ============================================

  /**
   * Send account created notification
   */
  async notifyAccountCreated(userId: string, userName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.ACCOUNT_CREATED,
      title: 'Welcome to EduFlow Hub!',
      message: `Hello ${userName}, your account has been created successfully. Please verify your email to get started.`,
    });
  }

  /**
   * Send email verified notification
   */
  async notifyEmailVerified(userId: string, userName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.EMAIL_VERIFIED,
      title: 'Email Verified Successfully',
      message: `Congratulations ${userName}! Your email has been verified. You can now access all features.`,
    });
  }

  /**
   * Send password changed notification
   */
  async notifyPasswordChanged(userId: string, userName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.PASSWORD_CHANGED,
      title: 'Password Changed',
      message: `Hi ${userName}, your password has been changed successfully. If you didn't make this change, please contact support immediately.`,
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
