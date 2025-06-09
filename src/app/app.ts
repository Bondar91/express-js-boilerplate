import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errors } from 'celebrate';
import { StatusCodes } from 'http-status-codes';

import { NotFoundError } from '@/errors/not-found.error';
import { errorHandler } from '@/middleware/error-handler';
import { appConfigFactory } from '@/config/app';

import { createRouter } from './router';
import { multiFileSwagger } from '@/tools/multi-file-swagger';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { cacheClient } from '@/lib/redis/redis-client';
import { createRateLimiter } from '@/middleware/rate-limiter';

export const createApp = async () => {
  const app = express();
  await cacheClient.connect();
  const router = await createRouter();
  const appConfig = appConfigFactory(process.env);
  const rateLimiterMiddleware = await createRateLimiter();

  const allowedOrigins = [
    process.env.ADMIN_PANEL_URL,
    process.env.LEADER_PANEL_URL,
    process.env.PLAYER_PANEL_URL,
    'http://localhost:3000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          scriptSrc: ["'self'", "https: 'unsafe-inline'"],
        },
      },
    }),
  );

  app.use(express.json());

  app.get('/health', (_, res) => {
    res.status(StatusCodes.OK).json({
      status: 'ok',
    });
  });

  const swaggerPath = path.resolve(__dirname, '../../swagger/api.yaml');
  const swaggerDocument = await multiFileSwagger(YAML.load(swaggerPath));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(cookieParser());
  app.use(rateLimiterMiddleware);
  app.use('/api', router);

  app.use('*', (_req, _res, next) => next(new NotFoundError('Page not found')));
  app.use(errorHandler);
  app.use(errors());

  return {
    server: app,
    port: appConfig.PORT,
  };
};
