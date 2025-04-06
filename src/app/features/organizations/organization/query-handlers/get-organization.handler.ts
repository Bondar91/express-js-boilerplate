import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import { findOrganizationByPublicId } from '../repository/organization.repository';
import type { TOrganizationQueryResult } from '../models/organization.models';
import type { GetOrganizationQuery } from '../queries/get-organization.query';
import { transformOrganizationResponse } from '../transformers/organization.transformer';

export class GetOrganizationHandler implements IQueryHandler<GetOrganizationQuery, TOrganizationQueryResult> {
  public queryType = 'GET_ORGANIZATION';

  public async execute(query: GetOrganizationQuery): Promise<TOrganizationQueryResult> {
    const organization = await findOrganizationByPublicId(query.params.publicId);
    const transformedOrganizations = transformOrganizationResponse(organization);

    return transformedOrganizations;
  }
}
