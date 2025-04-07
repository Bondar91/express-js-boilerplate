import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';

import { celebrate, Joi } from 'celebrate';
import type { TTeam } from '../models/team.model';
import { EditTeamCommand } from '../commands/edit-team.command';

export const editTeamActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().required(),
      teamId: Joi.string().required(),
    }),
    body: Joi.object().keys({
      name: Joi.string().required(),
      description: Joi.string().optional(),
    }),
  },
  { abortEarly: false },
);

export const editTeamAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teamId, organizationId } = req.params;
      const { name, description } = req.body;

      await commandBus.execute<EditTeamCommand, TTeam>(
        new EditTeamCommand({
          teamId,
          organizationId,
          name,
          description,
        }),
      );

      res.status(200).json({ message: 'Team updated correctly' });
    } catch (error) {
      next(error);
    }
  };
};
