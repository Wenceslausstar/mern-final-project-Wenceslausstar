import { AppointmentType } from '../schemas/appointment.schema';
export declare class CreateAppointmentDto {
    doctorId: string;
    appointmentDate: string;
    duration: number;
    type?: AppointmentType;
    symptoms?: string;
    notes?: string;
    isEmergency?: boolean;
}
