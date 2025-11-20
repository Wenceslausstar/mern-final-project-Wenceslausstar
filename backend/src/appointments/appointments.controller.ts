import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Appointment, AppointmentStatus } from './schemas/appointment.schema';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentsService.create({
      ...createAppointmentDto,
      doctorId: new Types.ObjectId(createAppointmentDto.doctorId),
      patientId: new Types.ObjectId(req.user.id),
      appointmentDate: new Date(createAppointmentDto.appointmentDate),
    });
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.appointmentsService.findAll();
  }

  @Get('my-appointments')
  async getMyAppointments(@Request() req) {
    const { role, id } = req.user;

    if (role === UserRole.DOCTOR) {
      return this.appointmentsService.findByDoctor(id);
    } else {
      return this.appointmentsService.findByPatient(id);
    }
  }

  @Get('upcoming')
  async getUpcomingAppointments(@Request() req) {
    return this.appointmentsService.getUpcomingAppointments(
      req.user.id,
      req.user.role,
    );
  }

  @Get('calendar/:doctorId')
  async getDoctorCalendar(
    @Param('doctorId') doctorId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.appointmentsService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
      doctorId,
    );
  }

  @Get('available-slots/:doctorId')
  async getAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableSlots(doctorId, new Date(date));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const appointment = await this.appointmentsService.findById(id);

    // Check if user has permission to view this appointment
    const { role, id: userId } = req.user;
    if (
      role !== UserRole.ADMIN &&
      appointment.patientId.toString() !== userId &&
      appointment.doctorId.toString() !== userId
    ) {
      throw new Error('Access denied');
    }

    return appointment;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req,
  ) {
    const appointment = await this.appointmentsService.findById(id);
    const { role, id: userId } = req.user;

    // Check permissions
    if (
      role === UserRole.PATIENT &&
      appointment.patientId.toString() !== userId
    ) {
      throw new Error('Access denied');
    }

    if (
      role === UserRole.DOCTOR &&
      appointment.doctorId.toString() !== userId
    ) {
      throw new Error('Access denied');
    }

    // Prepare update data with proper types
    const updateData: any = { ...updateAppointmentDto };
    if (updateAppointmentDto.doctorId) {
      updateData.doctorId = new Types.ObjectId(updateAppointmentDto.doctorId);
    }
    if (updateAppointmentDto.appointmentDate) {
      updateData.appointmentDate = new Date(
        updateAppointmentDto.appointmentDate,
      );
    }

    return this.appointmentsService.update(id, updateData);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: AppointmentStatus; notes?: string },
    @Request() req,
  ) {
    const appointment = await this.appointmentsService.findById(id);
    const { role, id: userId } = req.user;

    // Only doctors and admins can update appointment status
    if (role === UserRole.PATIENT) {
      throw new Error('Access denied');
    }

    if (
      role === UserRole.DOCTOR &&
      appointment.doctorId.toString() !== userId
    ) {
      throw new Error('Access denied');
    }

    return this.appointmentsService.updateStatus(id, body.status, body.notes);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    await this.appointmentsService.delete(id);
    return { message: 'Appointment deleted successfully' };
  }

  @Get('stats/overview')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async getStats(@Request() req, @Query('doctorId') doctorId?: string) {
    const targetDoctorId =
      req.user.role === UserRole.DOCTOR ? req.user.id : doctorId;
    return this.appointmentsService.getAppointmentStats(targetDoctorId);
  }
}
