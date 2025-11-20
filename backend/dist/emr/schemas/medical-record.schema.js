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
exports.MedicalRecordSchema = exports.MedicalRecord = exports.RecordType = exports.VitalSigns = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var VitalSigns;
(function (VitalSigns) {
    VitalSigns["BLOOD_PRESSURE"] = "blood_pressure";
    VitalSigns["HEART_RATE"] = "heart_rate";
    VitalSigns["TEMPERATURE"] = "temperature";
    VitalSigns["WEIGHT"] = "weight";
    VitalSigns["HEIGHT"] = "height";
    VitalSigns["BMI"] = "bmi";
    VitalSigns["OXYGEN_SATURATION"] = "oxygen_saturation";
})(VitalSigns || (exports.VitalSigns = VitalSigns = {}));
var RecordType;
(function (RecordType) {
    RecordType["CONSULTATION"] = "consultation";
    RecordType["DIAGNOSIS"] = "diagnosis";
    RecordType["TREATMENT"] = "treatment";
    RecordType["TEST_RESULTS"] = "test_results";
    RecordType["VITAL_SIGNS"] = "vital_signs";
    RecordType["ALLERGY"] = "allergy";
    RecordType["MEDICATION"] = "medication";
    RecordType["SURGERY"] = "surgery";
})(RecordType || (exports.RecordType = RecordType = {}));
let MedicalRecord = class MedicalRecord {
    patientId;
    doctorId;
    appointmentId;
    type;
    title;
    description;
    symptoms;
    diagnosis;
    treatment;
    notes;
    vitalSigns;
    attachments;
    testResults;
    medications;
    isConfidential;
    metadata;
};
exports.MedicalRecord = MedicalRecord;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MedicalRecord.prototype, "patientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MedicalRecord.prototype, "doctorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Appointment' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MedicalRecord.prototype, "appointmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: RecordType, required: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MedicalRecord.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], MedicalRecord.prototype, "symptoms", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "diagnosis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "treatment", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MedicalRecord.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], MedicalRecord.prototype, "vitalSigns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], MedicalRecord.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], MedicalRecord.prototype, "testResults", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], MedicalRecord.prototype, "medications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], MedicalRecord.prototype, "isConfidential", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], MedicalRecord.prototype, "metadata", void 0);
exports.MedicalRecord = MedicalRecord = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], MedicalRecord);
exports.MedicalRecordSchema = mongoose_1.SchemaFactory.createForClass(MedicalRecord);
exports.MedicalRecordSchema.index({ patientId: 1, createdAt: -1 });
exports.MedicalRecordSchema.index({ doctorId: 1, createdAt: -1 });
exports.MedicalRecordSchema.index({ appointmentId: 1 });
exports.MedicalRecordSchema.index({ type: 1 });
//# sourceMappingURL=medical-record.schema.js.map