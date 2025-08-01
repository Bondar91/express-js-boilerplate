import type { ICommandHandler } from '@/lib/cqrs/command-bus/command-bus.types';
import type { ResendInvitationCommand } from '../commands/resend-invitation.command';
import { sendInvitationUser } from '../repository/invitation.repository';
import { activationTokenService } from '../../activation/services/activation-token.service';
import { createActivationToken } from '../../activation/repository/activation.repository';
import { eventDispatcher } from '@/lib/events/event-dispatcher';
import { AccountActivatedEvent } from '../../activation/events/account-activated.event';

export class ResendInvitationCommandHandler implements ICommandHandler<ResendInvitationCommand, void> {
  public commandType = 'RESEND_INVITATION';

  public async execute(command: ResendInvitationCommand): Promise<void> {
    const sendInvitation = await sendInvitationUser(command.payload);

    const { token, hashedToken } = await activationTokenService.generateUniqueToken();

    await createActivationToken({
      userId: sendInvitation.userId,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sentCount: 1,
    });

    await eventDispatcher.dispatch(
      new AccountActivatedEvent({
        email: command.payload.email,
        token,
        publicId: sendInvitation.userPublicId,
        organizationId: command.payload.organizationId,
      }),
    );
  }
}
