import { prisma } from '@/config/db';
import type { ICreateActivationTokenPayload, TAccountActivationPayload } from '../models/activation.model';
import { updateUser } from '../../user/repository/user.repository';
import { updateOrganization } from '../../organizations/organization/repository/organization.repository';

export const findActivationTokenUniqueByToken = async (token: string) => {
  return await prisma.activationToken.findUnique({
    where: { token },
  });
};

export const deleteManyActivationTokenByUserId = async (userId: number) => {
  return await prisma.activationToken.deleteMany({
    where: { userId },
  });
};

export const createActivationToken = async ({ userId, token, expiresAt, sentCount }: ICreateActivationTokenPayload) => {
  return prisma.$transaction(async tx => {
    await deleteManyActivationTokenByUserId(userId);

    return tx.activationToken.create({
      data: {
        userId,
        token,
        expiresAt,
        sentCount,
      },
    });
  });
};

export async function findValidActivationToken(userId: number, token: string) {
  return prisma.activationToken.findFirst({
    where: {
      userId,
      token,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
}

export async function markActivationTokenUsed(id: string) {
  return prisma.activationToken.update({
    where: { id },
    data: { used: true },
  });
}

export const activateAccount = async (data: TAccountActivationPayload) => {
  const { name, surname, organizationId, fee, activationTokenId, publicId } = data;

  await prisma.$transaction(async tx => {
    if (name || surname) {
      await updateUser(publicId, { name, surname });
    }
    if (organizationId) {
      await updateOrganization({ publicId: organizationId, fee, active: true });
    }
    await tx.activationToken.update({
      where: { id: activationTokenId },
      data: { used: true },
    });
  });
};
