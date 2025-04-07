import type { TPrismaClientOrTransaction } from '@/config/db';
import { prisma } from '@/config/db';
import type {
  ICreateOrganizationPayload,
  IEditOrganizationPayload,
  TOrganizationRaw,
} from '../models/organization.models';
import { BadRequestError } from '@/errors/bad-request.error';
import type { Prisma } from '@prisma/client';
import { NotFoundError } from '@/errors/not-found.error';
import type { IPaginationParamsDto } from '@/shared/pagination-utils/pagination-utils';
import { createWhereInput, createOrderBy, calculateSkip } from '@/shared/pagination-utils/pagination-utils';
import { organizationPaginationOptions } from '../config/pagination.config';
import { findUserByPublicId } from '@/app/features/user/repository/user.repository';
import {
  createOrganizationMember,
  deleteOrganizationMembers,
  findMemberByOrganizationAndUser,
} from '../../member/repository/member.repository';

const selectOrganizationWithMember = {
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
  await findUserByPublicId(data.memberId);

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
    },
  });

  return organization;
};

export const slugExists = async (slug: string) => {
  const count = await prisma.organization.count({
    where: { slug },
  });

  return count > 0;
};

export const updateOrganization = async (data: IEditOrganizationPayload) => {
  const organization = await findOrganizationByPublicId(data.publicId);

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

const addOrganizationMembers = async (organizationId: number, memberIds: string[]) => {
  await Promise.all(
    memberIds.map(async publicId => {
      const user = await findUserByPublicId(publicId);

      const existingMember = await findMemberByOrganizationAndUser(organizationId, user.id);

      if (!existingMember) {
        await createOrganizationMember({
          userId: user.id,
          organizationId,
          status: 'ACTIVE',
        });
      }
    }),
  );
};

const removeOrganizationMembers = async (organizationId: number, memberIds: string[]) => {
  await Promise.all(
    memberIds.map(async publicId => {
      const user = await findUserByPublicId(publicId);

      await deleteOrganizationMembers(organizationId, user.id);
    }),
  );
};

export const listOrganizations = async (params: IPaginationParamsDto): Promise<[TOrganizationRaw[], number]> => {
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
      include: selectOrganizationWithMember,
    }),
    prisma.organization.count({ where }),
  ]);

  return [organizations, total];
};

export const findOrganizationByPublicId = async (publicId: string, client: TPrismaClientOrTransaction = prisma) => {
  const organization = await client.organization.findUnique({
    where: { public_id: publicId },
    include: selectOrganizationWithMember,
  });

  if (!organization) {
    throw new NotFoundError('Organization not found');
  }

  return organization;
};

export const findOrganizationById = async (id: number, client: TPrismaClientOrTransaction = prisma) => {
  const organization = await client.organization.findUnique({
    where: { id },
    include: selectOrganizationWithMember,
  });

  if (!organization) {
    throw new NotFoundError('Organization not found');
  }

  return organization;
};
