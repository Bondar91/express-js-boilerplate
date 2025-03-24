import type { IQuery } from '@/lib/cqrs/query-bus';
import type { IPaginationParamsDto } from '@/shared/pagination-utils/pagination-utils';

export class ListMemberQuery implements IQuery<IPaginationParamsDto> {
  public type = 'LIST_MEMBER';
  public constructor(public params: IPaginationParamsDto) {}
}
