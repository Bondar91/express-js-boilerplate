import nodemailer from 'nodemailer';
import type { IMailProvider, IMailOptions } from '../mail.types';
import { mailConfig } from '@/config/mail';

export class SmtpMailProvider implements IMailProvider {
  private transporter: nodemailer.Transporter;

  public constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.SMTP_HOST,
      port: mailConfig.SMTP_PORT,
      auth: {
        user: mailConfig.SMTP_USER,
        pass: mailConfig.SMTP_PASS,
      },
    });
  }

  public async send(options: IMailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: mailConfig.FROM_EMAIL,
      ...options,
    });
  }

  public async sendWithAttachment(
    options: IMailOptions & { attachments: NonNullable<IMailOptions['attachments']> },
  ): Promise<void> {
    await this.transporter.sendMail({
      from: mailConfig.FROM_EMAIL,
      ...options,
    });
  }
}
