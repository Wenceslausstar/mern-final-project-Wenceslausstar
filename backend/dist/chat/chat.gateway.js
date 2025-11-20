"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const chat_service_1 = require("./chat.service");
const message_schema_1 = require("./schemas/message.schema");
let ChatGateway = class ChatGateway {
    chatService;
    server;
    logger = new common_1.Logger('ChatGateway');
    connectedUsers = new Map();
    constructor(chatService) {
        this.chatService = chatService;
    }
    afterInit(server) {
        this.logger.log('Chat Gateway initialized');
    }
    async handleConnection(client, ...args) {
        try {
            const userId = client.handshake.query.userId;
            const userRole = client.handshake.query.userRole;
            if (userId) {
                client.userId = userId;
                client.userRole = userRole;
                this.connectedUsers.set(userId, client.id);
                await this.chatService.updateUserOnlineStatus(userId, true);
                this.server.emit('user_online', { userId });
                this.logger.log(`User ${userId} connected with socket ${client.id}`);
            }
        }
        catch (error) {
            this.logger.error('Connection error:', error);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.userId) {
            this.connectedUsers.delete(client.userId);
            await this.chatService.updateUserOnlineStatus(client.userId, false);
            this.server.emit('user_offline', { userId: client.userId });
            const rooms = Array.from(client.rooms).filter((room) => room !== client.id);
            rooms.forEach((room) => client.leave(room));
            this.logger.log(`User ${client.userId} disconnected`);
        }
    }
    async handleSendMessage(client, data) {
        try {
            if (!client.userId) {
                return { error: 'Unauthorized' };
            }
            const message = await this.chatService.createMessage({
                senderId: new mongoose_1.Types.ObjectId(client.userId),
                receiverId: new mongoose_1.Types.ObjectId(data.receiverId),
                content: data.content,
                type: data.type || message_schema_1.MessageType.TEXT,
                appointmentId: data.appointmentId
                    ? new mongoose_1.Types.ObjectId(data.appointmentId)
                    : undefined,
                fileUrl: data.fileUrl,
                fileName: data.fileName,
            });
            const populatedMessage = await this.chatService.getMessageById(message._id.toString());
            const receiverSocketId = this.connectedUsers.get(data.receiverId);
            if (receiverSocketId) {
                this.server
                    .to(receiverSocketId)
                    .emit('receive_message', populatedMessage);
            }
            client.emit('message_sent', populatedMessage);
            this.sendNotification(data.receiverId, {
                type: 'message',
                title: 'New Message',
                content: `You have a new message from ${populatedMessage.senderId['firstName']} ${populatedMessage.senderId['lastName']}`,
                data: populatedMessage,
            });
        }
        catch (error) {
            this.logger.error('Send message error:', error);
            client.emit('error', { message: 'Failed to send message' });
        }
    }
    async handleJoinAppointmentRoom(client, data) {
        if (!client.userId) {
            return { error: 'Unauthorized' };
        }
        client.join(`appointment_${data.appointmentId}`);
        client.emit('joined_room', { appointmentId: data.appointmentId });
        this.logger.log(`User ${client.userId} joined appointment room ${data.appointmentId}`);
    }
    async handleLeaveAppointmentRoom(client, data) {
        client.leave(`appointment_${data.appointmentId}`);
        client.emit('left_room', { appointmentId: data.appointmentId });
    }
    async handleSendAppointmentMessage(client, data) {
        try {
            if (!client.userId || !data.appointmentId) {
                return { error: 'Unauthorized or missing appointment ID' };
            }
            const message = await this.chatService.createMessage({
                senderId: new mongoose_1.Types.ObjectId(client.userId),
                receiverId: new mongoose_1.Types.ObjectId(data.receiverId),
                content: data.content,
                type: data.type || message_schema_1.MessageType.TEXT,
                appointmentId: data.appointmentId
                    ? new mongoose_1.Types.ObjectId(data.appointmentId)
                    : undefined,
                fileUrl: data.fileUrl,
                fileName: data.fileName,
            });
            const populatedMessage = await this.chatService.getMessageById(message._id.toString());
            this.server
                .to(`appointment_${data.appointmentId}`)
                .emit('appointment_message', populatedMessage);
        }
        catch (error) {
            this.logger.error('Send appointment message error:', error);
            client.emit('error', { message: 'Failed to send appointment message' });
        }
    }
    async handleMarkMessagesRead(client, data) {
        if (!client.userId) {
            return { error: 'Unauthorized' };
        }
        await this.chatService.markMessagesAsRead(data.senderId, client.userId);
        client.emit('messages_marked_read', { senderId: data.senderId });
    }
    async handleGetOnlineUsers(client) {
        if (!client.userId) {
            return { error: 'Unauthorized' };
        }
        const onlineUsers = await this.chatService.getOnlineUsers();
        client.emit('online_users', onlineUsers);
    }
    async handleTypingStart(client, data) {
        if (!client.userId)
            return;
        const receiverSocketId = this.connectedUsers.get(data.receiverId);
        if (receiverSocketId) {
            this.server
                .to(receiverSocketId)
                .emit('typing_start', { userId: client.userId });
        }
    }
    async handleTypingStop(client, data) {
        if (!client.userId)
            return;
        const receiverSocketId = this.connectedUsers.get(data.receiverId);
        if (receiverSocketId) {
            this.server
                .to(receiverSocketId)
                .emit('typing_stop', { userId: client.userId });
        }
    }
    async handleWebRTCOffer(client, data) {
        const receiverSocketId = this.connectedUsers.get(data.to);
        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('webrtc_offer', {
                from: client.userId,
                signal: data.signal,
                appointmentId: data.appointmentId,
            });
        }
    }
    async handleWebRTCAnswer(client, data) {
        const receiverSocketId = this.connectedUsers.get(data.to);
        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('webrtc_answer', {
                from: client.userId,
                signal: data.signal,
                appointmentId: data.appointmentId,
            });
        }
    }
    async handleWebRTCIceCandidate(client, data) {
        const receiverSocketId = this.connectedUsers.get(data.to);
        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('webrtc_ice_candidate', {
                from: client.userId,
                signal: data.signal,
                appointmentId: data.appointmentId,
            });
        }
    }
    async handleStartVideoCall(client, data) {
        const receiverSocketId = this.connectedUsers.get(data.receiverId);
        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('incoming_video_call', {
                from: client.userId,
                appointmentId: data.appointmentId,
                caller: {
                    id: client.userId,
                    name: 'User',
                },
            });
        }
    }
    async handleEndVideoCall(client, data) {
        const receiverSocketId = this.connectedUsers.get(data.receiverId);
        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('video_call_ended', {
                from: client.userId,
                appointmentId: data.appointmentId,
            });
        }
    }
    sendNotification(userId, notification) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('notification', notification);
        }
    }
    async sendNotificationToUser(userId, notification) {
        this.sendNotification(userId, notification);
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_appointment_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinAppointmentRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_appointment_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveAppointmentRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_appointment_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendAppointmentMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_messages_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkMessagesRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_online_users'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetOnlineUsers", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc_offer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleWebRTCOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc_answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleWebRTCAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc_ice_candidate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleWebRTCIceCandidate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('start_video_call'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleStartVideoCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('end_video_call'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleEndVideoCall", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map