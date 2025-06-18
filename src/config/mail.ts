import { MAIL_PROVIDER } from '@/lib/mail/mail.types';
import { Joi } from 'celebrate';

export interface IMailConfig {
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  FROM_EMAIL: string;
  MAIL_PROVIDER: MAIL_PROVIDER;
}

const schema = Joi.object<IMailConfig>()
  .keys({
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().required(),
    SMTP_USER: Joi.string().required(),
    SMTP_PASS: Joi.string().required(),
    FROM_EMAIL: Joi.string().email().required(),
    MAIL_PROVIDER: Joi.string()
      .valid(...Object.values(MAIL_PROVIDER))
      .default(MAIL_PROVIDER.SMTP),
  })
  .unknown();

export const mailConfig = schema.validate(process.env).value;
