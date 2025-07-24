import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';
import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';
import { DeleteTeamsCommand } from '../commands/delete-teams.command';

export const deleteTeamsActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().uuid().required(),
    }),
    body: Joi.object().keys({
      teamIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    }),
  },
  { abortEarly: false },
);

export const deleteTeamsAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;

      const { teamIds } = req.body;

      await commandBus.execute<DeleteTeamsCommand, void>(
        new DeleteTeamsCommand({
          organizationId,
          teamIds,
        }),
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
};
