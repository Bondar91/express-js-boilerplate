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

export interface IOrganizationMembers {
  add?: string[];
  remove?: string[];
}

export interface IEditOrganizationPayload extends Omit<ICreateOrganizationPayload, 'ownerPublicId'> {
  publicId: string;
  members?: IOrganizationMembers;
}

export interface IGetUsersParams {}
