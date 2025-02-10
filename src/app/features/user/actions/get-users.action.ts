import type { NextFunction, Request, Response } from 'express';

import type { QueryBus } from 'src/lib/cqrs/query-bus';

import { GetUsersQuery } from '../queries/get-users.query';
import type { TUser } from '../models/user.models';

export const getUsersAction = (queryBus: QueryBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await queryBus.execute<GetUsersQuery, TUser[]>(new GetUsersQuery(req.query));
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };
};
