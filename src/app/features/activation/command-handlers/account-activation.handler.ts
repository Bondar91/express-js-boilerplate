import type { ICommandHandler } from '@/lib/cqrs/command-bus/command-bus.types';
import { findUserByPublicId } from '../../user/repository/user.repository';
import { BadRequestError } from '@/errors/bad-request.error';
import * as bcrypt from 'bcrypt';
import type { AccountActivationCommand } from '../commands/account-activation.commnad';
import { activateAccount } from '../repository/activation.repository';
import { plnToCents } from '@/shared/currency-utils/currency-utils';

export class AccountActivationHandler implements ICommandHandler<AccountActivationCommand, void> {
  public commandType = 'ACCOUNT_ACTIVATION';

  public async execute(command: AccountActivationCommand): Promise<void> {
    const { publicId, token, organizationId, name, surname, fee } = command.payload;

    const user = await findUserByPublicId(publicId);
    if (!user || user.ActivationToken.length === 0) {
      throw new BadRequestError('Invalid or expired token');
    }

    const activationToken = user.ActivationToken[0];

    const isValidToken = await bcrypt.compare(token, activationToken.token);
    if (!isValidToken || activationToken.expiresAt < new Date() || activationToken.used) {
      throw new BadRequestError('Invalid or expired token');
    }

    await activateAccount({
      publicId,
      token,
      organizationId,
      name,
      surname,
      fee: plnToCents(fee),
      activationTokenId: activationToken.id,
    });
  }
}
