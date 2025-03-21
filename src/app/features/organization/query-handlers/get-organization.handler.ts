import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import { findOrganizationByPublicId } from '../repository/organization.repository';
import type { TOrganizationResponse } from '../models/organization.models';
import type { GetOrganizationQuery } from '../queries/get-organization.query';

export class GetOrganizationHandler implements IQueryHandler<GetOrganizationQuery, TOrganizationResponse> {
  public queryType = 'GET_ORGANIZATION';

  public async execute(query: GetOrganizationQuery): Promise<TOrganizationResponse> {
    const organization = await findOrganizationByPublicId(query.params.publicId);
    return organization;
  }
}
