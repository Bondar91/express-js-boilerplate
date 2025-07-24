import type { TPrismaClientOrTransaction } from '@/config/db';
import { prisma } from '@/config/db';
import type { IAssignTeamMemberPayload, ICreateTeamPayload, IEditTeamPayload, TTeamRaw } from '../models/team.model';
import { findOrganizationByPublicId } from '../../organization/repository/organization.repository';
import {
  calculateSkip,
  createOrderBy,
  createWhereInput,
  type IPaginationParamsDto,
} from '@/shared/pagination-utils/pagination-utils';
import { teamPaginationOptions } from '../config/pagination.config';
import { NotFoundError } from '@/errors/not-found.error';
import { findOrganizationMembers } from '../../member/repository/member.repository';
import type { OrganizationMember } from '@prisma/client';

const selectTeamWithMember = {
  id: true,
  public_id: true,
  name: true,
  description: true,
  organizationId: true,
  fee: true,
  createdAt: true,
  updatedAt: true,
  members: {
    select: {
      public_id: true,
      role: true,
      member: {
        select: {
          id: true,
          public_id: true,
          status: true,
          fee: true,
          user: {
            select: {
              public_id: true,
              name: true,
              surname: true,
              email: true,
            },
          },
          roles: {
            include: {
              role: {
                select: {
                  public_id: true,
                  name: true,
                },
              },
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

  let organization;
  if (params.organizationId) {
    organization = await findOrganizationByPublicId(params.organizationId);
    where.organizationId = organization.id;
  }

  const orderBy = createOrderBy(params.sort);

  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : teamPaginationOptions.defaultLimit;

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      orderBy,
      skip: calculateSkip(page, limit),
      take: limit,
      select: selectTeamWithMember,
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
    select: selectTeamWithMember,
  });

  if (!team) {
    throw new NotFoundError('Team not found');
  }

  return team;
};

export const updateTeam = async (data: IEditTeamPayload) => {
  const { organizationId, teamId, name, fee, memberIds, staffIds } = data;
  const team = await findTeamByPublicId(organizationId, teamId);

  await prisma.$transaction(async tx => {
    const scalarUpdates: Record<string, unknown> = {};
    if (name !== undefined) {
      scalarUpdates.name = name;
    }
    if (fee !== undefined) {
      scalarUpdates.fee = fee;
    }

    if (Object.keys(scalarUpdates).length) {
      await tx.team.update({ where: { id: team.id }, data: scalarUpdates });
    }

    if (memberIds !== undefined) {
      const currentMembers = team.members.filter(m => {
        const roles = m.member.roles.map(r => r.role.name);
        return roles.includes('player');
      });

      if (Array.isArray(memberIds) && memberIds.length === 0) {
        const currentMemberIds = currentMembers.map(m => m.member.id);

        if (currentMemberIds.length > 0) {
          await tx.teamMember.deleteMany({
            where: {
              teamId: team.id,
              memberId: { in: currentMemberIds },
            },
          });
        }
      } else {
        const currentMemberIds = currentMembers.map(m => m.member.public_id);

        const toRemove = currentMemberIds.filter(id => !memberIds.includes(id));
        const toAdd = memberIds.filter(id => !currentMemberIds.includes(id));

        const membersInDb = await tx.organizationMember.findMany({
          where: { public_id: { in: [...toRemove, ...toAdd] } },
        });

        const publicIdToId = new Map(membersInDb.map(m => [m.public_id, m.id]));

        if (toRemove.length) {
          await tx.teamMember.deleteMany({
            where: {
              teamId: team.id,
              memberId: { in: toRemove.map(id => publicIdToId.get(id)).filter((id): id is number => id !== undefined) },
            },
          });
        }
        for (const idToAdd of toAdd) {
          const memberIdToAdd = publicIdToId.get(idToAdd);
          if (memberIdToAdd) {
            await tx.teamMember.create({
              data: {
                teamId: team.id,
                memberId: memberIdToAdd,
              },
            });
          }
        }
      }
    }

    if (staffIds !== undefined) {
      const currentStaff = team.members.filter(m => {
        const roles = m.member.roles.map(r => r.role.name);
        return roles.includes('leader');
      });

      if (Array.isArray(staffIds) && staffIds.length === 0) {
        const currentStaffIds = currentStaff.map(m => m.member.id);

        if (currentStaffIds.length > 0) {
          await tx.teamMember.deleteMany({
            where: {
              teamId: team.id,
              memberId: { in: currentStaffIds },
            },
          });
        }
      } else {
        const currentStaffPublicIds = currentStaff.map(m => m.member.public_id);

        const toRemoveStaff = currentStaffPublicIds.filter(id => !staffIds.includes(id));
        const toAddStaff = staffIds.filter(id => !currentStaffPublicIds.includes(id));

        // Zamiana na id bazy
        const staffInDb = await tx.organizationMember.findMany({
          where: { public_id: { in: [...toRemoveStaff, ...toAddStaff] } },
        });
        const publicIdToId = new Map(staffInDb.map(m => [m.public_id, m.id]));

        if (toRemoveStaff.length) {
          await tx.teamMember.deleteMany({
            where: {
              teamId: team.id,
              memberId: {
                in: toRemoveStaff.map(id => publicIdToId.get(id)).filter((id): id is number => id !== undefined),
              },
            },
          });
        }

        for (const idToAdd of toAddStaff) {
          const memberIdToAdd = publicIdToId.get(idToAdd);
          if (memberIdToAdd) {
            await tx.teamMember.create({
              data: {
                teamId: team.id,
                memberId: memberIdToAdd,
              },
            });
          }
        }
      }
    }
  });
};

export const assignTeamMember = async (data: IAssignTeamMemberPayload) => {
  const { organizationId, teamId, members } = data;
  const team = await findTeamByPublicId(organizationId, teamId);

  return prisma.$transaction(async tx => {
    if (members.remove.length > 0) {
      await deleteTeamMembers(team.id, members.remove, tx);
    }

    if (members.add.length > 0) {
      const organizationMembers = await findOrganizationMembers(members.add, tx);
      const existingMemberships = await findTeamMemberByPublicIds(team.id, organizationMembers, tx);

      const existingMemberIds = new Set(existingMemberships.map(m => m.memberId));

      await Promise.all(
        organizationMembers
          .filter(member => !existingMemberIds.has(member.id))
          .map(member =>
            tx.teamMember.create({
              data: {
                teamId: team.id,
                memberId: member.id,
              },
            }),
          ),
      );
    }
  });
};

export const deleteTeamMembers = async (
  teamId: number,
  membersToRemove: string[],
  client: TPrismaClientOrTransaction = prisma,
) => {
  return await client.teamMember.deleteMany({
    where: {
      teamId,
      member: {
        public_id: {
          in: membersToRemove,
        },
      },
    },
  });
};

export const findTeamMemberByPublicIds = async (
  teamId: number,
  organizationMembers: OrganizationMember[],
  client: TPrismaClientOrTransaction = prisma,
) => {
  return await client.teamMember.findMany({
    where: {
      teamId,
      memberId: {
        in: organizationMembers.map(member => member.id),
      },
    },
    select: {
      memberId: true,
    },
  });
};
