import type { ICommandHandler } from '@/lib/cqrs/command-bus/command-bus.types';

import type { ForgotPasswordCommand } from '../commands/forgot-password.command';
import { findUserByEmail } from '../../user/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { createPasswordReset, findPasswordResetUniqueByToken } from '../repository/auth.repository';
import type { PasswordReset } from '@prisma/client';
import { eventDispatcher } from '@/lib/events/event-dispatcher';
import { PasswordResetRequestedEvent } from '../events/password-reset-requested.event';

export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand, void> {
  public commandType = 'FORGOT_PASSWORD';

  public async execute(command: ForgotPasswordCommand): Promise<void> {
    const { email } = command.payload;

    const user = await findUserByEmail(email);

    if (!user) {
      return;
    }

    const { token, hashedToken } = await this.generateUniqueToken();

    await createPasswordReset({
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await eventDispatcher.dispatch(
      new PasswordResetRequestedEvent({
        email,
        token,
        publicId: user.public_id,
      }),
    );
  }

  private async generateUniqueToken() {
    let token: string;
    let hashedToken: string;
    let existingToken: PasswordReset | null;

    do {
      token = randomBytes(32).toString('hex');
      hashedToken = await bcrypt.hash(token, 10);
      existingToken = await findPasswordResetUniqueByToken(hashedToken);
    } while (existingToken);

    return { token, hashedToken };
  }
}
