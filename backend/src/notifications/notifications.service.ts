import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import twilio from 'twilio';

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

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private emailTransporter: nodemailer.Transporter;
  private twilioClient: any;

  constructor(private configService: ConfigService) {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransporter({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    // Initialize Twilio client
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"Telemedicine App" <${this.configService.get<string>('EMAIL_USER')}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to ${options.to}: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendSMS(options: SMSOptions): Promise<void> {
    try {
      if (!this.twilioClient) {
        this.logger.warn('Twilio client not initialized. SMS not sent.');
        return;
      }

      const result = await this.twilioClient.messages.create({
        body: options.message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: options.to,
      });

      this.logger.log(`SMS sent successfully to ${options.to}: ${result.sid}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${options.to}:`, error);
      throw error;
    }
  }

  // Appointment-related notifications
  async sendAppointmentConfirmation(
    appointment: any,
    user: any,
  ): Promise<void> {
    const appointmentDate = new Date(
      appointment.appointmentDate,
    ).toLocaleString();

    // Email notification
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

    // SMS notification
    if (user.phoneNumber) {
      await this.sendSMS({
        to: user.phoneNumber,
        message: `Appointment confirmed for ${appointmentDate} with Dr. ${appointment.doctorId.lastName}. Duration: ${appointment.duration} minutes.`,
      });
    }
  }

  async sendAppointmentReminder(
    appointment: any,
    user: any,
    hoursUntilAppointment: number,
  ): Promise<void> {
    const appointmentDate = new Date(
      appointment.appointmentDate,
    ).toLocaleString();

    // Email reminder
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

    // SMS reminder
    if (user.phoneNumber) {
      await this.sendSMS({
        to: user.phoneNumber,
        message: `Reminder: Your appointment is in ${hoursUntilAppointment} hours (${appointmentDate}).`,
      });
    }
  }

  async sendAppointmentCancellation(
    appointment: any,
    user: any,
    reason?: string,
  ): Promise<void> {
    const appointmentDate = new Date(
      appointment.appointmentDate,
    ).toLocaleString();

    // Email notification
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

    // SMS notification
    if (user.phoneNumber) {
      await this.sendSMS({
        to: user.phoneNumber,
        message: `Your appointment for ${appointmentDate} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      });
    }
  }

  // Prescription-related notifications
  async sendPrescriptionReady(prescription: any, user: any): Promise<void> {
    // Email notification
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

    // SMS notification
    if (user.phoneNumber) {
      await this.sendSMS({
        to: user.phoneNumber,
        message: `Your prescription (${prescription.prescriptionNumber}) is ready for download.`,
      });
    }
  }

  // General notifications
  async sendWelcomeEmail(user: any): Promise<void> {
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

  async sendPasswordResetEmail(user: any, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

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

  // Emergency notifications
  async sendEmergencyAlert(user: any, message: string): Promise<void> {
    // Email alert
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

    // SMS alert (high priority)
    if (user.phoneNumber) {
      await this.sendSMS({
        to: user.phoneNumber,
        message: `URGENT: ${message}. Contact emergency services if needed.`,
      });
    }
  }
}
