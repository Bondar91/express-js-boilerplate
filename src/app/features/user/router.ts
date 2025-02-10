import express from 'express';

import type { CommandBus } from '@/lib/cqrs/command-bus';
import type { QueryBus } from '@/lib/cqrs/query-bus';

import { createUserAction, createUserActionValidation } from './actions/create-user.action';
import { getUsersAction } from './actions/get-users.action';

interface ICreateUserRouting {
  commandBus: CommandBus;
  queryBus: QueryBus;
}

export const creteUserRouting = ({ commandBus, queryBus }: ICreateUserRouting) => {
  const router = express.Router();

  router.post('/', [createUserActionValidation], createUserAction(commandBus));
  router.get('/', [], getUsersAction(queryBus));

  return router;
};
