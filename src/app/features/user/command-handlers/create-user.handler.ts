import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import { createUser } from '../repository/user.repository';
import type { ICreateUserPayload, TUserWithoutPassword } from '../models/user.models';
import type { CreateUserCommand } from '../commands/create-user.command';

export class CreateUserHandler implements ICommandHandler<CreateUserCommand, TUserWithoutPassword> {
  public commandType = 'CREATE_USER';

  public async execute(command: CreateUserCommand): Promise<TUserWithoutPassword> {
    const { name, surname, email, password } = command.payload;

    const newUser: ICreateUserPayload = {
      name,
      surname,
      email,
      password,
    };

    const newUserDb = await createUser(newUser);
    return newUserDb;
  }
}
