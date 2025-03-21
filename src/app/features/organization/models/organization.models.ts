import type { Organization as DbOrganization } from '@prisma/client';

export type TOrganization = DbOrganization;

export interface ICreateOrganizationPayload {
  name: string;
  slug: string;
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
  ownerPublicId: string;
}

export interface IOrganizationOwners {
  add?: string[];
  remove?: string[];
}

export interface IEditOrganizationPayload extends Omit<ICreateOrganizationPayload, 'ownerPublicId'> {
  publicId: string;
  owners?: IOrganizationOwners;
}

export type TOrganizationWithOwners = {
  OrganizationOwner: {
    user: {
      public_id: string;
      name: string;
      surname: string;
      email: string;
    };
  }[];
} & Omit<TOrganizationResponse, 'owners'>;

export type TOrganizationResponse = Omit<TOrganization, 'id'> & {
  owners: {
    public_id: string;
    name: string;
    surname: string;
    email: string;
  }[];
};

export interface IGetOrgranizationParam {
  publicId: string;
}
