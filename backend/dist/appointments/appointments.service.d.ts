import { Model } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus } from './schemas/appointment.schema';
export declare class AppointmentsService {
    private appointmentModel;
    constructor(appointmentModel: Model<AppointmentDocument>);
    create(createAppointmentDto: Partial<Appointment>): Promise<AppointmentDocument>;
    findAll(): Promise<AppointmentDocument[]>;
    findById(id: string): Promise<AppointmentDocument>;
    findByPatient(patientId: string): Promise<AppointmentDocument[]>;
    findByDoctor(doctorId: string): Promise<AppointmentDocument[]>;
    findByDateRange(startDate: Date, endDate: Date, doctorId?: string): Promise<AppointmentDocument[]>;
    update(id: string, updateData: Partial<Appointment>): Promise<AppointmentDocument>;
    updateStatus(id: string, status: AppointmentStatus, notes?: string): Promise<AppointmentDocument>;
    delete(id: string): Promise<void>;
    getAvailableSlots(doctorId: string, date: Date): Promise<Date[]>;
    private checkSchedulingConflict;
    getUpcomingAppointments(userId: string, userRole: string): Promise<AppointmentDocument[]>;
    getAppointmentStats(doctorId?: string): Promise<any>;
}
