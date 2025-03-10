import { Joi } from 'celebrate';

export interface IJwtConfig {
  JWT_TOKEN_SECRET: string;
  JWT_TOKEN_EXPIRES_IN: number;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_EXPIRES_IN: number;
}

const schema = Joi.object<IJwtConfig>()
  .keys({
    JWT_TOKEN_SECRET: Joi.string().required(),
    JWT_TOKEN_EXPIRES_IN: Joi.number().required().default(86400),
    JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
    JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.number().required().default(525600),
  })
  .unknown();

export const jwtConfigFactory = (env: NodeJS.ProcessEnv): IJwtConfig => {
  const { error, value } = schema.validate(env);

  if (error) {
    throw error;
  }

  return value;
};
