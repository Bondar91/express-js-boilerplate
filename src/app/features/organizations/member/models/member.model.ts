import type { OrganizationMember as DbMember, MembershipStatus } from '@prisma/client';

export type TMember = DbMember;

export interface ICreateMemberPayload {
  organizationId: string;
  name: string;
  surname: string;
  email: string;
  roleId: string;
  status: MembershipStatus;
  addedBy?: string | null;
}

export interface ICreateOrganizationMemeberPayload {
  userId: number;
  organizationId: number;
  status: MembershipStatus;
  addedBy?: string | null;
}

export interface ICreateMemberRolePayload {
  memberId: number;
  roleId: number;
  addedBy?: string | null;
}

export type TMemberResponse = Pick<TMember, 'public_id' | 'status'> & {
  id: string;
  name: string;
  surname: string;
  email: string;
  roles: string[];
};

export interface IUpdateMemberPayload {
  organizationId: string;
  memberId: string;
  name: string;
  surname: string;
  email: string;
  roles: {
    add: string[];
    remove: string[];
  };
  status?: MembershipStatus;
  updatedBy?: string | null;
}

export type TMemberUpdateData = {
  status?: MembershipStatus;
  statusChangedAt?: Date;
  statusChangedBy?: number | null;
  isSuperAdmin?: boolean;
};

export type TAddMemberRole = {
  memberId: number;
  roleId: number;
  assignedBy: number | null;
};

export type TMemberUserData = {
  public_id: string;
  name: string;
  surname: string;
  email: string;
};

export type TMemberRoleData = {
  role: {
    public_id: string;
    name: string;
  };
};

export type TMemberRaw = TMember & {
  user: TMemberUserData;
  roles: TMemberRoleData[];
};

export type TMemberQueryResult = {
  id: string;
  name: string;
  surname: string;
  email: string;
  status: MembershipStatus;
  roles: string[];
};

export interface IGetMemberParam {
  organizationId: string;
  memberId: string;
}
