import type { IQueryHandler } from '@/lib/cqrs/query-bus';

import type { GetUsersQuery } from '../queries/get-users.query';
import type { TUserWithoutPassword } from '../models/user.models';
import { getAllUsers } from '../repository/user.repository';

export class GetUsersHandler implements IQueryHandler<GetUsersQuery, TUserWithoutPassword[]> {
  public queryType = 'GET_USERS';

  public async execute(_query: GetUsersQuery): Promise<TUserWithoutPassword[]> {
    const users = await getAllUsers();
    return users;
  }
}
