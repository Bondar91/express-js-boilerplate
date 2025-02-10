import type { User as DbUser } from '@prisma/client';

export type TUser = DbUser;

export interface ICreateUserPayload {
  name: string;
  surname: string;
}

export interface IGetUsersParams {}
