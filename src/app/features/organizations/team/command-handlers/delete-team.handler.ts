import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';
import { deleteTeamByPublicId } from '../repository/team.repository';
import type { DeleteTeamCommand } from '../commands/delete-team.command';
import { NotFoundError } from '@/errors/not-found.error';

export class DeleteTeamHandler implements ICommandHandler<DeleteTeamCommand, void> {
  public commandType = 'DELETE_TEAM';

  public async execute(command: DeleteTeamCommand): Promise<void> {
    const { organizationId, teamId } = command.payload;

    const deleted = await deleteTeamByPublicId(organizationId, teamId);

    if (!deleted) {
      throw new NotFoundError('Team not found!');
    }
  }
}
