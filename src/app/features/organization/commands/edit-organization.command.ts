import type { ICommand } from 'src/lib/cqrs/command-bus';

import type { IEditOrganizationPayload } from '../models/organization.models';

export class EditOrganizationCommand implements ICommand<IEditOrganizationPayload> {
  public type = 'EDIT_ORGANIZATION';

  public constructor(public payload: IEditOrganizationPayload) {}
}
