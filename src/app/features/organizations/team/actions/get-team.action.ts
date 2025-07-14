import type { NextFunction, Request, Response } from 'express';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import { celebrate, Joi } from 'celebrate';
import type { TTeamDetailsResult } from '../models/team.model';
import { GetTeamQuery } from '../queries/get-team.query';

export const getTeamActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().required(),
      teamId: Joi.string().required(),
    }),
  },
  { abortEarly: false },
);

export const getTeamAction = (queryBus: QueryBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teamId, organizationId } = req.params;

      const member = await queryBus.execute<GetTeamQuery, TTeamDetailsResult>(
        new GetTeamQuery({ teamId, organizationId }),
      );

      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  };
};
