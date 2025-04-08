import type { NextFunction, Request, Response } from 'express';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import type { TOrganization } from '../models/organization.models';
import { GetOrganizationQuery } from '../queries/get-organization.query';

export const getOrganizationAction = (queryBus: QueryBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params;

      const organization = await queryBus.execute<GetOrganizationQuery, TOrganization>(
        new GetOrganizationQuery({ publicId }),
      );

      res.status(200).json(organization);
    } catch (error) {
      next(error);
    }
  };
};
