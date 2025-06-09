import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus/command-bus';
import { ResetPasswordCommand } from '../commands/reset-password.command';

export const resetPasswordActionValidation = celebrate(
  {
    body: Joi.object().keys({
      pid: Joi.string().uuid().required(),
      token: Joi.string().required(),
      password: Joi.string().min(8).required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Password must be the same',
      }),
    }),
  },
  { abortEarly: false },
);

export const resetPasswordAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pid: publicId, token, password } = req.body;

      await commandBus.execute<ResetPasswordCommand, void>(
        new ResetPasswordCommand({
          publicId,
          token,
          password,
        }),
      );

      res.status(200).json({
        message: 'Passsword update correctly',
      });
    } catch (error) {
      next(error);
    }
  };
};
