import type { IMailOptions, IMailProvider } from './mail.types';
import { MAIL_PROVIDER } from './mail.types';
import { mailConfig } from '@/config/mail';
import { SmtpMailProvider } from './providers/smtp-mail.provider';

export class MailService {
  private provider: IMailProvider;

  public constructor(providerType: MAIL_PROVIDER = mailConfig.MAIL_PROVIDER) {
    this.provider = this.createProvider(providerType);
  }

  public async send(options: IMailOptions): Promise<void> {
    return this.provider.send(options);
  }

  public async sendWithAttachment(
    options: IMailOptions & { attachments: NonNullable<IMailOptions['attachments']> },
  ): Promise<void> {
    return this.provider.sendWithAttachment(options);
  }

  private createProvider(type: MAIL_PROVIDER): IMailProvider {
    switch (type) {
      case MAIL_PROVIDER.SMTP:
        return new SmtpMailProvider();
      default:
        return new SmtpMailProvider();
    }
  }
}

export const mailService = new MailService();
