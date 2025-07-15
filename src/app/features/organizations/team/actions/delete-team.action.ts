import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';
import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';
import { DeleteTeamCommand } from '../commands/delete-team.command';

export const deleteTeamActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().uuid().required(),
      teamId: Joi.string().uuid().required(),
    }),
  },
  { abortEarly: false },
);

export const deleteTeamAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, teamId } = req.params;

      await commandBus.execute<DeleteTeamCommand, void>(
        new DeleteTeamCommand({
          organizationId,
          teamId,
        }),
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
};
