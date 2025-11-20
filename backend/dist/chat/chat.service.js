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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
let ChatService = class ChatService {
    messageModel;
    constructor(messageModel) {
        this.messageModel = messageModel;
    }
    async createMessage(createData) {
        const message = new this.messageModel(createData);
        return message.save();
    }
    async findMessagesBetweenUsers(userId1, userId2, limit = 50, skip = 0) {
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
    async findMessagesByAppointment(appointmentId) {
        return this.messageModel
            .find({ appointmentId })
            .populate('senderId', 'firstName lastName email')
            .populate('receiverId', 'firstName lastName email')
            .sort({ createdAt: 1 })
            .exec();
    }
    async markMessagesAsRead(senderId, receiverId) {
        await this.messageModel.updateMany({
            senderId,
            receiverId,
            isRead: false,
        }, {
            isRead: true,
            readAt: new Date(),
        });
    }
    async getUnreadMessageCount(userId) {
        return this.messageModel.countDocuments({
            receiverId: userId,
            isRead: false,
        });
    }
    async getConversationList(userId) {
        const conversations = await this.messageModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: new mongoose_2.Types.ObjectId(userId) },
                        { receiverId: new mongoose_2.Types.ObjectId(userId) },
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
                                $eq: ['$senderId', new mongoose_2.Types.ObjectId(userId)],
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
                                                new mongoose_2.Types.ObjectId(userId),
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
    async deleteMessage(messageId, userId) {
        const message = await this.messageModel.findById(messageId);
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderId.toString() !== userId) {
            throw new Error('Access denied');
        }
        message.metadata = {
            ...message.metadata,
            deleted: true,
            deletedAt: new Date(),
        };
        await message.save();
    }
    async getOnlineUsers() {
        return [];
    }
    async updateUserOnlineStatus(userId, isOnline) {
        console.log(`User ${userId} is ${isOnline ? 'online' : 'offline'}`);
    }
    async getMessageById(messageId) {
        const message = await this.messageModel
            .findById(messageId)
            .populate('senderId', 'firstName lastName email')
            .populate('receiverId', 'firstName lastName email')
            .exec();
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        return message;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ChatService);
//# sourceMappingURL=chat.service.js.map