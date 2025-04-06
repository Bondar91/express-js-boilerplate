import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';
import type { TTeam } from '../models/team.model';
import { CreateTeamCommand } from '../commands/create-team.command';

export const createTeamActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().required(),
    }),
    body: Joi.object().keys({
      name: Joi.string().required(),
      description: Joi.string().optional(),
    }),
  },
  { abortEarly: false },
);

export const createTeamAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const { name, description } = req.body;

      await commandBus.execute<CreateTeamCommand, TTeam>(
        new CreateTeamCommand({
          organizationId,
          name,
          description,
        }),
      );

      res.status(201).json({ message: 'Team added correctly' });
    } catch (error) {
      next(error);
    }
  };
};
