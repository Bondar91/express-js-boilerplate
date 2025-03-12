import express from 'express';

import { CommandBus } from '@/lib/cqrs/command-bus';
import { QueryBus } from '@/lib/cqrs/query-bus';
import { registerHandlers } from '@/lib/cqrs/handlers-register';
import { creteUserRouting } from './features/user/router';
import { createAuthRouting } from './features/auth/router';

export const createRouter = async () => {
  const router = express.Router();
  const commandBus = new CommandBus();
  const queryBus = new QueryBus();

  await registerHandlers(commandBus);
  await registerHandlers(queryBus);

  router.use('/users', creteUserRouting({ commandBus, queryBus }));
  router.use('/auth', createAuthRouting({ commandBus }));

  return router;
};
