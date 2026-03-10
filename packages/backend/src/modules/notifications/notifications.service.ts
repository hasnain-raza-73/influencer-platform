import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // Create a notification
  async create(
    userId: string,
    userType: 'BRAND' | 'INFLUENCER' | 'ADMIN',
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: any,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user_id: userId,
      user_type: userType,
      type,
      title,
      message,
      link,
      metadata,
    });

    return this.notificationRepository.save(notification);
  }

  // Get all notifications for a user
  async getUserNotifications(
    userId: string,
    userType: 'BRAND' | 'INFLUENCER' | 'ADMIN',
    limit: number = 50,
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        user_id: userId,
        user_type: userType,
      },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  // Get unread notification count
  async getUnreadCount(userId: string, userType: 'BRAND' | 'INFLUENCER' | 'ADMIN'): Promise<number> {
    return this.notificationRepository.count({
      where: {
        user_id: userId,
        user_type: userType,
        is_read: false,
      },
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, user_id: userId },
      { is_read: true },
    );
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string, userType: 'BRAND' | 'INFLUENCER' | 'ADMIN'): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, user_type: userType, is_read: false },
      { is_read: true },
    );
  }

  // Delete a notification
  async delete(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({
      id: notificationId,
      user_id: userId,
    });
  }

  // Delete all notifications for a user
  async deleteAll(userId: string, userType: 'BRAND' | 'INFLUENCER' | 'ADMIN'): Promise<void> {
    await this.notificationRepository.delete({
      user_id: userId,
      user_type: userType,
    });
  }
}
