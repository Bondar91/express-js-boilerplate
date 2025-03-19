import { prisma } from '@/config/db';
import type { ICreateOrganizationPayload } from '../models/organization.models';
import { BadRequestError } from '@/errors/bad-request.error';
import type { Prisma } from '@prisma/client';

export const createOrganization = async (data: ICreateOrganizationPayload) => {
  const existingOwner = await prisma.user.findUnique({
    where: { public_id: data.ownerPublicId },
  });

  if (!existingOwner) {
    throw new BadRequestError('Owner with this id not found');
  }

  const organization = await prisma.organization.create({
    data: {
      name: data.name,
      slug: data.slug,
      type: data.type,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,
      phone: data.phone,
      email: data.email,
      website: data.website,
      settings: data.settings ? (data.settings as Prisma.InputJsonValue) : undefined,
      active: data.active,
      OrganizationMember: {
        create: {
          userId: existingOwner.id,
        },
      },
    },
  });

  return organization;
};

export const slugExists = async (slug: string): Promise<boolean> => {
  const count = await prisma.organization.count({
    where: { slug },
  });

  return count > 0;
};
