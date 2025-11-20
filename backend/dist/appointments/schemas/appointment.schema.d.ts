import { Document, Types } from 'mongoose';
export type AppointmentDocument = Appointment & Document;
export declare enum AppointmentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    REJECTED = "rejected"
}
export declare enum AppointmentType {
    CONSULTATION = "consultation",
    FOLLOW_UP = "follow_up",
    EMERGENCY = "emergency",
    CHECKUP = "checkup"
}
export declare class Appointment {
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    appointmentDate: Date;
    duration: number;
    type: AppointmentType;
    status: AppointmentStatus;
    symptoms?: string;
    notes?: string;
    diagnosis?: string;
    prescription?: string;
    meetingLink?: string;
    cancellationReason?: string;
    isEmergency: boolean;
    followUpDate?: Date;
    metadata?: {
        createdBy?: string;
        updatedBy?: string;
        source?: string;
    };
}
export declare const AppointmentSchema: import("mongoose").Schema<Appointment, import("mongoose").Model<Appointment, any, any, any, Document<unknown, any, Appointment, any, {}> & Appointment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Appointment, Document<unknown, {}, import("mongoose").FlatRecord<Appointment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Appointment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
