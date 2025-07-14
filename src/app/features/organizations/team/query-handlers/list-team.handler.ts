import type { IQueryHandler } from '@/lib/cqrs/query-bus';
import type { IPaginationResult } from '@/shared/pagination-utils/pagination-utils';
import { makePaginationResult } from '@/shared/pagination-utils/pagination-utils';
import type { TTeamQueryResult } from '../models/team.model';
import type { ListTeamQuery } from '../queries/list-team.query';
import { transformTeamResponse } from '../transformers/team.transformer';
import { teamPaginationOptions } from '../config/pagination.config';
import { listTeam } from '../repository/team.repository';

export class ListTeamHandler implements IQueryHandler<ListTeamQuery, IPaginationResult<TTeamQueryResult>> {
  public queryType = 'LIST_TEAM';

  public async execute(query: ListTeamQuery): Promise<IPaginationResult<TTeamQueryResult>> {
    const [teams, total] = await listTeam(query.params);

    const transformedTeams = teams.map(team => transformTeamResponse(team));

    return makePaginationResult(transformedTeams, total, query.params, teamPaginationOptions);
  }
}
