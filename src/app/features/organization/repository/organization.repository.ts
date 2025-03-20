import { prisma } from '@/config/db';
import type {
  ICreateOrganizationPayload,
  IEditOrganizationPayload,
  TOrganizationResponse,
  TOrganizationWithMembers,
} from '../models/organization.models';
import { BadRequestError } from '@/errors/bad-request.error';
import type { Prisma } from '@prisma/client';
import { NotFoundError } from '@/errors/not-found.error';
import type { IPaginationParamsDto } from '@/shared/pagination-utils/pagination-utils';
import { createWhereInput, createOrderBy, calculateSkip } from '@/shared/pagination-utils/pagination-utils';
import { organizationPaginationOptions } from '../config/pagination.config';

const organizationSelect = {
  public_id: true,
  name: true,
  slug: true,
  type: true,
  address: true,
  city: true,
  postalCode: true,
  country: true,
  phone: true,
  email: true,
  website: true,
  settings: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  OrganizationMember: {
    select: {
      user: {
        select: {
          public_id: true,
          name: true,
          surname: true,
          email: true,
        },
      },
    },
  },
} as const;

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
    memberPublicIds.map(async publicId => {
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
    memberPublicIds.map(async publicId => {
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

const transformOrganizationResponse = (organization: TOrganizationWithMembers): TOrganizationResponse => {
  const { OrganizationMember, ...rest } = organization;
  return {
    ...rest,
    members: OrganizationMember.map(member => ({
      ...member.user,
    })),
  };
};

export const listOrganizations = async (params: IPaginationParamsDto): Promise<[TOrganizationResponse[], number]> => {
  const where = createWhereInput(params.filter, params.search, organizationPaginationOptions.searchFields);
  const orderBy = createOrderBy(params.sort);

  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : organizationPaginationOptions.defaultLimit;

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      orderBy,
      skip: calculateSkip(page, limit),
      take: limit,
      select: organizationSelect,
    }),
    prisma.organization.count({ where }),
  ]);

  const transformedOrganizations = organizations.map(transformOrganizationResponse);

  return [transformedOrganizations, total];
};

export const findOrganizationByPublicId = async (publicId: string): Promise<TOrganizationResponse> => {
  const organization = await prisma.organization.findUnique({
    where: { public_id: publicId },
    select: organizationSelect,
  });

  if (!organization) {
    throw new NotFoundError('Organization not found');
  }

  return transformOrganizationResponse(organization);
};
