import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { ICreateTeamPayload } from '../models/team.model';

export class CreateTeamCommand implements ICommand<ICreateTeamPayload> {
  public type = 'CREATE_TEAM';

  public constructor(public payload: ICreateTeamPayload) {}
}
