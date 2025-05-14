import type { IEventSubscriber, IEventSubscribersMeta } from '@/lib/events/event-dispatcher';
import type { MemberCreatedEvent } from '../events/member-created.event';

export class MemberSubscriber implements IEventSubscriber {
  public getSubscribedEvents(): IEventSubscribersMeta[] {
    return [{ name: 'MemberCreated', method: 'handleMemberCreated' }];
  }

  public async handleMemberCreated(event: MemberCreatedEvent) {
    console.log('Handling member created:', event.payload);
    // Tutaj logika wysyłki maila
  }
}
