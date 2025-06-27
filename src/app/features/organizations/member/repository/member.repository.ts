import type { TPrismaClientOrTransaction } from '@/config/db';
import { prisma } from '@/config/db';
import type {
  ICreateMemberPayload,
  ICreateMemberRolePayload,
  ICreateOrganizationMemeberPayload,
  IUpdateMemberPayload,
  TAddMemberRole,
  TMemberRaw,
  TMemberUpdateData,
} from '../models/member.model';
import type { Prisma } from '@prisma/client';
import { MembershipStatus } from '@prisma/client';

import type { IPaginationParamsDto } from '@/shared/pagination-utils/pagination-utils';
import { calculateSkip, createOrderBy, createWhereInput } from '@/shared/pagination-utils/pagination-utils';
import { memberPaginationOptions } from '../../config/pagination.config';
import { NotFoundError } from '@/errors/not-found.error';
import { hasSuperAdminRole } from '@/shared/role-utils/role-utils';
import { createUser, findUserByEmail, updateUser } from '@/app/features/user/repository/user.repository';
import { findOrganizationByPublicId } from '../../organization/repository/organization.repository';
import { findRoleByPublicId, findRolesByPublicIds } from '@/app/features/system-role/repository/system-role.repository';
import type { TSystemRole } from '@/app/features/system-role/models/system-role.model';
import { ConflictError } from '@/errors/conflict.error';
import type { TCurrentUserRow } from '@/app/features/user/models/user.models';

const selectMemberWithRealations = {
  id: true,
  public_id: true,
  updatedAt: true,
  userId: true,
  organizationId: true,
  status: true,
  statusChangedAt: true,
  statusChangedBy: true,
  isSuperAdmin: true,
  guardian: true,
  fee: true,
  joinedAt: true,
  user: {
    select: {
      public_id: true,
      name: true,
      surname: true,
      email: true,
    },
  },
  roles: {
    select: {
      role: {
        select: {
          name: true,
          public_id: true,
        },
      },
    },
  },
  teamMemberships: {
    include: {
      team: {
        select: {
          name: true,
          public_id: true,
          fee: true,
        },
      },
    },
  },
  organization: {
    select: {
      fee: true,
    },
  },
} as const;

export const createMember = async (data: ICreateMemberPayload) => {
  return prisma.$transaction(async tx => {
    let user = await findUserByEmail(data.email, tx);

    if (user) {
      throw new ConflictError('Member with this email already exists');
    }

    user = await createUser(
      {
        name: data.name,
        surname: data.surname,
        email: data.email,
      },
      tx,
    );

    const organization = await findOrganizationByPublicId(data.organizationId, tx);

    const member = await createOrganizationMember(
      {
        userId: user.id,
        organizationId: organization.id,
        status: data.status,
        addedBy: data.addedBy,
        guardian: data.guardian,
      },
      tx,
    );

    const role = await findRoleByPublicId(data.roleId, tx);

    await createMemberRole(
      {
        memberId: member.id,
        roleId: role.id,
        addedBy: data.addedBy,
      },
      tx,
    );

    return member;
  });
};

export const createOrganizationMember = async (
  data: ICreateOrganizationMemeberPayload,
  client: TPrismaClientOrTransaction = prisma,
) => {
  return await client.organizationMember.create({
    data: {
      userId: data.userId,
      organizationId: data.organizationId,
      status: data.status || MembershipStatus.PENDING,
      statusChangedAt: new Date(),
      statusChangedBy: data.addedBy ? parseInt(data.addedBy) : null,
      isSuperAdmin: false,
      guardian: data.guardian || false,
    },
  });
};

export const createOrganizationMembers = async (
  data: ICreateOrganizationMemeberPayload[],
  client: TPrismaClientOrTransaction = prisma,
) => {
  return await client.organizationMember.createMany({
    data,
    skipDuplicates: true,
  });
};

export const createMemberRole = async (data: ICreateMemberRolePayload, client: TPrismaClientOrTransaction = prisma) => {
  return await client.memberRole.create({
    data: {
      memberId: data.memberId,
      roleId: data.roleId,
      assignedBy: data.addedBy ? parseInt(data.addedBy) : null,
    },
  });
};

export const updateMember = async (data: IUpdateMemberPayload) => {
  return prisma.$transaction(async tx => {
    const member = await findMemberByPublicId(data.organizationId, data.memberId);

    if (data.name || data.surname || data.email) {
      await updateUser(
        member.user.public_id,
        {
          name: data.name,
          surname: data.surname,
          email: data.email,
        },
        tx,
      );
    }

    const memberUpdateData: TMemberUpdateData = {};

    if (data.status) {
      memberUpdateData.status = data.status;
      memberUpdateData.statusChangedAt = new Date();
      memberUpdateData.statusChangedBy = data.updatedBy ? parseInt(data.updatedBy) : null;
    }

    const memberUpdateDataNew = updateMemberDataBasedOnRoles(memberUpdateData, data.roles.add);

    if (Object.keys(memberUpdateData).length > 0) {
      await tx.organizationMember.update({
        where: { id: member.id },
        data: memberUpdateDataNew,
      });
    }

    if (data.roles) {
      const existingRoles = await findRolesByMemberId(member.id, tx);

      if (data.roles.add && data.roles.add.length > 0) {
        const newRoles = await findRolesByPublicIds(data.roles.add, tx);

        if (newRoles.length !== data.roles.add.length) {
          throw new NotFoundError('One or more roles to add not found');
        }

        const existingRoleIds = existingRoles.map(memberRole => memberRole.roleId);
        const rolesToAdd = newRoles.filter(role => !existingRoleIds.includes(role.id));

        for (const role of rolesToAdd) {
          await createMemberRole(
            {
              memberId: member.id,
              roleId: role.id,
              addedBy: data.updatedBy,
            },
            tx,
          );
        }
      }

      if (data.roles.remove && data.roles.remove.length > 0) {
        const rolesToRemove = await findRolesByPublicIds(data.roles.remove);

        if (rolesToRemove.length !== data.roles.remove.length) {
          throw new NotFoundError('One or more roles to remove not found');
        }

        const roleIdsToRemove = rolesToRemove.map(role => role.id);
        const rolesToDelete = existingRoles.filter(memberRole => roleIdsToRemove.includes(memberRole.roleId));

        if (rolesToDelete.length > 0) {
          const extractedRolesToDelete = rolesToDelete.map(({ role }) => role);
          await deleteMemberRoles(extractedRolesToDelete, tx);
        }
      }
    }

    return member;
  });
};

