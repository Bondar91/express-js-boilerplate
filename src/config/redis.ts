import { Joi } from 'celebrate';

export interface IRedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  url: string;
}

const schema = Joi.object<IRedisConfig>()
  .keys({
    host: Joi.string().required().default('localhost'),
    port: Joi.number().required().default(6379),
    password: Joi.string().optional(),
    db: Joi.number().required().default(0),
    keyPrefix: Joi.string().required().default('invigiclub:'),
    url: Joi.string().required(),
  })
  .unknown();

export const redisConfigFactory = (env: NodeJS.ProcessEnv): IRedisConfig => {
  const { error, value } = schema.validate({
    host: env.REDIS_HOST || 'localhost',
    port: Number(env.REDIS_PORT) || 6379,
    password: env.REDIS_PASSWORD,
    db: Number(env.REDIS_DB) || 0,
    keyPrefix: env.REDIS_PREFIX || 'invigiclub:',
    url: env.REDIS_URL,
  });

  if (error) {
    throw error;
  }

  return value;
};

export const redisConfig = redisConfigFactory(process.env);
