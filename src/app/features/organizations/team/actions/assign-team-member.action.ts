import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';
import { AssignTeamMemberCommand } from '../commands/assign-team-member.command';

export const assignTeamMemberActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().required(),
      teamId: Joi.string().required(),
    }),
    body: Joi.object().keys({
      members: Joi.object({
        add: Joi.array().items(Joi.string()).optional().default([]),
        remove: Joi.array().items(Joi.string()).optional().default([]),
      }).optional(),
    }),
  },
  { abortEarly: false },
);

export const assignTeamMemberAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, teamId } = req.params;
      const { members } = req.body;

      await commandBus.execute<AssignTeamMemberCommand, void>(
        new AssignTeamMemberCommand({
          organizationId,
          teamId,
          members,
        }),
      );

      res.status(200).json({ message: 'Team members have been updated successfully' });
    } catch (error) {
      next(error);
    }
  };
};
