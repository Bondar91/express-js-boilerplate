import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { ICreateOrganizationPayload } from '../models/organization.models';

export class CreateOrganizationCommand implements ICommand<ICreateOrganizationPayload> {
  public type = 'CREATE_ORGANIZATION';

  public constructor(public payload: ICreateOrganizationPayload) {}
}
