import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import { createOrganization, slugExists } from '../repository/organization.repository';
import type { ICreateOrganizationPayload, TOrganization } from '../models/organization.models';
import type { CreateOrganizationCommand } from '../commands/create-organization.command';
import slugify from 'slugify';
import { BadRequestError } from '@/errors/bad-request.error';

export class CreateOrganizationHandler implements ICommandHandler<CreateOrganizationCommand, TOrganization> {
  public commandType = 'CREATE_ORGANIZATION';

  public async execute(command: CreateOrganizationCommand): Promise<TOrganization> {
    const { name, slug, type, address, city, postalCode, country, phone, email, website, settings, active, memberId } =
      command.payload;

    let slugToUse;

    if (slug) {
      if (await slugExists(slug)) {
        throw new BadRequestError('This slug already exists');
      }
      slugToUse = slug;
    } else {
      slugToUse = await this.generateUniqueSlug(name!);
    }

    const newOrganization: ICreateOrganizationPayload = {
      name,
      slug: slugToUse,
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
      memberId,
    };

    const newOrganizationDb = await createOrganization(newOrganization);
    return newOrganizationDb;
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
