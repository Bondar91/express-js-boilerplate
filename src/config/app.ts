import { Joi } from 'celebrate';

export interface IAppConfig {
  PORT: string;
  ADMIN_PANEL_URL: string;
  PLAYER_PANEL_URL: string;
  LEADER_PANEL_URL: string;
}

const schema = Joi.object<IAppConfig>()
  .keys({
    PORT: Joi.string().required().default('1337'),
    ADMIN_PANEL_URL: Joi.string().required().default('http://localhost:4500'),
    LEADER_PANEL_URL: Joi.string().required().default('http://localhost:4600'),
    PLAYER_PANEL_URL: Joi.string().required().default('http://localhost:4700'),
  })
  .unknown();

export const appConfigFactory = (env: NodeJS.ProcessEnv): IAppConfig => {
  const { error, value } = schema.validate(env);

  if (error) {
    throw error;
  }

  return value;
};
