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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionSchema = exports.Prescription = exports.PrescriptionStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PrescriptionStatus;
(function (PrescriptionStatus) {
    PrescriptionStatus["ACTIVE"] = "active";
    PrescriptionStatus["COMPLETED"] = "completed";
    PrescriptionStatus["CANCELLED"] = "cancelled";
    PrescriptionStatus["EXPIRED"] = "expired";
})(PrescriptionStatus || (exports.PrescriptionStatus = PrescriptionStatus = {}));
let Prescription = class Prescription {
    patientId;
    doctorId;
    appointmentId;
    medicalRecordId;
    prescriptionNumber;
    medications;
    diagnosis;
    notes;
    status;
    issueDate;
    expiryDate;
    allergies;
    pharmacy;
    pdfUrl;
    metadata;
};
exports.Prescription = Prescription;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Prescription.prototype, "patientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Prescription.prototype, "doctorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Appointment' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Prescription.prototype, "appointmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'MedicalRecord' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Prescription.prototype, "medicalRecordId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Prescription.prototype, "prescriptionNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                medicationName: { type: String, required: true },
                genericName: String,
                strength: String,
                dosage: { type: String, required: true },
                frequency: { type: String, required: true },
                duration: { type: String, required: true },
                quantity: { type: Number, required: true },
                instructions: String,
                refills: { type: Number, default: 0 },
            },
        ],
        required: true,
    }),
    __metadata("design:type", Array)
], Prescription.prototype, "medications", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Prescription.prototype, "diagnosis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Prescription.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: PrescriptionStatus,
        default: PrescriptionStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Prescription.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Prescription.prototype, "issueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Prescription.prototype, "expiryDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Prescription.prototype, "allergies", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Prescription.prototype, "pharmacy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Prescription.prototype, "pdfUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Prescription.prototype, "metadata", void 0);
exports.Prescription = Prescription = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Prescription);
exports.PrescriptionSchema = mongoose_1.SchemaFactory.createForClass(Prescription);
exports.PrescriptionSchema.index({ patientId: 1, createdAt: -1 });
exports.PrescriptionSchema.index({ doctorId: 1, createdAt: -1 });
exports.PrescriptionSchema.index({ prescriptionNumber: 1 }, { unique: true });
exports.PrescriptionSchema.index({ status: 1 });
exports.PrescriptionSchema.index({ expiryDate: 1 });
//# sourceMappingURL=prescription.schema.js.map