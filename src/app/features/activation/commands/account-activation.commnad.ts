import type { ICommand } from '@/lib/cqrs/command-bus';
import type { IAccountActivationRequestPayload } from '../models/activation.model';

export class AccountActivationCommand implements ICommand<IAccountActivationRequestPayload> {
  public type = 'ACCOUNT_ACTIVATION';

  public constructor(public payload: IAccountActivationRequestPayload) {}
}
