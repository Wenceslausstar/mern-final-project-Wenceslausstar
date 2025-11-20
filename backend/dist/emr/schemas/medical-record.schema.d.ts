import { Document, Types } from 'mongoose';
export type MedicalRecordDocument = MedicalRecord & Document;
export declare enum VitalSigns {
    BLOOD_PRESSURE = "blood_pressure",
    HEART_RATE = "heart_rate",
    TEMPERATURE = "temperature",
    WEIGHT = "weight",
    HEIGHT = "height",
    BMI = "bmi",
    OXYGEN_SATURATION = "oxygen_saturation"
}
export declare enum RecordType {
    CONSULTATION = "consultation",
    DIAGNOSIS = "diagnosis",
    TREATMENT = "treatment",
    TEST_RESULTS = "test_results",
    VITAL_SIGNS = "vital_signs",
    ALLERGY = "allergy",
    MEDICATION = "medication",
    SURGERY = "surgery"
}
export declare class MedicalRecord {
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    appointmentId?: Types.ObjectId;
    type: RecordType;
    title: string;
    description?: string;
    symptoms?: string[];
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    vitalSigns?: {
        [VitalSigns.BLOOD_PRESSURE]?: string;
        [VitalSigns.HEART_RATE]?: number;
        [VitalSigns.TEMPERATURE]?: number;
        [VitalSigns.WEIGHT]?: number;
        [VitalSigns.HEIGHT]?: number;
        [VitalSigns.BMI]?: number;
        [VitalSigns.OXYGEN_SATURATION]?: number;
    };
    attachments?: string[];
    testResults?: {
        testName?: string;
        result?: string;
        normalRange?: string;
        unit?: string;
        date?: Date;
    };
    medications?: {
        name?: string;
        dosage?: string;
        frequency?: string;
        duration?: string;
        instructions?: string;
    };
    isConfidential: boolean;
    metadata?: {
        createdBy?: string;
        updatedBy?: string;
        source?: string;
        tags?: string[];
    };
}
export declare const MedicalRecordSchema: import("mongoose").Schema<MedicalRecord, import("mongoose").Model<MedicalRecord, any, any, any, Document<unknown, any, MedicalRecord, any, {}> & MedicalRecord & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MedicalRecord, Document<unknown, {}, import("mongoose").FlatRecord<MedicalRecord>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<MedicalRecord> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
