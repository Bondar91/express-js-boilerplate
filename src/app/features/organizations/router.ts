import express from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import { createOrganizationRouting } from './organization/router';
import { createMemberRouting } from './member/router';
import { createTeamRouting } from './team/router';

interface IOrganizationsRouting {
  commandBus: CommandBus;
  queryBus: QueryBus;
}

export const createOrganizationsRouting = ({ commandBus, queryBus }: IOrganizationsRouting) => {
  const router = express.Router();

  /** Orgranizations routes **/
  router.use('/', createOrganizationRouting({ commandBus, queryBus }));

  /** Members routes **/
  router.use('/:organizationId/members', createMemberRouting({ commandBus, queryBus }));

  /** Teams routes **/
  router.use('/:organizationId/teams', createTeamRouting({ commandBus }));

  return router;
};
