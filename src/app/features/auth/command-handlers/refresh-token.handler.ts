import type { ICommandHandler } from '@/lib/cqrs/command-bus/command-bus.types';

import { JwtService } from '../services/jwt.service';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { getUserByRefreshToken, storeRefreshToken } from '../repository/auth.repository';
import type { RefreshTokenCommand } from '../commands/refresh-token.command';
import type { IAuthTokens } from '../models/auth.model';

export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, IAuthTokens> {
  public commandType = 'REFRESH_TOKEN';

  public async execute(command: RefreshTokenCommand): Promise<IAuthTokens> {
    const { refreshToken } = command.payload;

    try {
      JwtService.verifyRefreshToken(refreshToken);

      const user = await getUserByRefreshToken(refreshToken);

      const tokenPayload = {
        publicId: user.public_id,
        name: user.name,
        surname: user.surname,
        email: user.email,
      };

      const tokens = JwtService.generateTokens(tokenPayload);

      await storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}
