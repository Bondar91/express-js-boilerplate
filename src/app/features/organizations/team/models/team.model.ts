import type { Team } from '@prisma/client';

export type TTeam = Team;

export interface ICreateTeamPayload {
  organizationId: string;
  name: string;
  description?: string;
}

export type TMemberUserData = {
  public_id: string;
  name: string;
  surname: string;
  email: string;
};

export type TTeamRaw = TTeam & {
  members: {
    public_id: string;
    role: string | null;
    member: {
      public_id: string;
      user: TMemberUserData;
    };
  }[];
};

export type TTeamQueryResult = {
  id: string;
  name: string;
  description: string | null;
  members: Omit<TMemberUserData, 'public_id'>[];
};

export interface IGetTeamParam {
  organizationId: string;
  teamId: string;
}

export interface IEditTeamPayload extends ICreateTeamPayload {
  teamId: string;
}

export interface IAssignTeamMemberPayload {
  organizationId: string;
  teamId: string;
  members: {
    add: string[];
    remove: string[];
  };
}
