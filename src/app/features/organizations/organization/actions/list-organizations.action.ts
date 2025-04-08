import type { NextFunction, Request, Response } from 'express';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import { ListOrganizationsQuery } from '../queries/list-organizations.query';
import type { TOrganization } from '../models/organization.models';

export const listOrganizationsAction = (queryBus: QueryBus) => {
  return async ({ query }: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        ...query,
        page: Number(query.page),
        limit: Number(query.limit),
        filter: query.filter ? JSON.parse(query.filter as string) : undefined,
        sort: query.sort ? JSON.parse(query.sort as string) : undefined,
      };

      const organizations = await queryBus.execute<ListOrganizationsQuery, TOrganization[]>(
        new ListOrganizationsQuery(params),
      );

      res.status(200).json(organizations);
    } catch (error) {
      next(error);
    }
  };
};
