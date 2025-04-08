import type { IQuery } from '@/lib/cqrs/query-bus';
import type { IPaginationParamsDto } from '@/shared/pagination-utils/pagination-utils';

export class ListTeamQuery implements IQuery<IPaginationParamsDto> {
  public type = 'LIST_TEAM';

  public constructor(public params: IPaginationParamsDto) {}
}
