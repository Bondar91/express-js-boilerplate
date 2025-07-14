import type { User as DbUser } from '@prisma/client';

export type TUser = DbUser;
export type TUserWithoutPassword = Omit<TUser, 'password' | 'refreshToken'>;

export interface ICreateUserPayload {
  name?: string;
  surname?: string;
  email?: string;
  password?: string;
}

export interface IUpdateUserPayload extends ICreateUserPayload {}

export interface IGetUsersParams {}

export interface IGetCurrentUserParams {
  accessToken: string;
}

export type TCurrentUserRow = {
  id: number;
  public_id: string;
  name: string | null;
  surname: string | null;
  email: string;
  OrganizationMember?: TOrganizationMember[];
};

export type TOrganizationMember = {
  organization: {
    public_id: string;
    name: string;
  };
};

export type TCurrentUser = {
  id: string;
  name: string | null;
  surname: string | null;
  email: string;
};
