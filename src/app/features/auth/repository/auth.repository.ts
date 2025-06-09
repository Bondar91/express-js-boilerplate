import { prisma } from '@/config/db';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { comparePasswords } from '../helpers/password.helper';
import type { ICreateForgotPasswordPayload } from '../models/auth.model';

export const validateUserCredentials = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await comparePasswords(password, user.password!);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const storeRefreshToken = async (userId: number, refreshToken: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  });
};

export const getUserByRefreshToken = async (refreshToken: string) => {
  const user = await prisma.user.findFirst({
    where: { refreshToken },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const clearRefreshToken = async (publicId: string) => {
  return prisma.user.update({
    where: { public_id: publicId },
    data: { refreshToken: null },
  });
};

export const findPasswordResetUniqueByToken = async (token: string) => {
  return await prisma.passwordReset.findUnique({
    where: { token },
  });
};

export const deleteManyPasswordResetByUserId = async (userId: number) => {
  return await prisma.passwordReset.deleteMany({
    where: { userId },
  });
};

export const createPasswordReset = async ({ userId, token, expiresAt }: ICreateForgotPasswordPayload) => {
  return prisma.$transaction(async tx => {
    await deleteManyPasswordResetByUserId(userId);

    return tx.passwordReset.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  });
};
