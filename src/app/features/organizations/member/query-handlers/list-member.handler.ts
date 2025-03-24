import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import type { ListMemberQuery } from '../queries/list-member.query';
import type { IPaginationResult } from '@/shared/pagination-utils/pagination-utils';
import { makePaginationResult } from '@/shared/pagination-utils/pagination-utils';
import { listMember } from '../repository/member.repository';
import type { TMemberResponse } from '../models/member.model';
import { memberPaginationOptions } from '../../config/pagination.config';

export class ListMemberHandler implements IQueryHandler<ListMemberQuery, IPaginationResult<TMemberResponse>> {
  public queryType = 'LIST_MEMBER';

  public async execute(query: ListMemberQuery): Promise<IPaginationResult<TMemberResponse>> {
    const [items, total] = await listMember(query.params);
    return makePaginationResult(items, total, query.params, memberPaginationOptions);
  }
}
