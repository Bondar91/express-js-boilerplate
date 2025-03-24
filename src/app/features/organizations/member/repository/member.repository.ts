import { prisma } from '@/config/db';
import type { ICreateMemberPayload, TMemberResponse } from '../models/member.model';
import type { Prisma } from '@prisma/client';
import { MembershipStatus } from '@prisma/client';
import { BadRequestError } from '@/errors/bad-request.error';
import type { IPaginationParamsDto } from '@/shared/pagination-utils/pagination-utils';
import { calculateSkip, createOrderBy, createWhereInput } from '@/shared/pagination-utils/pagination-utils';
import { memberPaginationOptions } from '../../config/pagination.config';

export const createMember = async (data: ICreateMemberPayload) => {
  return prisma.$transaction(async tx => {
    let user = await tx.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      user = await tx.user.create({
        data: {
          name: data.name,
          surname: data.surname,
          email: data.email,
        },
      });
    }

    const organization = await tx.organization.findUnique({
      where: { public_id: data.organizationId },
    });

    if (!organization) {
      throw new BadRequestError('Organization not found');
    }

    const member = await tx.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        status: data.status || MembershipStatus.PENDING,
        statusChangedAt: new Date(),
        statusChangedBy: data.addedBy ? parseInt(data.addedBy) : null,
        isSuperAdmin: false,
      },
      include: {
        user: {
          select: {
            public_id: true,
            name: true,
            surname: true,
            email: true,
          },
        },
      },
    });

    const role = await tx.systemRole.findUnique({
      where: { public_id: data.roleId },
    });

    if (!role) {
      throw new BadRequestError('Role not found');
    }

    await tx.memberRole.create({
      data: {
        memberId: member.id,
        roleId: role.id,
        assignedBy: data.addedBy ? parseInt(data.addedBy) : null,
      },
    });

    return member;
  });
};

export const listMember = async (params: IPaginationParamsDto): Promise<[TMemberResponse[], number]> => {
  let where = createWhereInput(params.filter, undefined, []);
  where = applyRolesFilter(where, params.filter);
  where = applyUserSearch(where, params.search, memberPaginationOptions.searchFields);
  const orderBy = createOrderBy(params.sort);
  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : memberPaginationOptions.defaultLimit;

  const [members, total] = await Promise.all([
    prisma.organizationMember.findMany({
      where,
      orderBy,
      skip: calculateSkip(page, limit),
      take: limit,
      select: {
        public_id: true,
        status: true,
        user: {
          select: {
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
      },
    }),
    prisma.organizationMember.count({ where }),
  ]);

  const formattedMembers = members.map(member => ({
    public_id: member.public_id,
    name: member.user.name,
    surname: member.user.surname,
    email: member.user.email,
    status: member.status,
    roles: member.roles.map(role => role.role.name),
  }));

  return [formattedMembers, total];
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
