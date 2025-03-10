import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';
import type { LoginCommand } from '../commands/login.command';
import type { IAuthTokens, ITokenPayload } from '../models/auth.model';
import { storeRefreshToken, validateUserCredentials } from '../repository/auth.repository';
import { JwtService } from '../services/jwt.service';

export class LoginHandler implements ICommandHandler<LoginCommand, IAuthTokens> {
  public commandType = 'LOGIN';

  public async execute(command: LoginCommand): Promise<IAuthTokens> {
    const { email, password } = command.payload;

    const user = await validateUserCredentials(email, password);

    const tokenPayload: ITokenPayload = {
      publicId: user.public_id,
      name: user.name,
      surname: user.surname,
      email: user.email,
    };

    const tokens = JwtService.generateTokens(tokenPayload);

    await storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
