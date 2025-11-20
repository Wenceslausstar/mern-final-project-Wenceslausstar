import { Document, Types } from 'mongoose';
export type MessageDocument = Message & Document;
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    FILE = "file",
    SYSTEM = "system"
}
export declare class Message {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    appointmentId?: Types.ObjectId;
    type: MessageType;
    content: string;
    fileUrl?: string;
    fileName?: string;
    isRead: boolean;
    readAt?: Date;
    metadata?: {
        edited?: boolean;
        editedAt?: Date;
        deleted?: boolean;
        deletedAt?: Date;
    };
}
export declare const MessageSchema: import("mongoose").Schema<Message, import("mongoose").Model<Message, any, any, any, Document<unknown, any, Message, any, {}> & Message & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, Document<unknown, {}, import("mongoose").FlatRecord<Message>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Message> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
