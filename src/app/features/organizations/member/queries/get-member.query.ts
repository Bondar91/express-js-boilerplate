import type { IQuery } from '@/lib/cqrs/query-bus';
import type { IGetMemberParam } from '../models/member.model';

export class GetMemberQuery implements IQuery<IGetMemberParam> {
  public type = 'GET_MEMBER';
  public constructor(public params: IGetMemberParam) {}
}
