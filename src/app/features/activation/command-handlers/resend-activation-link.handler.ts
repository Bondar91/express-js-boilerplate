import type { ICommandHandler } from '@/lib/cqrs/command-bus/command-bus.types';
import { eventDispatcher } from '@/lib/events/event-dispatcher';
import type { ResendActivationLinkCommand } from '../commands/resend-activation-link.command';
import { activationTokenService } from '../services/activation-token.service';
import { AccountActivatedEvent } from '../events/account-activated.event';
import { findUserByEmail } from '@/app/features/user/repository/user.repository';
import { createActivationToken } from '../repository/activation.repository';

export class ResendActivationLinkHandler implements ICommandHandler<ResendActivationLinkCommand, void> {
  public commandType = 'RESEND_ACTIVATION_LINK';

  public async execute(command: ResendActivationLinkCommand): Promise<void> {
    const { email, organizationId } = command.payload;

    const user = await findUserByEmail(email);

    if (!user) {
      return;
    }

    const { token, hashedToken } = await activationTokenService.generateUniqueToken();

    await createActivationToken({
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await eventDispatcher.dispatch(
      new AccountActivatedEvent({
        email,
        token,
        publicId: user.public_id,
        organizationId,
      }),
    );
  }
}
