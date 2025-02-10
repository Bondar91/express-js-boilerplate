import { Joi } from 'celebrate';

export interface IAppConfig {
  PORT: string;
}

const schema = Joi.object<IAppConfig>()
  .keys({
    PORT: Joi.string().required().default('1337'),
  })
  .unknown();

export const appConfigFactory = (env: NodeJS.ProcessEnv): IAppConfig => {
  const { error, value } = schema.validate(env);

  if (error) {
    throw error;
  }

  return value;
};
