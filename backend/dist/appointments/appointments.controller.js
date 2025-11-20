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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const appointments_service_1 = require("./appointments.service");
const create_appointment_dto_1 = require("./dto/create-appointment.dto");
const update_appointment_dto_1 = require("./dto/update-appointment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_schema_1 = require("../users/schemas/user.schema");
let AppointmentsController = class AppointmentsController {
    appointmentsService;
    constructor(appointmentsService) {
        this.appointmentsService = appointmentsService;
    }
    async create(createAppointmentDto, req) {
        return this.appointmentsService.create({
            ...createAppointmentDto,
            doctorId: new mongoose_1.Types.ObjectId(createAppointmentDto.doctorId),
            patientId: new mongoose_1.Types.ObjectId(req.user.id),
            appointmentDate: new Date(createAppointmentDto.appointmentDate),
        });
    }
    async findAll() {
        return this.appointmentsService.findAll();
    }
    async getMyAppointments(req) {
        const { role, id } = req.user;
        if (role === user_schema_1.UserRole.DOCTOR) {
            return this.appointmentsService.findByDoctor(id);
        }
        else {
            return this.appointmentsService.findByPatient(id);
        }
    }
    async getUpcomingAppointments(req) {
        return this.appointmentsService.getUpcomingAppointments(req.user.id, req.user.role);
    }
    async getDoctorCalendar(doctorId, startDate, endDate) {
        return this.appointmentsService.findByDateRange(new Date(startDate), new Date(endDate), doctorId);
    }
    async getAvailableSlots(doctorId, date) {
        return this.appointmentsService.getAvailableSlots(doctorId, new Date(date));
    }
    async findOne(id, req) {
        const appointment = await this.appointmentsService.findById(id);
        const { role, id: userId } = req.user;
        if (role !== user_schema_1.UserRole.ADMIN &&
            appointment.patientId.toString() !== userId &&
            appointment.doctorId.toString() !== userId) {
            throw new Error('Access denied');
        }
        return appointment;
    }
    async update(id, updateAppointmentDto, req) {
        const appointment = await this.appointmentsService.findById(id);
        const { role, id: userId } = req.user;
        if (role === user_schema_1.UserRole.PATIENT &&
            appointment.patientId.toString() !== userId) {
            throw new Error('Access denied');
        }
        if (role === user_schema_1.UserRole.DOCTOR &&
            appointment.doctorId.toString() !== userId) {
            throw new Error('Access denied');
        }
        const updateData = { ...updateAppointmentDto };
        if (updateAppointmentDto.doctorId) {
            updateData.doctorId = new mongoose_1.Types.ObjectId(updateAppointmentDto.doctorId);
        }
        if (updateAppointmentDto.appointmentDate) {
            updateData.appointmentDate = new Date(updateAppointmentDto.appointmentDate);
        }
        return this.appointmentsService.update(id, updateData);
    }
    async updateStatus(id, body, req) {
        const appointment = await this.appointmentsService.findById(id);
        const { role, id: userId } = req.user;
        if (role === user_schema_1.UserRole.PATIENT) {
            throw new Error('Access denied');
        }
        if (role === user_schema_1.UserRole.DOCTOR &&
            appointment.doctorId.toString() !== userId) {
            throw new Error('Access denied');
        }
        return this.appointmentsService.updateStatus(id, body.status, body.notes);
    }
    async delete(id) {
        await this.appointmentsService.delete(id);
        return { message: 'Appointment deleted successfully' };
    }
    async getStats(req, doctorId) {
        const targetDoctorId = req.user.role === user_schema_1.UserRole.DOCTOR ? req.user.id : doctorId;
        return this.appointmentsService.getAppointmentStats(targetDoctorId);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_appointment_dto_1.CreateAppointmentDto, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-appointments'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getMyAppointments", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getUpcomingAppointments", null);
__decorate([
    (0, common_1.Get)('calendar/:doctorId'),
    __param(0, (0, common_1.Param)('doctorId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getDoctorCalendar", null);
__decorate([
    (0, common_1.Get)('available-slots/:doctorId'),
    __param(0, (0, common_1.Param)('doctorId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getAvailableSlots", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_appointment_dto_1.UpdateAppointmentDto, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getStats", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, common_1.Controller)('appointments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map