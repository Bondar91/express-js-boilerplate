import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { IDeleteTeamPayload } from '../models/team.model';

export class DeleteTeamCommand implements ICommand<IDeleteTeamPayload> {
  public type = 'DELETE_TEAM';

  public constructor(public payload: IDeleteTeamPayload) {}
}
