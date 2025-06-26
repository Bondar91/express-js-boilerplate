import express from 'express';
import type { CommandBus } from '@/lib/cqrs/command-bus';
import {
  resendActivationLinkAction,
  resendActivationLinkActionValidation,
} from './actions/resend-activation-link.action';
import { resendActivationLimiter } from './middlewares/rate-limiters';
import { accountActivationAction, accountActivationActionValidation } from './actions/account-activation.action';

interface IActivationRouting {
  commandBus: CommandBus;
}

export const createActivationRouting = ({ commandBus }: IActivationRouting) => {
  const router = express.Router({ mergeParams: true });

  router.post(
    '/resend-link',
    resendActivationLimiter,
    [resendActivationLinkActionValidation],
    resendActivationLinkAction(commandBus),
  );

  router.patch('/account-activate', [accountActivationActionValidation], accountActivationAction(commandBus));

  return router;
};
