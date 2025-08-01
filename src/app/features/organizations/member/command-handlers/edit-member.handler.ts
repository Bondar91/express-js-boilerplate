import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';
import type { TMember } from '../models/member.model';
import type { EditMemberCommand } from '../commands/edit-member.command';
import { updateMember } from '../repository/member.repository';
import { plnToCents } from '@/shared/currency-utils/currency-utils';

export class EditMemberHandler implements ICommandHandler<EditMemberCommand, TMember> {
  public commandType = 'EDIT_MEMBER';

  public async execute(command: EditMemberCommand): Promise<TMember> {
    const { fee } = command.payload;

    let convertedFee;
    if (fee) {
      convertedFee = plnToCents(fee);
    }

    const newUpdateMemberDb = await updateMember({ ...command.payload, fee: convertedFee || fee });
    return newUpdateMemberDb;
  }
}
