import { createApp } from '@/app/app';
import { createLogger } from '@/lib/logger';

(async () => {
  const app = await createApp();
  const logger = createLogger();

  process.on('uncaughtException', err => {
    logger.error(`Uncaught: ${err.toString()}`, err);
    process.exit(1);
  });

  process.on('unhandledRejection', err => {
    if (err instanceof Error) {
      logger.error(`Unhandled: ${err.message}`, err);
    } else {
      logger.error('Unhandled rejection: Unknown error', err);
    }
    process.exit(1);
  });

  const { server, port } = app;
  server.listen(port);
  logger.info(`listening on port: ${port}`);
})();
