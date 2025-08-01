import type { ICommand } from '@/lib/cqrs/command-bus';
import type { IInvitationRequestPayload } from '../models/invitation.model';

export class CancelInvitationCommand implements ICommand<IInvitationRequestPayload> {
  public type = 'CANCEL_INVITATION';

  public constructor(public payload: IInvitationRequestPayload) {}
}
