import type { ICommandHandler } from 'src/lib/cqrs/command-bus/command-bus.types';
import slugify from 'slugify';
import type { RegistrationOrganizationCommand } from '../commands/registration-orgranization.command';
import type { IRegistrationOrganizationPayload } from '../models/registration-organization.model';
import { registrationOrganization } from '../repository/registration';
import { slugExists } from '../../organizations/organization/repository/organization.repository';
import { eventDispatcher } from '@/lib/events/event-dispatcher';
import { AccountActivatedEvent } from '../../activation/events/account-activated.event';
import { createActivationToken } from '../../activation/repository/activation.repository';
import { activationTokenService } from '../../activation/services/activation-token.service';

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

    const { organizationId, user } = await registrationOrganization(newRegistrationOrganization);

    const { token, hashedToken } = await activationTokenService.generateUniqueToken();

    await createActivationToken({
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await eventDispatcher.dispatch(
      new AccountActivatedEvent({
        email,
        token,
        publicId: user.public_id,
        organizationId,
      }),
    );

    return organizationId;
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
