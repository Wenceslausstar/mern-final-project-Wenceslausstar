import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Message,
  MessageDocument,
  MessageType,
} from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(createData: Partial<Message>): Promise<MessageDocument> {
    const message = new this.messageModel(createData);
    return message.save();
  }

  async findMessagesBetweenUsers(
    userId1: string,
    userId2: string,
    limit: number = 50,
    skip: number = 0,
  ): Promise<MessageDocument[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      })
      .populate('senderId', 'firstName lastName email')
      .populate('receiverId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async findMessagesByAppointment(
    appointmentId: string,
  ): Promise<MessageDocument[]> {
    return this.messageModel
      .find({ appointmentId })
      .populate('senderId', 'firstName lastName email')
      .populate('receiverId', 'firstName lastName email')
      .sort({ createdAt: 1 })
      .exec();
  }

  async markMessagesAsRead(
    senderId: string,
    receiverId: string,
  ): Promise<void> {
    await this.messageModel.updateMany(
      {
        senderId,
        receiverId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      receiverId: userId,
      isRead: false,
    });
  }

  async getConversationList(userId: string): Promise<any[]> {
    // Get the latest message for each conversation
    const conversations = await this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: new Types.ObjectId(userId) },
            { receiverId: new Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: {
                $eq: ['$senderId', new Types.ObjectId(userId)],
              },
              then: '$receiverId',
              else: '$senderId',
            },
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        '$receiverId',
                        new Types.ObjectId(userId),
                      ],
                    },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          user: {
            id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            email: '$user.email',
            role: '$user.role',
          },
          lastMessage: {
            id: '$lastMessage._id',
            content: '$lastMessage.content',
            type: '$lastMessage.type',
            createdAt: '$lastMessage.createdAt',
            isRead: '$lastMessage.isRead',
          },
          unreadCount: 1,
        },
      },
    ]);

    return conversations;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only allow sender to delete their own messages
    if (message.senderId.toString() !== userId) {
      throw new Error('Access denied');
    }

    // Soft delete by marking as deleted
    message.metadata = {
      ...message.metadata,
      deleted: true,
      deletedAt: new Date(),
    };

    await message.save();
  }

  async getOnlineUsers(): Promise<string[]> {
    // This would typically be managed by Redis or similar
    // For now, return empty array
    return [];
  }

  async updateUserOnlineStatus(
    userId: string,
    isOnline: boolean,
  ): Promise<void> {
    // This would typically update Redis or similar
    // For now, just log
    console.log(`User ${userId} is ${isOnline ? 'online' : 'offline'}`);
  }

  async getMessageById(messageId: string): Promise<MessageDocument> {
    const message = await this.messageModel
      .findById(messageId)
      .populate('senderId', 'firstName lastName email')
      .populate('receiverId', 'firstName lastName email')
      .exec();

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }
}
