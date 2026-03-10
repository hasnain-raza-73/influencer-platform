import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Send a message
  @Post()
  async create(@Req() req: any, @Body() createMessageDto: CreateMessageDto) {
    const user = req.user;
    const senderType = user.role === 'BRAND' ? 'BRAND' : 'INFLUENCER';
    const senderId = user.role === 'BRAND' ? user.brand?.id : user.influencer?.id;

    const message = await this.messagesService.create(senderId, senderType, createMessageDto);

    return {
      success: true,
      data: message,
      message: 'Message sent successfully',
    };
  }

  // Get conversation with a specific user
  @Get('conversation/:userId')
  async getConversation(@Req() req: any, @Param('userId') userId: string) {
    const user = req.user;

    let messages;
    if (user.role === 'BRAND') {
      messages = await this.messagesService.getConversation(user.brand?.id, userId);
      // Mark as read
      await this.messagesService.markAsRead(user.brand?.id, 'BRAND', userId);
    } else {
      messages = await this.messagesService.getConversation(userId, user.influencer?.id);
      // Mark as read
      await this.messagesService.markAsRead(user.influencer?.id, 'INFLUENCER', userId);
    }

    return {
      success: true,
      data: messages,
    };
  }

  // Get all conversations
  @Get('conversations')
  async getConversations(@Req() req: any) {
    const user = req.user;

    let conversations;
    if (user.role === 'BRAND') {
      conversations = await this.messagesService.getBrandConversations(user.brand?.id);
    } else {
      conversations = await this.messagesService.getInfluencerConversations(user.influencer?.id);
    }

    return {
      success: true,
      data: conversations,
    };
  }

  // Get unread count
  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const user = req.user;
    const userType = user.role === 'BRAND' ? 'BRAND' : 'INFLUENCER';
    const userId = user.role === 'BRAND' ? user.brand?.id : user.influencer?.id;

    const count = await this.messagesService.getUnreadCount(userId, userType);

    return {
      success: true,
      data: { count },
    };
  }

  // Mark conversation as read
  @Patch('read/:userId')
  async markAsRead(@Req() req: any, @Param('userId') userId: string) {
    const user = req.user;
    const userType = user.role === 'BRAND' ? 'BRAND' : 'INFLUENCER';
    const currentUserId = user.role === 'BRAND' ? user.brand?.id : user.influencer?.id;

    await this.messagesService.markAsRead(currentUserId, userType, userId);

    return {
      success: true,
      message: 'Messages marked as read',
    };
  }
}
