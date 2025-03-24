import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';

import { CreateOrganizationCommand } from '../commands/create-organization.command';
import type { TOrganization } from '../models/organization.models';
import { BadRequestError } from '@/errors/bad-request.error';

export const createOrganizationAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, type, address, city, postalCode, country, phone, email, website, settings, active } =
        req.body;

      if (!req.user?.publicId) {
        throw new BadRequestError('User not authenticated');
      }

      const ownerPublicId = req.user?.publicId;

      await commandBus.execute<CreateOrganizationCommand, TOrganization>(
        new CreateOrganizationCommand({
          name,
          slug,
          type,
          address,
          city,
          postalCode,
          country,
          phone,
          email,
          website,
          settings,
          active,
          ownerPublicId,
        }),
      );

      res.status(201).json({ message: 'Organization added correctly' });
    } catch (error) {
      next(error);
    }
  };
};
