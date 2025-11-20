import { ConfigService } from '@nestjs/config';
interface EmailOptions {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}
interface SMSOptions {
    to: string;
    message: string;
}
export declare class NotificationsService {
    private configService;
    private readonly logger;
    private emailTransporter;
    private twilioClient;
    constructor(configService: ConfigService);
    sendEmail(options: EmailOptions): Promise<void>;
    sendSMS(options: SMSOptions): Promise<void>;
    sendAppointmentConfirmation(appointment: any, user: any): Promise<void>;
    sendAppointmentReminder(appointment: any, user: any, hoursUntilAppointment: number): Promise<void>;
    sendAppointmentCancellation(appointment: any, user: any, reason?: string): Promise<void>;
    sendPrescriptionReady(prescription: any, user: any): Promise<void>;
    sendWelcomeEmail(user: any): Promise<void>;
    sendPasswordResetEmail(user: any, resetToken: string): Promise<void>;
    sendEmergencyAlert(user: any, message: string): Promise<void>;
}
export {};
