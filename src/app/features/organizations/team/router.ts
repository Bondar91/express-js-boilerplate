import express from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus';
import { createTeamAction, createTeamActionValidation } from './actions/create-team.action';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import { listTeamAction, listTeamActionValidation } from './actions/list-team.action';

interface ITeamRouting {
  commandBus: CommandBus;
  queryBus: QueryBus;
}

export const createTeamRouting = ({ commandBus, queryBus }: ITeamRouting) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', [createTeamActionValidation], createTeamAction(commandBus));
  router.get('/', [listTeamActionValidation], listTeamAction(queryBus));

  return router;
};
