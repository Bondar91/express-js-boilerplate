import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { ICreateUserPayload } from '../models/user.models';

export class CreateUserCommand implements ICommand<ICreateUserPayload> {
  public type = 'CREATE_USER';

  public constructor(public payload: ICreateUserPayload) {}
}
