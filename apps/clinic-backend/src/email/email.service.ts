import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getReferralConfirmationTemplate } from './templates/referral-confirmation.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // If SMTP is not configured, transporter will be null
    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn(
        'SMTP not configured. Email functionality will be disabled. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.',
      );
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false, // For development, set to true in production with valid certificates
        },
      });

      this.logger.log(`Email service initialized with SMTP: ${smtpHost}:${smtpPort}`);
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized. Email not sent.');
      return false;
    }

    const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
    const smtpFromName = process.env.SMTP_FROM_NAME || 'מרפאת שיניים';

    if (!smtpFrom) {
      this.logger.error('SMTP_FROM not configured. Email not sent.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${smtpFromName}" <${smtpFrom}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if text not provided
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  async sendReferralConfirmation(
    customerEmail: string,
    customerName: string,
    referralReason: string,
  ): Promise<boolean> {
    try {
      const template = getReferralConfirmationTemplate(customerName, referralReason);
      return await this.sendEmail(
        customerEmail,
        template.subject,
        template.html,
        template.text,
      );
    } catch (error) {
      this.logger.error('Failed to send referral confirmation email:', error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}
