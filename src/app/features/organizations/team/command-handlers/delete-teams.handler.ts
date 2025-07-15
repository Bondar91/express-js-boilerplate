import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';
import { deleteTeamsByPublicIds } from '../repository/team.repository';
import type { DeleteTeamsCommand } from '../commands/delete-teams.command';
import { NotFoundError } from '@/errors/not-found.error';

export class DeleteTeamsHandler implements ICommandHandler<DeleteTeamsCommand, void> {
  public commandType = 'DELETE_TEAMS';

  public async execute(command: DeleteTeamsCommand): Promise<void> {
    const { organizationId, teamIds } = command.payload;

    const deleted = await deleteTeamsByPublicIds(organizationId, teamIds);

    if (!deleted) {
      throw new NotFoundError('Team not found!');
    }
  }
}
