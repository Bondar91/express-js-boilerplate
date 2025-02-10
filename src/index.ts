import { createApp } from '@/app/app';

(async () => {
  const app = await createApp();
  process.on('uncaughtException', err => {
    console.error(`Uncaught: ${err.toString()}`, err);
    process.exit(1);
  });

  process.on('unhandledRejection', err => {
    if (err instanceof Error) {
      console.error(`Unhandled: ${err.message}`, err);
    } else {
      console.error('Unhandled rejection: Unknown error', err);
    }
    process.exit(1);
  });

  const { server, port } = app;
  server.listen(port);
  console.info(`listening on port: ${port}`);
})();
