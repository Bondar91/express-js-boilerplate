import type { ICommand } from '@/lib/cqrs/command-bus';
import type { ILoginPayload } from '../models/auth.model';

export class LoginCommand implements ICommand<ILoginPayload> {
  public type = 'LOGIN';

  public constructor(public payload: ILoginPayload) {}
}
