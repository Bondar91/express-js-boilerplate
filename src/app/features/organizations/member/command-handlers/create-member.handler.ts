import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import { createMember } from '../repository/member.repository';
import type { ICreateMemberPayload } from '../models/member.model';
import type { CreateMemberCommand } from '../commands/create-member.command';
import type { TMember } from '../models/member.model';
import { MemberCreatedEvent } from '../events/member-created.event';
import { eventDispatcher } from '@/lib/events/event-dispatcher';

export class CreateMemberHandler implements ICommandHandler<CreateMemberCommand, TMember> {
  public commandType = 'CREATE_MEMBER';

  public async execute(command: CreateMemberCommand): Promise<TMember> {
    const { name, surname, email, roleId, status, addedBy, organizationId } = command.payload;

    const newMember: ICreateMemberPayload = {
      name,
      surname,
      email,
      roleId,
      status,
      addedBy,
      organizationId,
    };

    const newMemberDb = await createMember(newMember);

    await eventDispatcher.dispatch(new MemberCreatedEvent(command.payload));

    return newMemberDb;
  }
}
