import { BaseRepository } from './base.repository.js';
import { Notification, INotification } from '../models/notification.model.js';
import { NotificationStatus } from '../enums/notification.enum.js';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }

  /**
   * Find notifications by user
   */
  async findByUser(
    userId: string,
    options: { page?: number; limit?: number; status?: 'READ' | 'UNREAD' } = {}
  ): Promise<INotification[]> {
    const { page = 1, limit = 20, status } = options;

    const filter: any = { user: userId };
    if (status) {
      filter.status = status;
    }

    return await this.findAll({
      filter,
      pagination: { page, limit, sort: '-createdAt' },
    });
  }

  /**
   * Find unread notifications by user
   */
  async findUnreadByUser(userId: string): Promise<INotification[]> {
    return await this.findAll({
      filter: { user: userId, status: NotificationStatus.UNREAD },
      pagination: { sort: '-createdAt' },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<INotification> {
    return await this.updateById(id, {
      status: NotificationStatus.READ,
      readAt: new Date(),
    } as Partial<INotification>);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.model.updateMany(
      { user: userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ, readAt: new Date() }
    );
    return result.modifiedCount;
  }

  /**
   * Count unread notifications for user
   */
  async countUnread(userId: string): Promise<number> {
    return await this.count({ user: userId, status: NotificationStatus.UNREAD });
  }

  /**
   * Delete old read notifications (cleanup)
   */
  async deleteOldReadNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.model.deleteMany({
      status: NotificationStatus.READ,
      readAt: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }
}

// Export singleton instance
export const notificationRepository = new NotificationRepository();
