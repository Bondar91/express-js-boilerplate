import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import { updateTeam } from '../repository/team.repository';
import type { EditTeamCommand } from '../commands/edit-team.command';
import type { TTeam } from '../models/team.model';

export class EditTeamHandler implements ICommandHandler<EditTeamCommand, TTeam> {
  public commandType = 'EDIT_TEAM';

  public async execute(command: EditTeamCommand): Promise<TTeam> {
    const { organizationId, teamId, name, description } = command.payload;

    const updatedOrganization = await updateTeam({
      organizationId,
      teamId,
      name,
      description,
    });

    return updatedOrganization;
  }
}
