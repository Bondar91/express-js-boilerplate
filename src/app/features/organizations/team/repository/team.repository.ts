import { prisma } from '@/config/db';
import type { ICreateTeamPayload, TTeamRaw } from '../models/team.model';
import { findOrganizationByPublicId } from '../../organization/repository/organization.repository';
import {
  calculateSkip,
  createOrderBy,
  createWhereInput,
  type IPaginationParamsDto,
} from '@/shared/pagination-utils/pagination-utils';
import { teamPaginationOptions } from '../config/pagination.config';
import { NotFoundError } from '@/errors/not-found.error';

const selectTeamWithMember = {
  members: {
    include: {
      member: {
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
      },
    },
  },
} as const;

export const createTeam = async (data: ICreateTeamPayload) => {
  const organization = await findOrganizationByPublicId(data.organizationId);

  return prisma.team.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      organizationId: organization.id,
    },
  });
};

export const listTeam = async (params: IPaginationParamsDto): Promise<[TTeamRaw[], number]> => {
  const where = createWhereInput(params.filter, params.search, teamPaginationOptions.searchFields);
  const orderBy = createOrderBy(params.sort);

  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : teamPaginationOptions.defaultLimit;

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      orderBy,
      skip: calculateSkip(page, limit),
      take: limit,
      include: selectTeamWithMember,
    }),
    prisma.team.count({ where }),
  ]);

  return [teams, total];
};

export const findTeamByPublicId = async (organizationId: string, teamId: string) => {
  const organization = await findOrganizationByPublicId(organizationId);

  const team = await prisma.team.findUnique({
    where: {
      organizationId: organization.id,
      public_id: teamId,
    },
    include: selectTeamWithMember,
  });

  if (!team) {
    throw new NotFoundError('Team not found');
  }

  return team;
};
