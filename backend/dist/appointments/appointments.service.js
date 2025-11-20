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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose_3 = require("mongoose");
const appointment_schema_1 = require("./schemas/appointment.schema");
let AppointmentsService = class AppointmentsService {
    appointmentModel;
    constructor(appointmentModel) {
        this.appointmentModel = appointmentModel;
    }
    async create(createAppointmentDto) {
        if (!createAppointmentDto.appointmentDate ||
            !createAppointmentDto.doctorId) {
            throw new common_1.BadRequestException('Appointment date and doctor ID are required');
        }
        const conflict = await this.checkSchedulingConflict(createAppointmentDto.doctorId, createAppointmentDto.appointmentDate, createAppointmentDto.duration || 30);
        if (conflict) {
            throw new common_1.ConflictException('Doctor is not available at this time slot');
        }
        const appointment = new this.appointmentModel(createAppointmentDto);
        return appointment.save();
    }
    async findAll() {
        return this.appointmentModel
            .find()
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName email specialization')
            .sort({ appointmentDate: -1 })
            .exec();
    }
    async findById(id) {
        const appointment = await this.appointmentModel
            .findById(id)
            .populate('patientId', 'firstName lastName email phoneNumber')
            .populate('doctorId', 'firstName lastName email specialization licenseNumber')
            .exec();
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        return appointment;
    }
    async findByPatient(patientId) {
        return this.appointmentModel
            .find({ patientId })
            .populate('doctorId', 'firstName lastName email specialization')
            .sort({ appointmentDate: -1 })
            .exec();
    }
    async findByDoctor(doctorId) {
        return this.appointmentModel
            .find({ doctorId })
            .populate('patientId', 'firstName lastName email phoneNumber')
            .sort({ appointmentDate: -1 })
            .exec();
    }
    async findByDateRange(startDate, endDate, doctorId) {
        const query = {
            appointmentDate: { $gte: startDate, $lte: endDate },
        };
        if (doctorId) {
            query.doctorId = doctorId;
        }
        return this.appointmentModel
            .find(query)
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName email specialization')
            .sort({ appointmentDate: 1 })
            .exec();
    }
    async update(id, updateData) {
        if (updateData.appointmentDate || updateData.duration) {
            const appointment = await this.findById(id);
            const newDate = updateData.appointmentDate || appointment.appointmentDate;
            const newDuration = updateData.duration || appointment.duration;
            const conflict = await this.checkSchedulingConflict(appointment.doctorId, newDate, newDuration, id);
            if (conflict) {
                throw new common_1.ConflictException('Doctor is not available at this time slot');
            }
        }
        const appointment = await this.appointmentModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName email specialization')
            .exec();
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        return appointment;
    }
    async updateStatus(id, status, notes) {
        const updateData = { status };
        if (notes) {
            if (status === appointment_schema_1.AppointmentStatus.COMPLETED) {
                updateData.notes = notes;
            }
            else if (status === appointment_schema_1.AppointmentStatus.CANCELLED ||
                status === appointment_schema_1.AppointmentStatus.REJECTED) {
                updateData.cancellationReason = notes;
            }
        }
        return this.update(id, updateData);
    }
    async delete(id) {
        const result = await this.appointmentModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Appointment not found');
        }
    }
    async getAvailableSlots(doctorId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(9, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(17, 0, 0, 0);
        const appointments = await this.appointmentModel
            .find({
            doctorId,
            appointmentDate: { $gte: startOfDay, $lt: endOfDay },
            status: {
                $in: [appointment_schema_1.AppointmentStatus.PENDING, appointment_schema_1.AppointmentStatus.APPROVED],
            },
        })
            .exec();
        const availableSlots = [];
        const slotDuration = 30;
        let currentTime = new Date(startOfDay);
        while (currentTime < endOfDay) {
            const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
            const conflict = appointments.some((appointment) => {
                const appointmentEnd = new Date(appointment.appointmentDate.getTime() + appointment.duration * 60000);
                return ((currentTime >= appointment.appointmentDate &&
                    currentTime < appointmentEnd) ||
                    (slotEnd > appointment.appointmentDate &&
                        slotEnd <= appointmentEnd) ||
                    (currentTime <= appointment.appointmentDate &&
                        slotEnd >= appointmentEnd));
            });
            if (!conflict) {
                availableSlots.push(new Date(currentTime));
            }
            currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
        }
        return availableSlots;
    }
    async checkSchedulingConflict(doctorId, appointmentDate, duration, excludeAppointmentId) {
        const appointmentEnd = new Date(appointmentDate.getTime() + duration * 60000);
        const query = {
            doctorId,
            status: { $in: [appointment_schema_1.AppointmentStatus.PENDING, appointment_schema_1.AppointmentStatus.APPROVED] },
            appointmentDate: { $lt: appointmentEnd },
            $expr: {
                $gt: [
                    {
                        $add: ['$appointmentDate', { $multiply: ['$duration', 60000] }],
                    },
                    appointmentDate,
                ],
            },
        };
        if (excludeAppointmentId) {
            query._id = { $ne: excludeAppointmentId };
        }
        const conflictingAppointment = await this.appointmentModel
            .findOne(query)
            .exec();
        return !!conflictingAppointment;
    }
    async getUpcomingAppointments(userId, userRole) {
        const now = new Date();
        const query = {
            appointmentDate: { $gte: now },
            status: { $in: [appointment_schema_1.AppointmentStatus.PENDING, appointment_schema_1.AppointmentStatus.APPROVED] },
        };
        if (userRole === 'doctor') {
            query.doctorId = userId;
        }
        else if (userRole === 'patient') {
            query.patientId = userId;
        }
        return this.appointmentModel
            .find(query)
            .populate(userRole === 'doctor' ? 'patientId' : 'doctorId', 'firstName lastName email')
            .sort({ appointmentDate: 1 })
            .limit(10)
            .exec();
    }
    async getAppointmentStats(doctorId) {
        const matchStage = {};
        if (doctorId) {
            matchStage.doctorId = new mongoose_3.Types.ObjectId(doctorId);
        }
        return this.appointmentModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(appointment_schema_1.Appointment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map