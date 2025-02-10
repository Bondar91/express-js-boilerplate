import express from 'express';

import { CommandBus } from '@/lib/cqrs/command-bus';
import { QueryBus } from '@/lib/cqrs/query-bus';
import { registerHandlers } from '@/lib/cqrs/handlers-register';
import { creteUserRouting } from './features/user/router';

export const createRouter = async () => {
  const router = express.Router();
  const commandBus = new CommandBus();
  const queryBus = new QueryBus();

  await registerHandlers(commandBus);
  await registerHandlers(queryBus);

  router.use('/users', creteUserRouting({ commandBus, queryBus }));

  return router;
};
