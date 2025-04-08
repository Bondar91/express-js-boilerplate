import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import type { ListMemberQuery } from '../queries/list-member.query';
import type { IPaginationResult } from '@/shared/pagination-utils/pagination-utils';
import { makePaginationResult } from '@/shared/pagination-utils/pagination-utils';
import { listMember } from '../repository/member.repository';
import type { TMemberQueryResult } from '../models/member.model';
import { memberPaginationOptions } from '../../config/pagination.config';
import { transformMemberResponse } from '../transformers/member.transformer';

export class ListMemberHandler implements IQueryHandler<ListMemberQuery, IPaginationResult<TMemberQueryResult>> {
  public queryType = 'LIST_MEMBER';

  public async execute(query: ListMemberQuery): Promise<IPaginationResult<TMemberQueryResult>> {
    const [members, total] = await listMember(query.params);
    const transformedMembers = members.map(member => transformMemberResponse(member));

    return makePaginationResult(transformedMembers, total, query.params, memberPaginationOptions);
  }
}
