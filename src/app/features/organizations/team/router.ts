import express from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus';
import { createTeamAction, createTeamActionValidation } from './actions/create-team.action';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import { listTeamAction, listTeamActionValidation } from './actions/list-team.action';
import { getTeamAction, getTeamActionValidation } from './actions/get-team.action';
import { editTeamAction, editTeamActionValidation } from './actions/edit-team.action';

interface ITeamRouting {
  commandBus: CommandBus;
  queryBus: QueryBus;
}

export const createTeamRouting = ({ commandBus, queryBus }: ITeamRouting) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', [createTeamActionValidation], createTeamAction(commandBus));
  router.get('/', [listTeamActionValidation], listTeamAction(queryBus));
  router.get('/:teamId', [getTeamActionValidation], getTeamAction(queryBus));
  router.put('/:teamId', [editTeamActionValidation], editTeamAction(commandBus));

  return router;
};
