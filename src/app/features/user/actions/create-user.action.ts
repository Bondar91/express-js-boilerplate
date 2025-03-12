import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';

import { CreateUserCommand } from '../commands/create-user.command';
import type { TUserWithoutPassword } from '../models/user.models';

export const createUserActionValidation = celebrate(
  {
    body: Joi.object().keys({
      name: Joi.string().required().max(50),
      surname: Joi.string().required().max(50),
      email: Joi.string().required().max(100),
      password: Joi.string().min(8).required(),
    }),
  },
  { abortEarly: false },
);

export const createUserAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, surname, email, password } = req.body;

      const newUser = await commandBus.execute<CreateUserCommand, TUserWithoutPassword>(
        new CreateUserCommand({
          name,
          surname,
          email,
          password,
        }),
      );

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  };
};
