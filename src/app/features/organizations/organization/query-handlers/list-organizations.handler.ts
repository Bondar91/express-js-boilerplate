import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import type { ListOrganizationsQuery } from '../queries/list-organizations.query';
import type { IPaginationResult } from '@/shared/pagination-utils/pagination-utils';
import { listOrganizations } from '../repository/organization.repository';
import { makePaginationResult } from '@/shared/pagination-utils/pagination-utils';
import { organizationPaginationOptions } from '../config/pagination.config';
import type { TOrganizationQueryResult } from '../models/organization.models';
import { transformOrganizationResponse } from '../transformers/organization.transformer';

export class ListOrganizationsHandler
  implements IQueryHandler<ListOrganizationsQuery, IPaginationResult<TOrganizationQueryResult>>
{
  public queryType = 'LIST_ORGANIZATIONS';

  public async execute(query: ListOrganizationsQuery): Promise<IPaginationResult<TOrganizationQueryResult>> {
    const [organizations, total] = await listOrganizations(query.params);
    const transformedOrganizations = organizations.map(organization => transformOrganizationResponse(organization));

    return makePaginationResult(transformedOrganizations, total, query.params, organizationPaginationOptions);
  }
}
