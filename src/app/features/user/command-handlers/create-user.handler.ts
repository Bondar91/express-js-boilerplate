import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import { createUser } from '../repository/user.repository';
import type { ICreateUserPayload, TUser } from '../models/user.models';
import type { CreateUserCommand } from '../commands/create-user.command';

export class CreateUserHandler implements ICommandHandler<CreateUserCommand, TUser> {
  public commandType = 'CREATE_USER';

  public async execute(command: CreateUserCommand): Promise<TUser> {
    const { name, surname } = command.payload;

    const newUser: ICreateUserPayload = {
      name,
      surname,
    };

    const dbUser = await createUser(newUser);

    return dbUser;
  }
}
