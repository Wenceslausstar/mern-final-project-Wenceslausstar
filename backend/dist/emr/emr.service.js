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
exports.EmrService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const medical_record_schema_1 = require("./schemas/medical-record.schema");
const prescription_schema_1 = require("./schemas/prescription.schema");
const pdf_service_1 = require("./pdf.service");
let EmrService = class EmrService {
    medicalRecordModel;
    prescriptionModel;
    pdfService;
    constructor(medicalRecordModel, prescriptionModel, pdfService) {
        this.medicalRecordModel = medicalRecordModel;
        this.prescriptionModel = prescriptionModel;
        this.pdfService = pdfService;
    }
    async createMedicalRecord(createData) {
        const record = new this.medicalRecordModel(createData);
        return record.save();
    }
    async findAllMedicalRecords() {
        return this.medicalRecordModel
            .find()
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName email specialization')
            .populate('appointmentId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findMedicalRecordsByPatient(patientId) {
        return this.medicalRecordModel
            .find({ patientId })
            .populate('doctorId', 'firstName lastName email specialization')
            .populate('appointmentId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findMedicalRecordsByDoctor(doctorId) {
        return this.medicalRecordModel
            .find({ doctorId })
            .populate('patientId', 'firstName lastName email')
            .populate('appointmentId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findMedicalRecordById(id) {
        const record = await this.medicalRecordModel
            .findById(id)
            .populate('patientId', 'firstName lastName email phoneNumber dateOfBirth')
            .populate('doctorId', 'firstName lastName email specialization licenseNumber')
            .populate('appointmentId')
            .exec();
        if (!record) {
            throw new common_1.NotFoundException('Medical record not found');
        }
        return record;
    }
    async updateMedicalRecord(id, updateData) {
        const record = await this.medicalRecordModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName email specialization')
            .exec();
        if (!record) {
            throw new common_1.NotFoundException('Medical record not found');
        }
        return record;
    }
    async deleteMedicalRecord(id) {
        const result = await this.medicalRecordModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Medical record not found');
        }
    }
    async createPrescription(createData) {
        const prescriptionNumber = await this.generatePrescriptionNumber();
        const prescription = new this.prescriptionModel({
            ...createData,
            prescriptionNumber,
            issueDate: new Date(),
        });
        return prescription.save();
    }
    async findAllPrescriptions() {
        return this.prescriptionModel
            .find()
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName email specialization')
            .populate('appointmentId')
            .populate('medicalRecordId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findPrescriptionsByPatient(patientId) {
        return this.prescriptionModel
            .find({ patientId })
            .populate('doctorId', 'firstName lastName email specialization')
            .populate('appointmentId')
            .populate('medicalRecordId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findPrescriptionsByDoctor(doctorId) {
        return this.prescriptionModel
            .find({ doctorId })
            .populate('patientId', 'firstName lastName email')
            .populate('appointmentId')
            .populate('medicalRecordId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findPrescriptionById(id) {
        const prescription = await this.prescriptionModel
            .findById(id)
            .populate('patientId', 'firstName lastName email phoneNumber dateOfBirth')
            .populate('doctorId', 'firstName lastName email specialization licenseNumber')
            .populate('appointmentId')
            .populate('medicalRecordId')
            .exec();
        if (!prescription) {
            throw new common_1.NotFoundException('Prescription not found');
        }
        return prescription;
    }
    async updatePrescription(id, updateData) {
        const prescription = await this.prescriptionModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName email specialization')
            .exec();
        if (!prescription) {
            throw new common_1.NotFoundException('Prescription not found');
        }
        return prescription;
    }
    async updatePrescriptionStatus(id, status) {
        return this.updatePrescription(id, { status });
    }
    async deletePrescription(id) {
        const result = await this.prescriptionModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Prescription not found');
        }
    }
    async generatePrescriptionNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const lastPrescription = await this.prescriptionModel
            .findOne({
            prescriptionNumber: new RegExp(`^RX${year}${month}${day}`),
        })
            .sort({ prescriptionNumber: -1 })
            .exec();
        let sequence = 1;
        if (lastPrescription) {
            const lastSequence = parseInt(lastPrescription.prescriptionNumber.slice(-4));
            sequence = lastSequence + 1;
        }
        return `RX${year}${month}${day}${String(sequence).padStart(4, '0')}`;
    }
    async getPatientMedicalHistory(patientId) {
        const [records, prescriptions] = await Promise.all([
            this.findMedicalRecordsByPatient(patientId),
            this.findPrescriptionsByPatient(patientId),
        ]);
        return { records, prescriptions };
    }
    async getPatientSummary(patientId) {
        const records = await this.medicalRecordModel.find({ patientId }).exec();
        const prescriptions = await this.prescriptionModel
            .find({ patientId })
            .exec();
        const summary = {
            totalRecords: records.length,
            totalPrescriptions: prescriptions.length,
            recordTypes: records.reduce((acc, record) => {
                acc[record.type] = (acc[record.type] || 0) + 1;
                return acc;
            }, {}),
            activePrescriptions: prescriptions.filter((p) => p.status === prescription_schema_1.PrescriptionStatus.ACTIVE).length,
            lastVisit: records.length > 0 ? records[0].createdAt : null,
        };
        return summary;
    }
    async generatePrescriptionPdf(prescriptionId) {
        const prescription = await this.findPrescriptionById(prescriptionId);
        return this.pdfService.generatePrescriptionPdf(prescription);
    }
    async generateMedicalRecordPdf(recordId) {
        const record = await this.findMedicalRecordById(recordId);
        return this.pdfService.generateMedicalRecordPdf(record);
    }
};
exports.EmrService = EmrService;
exports.EmrService = EmrService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(medical_record_schema_1.MedicalRecord.name)),
    __param(1, (0, mongoose_1.InjectModel)(prescription_schema_1.Prescription.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        pdf_service_1.PdfService])
], EmrService);
//# sourceMappingURL=emr.service.js.map