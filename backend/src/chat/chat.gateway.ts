import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { ChatService } from './chat.service';
import { MessageType } from './schemas/message.schema';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface SendMessageDto {
  receiverId: string;
  content: string;
  type?: string;
  appointmentId?: string;
  fileUrl?: string;
  fileName?: string;
}

interface JoinRoomDto {
  appointmentId: string;
}

interface WebRTCSignalDto {
  appointmentId: string;
  signal: any;
  to: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket, ...args: any[]) {
    try {
      // Extract user info from handshake (would be set by auth middleware)
      const userId = client.handshake.query.userId as string;
      const userRole = client.handshake.query.userRole as string;

      if (userId) {
        client.userId = userId;
        client.userRole = userRole;
        this.connectedUsers.set(userId, client.id);

        // Update user online status
        await this.chatService.updateUserOnlineStatus(userId, true);

        // Notify friends/contacts that user is online
        this.server.emit('user_online', { userId });

        this.logger.log(`User ${userId} connected with socket ${client.id}`);
      }
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);

      // Update user offline status
      await this.chatService.updateUserOnlineStatus(client.userId, false);

      // Notify friends/contacts that user is offline
      this.server.emit('user_offline', { userId: client.userId });

      // Leave all rooms
      const rooms = Array.from(client.rooms).filter(
        (room) => room !== client.id,
      );
      rooms.forEach((room) => client.leave(room));

      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      // Create message in database
      const message = await this.chatService.createMessage({
        senderId: new Types.ObjectId(client.userId),
        receiverId: new Types.ObjectId(data.receiverId),
        content: data.content,
        type: (data.type as MessageType) || MessageType.TEXT,
        appointmentId: data.appointmentId
          ? new Types.ObjectId(data.appointmentId)
          : undefined,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
      });

      // Populate message with user details
      const populatedMessage = await this.chatService.getMessageById(
        message._id.toString(),
      );

      // Send to receiver if online
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server
          .to(receiverSocketId)
          .emit('receive_message', populatedMessage);
      }

      // Send confirmation to sender
      client.emit('message_sent', populatedMessage);

      // Send notification
      this.sendNotification(data.receiverId, {
        type: 'message',
        title: 'New Message',
        content: `You have a new message from ${populatedMessage.senderId['firstName']} ${populatedMessage.senderId['lastName']}`,
        data: populatedMessage,
      });
    } catch (error) {
      this.logger.error('Send message error:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('join_appointment_room')
  async handleJoinAppointmentRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinRoomDto,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    client.join(`appointment_${data.appointmentId}`);
    client.emit('joined_room', { appointmentId: data.appointmentId });

    this.logger.log(
      `User ${client.userId} joined appointment room ${data.appointmentId}`,
    );
  }

  @SubscribeMessage('leave_appointment_room')
  async handleLeaveAppointmentRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinRoomDto,
  ) {
    client.leave(`appointment_${data.appointmentId}`);
    client.emit('left_room', { appointmentId: data.appointmentId });
  }

  @SubscribeMessage('send_appointment_message')
  async handleSendAppointmentMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      if (!client.userId || !data.appointmentId) {
        return { error: 'Unauthorized or missing appointment ID' };
      }

      // Create message in database
      const message = await this.chatService.createMessage({
        senderId: new Types.ObjectId(client.userId),
        receiverId: new Types.ObjectId(data.receiverId),
        content: data.content,
        type: (data.type as MessageType) || MessageType.TEXT,
        appointmentId: data.appointmentId
          ? new Types.ObjectId(data.appointmentId)
          : undefined,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
      });

      // Populate message
      const populatedMessage = await this.chatService.getMessageById(
        message._id.toString(),
      );

      // Send to appointment room
      this.server
        .to(`appointment_${data.appointmentId}`)
        .emit('appointment_message', populatedMessage);
    } catch (error) {
      this.logger.error('Send appointment message error:', error);
      client.emit('error', { message: 'Failed to send appointment message' });
    }
  }

  @SubscribeMessage('mark_messages_read')
  async handleMarkMessagesRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { senderId: string },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    await this.chatService.markMessagesAsRead(data.senderId, client.userId);
    client.emit('messages_marked_read', { senderId: data.senderId });
  }

  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const onlineUsers = await this.chatService.getOnlineUsers();
    client.emit('online_users', onlineUsers);
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string },
  ) {
    if (!client.userId) return;

    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server
        .to(receiverSocketId)
        .emit('typing_start', { userId: client.userId });
    }
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string },
  ) {
    if (!client.userId) return;

    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server
        .to(receiverSocketId)
        .emit('typing_stop', { userId: client.userId });
    }
  }

  // WebRTC Signaling for video calls
  @SubscribeMessage('webrtc_offer')
  async handleWebRTCOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: WebRTCSignalDto,
  ) {
    const receiverSocketId = this.connectedUsers.get(data.to);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('webrtc_offer', {
        from: client.userId,
        signal: data.signal,
        appointmentId: data.appointmentId,
      });
    }
  }

  @SubscribeMessage('webrtc_answer')
  async handleWebRTCAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: WebRTCSignalDto,
  ) {
    const receiverSocketId = this.connectedUsers.get(data.to);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('webrtc_answer', {
        from: client.userId,
        signal: data.signal,
        appointmentId: data.appointmentId,
      });
    }
  }

  @SubscribeMessage('webrtc_ice_candidate')
  async handleWebRTCIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: WebRTCSignalDto,
  ) {
    const receiverSocketId = this.connectedUsers.get(data.to);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('webrtc_ice_candidate', {
        from: client.userId,
        signal: data.signal,
        appointmentId: data.appointmentId,
      });
    }
  }

  @SubscribeMessage('start_video_call')
  async handleStartVideoCall(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { appointmentId: string; receiverId: string },
  ) {
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('incoming_video_call', {
        from: client.userId,
        appointmentId: data.appointmentId,
        caller: {
          id: client.userId,
          name: 'User', // Would populate with actual user name
        },
      });
    }
  }

  @SubscribeMessage('end_video_call')
  async handleEndVideoCall(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { appointmentId: string; receiverId: string },
  ) {
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('video_call_ended', {
        from: client.userId,
        appointmentId: data.appointmentId,
      });
    }
  }

  // Notification helper
  private sendNotification(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  // Public method to send notifications from other services
  async sendNotificationToUser(userId: string, notification: any) {
    this.sendNotification(userId, notification);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }
}
