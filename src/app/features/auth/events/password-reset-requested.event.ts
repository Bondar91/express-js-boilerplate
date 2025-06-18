import type { IEvent } from '@/lib/events/event-dispatcher';

export class PasswordResetRequestedEvent implements IEvent {
  public name = 'PasswordResetRequested';

  public constructor(
    public readonly payload: {
      email: string;
      token: string;
      publicId: string;
    },
  ) {}
}
