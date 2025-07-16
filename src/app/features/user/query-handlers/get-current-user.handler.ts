import type { IQueryHandler } from '@/lib/cqrs/query-bus';

import type { TCurrentUser } from '../models/user.models';
import { findUserByPublicId } from '../repository/user.repository';
import type { GetCurrentUserQuery } from '../queries/get-current-user.query';
import { UnauthorizedError } from '../../auth/errors/unauthorized.error';
import { JwtService } from '../../auth/services/jwt.service';
import { transformCurrentUserResponse } from '../transformers/current-user.transformer';
import { NotFoundError } from '@/errors/not-found.error';

export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery, TCurrentUser> {
  public queryType = 'GET_CURRENT_USER';

  public async execute(query: GetCurrentUserQuery): Promise<TCurrentUser> {
    const { accessToken } = query.params;

    if (!accessToken) {
      throw new UnauthorizedError('Not authenticated');
    }

    const payload = JwtService.verifyAccessToken(accessToken);

    const user = await findUserByPublicId(payload.publicId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return transformCurrentUserResponse(user);
  }
}
