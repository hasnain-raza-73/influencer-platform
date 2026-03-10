import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  // Send a message
  async create(senderId: string, senderType: 'BRAND' | 'INFLUENCER', createMessageDto: CreateMessageDto): Promise<Message> {
    const { recipient_id, recipient_type, message, campaign_id } = createMessageDto;

    const messageData: Partial<Message> = {
      sender_id: senderId,
      sender_type: senderType,
      message,
      campaign_id,
    };

    // Set brand_id and influencer_id based on sender and recipient
    if (senderType === 'BRAND') {
      messageData.brand_id = senderId;
      messageData.influencer_id = recipient_type === 'INFLUENCER' ? recipient_id : undefined;
    } else {
      messageData.influencer_id = senderId;
      messageData.brand_id = recipient_type === 'BRAND' ? recipient_id : undefined;
    }

    const newMessage = this.messageRepository.create(messageData);
    return this.messageRepository.save(newMessage);
  }

  // Get conversation between brand and influencer
  async getConversation(brandId: string, influencerId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { brand_id: brandId, influencer_id: influencerId },
      ],
      order: { created_at: 'ASC' },
    });
  }

  // Get all conversations for a brand
  async getBrandConversations(brandId: string): Promise<any[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.brand_id = :brandId', { brandId })
      .leftJoinAndSelect('message.influencer', 'influencer')
      .leftJoinAndSelect('influencer.user', 'user')
      .orderBy('message.created_at', 'DESC')
      .getMany();

    // Group by influencer
    const grouped = messages.reduce((acc: any, msg: any) => {
      if (!msg.influencer_id) return acc;

      if (!acc[msg.influencer_id]) {
        acc[msg.influencer_id] = {
          influencer_id: msg.influencer_id,
          influencer_name: msg.influencer?.display_name || msg.influencer?.user?.email || 'Unknown',
          last_message: msg.message,
          last_message_at: msg.created_at,
          unread_count: 0,
        };
      }

      if (!msg.is_read && msg.sender_type === 'INFLUENCER') {
        acc[msg.influencer_id].unread_count++;
      }

      return acc;
    }, {});

    return Object.values(grouped);
  }

  // Get all conversations for an influencer
  async getInfluencerConversations(influencerId: string): Promise<any[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.influencer_id = :influencerId', { influencerId })
      .leftJoinAndSelect('message.brand', 'brand')
      .orderBy('message.created_at', 'DESC')
      .getMany();

    // Group by brand
    const grouped = messages.reduce((acc: any, msg: any) => {
      if (!msg.brand_id) return acc;

      if (!acc[msg.brand_id]) {
        acc[msg.brand_id] = {
          brand_id: msg.brand_id,
          brand_name: msg.brand?.company_name || 'Unknown',
          last_message: msg.message,
          last_message_at: msg.created_at,
          unread_count: 0,
        };
      }

      if (!msg.is_read && msg.sender_type === 'BRAND') {
        acc[msg.brand_id].unread_count++;
      }

      return acc;
    }, {});

    return Object.values(grouped);
  }

  // Mark messages as read
  async markAsRead(userId: string, userType: 'BRAND' | 'INFLUENCER', conversationWithId: string): Promise<void> {
    const whereCondition: any = { is_read: false };

    if (userType === 'BRAND') {
      whereCondition.brand_id = userId;
      whereCondition.influencer_id = conversationWithId;
      whereCondition.sender_type = 'INFLUENCER';
    } else {
      whereCondition.influencer_id = userId;
      whereCondition.brand_id = conversationWithId;
      whereCondition.sender_type = 'BRAND';
    }

    await this.messageRepository.update(whereCondition, { is_read: true });
  }

  // Get unread count
  async getUnreadCount(userId: string, userType: 'BRAND' | 'INFLUENCER'): Promise<number> {
    const whereCondition: any = { is_read: false };

    if (userType === 'BRAND') {
      whereCondition.brand_id = userId;
      whereCondition.sender_type = 'INFLUENCER';
    } else {
      whereCondition.influencer_id = userId;
      whereCondition.sender_type = 'BRAND';
    }

    return this.messageRepository.count({ where: whereCondition });
  }
}
