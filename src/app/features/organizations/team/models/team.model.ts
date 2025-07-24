import type { MembershipStatus, Team } from '@prisma/client';

export type TTeam = Team;

export interface ICreateTeamPayload {
  organizationId: string;
  name: string;
  description?: string;
}

export type TMemberUserData = {
  public_id: string;
  name: string | null;
  surname: string | null;
  email: string;
};

export type TTeamRaw = TTeam & {
  members: {
    public_id: string;
    role: string | null;
    member: {
      public_id: string;
      status: MembershipStatus;
      fee: number | null;
      user: TMemberUserData;
      roles: {
        role: {
          public_id: string;
          name: string;
        };
      }[];
    };
  }[];
};

export type TTeamQueryResult = {
  id: string;
  name: string;
  membersNumber: number;
  fee: string | null;
  staff: Omit<TMemberUserData, 'public_id'>[];
};

export type TStaffMember = {
  id: string;
  name: string | null;
  surname: string | null;
  email: string;
  roleId: string | null;
};

export type TTeamMemberDetails = {
  id: string;
  name: string | null;
  surname: string | null;
  email: string;
  status: string;
  roles: string[];
  fee: string | null;
};

export type TTeamDetailsResult = {
  id: string;
  name: string;
  fee: string | null;
  staff: TStaffMember[];
  members: TTeamMemberDetails[];
};

export interface IGetTeamParam {
  organizationId: string;
  teamId: string;
}

export interface IEditTeamPayload {
  organizationId: string;
  teamId: string;
  name?: string;
  fee?: number;
  memberIds?: string[];
  staffIds?: string[];
}

export interface IAssignTeamMemberPayload {
  organizationId: string;
  teamId: string;
  members: {
    add: string[];
    remove: string[];
  };
}
