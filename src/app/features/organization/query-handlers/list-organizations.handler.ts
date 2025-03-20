import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import type { ListOrganizationsQuery } from '../queries/list-organizations.query';
import type { IPaginationResult } from '@/shared/pagination-utils/pagination-utils';
import { listOrganizations } from '../repository/organization.repository';
import { makePaginationResult } from '@/shared/pagination-utils/pagination-utils';
import { organizationPaginationOptions } from '../config/pagination.config';
import type { TOrganizationResponse } from '../models/organization.models';

export class ListOrganizationsHandler
  implements IQueryHandler<ListOrganizationsQuery, IPaginationResult<TOrganizationResponse>>
{
  public queryType = 'LIST_ORGANIZATIONS';

  public async execute(query: ListOrganizationsQuery): Promise<IPaginationResult<TOrganizationResponse>> {
    const [items, total] = await listOrganizations(query.params);
    return makePaginationResult(items, total, query.params, organizationPaginationOptions);
  }
}
