import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus/command-bus';
import { CancelInvitationCommand } from '../commands/cancel-invitation.command';

export const cancelInvitationActionValidation = celebrate(
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

export const cancelInvitationAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const { email } = req.body;

      await commandBus.execute<CancelInvitationCommand, void>(
        new CancelInvitationCommand({
          email,
          organizationId,
        }),
      );

      res.status(200).json({
        message: 'Cancel invitation correctly',
      });
    } catch (error) {
      next(error);
    }
  };
};
