import { prisma } from '@/config/db';
import type { ICreateUserPayload } from '../models/user.models';

export const createUser = async (data: ICreateUserPayload) => {
  const user = await prisma.user.create({ data });
  return user;
};

export const getAllUsers = async () => {
  return prisma.user.findMany();
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const findUsersByIds = async (ids: number[]) => {
  return prisma.user.findMany({
    where: {
      id: { in: ids },
    },
  });
};
