import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';
import { CreateMemberCommand } from '../commands/create-member.command';
import type { TMember } from '../models/member.model';

export const createMemberActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().required(),
    }),
    body: Joi.object().keys({
      name: Joi.string().required(),
      surname: Joi.string().required(),
      email: Joi.string().required().email().max(100),
      roleId: Joi.string().required(),
      status: Joi.string().valid('PENDING', 'ACTIVE').default('PENDING'),
      guardian: Joi.boolean().optional().default(false),
    }),
  },
  { abortEarly: false },
);

export const createMemberAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const { name, surname, email, roleId, status, guardian } = req.body;

      const currentUserId = req?.user?.publicId;

      await commandBus.execute<CreateMemberCommand, TMember>(
        new CreateMemberCommand({
          organizationId,
          name,
          surname,
          email,
          roleId,
          status,
          addedBy: currentUserId || null,
          guardian,
        }),
      );

      res.status(201).json({ message: 'Member added correctly' });
    } catch (error) {
      next(error);
    }
  };
};
