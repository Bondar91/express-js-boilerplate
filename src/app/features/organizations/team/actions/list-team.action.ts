import type { NextFunction, Request, Response } from 'express';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import type { IPaginationResult } from '@/shared/pagination-utils/pagination-utils';
import { celebrate, Joi } from 'celebrate';
import type { TTeamQueryResult } from '../models/team.model';
import { ListTeamQuery } from '../queries/list-team.query';

export const listTeamActionValidation = celebrate(
  {
    headers: Joi.object(),
    query: Joi.object().keys({
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
      sort: Joi.string().optional(),
      filter: Joi.string().optional(),
      search: Joi.string().optional(),
    }),
  },
  { abortEarly: false },
);

export const listTeamAction = (queryBus: QueryBus) => {
  return async ({ query }: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        ...query,
        page: Number(query.page),
        limit: Number(query.limit),
        filter: query.filter ? JSON.parse(query.filter as string) : undefined,
        sort: query.sort ? JSON.parse(query.sort as string) : undefined,
      };

      const teams = await queryBus.execute<ListTeamQuery, IPaginationResult<TTeamQueryResult>>(
        new ListTeamQuery(params),
      );

      res.status(200).json(teams);
    } catch (error) {
      next(error);
    }
  };
};
