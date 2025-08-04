import type { ICommandHandler } from '@/lib/cqrs/command-bus/command-bus.types';
import type { CancelInvitationCommand } from '../commands/cancel-invitation.command';
import { cancelUserInvitation } from '../repository/invitation.repository';

export class CancelInvitationCommandHandler implements ICommandHandler<CancelInvitationCommand, void> {
  public commandType = 'CANCEL_INVITATION';

  public async execute(command: CancelInvitationCommand): Promise<void> {
    return await cancelUserInvitation(command.payload);
  }
}
