import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MedicalRecord,
  MedicalRecordDocument,
  RecordType,
} from './schemas/medical-record.schema';
import {
  Prescription,
  PrescriptionDocument,
  PrescriptionStatus,
} from './schemas/prescription.schema';
import { PdfService } from './pdf.service';

@Injectable()
export class EmrService {
  constructor(
    @InjectModel(MedicalRecord.name)
    private medicalRecordModel: Model<MedicalRecordDocument>,
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<PrescriptionDocument>,
    private pdfService: PdfService,
  ) {}

  // Medical Records Methods
  async createMedicalRecord(
    createData: Partial<MedicalRecord>,
  ): Promise<MedicalRecordDocument> {
    const record = new this.medicalRecordModel(createData);
    return record.save();
  }

  async findAllMedicalRecords(): Promise<MedicalRecordDocument[]> {
    return this.medicalRecordModel
      .find()
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email specialization')
      .populate('appointmentId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMedicalRecordsByPatient(
    patientId: string,
  ): Promise<MedicalRecordDocument[]> {
    return this.medicalRecordModel
      .find({ patientId })
      .populate('doctorId', 'firstName lastName email specialization')
      .populate('appointmentId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMedicalRecordsByDoctor(
    doctorId: string,
  ): Promise<MedicalRecordDocument[]> {
    return this.medicalRecordModel
      .find({ doctorId })
      .populate('patientId', 'firstName lastName email')
      .populate('appointmentId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMedicalRecordById(id: string): Promise<MedicalRecordDocument> {
    const record = await this.medicalRecordModel
      .findById(id)
      .populate('patientId', 'firstName lastName email phoneNumber dateOfBirth')
      .populate(
        'doctorId',
        'firstName lastName email specialization licenseNumber',
      )
      .populate('appointmentId')
      .exec();

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }
    return record;
  }

  async updateMedicalRecord(
    id: string,
    updateData: Partial<MedicalRecord>,
  ): Promise<MedicalRecordDocument> {
    const record = await this.medicalRecordModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email specialization')
      .exec();

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }
    return record;
  }

  async deleteMedicalRecord(id: string): Promise<void> {
    const result = await this.medicalRecordModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Medical record not found');
    }
  }

  // Prescription Methods
  async createPrescription(
    createData: Partial<Prescription>,
  ): Promise<PrescriptionDocument> {
    // Generate unique prescription number
    const prescriptionNumber = await this.generatePrescriptionNumber();
    const prescription = new this.prescriptionModel({
      ...createData,
      prescriptionNumber,
      issueDate: new Date(),
    });
    return prescription.save();
  }

  async findAllPrescriptions(): Promise<PrescriptionDocument[]> {
    return this.prescriptionModel
      .find()
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email specialization')
      .populate('appointmentId')
      .populate('medicalRecordId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPrescriptionsByPatient(
    patientId: string,
  ): Promise<PrescriptionDocument[]> {
    return this.prescriptionModel
      .find({ patientId })
      .populate('doctorId', 'firstName lastName email specialization')
      .populate('appointmentId')
      .populate('medicalRecordId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPrescriptionsByDoctor(
    doctorId: string,
  ): Promise<PrescriptionDocument[]> {
    return this.prescriptionModel
      .find({ doctorId })
      .populate('patientId', 'firstName lastName email')
      .populate('appointmentId')
      .populate('medicalRecordId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPrescriptionById(id: string): Promise<PrescriptionDocument> {
    const prescription = await this.prescriptionModel
      .findById(id)
      .populate('patientId', 'firstName lastName email phoneNumber dateOfBirth')
      .populate(
        'doctorId',
        'firstName lastName email specialization licenseNumber',
      )
      .populate('appointmentId')
      .populate('medicalRecordId')
      .exec();

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }
    return prescription;
  }

  async updatePrescription(
    id: string,
    updateData: Partial<Prescription>,
  ): Promise<PrescriptionDocument> {
    const prescription = await this.prescriptionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email specialization')
      .exec();

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }
    return prescription;
  }

  async updatePrescriptionStatus(
    id: string,
    status: PrescriptionStatus,
  ): Promise<PrescriptionDocument> {
    return this.updatePrescription(id, { status });
  }

  async deletePrescription(id: string): Promise<void> {
    const result = await this.prescriptionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Prescription not found');
    }
  }

  // Helper Methods
  private async generatePrescriptionNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Find the last prescription number for today
    const lastPrescription = await this.prescriptionModel
      .findOne({
        prescriptionNumber: new RegExp(`^RX${year}${month}${day}`),
      })
      .sort({ prescriptionNumber: -1 })
      .exec();

    let sequence = 1;
    if (lastPrescription) {
      const lastSequence = parseInt(
        lastPrescription.prescriptionNumber.slice(-4),
      );
      sequence = lastSequence + 1;
    }

    return `RX${year}${month}${day}${String(sequence).padStart(4, '0')}`;
  }

  async getPatientMedicalHistory(patientId: string): Promise<{
    records: MedicalRecordDocument[];
    prescriptions: PrescriptionDocument[];
  }> {
    const [records, prescriptions] = await Promise.all([
      this.findMedicalRecordsByPatient(patientId),
      this.findPrescriptionsByPatient(patientId),
    ]);

    return { records, prescriptions };
  }

  async getPatientSummary(patientId: string): Promise<any> {
    const records = await this.medicalRecordModel.find({ patientId }).exec();
    const prescriptions = await this.prescriptionModel
      .find({ patientId })
      .exec();

    // Calculate summary statistics
    const summary = {
      totalRecords: records.length,
      totalPrescriptions: prescriptions.length,
      recordTypes: records.reduce((acc, record) => {
        acc[record.type] = (acc[record.type] || 0) + 1;
        return acc;
      }, {}),
      activePrescriptions: prescriptions.filter(
        (p) => p.status === PrescriptionStatus.ACTIVE,
      ).length,
      lastVisit: records.length > 0 ? (records[0] as any).createdAt : null,
    };

    return summary;
  }

  // PDF Generation Methods
  async generatePrescriptionPdf(prescriptionId: string): Promise<Buffer> {
    const prescription = await this.findPrescriptionById(prescriptionId);
    return this.pdfService.generatePrescriptionPdf(prescription);
  }

  async generateMedicalRecordPdf(recordId: string): Promise<Buffer> {
    const record = await this.findMedicalRecordById(recordId);
    return this.pdfService.generateMedicalRecordPdf(record);
  }
}
