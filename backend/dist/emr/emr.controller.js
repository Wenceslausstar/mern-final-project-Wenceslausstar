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
exports.EmrController = void 0;
const common_1 = require("@nestjs/common");
const emr_service_1 = require("./emr.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_schema_1 = require("../users/schemas/user.schema");
let EmrController = class EmrController {
    emrService;
    constructor(emrService) {
        this.emrService = emrService;
    }
    async createMedicalRecord(createData, req) {
        return this.emrService.createMedicalRecord({
            ...createData,
            doctorId: req.user.id,
        });
    }
    async findAllMedicalRecords() {
        return this.emrService.findAllMedicalRecords();
    }
    async getMyPatientsRecords(req) {
        return this.emrService.findMedicalRecordsByDoctor(req.user.id);
    }
    async getMyMedicalRecords(req) {
        return this.emrService.findMedicalRecordsByPatient(req.user.id);
    }
    async findMedicalRecord(id, req) {
        const record = await this.emrService.findMedicalRecordById(id);
        const { role, id: userId } = req.user;
        if (role === user_schema_1.UserRole.PATIENT && record.patientId.toString() !== userId) {
            throw new Error('Access denied');
        }
        if (role === user_schema_1.UserRole.DOCTOR &&
            record.doctorId.toString() !== userId &&
            record.patientId.toString() !== userId) {
            throw new Error('Access denied');
        }
        return record;
    }
    async updateMedicalRecord(id, updateData, req) {
        const record = await this.emrService.findMedicalRecordById(id);
        if (record.doctorId.toString() !== req.user.id) {
            throw new Error('Access denied');
        }
        return this.emrService.updateMedicalRecord(id, updateData);
    }
    async deleteMedicalRecord(id, req) {
        const record = await this.emrService.findMedicalRecordById(id);
        const { role, id: userId } = req.user;
        if (role === user_schema_1.UserRole.DOCTOR && record.doctorId.toString() !== userId) {
            throw new Error('Access denied');
        }
        await this.emrService.deleteMedicalRecord(id);
        return { message: 'Medical record deleted successfully' };
    }
    async createPrescription(createData, req) {
        return this.emrService.createPrescription({
            ...createData,
            doctorId: req.user.id,
        });
    }
    async findAllPrescriptions() {
        return this.emrService.findAllPrescriptions();
    }
    async getMyPrescriptions(req) {
        const { role, id } = req.user;
        if (role === user_schema_1.UserRole.DOCTOR) {
            return this.emrService.findPrescriptionsByDoctor(id);
        }
        else {
            return this.emrService.findPrescriptionsByPatient(id);
        }
    }
    async findPrescription(id, req) {
        const prescription = await this.emrService.findPrescriptionById(id);
        const { role, id: userId } = req.user;
        if (role === user_schema_1.UserRole.PATIENT &&
            prescription.patientId.toString() !== userId) {
            throw new Error('Access denied');
        }
        if (role === user_schema_1.UserRole.DOCTOR &&
            prescription.doctorId.toString() !== userId) {
            throw new Error('Access denied');
        }
        return prescription;
    }
    async updatePrescription(id, updateData, req) {
        const prescription = await this.emrService.findPrescriptionById(id);
        if (prescription.doctorId.toString() !== req.user.id) {
            throw new Error('Access denied');
        }
        return this.emrService.updatePrescription(id, updateData);
    }
    async updatePrescriptionStatus(id, body, req) {
        const prescription = await this.emrService.findPrescriptionById(id);
        const { role, id: userId } = req.user;
        if (role === user_schema_1.UserRole.DOCTOR &&
            prescription.doctorId.toString() !== userId) {
            throw new Error('Access denied');
        }
        return this.emrService.updatePrescriptionStatus(id, body.status);
    }
    async deletePrescription(id, req) {
        const prescription = await this.emrService.findPrescriptionById(id);
        const { role, id: userId } = req.user;
        if (role === user_schema_1.UserRole.DOCTOR &&
            prescription.doctorId.toString() !== userId) {
            throw new Error('Access denied');
        }
        await this.emrService.deletePrescription(id);
        return { message: 'Prescription deleted successfully' };
    }
    async getPatientHistory(patientId) {
        return this.emrService.getPatientMedicalHistory(patientId);
    }
    async getPatientSummary(patientId) {
        return this.emrService.getPatientSummary(patientId);
    }
    async getMyHistory(req) {
        return this.emrService.getPatientMedicalHistory(req.user.id);
    }
    async getMySummary(req) {
        return this.emrService.getPatientSummary(req.user.id);
    }
    async downloadPrescriptionPdf(id, req, res) {
        const prescription = await this.emrService.findPrescriptionById(id);
        const { role, id: userId } = req.user;
        if (role === user_schema_1.UserRole.PATIENT &&
            prescription.patientId.toString() !== userId) {
            throw new Error('Access denied');
        }
        if (role === user_schema_1.UserRole.DOCTOR &&
            prescription.doctorId.toString() !== userId) {
            throw new Error('Access denied');
        }
        const pdfBuffer = await this.emrService.generatePrescriptionPdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=prescription-${prescription.prescriptionNumber}.pdf`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
    }
    async downloadMedicalRecordPdf(id, req, res) {
        const record = await this.emrService.findMedicalRecordById(id);
        const { role, id: userId } = req.user;
        if (role === user_schema_1.UserRole.PATIENT && record.patientId.toString() !== userId) {
            throw new Error('Access denied');
        }
        if (role === user_schema_1.UserRole.DOCTOR &&
            record.doctorId.toString() !== userId &&
            record.patientId.toString() !== userId) {
            throw new Error('Access denied');
        }
        const pdfBuffer = await this.emrService.generateMedicalRecordPdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=medical-record-${record._id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
    }
};
exports.EmrController = EmrController;
__decorate([
    (0, common_1.Post)('records'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "createMedicalRecord", null);
__decorate([
    (0, common_1.Get)('records'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.DOCTOR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "findAllMedicalRecords", null);
__decorate([
    (0, common_1.Get)('records/my-patients'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "getMyPatientsRecords", null);
__decorate([
    (0, common_1.Get)('records/my-records'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "getMyMedicalRecords", null);
__decorate([
    (0, common_1.Get)('records/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "findMedicalRecord", null);
__decorate([
    (0, common_1.Put)('records/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "updateMedicalRecord", null);
__decorate([
    (0, common_1.Delete)('records/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "deleteMedicalRecord", null);
__decorate([
    (0, common_1.Post)('prescriptions'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "createPrescription", null);
__decorate([
    (0, common_1.Get)('prescriptions'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.DOCTOR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "findAllPrescriptions", null);
__decorate([
    (0, common_1.Get)('prescriptions/my-prescriptions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "getMyPrescriptions", null);
__decorate([
    (0, common_1.Get)('prescriptions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "findPrescription", null);
__decorate([
    (0, common_1.Put)('prescriptions/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "updatePrescription", null);
__decorate([
    (0, common_1.Put)('prescriptions/:id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "updatePrescriptionStatus", null);
__decorate([
    (0, common_1.Delete)('prescriptions/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "deletePrescription", null);
__decorate([
    (0, common_1.Get)('patients/:patientId/history'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "getPatientHistory", null);
__decorate([
    (0, common_1.Get)('patients/:patientId/summary'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "getPatientSummary", null);
__decorate([
    (0, common_1.Get)('my-history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "getMyHistory", null);
__decorate([
    (0, common_1.Get)('my-summary'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "getMySummary", null);
__decorate([
    (0, common_1.Get)('prescriptions/:id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "downloadPrescriptionPdf", null);
__decorate([
    (0, common_1.Get)('records/:id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmrController.prototype, "downloadMedicalRecordPdf", null);
exports.EmrController = EmrController = __decorate([
    (0, common_1.Controller)('emr'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [emr_service_1.EmrService])
], EmrController);
//# sourceMappingURL=emr.controller.js.map