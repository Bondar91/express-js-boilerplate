import type { IQuery } from 'src/lib/cqrs/query-bus';

import type { IGetUsersParams } from '../models/user.models';

export class GetUsersQuery implements IQuery<IGetUsersParams> {
  public type = 'GET_USERS';
  public constructor(public params: IGetUsersParams) {}
}
