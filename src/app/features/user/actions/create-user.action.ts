import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';

import { CreateUserCommand } from '../commands/create-user.command';
import type { TUser } from '../models/user.models';

export const createUserActionValidation = celebrate(
  {
    body: Joi.object().keys({
      name: Joi.string().required().max(50),
      surname: Joi.string().required().max(50),
    }),
  },
  { abortEarly: false },
);

export const createUserAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, surname } = req.body;

      const newUser = await commandBus.execute<CreateUserCommand, TUser>(
        new CreateUserCommand({
          name,
          surname,
        }),
      );

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  };
};
