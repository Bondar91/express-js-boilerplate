import type { IQuery } from '@/lib/cqrs/query-bus';
import type { PaginationParamsDto } from '@/shared/pagination-utils/pagination-utils';

export class ListOrganizationsQuery implements IQuery<PaginationParamsDto> {
  public type = 'LIST_ORGANIZATIONS';
  public constructor(public params: PaginationParamsDto) {}
}
