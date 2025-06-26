import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus/command-bus';
import { AccountActivationCommand } from '../commands/account-activation.commnad';

export const accountActivationActionValidation = celebrate(
  {
    body: Joi.object().keys({
      pid: Joi.string().uuid().required(),
      token: Joi.string().required(),
      oid: Joi.string().uuid().required(),
      name: Joi.string().min(1).required(),
      surname: Joi.string().min(1).required(),
      fee: Joi.number().required(),
    }),
  },
  { abortEarly: false },
);

export const accountActivationAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pid: publicId, oid: organizationId, token, name, surname, fee } = req.body;

      await commandBus.execute<AccountActivationCommand, void>(
        new AccountActivationCommand({
          publicId,
          token,
          name,
          surname,
          fee,
          organizationId,
        }),
      );

      res.status(200).json({
        message: 'Account activate correctly',
      });
    } catch (error) {
      next(error);
    }
  };
};
