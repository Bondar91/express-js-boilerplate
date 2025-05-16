import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import slugify from 'slugify';

import type { RegistrationOrganizationCommand } from '../commands/registration-orgranization.command';
import type { IRegistrationOrganizationPayload } from '../models/registration-organization.model';
import { registrationOrganization } from '../repository/registration';
import { slugExists } from '../../organization/repository/organization.repository';

export class RegistrationOrganizationHandler implements ICommandHandler<RegistrationOrganizationCommand, string> {
  public commandType = 'REGISTRATION_ORGANIZATION';

  public async execute(command: RegistrationOrganizationCommand): Promise<string> {
    const { name, email, password } = command.payload;

    const slugToUse = await this.generateUniqueSlug(name);

    const newRegistrationOrganization: IRegistrationOrganizationPayload = {
      name,
      email,
      password,
      slug: slugToUse,
    };

    const registrationOrganizationDb = await registrationOrganization(newRegistrationOrganization);
    return registrationOrganizationDb;
  }

  private async generateUniqueSlug(name: string) {
    const baseSlug = slugify(name, {
      lower: true,
      strict: true,
      locale: 'pl',
    });

    let slug = baseSlug;
    let counter = 0;

    while (await slugExists(slug)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }
}
