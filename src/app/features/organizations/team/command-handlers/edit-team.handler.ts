import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';
import { updateTeam } from '../repository/team.repository';
import type { EditTeamCommand } from '../commands/edit-team.command';
import { plnToCents } from '@/shared/currency-utils/currency-utils';

export class EditTeamHandler implements ICommandHandler<EditTeamCommand, void> {
  public commandType = 'EDIT_TEAM';

  public async execute(command: EditTeamCommand): Promise<void> {
    const { fee } = command.payload;

    let convertedFee;
    if (fee) {
      convertedFee = String(plnToCents(fee));
    }

    return await updateTeam({ ...command.payload, fee: convertedFee || fee });
  }
}
