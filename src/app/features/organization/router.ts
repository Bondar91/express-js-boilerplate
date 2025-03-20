import express from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import { createOrganizationAction } from './actions/create-organization.action';
import { editOrganizationAction } from './actions/edit-organization.action';
import { listOrganizationsAction } from './actions/list-organizations.action';
import { authMiddleware } from '../auth/middleware/auth.middleware';
import {
  createOrganizationActionValidation,
  editOrganizationActionValidation,
  getOrganizationActionValidation,
  listOrganizationsActionValidation,
} from './validations/organization.validation';
import { getOrganizationAction } from './actions/get-organization.action';

interface IOrganizationRouting {
  commandBus: CommandBus;
  queryBus: QueryBus;
}

export const createOrganizationRouting = ({ commandBus, queryBus }: IOrganizationRouting) => {
  const router = express.Router();

  router.get('/', [listOrganizationsActionValidation], authMiddleware(), listOrganizationsAction(queryBus));
  router.post('/', [createOrganizationActionValidation], authMiddleware(), createOrganizationAction(commandBus));
  router.patch('/:publicId', [editOrganizationActionValidation], authMiddleware(), editOrganizationAction(commandBus));
  router.get('/:publicId', [getOrganizationActionValidation], authMiddleware(), getOrganizationAction(queryBus));

  return router;
};
