import { Controller, Get, Patch, Delete, Param, UseGuards, Req, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Get all notifications for the current user
  @Get()
  async getUserNotifications(@Req() req: any, @Query('limit') limit?: string) {
    const user = req.user;
    const userType = user.role === 'BRAND' ? 'BRAND' : user.role === 'ADMIN' ? 'ADMIN' : 'INFLUENCER';
    const userId = user.role === 'BRAND' ? user.brand?.id : user.role === 'ADMIN' ? user.id : user.influencer?.id;

    const notifications = await this.notificationsService.getUserNotifications(
      userId,
      userType,
      limit ? parseInt(limit) : 50,
    );

    return {
      success: true,
      data: notifications,
    };
  }

  // Get unread notification count
  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const user = req.user;
    const userType = user.role === 'BRAND' ? 'BRAND' : user.role === 'ADMIN' ? 'ADMIN' : 'INFLUENCER';
    const userId = user.role === 'BRAND' ? user.brand?.id : user.role === 'ADMIN' ? user.id : user.influencer?.id;

    const count = await this.notificationsService.getUnreadCount(userId, userType);

    return {
      success: true,
      data: { count },
    };
  }

  // Mark a notification as read
  @Patch(':id/read')
  async markAsRead(@Req() req: any, @Param('id') notificationId: string) {
    const user = req.user;
    const userId = user.role === 'BRAND' ? user.brand?.id : user.role === 'ADMIN' ? user.id : user.influencer?.id;

    await this.notificationsService.markAsRead(notificationId, userId);

    return {
      success: true,
      message: 'Notification marked as read',
    };
  }

  // Mark all notifications as read
  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const user = req.user;
    const userType = user.role === 'BRAND' ? 'BRAND' : user.role === 'ADMIN' ? 'ADMIN' : 'INFLUENCER';
    const userId = user.role === 'BRAND' ? user.brand?.id : user.role === 'ADMIN' ? user.id : user.influencer?.id;

    await this.notificationsService.markAllAsRead(userId, userType);

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  // Delete a notification
  @Delete(':id')
  async delete(@Req() req: any, @Param('id') notificationId: string) {
    const user = req.user;
    const userId = user.role === 'BRAND' ? user.brand?.id : user.role === 'ADMIN' ? user.id : user.influencer?.id;

    await this.notificationsService.delete(notificationId, userId);

    return {
      success: true,
      message: 'Notification deleted',
    };
  }

  // Delete all notifications
  @Delete()
  async deleteAll(@Req() req: any) {
    const user = req.user;
    const userType = user.role === 'BRAND' ? 'BRAND' : user.role === 'ADMIN' ? 'ADMIN' : 'INFLUENCER';
    const userId = user.role === 'BRAND' ? user.brand?.id : user.role === 'ADMIN' ? user.id : user.influencer?.id;

    await this.notificationsService.deleteAll(userId, userType);

    return {
      success: true,
      message: 'All notifications deleted',
    };
  }
}
