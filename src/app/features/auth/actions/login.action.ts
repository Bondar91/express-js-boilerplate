import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from '@/lib/cqrs/command-bus/command-bus';

import { LoginCommand } from '../commands/login.command';
import type { IAuthTokens } from '../models/auth.model';

export const loginActionValidation = celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  },
  { abortEarly: false },
);

export const loginAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const authResult = await commandBus.execute<LoginCommand, IAuthTokens>(
        new LoginCommand({
          email,
          password,
        }),
      );

      res.cookie('accessToken', authResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', authResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        id: authResult.publicId,
        name: authResult.name,
        surname: authResult.surname,
        email: authResult.email,
      });
    } catch (error) {
      next(error);
    }
  };
};
