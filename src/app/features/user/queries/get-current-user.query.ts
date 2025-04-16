import type { IQuery } from 'src/lib/cqrs/query-bus';

import type { IGetCurrentUserParams } from '../models/user.models';

export class GetCurrentUserQuery implements IQuery<IGetCurrentUserParams> {
  public type = 'GET_CURRENT_USER';
  public constructor(public params: IGetCurrentUserParams) {}
}
