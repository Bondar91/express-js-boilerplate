import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from '@/lib/cqrs/command-bus/command-bus';
import { ResendActivationLinkCommand } from '../commands/resend-activation-link.command';

export const resendActivationLinkActionValidation = celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      organizationId: Joi.string().required(),
    }),
  },
  { abortEarly: false },
);

export const resendActivationLinkAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, organizationId } = req.body;

      await commandBus.execute<ResendActivationLinkCommand, void>(
        new ResendActivationLinkCommand({
          email,
          organizationId,
        }),
      );

      res.status(201).json({
        message:
          'If an account with this email exists, we’ll send you a activation link shortly. Please check your inbox and spam folder.',
      });
    } catch (error) {
      next(error);
    }
  };
};
