import { prisma } from '@/config/db';
import type { ICreateOrganizationPayload, IEditOrganizationPayload } from '../models/organization.models';
import { BadRequestError } from '@/errors/bad-request.error';
import type { Prisma } from '@prisma/client';
import { NotFoundError } from '@/errors/not-found.error';

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

const addOrganizationMembers = async (organizationId: number, memberPublicIds: string[]) => {
  await Promise.all(
    memberPublicIds.map(async (publicId) => {
      const user = await prisma.user.findUnique({
        where: { public_id: publicId },
        include: {
          OrganizationMember: {
            where: { organizationId },
          },
        },
      });

      if (!user) {
        throw new BadRequestError(`User not found`);
      }

      if (user.OrganizationMember.length > 0) {
        throw new BadRequestError(`User is already a member of this organization`);
      }

      await prisma.organizationMember.create({
        data: {
          organizationId,
          userId: user.id,
        },
      });
    }),
  );
};

const removeOrganizationMembers = async (organizationId: number, memberPublicIds: string[]) => {
  await Promise.all(
    memberPublicIds.map(async (publicId) => {
      const user = await prisma.user.findUnique({
        where: { public_id: publicId },
        include: {
          OrganizationMember: {
            where: { organizationId },
          },
        },
      });

      if (!user) {
        throw new BadRequestError(`User not found`);
      }

      if (user.OrganizationMember.length === 0) {
        throw new BadRequestError(`User is not a member of this organization`);
      }

      await prisma.organizationMember.delete({
        where: {
          organizationId_userId: {
            organizationId,
            userId: user.id,
          },
        },
      });
    }),
  );
};

export const updateOrganization = async (data: IEditOrganizationPayload) => {
  const organization = await prisma.organization.findUnique({
    where: { public_id: data.publicId },
    include: {
      OrganizationMember: true,
    },
  });

  if (!organization) {
    throw new NotFoundError('Organization not found');
  }

  const { publicId, members, ...updateData } = data;

  if (updateData.slug && updateData.slug !== organization.slug) {
    if (await slugExists(updateData.slug)) {
      throw new BadRequestError('This slug already exists');
    }
  }

  const organizationUpdate = await prisma.organization.update({
    where: { public_id: data.publicId },
    data: updateData,
  });

  if (members) {
    if (members.add) {
      await addOrganizationMembers(organization.id, members.add);
    }
    if (members.remove) {
      await removeOrganizationMembers(organization.id, members.remove);
    }
  }

  return organizationUpdate;
};
