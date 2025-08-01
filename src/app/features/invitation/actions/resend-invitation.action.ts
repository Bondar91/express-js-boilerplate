import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus/command-bus';
import { ResendInvitationCommand } from '../commands/resend-invitation.command';

export const resendInvitationActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().uuid().required(),
    }),
    body: Joi.object().keys({
      email: Joi.string().email().required(),
    }),
  },
  { abortEarly: false },
);

export const resendInvitationAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const { email } = req.body;

      await commandBus.execute<ResendInvitationCommand, void>(
        new ResendInvitationCommand({
          email,
          organizationId,
        }),
      );

      res.status(200).json({
        message: 'Resend invitation correctly',
      });
    } catch (error) {
      next(error);
    }
  };
};
