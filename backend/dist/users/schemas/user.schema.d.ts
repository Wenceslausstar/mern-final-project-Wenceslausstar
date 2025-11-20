import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    ADMIN = "admin",
    DOCTOR = "doctor",
    PATIENT = "patient"
}
export declare class User {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    phoneNumber?: string;
    dateOfBirth?: Date;
    gender?: string;
    address?: string;
    specialization?: string;
    licenseNumber?: string;
    profilePicture?: string;
    isActive: boolean;
    lastLogin?: Date;
    medicalHistory?: {
        allergies?: string[];
        medications?: string[];
        conditions?: string[];
        surgeries?: string[];
    };
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
