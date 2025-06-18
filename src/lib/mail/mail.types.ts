export interface IMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface IMailProvider {
  send(options: IMailOptions): Promise<void>;
  sendWithAttachment(options: IMailOptions & { attachments: NonNullable<IMailOptions['attachments']> }): Promise<void>;
}

export enum MAIL_PROVIDER {
  SMTP = 'smtp',
  // EMAILLABS = 'emaillabs',
  // SENDGRID = 'sendgrid',
}
