import { prisma } from '@/config/db';
import type {
  ICreateOrganizationPayload,
  IEditOrganizationPayload,
  TOrganizationResponse,
  TOrganizationWithOwners,
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
  OrganizationOwner: {
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
      OrganizationOwner: {
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

const addOrganizationOwners = async (organizationId: number, ownerPublicIds: string[]) => {
  await Promise.all(
    ownerPublicIds.map(async publicId => {
      const user = await prisma.user.findUnique({
        where: { public_id: publicId },
        include: {
          OrganizationOwner: {
            where: { organizationId },
          },
        },
      });

      if (!user) {
        throw new BadRequestError(`User not found`);
      }

      if (user.OrganizationOwner.length > 0) {
        throw new BadRequestError(`User is already a owner of this organization`);
      }

      await prisma.organizationOwner.create({
        data: {
          organizationId,
          userId: user.id,
        },
      });
    }),
  );
};

const removeOrganizationOwners = async (organizationId: number, ownerPublicIds: string[]) => {
  await Promise.all(
    ownerPublicIds.map(async publicId => {
      const user = await prisma.user.findUnique({
        where: { public_id: publicId },
        include: {
          OrganizationOwner: {
            where: { organizationId },
          },
        },
      });

      if (!user) {
        throw new BadRequestError(`User not found`);
      }

      if (user.OrganizationOwner.length === 0) {
        throw new BadRequestError(`User is not a owner of this organization`);
      }

      await prisma.organizationOwner.delete({
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
      OrganizationOwner: true,
    },
  });

  if (!organization) {
    throw new NotFoundError('Organization not found');
  }

  const { publicId, owners, ...updateData } = data;

  if (updateData.slug && updateData.slug !== organization.slug) {
    if (await slugExists(updateData.slug)) {
      throw new BadRequestError('This slug already exists');
    }
  }

  const organizationUpdate = await prisma.organization.update({
    where: { public_id: data.publicId },
    data: updateData,
  });

  if (owners) {
    if (owners.add) {
      await addOrganizationOwners(organization.id, owners.add);
    }
    if (owners.remove) {
      await removeOrganizationOwners(organization.id, owners.remove);
    }
  }

  return organizationUpdate;
};

const transformOrganizationResponse = (organization: TOrganizationWithOwners): TOrganizationResponse => {
  const { OrganizationOwner, ...rest } = organization;
  return {
    ...rest,
    owners: OrganizationOwner.map(owner => ({
      ...owner.user,
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
