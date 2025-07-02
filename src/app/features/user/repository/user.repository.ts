import type { TPrismaClientOrTransaction } from '@/config/db';
import { prisma } from '@/config/db';
import type { ICreateUserPayload, IUpdateUserPayload } from '../models/user.models';
import { hashPassword } from '../../auth/helpers/password.helper';
import { ConflictError } from '@/errors/conflict.error';
import { deleteManyPasswordResetByUserId } from '../../auth/repository/auth.repository';

const selectUser = {
  id: true,
  public_id: true,
  name: true,
  surname: true,
  email: true,
} as const;

export const createUser = async (data: ICreateUserPayload, client: TPrismaClientOrTransaction = prisma) => {
  const existingUser = await findUserByEmail(data.email!);

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const hashedPassword = data.password ? await hashPassword(data.password) : null;

  const user = await client.user.create({
    data: {
      name: data.name!,
      surname: data.surname!,
      email: data.email!,
      password: hashedPassword,
    },
  });

  const { password, refreshToken, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUser = async (
  publicId: string,
  data: IUpdateUserPayload,
  client: TPrismaClientOrTransaction = prisma,
) => {
  return await client.user.update({
    where: { public_id: publicId },
    data,
  });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany();
};

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const findUserByEmail = async (email: string, client: TPrismaClientOrTransaction = prisma) => {
  const user = await client.user.findUnique({
    where: { email },
    select: selectUser,
  });

  return user;
};

export const findUserByPublicId = async (publicId: string, client: TPrismaClientOrTransaction = prisma) => {
  const user = await client.user.findUnique({
    where: { public_id: publicId },
    select: {
      ...selectUser,
      passwordReset: {
        select: {
          token: true,
          expiresAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      ActivationToken: {
        select: {
          id: true,
          token: true,
          expiresAt: true,
          used: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return user;
};

export const findUsersByIds = async (ids: number[]) => {
  return await prisma.user.findMany({
    where: {
      id: { in: ids },
    },
    select: selectUser,
  });
};

export const findUsersByPublicIds = async (publicIds: string[]) => {
  return await prisma.user.findMany({
    where: {
      public_id: { in: publicIds },
    },
    select: selectUser,
  });
};

export const updatePasswordById = async (userId: number, hashedPassword: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

export const resetUserPassword = async (userId: number, hashedPassword: string) => {
  return await prisma.$transaction(async () => {
    await updatePasswordById(userId, hashedPassword);
    await deleteManyPasswordResetByUserId(userId);
  });
};
