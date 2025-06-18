import * as winston from 'winston';

const logFormat = (env = process.env) =>
  winston.format.printf(({ level, message, stack }) => {
    return JSON.stringify({
      '@timestamp': new Date().toISOString(),
      '@version': 1,
      environment: env.NODE_ENV,
      message,
      stack,
      severity: level,
      type: 'stdin',
    });
  });

export const createLogger = (env = process.env) =>
  winston.createLogger({
    level: env.LOGGING_LEVEL || 'debug',
    format: winston.format.combine(winston.format.splat(), logFormat(env)),
    transports: [new winston.transports.Console()],
  });
