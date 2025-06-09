import type { IEventSubscriber, IEventSubscribersMeta } from '@/lib/events/event-dispatcher';
import type { PasswordResetRequestedEvent } from '../events/password-reset-requested.event';
import { createLogger, type ILogger } from '@/lib/logger';
import { authMailService } from '../services/auth-mail.service';

export class PasswordResetSubscriber implements IEventSubscriber {
  private logger: ILogger;

  public constructor() {
    this.logger = createLogger();
  }

  public getSubscribedEvents(): IEventSubscribersMeta[] {
    return [{ name: 'PasswordResetRequested', method: 'handlePasswordResetRequested' }];
  }

  public async handlePasswordResetRequested(event: PasswordResetRequestedEvent) {
    const { email, token, publicId } = event.payload;

    this.logger.info(`Sending password reset email to ${email}`);

    try {
      await authMailService.sendPasswordResetEmail(email, token, publicId);
      this.logger.info(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, { error });
      throw error;
    }
  }
}
