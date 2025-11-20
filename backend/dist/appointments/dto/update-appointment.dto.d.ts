import { CreateAppointmentDto } from './create-appointment.dto';
import { AppointmentStatus } from '../schemas/appointment.schema';
declare const UpdateAppointmentDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateAppointmentDto>>;
export declare class UpdateAppointmentDto extends UpdateAppointmentDto_base {
    status?: AppointmentStatus;
    diagnosis?: string;
    prescription?: string;
    meetingLink?: string;
    cancellationReason?: string;
}
export {};
