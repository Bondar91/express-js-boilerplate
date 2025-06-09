import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from '@/lib/cqrs/command-bus/command-bus';

import { ForgotPasswordCommand } from '../commands/forgot-password.command';

export const forgotPasswordActionValidation = celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
    }),
  },
  { abortEarly: false },
);

export const forgotPasswordAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      await commandBus.execute<ForgotPasswordCommand, void>(
        new ForgotPasswordCommand({
          email,
        }),
      );

      res.status(200).json({
        message:
          'If an account with this email exists, we’ll send you a password reset link shortly. Please check your inbox and spam folder.',
      });
    } catch (error) {
      next(error);
    }
  };
};
