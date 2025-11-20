"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    configService;
    logger = new common_1.Logger(NotificationsService_1.name);
    emailTransporter;
    twilioClient;
    constructor(configService) {
        this.configService = configService;
        this.emailTransporter = nodemailer.createTransporter({
            host: this.configService.get('EMAIL_HOST'),
            port: this.configService.get('EMAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        if (accountSid && authToken) {
            this.twilioClient = (0, twilio_1.default)(accountSid, authToken);
        }
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: `"Telemedicine App" <${this.configService.get('EMAIL_USER')}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };
            const result = await this.emailTransporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully to ${options.to}: ${result.messageId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${options.to}:`, error);
            throw error;
        }
    }
    async sendSMS(options) {
        try {
            if (!this.twilioClient) {
                this.logger.warn('Twilio client not initialized. SMS not sent.');
                return;
            }
            const result = await this.twilioClient.messages.create({
                body: options.message,
                from: this.configService.get('TWILIO_PHONE_NUMBER'),
                to: options.to,
            });
            this.logger.log(`SMS sent successfully to ${options.to}: ${result.sid}`);
        }
        catch (error) {
            this.logger.error(`Failed to send SMS to ${options.to}:`, error);
            throw error;
        }
    }
    async sendAppointmentConfirmation(appointment, user) {
        const appointmentDate = new Date(appointment.appointmentDate).toLocaleString();
        await this.sendEmail({
            to: user.email,
            subject: 'Appointment Confirmed',
            html: `
        <h2>Appointment Confirmation</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Your appointment has been confirmed with the following details:</p>
        <ul>
          <li><strong>Date & Time:</strong> ${appointmentDate}</li>
          <li><strong>Duration:</strong> ${appointment.duration} minutes</li>
          <li><strong>Type:</strong> ${appointment.type}</li>
          <li><strong>Doctor:</strong> ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}</li>
        </ul>
        <p>Please arrive 15 minutes early for your appointment.</p>
        <p>If you need to reschedule or cancel, please contact us.</p>
        <br>
        <p>Best regards,<br>Telemedicine Team</p>
      `,
        });
        if (user.phoneNumber) {
            await this.sendSMS({
                to: user.phoneNumber,
                message: `Appointment confirmed for ${appointmentDate} with Dr. ${appointment.doctorId.lastName}. Duration: ${appointment.duration} minutes.`,
            });
        }
    }
    async sendAppointmentReminder(appointment, user, hoursUntilAppointment) {
        const appointmentDate = new Date(appointment.appointmentDate).toLocaleString();
        await this.sendEmail({
            to: user.email,
            subject: `Appointment Reminder - ${hoursUntilAppointment} hours`,
            html: `
        <h2>Appointment Reminder</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <ul>
          <li><strong>Date & Time:</strong> ${appointmentDate}</li>
          <li><strong>Duration:</strong> ${appointment.duration} minutes</li>
          <li><strong>Doctor:</strong> ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}</li>
        </ul>
        <p>Please ensure you have a stable internet connection for your video consultation.</p>
        <br>
        <p>Best regards,<br>Telemedicine Team</p>
      `,
        });
        if (user.phoneNumber) {
            await this.sendSMS({
                to: user.phoneNumber,
                message: `Reminder: Your appointment is in ${hoursUntilAppointment} hours (${appointmentDate}).`,
            });
        }
    }
    async sendAppointmentCancellation(appointment, user, reason) {
        const appointmentDate = new Date(appointment.appointmentDate).toLocaleString();
        await this.sendEmail({
            to: user.email,
            subject: 'Appointment Cancelled',
            html: `
        <h2>Appointment Cancellation Notice</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Your appointment scheduled for ${appointmentDate} has been cancelled.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you would like to reschedule, please book a new appointment through our platform.</p>
        <br>
        <p>Best regards,<br>Telemedicine Team</p>
      `,
        });
        if (user.phoneNumber) {
            await this.sendSMS({
                to: user.phoneNumber,
                message: `Your appointment for ${appointmentDate} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
            });
        }
    }
    async sendPrescriptionReady(prescription, user) {
        await this.sendEmail({
            to: user.email,
            subject: 'Prescription Ready',
            html: `
        <h2>Prescription Ready</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Your prescription has been prepared and is ready for download.</p>
        <ul>
          <li><strong>Prescription Number:</strong> ${prescription.prescriptionNumber}</li>
          <li><strong>Issue Date:</strong> ${new Date(prescription.issueDate).toLocaleDateString()}</li>
          <li><strong>Doctor:</strong> ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}</li>
        </ul>
        <p>You can download your prescription from your dashboard.</p>
        <br>
        <p>Best regards,<br>Telemedicine Team</p>
      `,
        });
        if (user.phoneNumber) {
            await this.sendSMS({
                to: user.phoneNumber,
                message: `Your prescription (${prescription.prescriptionNumber}) is ready for download.`,
            });
        }
    }
    async sendWelcomeEmail(user) {
        await this.sendEmail({
            to: user.email,
            subject: 'Welcome to Telemedicine Platform',
            html: `
        <h2>Welcome to Our Telemedicine Platform!</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Thank you for registering with our telemedicine platform. You can now:</p>
        <ul>
          <li>Book appointments with healthcare professionals</li>
          <li>Have video consultations from the comfort of your home</li>
          <li>Access your medical records securely</li>
          <li>Receive prescriptions electronically</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <br>
        <p>Best regards,<br>Telemedicine Team</p>
      `,
        });
    }
    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
        await this.sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            html: `
        <h2>Password Reset Request</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>You have requested to reset your password. Please click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Telemedicine Team</p>
      `,
        });
    }
    async sendEmergencyAlert(user, message) {
        await this.sendEmail({
            to: user.email,
            subject: 'URGENT: Medical Alert',
            html: `
        <h2 style="color: red;">Medical Alert</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p><strong>${message}</strong></p>
        <p>Please contact emergency services if you need immediate assistance.</p>
        <p>Emergency contact: 911</p>
        <br>
        <p>Telemedicine Team</p>
      `,
        });
        if (user.phoneNumber) {
            await this.sendSMS({
                to: user.phoneNumber,
                message: `URGENT: ${message}. Contact emergency services if needed.`,
            });
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map