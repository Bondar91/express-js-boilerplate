export interface IEvent {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;
}

export interface IEventSubscribersMeta {
  name: string;
  method: string;
}

export interface IEventSubscriber {
  getSubscribedEvents(): IEventSubscribersMeta[];
}
