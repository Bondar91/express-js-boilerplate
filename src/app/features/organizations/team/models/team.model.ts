import type { Team } from '@prisma/client';

export type TTeam = Team;

export interface ICreateTeamPayload {
  organizationId: string;
  name: string;
  description?: string;
}
