import { PrescriptionDocument } from './schemas/prescription.schema';
export declare class PdfService {
    generatePrescriptionPdf(prescription: PrescriptionDocument): Promise<Buffer>;
    generateMedicalRecordPdf(record: any): Promise<Buffer>;
}
