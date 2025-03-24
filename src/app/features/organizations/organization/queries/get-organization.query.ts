import type { IQuery } from '@/lib/cqrs/query-bus';
import type { IGetOrgranizationParam } from '../models/organization.models';

export class GetOrganizationQuery implements IQuery<IGetOrgranizationParam> {
  public type = 'GET_ORGANIZATION';
  public constructor(public params: IGetOrgranizationParam) {}
}
