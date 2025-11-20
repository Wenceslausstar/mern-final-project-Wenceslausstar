import { Document, Types } from 'mongoose';
export type PrescriptionDocument = Prescription & Document;
export declare enum PrescriptionStatus {
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}
export declare class Prescription {
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    appointmentId?: Types.ObjectId;
    medicalRecordId?: Types.ObjectId;
    prescriptionNumber: string;
    medications: Array<{
        medicationName: string;
        genericName?: string;
        strength?: string;
        dosage: string;
        frequency: string;
        duration: string;
        quantity: number;
        instructions?: string;
        refills: number;
    }>;
    diagnosis?: string;
    notes?: string;
    status: PrescriptionStatus;
    issueDate: Date;
    expiryDate?: Date;
    allergies?: string[];
    pharmacy?: {
        name?: string;
        address?: string;
        phone?: string;
    };
    pdfUrl?: string;
    metadata?: {
        createdBy?: string;
        updatedBy?: string;
        source?: string;
    };
}
export declare const PrescriptionSchema: import("mongoose").Schema<Prescription, import("mongoose").Model<Prescription, any, any, any, Document<unknown, any, Prescription, any, {}> & Prescription & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Prescription, Document<unknown, {}, import("mongoose").FlatRecord<Prescription>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Prescription> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
