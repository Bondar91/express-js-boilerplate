import type { IQuery } from '@/lib/cqrs/query-bus';
import type { IPaginationParamsDto } from '@/shared/pagination-utils/pagination-utils';

export class ListOrganizationsQuery implements IQuery<IPaginationParamsDto> {
  public type = 'LIST_ORGANIZATIONS';
  public constructor(public params: IPaginationParamsDto) {}
}
