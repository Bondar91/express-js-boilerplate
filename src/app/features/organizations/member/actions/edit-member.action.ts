import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';

import { EditMemberCommand } from '../commands/edit-member.command';
import type { TMember } from '../models/member.model';
import { celebrate, Joi } from 'celebrate';

export const editMemberActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().required(),
      memberId: Joi.string().required(),
    }),
    body: Joi.object().keys({
      name: Joi.string().required(),
      surname: Joi.string().required(),
      email: Joi.string().required().email().max(100),
      roles: Joi.object({
        add: Joi.array().items(Joi.string()).optional().default([]),
        remove: Joi.array().items(Joi.string()).optional().default([]),
      }).optional(),
      status: Joi.string().valid('PENDING', 'ACTIVE').default('PENDING'),
    }),
  },
  { abortEarly: false },
);

export const editMemberAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { memberId, organizationId } = req.params;
      const { name, surname, email, status, roles } = req.body;
      const currentUserId = req?.user?.publicId;

      await commandBus.execute<EditMemberCommand, TMember>(
        new EditMemberCommand({
          memberId,
          organizationId,
          name,
          surname,
          email,
          status,
          roles,
          updatedBy: currentUserId || null,
        }),
      );

      res.status(200).json({ message: 'Member updated correctly' });
    } catch (error) {
      next(error);
    }
  };
};
