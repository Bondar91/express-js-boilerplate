import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from '@/lib/cqrs/command-bus/command-bus';

import { RefreshTokenCommand } from '../commands/refresh-token.command';
import type { IAuthTokens } from '../models/auth.model';
import { UnauthorizedError } from '../errors/unauthorized.error';

export const refreshTokenActionValidation = celebrate(
  {
    cookies: Joi.object()
      .keys({
        refreshToken: Joi.string().required(),
      })
      .unknown(true),
  },
  { abortEarly: false },
);

export const refreshTokenAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        const error = new UnauthorizedError('Refresh token not found in cookies');
        return next(error);
      }

      const authResult = await commandBus.execute<RefreshTokenCommand, IAuthTokens>(
        new RefreshTokenCommand({
          refreshToken,
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
