import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import type { ICreateTeamPayload, TTeam } from '../models/team.model';
import type { CreateTeamCommand } from '../commands/create-team.command';
import { createTeam, findTeamByName } from '../repository/team.repository';
import { ConflictError } from '@/errors/conflict.error';

export class CreateTeamHandler implements ICommandHandler<CreateTeamCommand, TTeam> {
  public commandType = 'CREATE_TEAM';

  public async execute(command: CreateTeamCommand): Promise<TTeam> {
    const { name, description, organizationId } = command.payload;

    const existingTeam = await findTeamByName(organizationId, name);

    if (existingTeam) {
      throw new ConflictError(`Team name "${name}" already exists in this organization.`);
    }

    const newTeam: ICreateTeamPayload = {
      name,
      description,
      organizationId,
    };

    const newTeamDb = await createTeam(newTeam);
    return newTeamDb;
  }
}
