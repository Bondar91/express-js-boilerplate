import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from '@/lib/cqrs/command-bus/command-bus';

import { LogoutCommand } from '../commands/logout.command';

export const logoutAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user && req.user.publicId) {
        await commandBus.execute<LogoutCommand, void>(
          new LogoutCommand({
            publicId: req.user.publicId,
          }),
        );
      }

      res.cookie('accessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
      });

      res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
      });

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };
};
