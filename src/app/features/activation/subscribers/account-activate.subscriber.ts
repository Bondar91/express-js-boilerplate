import type { IEventSubscriber, IEventSubscribersMeta } from '@/lib/events/event-dispatcher';
import { createLogger, type ILogger } from '@/lib/logger';
import { accountActivateMailService } from '../services/account-activate-mail.service';
import type { AccountActivatedEvent } from '../events/account-activated.event';

export class AccountActivateSubscriber implements IEventSubscriber {
  private logger: ILogger;

  public constructor() {
    this.logger = createLogger();
  }

  public getSubscribedEvents(): IEventSubscribersMeta[] {
    return [{ name: 'AccountActivated', method: 'handleAccountActivated' }];
  }

  public async handleAccountActivated(event: AccountActivatedEvent) {
    const { email, token, publicId, organizationId } = event.payload;

    this.logger.info(`Sending account activated email to ${email}`);

    try {
      await accountActivateMailService.sendAccountActivateEmail(email, token, publicId, organizationId);
      this.logger.info(`Account activate email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send account activate email to ${email}`, { error });
      throw error;
    }
  }
}
