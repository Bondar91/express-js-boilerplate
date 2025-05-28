import type { IEvent } from '@/lib/events/event-dispatcher';

export class MemberCreatedEvent implements IEvent {
  public name = 'MemberCreated';

  public constructor(
    public readonly payload: {
      email: string;
    },
  ) {}
}
