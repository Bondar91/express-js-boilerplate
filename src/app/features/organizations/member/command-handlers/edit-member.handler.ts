import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import type { IUpdateMemberPayload } from '../models/member.model';

import type { TMember } from '../models/member.model';
import type { EditMemberCommand } from '../commands/edit-member.command';
import { updateMember } from '../repository/member.repository';

export class EditMemberHandler implements ICommandHandler<EditMemberCommand, TMember> {
  public commandType = 'EDIT_MEMBER';

  public async execute(command: EditMemberCommand): Promise<TMember> {
    const { name, surname, email, roles, status, updatedBy, organizationId, memberId } = command.payload;

    const updateMemberNew: IUpdateMemberPayload = {
      name,
      surname,
      email,
      roles,
      status,
      updatedBy,
      organizationId,
      memberId,
    };

    const newUpdateMemberDb = await updateMember(updateMemberNew);
    return newUpdateMemberDb;
  }
}
