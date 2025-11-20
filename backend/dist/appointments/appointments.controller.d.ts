import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from './schemas/appointment.schema';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(createAppointmentDto: CreateAppointmentDto, req: any): Promise<import("./schemas/appointment.schema").AppointmentDocument>;
    findAll(): Promise<import("./schemas/appointment.schema").AppointmentDocument[]>;
    getMyAppointments(req: any): Promise<import("./schemas/appointment.schema").AppointmentDocument[]>;
    getUpcomingAppointments(req: any): Promise<import("./schemas/appointment.schema").AppointmentDocument[]>;
    getDoctorCalendar(doctorId: string, startDate: string, endDate: string): Promise<import("./schemas/appointment.schema").AppointmentDocument[]>;
    getAvailableSlots(doctorId: string, date: string): Promise<Date[]>;
    findOne(id: string, req: any): Promise<import("./schemas/appointment.schema").AppointmentDocument>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto, req: any): Promise<import("./schemas/appointment.schema").AppointmentDocument>;
    updateStatus(id: string, body: {
        status: AppointmentStatus;
        notes?: string;
    }, req: any): Promise<import("./schemas/appointment.schema").AppointmentDocument>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getStats(req: any, doctorId?: string): Promise<any>;
}
