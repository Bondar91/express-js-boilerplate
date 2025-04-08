import type { User as DbUser } from '@prisma/client';

export type TUser = DbUser;
export type TUserWithoutPassword = Omit<TUser, 'password' | 'refreshToken'>;

export interface ICreateUserPayload {
  name: string;
  surname: string;
  email: string;
  password?: string;
}

export interface IUpdateUserPayload extends ICreateUserPayload {}

export interface IGetUsersParams {}
