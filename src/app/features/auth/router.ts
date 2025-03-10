import express from 'express';

import type { CommandBus } from '@/lib/cqrs/command-bus';

import { loginAction, loginActionValidation } from './actions/login.action';
import { refreshTokenAction, refreshTokenActionValidation } from './actions/refresh-token.action';
import { logoutAction } from './actions/logout.action';
import { authMiddleware } from './middleware/auth.middleware';
// import { logoutAction } from './actions/logout.action';
// import { authMiddleware } from './middleware/auth.middleware';

interface ICreateAuthRouting {
  commandBus: CommandBus;
}

export const createAuthRouting = ({ commandBus }: ICreateAuthRouting) => {
  const router = express.Router();

  router.post('/login', [loginActionValidation], loginAction(commandBus));
  router.post('/refresh-token', [refreshTokenActionValidation], refreshTokenAction(commandBus));
  router.post('/logout', [authMiddleware()], logoutAction(commandBus));

  return router;
};
