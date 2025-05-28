import express from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus';

import {
  registrationOrganizationAction,
  registrationOrganizationActionValidation,
} from './actions/registration-organization.action';

interface IRegistrationOrganizationRouting {
  commandBus: CommandBus;
}

export const createRegistrationOrganizationRouting = ({ commandBus }: IRegistrationOrganizationRouting) => {
  const router = express.Router();

  router.post('/', [registrationOrganizationActionValidation], registrationOrganizationAction(commandBus));

  return router;
};
