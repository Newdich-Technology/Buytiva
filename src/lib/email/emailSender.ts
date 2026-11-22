import nodemailer, { type Transporter } from 'nodemailer';
import type { MailConfig } from '../../configs/mail.config.js';
import type { EmailMessage, EmailProvider } from '../../interfaces/notifications/emailProvider.interface.js';

export class SmtpEmailSender implements EmailProvider {
  private readonly transporter: Transporter;

  constructor(private readonly config: MailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.password },
      tls: { minVersion: 'TLSv1.2' }
    });
  }

  async sendEmail(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html
    });
  }
}

export class MemoryEmailProvider implements EmailProvider {
  readonly messages: EmailMessage[] = [];

  async sendEmail(message: EmailMessage): Promise<void> {
    this.messages.push(message);
  }
}
