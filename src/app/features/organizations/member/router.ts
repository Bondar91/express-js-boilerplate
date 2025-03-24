import express from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import { createMemberAction, createMemberActionValidation } from './actions/create-member.action';
import { listMemberAction, listMemberActionValidation } from './actions/list-member.action';

interface IMemberRouting {
  commandBus: CommandBus;
  queryBus: QueryBus;
}

export const createMemberRouting = ({ commandBus, queryBus }: IMemberRouting) => {
  const router = express.Router({ mergeParams: true });

  router.get('/', [listMemberActionValidation], listMemberAction(queryBus));
  router.post('/', [createMemberActionValidation], createMemberAction(commandBus));

  return router;
};
