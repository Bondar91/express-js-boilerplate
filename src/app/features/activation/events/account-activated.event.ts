import type { IEvent } from '@/lib/events/event-dispatcher';

export class AccountActivatedEvent implements IEvent {
  public name = 'AccountActivated';

  public constructor(
    public readonly payload: {
      email: string;
      token: string;
      publicId: string;
      organizationId: string;
    },
  ) {}
}
