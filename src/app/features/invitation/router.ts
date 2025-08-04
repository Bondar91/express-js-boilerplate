import express from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus';
import { cancelInvitationAction, cancelInvitationActionValidation } from './actions/cancel-invitation.action';
import { resendInvitationAction, resendInvitationActionValidation } from './actions/resend-invitation.action';

interface IInvitationRouting {
  commandBus: CommandBus;
}

export const createInvitationRouting = ({ commandBus }: IInvitationRouting) => {
  const router = express.Router({ mergeParams: true });

  router.post('/cancel', [cancelInvitationActionValidation], cancelInvitationAction(commandBus));

  router.post('/resend', [resendInvitationActionValidation], resendInvitationAction(commandBus));

  return router;
};
