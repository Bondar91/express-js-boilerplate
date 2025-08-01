import express from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import { createMemberAction, createMemberActionValidation } from './actions/create-member.action';
import { listMemberAction, listMemberActionValidation } from './actions/list-member.action';
import { getMemberAction, getMemberActionValidation } from './actions/get-member.action';
import { editMemberAction, editMemberActionValidation } from './actions/edit-member.action';

interface IMemberRouting {
  commandBus: CommandBus;
  queryBus: QueryBus;
}

export const createMemberRouting = ({ commandBus, queryBus }: IMemberRouting) => {
  const router = express.Router({ mergeParams: true });

  router.get('/', [listMemberActionValidation], listMemberAction(queryBus));
  router.get('/:memberId', [getMemberActionValidation], getMemberAction(queryBus));
  router.post('/', [createMemberActionValidation], createMemberAction(commandBus));
  router.patch('/:memberId', [editMemberActionValidation], editMemberAction(commandBus));

  return router;
};
