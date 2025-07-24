import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { IDeleteTeamsPayload } from '../models/team.model';

export class DeleteTeamsCommand implements ICommand<IDeleteTeamsPayload> {
  public type = 'DELETE_TEAMS';

  public constructor(public payload: IDeleteTeamsPayload) {}
}
