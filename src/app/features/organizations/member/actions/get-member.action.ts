import type { NextFunction, Request, Response } from 'express';
import type { QueryBus } from '@/lib/cqrs/query-bus';
import type { TMember } from '../models/member.model';
import { GetMemberQuery } from '../queries/get-member.query';
import { celebrate, Joi } from 'celebrate';

export const getMemberActionValidation = celebrate(
  {
    params: Joi.object().keys({
      organizationId: Joi.string().required(),
      memberId: Joi.string().required(),
    }),
  },
  { abortEarly: false },
);

export const getMemberAction = (queryBus: QueryBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { memberId } = req.params;

      const member = await queryBus.execute<GetMemberQuery, TMember>(new GetMemberQuery({ memberId }));

      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  };
};
