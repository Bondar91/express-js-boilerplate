import type { ICommand } from '@/lib/cqrs/command-bus';
import type { IInvitationRequestPayload } from '../models/invitation.model';

export class ResendInvitationCommand implements ICommand<IInvitationRequestPayload> {
  public type = 'RESEND_INVITATION';

  public constructor(public payload: IInvitationRequestPayload) {}
}
