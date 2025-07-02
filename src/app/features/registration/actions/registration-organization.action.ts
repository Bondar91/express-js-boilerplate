import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';

import { RegistrationOrganizationCommand } from '../commands/registration-orgranization.command';
import type { IRegistrationOrganizationResponse } from '../models/registration-organization.model';
import { celebrate, Joi } from 'celebrate';

export const registrationOrganizationActionValidation = celebrate(
  {
    body: Joi.object().keys({
      name: Joi.string().required().max(50),
      email: Joi.string().required().max(100),
      password: Joi.string().min(8).required(),
    }),
  },
  { abortEarly: false },
);

export const registrationOrganizationAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const organizationId = await commandBus.execute<
        RegistrationOrganizationCommand,
        IRegistrationOrganizationResponse
      >(
        new RegistrationOrganizationCommand({
          name,
          email,
          password,
        }),
      );

      res.status(201).json({ message: 'Club registration was successful.', organizationId });
    } catch (error) {
      next(error);
    }
  };
};
