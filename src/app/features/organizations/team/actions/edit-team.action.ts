import type { NextFunction, Request, Response } from 'express';
import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';
import { celebrate, Joi } from 'celebrate';
import { EditTeamCommand } from '../commands/edit-team.command';

export const editTeamActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().required(),
      teamId: Joi.string().required(),
    }),
    body: Joi.object()
      .keys({
        name: Joi.string().optional(),
        fee: Joi.string()
          .pattern(/^(?=.+)(?!0+(\.0+)?$)\d+(\.\d+)?$/)
          .optional(),
        memberIds: Joi.array().items(Joi.string().required()).min(1).optional(),
        staffIds: Joi.array().items(Joi.string().required()).min(1).optional(),
      })
      .min(1),
  },
  { abortEarly: false },
);

export const editTeamAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teamId, organizationId } = req.params;
      const { name, fee, memberIds, staffIds } = req.body;

      await commandBus.execute<EditTeamCommand, void>(
        new EditTeamCommand({
          organizationId,
          teamId,
          name,
          fee,
          memberIds,
          staffIds,
        }),
      );

      res.status(200).json({ message: 'Team updated correctly' });
    } catch (error) {
      next(error);
    }
  };
};
