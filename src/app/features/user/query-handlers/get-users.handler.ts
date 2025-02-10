import type { IQueryHandler } from '@/lib/cqrs/query-bus';

import type { GetUsersQuery } from '../queries/get-users.query';
import type { TUser } from '../models/user.models';
import { getAllUsers } from '../repository/user.repository';

export class GetUsersHandler implements IQueryHandler<GetUsersQuery, TUser[]> {
  public queryType = 'GET_USERS';

  public async execute(_query: GetUsersQuery): Promise<TUser[]> {
    console.log(_query, 'when add query');
    const users = await getAllUsers();
    return users;
  }
}
