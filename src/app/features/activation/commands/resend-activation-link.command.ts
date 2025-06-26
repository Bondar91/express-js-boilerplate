import type { ICommand } from '@/lib/cqrs/command-bus';
import type { IResendActivationLinkPayload } from '../models/activation.model';

export class ResendActivationLinkCommand implements ICommand<IResendActivationLinkPayload> {
  public type = 'RESEND_ACTIVATION_LINK';

  public constructor(public payload: IResendActivationLinkPayload) {}
}
