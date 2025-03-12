import type { ICommand } from '@/lib/cqrs/command-bus';
import type { ILogoutPayload } from '../models/auth.model';

export class LogoutCommand implements ICommand<ILogoutPayload> {
  public type = 'LOGOUT';

  public constructor(public payload: ILogoutPayload) {}
}
