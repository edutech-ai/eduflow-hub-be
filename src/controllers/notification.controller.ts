import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service.js';
import { HTTP_STATUS } from '../constants/http.constant.js';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any).userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as 'READ' | 'UNREAD' | undefined;

  const { notifications, unreadCount } = await notificationService.getUserNotifications(userId, {
    page,
    limit,
    status,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total: notifications.length,
      },
    },
  });
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any).userId;
  const { id } = req.params;

  const notification = await notificationService.markAsRead(id!, userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any).userId;

  const result = await notificationService.markAllAsRead(userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `${result.count} notifications marked as read`,
    data: result,
  });
};
