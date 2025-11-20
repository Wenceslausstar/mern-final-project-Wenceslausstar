import type { Response } from 'express';
import { EmrService } from './emr.service';
import { PrescriptionStatus } from './schemas/prescription.schema';
export declare class EmrController {
    private readonly emrService;
    constructor(emrService: EmrService);
    createMedicalRecord(createData: any, req: any): Promise<import("./schemas/medical-record.schema").MedicalRecordDocument>;
    findAllMedicalRecords(): Promise<import("./schemas/medical-record.schema").MedicalRecordDocument[]>;
    getMyPatientsRecords(req: any): Promise<import("./schemas/medical-record.schema").MedicalRecordDocument[]>;
    getMyMedicalRecords(req: any): Promise<import("./schemas/medical-record.schema").MedicalRecordDocument[]>;
    findMedicalRecord(id: string, req: any): Promise<import("./schemas/medical-record.schema").MedicalRecordDocument>;
    updateMedicalRecord(id: string, updateData: any, req: any): Promise<import("./schemas/medical-record.schema").MedicalRecordDocument>;
    deleteMedicalRecord(id: string, req: any): Promise<{
        message: string;
    }>;
    createPrescription(createData: any, req: any): Promise<import("./schemas/prescription.schema").PrescriptionDocument>;
    findAllPrescriptions(): Promise<import("./schemas/prescription.schema").PrescriptionDocument[]>;
    getMyPrescriptions(req: any): Promise<import("./schemas/prescription.schema").PrescriptionDocument[]>;
    findPrescription(id: string, req: any): Promise<import("./schemas/prescription.schema").PrescriptionDocument>;
    updatePrescription(id: string, updateData: any, req: any): Promise<import("./schemas/prescription.schema").PrescriptionDocument>;
    updatePrescriptionStatus(id: string, body: {
        status: PrescriptionStatus;
    }, req: any): Promise<import("./schemas/prescription.schema").PrescriptionDocument>;
    deletePrescription(id: string, req: any): Promise<{
        message: string;
    }>;
    getPatientHistory(patientId: string): Promise<{
        records: import("./schemas/medical-record.schema").MedicalRecordDocument[];
        prescriptions: import("./schemas/prescription.schema").PrescriptionDocument[];
    }>;
    getPatientSummary(patientId: string): Promise<any>;
    getMyHistory(req: any): Promise<{
        records: import("./schemas/medical-record.schema").MedicalRecordDocument[];
        prescriptions: import("./schemas/prescription.schema").PrescriptionDocument[];
    }>;
    getMySummary(req: any): Promise<any>;
    downloadPrescriptionPdf(id: string, req: any, res: Response): Promise<void>;
    downloadMedicalRecordPdf(id: string, req: any, res: Response): Promise<void>;
}
