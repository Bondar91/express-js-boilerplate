import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import { updateOrganization } from '../repository/organization.repository';
import type { TOrganization } from '../models/organization.models';
import type { EditOrganizationCommand } from '../commands/edit-organization.command';

export class EditOrganizationHandler implements ICommandHandler<EditOrganizationCommand, TOrganization> {
  public commandType = 'EDIT_ORGANIZATION';

  public async execute(command: EditOrganizationCommand): Promise<TOrganization> {
    const {
      publicId,
      name,
      slug,
      type,
      address,
      city,
      postalCode,
      country,
      phone,
      email,
      website,
      settings,
      active,
      owners,
    } = command.payload;

    const updatedOrganization = await updateOrganization({
      publicId,
      name,
      slug,
      type,
      address,
      city,
      postalCode,
      country,
      phone,
      email,
      website,
      settings,
      active,
      owners,
    });

    return updatedOrganization;
  }
}
