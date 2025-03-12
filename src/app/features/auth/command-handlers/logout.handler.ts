import type { ICommandHandler } from '@/lib/cqrs/command-bus/command-bus.types';

import { clearRefreshToken } from '../repository/auth.repository';
import type { LogoutCommand } from '../commands/logout.command';

export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  public commandType = 'LOGOUT';

  public async execute(command: LogoutCommand): Promise<void> {
    const { publicId } = command.payload;
    await clearRefreshToken(publicId);
  }
}
