import type { ICommand } from '@/lib/cqrs/command-bus';
import type { IForgotPasswordPayload } from '../models/auth.model';

export class ForgotPasswordCommand implements ICommand<IForgotPasswordPayload> {
  public type = 'FORGOT_PASSWORD';

  public constructor(public payload: IForgotPasswordPayload) {}
}
