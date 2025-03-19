import { celebrate, Joi } from 'celebrate';
import type { NextFunction, Request, Response } from 'express';

import type { CommandBus } from 'src/lib/cqrs/command-bus/command-bus';

import { CreateOrganizationCommand } from '../commands/create-organization.command';
import type { TOrganization } from '../models/organization.models';
import { BadRequestError } from '@/errors/bad-request.error';

export const createOrganizationActionValidation = celebrate(
  {
    body: Joi.object().keys({
      name: Joi.string().required().max(255),
      slug: Joi.string()
        .required()
        .pattern(/^[a-z0-9-]+$/)
        .max(100)
        .optional(),
      type: Joi.string().default('club').valid('club', 'academy', 'school'),
      address: Joi.string().max(255).allow(null, ''),
      city: Joi.string().max(100).allow(null, ''),
      postalCode: Joi.string().max(20).allow(null, ''),
      country: Joi.string().max(2).allow(null, ''),
      phone: Joi.string().max(20).allow(null, ''),
      email: Joi.string().email().max(100).allow(null, ''),
      website: Joi.string().uri().max(255).allow(null, ''),
      settings: Joi.object().allow(null),
      active: Joi.boolean().default(true),
    }),
  },
  { abortEarly: false },
);

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
