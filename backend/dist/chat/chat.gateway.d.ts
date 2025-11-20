import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
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
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    private logger;
    private connectedUsers;
    constructor(chatService: ChatService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket, ...args: any[]): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleSendMessage(client: AuthenticatedSocket, data: SendMessageDto): Promise<{
        error: string;
    } | undefined>;
    handleJoinAppointmentRoom(client: AuthenticatedSocket, data: JoinRoomDto): Promise<{
        error: string;
    } | undefined>;
    handleLeaveAppointmentRoom(client: AuthenticatedSocket, data: JoinRoomDto): Promise<void>;
    handleSendAppointmentMessage(client: AuthenticatedSocket, data: SendMessageDto): Promise<{
        error: string;
    } | undefined>;
    handleMarkMessagesRead(client: AuthenticatedSocket, data: {
        senderId: string;
    }): Promise<{
        error: string;
    } | undefined>;
    handleGetOnlineUsers(client: AuthenticatedSocket): Promise<{
        error: string;
    } | undefined>;
    handleTypingStart(client: AuthenticatedSocket, data: {
        receiverId: string;
    }): Promise<void>;
    handleTypingStop(client: AuthenticatedSocket, data: {
        receiverId: string;
    }): Promise<void>;
    handleWebRTCOffer(client: AuthenticatedSocket, data: WebRTCSignalDto): Promise<void>;
    handleWebRTCAnswer(client: AuthenticatedSocket, data: WebRTCSignalDto): Promise<void>;
    handleWebRTCIceCandidate(client: AuthenticatedSocket, data: WebRTCSignalDto): Promise<void>;
    handleStartVideoCall(client: AuthenticatedSocket, data: {
        appointmentId: string;
        receiverId: string;
    }): Promise<void>;
    handleEndVideoCall(client: AuthenticatedSocket, data: {
        appointmentId: string;
        receiverId: string;
    }): Promise<void>;
    private sendNotification;
    sendNotificationToUser(userId: string, notification: any): Promise<void>;
    getConnectedUsersCount(): number;
}
export {};
