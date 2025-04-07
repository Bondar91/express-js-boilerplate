import type { IQuery } from '@/lib/cqrs/query-bus';
import type { IGetTeamParam } from '../models/team.model';

export class GetTeamQuery implements IQuery<IGetTeamParam> {
  public type = 'GET_TEAM';

  public constructor(public params: IGetTeamParam) {}
}
