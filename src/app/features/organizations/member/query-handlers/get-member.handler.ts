import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import { transformMemberResponse } from '../transformers/member.transformer';
import type { GetMemberQuery } from '../queries/get-member.query';
import type { TMemberQueryResult } from '../models/member.model';
import { findMemberByPublicId } from '../repository/member.repository';

export class GetMemberHandler implements IQueryHandler<GetMemberQuery, TMemberQueryResult> {
  public queryType = 'GET_MEMBER';

  public async execute(query: GetMemberQuery): Promise<TMemberQueryResult> {
    const member = await findMemberByPublicId(query.params.memberId);
    const transformedMember = transformMemberResponse(member);

    return transformedMember;
  }
}
