import express from 'express';

import type { CommandBus } from '@/lib/cqrs/command-bus';

import { createOrganizationAction, } from './actions/create-organization.action';
import { editOrganizationAction, } from './actions/edit-organization.action';
import { authMiddleware } from '../auth/middleware/auth.middleware';
import { createOrganizationValidation, editOrganizationValidation } from './validations/organization.validation';

interface ICreateOrganizationRouting {
  commandBus: CommandBus;
}

export const createOrganizationRouting = ({ commandBus }: ICreateOrganizationRouting) => {
  const router = express.Router();

  router.post('/', [createOrganizationValidation], authMiddleware(), createOrganizationAction(commandBus));
  router.patch('/:publicId', [editOrganizationValidation], authMiddleware(), editOrganizationAction(commandBus));

  return router;
};