const updateMemberDataBasedOnRoles = <T extends { isSuperAdmin?: boolean }>(
  memberUpdateData: T,
  roles: string[],
): T => {
  if (roles && roles.length > 0) {
    memberUpdateData.isSuperAdmin = hasSuperAdminRole(roles);
  }

  return memberUpdateData;
};

export const findMemberByOrganizationAndUser = async (
  organizationId: number,
  userId: number,
  client: TPrismaClientOrTransaction = prisma,
) => {
  return client.organizationMember.findFirst({
    where: { organizationId, userId },
  });
};

export const findMembersByOrganizationAndUserIds = async (
  organizationId: number,
  users: TCurrentUserRow[],
  client: TPrismaClientOrTransaction = prisma,
) => {
  return client.organizationMember.findMany({
    where: { organizationId, userId: { in: users.map(user => user.id) } },
    select: { userId: true },
  });
};

export const deleteOrganizationMembers = async (organizationId: number, users: TCurrentUserRow[]) => {
  return await prisma.organizationMember.deleteMany({
    where: {
      organizationId,
      userId: { in: users.map(u => u.id) },
    },
  });
};

export const deleteMemberRoles = async (rolesToDelete: TSystemRole[], client: TPrismaClientOrTransaction = prisma) => {
  return await client.memberRole.deleteMany({
    where: {
      roleId: { in: rolesToDelete.map(role => role.id) },
    },
  });
};

export const addMemberRoles = async (data: TAddMemberRole, client: TPrismaClientOrTransaction = prisma) => {
  return await client.memberRole.create({
    data: {
      memberId: data.memberId,
      roleId: data.roleId,
      assignedBy: data.assignedBy ?? null,
    },
  });
};

export const findRolesByMemberId = async (memberId: number, client: TPrismaClientOrTransaction = prisma) => {
  return await client.memberRole.findMany({
    where: { memberId },
    include: { role: true },
  });
};

export const listMember = async (params: IPaginationParamsDto): Promise<[TMemberRaw[], number]> => {
  let where = createWhereInput(params.filter, undefined, []);
  where = applyRolesFilter(where, params.filter);
  where = applyUserSearch(where, params.search, memberPaginationOptions.searchFields);

  let organization;
  if (params.organizationId) {
    organization = await findOrganizationByPublicId(params.organizationId);
    where.organizationId = organization.id;
  }

  const orderBy = createOrderBy(params.sort);
  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : memberPaginationOptions.defaultLimit;

  const [members, total] = await Promise.all([
    prisma.organizationMember.findMany({
      where,
      orderBy,
      skip: calculateSkip(page, limit),
      take: limit,
      select: selectMemberWithRealations,
    }),
    prisma.organizationMember.count({ where }),
  ]);

  return [members, total];
};

const applyRolesFilter = (
  where: Record<string, unknown>,
  filter?: IPaginationParamsDto['filter'],
): Record<string, unknown> => {
  const updatedWhere = { ...where };

  if (filter && filter.roles) {
    updatedWhere.roles = {
      some: {
        role: {
          public_id: Array.isArray(filter.roles) ? { in: filter.roles } : filter.roles,
        },
      },
    };
  }

  return updatedWhere;
};

const applyUserSearch = (
  where: Record<string, unknown>,
  search?: string,
  searchFields?: string[],
): Record<string, unknown> => {
  if (!search || !searchFields || searchFields.length === 0) {
    return where;
  }

  const OR = searchFields.map(field => {
    if (field.includes('.')) {
      const parts = field.split('.');

      let condition: Prisma.StringFilter = {
        contains: search,
        mode: 'insensitive',
      };

      for (let i = parts.length - 1; i >= 0; i--) {
        condition = { [parts[i]]: condition };
      }

      return condition;
    }

    return {
      [field]: {
        contains: search,
        mode: 'insensitive',
      },
    };
  });

  return {
    ...where,
    OR,
  };
};

export const findMemberByPublicId = async (
  organizationId: string,
  memberId: string,
  client: TPrismaClientOrTransaction = prisma,
) => {
  const organization = await findOrganizationByPublicId(organizationId);

  const member = await client.organizationMember.findUnique({
    where: { organizationId: organization.id, public_id: memberId },
    select: selectMemberWithRealations,
  });

  if (!member) {
    throw new NotFoundError('Member not found');
  }

  return member;
};

export const findOrganizationMembers = async (memberPublicIds: string[], client: TPrismaClientOrTransaction) => {
  return await client.organizationMember.findMany({
    where: {
      public_id: { in: memberPublicIds },
    },
  });
};
