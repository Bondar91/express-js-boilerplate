import express from 'express';

import { CommandBus } from '@/lib/cqrs/command-bus';
import { QueryBus } from '@/lib/cqrs/query-bus';
import { registerHandlers } from '@/lib/cqrs/handlers-register';
import { creteUserRouting } from './features/user/router';
import { createAuthRouting } from './features/auth/router';
import { createOrganizationsRouting } from './features/organizations/router';
import { eventDispatcher, registerSubscribers } from '@/lib/events/event-dispatcher';
import { createActivationRouting } from './features/activation/router';
import { createRegistrationOrganizationRouting } from './features/registration/router';

export const createRouter = async () => {
  const router = express.Router();
  const commandBus = new CommandBus();
  const queryBus = new QueryBus();

  await registerSubscribers(eventDispatcher);
  await registerHandlers(commandBus);
  await registerHandlers(queryBus);

  router.use('/users', creteUserRouting({ commandBus, queryBus }));
  router.use('/auth', createAuthRouting({ commandBus }));
  router.use('/organizations', createOrganizationsRouting({ commandBus, queryBus }));
  router.use('/registration', createRegistrationOrganizationRouting({ commandBus }));
  router.use('/activation', createActivationRouting({ commandBus }));

  return router;
};
