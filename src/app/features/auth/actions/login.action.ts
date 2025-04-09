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

      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('accessToken', authResult.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: parseInt(process.env.JWT_TOKEN_EXPIRES_IN || '3600', 10) * 1000,
      });

      res.cookie('refreshToken', authResult.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '2592000', 10) * 1000,
      });

      res.status(200).json({
        message: 'Login sucessfull!',
      });
    } catch (error) {
      next(error);
    }
  };
};
