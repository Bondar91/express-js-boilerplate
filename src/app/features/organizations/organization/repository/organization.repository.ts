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
import { findUserByPublicId, findUsersByPublicIds } from '@/app/features/user/repository/user.repository';
import {
  createOrganizationMembers,
  deleteOrganizationMembers,
  findMembersByOrganizationAndUserIds,
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
      name: data.name!,
      slug: data.slug!,
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
  const users = await findUsersByPublicIds(memberIds);

  const foundIds = new Set(users.map(user => user.public_id));
  const missingIds = memberIds.filter(id => !foundIds.has(id));

  if (missingIds.length > 0) {
    throw new Error('Users id not found!');
  }

  const existingMembers = await findMembersByOrganizationAndUserIds(organizationId, users);
  const existingUserIds = new Set(existingMembers.map(m => m.userId));

  const membersToCreate = users
    .filter(user => !existingUserIds.has(user.id))
    .map(user => ({
      userId: user.id,
      organizationId,
      status: 'ACTIVE' as const,
    }));

  if (membersToCreate.length > 0) {
    await createOrganizationMembers(membersToCreate);
  }
};

const removeOrganizationMembers = async (organizationId: number, memberIds: string[]) => {
  const users = await findUsersByPublicIds(memberIds);

  const foundIds = new Set(users.map(u => u.public_id));
  const missingIds = memberIds.filter(id => !foundIds.has(id));

  if (missingIds.length > 0) {
    throw new Error('Users id not found!');
  }

  await deleteOrganizationMembers(organizationId, users);
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

export const getOrganizationStatistics = async (organizationId: string) => {
  const organization = await findOrganizationByPublicId(organizationId);

  const [membersCount, teamsCount, invitationsSent] = await Promise.all([
    // Liczba członków
    prisma.organizationMember.count({
      where: { organizationId: organization.id },
    }),

    // Liczba zespołów
    prisma.team.count({
      where: { organizationId: organization.id },
    }),

    // ✨ Suma wysłanych zaproszeń
    prisma.activationToken.aggregate({
      where: {
        sentCount: { gt: 0 },
        user: {
          OrganizationMember: {
            some: { organizationId: organization.id },
          },
        },
      },
      _sum: { sentCount: true },
    }),
  ]);

  return {
    membersCount,
    teamsCount,
    invitationsSent: invitationsSent._sum.sentCount || 0,
    // @todo - inne statystyki
  };
};
