import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import type { GetTeamQuery } from '../queries/get-team.query';
import type { TTeamDetailsResult } from '../models/team.model';

import { findTeamByPublicId } from '../repository/team.repository';
import { transformTeamDetailsResponse } from '../transformers/team-details.transformer';

export class GetTeamHandler implements IQueryHandler<GetTeamQuery, TTeamDetailsResult> {
  public queryType = 'GET_TEAM';

  public async execute(query: GetTeamQuery): Promise<TTeamDetailsResult> {
    const team = await findTeamByPublicId(query.params.organizationId, query.params.teamId);
    const transformedTeam = transformTeamDetailsResponse(team);

    return transformedTeam;
  }
}
