import type { Organization as DbOrganization } from '@prisma/client';

export type TOrganization = DbOrganization;

export interface ICreateOrganizationPayload {
  name?: string;
  slug?: string;
  type?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: Record<string, any>;
  active?: boolean;
  memberId: string;
}

export interface IOrganizationMembers {
  add?: string[];
  remove?: string[];
}

export interface IEditOrganizationPayload extends Omit<ICreateOrganizationPayload, 'memberId'> {
  publicId: string;
  members?: IOrganizationMembers;
  fee?: number;
  active?: boolean;
}

export type TMemberUserData = {
  user: {
    public_id: string;
    name: string | null;
    surname: string | null;
    email: string;
  };
};

export type TOrganizationRaw = TOrganization & {
  OrganizationMember: TMemberUserData[];
};

export type TOrganizationQueryResult = Omit<TOrganization, 'id' | 'public_id'> & {
  id: string;
  members: {
    id: string;
    name: string | null;
    surname: string | null;
    email: string;
  }[];
};

export interface IGetOrgranizationParam {
  publicId: string;
}
