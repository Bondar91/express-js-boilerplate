import type { IQuery } from '@/lib/cqrs/query-bus';
import type { IGetOrgranizationParam } from '../models/organization.models';

export class GetOrganizationStatisticQuery implements IQuery<IGetOrgranizationParam> {
  public type = 'GET_ORGANIZATION_STATISTIC';
  public constructor(public params: IGetOrgranizationParam) {}
}
