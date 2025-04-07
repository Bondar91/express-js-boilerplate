import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import type { IAssignTeamMemberPayload } from '../models/team.model';
import type { AssignTeamMemberCommand } from '../commands/assign-team-member.command';
import { assignTeamMember } from '../repository/team.repository';

export class AssignTeamMemberHandler implements ICommandHandler<AssignTeamMemberCommand, void> {
  public commandType = 'ASSIGN_TEAM_MEMBER';

  public async execute(command: AssignTeamMemberCommand): Promise<void> {
    const { organizationId, teamId, members } = command.payload;

    const assignTeamMemberPayload: IAssignTeamMemberPayload = {
      organizationId,
      teamId,
      members,
    };

    await assignTeamMember(assignTeamMemberPayload);
  }
}
