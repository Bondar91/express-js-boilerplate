import type { NextFunction, Request, Response } from 'express';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import type { TOrganizationStatisticQueryResult } from '../models/organization.models';
import { GetOrganizationStatisticQuery } from '../queries/get-organization-statistic.query';

export const getOrganizationStatisticAction = (queryBus: QueryBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params;

      const organization = await queryBus.execute<GetOrganizationStatisticQuery, TOrganizationStatisticQueryResult>(
        new GetOrganizationStatisticQuery({ publicId }),
      );

      res.status(200).json(organization);
    } catch (error) {
      next(error);
    }
  };
};
