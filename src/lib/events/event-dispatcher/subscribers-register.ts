import { sync } from 'fast-glob';
import type { EventDispatcher } from './event-dispatcher';
import type { IEventSubscriber } from './event-dispatcher.types';

export const registerSubscribers = async (dispatcher: EventDispatcher) => {
  const subscriberFiles = sync('**/*.subscriber.ts', {
    absolute: true,
    ignore: ['**/node_modules/**'],
  });

  for (const file of subscriberFiles) {
    const module = await import(file);
    const SubscriberClass = module[Object.keys(module)[0]] as new () => IEventSubscriber;

    if (SubscriberClass) {
      dispatcher.addSubscriber(new SubscriberClass());
    }
  }
};
