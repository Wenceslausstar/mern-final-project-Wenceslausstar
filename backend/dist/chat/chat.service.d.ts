import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
export declare class ChatService {
    private messageModel;
    constructor(messageModel: Model<MessageDocument>);
    createMessage(createData: Partial<Message>): Promise<MessageDocument>;
    findMessagesBetweenUsers(userId1: string, userId2: string, limit?: number, skip?: number): Promise<MessageDocument[]>;
    findMessagesByAppointment(appointmentId: string): Promise<MessageDocument[]>;
    markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
    getUnreadMessageCount(userId: string): Promise<number>;
    getConversationList(userId: string): Promise<any[]>;
    deleteMessage(messageId: string, userId: string): Promise<void>;
    getOnlineUsers(): Promise<string[]>;
    updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void>;
    getMessageById(messageId: string): Promise<MessageDocument>;
}
