import { prisma } from '@/config/db';
import type { ICreateTeamPayload } from '../models/team.model';
import { findOrganizationByPublicId } from '../../organization/repository/organization.repository';

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
