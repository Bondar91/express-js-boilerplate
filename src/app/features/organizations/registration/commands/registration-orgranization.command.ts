import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { IRegistrationOrganizationPayload } from '../models/registration-organization.model';

export class RegistrationOrganizationCommand implements ICommand<IRegistrationOrganizationPayload> {
  public type = 'REGISTRATION_ORGANIZATION';

  public constructor(public payload: IRegistrationOrganizationPayload) {}
}
