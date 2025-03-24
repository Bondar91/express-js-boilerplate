import type { OrganizationMember as DbMember } from '@prisma/client';

export type TMember = DbMember;

export interface ICreateMemberPayload {
  organizationId: string;
  name: string;
  surname: string;
  email: string;
  roleId: string;
  status: 'PENDING';
  addedBy?: string | null;
}

export type TMemberResponse = Pick<TMember, 'public_id' | 'status'> & {
  name: string;
  surname: string;
  email: string;
  roles: string[];
};
