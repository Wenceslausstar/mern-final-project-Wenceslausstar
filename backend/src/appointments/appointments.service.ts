import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import {
  Appointment,
  AppointmentDocument,
  AppointmentStatus,
  AppointmentType,
} from './schemas/appointment.schema';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  async create(
    createAppointmentDto: Partial<Appointment>,
  ): Promise<AppointmentDocument> {
    if (
      !createAppointmentDto.appointmentDate ||
      !createAppointmentDto.doctorId
    ) {
      throw new BadRequestException(
        'Appointment date and doctor ID are required',
      );
    }

    // Check for scheduling conflicts
    const conflict = await this.checkSchedulingConflict(
      createAppointmentDto.doctorId,
      createAppointmentDto.appointmentDate,
      createAppointmentDto.duration || 30,
    );

    if (conflict) {
      throw new ConflictException('Doctor is not available at this time slot');
    }

    const appointment = new this.appointmentModel(createAppointmentDto);
    return appointment.save();
  }

  async findAll(): Promise<AppointmentDocument[]> {
    return this.appointmentModel
      .find()
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email specialization')
      .sort({ appointmentDate: -1 })
      .exec();
  }

  async findById(id: string): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patientId', 'firstName lastName email phoneNumber')
      .populate(
        'doctorId',
        'firstName lastName email specialization licenseNumber',
      )
      .exec();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async findByPatient(patientId: string): Promise<AppointmentDocument[]> {
    return this.appointmentModel
      .find({ patientId })
      .populate('doctorId', 'firstName lastName email specialization')
      .sort({ appointmentDate: -1 })
      .exec();
  }

  async findByDoctor(doctorId: string): Promise<AppointmentDocument[]> {
    return this.appointmentModel
      .find({ doctorId })
      .populate('patientId', 'firstName lastName email phoneNumber')
      .sort({ appointmentDate: -1 })
      .exec();
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    doctorId?: string,
  ): Promise<AppointmentDocument[]> {
    const query: any = {
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

  async update(
    id: string,
    updateData: Partial<Appointment>,
  ): Promise<AppointmentDocument> {
    // If updating date/time, check for conflicts
    if (updateData.appointmentDate || updateData.duration) {
      const appointment = await this.findById(id);

      const newDate = updateData.appointmentDate || appointment.appointmentDate;
      const newDuration = updateData.duration || appointment.duration;

      const conflict = await this.checkSchedulingConflict(
        appointment.doctorId,
        newDate,
        newDuration,
        id, // Exclude current appointment from conflict check
      );

      if (conflict) {
        throw new ConflictException(
          'Doctor is not available at this time slot',
        );
      }
    }

    const appointment = await this.appointmentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email specialization')
      .exec();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    notes?: string,
  ): Promise<AppointmentDocument> {
    const updateData: any = { status };

    if (notes) {
      if (status === AppointmentStatus.COMPLETED) {
        updateData.notes = notes;
      } else if (
        status === AppointmentStatus.CANCELLED ||
        status === AppointmentStatus.REJECTED
      ) {
        updateData.cancellationReason = notes;
      }
    }

    return this.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    const result = await this.appointmentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Appointment not found');
    }
  }

  async getAvailableSlots(doctorId: string, date: Date): Promise<Date[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM

    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0); // 5 PM

    // Get all appointments for this doctor on this date
    const appointments = await this.appointmentModel
      .find({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lt: endOfDay },
        status: {
          $in: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED],
        },
      })
      .exec();

    const availableSlots: Date[] = [];
    const slotDuration = 30; // 30 minutes

    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

      // Check if this slot conflicts with any existing appointment
      const conflict = appointments.some((appointment) => {
        const appointmentEnd = new Date(
          appointment.appointmentDate.getTime() + appointment.duration * 60000,
        );
        return (
          (currentTime >= appointment.appointmentDate &&
            currentTime < appointmentEnd) ||
          (slotEnd > appointment.appointmentDate &&
            slotEnd <= appointmentEnd) ||
          (currentTime <= appointment.appointmentDate &&
            slotEnd >= appointmentEnd)
        );
      });

      if (!conflict) {
        availableSlots.push(new Date(currentTime));
      }

      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    return availableSlots;
  }

  private async checkSchedulingConflict(
    doctorId: any,
    appointmentDate: Date,
    duration: number,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const appointmentEnd = new Date(
      appointmentDate.getTime() + duration * 60000,
    );

    const query: any = {
      doctorId,
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED] },
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

  async getUpcomingAppointments(
    userId: string,
    userRole: string,
  ): Promise<AppointmentDocument[]> {
    const now = new Date();
    const query: any = {
      appointmentDate: { $gte: now },
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED] },
    };

    if (userRole === 'doctor') {
      query.doctorId = userId;
    } else if (userRole === 'patient') {
      query.patientId = userId;
    }

    return this.appointmentModel
      .find(query)
      .populate(
        userRole === 'doctor' ? 'patientId' : 'doctorId',
        'firstName lastName email',
      )
      .sort({ appointmentDate: 1 })
      .limit(10)
      .exec();
  }

  async getAppointmentStats(doctorId?: string): Promise<any> {
    const matchStage: any = {};

    if (doctorId) {
      matchStage.doctorId = new Types.ObjectId(doctorId);
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
}
