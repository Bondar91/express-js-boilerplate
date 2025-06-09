import type { ICommandHandler } from '@/lib/cqrs/command-bus/command-bus.types';
import type { ResetPasswordCommand } from '../commands/reset-password.command';
import { findUserByPublicId, resetUserPassword } from '../../user/repository/user.repository';
import { hashPassword } from '../helpers/password.helper';

import { BadRequestError } from '@/errors/bad-request.error';
import * as bcrypt from 'bcrypt';

export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand, void> {
  public commandType = 'RESET_PASSWORD';

  public async execute(command: ResetPasswordCommand): Promise<void> {
    const { publicId, token, password } = command.payload;

    const user = await findUserByPublicId(publicId);
    if (!user || user.passwordReset.length === 0) {
      throw new BadRequestError('Invalid or expired token');
    }

    const isValidToken = await bcrypt.compare(token, user.passwordReset[0].token);

    if (!isValidToken) {
      throw new BadRequestError('Invalid or expired token');
    }

    if (user.passwordReset[0].expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired token');
    }

    const hashedPassword = await hashPassword(password);
    await resetUserPassword(user.id, hashedPassword);
  }
}
