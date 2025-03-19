import express from 'express';

import type { CommandBus } from '@/lib/cqrs/command-bus';

import { createOrganizationAction, createOrganizationActionValidation } from './actions/create-organization.action';
import { authMiddleware } from '../auth/middleware/auth.middleware';

interface ICreateOrganizationRouting {
  commandBus: CommandBus;
}

export const createOrganizationRouting = ({ commandBus }: ICreateOrganizationRouting) => {
  const router = express.Router();

  router.post('/', [createOrganizationActionValidation], authMiddleware(), createOrganizationAction(commandBus));

  return router;
};
