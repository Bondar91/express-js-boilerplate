import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { IAssignTeamMemberPayload } from '../models/team.model';

export class AssignTeamMemberCommand implements ICommand<IAssignTeamMemberPayload> {
  public type = 'ASSIGN_TEAM_MEMBER';

  public constructor(public payload: IAssignTeamMemberPayload) {}
}
