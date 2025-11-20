import { Model } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from './schemas/medical-record.schema';
import { Prescription, PrescriptionDocument, PrescriptionStatus } from './schemas/prescription.schema';
import { PdfService } from './pdf.service';
export declare class EmrService {
    private medicalRecordModel;
    private prescriptionModel;
    private pdfService;
    constructor(medicalRecordModel: Model<MedicalRecordDocument>, prescriptionModel: Model<PrescriptionDocument>, pdfService: PdfService);
    createMedicalRecord(createData: Partial<MedicalRecord>): Promise<MedicalRecordDocument>;
    findAllMedicalRecords(): Promise<MedicalRecordDocument[]>;
    findMedicalRecordsByPatient(patientId: string): Promise<MedicalRecordDocument[]>;
    findMedicalRecordsByDoctor(doctorId: string): Promise<MedicalRecordDocument[]>;
    findMedicalRecordById(id: string): Promise<MedicalRecordDocument>;
    updateMedicalRecord(id: string, updateData: Partial<MedicalRecord>): Promise<MedicalRecordDocument>;
    deleteMedicalRecord(id: string): Promise<void>;
    createPrescription(createData: Partial<Prescription>): Promise<PrescriptionDocument>;
    findAllPrescriptions(): Promise<PrescriptionDocument[]>;
    findPrescriptionsByPatient(patientId: string): Promise<PrescriptionDocument[]>;
    findPrescriptionsByDoctor(doctorId: string): Promise<PrescriptionDocument[]>;
    findPrescriptionById(id: string): Promise<PrescriptionDocument>;
    updatePrescription(id: string, updateData: Partial<Prescription>): Promise<PrescriptionDocument>;
    updatePrescriptionStatus(id: string, status: PrescriptionStatus): Promise<PrescriptionDocument>;
    deletePrescription(id: string): Promise<void>;
    private generatePrescriptionNumber;
    getPatientMedicalHistory(patientId: string): Promise<{
        records: MedicalRecordDocument[];
        prescriptions: PrescriptionDocument[];
    }>;
    getPatientSummary(patientId: string): Promise<any>;
    generatePrescriptionPdf(prescriptionId: string): Promise<Buffer>;
    generateMedicalRecordPdf(recordId: string): Promise<Buffer>;
}
