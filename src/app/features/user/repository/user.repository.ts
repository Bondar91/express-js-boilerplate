import { prisma } from '@/config/db';
import type { ICreateUserPayload } from '../models/user.models';
import { hashPassword } from '../../auth/helpers/password.helper';
import { BadRequestError } from '@/errors/bad-request.error';

export const createUser = async (data: ICreateUserPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new BadRequestError('User with this email already exists');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      surname: data.surname,
      email: data.email,
      password: hashedPassword,
    },
  });

  const { password, refreshToken, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      public_id: true,
      name: true,
      surname: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
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
