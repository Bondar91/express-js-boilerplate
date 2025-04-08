import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { ICreateMemberPayload } from '../models/member.model';

export class CreateMemberCommand implements ICommand<ICreateMemberPayload> {
  public type = 'CREATE_MEMBER';

  public constructor(public payload: ICreateMemberPayload) {}
}
