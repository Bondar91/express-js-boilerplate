import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import type { TOrganizationStatisticQueryResult } from '../models/organization.models';
import type { GetOrganizationStatisticQuery } from '../queries/get-organization-statistic.query';
import { getOrganizationStatistics } from '../repository/organization.repository';
import { transformOrganizationStatisticResponse } from '../transformers/organization.transformer';

export class GetOrganizationStatisticHandler
  implements IQueryHandler<GetOrganizationStatisticQuery, TOrganizationStatisticQueryResult>
{
  public queryType = 'GET_ORGANIZATION_STATISTIC';

  public async execute(query: GetOrganizationStatisticQuery): Promise<TOrganizationStatisticQueryResult> {
    const statistic = await getOrganizationStatistics(query.params.publicId);
    const transformedOrganizationStatistic = transformOrganizationStatisticResponse(statistic);

    return transformedOrganizationStatistic;
  }
}
