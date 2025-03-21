import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';

import { EditOrganizationCommand } from '../commands/edit-organization.command';
import type { TOrganization } from '../models/organization.models';
import { BadRequestError } from '@/errors/bad-request.error';

export const editOrganizationAction = (commandBus: CommandBus) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params;
      const { name, slug, type, address, city, postalCode, country, phone, email, website, settings, active, owners } =
        req.body;

      if (!req.user?.publicId) {
        throw new BadRequestError('User not authenticated');
      }

      await commandBus.execute<EditOrganizationCommand, TOrganization>(
        new EditOrganizationCommand({
          publicId,
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
          owners,
        }),
      );

      res.status(200).json({ message: 'Organization updated correctly' });
    } catch (error) {
      next(error);
    }
  };
};
