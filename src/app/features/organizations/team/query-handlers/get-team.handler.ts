import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import type { GetTeamQuery } from '../queries/get-team.query';
import type { TTeamQueryResult } from '../models/team.model';
import { transformTeamResponse } from '../transformers/team.transformer';
import { findTeamByPublicId } from '../repository/team.repository';

export class GetTeamHandler implements IQueryHandler<GetTeamQuery, TTeamQueryResult> {
  public queryType = 'GET_TEAM';

  public async execute(query: GetTeamQuery): Promise<TTeamQueryResult> {
    const team = await findTeamByPublicId(query.params.organizationId, query.params.teamId);
    const transformedTeam = transformTeamResponse(team);

    return transformedTeam;
  }
}
