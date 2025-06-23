import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';

import slugify from 'slugify';

import type { RegistrationOrganizationCommand } from '../commands/registration-orgranization.command';
import type { IRegistrationOrganizationPayload } from '../models/registration-organization.model';
import { registrationOrganization } from '../repository/registration';
import { slugExists } from '../../organization/repository/organization.repository';
import { eventDispatcher } from '@/lib/events/event-dispatcher';
import { AccountActivatedEvent } from '../events/account-activated.event';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

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

    const {organizationName, user} = await registrationOrganization(newRegistrationOrganization);
    
    const { token, hashedToken } = await this.generateUniqueToken();
    

    await eventDispatcher.dispatch(
      new AccountActivatedEvent({
        email,
        token,
        publicId: user.public_id,
      }),
    );

    return organizationName;
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
  
  private async generateUniqueToken() {
    let token: string;
    let hashedToken: string;
    let existingToken: PasswordReset | null;

    do {
      token = randomBytes(32).toString('hex');
      hashedToken = await bcrypt.hash(token, 10);
      existingToken = await findPasswordResetUniqueByToken(hashedToken);
    } while (existingToken);

    return { token, hashedToken };
  }
}
}
