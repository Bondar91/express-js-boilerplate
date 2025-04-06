import express from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus';
import { createTeamAction, createTeamActionValidation } from './actions/create-team.action';

interface IMemberRouting {
  commandBus: CommandBus;
}

export const createTeamRouting = ({ commandBus }: IMemberRouting) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', [createTeamActionValidation], createTeamAction(commandBus));

  return router;
};
