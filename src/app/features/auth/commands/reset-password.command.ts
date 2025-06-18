import type { ICommand } from '@/lib/cqrs/command-bus';
import type { IResetPasswordRequestPayload } from '../models/auth.model';

export class ResetPasswordCommand implements ICommand<IResetPasswordRequestPayload> {
  public type = 'RESET_PASSWORD';

  public constructor(public payload: IResetPasswordRequestPayload) {}
}
