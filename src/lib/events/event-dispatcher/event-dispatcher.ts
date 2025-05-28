import type { IEvent, IEventSubscriber } from './event-dispatcher.types';

export class EventDispatcher {
  private subscribers: { name: string; subscriber: (event: IEvent) => Promise<void> }[] = [];

  public constructor(private readonly throwOnFailure: boolean = false) {}

  public subscribe(name: string, subscriber: (event: IEvent) => Promise<void>) {
    this.subscribers.push({ name, subscriber });
  }

  public addSubscribers(subscribers: IEventSubscriber[]) {
    subscribers.forEach(subscriber => this.addSubscriber(subscriber));
  }

  public addSubscriber(subscriber: IEventSubscriber) {
    const eventsMeta = subscriber.getSubscribedEvents();

    eventsMeta.forEach(({ name, method }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (subscriber as any)[method].bind(subscriber);
      this.subscribe(name, handler);
    });
  }

  public async dispatch<T extends IEvent>(event: T) {
    const eligibleSubscribers = this.subscribers
      .filter(s => s.name === event.name)
      .map(({ subscriber, name }) => ({ subscriber, name }));

    console.log(`Dispatching ${event.name} to ${eligibleSubscribers.length} subscribers`);

    const promises = eligibleSubscribers.map(async ({ subscriber, name }) => {
      try {
        await subscriber(event);
      } catch (error) {
        if (this.throwOnFailure) {
          throw error;
        }

        console.error(`Subscriber ${name} failed:`, error);
        if (this.isCritical(event)) {
          this.retryWithBackoff(event, subscriber);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  private isCritical(event: IEvent): boolean {
    return event.name.endsWith('Critical');
  }

  private async retryWithBackoff(
    event: IEvent,
    handler: (event: IEvent) => Promise<void>,
    attempt: number = 1,
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      if (attempt >= 3) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      await this.retryWithBackoff(event, handler, attempt + 1);
    }
  }
}

export const eventDispatcher = new EventDispatcher();
export default eventDispatcher;
