import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { IUpdateMemberPayload } from '../models/member.model';

export class EditMemberCommand implements ICommand<IUpdateMemberPayload> {
  public type = 'EDIT_MEMBER';

  public constructor(public payload: IUpdateMemberPayload) {}
}
