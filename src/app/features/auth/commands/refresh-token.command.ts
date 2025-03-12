import type { ICommand } from '@/lib/cqrs/command-bus';
import type { IRefreshTokenPayload } from '../models/auth.model';

export class RefreshTokenCommand implements ICommand<IRefreshTokenPayload> {
  public type = 'REFRESH_TOKEN';

  public constructor(public payload: IRefreshTokenPayload) {}
}
