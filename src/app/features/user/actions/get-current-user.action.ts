import type { NextFunction, Request, Response } from 'express';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import { GetCurrentUserQuery } from '../queries/get-current-user.query';
import type { TCurrentUser } from '../models/user.models';

export const getCurrentUserAction = (queryBus: QueryBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken } = req.cookies;

      const currentUser = await queryBus.execute<GetCurrentUserQuery, TCurrentUser>(
        new GetCurrentUserQuery({ accessToken }),
      );

      res.status(200).json(currentUser);
    } catch (error) {
      next(error);
    }
  };
};
