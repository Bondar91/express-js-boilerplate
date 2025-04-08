import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { IEditTeamPayload } from '../models/team.model';

export class EditTeamCommand implements ICommand<IEditTeamPayload> {
  public type = 'EDIT_TEAM';

  public constructor(public payload: IEditTeamPayload) {}
}
